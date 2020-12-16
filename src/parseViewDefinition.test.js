import parseViewDefinition from './parseViewDefinition';

describe('parseViewDefinition', () => {
  it('should understand a simple select', () => {
    const query = `SELECT service.id,
    service."createdAt",
    service.name,
    "oauthConnection"."createdBy" AS owner
   FROM service
     LEFT JOIN "oauthConnection" ON service."oauthConnectionId" = "oauthConnection".id;`;

    const x = parseViewDefinition(query);
    expect(x).toEqual([
      { name: 'id', table: 'service', column: 'id' },
      { name: 'createdAt', table: 'service', column: 'createdAt' },
      { name: 'name', table: 'service', column: 'name' },
      { name: 'owner', table: 'oauthConnection', column: 'createdBy' },
    ]);
  });

  it('should work with multiple schemas and with aliases', () => {
    const query = `select u.id as uid, um.id as umid from 
    test1.users u join test2.user_managers um on um.user_id = u.id;`;

    const x = parseViewDefinition(query);
    expect(x).toEqual([
      { name: 'uid', schema: 'test1', table: 'users', column: 'id' },
      { name: 'umid', schema: 'test2', table: 'user_managers', column: 'id' },
    ]);
  });
});
