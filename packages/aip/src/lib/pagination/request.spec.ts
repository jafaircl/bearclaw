import { create } from '@bufbuild/protobuf';
import { TestPaginationRequestSchema } from '../gen/bearclaw/aip/v1/pagination_pb';
import { calculateRequestCheckSum } from './request';

describe('request', () => {
  it('should calculate checksum', () => {
    const checkSum = calculateRequestCheckSum(
      TestPaginationRequestSchema,
      create(TestPaginationRequestSchema, { parent: 'shelves/1' })
    );
    expect(checkSum).not.toBe(0);
  });

  it('should calculate a different checksum for different requests', () => {
    const checkSum1 = calculateRequestCheckSum(
      TestPaginationRequestSchema,
      create(TestPaginationRequestSchema, { parent: 'shelves/1' })
    );
    const checkSum2 = calculateRequestCheckSum(
      TestPaginationRequestSchema,
      create(TestPaginationRequestSchema, { parent: 'shelves/2' })
    );
    expect(checkSum1).not.toEqual(checkSum2);
  });

  it('should calculate the same checksum for the same request', () => {
    const checkSum1 = calculateRequestCheckSum(
      TestPaginationRequestSchema,
      create(TestPaginationRequestSchema, { parent: 'shelves/1' })
    );
    const checkSum2 = calculateRequestCheckSum(
      TestPaginationRequestSchema,
      create(TestPaginationRequestSchema, { parent: 'shelves/1' })
    );
    expect(checkSum1).toEqual(checkSum2);
  });
});
