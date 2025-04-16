import { Code } from '@buf/googleapis_googleapis.bufbuild_es/google/rpc/code_pb';
import { Status } from '@buf/googleapis_googleapis.bufbuild_es/google/rpc/status_pb.js';
import {
  AbortedError,
  AlreadyExistsError,
  CancelledError,
  DataLossError,
  DeadlineExceededError,
  FailedPreconditionError,
  InternalError,
  InvalidArgumentError,
  NotFoundError,
  OutOfRangeError,
  PermissionDeniedError,
  ResourceExhaustedError,
  StatusError,
  UnauthenticatedError,
  UnavailableError,
  UnimplementedError,
  UnknownError,
} from './errors';

/**
 * ParseErrorFromStatus parses a `Status` and returns a `StatusError` or one
 * of its subclasses, or null if the `Status` is `OK`.
 *
 * @param status The `Status` to parse
 * @returns a `StatusError` or one of its subclasses, or null if the `Status`
 * code is `OK`
 */
export function parseErrorFromStatus(status: Status) {
  switch (status.code) {
    case Code.OK:
      return null;
    case Code.CANCELLED:
      return CancelledError.unpack(status);
    case Code.UNKNOWN:
      return UnknownError.unpack(status);
    case Code.INVALID_ARGUMENT:
      return InvalidArgumentError.unpack(status);
    case Code.DEADLINE_EXCEEDED:
      return DeadlineExceededError.unpack(status);
    case Code.NOT_FOUND:
      return NotFoundError.unpack(status);
    case Code.ALREADY_EXISTS:
      return AlreadyExistsError.unpack(status);
    case Code.PERMISSION_DENIED:
      return PermissionDeniedError.unpack(status);
    case Code.UNAUTHENTICATED:
      return UnauthenticatedError.unpack(status);
    case Code.RESOURCE_EXHAUSTED:
      return ResourceExhaustedError.unpack(status);
    case Code.FAILED_PRECONDITION:
      return FailedPreconditionError.unpack(status);
    case Code.ABORTED:
      return AbortedError.unpack(status);
    case Code.OUT_OF_RANGE:
      return OutOfRangeError.unpack(status);
    case Code.UNIMPLEMENTED:
      return UnimplementedError.unpack(status);
    case Code.INTERNAL:
      return InternalError.unpack(status);
    case Code.UNAVAILABLE:
      return UnavailableError.unpack(status);
    case Code.DATA_LOSS:
      return DataLossError.unpack(status);
    default:
      return StatusError.unpack(status);
  }
}
