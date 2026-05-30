import { Show, type Component } from "solid-js"
import type { TgsAgent } from "./types"

type Props = {
  agent: TgsAgent
  onBack: () => void
  onBackToChat: () => void
  onStop: () => void
  onResume: () => void
}

function DetailRow(props: { label: string; value: string | null | undefined }) {
  return (
    <Show when={props.value}>
      <div class="flex flex-col gap-0.5">
        <span class="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">{props.label}</span>
        <span class="text-xs text-[var(--color-text-primary)] break-all font-mono">{props.value}</span>
      </div>
    </Show>
  )
}

export const AgentDetail: Component<Props> = (props) => {
  const isActive = () => props.agent.status === "running" || props.agent.status === "stopped"
  const elapsed = () => {
    const s = props.agent.elapsed
    if (s < 60) return `${Math.round(s)}s`
    return `${Math.floor(s / 60)}m${Math.round(s % 60)}s`
  }

  const statusLabel: Record<string, string> = {
    running: "Running",
    stopped: "Stopped",
    completed: "Completed",
    failed: "Failed",
  }

  return (
    <div class="flex flex-col h-full min-h-0 text-sm">
      {/* Header */}
      <div class="flex items-center gap-1 px-2 py-2 border-b border-[var(--color-border-subtle)]">
        <button
          class="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-1 rounded transition-colors"
          title="Back to agent list"
          onClick={props.onBack}
        >
          ←
        </button>
        <span class="flex-1 text-xs font-medium text-[var(--color-text-primary)] truncate">Agent Detail</span>
        <button
          class="text-[10px] px-2 py-0.5 rounded bg-[var(--color-surface-raised)] hover:bg-[var(--color-surface-active)] text-[var(--color-text-muted)] transition-colors"
          title="Back to main chat"
          onClick={props.onBackToChat}
        >
          ↩ Chat
        </button>
      </div>

      {/* Content */}
      <div class="flex-1 min-h-0 overflow-y-auto p-3 flex flex-col gap-3">
        {/* Status + controls */}
        <div class="flex items-center justify-between">
          <span
            class="text-xs px-2 py-0.5 rounded font-medium"
            classList={{
              "bg-[var(--color-success-muted)] text-[var(--color-success)]": props.agent.status === "completed",
              "bg-[var(--color-warning-muted)] text-[var(--color-warning)]": props.agent.status === "stopped",
              "bg-[var(--color-danger-muted)] text-[var(--color-danger)]": props.agent.status === "failed",
              "bg-[var(--color-info-muted)] text-[var(--color-info)]": props.agent.status === "running",
            }}
          >
            {statusLabel[props.agent.status] ?? props.agent.status}
          </span>
          <Show when={isActive()}>
            <Show
              when={props.agent.status === "running"}
              fallback={
                <button
                  class="text-xs px-2 py-0.5 rounded text-[var(--color-success)] bg-[var(--color-success-muted)] hover:opacity-80 transition-opacity"
                  onClick={props.onResume}
                >
                  ▶ Resume
                </button>
              }
            >
              <button
                class="text-xs px-2 py-0.5 rounded text-[var(--color-warning)] bg-[var(--color-warning-muted)] hover:opacity-80 transition-opacity"
                onClick={props.onStop}
              >
                ⏸ Stop
              </button>
            </Show>
          </Show>
        </div>

        {/* Prompt */}
        <div class="flex flex-col gap-0.5">
          <span class="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">Prompt</span>
          <p class="text-xs text-[var(--color-text-primary)] break-words leading-relaxed bg-[var(--color-surface-raised)] rounded p-2">
            {props.agent.prompt_excerpt}
          </p>
        </div>

        <DetailRow label="Task ID" value={props.agent.task_id} />
        <DetailRow label="Tier" value={props.agent.tier} />
        <DetailRow label="Model" value={props.agent.model} />
        <DetailRow label="Provider" value={props.agent.provider} />
        <DetailRow label="Target file" value={props.agent.target_file} />
        <DetailRow label="Wave" value={props.agent.wave_id} />
        <DetailRow label="Started" value={props.agent.started_at} />
        <DetailRow label="Elapsed" value={elapsed()} />
        <Show when={props.agent.pid != null}>
          <DetailRow label="PID" value={String(props.agent.pid)} />
        </Show>
      </div>
    </div>
  )
}
