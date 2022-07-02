import jp from 'jsonpath';
import pgQuery from 'pg-query-emscripten';
import { last } from 'ramda';

function parseViewDefinition(selectStatement: string) {
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
  const viewColumns = selectTargets.map((selectTarget) => {
    const fields = jp.query(selectTarget, '$.val[*].fields[*].String.str');
    let table = firstFromTable?.relname;
    let schema = firstFromTable?.schemaname;
    if (fields.length === 2) {
      const tableRel = fields[0];
      if (tableRel in aliases) {
        table = aliases[tableRel].table;
        schema = aliases[tableRel].schema ?? schema;
      } else {
        table = tableRel;
      }
    }
    return {
      name: selectTarget.name || last(fields),
      schema,
      table,
      column: last(fields),
      // x,
    };
  });

  return viewColumns;
}

export default parseViewDefinition;
