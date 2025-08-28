import { last } from "ramda";

let pgQueryInstance: any;
const getPgQuery = async () => {
  if (!pgQueryInstance) {
    // Use eval to prevent TypeScript from converting this to require
    const pgQueryModule = await eval(
      'import("pg-query-emscripten/pg_query_wasm.js")',
    );
    pgQueryInstance = await new pgQueryModule.default();
  }
  return pgQueryInstance;
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
    return [
      ...parseSelectStmt(selectAst.larg, defaultSchema, aliases),
      ...parseSelectStmt(selectAst.rarg, defaultSchema, aliases),
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

async function parseViewDefinition(
  selectStatement: string,
  defaultSchema: string,
): Promise<ViewReference[]> {
  const pgQuery = await getPgQuery();
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

  for (const cte of withClauses) {
    if (cte.CommonTableExpr) {
      const alias = cte.CommonTableExpr.ctename;
      const cteQuery = cte.CommonTableExpr.ctequery.SelectStmt;

      if (!cteQuery) {
        continue;
      }

      // Process the CTE query recursively
      const cteAlias = parseSelectStmt(cteQuery, defaultSchema, aliases);

      cteAliases[alias] = cteAlias;
    }
  }

  const primaryViewReferences = parseSelectStmt(
    selectAst,
    defaultSchema,
    aliases,
  );

  const viewReferences = primaryViewReferences.map((viewReference) => {
    const source = viewReference.source;
    return source && source.table in cteAliases
      ? (cteAliases[source.table].find(
          (cteViewReference) =>
            cteViewReference.viewColumn === viewReference.viewColumn,
        ) as ViewReference)
      : viewReference;
  });

  return viewReferences;
}

export default parseViewDefinition;
