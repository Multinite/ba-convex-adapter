import type {
  ActionBuilder,
  MutationBuilder,
  QueryBuilder,
  RegisteredAction,
  RegisteredMutation,
  RegisteredQuery,
} from "convex/server";
import { v } from "convex/values";
import { type QueryFilter, stringToQuery } from "./helpers";

export function queryBuilder(cb: QueryFilter) {
  return cb.toString().split("=>")[1].trimStart();
}

export type ConvexReturnType = {
  betterAuth: RegisteredAction<
    "public",
    {
      action: string;
      value: any;
    },
    Promise<any>
  >;
  query: RegisteredQuery<
    "internal",
    {
      tableName: string;
      query?: string;
      order?: "asc" | "desc";
      single?: boolean;
    },
    Promise<any>
  >;
  insert: RegisteredMutation<
    "internal",
    {
      tableName: string;
      values: Record<string, any>;
    },
    Promise<any>
  >;
};

export function ConvexHandler<
  Action extends ActionBuilder<any, "public"> = ActionBuilder<{}, "public">,
  Query extends QueryBuilder<any, "internal"> = QueryBuilder<{}, "internal">,
  Mutation extends MutationBuilder<any, "internal"> = MutationBuilder<
    {},
    "internal"
  >,
>({
  action,
  internalQuery,
  internalMutation,
  internal,
}: {
  action: Action;
  internalQuery: Query;
  internalMutation: Mutation;
  internal: {
    betterAuth: {
      query: any;
      insert: any;
    };
  } & Record<string, any>;
}): ConvexReturnType {
  const betterAuth = action({
    args: { action: v.string(), value: v.any() },
    handler: async (ctx, args) => {
      if (args.action === "query") {
        const data = (await ctx.runQuery(internal.betterAuth.query, {
          query: args.value.query,
          tableName: args.value.tableName,
        })) as unknown as any;
        return data;
      }
      if (args.action === "insert") {
        const data = await ctx.runMutation(internal.betterAuth.insert, {
          tableName: args.value.tableName,
          values: args.value.values,
        });
        return data;
      }
    },
  });
  const query = internalQuery({
    args: {
      tableName: v.string(),
      query: v.optional(v.any()),
      /**
       * asc or desc
       */
      order: v.optional(v.string()),
      /**
       * Only get the first.
       */
      single: v.optional(v.boolean()),
    },
    handler: async (
      ctx,
      args: {
        tableName: string;
        query?: string;
        order?: "asc" | "desc";
        single?: boolean;
      },
    ) => {
      const query = ctx.db
        //@ts-ignore
        .query(args.tableName)
        .order(args.order || "asc")
        //@ts-ignore
        .filter((q) => {
          if (!args.query) return true;
          return stringToQuery(args.query, q);
        });

      if (args.single) return await query.first();
      return await query.collect();
    },
  });

  const insert = internalMutation({
    args: {
      tableName: v.string(),
      values: v.any(),
    },
    handler: async (
      ctx,
      args: {
        tableName: string;
        values: Record<string, any>;
      },
    ) => {
      return await ctx.db.insert(args.tableName, args.values);
    },
  });

  return { betterAuth, query, insert };
}
