import { createSignal, For, Show, type Component } from "solid-js"
import { useNavigate, useParams } from "@solidjs/router"
import { AgentItem } from "./agent-item"
import { AgentDetail } from "./agent-detail"
import { useTgsStatus } from "./use-tgs-status"
import type { TgsAgent } from "./types"

type Props = {
  open: boolean
  onToggle: () => void
}

export const AgentSidebar: Component<Props> = (props) => {
  const navigate = useNavigate()
  const params = useParams<{ dir?: string; id?: string }>()
  const { status, isElectron, stopAgent, resumeAgent } = useTgsStatus()
  const [selectedAgent, setSelectedAgent] = createSignal<TgsAgent | null>(null)

  const activeAgents = () => status()?.active ?? []
  const recentAgents = () => status()?.recent ?? []

  function backToChat() {
    setSelectedAgent(null)
    // Navigate back to the current session or the session list
    if (params.dir && params.id) {
      navigate(`/${params.dir}/session/${params.id}`)
    } else if (params.dir) {
      navigate(`/${params.dir}/session`)
    }
  }

  const EXPANDED_WIDTH = 260
  const COLLAPSED_WIDTH = 36

  const currentWidth = () => (props.open ? EXPANDED_WIDTH : COLLAPSED_WIDTH)

  return (
    <div
      class="shrink-0 flex flex-col bg-[var(--color-surface-base)] border-r border-[var(--color-border-subtle)] transition-[width] duration-200 overflow-hidden relative"
      style={{ width: `${currentWidth()}px` }}
      aria-label="Agent Monitor"
    >
      {/* Toggle button — always visible on the rail */}
      <div
        class="flex items-center px-1 py-2 border-b border-[var(--color-border-subtle)]"
        classList={{ "justify-center": !props.open, "justify-between": props.open }}
      >
        <Show when={props.open}>
          <span class="text-xs font-semibold text-[var(--color-text-muted)] pl-2 tracking-wide uppercase select-none">
            Agents
          </span>
        </Show>

        <button
          class="p-1 rounded hover:bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          title={props.open ? "Collapse agent monitor" : "Expand agent monitor"}
          onClick={props.onToggle}
        >
          <svg
            class="size-4 transition-transform"
            classList={{ "rotate-180": !props.open }}
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path d="M6 3l-4 5 4 5M10 3l4 5-4 5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>

      {/* Panel content — only rendered when expanded */}
      <Show when={props.open}>
        <div class="flex-1 min-h-0 overflow-hidden flex flex-col" style={{ width: `${EXPANDED_WIDTH}px` }}>
          <Show
            when={!selectedAgent()}
            fallback={
              <AgentDetail
                agent={selectedAgent()!}
                onBack={() => setSelectedAgent(null)}
                onBackToChat={backToChat}
                onStop={() => stopAgent(selectedAgent()!.task_id)}
                onResume={() => resumeAgent(selectedAgent()!.task_id)}
              />
            }
          >
            {/* Not Electron: info banner */}
            <Show when={!isElectron()}>
              <div class="m-2 p-2 rounded bg-[var(--color-warning-muted)] text-[var(--color-warning)] text-xs">
                Run opencode as desktop app for agent monitoring.
              </div>
            </Show>

            {/* Active agents */}
            <div class="flex-1 min-h-0 overflow-y-auto">
              <Show when={activeAgents().length > 0}>
                <div class="px-3 py-1.5 flex items-center gap-2">
                  <span class="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)] font-semibold">
                    Active
                  </span>
                  <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-info-muted)] text-[var(--color-info)] font-mono font-bold">
                    {activeAgents().length}
                  </span>
                </div>
                <div class="px-1">
                  <For each={activeAgents()}>
                    {(agent) => (
                      <AgentItem
                        agent={agent}
                        onSelect={() => setSelectedAgent(agent)}
                        onStop={() => stopAgent(agent.task_id)}
                        onResume={() => resumeAgent(agent.task_id)}
                      />
                    )}
                  </For>
                </div>
              </Show>

              {/* Recent agents */}
              <Show when={recentAgents().length > 0}>
                <div class="px-3 py-1.5 mt-1 flex items-center gap-2 border-t border-[var(--color-border-subtle)]">
                  <span class="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)] font-semibold">
                    Recent
                  </span>
                </div>
                <div class="px-1">
                  <For each={recentAgents().slice(0, 10)}>
                    {(agent) => (
                      <AgentItem
                        agent={agent}
                        onSelect={() => setSelectedAgent(agent)}
                        onStop={() => stopAgent(agent.task_id)}
                        onResume={() => resumeAgent(agent.task_id)}
                      />
                    )}
                  </For>
                </div>
              </Show>

              {/* Empty state */}
              <Show when={activeAgents().length === 0 && recentAgents().length === 0 && isElectron()}>
                <div class="flex flex-col items-center justify-center h-32 gap-2 text-[var(--color-text-muted)]">
                  <span class="text-2xl">🤖</span>
                  <p class="text-xs">No agents running</p>
                </div>
              </Show>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  )
}
