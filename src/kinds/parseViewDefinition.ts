import { last } from "ramda";

// Create a fresh parser instance for each parse call to avoid state corruption
// The pg-query-emscripten WASM module has internal state that can become
// corrupted when reused, causing non-deterministic parse failures.
const createPgQuery = async () => {
  // Use eval to prevent TypeScript from converting this to require
  const pgQueryModule = await eval(
    'import("pg-query-emscripten/pg_query_wasm.js")',
  );
  return new pgQueryModule.default();
};

export type ViewReference = {
  viewColumn: string;
  source:
    | {
        schema: string;
        table: string;
        column: string;
      }
    | undefined;
};

function parseSelectStmt(
  selectAst: any, // Change the type to match the AST structure
  defaultSchema: string,
  aliases: { [alias: string]: { schema: string; table: string } },
): ViewReference[] {
  if (selectAst.larg && selectAst.rarg) {
    // This is a UNION, INTERSECT, or EXCEPT operation
    // Each branch may have its own aliases, so extract them for each branch
    const lArgAliases = findAliasDefinitions(selectAst.larg);
    const lLocalAliases = Object.fromEntries(
      lArgAliases.map(({ schemaname, relname, alias }) => [
        alias.aliasname,
        { schema: schemaname, table: relname },
      ]),
    );

    const rArgAliases = findAliasDefinitions(selectAst.rarg);
    const rLocalAliases = Object.fromEntries(
      rArgAliases.map(({ schemaname, relname, alias }) => [
        alias.aliasname,
        { schema: schemaname, table: relname },
      ]),
    );

    return [
      ...parseSelectStmt(selectAst.larg, defaultSchema, {
        ...aliases,
        ...lLocalAliases,
      }),
      ...parseSelectStmt(selectAst.rarg, defaultSchema, {
        ...aliases,
        ...rLocalAliases,
      }),
    ];
  }

  if (!selectAst.fromClause) {
    return [];
  }

  const viewReferences: ViewReference[] = [];

  selectAst.fromClause.forEach((fromClause: any) => {
    const fromTable = fromClause.RangeVar;

    // const selectTargets = jp.query(selectAst, "$.targetList[*].ResTarget");
    const selectTargets =
      selectAst.targetList?.map((target: any) => target.ResTarget) ?? [];

    selectTargets.forEach((selectTarget: any) => {
      // const fields = jp.query(selectTarget, "$.val[*].fields[*].String.sval");
      const vals = selectTarget.val
        ? Array.isArray(selectTarget.val)
          ? selectTarget.val
          : [selectTarget.val]
        : [];
      const fields = (vals
        ?.map((val: any) =>
          val.ColumnRef?.fields?.map((field: any) => field.String?.sval),
        )
        .flat()
        .filter(Boolean) ?? []) as any[];

      let sourceTable = fromTable?.relname;
      let sourceSchema = fromTable?.schemaname;
      if (fields.length === 2) {
        const tableRel = fields[0];
        if (tableRel in aliases) {
          sourceTable = aliases[tableRel].table;
          sourceSchema = aliases[tableRel].schema ?? sourceSchema;
        } else {
          sourceTable = tableRel;
        }
      }
      const sourceColumn = last(fields);

      const viewReference: ViewReference = {
        viewColumn: selectTarget.name ?? last(fields),
        source:
          sourceTable && sourceColumn
            ? {
                schema: sourceSchema ?? defaultSchema,
                table: sourceTable,
                column: last(fields),
              }
            : undefined,
      };
      viewReferences.push(viewReference);
    });
  });

  return viewReferences;
}

// Recursively find alias definitions in a JoinExpr
function findAliasDefinitionsInJoinExpr(joinExpr: any): {
  schemaname: string;
  relname: string;
  alias: { aliasname: string };
}[] {
  const result = [];
  if (joinExpr.larg?.RangeVar?.alias) {
    result.push(joinExpr.larg.RangeVar);
  }
  if (joinExpr.rarg?.RangeVar?.alias) {
    result.push(joinExpr.rarg.RangeVar);
  }
  if (joinExpr.larg?.JoinExpr) {
    result.push(...findAliasDefinitionsInJoinExpr(joinExpr.larg.JoinExpr));
  }
  if (joinExpr.rarg?.JoinExpr) {
    result.push(...findAliasDefinitionsInJoinExpr(joinExpr.rarg.JoinExpr));
  }
  return result;
}

function findAliasDefinitions(node: any): {
  schemaname: string;
  relname: string;
  alias: { aliasname: string };
}[] {
  // const aliasDefinitions = jp.query(
  //   ast,
  //   "$.stmt.SelectStmt.fromClause..[?(@.alias)]",
  // );
  const aliasDefinitions =
    node.fromClause?.flatMap((clause: any) => {
      const result = [];
      if (clause.RangeVar?.alias) {
        result.push(clause.RangeVar);
      }
      if (clause.JoinExpr) {
        result.push(...findAliasDefinitionsInJoinExpr(clause.JoinExpr));
      }
      return result;
    }) ?? [];
  return aliasDefinitions;
}

/**
 * Recursively resolve a ViewReference through CTEs until we reach an actual table.
 * This handles nested CTEs where CTE A references CTE B which references a real table.
 */
function resolveCteThroughChain(
  viewRef: ViewReference,
  cteAliases: Record<string, ViewReference[]>,
  visited: Set<string> = new Set(),
): ViewReference {
  const source = viewRef.source;
  if (!source) {
    return viewRef;
  }

  // Check if this source table is a CTE
  if (!(source.table in cteAliases)) {
    // Not a CTE, this is the final source (actual table)
    return viewRef;
  }

  // Prevent infinite loops in case of circular CTE references
  const cteKey = `${source.table}:${source.column}`;
  if (visited.has(cteKey)) {
    return viewRef;
  }
  visited.add(cteKey);

  // Find the corresponding column in the CTE
  const cteColumns = cteAliases[source.table];
  const cteColumn = cteColumns.find((col) => col.viewColumn === source.column);

  if (!cteColumn) {
    // Column not found in CTE, return as-is
    return viewRef;
  }

  // Recursively resolve through the CTE chain
  const resolvedCte = resolveCteThroughChain(cteColumn, cteAliases, visited);

  // Return a new ViewReference with the original viewColumn but resolved source
  return {
    viewColumn: viewRef.viewColumn,
    source: resolvedCte.source,
  };
}

async function parseViewDefinition(
  selectStatement: string,
  defaultSchema: string,
): Promise<ViewReference[]> {
  // Create a fresh parser instance for each call to avoid state corruption
  const pgQuery = await createPgQuery();
  const ast = pgQuery.parse(selectStatement).parse_tree.stmts[0];
  const selectAst = ast?.stmt?.SelectStmt;

  if (!selectAst) {
    throw new Error(
      `The string '${selectStatement}' doesn't parse as a select statement.`,
    );
  }

  const aliasDefinitions = findAliasDefinitions(selectAst);
  const aliases = Object.fromEntries(
    aliasDefinitions.map(({ schemaname, relname, alias }) => [
      alias.aliasname,
      { schema: schemaname, table: relname },
    ]),
  );

  const withClauses = selectAst.withClause?.ctes ?? [];

  const cteAliases: Record<string, ViewReference[]> = {};

  // Process CTEs in order (earlier CTEs can be referenced by later ones)
  for (const cte of withClauses) {
    if (cte.CommonTableExpr) {
      const cteName = cte.CommonTableExpr.ctename;
      const cteQueryObj = cte.CommonTableExpr.ctequery;
      const cteQuery = cteQueryObj?.SelectStmt;

      // Check if this is a VALUES clause CTE (inline table)
      // VALUES clauses have a SelectStmt with valuesLists but no fromClause or targetList
      if (cteQuery?.valuesLists && !cteQuery?.fromClause) {
        // This is a VALUES-based CTE like: relationships AS (VALUES (...), (...))
        // The columns are named column1, column2, etc. and have no real source
        // Register them with undefined source so resolution treats them as terminals
        const valuesLists = cteQuery.valuesLists;
        if (valuesLists.length > 0) {
          // valuesLists[0] is { List: { items: [...] } } structure
          const firstRow = valuesLists[0]?.List?.items;
          const numColumns = firstRow?.length ?? 0;
          const valuesCteColumns: ViewReference[] = [];
          for (let i = 1; i <= numColumns; i++) {
            valuesCteColumns.push({
              viewColumn: `column${i}`,
              source: undefined, // VALUES columns have no source table
            });
          }
          cteAliases[cteName] = valuesCteColumns;
        }
        continue;
      }

      if (!cteQuery) {
        continue;
      }

      // Find aliases within this CTE's query
      const cteQueryAliases = findAliasDefinitions(cteQuery);
      const cteLocalAliases = Object.fromEntries(
        cteQueryAliases.map(({ schemaname, relname, alias }) => [
          alias.aliasname,
          { schema: schemaname, table: relname },
        ]),
      );

      // Merge global aliases with CTE-local aliases
      const mergedAliases = { ...aliases, ...cteLocalAliases };

      // Process the CTE query
      const cteColumns = parseSelectStmt(
        cteQuery,
        defaultSchema,
        mergedAliases,
      );

      cteAliases[cteName] = cteColumns;
    }
  }

  // Find aliases in the main SELECT
  const mainSelectAliases = findAliasDefinitions(selectAst);
  const mainLocalAliases = Object.fromEntries(
    mainSelectAliases.map(({ schemaname, relname, alias }) => [
      alias.aliasname,
      { schema: schemaname, table: relname },
    ]),
  );
  const mergedMainAliases = { ...aliases, ...mainLocalAliases };

  const primaryViewReferences = parseSelectStmt(
    selectAst,
    defaultSchema,
    mergedMainAliases,
  );

  // Resolve each view reference through the CTE chain
  const viewReferences = primaryViewReferences.map((viewReference) =>
    resolveCteThroughChain(viewReference, cteAliases),
  );

  return viewReferences;
}

export default parseViewDefinition;
