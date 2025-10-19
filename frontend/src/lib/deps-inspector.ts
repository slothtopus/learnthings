// deps-inspector.ts
import { effect, stop, type DebuggerEvent } from 'vue'
import type { ComputedRef } from 'vue'

type DepInfo = { type: DebuggerEvent['type']; target: unknown; key?: unknown }

export function inspectGetterDeps(getter: () => unknown): DepInfo[] {
  const deps: DepInfo[] = []
  const runner = effect(getter, {
    onTrack(e) {
      deps.push({ type: e.type, target: e.target, key: 'key' in e ? e.key : undefined })
    },
  })
  // We only wanted the dependency list; don’t keep a live effect around
  stop(runner)
  return deps
}

/** Try to pull the computed's getter and inspect it (dev-only, private API). */
export function inspectComputedDeps(c: ComputedRef<unknown>): DepInfo[] {
  const getter = (c as any)?.effect?.fn ?? (() => c.value)
  return inspectGetterDeps(getter)
}

/*
Usage:

const fullName = computed(() => `${user.value.first} ${user.value.last}`)

console.table(
  inspectComputedDeps(fullName).map(d => ({
    type: d.type,                               // 'get'
    key: String(d.key ?? ''),
    targetType:
      (d.target as any)?.__v_isRef ? 'ref'
      : (d.target as any)?.constructor?.name ?? typeof d.target,
  }))
)
*/
