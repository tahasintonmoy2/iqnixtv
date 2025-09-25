/**
 * An array of routes that are accessible to the public
 * These routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes = [
  "privacy-policy",
  "/auth/account-verification",
  "/api/uploadthing",
  "/api/series",
  "/api/series/by-category",
  "/api/categories:path",
  "/test-categories",
];

/**
 * An array of routes that are used for authentication
 * These routes will be redirected logged in users to /settings
 * @type {string[]}
 */
export const authRoutes = [
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/error",
  "/auth/reset",
  "/auth/reset-password",
];

/**
 * The prefix for API authentication routes
 * that start with this prefix is used for API authentication
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth";

/**
 * The defalut redirect path after loggin in
 * @type {string}
 */
export const DEFALUT_LOGIN_REDIRECT = "/";
