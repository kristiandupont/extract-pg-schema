import { expect, it } from 'vitest';

import { describe } from '../tests/fixture';
import useSchema from '../tests/useSchema';
import useTestKnex from '../tests/useTestKnex';
import extractEnum, { EnumDetails } from './extractEnum';
import PgType from './PgType';

const makePgType = (
  name: string,
  schemaName: string = 'test'
): PgType<'enum'> => ({
  schemaName,
  name,
  kind: 'enum',
  comment: null,
});

describe('extractEnum', () => {
  const getKnex = useTestKnex();
  useSchema(getKnex, 'test');

  it('should extract enum values', async () => {
    const db = getKnex();
    await db.raw("create type test.some_enum as enum('a', 'b', 'c')");

    const result = await extractEnum(db, makePgType('some_enum'));

    const expected: EnumDetails = {
      values: ['a', 'b', 'c'],
    };
    expect(result).toStrictEqual(expected);
  });
});
