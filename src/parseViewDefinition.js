import pgQuery from 'pg-query-emscripten';
import jp from 'jsonpath';

function parseViewDefinition(viewDefinitionString) {
  const ast = pgQuery.parse(viewDefinitionString).parse_tree[0];

  console.log(JSON.stringify(ast, null, 2));
  const selectTargets = jp.query(
    ast,
    '$.RawStmt.stmt.SelectStmt.targetList[*].ResTarget'
  );

  const viewColumns = selectTargets.map((selectTarget) => {
    const fields = jp.query(selectTarget, '$.val[*].fields[*].String.str');
    const [table, column] = fields;
    return {
      name: selectTarget.name || column,
      table,
      column,
    };
  });

  return viewColumns;
}

export default parseViewDefinition;
