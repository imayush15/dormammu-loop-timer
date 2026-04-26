export type SessionMode = 'work' | 'rest'

export type SessionStatus = 'completed' | 'stopped' | 'reset' | 'interrupted'

export type SummaryReason = 'timer-complete' | 'manual-stop' | 'manual-reset' | 'restore-pending'

export type SummaryPostAction = 'switch-mode' | 'reset-same-mode'

export interface SessionRecord {
  id?: number
  mode: SessionMode
  status: SessionStatus
  reason: SummaryReason
  task: string
  category: string
  notes: string
  durationSeconds: number
  startedAt: string
  endedAt: string
  dateKey: string
  createdAt: string
}

export interface SummaryContext {
  mode: SessionMode
  status: SessionStatus
  reason: SummaryReason
  durationSeconds: number
  startedAt: string
  postAction: SummaryPostAction
  prefillTask?: string
  prefillCategory?: string
}

export interface SummaryDraft {
  open: boolean
  context: SummaryContext | null
  task: string
  category: string
  notes: string
}

export interface TimerDurations {
  workMinutes: number
  restMinutes: number
}
