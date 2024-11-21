import { createRegistry } from '@bufbuild/protobuf';
import {
  AnySchema,
  DurationSchema,
  TimestampSchema,
} from '@bufbuild/protobuf/wkt';

export const WKT_PROTO_REGISTRY = createRegistry(
  AnySchema,
  DurationSchema,
  TimestampSchema
);
