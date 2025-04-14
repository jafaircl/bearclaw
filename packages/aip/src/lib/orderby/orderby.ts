/* eslint-disable no-case-declarations */

import { DescMessage } from '@bufbuild/protobuf';
import { fieldMask, isValidFieldMask } from '../fieldmask';

/**
 * Field represents a single ordering field.
 */
export class Field {
  /**
   * Path is the path of the field, including subfields
   */
  path: string;
  /**
   * Desc indicates if the ordering of the field is descending.
   */
  desc: boolean;

  constructor(path: string, desc = false) {
    this.path = path;
    this.desc = desc;
  }

  /**
   * SubFields returns the individual subfields of the field path, including
   * the top-level subfield.
   *
   * Subfields are specified with a . character, such as foo.bar or address
   * street.
   */
  subFields(): string[] {
    return this.path.split('.').map((subField) => subField.trim());
  }
}

/**
 * OrderBy represents an ordering directive.
 */
export class OrderBy {
  /**
   * Fields are the fields to order by.
   */
  fields: Field[];

  constructor(fields: Field[]) {
    this.fields = fields;
  }

  /**
   * ValidateForMessage validates that the ordering paths are syntactically
   * valid and refer to known fields in the specified message type.
   *
   * @param desc the message descriptor
   */
  validateForMessage(desc: DescMessage) {
    const paths: string[] = [];
    for (const field of this.fields) {
      paths.push(field.path);
    }
    const fm = fieldMask(paths);
    return isValidFieldMask(fm, desc);
  }

  toString() {
    return this.fields
      .map((field) => {
        if (field.desc) {
          return `${field.path} desc`;
        }
        return field.path;
      })
      .join(', ');
  }
}

/**
 * Parse an order by string into an OrderBy object.
 *
 * @param str the order by string
 * @returns the parsed order by object
 */
export function parseOrderBy(str: string) {
  if (str === '') {
    return new OrderBy([]);
  }
  for (const char of str) {
    // Check if the character is a valid character for a field name or a space
    if (!/^[a-zA-Z0-9_., ]+$/.test(char)) {
      throw new Error(`parse order by '${str}': invalid character '${char}'`);
    }
  }
  const fields: Field[] = [];
  const candidates = str.split(',').map((s) => s.trim());
  for (const field of candidates) {
    const parts = field.split(' ').map((s) => s.trim());
    if (parts[0] === '') {
      throw new Error(`parse order by '${str}': invalid format`);
    }
    switch (parts.length) {
      case 1:
        // default ordering ascending
        fields.push(new Field(parts[0], false));
        break;
      case 2:
        // specific ordering
        let desc = false;
        switch (parts[1].toLowerCase()) {
          case 'asc':
            desc = false;
            break;
          case 'desc':
            desc = true;
            break;
          default:
            throw new Error(`parse order by '${str}': invalid format`);
        }
        fields.push(new Field(parts[0], desc));
        break;
      default:
        throw new Error(`parse order by '${str}': invalid format`);
    }
  }
  return new OrderBy(fields);
}

/**
 * Parses and validates an order by string for a specific message type.
 *
 * @param str the order by string
 * @param desc the message descriptor
 * @returns the parsed order by object
 * @throws Error if the order by string is invalid or does not match the
 * message type
 */
export function parseAndValidateOrderBy(
  str: string,
  desc: DescMessage
): OrderBy | undefined {
  const orderBy = parseOrderBy(str);
  if (!orderBy.validateForMessage(desc)) {
    throw new Error(`invalid order by '${str}' for message ${desc.typeName}`);
  }
  return orderBy;
}
