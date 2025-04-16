import { Code } from '@buf/googleapis_googleapis.bufbuild_es/google/rpc/code_pb.js';
import {
  BadRequest,
  BadRequestSchema,
  DebugInfo,
  DebugInfoSchema,
  ErrorInfo,
  ErrorInfoSchema,
  Help,
  HelpSchema,
  LocalizedMessage,
  LocalizedMessageSchema,
  PreconditionFailure,
  PreconditionFailureSchema,
  QuotaFailure,
  QuotaFailureSchema,
  RequestInfo,
  RequestInfoSchema,
  ResourceInfo,
  ResourceInfoSchema,
  RetryInfo,
  RetryInfoSchema,
} from '@buf/googleapis_googleapis.bufbuild_es/google/rpc/error_details_pb.js';
import {
  Status,
  StatusSchema,
} from '@buf/googleapis_googleapis.bufbuild_es/google/rpc/status_pb.js';
import {
  create,
  createRegistry,
  DescMessage,
  MessageInitShape,
} from '@bufbuild/protobuf';
import { Any, anyPack, anyUnpack } from '@bufbuild/protobuf/wkt';

/**
 * An interface that represents `Status` error details.
 *
 * See: https://google.aip.dev/193#statusdetails
 */
export interface StatusDetails {
  errorInfo: ErrorInfo;
  retryInfo?: RetryInfo;
  debugInfo?: DebugInfo;
  quotaFailure?: QuotaFailure;
  preconditionFailure?: PreconditionFailure;
  badRequest?: BadRequest;
  requestInfo?: RequestInfo;
  resourceInfo?: ResourceInfo;
  help?: Help;
  localizedMessage?: LocalizedMessage;
}

export interface StatusDetailsInput {
  errorInfo: MessageInitShape<typeof ErrorInfoSchema>;
  retryInfo?: MessageInitShape<typeof RetryInfoSchema>;
  debugInfo?: MessageInitShape<typeof DebugInfoSchema>;
  quotaFailure?: MessageInitShape<typeof QuotaFailureSchema>;
  preconditionFailure?: MessageInitShape<typeof PreconditionFailureSchema>;
  badRequest?: MessageInitShape<typeof BadRequestSchema>;
  requestInfo?: MessageInitShape<typeof RequestInfoSchema>;
  resourceInfo?: MessageInitShape<typeof ResourceInfoSchema>;
  help?: MessageInitShape<typeof HelpSchema>;
  localizedMessage?: MessageInitShape<typeof LocalizedMessageSchema>;
}

const statusErrorRegistry = createRegistry(
  ErrorInfoSchema,
  RetryInfoSchema,
  DebugInfoSchema,
  QuotaFailureSchema,
  PreconditionFailureSchema,
  BadRequestSchema,
  RequestInfoSchema,
  ResourceInfoSchema,
  HelpSchema,
  LocalizedMessageSchema
);

function createAndPack<Desc extends DescMessage>(
  schema: Desc,
  message: MessageInitShape<Desc>
) {
  return anyPack(schema, create(schema, message));
}

/**
 * An `Error` class that helps constructing and unpacking `Status` errors.
 *
 * See: https://google.aip.dev/193
 */
export class StatusError extends Error {
  public readonly status: Status;

  constructor(
    public readonly code: Code,
    public override readonly message: string,
    public readonly details: StatusDetailsInput
  ) {
    super(message);
    this.name = 'StatusError';

    const _details: Any[] = [createAndPack(ErrorInfoSchema, details.errorInfo)];
    if (details.retryInfo) {
      _details.push(createAndPack(RetryInfoSchema, details.retryInfo));
    }
    if (details.debugInfo) {
      _details.push(createAndPack(DebugInfoSchema, details.debugInfo));
    }
    if (details.quotaFailure) {
      _details.push(createAndPack(QuotaFailureSchema, details.quotaFailure));
    }
    if (details.preconditionFailure) {
      _details.push(
        createAndPack(PreconditionFailureSchema, details.preconditionFailure)
      );
    }
    if (details.badRequest) {
      _details.push(createAndPack(BadRequestSchema, details.badRequest));
    }
    if (details.requestInfo) {
      _details.push(createAndPack(RequestInfoSchema, details.requestInfo));
    }
    if (details.resourceInfo) {
      _details.push(createAndPack(ResourceInfoSchema, details.resourceInfo));
    }
    if (details.help) {
      _details.push(createAndPack(HelpSchema, details.help));
    }
    if (details.localizedMessage) {
      _details.push(
        createAndPack(LocalizedMessageSchema, details.localizedMessage)
      );
    }

    this.status = create(StatusSchema, {
      code,
      message,
      details: _details,
    });
  }

  /**
   * Unpacks a `Status` message into a `StatusError` object.
   *
   * @param status The status to unpack.
   */
  static unpack(status: Status): StatusError {
    const details = StatusError.unpackDetails(status.details);
    return new StatusError(status.code, status.message, details);
  }

  /**
   * Accepts an array of packed `Any` messages and unpacks them into an object
   * containing the error details.
   *
   * @param packed The any-packed details from the `Status` message
   * @returns an object containing the unpacked details.
   */
  static unpackDetails(packed: Any[]): StatusDetails {
    const retval: StatusDetails = {} as StatusDetails;
    for (const detail of packed) {
      const unpacked = anyUnpack(detail, statusErrorRegistry);
      switch (unpacked?.$typeName) {
        case ErrorInfoSchema.typeName:
          retval.errorInfo = unpacked as ErrorInfo;
          break;
        case RetryInfoSchema.typeName:
          retval.retryInfo = unpacked as RetryInfo;
          break;
        case DebugInfoSchema.typeName:
          retval.debugInfo = unpacked as DebugInfo;
          break;
        case QuotaFailureSchema.typeName:
          retval.quotaFailure = unpacked as QuotaFailure;
          break;
        case PreconditionFailureSchema.typeName:
          retval.preconditionFailure = unpacked as PreconditionFailure;
          break;
        case BadRequestSchema.typeName:
          retval.badRequest = unpacked as BadRequest;
          break;
        case RequestInfoSchema.typeName:
          retval.requestInfo = unpacked as RequestInfo;
          break;
        case ResourceInfoSchema.typeName:
          retval.resourceInfo = unpacked as ResourceInfo;
          break;
        case HelpSchema.typeName:
          retval.help = unpacked as Help;
          break;
        case LocalizedMessageSchema.typeName:
          retval.localizedMessage = unpacked as LocalizedMessage;
          break;
        default:
          break;
      }
    }
    return retval;
  }
}

/**
 * The operation was cancelled, typically by the caller.
 */
export class CancelledError extends StatusError {
  public static code = Code.CANCELLED;
  public static httpCode = 499;
  public readonly httpCode = CancelledError.httpCode;

  constructor(message: string, details: StatusDetailsInput) {
    super(CancelledError.code, message, details);
    this.name = 'CancelledError';
  }
}

/**
 * Unknown error.  For example, this error may be returned when a `Status`
 * value received from another address space belongs to an error space that is
 * not known in this address space.  Also errors raised by APIs that do not
 * return enough error information may be converted to this error.
 */
export class UnknownError extends StatusError {
  public static code = Code.UNKNOWN;
  public static httpCode = 500;
  public readonly httpCode = UnknownError.httpCode;

  constructor(message: string, details: StatusDetailsInput) {
    super(UnknownError.code, message, details);
    this.name = 'UnknownError';
  }
}

/**
 * The client specified an invalid argument.  Note that this differs from
 * `FAILED_PRECONDITION`.  `INVALID_ARGUMENT` indicates arguments that are
 * problematic regardless of the state of the system (e.g., a malformed file
 * name).
 */
export class InvalidArgumentError extends StatusError {
  public static code = Code.INVALID_ARGUMENT;
  public static httpCode = 400;
  public readonly httpCode = InvalidArgumentError.httpCode;

  constructor(message: string, details: StatusDetailsInput) {
    super(InvalidArgumentError.code, message, details);
    this.name = 'InvalidArgumentError';
  }
}

/**
 * The deadline expired before the operation could complete. For operations
 * that change the state of the system, this error may be returned even if the
 * operation has completed successfully.  For example, a successful response
 * from a server could have been delayed long enough for the deadline to expire.
 */
export class DeadlineExceededError extends StatusError {
  public static code = Code.DEADLINE_EXCEEDED;
  public static httpCode = 504;
  public readonly httpCode = DeadlineExceededError.httpCode;

  constructor(message: string, details: StatusDetailsInput) {
    super(DeadlineExceededError.code, message, details);
    this.name = 'DeadlineExceededError';
  }
}

/**
 * Some requested entity (e.g., file or directory) was not found.
 *
 * Note to server developers: if a request is denied for an entire class of
 * users, such as gradual feature rollout or undocumented allowlist,
 * `NOT_FOUND` may be used. If a request is denied for some users within a
 * class of users, such as user-based access control, `PERMISSION_DENIED` must
 * be used.
 */
export class NotFoundError extends StatusError {
  public static code = Code.NOT_FOUND;
  public static httpCode = 404;
  public readonly httpCode = NotFoundError.httpCode;

  constructor(message: string, details: StatusDetailsInput) {
    super(NotFoundError.code, message, details);
    this.name = 'NotFoundError';
  }
}

/**
 * The entity that a client attempted to create (e.g., file or directory)
 * already exists.
 */
export class AlreadyExistsError extends StatusError {
  public static code = Code.ALREADY_EXISTS;
  public static httpCode = 409;
  public readonly httpCode = AlreadyExistsError.httpCode;

  constructor(message: string, details: StatusDetailsInput) {
    super(AlreadyExistsError.code, message, details);
    this.name = 'AlreadyExistsError';
  }
}

/**
 * The caller does not have permission to execute the specified operation.
 * `PERMISSION_DENIED` must not be used for rejections caused by exhausting
 * some resource (use `RESOURCE_EXHAUSTED` instead for those errors).
 * `PERMISSION_DENIED` must not be used if the caller can not be identified
 * (use `UNAUTHENTICATED` instead for those errors). This error code does not
 * imply the request is valid or the requested entity exists or satisfies other
 * pre-conditions.
 */
export class PermissionDeniedError extends StatusError {
  public static code = Code.PERMISSION_DENIED;
  public static httpCode = 403;
  public readonly httpCode = PermissionDeniedError.httpCode;

  constructor(message: string, details: StatusDetailsInput) {
    super(PermissionDeniedError.code, message, details);
    this.name = 'PermissionDeniedError';
  }
}

/**
 * The request does not have valid authentication credentials for the operation.
 */
export class UnauthenticatedError extends StatusError {
  public static code = Code.UNAUTHENTICATED;
  public static httpCode = 401;
  public readonly httpCode = UnauthenticatedError.httpCode;

  constructor(message: string, details: StatusDetailsInput) {
    super(UnauthenticatedError.code, message, details);
    this.name = 'UnauthenticatedError';
  }
}

/**
 * Some resource has been exhausted, perhaps a per-user quota, or perhaps the
 * entire file system is out of space.
 */
export class ResourceExhaustedError extends StatusError {
  public static code = Code.RESOURCE_EXHAUSTED;
  public static httpCode = 429;
  public readonly httpCode = ResourceExhaustedError.httpCode;

  constructor(message: string, details: StatusDetailsInput) {
    super(ResourceExhaustedError.code, message, details);
    this.name = 'ResourceExhaustedError';
  }
}

/**
 * The operation was rejected because the system is not in a state required for
 * the operation's execution.  For example, the directory to be deleted is
 * non-empty, an rmdir operation is applied to a non-directory, etc.
 *
 * Service implementors can use the following guidelines to decide between
 * `FAILED_PRECONDITION`, `ABORTED`, and `UNAVAILABLE`:
 *    (a) Use `UNAVAILABLE` if the client can retry just the failing call.
 *    (b) Use `ABORTED` if the client should retry at a higher level. For
 *        example, when a client-specified test-and-set fails, indicating the
 *        client should restart a read-modify-write sequence.
 *    (c) Use `FAILED_PRECONDITION` if the client should not retry until the
 *        system state has been explicitly fixed. For example, if an "rmdir"
 *        fails because the directory is non-empty, `FAILED_PRECONDITION`
 *        should be returned since the client should not retry unless the files
 *        are deleted from the directory.
 */
export class FailedPreconditionError extends StatusError {
  public static code = Code.FAILED_PRECONDITION;
  public static httpCode = 400;
  public readonly httpCode = FailedPreconditionError.httpCode;

  constructor(message: string, details: StatusDetailsInput) {
    super(FailedPreconditionError.code, message, details);
    this.name = 'FailedPreconditionError';
  }
}

/**
 * The operation was aborted, typically due to a concurrency issue such as a
 * sequencer check failure or transaction abort.
 */
export class AbortedError extends StatusError {
  public static code = Code.ABORTED;
  public static httpCode = 409;
  public readonly httpCode = AbortedError.httpCode;

  constructor(message: string, details: StatusDetailsInput) {
    super(AbortedError.code, message, details);
    this.name = 'AbortedError';
  }
}

/**
 * The operation was attempted past the valid range.  E.g., seeking or reading
 * past end-of-file.
 *
 * Unlike `INVALID_ARGUMENT`, this error indicates a problem that may be fixed
 * if the system state changes. For example, a 32-bit file system will generate
 * `INVALID_ARGUMENT` if asked to read at an offset that is not in the range [0
 * 2^32-1], but it will generate `OUT_OF_RANGE` if asked to read from an offset
 * past the current file size.
 *
 * There is a fair bit of overlap between `FAILED_PRECONDITION` and
 * `OUT_OF_RANGE`.  We recommend using `OUT_OF_RANGE` (the more specific error)
 * when it applies so that callers who are iterating through a space can easily
 * look for an `OUT_OF_RANGE` error to detect when they are done.
 */
export class OutOfRangeError extends StatusError {
  public static code = Code.OUT_OF_RANGE;
  public static httpCode = 400;
  public readonly httpCode = OutOfRangeError.httpCode;

  constructor(message: string, details: StatusDetailsInput) {
    super(OutOfRangeError.code, message, details);
    this.name = 'OutOfRangeError';
  }
}

/**
 * The operation is not implemented or is not supported/enabled in this
 * service.
 */
export class UnimplementedError extends StatusError {
  public static code = Code.UNIMPLEMENTED;
  public static httpCode = 501;
  public readonly httpCode = UnimplementedError.httpCode;

  constructor(message: string, details: StatusDetailsInput) {
    super(UnimplementedError.code, message, details);
    this.name = 'UnimplementedError';
  }
}

/**
 * Internal errors.  This means that some invariants expected by the underlying
 * system have been broken.  This error code is reserved for serious errors.
 */
export class InternalError extends StatusError {
  public static code = Code.INTERNAL;
  public static httpCode = 500;
  public readonly httpCode = InternalError.httpCode;

  constructor(message: string, details: StatusDetailsInput) {
    super(InternalError.code, message, details);
    this.name = 'InternalError';
  }
}

/**
 * The operation is unavailable.  This indicates a transient condition and may
 * be corrected by retrying with a backoff.  Note that it is not always safe to
 * retry the same operation.
 */
export class UnavailableError extends StatusError {
  public static code = Code.UNAVAILABLE;
  public static httpCode = 503;
  public readonly httpCode = UnavailableError.httpCode;

  constructor(message: string, details: StatusDetailsInput) {
    super(UnavailableError.code, message, details);
    this.name = 'UnavailableError';
  }
}

/**
 * Unrecoverable data loss or corruption.
 */
export class DataLossError extends StatusError {
  public static code = Code.DATA_LOSS;
  public static httpCode = 500;
  public readonly httpCode = DataLossError.httpCode;

  constructor(message: string, details: StatusDetailsInput) {
    super(DataLossError.code, message, details);
    this.name = 'DataLossError';
  }
}
