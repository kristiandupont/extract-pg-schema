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
          ?.columns.find((element) => predicate(element));
        if (!sourceColumn) {
          sourceColumn = schemas[source.schema].views
            .find((view) => view.name === source!.table)
            ?.columns.find((element) => predicate(element));
        }
        if (!sourceColumn) {
          sourceColumn = schemas[source.schema].materializedViews
            .find((view) => view.name === source!.table)
            ?.columns.find((element) => predicate(element));
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
            references: sourceColumn.references,
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

  for (const schema of Object.keys(result)) {
    result[schema].views = result[schema].views.map((element) =>
      resolve(element)
    );
    result[schema].materializedViews = result[schema].materializedViews.map(
      (element) => resolve(element)
    );
  }

  return result;
};

export default resolveViewColumns;
