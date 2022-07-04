import { expect, it } from 'vitest';

import { describe } from '../tests/fixture';
import useSchema from '../tests/useSchema';
import useTestKnex from '../tests/useTestKnex';
import extractDomain, { DomainDetails } from './extractDomain';
import PgType from './PgType';

const makePgType = (
  name: string,
  schemaName: string = 'test'
): PgType<'domain'> => ({
  schemaName,
  name,
  kind: 'domain',
  comment: null,
});

describe('extractDomain', () => {
  const [getKnex, databaseName] = useTestKnex();
  useSchema(getKnex, 'test');

  it('should extract simplified as well as full information_schema information', async () => {
    const db = getKnex();
    await db.raw('create domain test.some_domain as integer');

    const result = await extractDomain(db, makePgType('some_domain'));

    const expected: DomainDetails = {
      name: 'some_domain',
      schemaName: 'test',
      kind: 'domain',
      comment: null,
      innerType: 'pg_catalog.int4',
      informationSchemaValue: {
        domain_catalog: databaseName,
        domain_schema: 'test',
        domain_name: 'some_domain',
        data_type: 'integer',
        character_maximum_length: null,
        character_octet_length: null,
        character_set_catalog: null,
        character_set_schema: null,
        character_set_name: null,
        collation_catalog: null,
        collation_schema: null,
        collation_name: null,
        numeric_precision: 32,
        numeric_precision_radix: 2,
        numeric_scale: 0,
        datetime_precision: null,
        interval_type: null,
        interval_precision: null,
        domain_default: null,
        udt_catalog: databaseName,
        udt_schema: 'pg_catalog',
        udt_name: 'int4',
        scope_catalog: null,
        scope_schema: null,
        scope_name: null,
        maximum_cardinality: null,
        dtd_identifier: '1',
      },
    };
    expect(result).toStrictEqual(expected);
  });
});
