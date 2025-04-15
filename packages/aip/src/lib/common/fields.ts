/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DescField,
  DescMessage,
  Message,
  MessageShape,
} from '@bufbuild/protobuf';
import { ScalarValue } from '@bufbuild/protobuf/reflect';

/**
 * Sets the value of a field on a message. If the field is a oneof, the
 * value is set to the oneof field. If the field is not a oneof, the
 * value is set to the field directly.
 *
 * @param message the message to set the field on
 * @param field the descriptor of the field to set
 * @param value the value to set the field to
 */
export function setField<Desc extends DescMessage>(
  message: MessageShape<Desc>,
  field: DescField,
  value: any
) {
  if (field.parent.typeName !== message.$typeName) {
    return;
  }
  if (field.oneof) {
    message[field.oneof.localName as keyof MessageShape<Desc>] = {
      case: field.localName,
      value,
    } as any;
  } else {
    message[field.localName as keyof MessageShape<Desc>] = value;
  }
}

type OneofADT =
  | { case: undefined; value?: undefined }
  | { case: string; value: Message | ScalarValue };

/**
 * Gets the value of the field on a message. If the field is a oneof, the
 * value is returned from the oneof field. If the field is not a oneof,
 * the value is returned from the field directly.
 *
 * @param message the message to get the field from
 * @param field the descriptor of the field to get
 * @returns the value of the field
 */
export function getField<Desc extends DescMessage>(
  message: MessageShape<Desc>,
  field: DescField
) {
  if (field.parent.typeName !== message.$typeName) {
    return;
  }
  if (field.oneof) {
    const oneof = message[
      field.oneof.localName as keyof MessageShape<Desc>
    ] as OneofADT;
    if (oneof.case === field.localName) {
      return oneof.value;
    }
    return undefined;
  }
  return message[field.localName as keyof MessageShape<Desc>];
}
