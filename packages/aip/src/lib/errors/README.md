# AIP-193: Errors

This package provides primitives for implementing AIP errors as described by [AIP-193](https://google.aip.dev/193).

You can parse a `Status` message and return a `StatusError` (or one of its subclasses):

```ts
import { parseErrorFromStatus } from '@bearclaw/aip';

parseErrorFromStatus(status);
```

The function will return null if the `Status` code is `OK`.
