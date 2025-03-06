# ghec-openapi-fetch-client

[An openapi-fetch client](https://openapi-ts.dev/openapi-fetch) for the GitHub
Enterprise Cloud REST API generated from
[GitHub's REST API OpenAPI Description](https://github.com/github/rest-api-description/)

## Why not octokit?

Octokit doesn't have TypeScript types for GitHub Enterprise Cloud. See [this issue](https://github.com/octokit/types.ts/issues/522) as an example.

## Usage
For public API calls the client can be used as-is.

```ts
import client from "@ataylorme/ghec-openapi-fetch-client";

const { data: helloWorldRepo, error: errorResponse } = await client.GET("/repos/{owner}/{repo}", {
  params: {
    path: { owner: "octocat", repo: "Hello-World" },
  }
});
```


## Authentication

For authenticated API calls, there are 2 options:

### 1) attach an [authentication middleware to the client](https://openapi-ts.dev/openapi-fetch/middleware-auth#basic-auth).

```ts
import { type Middleware } from "openapi-fetch";
import client from "@ataylorme/ghec-openapi-fetch-client";

// logic to get a GitHub token here
const ghToken: string = "";

// Create a middleware to add an Authorization header to every request
// https://openapi-ts.dev/openapi-fetch/middleware-auth
const authMiddleware: Middleware = {
  async onRequest({ request }) {
    // https://docs.github.com/en/enterprise-cloud@latest/rest/authentication/authenticating-to-the-rest-api?apiVersion=2022-11-28
    request.headers.set("Authorization", `Bearer ${ghToken}`);
    return request;
  },
};

client.use(authMiddleware);

const { data: currentUser, error: errorResponse } = await client.GET("/user");

// (optional) eject the authentication middleware
client.eject(authMiddleware);
```

### 2) send an auth header for a single request

```ts
import client from "@ataylorme/ghec-openapi-fetch-client";

// logic to get a GitHub token here
const ghToken: string = "";

const { data: currentUser, error: errorResponse } = await client.GET(
  "/user",
  {
    // https://docs.github.com/en/enterprise-cloud@latest/rest/authentication/authenticating-to-the-rest-api?apiVersion=2022-11-28
    // add an Authorization header to this request only
    headers: {
      Authorization: `Bearer ${ghToken}`,
    },
  },
);
```

## Pagination

```ts
import client, {paginationMiddleware} from "@ataylorme/ghec-openapi-fetch-client";

// attach the paginaton middleware
client.use(paginationMiddleware);

// make an API call to a paginated endpoint
const { data: reposResponse, error: errorResponse } = await client.GET(
  "/orgs/{org}/repos",
  {
    params: {
      path: { org: "octokit" },
      query: {
        // per_page: 100,
      },
    },
  },
);

// (optional) eject the pagination middleware
client.eject(paginationMiddleware);
```