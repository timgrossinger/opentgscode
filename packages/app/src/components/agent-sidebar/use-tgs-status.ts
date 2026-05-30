import { createSignal, onCleanup, onMount } from "solid-js"
import type { TgsAgent, TgsStatus } from "./types"

export type { TgsAgent, TgsStatus }

const POLL_INTERVAL_MS = 1500

export function useTgsStatus() {
  const [status, setStatus] = createSignal<TgsStatus | null>(null)
  const [isElectron] = createSignal(typeof window.tgsRouter !== "undefined")

  onMount(() => {
    if (!window.tgsRouter) {
      // Web-only mode: show empty state
      setStatus({ updated_at: "", active: [], recent: [] })
      return
    }

    // Initial fetch
    window.tgsRouter.getStatus().then((s) => {
      if (s) setStatus(s)
    })

    // Subscribe to file-watch push updates
    const unwatch = window.tgsRouter.watchStatus((s) => setStatus(s))

    // Also poll as a fallback (handles cases where watch misses events)
    const timer = setInterval(async () => {
      if (!window.tgsRouter) return
      const s = await window.tgsRouter.getStatus()
      if (s) setStatus(s)
    }, POLL_INTERVAL_MS)

    onCleanup(() => {
      unwatch()
      clearInterval(timer)
    })
  })

  async function stopAgent(taskId: string) {
    await window.tgsRouter?.stopAgent(taskId)
    // Optimistically update status
    setStatus((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        active: prev.active.map((a) => (a.task_id === taskId ? { ...a, status: "stopped" as const } : a)),
      }
    })
  }

  async function resumeAgent(taskId: string) {
    await window.tgsRouter?.resumeAgent(taskId)
    // Optimistically update status
    setStatus((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        active: prev.active.map((a) => (a.task_id === taskId ? { ...a, status: "running" as const } : a)),
      }
    })
  }

  return { status, isElectron, stopAgent, resumeAgent }
}
