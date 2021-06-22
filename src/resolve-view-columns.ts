import R from 'ramda';
import { TableOrView } from './types';

const resolveViewColumns = (
  views: TableOrView[],
  tables: TableOrView[],
  schemaName: string
): TableOrView[] => {
  const everything = R.indexBy(R.prop('name'), [...tables, ...views]);

  return views.map((view) => {
    const columns = view.columns.map((column) => {
      let source = column.source;
      while (source) {
        if (source.schema && source.schema !== schemaName) {
          console.log(
            `Could not follow source of ${schemaName}.${view.name}.${column.name} because it references a different schema: ${source.schema}.`
          );
          source = undefined;
        } else {
          const sourceColumn = everything[source.table].columns.find(
            (col) => col.name === source!.column
          );
          if (!sourceColumn) {
            throw new Error(
              `Column ${source.schema || schemaName}.${source.table}.${
                source.column
              } was not found..`
            );
          }
          if (sourceColumn.source) {
            source = sourceColumn.source;
          } else {
            return {
              ...column,
              nullable: sourceColumn.nullable,
              reference: sourceColumn.reference,
              isPrimary: sourceColumn.isPrimary,
              indices: sourceColumn.indices,
            };
          }
        }
      }
      return column;
    });
    return {
      ...view,
      columns,
    };
  });
};

export default resolveViewColumns;
