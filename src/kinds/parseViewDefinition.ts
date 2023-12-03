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
  const firstFromTable = selectAst.fromClause[0].RangeVar;

  const selectTargets = jp.query(selectAst, "$.targetList[*].ResTarget");

  const viewReferences = selectTargets.map((selectTarget) => {
    const fields = jp.query(selectTarget, "$.val[*].fields[*].String.str");
    let sourceTable = firstFromTable?.relname;
    let sourceSchema = firstFromTable?.schemaname;
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
    return viewReference;
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

  return parseSelectStmt(selectAst, defaultSchema, aliases);
}

export default parseViewDefinition;
