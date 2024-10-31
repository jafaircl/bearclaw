/* eslint-disable @typescript-eslint/no-explicit-any */
import { Type } from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';

/**
 * FieldType represents a field's type value and whether that field supports
 * presence detection.
 */
export class FieldType {
  constructor(
    public readonly type: Type,
    public readonly isSet: (obj: any) => boolean,
    public readonly getFrom: (obj: any) => any
  ) {}
}
