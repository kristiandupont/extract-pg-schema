import { describe, expect, it } from 'vitest';

import parseViewDefinition from './parse-view-definition';

describe('parseViewDefinition', () => {
  it('should understand a trivial select', () => {
    const query = `SELECT id FROM service`;

    const def = parseViewDefinition(query);
    expect(def).toEqual([
      { name: 'id', schema: undefined, table: 'service', column: 'id' },
    ]);
  });

  it('should understand a select with explicit schema', () => {
    const query = `SELECT id FROM public.service`;

    const def = parseViewDefinition(query);
    expect(def).toEqual([
      { name: 'id', schema: 'public', table: 'service', column: 'id' },
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
      { name: 'id', schema: undefined, table: 'service', column: 'id' },
      {
        name: 'createdAt',
        schema: undefined,
        table: 'service',
        column: 'createdAt',
      },
      { name: 'name', schema: undefined, table: 'service', column: 'name' },
      {
        name: 'owner',
        schema: undefined,
        table: 'oauthConnection',
        column: 'createdBy',
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
      { name: 'uid', schema: 'test1', table: 'users', column: 'id' },
      { name: 'umid', schema: 'test2', table: 'user_managers', column: 'id' },
    ]);
  });
});
