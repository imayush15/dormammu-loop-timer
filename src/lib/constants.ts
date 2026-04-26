import type { TimerDurations } from '../types/session'

export const DEFAULT_DURATIONS: TimerDurations = {
  workMinutes: 25,
  restMinutes: 10
}

export const DEFAULT_CATEGORIES = ['Deep Work', 'Revision', 'Practice', 'Coding', 'Reading', 'Admin', 'Break']

export const DB_NAME = 'pomodoro-local-tracker'
export const DB_VERSION = 1

export const STORAGE_VERSION = 'v1'
export const PENDING_SESSION_KEY = `pomodoro:pending:${STORAGE_VERSION}`
