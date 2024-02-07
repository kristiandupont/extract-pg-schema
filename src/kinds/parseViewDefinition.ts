import jp from "jsonpath";
import pgQuery from "pg-query-emscripten";
import { last } from "ramda";

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
      ...parseSelectStmt(selectAst.larg.SelectStmt, defaultSchema, aliases),
      ...parseSelectStmt(selectAst.rarg.SelectStmt, defaultSchema, aliases),
    ];
  }

  const viewReferences: ViewReference[] = [];

  selectAst.fromClause.forEach((fromClause: any) => {
    const fromTable = fromClause.RangeVar;

    const selectTargets = jp.query(selectAst, "$.targetList[*].ResTarget");

    selectTargets.forEach((selectTarget: any) => {
      const fields = jp.query(selectTarget, "$.val[*].fields[*].String.str");
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
        viewColumn: selectTarget.name || last(fields),
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
function parseViewDefinition(
  selectStatement: string,
  defaultSchema: string,
): ViewReference[] {
  const ast = pgQuery.parse(selectStatement).parse_tree[0];
  const selectAst = ast.RawStmt?.stmt?.SelectStmt;

  if (!selectAst) {
    throw new Error(
      `The string '${selectStatement}' doesn't parse as a select statement.`,
    );
  }

  const aliasDefinitions = jp.query(
    ast,
    "$.RawStmt.stmt.SelectStmt.fromClause..[?(@.alias)]",
  );

  const aliases = Object.fromEntries(
    aliasDefinitions.map(({ schemaname, relname, alias }) => [
      alias.Alias.aliasname,
      { schema: schemaname, table: relname },
    ]),
  );

  const withClauses = selectAst.withClause?.WithClause?.ctes || [];

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
