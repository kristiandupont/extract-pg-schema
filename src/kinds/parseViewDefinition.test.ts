import { describe, expect, it } from '../tests/fixture';
import parseViewDefinition from './parseViewDefinition';

describe('parseViewDefinition', () => {
  it('should understand a trivial select', () => {
    const query = `SELECT id FROM service`;

    const def = parseViewDefinition(query);
    expect(def).toEqual([
      {
        sourceColumn: 'id',
        targetSchema: undefined,
        targetTable: 'service',
        targetColumn: 'id',
      },
    ]);
  });

  it('should understand a select with explicit schema', () => {
    const query = `SELECT id FROM public.service`;

    const def = parseViewDefinition(query);
    expect(def).toEqual([
      {
        sourceColumn: 'id',
        targetSchema: 'public',
        targetTable: 'service',
        targetColumn: 'id',
      },
    ]);
  });

  it('should understand a select with join', () => {
    const query = `SELECT service.id,
    service."createdAt",
    service.name,
    "oauthConnection"."createdBy" AS owner
   FROM service
     LEFT JOIN "oauthConnection" ON service."oauthConnectionId" = "oauthConnection".id;`;

    const def = parseViewDefinition(query);
    expect(def).toEqual([
      {
        sourceColumn: 'id',
        targetSchema: undefined,
        targetTable: 'service',
        targetColumn: 'id',
      },
      {
        sourceColumn: 'createdAt',
        targetSchema: undefined,
        targetTable: 'service',
        targetColumn: 'createdAt',
      },
      {
        sourceColumn: 'name',
        targetSchema: undefined,
        targetTable: 'service',
        targetColumn: 'name',
      },
      {
        sourceColumn: 'owner',
        targetSchema: undefined,
        targetTable: 'oauthConnection',
        targetColumn: 'createdBy',
      },
    ]);
  });

  it('should work with multiple schemas and with aliases', () => {
    const query = `
    select u.id as uid, um.id as umid 
      from test1.users u 
      join test2.user_managers um 
      on um.user_id = u.id;`;

    const def = parseViewDefinition(query);
    expect(def).toEqual([
      {
        sourceColumn: 'uid',
        targetSchema: 'test1',
        targetTable: 'users',
        targetColumn: 'id',
      },
      {
        sourceColumn: 'umid',
        targetSchema: 'test2',
        targetTable: 'user_managers',
        targetColumn: 'id',
      },
    ]);
  });
});
