import jp from 'jsonpath';
import pgQuery from 'pg-query-emscripten';
import { last } from 'ramda';

type ViewReference = {
  sourceColumn: string;
  targetSchema: string | undefined;
  targetTable: string;
  targetColumn: string;
};

function parseViewDefinition(selectStatement: string): ViewReference[] {
  const ast = pgQuery.parse(selectStatement).parse_tree[0];
  const selectAst = ast.RawStmt?.stmt?.SelectStmt;

  if (!selectAst) {
    throw new Error(
      `The string '${selectStatement}' doesn't parse as a select statement.`
    );
  }

  const firstFromTable = selectAst.fromClause[0].RangeVar;

  const aliasDefinitions = jp.query(
    ast,
    '$.RawStmt.stmt.SelectStmt.fromClause..[?(@.alias)]'
  );

  const aliases = aliasDefinitions.reduce(
    (acc, { schemaname, relname, alias }) => ({
      ...acc,
      [alias.Alias.aliasname]: { schema: schemaname, table: relname },
    }),
    {}
  );

  const selectTargets = jp.query(
    ast,
    '$.RawStmt.stmt.SelectStmt.targetList[*].ResTarget'
  );
  const viewReferences = selectTargets.map((selectTarget) => {
    const fields = jp.query(selectTarget, '$.val[*].fields[*].String.str');
    let targetTable = firstFromTable?.relname;
    let targetSchema = firstFromTable?.schemaname;
    if (fields.length === 2) {
      const tableRel = fields[0];
      if (tableRel in aliases) {
        targetTable = aliases[tableRel].table;
        targetSchema = aliases[tableRel].schema ?? targetSchema;
      } else {
        targetTable = tableRel;
      }
    }
    const viewReference: ViewReference = {
      sourceColumn: selectTarget.name || last(fields),
      targetSchema,
      targetTable,
      targetColumn: last(fields),
    };
    return viewReference;
  });

  return viewReferences;
}

export default parseViewDefinition;
