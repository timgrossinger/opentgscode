export type TgsAgent = {
  task_id: string
  prompt_excerpt: string
  tier: "low" | "medium" | "high"
  target_file: string | null
  wave_id: string | null
  status: "running" | "stopped" | "completed" | "failed"
  started_at: string
  elapsed: number
  model: string | null
  provider: string | null
  pid: number | null
}

export type TgsStatus = {
  updated_at: string
  active: TgsAgent[]
  recent: TgsAgent[]
}

declare global {
  interface Window {
    tgsRouter?: {
      getStatus: () => Promise<TgsStatus | null>
      watchStatus: (cb: (status: TgsStatus) => void) => () => void
      stopAgent: (taskId: string) => Promise<void>
      resumeAgent: (taskId: string) => Promise<void>
    }
  }
}
