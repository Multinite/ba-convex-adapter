> [!CAUTION]
> This adapter is currently in beta.
> If you encounter any issues, please report them in the [Issues](https://github.com/ping-maxwell/convex-better-auth/issues) section.

# Convex Database Adapter for BetterAuth

Introducing a database adapter designed for [Convex](https://www.convex.dev/) that enables seamless integration with [BetterAuth](https://www.better-auth.com/).


> [!WARNING]
> Please note that Convex DB is not inherently designed for this purpose. I have implemented workarounds to facilitate dynamic queries and mutations within Convex, which is typically not supported. Additionally, there are several limitations that may affect the functionality of BetterAuth in certain scenarios. Some plugins may not operate as expected.
>
> Here are the key limitations to consider:
>
> - **Performance Issues**: Due to the inability to perform dynamic queries/mutations, we send a request to Convex Actions, which then calls the mutate/query function. This results in at least two calls, not including subsequent database queries or mutation calls.
> - **Lack of `sortBy` Support**: BetterAuth requires sorting at the individual field level, while Convex only supports sorting at the table level.
> - **Degraded Performance for Pagination Queries**: Convex's support for pagination is limited, which may lead to performance issues when working outside its intended scope.
> - **No Support for Certain Operators**: Operators such as `starts_with`, `ends_with`, or `contains` are not supported. This limitation primarily affects the admin plugin.

## Installation

```bash
npm install convex-better-auth
```

## Usage

### 1. Initiate the Convex Database Adapter

Head over to your Better Auth server instance, and under `database`, add the `convexAdapter` function.

```ts
import { betterAuth } from "better-auth";
import { convexAdapter } from "convex-better-auth";

const convexClient = new ConvexClient(process.env.CONVEX_URL);

export const auth = betterAuth({
  database: convexAdapter(convexClient),
  plugins: [],
  //... other options
});
```

### 2. Create the Convex Handler

This allows our adapter to communicate with your Convex DB.

Create a new file in `convex/betterAuth.ts` and add the following code:

**NOTE:** It's important that the file name is exactly `betterAuth.ts` and that it is in the `convex` directory.

```ts
import { action, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexHandler, type ConvexReturnType } from "./../src/convex_action";

const { betterAuth, query, insert, update, delete_ } = ConvexHandler({
  action,
  internalQuery,
  internalMutation,
  internal,
}) as ConvexReturnType;

export { betterAuth, query, insert, update, delete_ };
```
