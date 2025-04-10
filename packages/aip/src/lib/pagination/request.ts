import { isNil } from '@bearclaw/is';
import {
  clone,
  DescMessage,
  Message,
  ScalarType,
  toBinary,
} from '@bufbuild/protobuf';
import { isScalarZeroValue, scalarZeroValue } from '@bufbuild/protobuf/reflect';
import { crc32 } from 'crc';

/**
 * Request is an interface for paginated request messages.
 *
 * See: https://google.aip.dev/158 (Pagination).
 */
export interface RequestMessage<T extends string = string> extends Message<T> {
  /**
   * GetPageToken returns the page token of the request.
   */
  pageSize?: number;
  /**
   * GetPageSize returns the page size of the request.
   */
  pageToken?: string;
  /**
   * GetSkip returns the skip of the request.
   *
   * See: https://google.aip.dev/158#skipping-results
   */
  skip?: number;
}

/**
 * calculateRequestChecksum calculates a checksum for all fields of the request
 * that must be the same across calls.
 *
 * @param schema the schema of the request message
 * @param request the request message to calculate the checksum for
 * @returns a checksum for the request message
 */
export function calculateRequestCheckSum<T extends string = string>(
  schema: DescMessage,
  request: RequestMessage<T>
): number {
  const clonedRequest = clone(schema, request) as RequestMessage<T>;
  if (
    !isNil(clonedRequest.pageToken) &&
    !isScalarZeroValue(ScalarType.STRING, clonedRequest.pageToken)
  ) {
    clonedRequest.pageToken = scalarZeroValue(ScalarType.STRING, false);
  }
  if (
    !isNil(clonedRequest.pageSize) &&
    !isScalarZeroValue(ScalarType.INT32, clonedRequest.pageSize)
  ) {
    clonedRequest.pageSize = scalarZeroValue(ScalarType.INT32, false);
  }
  if (
    !isNil(clonedRequest.skip) &&
    !isScalarZeroValue(ScalarType.INT32, clonedRequest.skip)
  ) {
    clonedRequest.skip = scalarZeroValue(ScalarType.INT32, false);
  }

  const bin = toBinary(schema, clonedRequest);
  return crc32(bin);
}
