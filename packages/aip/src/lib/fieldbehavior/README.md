# AIP-203: Field Behavior

This package provides primitives for implementing AIP fieldbehavior annotation as described by [AIP-203](https://google.aip.dev/203).

You can clear fields with specific field behaviors from a message. For instance, you can clear all fields annotated as `OUTPUT_ONLY` from a message before processing a request:

```ts
import { clearFieldsWithBehaviors } from '@bearclaw/aip';
import { FieldBehavior } from '@buf/googleapis_googleapis.bufbuild_es/google/api/field_behavior_pb.js';

const message = create(MyMessageSchema, { ... });
const updated = clearFieldsWithBehaviors(MyMessageSchema, message, [FieldBehavior.OUTPUT_ONLY]);
```

By default, this function will return a copy of the original message with the fields cleared. But, you can also choose to have it mutate the original message by passing `true` as the final parameter.

You can also validate that no immutable fields have been set on a message:

```ts
import { validateImmutableFields } from '@bearclaw/aip';

const message = create(MyMessageSchema, { ... })
validateImmutableFields(MyMessageSchema, message); // will throw if any immutable fields are set
```

You may also provide a field mask in order to only check fields covered by the mask:

```ts
import { fieldMask, validateImmutableFieldsWithMask } from '@bearclaw/aip';

const message = create(MyMessageSchema, { ... });
// will throw if any immutable fields are set on a path specified by the field mask
validateImmutableFieldsWithMask(MyMessageSchema, message, fieldMask(['immutable_field']));
```

In addition to immutablility, you can also validate required fields with `validateRequiredFields` and `validateRequiredFieldsWithMask`.
