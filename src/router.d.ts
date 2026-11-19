import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** Route needs an active child profile. */
    needsProfile?: boolean
  }
}

export {}
