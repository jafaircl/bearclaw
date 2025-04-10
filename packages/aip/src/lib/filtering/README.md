# AIP-160: Filtering

This package provides a way to parse and type-check the filtering grammar described by [AIP-160](https://google.aip.dev/160).

You can parse filter strings into [protobuf-es](https://github.com/bufbuild/protobuf-es) `ParsedExpr` message objects like so:

```ts
import { parseFilter } from '@bearclaw/aip';

const parsed = parseFilter('a = 1');

// parsed is a ParsedExpr object
// If an invalid filter is passed, an error will be thrown
```

You can also type-check the parsed expression. Valid filters must always evaulate to a boolean type.

```ts
import {
  checkParsedExpression,
  extendStandardFilterDeclarations,
  newIdentDeclaration,
  TypeInt,
} from '@bearclaw/aip';

const checked = checkParsedExpression(
  parsed,
  extendStandardFilterDeclarations([newIdentDeclaration('a', TypeInt)])
);

// checked is a CheckedExpr object
// If the type-checking fails or the filter evaluates to a non-bool type, an error will be thrown
```

See more about `ParsedExpr` and `CheckedExpr` objects here: https://buf.build/googleapis/googleapis/docs/main:google.api.expr.v1alpha1

A one-step function to parse and check is also provided:

```ts
import {
  parseAndCheckFilter,
  extendStandardFilterDeclarations,
  newIdentDeclaration,
  TypeInt,
} from '@bearclaw/aip';

const checked = parseAndCheckFilter(
  'a = 1',
  extendStandardFilterDeclarations([newIdentDeclaration('a', TypeInt)])
);

// checked is a CheckedExpr object
// If the type-checking fails or the filter evaluates to a non-bool type, an error will be thrown
```

For applications where finer-grained control may be required, the `Lexer`, `Parser`, `Declarations`, and `Checker` classes are exported from the package along with several helper functions to generate `Type` and `Decl` message objects.

There is also experimental support for custom protobuf message types:

```protobuf
syntax = "proto3";
package custom;

message MyMessage {
    int64 my_field = 1;
}
```

```ts
import {
  parseAndCheckFilter,
  extendStandardFilterDeclarations,
  newIdentDeclaration,
  typeMessage,
} from '@bearclaw/aip';
import { MyMessageSchema } from './gen/custom';

const checked = parseAndCheckFilter(
  'a.my_field = 1',
  extendStandardFilterDeclarations([
    newIdentDeclaration('a', typeMessage(MyMessageSchema.typeName)),
  ])
);
```
