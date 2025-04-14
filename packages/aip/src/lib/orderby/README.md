# AIP-132: Ordering

This package provides primitives for implementing AIP ordering as described in [AIP-132](https://google.aip.dev/132#ordering).

An order by value should be a string which is a comma-separated list of fields (i.e. `foo, bar`). Fields must be valid field names for protobuf messages. For example, `foo!?#` would not be a valid field. You may also specify subfields with the `.` character i.e. `foo.bar`.

You can create an `OrderBy` object in 3 ways:

```ts
import {
  Field,
  OrderBy,
  parseOrderBy,
  parseAndValidateOrderBy,
} from '@bearclaw/aip';

// 1. Manually:
const orderBy = new OrderBy([new Field('foo'), new Field('bar', true)]);

// 2. From a string with the `parseOrderBy` function:
const orderBy = parseOrderBar('foo, bar desc');

// 3. Parse and validate with the `parseAndValidateOrderBy` function:
parseAndValidateOrderBy('foo', MyMessageSchema); // returns an OrderBy object
parseAndValidateOrderBy('invalid', MyMessageSchema); // throws an error
```
