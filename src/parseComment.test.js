import parseComment from './parseComment';

describe('parseComment', () => {
  it('should return a simple string', () => {
    expect(parseComment('Hello')).toEqual({ comment: 'Hello', tags: {} });
  });

  it('should return sane values for undefined', () => {
    expect(parseComment(undefined)).toEqual({ comment: undefined, tags: {} });
  });

  it('should extract tags', () => {
    expect(parseComment('Organization member @fixed')).toEqual({
      comment: 'Organization member',
      tags: { fixed: true },
    });

    expect(parseComment('@fixed Organization member')).toEqual({
      comment: 'Organization member',
      tags: { fixed: true },
    });

    expect(parseComment('Organization member @order:1 @key:yellow')).toEqual({
      comment: 'Organization member',
      tags: { order: '1', key: 'yellow' },
    });

    expect(parseComment('Organization member @order:1 @order:2')).toEqual({
      comment: 'Organization member',
      tags: { order: '2' },
    });
  });
});
