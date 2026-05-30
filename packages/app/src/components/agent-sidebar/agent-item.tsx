import { Show, type Component } from "solid-js"
import type { TgsAgent } from "./types"

type Props = {
  agent: TgsAgent
  onSelect: () => void
  onStop: () => void
  onResume: () => void
}

const TIER_COLORS: Record<string, string> = {
  low: "text-[var(--color-info)] bg-[var(--color-info-muted)]",
  medium: "text-[var(--color-warning)] bg-[var(--color-warning-muted)]",
  high: "text-[var(--color-danger)] bg-[var(--color-danger-muted)]",
}

function StatusIcon(props: { status: TgsAgent["status"] }) {
  return (
    <Show
      when={props.status !== "running"}
      fallback={
        <span
          class="size-3 rounded-full border-2 border-transparent border-t-[var(--color-success)] animate-spin inline-block"
          aria-label="running"
        />
      }
    >
      <Show when={props.status === "stopped"}>
        <span class="text-[var(--color-warning)] text-sm" aria-label="stopped">⏸</span>
      </Show>
      <Show when={props.status === "completed"}>
        <span class="text-[var(--color-success)] text-sm" aria-label="completed">✓</span>
      </Show>
      <Show when={props.status === "failed"}>
        <span class="text-[var(--color-danger)] text-sm" aria-label="failed">✗</span>
      </Show>
    </Show>
  )
}

export const AgentItem: Component<Props> = (props) => {
  const isActive = () => props.agent.status === "running" || props.agent.status === "stopped"
  const elapsed = () => {
    const s = props.agent.elapsed
    if (s < 60) return `${Math.round(s)}s`
    return `${Math.floor(s / 60)}m${Math.round(s % 60)}s`
  }

  return (
    <button
      class="w-full text-left px-2 py-2 rounded hover:bg-[var(--color-surface-raised)] transition-colors group flex items-start gap-2 min-w-0"
      onClick={props.onSelect}
    >
      <div class="mt-0.5 shrink-0 w-4 flex items-center justify-center">
        <StatusIcon status={props.agent.status} />
      </div>
      <div class="flex-1 min-w-0 flex flex-col gap-0.5">
        <p class="text-xs text-[var(--color-text-primary)] truncate leading-snug">
          {props.agent.prompt_excerpt}
        </p>
        <div class="flex items-center gap-1.5 flex-wrap">
          <span
            class={`text-[10px] px-1 rounded font-mono ${TIER_COLORS[props.agent.tier] ?? ""}`}
          >
            {props.agent.tier}
          </span>
          <span class="text-[10px] text-[var(--color-text-muted)]">{elapsed()}</span>
          <Show when={props.agent.model}>
            <span class="text-[10px] text-[var(--color-text-muted)] truncate max-w-[80px]">
              {props.agent.model}
            </span>
          </Show>
        </div>
      </div>
      <Show when={isActive()}>
        <div class="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <Show
            when={props.agent.status === "running"}
            fallback={
              <button
                class="text-[10px] px-1.5 py-0.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-success)] hover:bg-[var(--color-success-muted)] transition-colors"
                title="Resume agent"
                onClick={props.onResume}
              >
                ▶
              </button>
            }
          >
            <button
              class="text-[10px] px-1.5 py-0.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-warning)] hover:bg-[var(--color-warning-muted)] transition-colors"
              title="Stop agent"
              onClick={props.onStop}
            >
              ⏸
            </button>
          </Show>
        </div>
      </Show>
    </button>
  )
}
