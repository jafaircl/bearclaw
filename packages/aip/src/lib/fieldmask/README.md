# AIP-161: Field Masks

This package provides primitives for implementing AIP field mask functionality as described by [AIP-161](https://google.aip.dev/161).

## `fieldMask`

This is a helper function that simply provides a shorthand for defining a field mask.

```ts
import { create } from '@bufbuild/protobuf';
import { FieldMaskSchema } from '@bufbuild/protobuf/wkt';
import { fieldMask } from '@bearclaw/aip';

const fm1 = create(FieldMaskSchema, { paths: ['valid_path'] });
const fm2 = fieldMask(['valid_path']);
// fm1 and fm2 are identical
```

## `isValidFieldMask`

This function validates that the paths provided by a field mask message are syntactically valid and refer to known fields of a message.
It will return a boolean indicating if all paths are valid.

```ts
import { fieldMask, isValidFieldMask } from '@bearclaw/aip';

isValidFieldMask(fieldMask(['valid_path']), MyMessageSchema); // true
```

A wildcard path (`*`) can be used to indicate that all fields should be operated upon. However, top-level wildcards cannot be used with other paths. In addition, field masks may use a wildcard with repeated or map fields to specify sub-fields in the collection as described by the [AIP](https://google.aip.dev/161#wildcards). For example:

```ts
isValidFieldMask(fieldMask(['*']), MyMessageSchema); // true
isValidFieldMask(fieldMask(['*', 'other']), MyMessageSchema); // false
isValidFieldMask(fieldMask(['repeated_field.*.sub_field']), MyMessageSchema); // true
isValidFieldMask(fieldMask(['map_field.*.sub_field']), MyMessageSchema); // true
```

## `applyFieldMask`

This function applies a field mask to a message and returns the result. It is non-destructive and returns a copy of the message rather than modifying the original. For example, the following would create a message that only copied the value of the `example` field from the original message:

```ts
import { applyFieldMask, fieldMask } from '@bearclaw/aip';

const updatedMessage = applyFieldMask(
  MyMessageSchema,
  originalMessage,
  fieldMask(['example'])
);
```

You may also invert the operation by passing `true` as the last parameter for the function. This would return every field _except_ the `example` field from the original message:

```ts
const updatedMessage = applyFieldMask(
  MyMessageSchema,
  originalMessage,
  fieldMask(['example']),
  true
);
```

This function verifies the validity of the field mask for a message and will throw an error if a mask with invalid paths is passed.
