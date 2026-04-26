import { useCallback, useEffect, useRef, useState } from 'react'
import { DEFAULT_DURATIONS } from '../lib/constants'
import type { SessionMode, TimerDurations } from '../types/session'

interface UsePomodoroTimerResult {
  mode: SessionMode
  isRunning: boolean
  remainingSeconds: number
  totalSeconds: number
  elapsedSeconds: number
  progressDeg: number
  modeStartedAt: string | null
  durations: TimerDurations
  draftDurations: TimerDurations
  autoStartNext: boolean
  setAutoStartNext: (value: boolean) => void
  setDraftDurations: (value: TimerDurations) => void
  startTimer: () => void
  pauseTimer: () => void
  resetCurrentMode: () => void
  switchMode: () => void
  applyDurations: () => void
  requestAutoStart: () => void
}

export function usePomodoroTimer(): UsePomodoroTimerResult {
  const [mode, setMode] = useState<SessionMode>('work')
  const [isRunning, setIsRunning] = useState(false)
  const [modeStartedAt, setModeStartedAt] = useState<string | null>(null)
  const [autoStartNext, setAutoStartNext] = useState(false)
  const [pendingAutoStart, setPendingAutoStart] = useState(false)
  const [durations, setDurations] = useState<TimerDurations>(DEFAULT_DURATIONS)
  const [draftDurations, setDraftDurations] = useState<TimerDurations>(DEFAULT_DURATIONS)
  const [remainingSeconds, setRemainingSeconds] = useState(DEFAULT_DURATIONS.workMinutes * 60)

  const intervalRef = useRef<number | null>(null)
  const startTimestampRef = useRef(0)
  const startRemainingRef = useRef(0)

  const totalSeconds = mode === 'work' ? durations.workMinutes * 60 : durations.restMinutes * 60
  const elapsedSeconds = Math.max(0, totalSeconds - remainingSeconds)
  const progress = 1 - remainingSeconds / totalSeconds
  const progressDeg = Math.max(0, Math.min(1, progress)) * 360

  const clearIntervalSafe = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const pauseTimer = useCallback(() => {
    clearIntervalSafe()
    setIsRunning(false)
  }, [clearIntervalSafe])

  const setModeReset = useCallback((nextMode: SessionMode, nextDurations?: TimerDurations) => {
    const activeDurations = nextDurations ?? durations
    setMode(nextMode)
    setModeStartedAt(null)
    setIsRunning(false)
    clearIntervalSafe()
    setRemainingSeconds(nextMode === 'work' ? activeDurations.workMinutes * 60 : activeDurations.restMinutes * 60)
  }, [clearIntervalSafe, durations])

  const startTimer = useCallback(() => {
    if (isRunning) return

    setIsRunning(true)
    setModeStartedAt(prev => prev ?? new Date().toISOString())

    startTimestampRef.current = Date.now()
    startRemainingRef.current = remainingSeconds

    clearIntervalSafe()

    intervalRef.current = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimestampRef.current) / 1000)
      const nextRemaining = Math.max(0, startRemainingRef.current - elapsed)

      setRemainingSeconds(nextRemaining)

      if (nextRemaining <= 0) {
        clearIntervalSafe()
        setIsRunning(false)
      }
    }, 250)
  }, [clearIntervalSafe, isRunning, remainingSeconds])

  const resetCurrentMode = useCallback(() => {
    setModeReset(mode)
  }, [mode, setModeReset])

  const switchMode = useCallback(() => {
    const nextMode: SessionMode = mode === 'work' ? 'rest' : 'work'
    setModeReset(nextMode)
  }, [mode, setModeReset])

  const applyDurations = useCallback(() => {
    if (isRunning) return

    const workMinutes = Math.max(1, Math.min(180, Math.round(draftDurations.workMinutes)))
    const restMinutes = Math.max(1, Math.min(120, Math.round(draftDurations.restMinutes)))

    const nextDurations = { workMinutes, restMinutes }
    setDurations(nextDurations)
    setDraftDurations(nextDurations)
    setModeReset(mode, nextDurations)
  }, [draftDurations, isRunning, mode, setModeReset])

  const requestAutoStart = useCallback(() => {
    if (!autoStartNext) return
    setPendingAutoStart(true)
  }, [autoStartNext])

  useEffect(() => {
    if (!pendingAutoStart || isRunning) return
    const id = window.setTimeout(() => {
      startTimer()
      setPendingAutoStart(false)
    }, 300)

    return () => {
      window.clearTimeout(id)
    }
  }, [isRunning, pendingAutoStart, startTimer])

  useEffect(() => {
    return () => {
      clearIntervalSafe()
    }
  }, [clearIntervalSafe])

  return {
    mode,
    isRunning,
    remainingSeconds,
    totalSeconds,
    elapsedSeconds,
    progressDeg,
    modeStartedAt,
    durations,
    draftDurations,
    autoStartNext,
    setAutoStartNext,
    setDraftDurations,
    startTimer,
    pauseTimer,
    resetCurrentMode,
    switchMode,
    applyDurations,
    requestAutoStart
  }
}
