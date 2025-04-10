import { create } from '@bufbuild/protobuf';
import { TestPaginationRequestSchema } from '../gen/bearclaw/aip/v1/pagination_pb';
import {
  decodePageTokenStruct,
  encodePageTokenStruct,
  PageToken,
  parsePageToken,
} from './pagetoken';

describe('pagetoken', () => {
  it('should encode and decode page token struct', () => {
    const token = new PageToken(10, 123);
    const encoded = encodePageTokenStruct(token);
    const decoded = decodePageTokenStruct(encoded);
    expect(decoded).toEqual(token);
  });

  it('encodePageTokenStruct should be pure', () => {
    expect(encodePageTokenStruct(new PageToken(20, 789))).toEqual(
      encodePageTokenStruct(new PageToken(20, 789))
    );
  });

  it('encodePageTokenStruct should be idempotent wrt the PageToken', () => {
    const token = new PageToken(30, 456);
    const encoded = encodePageTokenStruct(token);
    expect(encodePageTokenStruct(token)).toEqual(encoded);
  });

  it('encodePageTokenStruct should return different strings for different PageTokens', () => {
    const token1 = new PageToken(40, 123);
    const encoded1 = encodePageTokenStruct(token1);
    const token2 = new PageToken(50, 345);
    const encoded2 = encodePageTokenStruct(token2);
    expect(encoded1).not.toEqual(encoded2);
  });

  it('decodePageTokenStruct should throw an error if invalid token', () => {
    const token = 'invalid_token';
    expect(() => decodePageTokenStruct(token)).toThrow('invalid page token');
  });

  it('decodePageTokenStruct should return a PageToken with 0 offset and empty checksum if the encoded string does not have them', () => {
    const token = Buffer.from(JSON.stringify({})).toString('base64');
    const decoded = decodePageTokenStruct(token);
    expect(decoded).toEqual(new PageToken(0, 0));
  });

  it('parsePageToken - valid checksums', () => {
    const request1 = create(TestPaginationRequestSchema, {
      parent: 'shelves/1',
      pageSize: 10,
    });
    const pageToken1 = parsePageToken(TestPaginationRequestSchema, request1);
    const request2 = create(TestPaginationRequestSchema, {
      parent: 'shelves/1',
      pageSize: 20,
      pageToken: pageToken1.next(request1).toString(),
    });
    const pageToken2 = parsePageToken(TestPaginationRequestSchema, request2);
    expect(pageToken2.offset).toEqual(10);
    const request3 = create(TestPaginationRequestSchema, {
      parent: 'shelves/1',
      pageSize: 50,
      pageToken: pageToken2.next(request2).toString(),
    });
    const pageToken3 = parsePageToken(TestPaginationRequestSchema, request3);
    expect(pageToken3.offset).toEqual(30);
  });

  it('parsePageToken - skip - docs example 1', () => {
    // From https://google.aip.dev/158:
    // A request with no page token and a skip value of 30 returns a single
    // page of results starting with the 31st result.
    const request = create(TestPaginationRequestSchema, {
      parent: 'shelves/1',
      skip: 30,
    });
    const pageToken = parsePageToken(TestPaginationRequestSchema, request);
    expect(pageToken.offset).toEqual(30);
  });

  it('parsePageToken - skip - docs example 2', () => {
    // From https://google.aip.dev/158:
    // A request with a page token corresponding to the 51st result (because
    // the first 50 results were returned on the first page) and a skip value
    // of 30 returns a single page of results starting with the 81st result.
    const request1 = create(TestPaginationRequestSchema, {
      parent: 'shelves/1',
      pageSize: 50,
    });
    const pageToken1 = parsePageToken(TestPaginationRequestSchema, request1);
    const request2 = create(TestPaginationRequestSchema, {
      parent: 'shelves/1',
      skip: 30,
      pageSize: 50,
      pageToken: pageToken1.next(request1).toString(),
    });
    const pageToken2 = parsePageToken(TestPaginationRequestSchema, request2);
    expect(pageToken2.offset).toEqual(80);
  });

  it('parsePageToken - skip - handle empty token with skip', () => {
    const request1 = create(TestPaginationRequestSchema, {
      parent: 'shelves/1',
      skip: 30,
      pageSize: 20,
    });
    const pageToken1 = parsePageToken(TestPaginationRequestSchema, request1);
    expect(pageToken1.offset).toEqual(30);
  });

  it('parsePageToken - skip - handle existing token with another skip', () => {
    const request1 = create(TestPaginationRequestSchema, {
      parent: 'shelves/1',
      skip: 50,
      pageSize: 20,
    });
    const pageToken1 = parsePageToken(TestPaginationRequestSchema, request1);
    expect(pageToken1.offset).toEqual(50);
    const request2 = create(TestPaginationRequestSchema, {
      parent: 'shelves/1',
      skip: 30,
      pageSize: 0,
      pageToken: pageToken1.toString(),
    });
    const pageToken2 = parsePageToken(TestPaginationRequestSchema, request2);
    const pageToken3 = pageToken2.next(request2);
    expect(pageToken3.offset).toEqual(80);
  });

  it('parsePageToken - skip - handle existing token with pagesize and skip', () => {
    const request1 = create(TestPaginationRequestSchema, {
      parent: 'shippers/1',
      skip: 50,
      pageSize: 20,
    });
    const pageToken1 = parsePageToken(TestPaginationRequestSchema, request1);
    expect(pageToken1.offset).toEqual(50);

    const request2 = create(TestPaginationRequestSchema, {
      parent: 'shippers/1',
      skip: 30,
      pageSize: 20,
      pageToken: pageToken1.toString(),
    });
    const pageToken2 = parsePageToken(TestPaginationRequestSchema, request2);
    const pageToken3 = pageToken2.next(request2);
    expect(pageToken3.offset).toEqual(100);
  });

  it('invalid format', () => {
    const request = create(TestPaginationRequestSchema, {
      parent: 'shelves/1',
      pageSize: 10,
      pageToken: 'invalid',
    });
    expect(() => parsePageToken(TestPaginationRequestSchema, request)).toThrow(
      'invalid page token'
    );
  });

  it('invalid checksum', () => {
    const request = create(TestPaginationRequestSchema, {
      parent: 'shelves/1',
      pageSize: 10,
      pageToken: encodePageTokenStruct(new PageToken(100, 1234)),
    });
    expect(() => parsePageToken(TestPaginationRequestSchema, request)).toThrow(
      'checksum mismatch'
    );
  });
});
