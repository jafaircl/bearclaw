import { isNil } from '@bearclaw/is';
import { DescMessage, ScalarType } from '@bufbuild/protobuf';
import { isScalarZeroValue } from '@bufbuild/protobuf/reflect';
import { InvalidArgumentError } from '../errors';
import { calculateRequestCheckSum, RequestMessage } from './request';

/**
 * EncodePageTokenStruct encodes an arbitrary struct as a page token.
 */
export function encodePageTokenStruct(struct: PageToken): string {
  const json = JSON.stringify(struct);
  return Buffer.from(json).toString('base64');
}

/**
 * DecodePageTokenStruct decodes a page token into a struct.
 */
export function decodePageTokenStruct(token: string): PageToken {
  try {
    const str = Buffer.from(token, 'base64').toString('utf8');
    const json = JSON.parse(str);
    return new PageToken(json.offset, json.requestChecksum);
  } catch (e) {
    throw new Error(`invalid page token: ${e}`);
  }
}

/**
 * PageToken is a page token that uses an offset to delineate which page to
 * fetch.
 */
export class PageToken {
  /**
   * Offset of the page.
   */
  offset: number;
  /**
   * RequestChecksum is the checksum of the request that generated the page
   * token.
   */
  requestChecksum: number;

  constructor(offset: number, requestChecksum: number) {
    this.offset = offset ?? 0;
    this.requestChecksum = requestChecksum ?? 0;
  }

  /**
   * Next returns the next page token for the provided Request.
   *
   * @param request the request to get the next page token for
   */
  next(request: RequestMessage) {
    this.offset += request.pageSize ?? 0;
    return this;
  }

  /**
   * String returns a string representation of the page token.
   */
  toString() {
    return encodePageTokenStruct(this);
  }
}

/**
 * ParsePageToken parses an offset-based page token from the provided Request.
 *
 * If the request does not have a page token, a page token with offset 0 will
 * be returned.
 *
 * @param schema the schema of the request
 * @param request the request to parse the page token from
 * @param pageTokenChecksumMask a random bitmask applied to offset-based page
 * token checksums. Change the bitmask to force checksum failures when changing
 * the page token implementation.
 */
export function parsePageToken<T extends string = string>(
  schema: DescMessage,
  request: RequestMessage<T>,
  pageTokenChecksumMask = 0x9acb0442
) {
  let requestCheckSum = calculateRequestCheckSum(schema, request);
  requestCheckSum ^= pageTokenChecksumMask;
  if (
    isNil(request.pageToken) ||
    isScalarZeroValue(ScalarType.STRING, request.pageToken)
  ) {
    let offset = 0;
    if (!isNil(request.skip)) {
      offset += Number(request.skip);
    }
    return new PageToken(offset, requestCheckSum);
  }
  const pageToken = decodePageTokenStruct(request.pageToken);
  if (pageToken.requestChecksum !== requestCheckSum) {
    throw new InvalidArgumentError(
      `invalid page token: checksum mismatch got 0x${pageToken.requestChecksum} but expected 0x${requestCheckSum}`,
      {
        errorInfo: {
          reason: 'PAGE_TOKEN_CHECKSUM_MISMATCH',
          domain: 'bearclaw.aip.pagination',
          metadata: {
            pageToken: request.pageToken,
            got: `0x${pageToken.requestChecksum}`,
            expected: `0x${requestCheckSum}`,
          },
        },
      }
    );
  }
  if (!isNil(request.skip)) {
    pageToken.offset += Number(request.skip);
  }
  return pageToken;
}
