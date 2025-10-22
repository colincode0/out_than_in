// Pagination constants
export const POSTS_PER_PAGE = 20;
export const PAGINATION_DEBOUNCE_MS = 300;

// API endpoints
export const API_ENDPOINTS = {
  LATEST_POSTS: "/api/latest-posts",
  PUBLIC_LATEST_POSTS: "/api/public/latest-posts",
  USER_PROFILE: "/api/user",
  FEED: "/api/feed",
} as const;

// UI constants
export const LOADING_STATES = {
  INITIAL: "Loading posts...",
  PAGE_TRANSITION: "Loading page...",
} as const;
