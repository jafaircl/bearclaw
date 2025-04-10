# AIP-158: Pagination

This package provides primitives for implementing AIP pagination as described in [AIP-158](https://google.aip.dev/158).

The utilities provided expect a request object which is formatted according to the AIP guidelines. Specifically, they will attempt to read from the following optional fields: `int32 page_size`, `string page_token`, and `int32 skip`. Here is an example request message:

```protobuf
syntax = "proto3";

package custom;

message PaginatedRequest {
  string parent = 1;
  int32 page_size = 2;
  string page_token = 3;
  int32 skip = 4;
}
```

You can parse a `PageToken` object instance from a protobuf request message like so:

```ts
const request = create(PaginatedRequestSchema, {
  parent: 'shelves/1',
  pageSize: 10,
});
const pageToken = parsePageToken(PaginatedRequestSchema, request);
```

The `PageToken` object provides an `offset` field and a `requestChecksum` field.

The `offset` field can be used to determine the number of results to skip when returning results. For example, if the `offset` is 30, the next set of results should begin with result 31. The `offset` field is a function of the request's `page_size` and `skip` fields combined with the `offset` field parsed from the `page_token` field.

The `requestChecksum` field can be used to verify that two `PageTokens` refer to the same request. The pagination fields are stripped from the request before calculating the checksum. For instance, two requests that are identical aside from the `page_size` field should have identical checksums.

Responses to paginated requests should provide a `string next_page_token` field which can be used to fetch the next page of results. The parsed `PageToken` can be used to determine this token like so:

```ts
const pageToken = parsePageToken(PaginatedRequestSchema, request);
const nextPageToken = pageToken.next().toString();
```

When this `next_page_token` is sent as part of the paginated response, the client can use it to set the `page_token` field of the following request in order to return the next set of results.
