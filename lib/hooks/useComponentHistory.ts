"use client";

import { useMemo } from "react";
import { useComponentStore, type SavedComponent } from "@/lib/store/componentStore";

/**
 * Convenience hook for the gallery / dashboard — gives you sliced views over
 * the underlying Zustand store without needing every consumer to import the
 * store directly.
 */
export function useComponentHistory() {
  const components = useComponentStore((s) => s.components);
  const add = useComponentStore((s) => s.add);
  const update = useComponentStore((s) => s.update);
  const remove = useComponentStore((s) => s.remove);
  const toggleFavorite = useComponentStore((s) => s.toggleFavorite);

  const favorites = useMemo(
    () => components.filter((c) => c.favorite),
    [components]
  );

  const tagBuckets = useMemo(() => {
    const map = new Map<string, SavedComponent[]>();
    for (const c of components) {
      for (const tag of c.tags.length ? c.tags : ["untagged"]) {
        const bucket = map.get(tag) ?? [];
        bucket.push(c);
        map.set(tag, bucket);
      }
    }
    return map;
  }, [components]);

  return {
    components,
    favorites,
    tagBuckets,
    add,
    update,
    remove,
    toggleFavorite,
    total: components.length,
  };
}
