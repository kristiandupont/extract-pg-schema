import { Schema } from './extractSchemas';
import {
  MaterializedViewColumn,
  MaterializedViewDetails,
} from './kinds/extractMaterializedView';
import { TableColumn } from './kinds/extractTable';
import { ViewColumn, ViewDetails } from './kinds/extractView';

type Column = TableColumn | ViewColumn | MaterializedViewColumn;

const resolveViewColumns = (
  schemas: Record<string, Schema>
): Record<string, Schema> => {
  const resolve = <T extends ViewDetails | MaterializedViewDetails>(
    view: T
  ): T => {
    const columns = view.columns.map((column) => {
      let source = column.source;
      while (source) {
        const predicate = (col: Column) => col.name === source!.column;
        let sourceColumn: Column | undefined = schemas[source.schema].tables
          .find((table) => table.name === source!.table)
          ?.columns.find(predicate);
        if (!sourceColumn) {
          sourceColumn = schemas[source.schema].views
            .find((view) => view.name === source!.table)
            ?.columns.find(predicate);
        }
        if (!sourceColumn) {
          sourceColumn = schemas[source.schema].materializedViews
            .find((view) => view.name === source!.table)
            ?.columns.find(predicate);
        }
        if (!sourceColumn) {
          throw new Error(
            `Column ${source.schema}.${source.table}.${source.column} was not found..`
          );
        }
        if ((sourceColumn as ViewColumn | MaterializedViewColumn).source) {
          source = (sourceColumn as ViewColumn | MaterializedViewColumn).source;
        } else {
          return {
            ...column,
            isNullable: sourceColumn.isNullable,
            reference: sourceColumn.reference,
            isPrimaryKey: sourceColumn.isPrimaryKey,
            indices: sourceColumn.indices,
          };
        }
      }
      return column;
    });
    return {
      ...view,
      columns,
    };
  };

  const result = { ...schemas };

  Object.keys(result).forEach((schema) => {
    result[schema].views = result[schema].views.map(resolve);
    result[schema].materializedViews =
      result[schema].materializedViews.map(resolve);
  });

  return result;
};

export default resolveViewColumns;
