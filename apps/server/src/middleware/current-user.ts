import type { MiddlewareHandler } from "hono";

declare module "hono" {
  interface ContextVariableMap {
    userId: string;
  }
}

// V1: no auth — resolve the active profile from a header set by the client,
// falling back to a single default user. Replace with real session lookup later.
export const currentUser: MiddlewareHandler = async (c, next) => {
  const headerUser = c.req.header("x-user-id");
  const userId = headerUser ?? process.env.DEFAULT_USER_ID ?? "default-user";
  c.set("userId", userId);
  await next();
};
