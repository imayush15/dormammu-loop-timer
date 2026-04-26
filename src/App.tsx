import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { InsightsPanel } from './components/InsightsPanel'
import { SummaryModal } from './components/SummaryModal'
import { TimerPanel } from './components/TimerPanel'
import { DEFAULT_CATEGORIES, PENDING_SESSION_KEY } from './lib/constants'
import { playCompletionBeep } from './lib/audio'
import { formatTimer, toDateKey } from './lib/time'
import { readStorageJson, removeStorageKey, writeStorageJson } from './lib/storage'
import { usePomodoroTimer } from './hooks/usePomodoroTimer'
import { useSessionStore } from './hooks/useSessionStore'
import type { SessionRecord, SummaryContext, SummaryDraft } from './types/session'

const APP_NAME = 'Dormammu Loop Timer'

function emptySummary(): SummaryDraft {
  return { open: false, context: null, task: '', category: '', notes: '' }
}

function App() {
  const {
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
  } = usePomodoroTimer()

  const { dbReady, sessions, saveSession } = useSessionStore()

  const [taskName, setTaskName] = useState('')
  const [taskCategory, setTaskCategory] = useState('')
  const [historyDate, setHistoryDate] = useState(() => toDateKey(new Date()))
  const [summary, setSummary] = useState<SummaryDraft>(emptySummary)

  const wasRunningRef = useRef(false)

  const titleMode = mode === 'work' ? 'Focus' : 'Break'

  useEffect(() => {
    document.title = `${formatTimer(remainingSeconds)} • ${titleMode} • ${APP_NAME}`
  }, [remainingSeconds, titleMode])

  useEffect(() => {
    if (!dbReady) return
    const recovered = readStorageJson<SummaryContext & { prefillTask?: string; prefillCategory?: string }>(PENDING_SESSION_KEY)
    if (!recovered || recovered.durationSeconds <= 0) return

    setSummary({
      open: true,
      context: recovered,
      task: recovered.prefillTask ?? '',
      category: recovered.prefillCategory ?? '',
      notes: ''
    })
  }, [dbReady])

  useEffect(() => {
    const completedNow = wasRunningRef.current && !isRunning && remainingSeconds === 0
    wasRunningRef.current = isRunning

    if (!completedNow) return

    playCompletionBeep()

    const completedContext: SummaryContext = {
      mode,
      status: 'completed',
      reason: 'timer-complete',
      durationSeconds: totalSeconds,
      startedAt: modeStartedAt ?? new Date(Date.now() - totalSeconds * 1000).toISOString(),
      postAction: 'switch-mode'
    }

    setSummary({
      open: true,
      context: completedContext,
      task: taskName,
      category: taskCategory,
      notes: ''
    })
  }, [isRunning, mode, modeStartedAt, remainingSeconds, taskCategory, taskName, totalSeconds])

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!isRunning || elapsedSeconds < 1) return

      const pendingSession: SummaryContext & { prefillTask?: string; prefillCategory?: string } = {
        mode,
        status: 'interrupted',
        reason: 'restore-pending',
        durationSeconds: elapsedSeconds,
        startedAt: modeStartedAt ?? new Date(Date.now() - elapsedSeconds * 1000).toISOString(),
        postAction: 'reset-same-mode',
        prefillTask: taskName.trim(),
        prefillCategory: taskCategory.trim()
      }

      writeStorageJson(PENDING_SESSION_KEY, pendingSession)
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [elapsedSeconds, isRunning, mode, modeStartedAt, taskCategory, taskName])

  const workSessions = useMemo(() => sessions.filter(item => item.mode === 'work'), [sessions])

  const sessionsCompleted = useMemo(
    () => workSessions.filter(item => item.status === 'completed').length,
    [workSessions]
  )

  const dayTotals = useMemo(() => {
    const totals = new Map<string, number>()
    for (const item of workSessions) {
      totals.set(item.dateKey, (totals.get(item.dateKey) ?? 0) + item.durationSeconds)
    }
    return totals
  }, [workSessions])

  const analytics = useMemo(() => {
    const todayKey = toDateKey(new Date())
    const todaySeconds = dayTotals.get(todayKey) ?? 0

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)

    let weekSeconds = 0
    const categoryTotals = new Map<string, number>()

    for (const item of workSessions) {
      if (new Date(item.endedAt) >= sevenDaysAgo) {
        weekSeconds += item.durationSeconds
      }

      const categoryName = item.category || 'General'
      categoryTotals.set(categoryName, (categoryTotals.get(categoryName) ?? 0) + item.durationSeconds)
    }

    let streakDays = 0
    const cursor = new Date()
    while (true) {
      const key = toDateKey(cursor)
      if (!dayTotals.has(key)) break
      streakDays += 1
      cursor.setDate(cursor.getDate() - 1)
    }

    const topCategories = Array.from(categoryTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)

    return { todaySeconds, weekSeconds, streakDays, topCategories }
  }, [dayTotals, workSessions])

  const categoryOptions = useMemo(() => {
    const categorySet = new Set(DEFAULT_CATEGORIES)
    for (const item of sessions) {
      if (item.category) categorySet.add(item.category)
    }
    return Array.from(categorySet).sort((a, b) => a.localeCompare(b))
  }, [sessions])

  const historyItems = useMemo(
    () => sessions
      .filter(item => item.dateKey === historyDate)
      .sort((a, b) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime()),
    [historyDate, sessions]
  )

  function openSummary(context: SummaryContext): void {
    setSummary({
      open: true,
      context,
      task: context.prefillTask ?? taskName,
      category: context.prefillCategory ?? taskCategory,
      notes: ''
    })
  }

  function stopAndLog(reason: SummaryContext['reason'], status: SummaryContext['status']): void {
    pauseTimer()

    if (elapsedSeconds < 1) {
      resetCurrentMode()
      return
    }

    openSummary({
      mode,
      status,
      reason,
      durationSeconds: elapsedSeconds,
      startedAt: modeStartedAt ?? new Date(Date.now() - elapsedSeconds * 1000).toISOString(),
      postAction: 'reset-same-mode'
    })
  }

  async function saveSummary(): Promise<void> {
    if (!summary.context) return

    const endedAt = new Date()
    const startedAt = new Date(summary.context.startedAt)

    const finalTask = summary.task.trim() || taskName.trim() || (summary.context.mode === 'rest' ? 'Break' : 'Untitled Session')
    const finalCategory = summary.category.trim() || taskCategory.trim() || (summary.context.mode === 'rest' ? 'Break' : 'General')

    const record: SessionRecord = {
      mode: summary.context.mode,
      status: summary.context.status,
      reason: summary.context.reason,
      task: finalTask,
      category: finalCategory,
      notes: summary.notes.trim(),
      durationSeconds: summary.context.durationSeconds,
      startedAt: startedAt.toISOString(),
      endedAt: endedAt.toISOString(),
      dateKey: toDateKey(endedAt),
      createdAt: new Date().toISOString()
    }

    await saveSession(record)

    setTaskName(finalTask)
    setTaskCategory(finalCategory)

    const postAction = summary.context.postAction
    removeStorageKey(PENDING_SESSION_KEY)
    setSummary(emptySummary())

    if (postAction === 'switch-mode') {
      switchMode()
      requestAutoStart()
      return
    }

    resetCurrentMode()
  }

  function skipSummary(): void {
    const postAction = summary.context?.postAction
    removeStorageKey(PENDING_SESSION_KEY)
    setSummary(emptySummary())

    if (postAction === 'switch-mode') {
      switchMode()
      requestAutoStart()
      return
    }

    resetCurrentMode()
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Time Loop Focus Tracker</p>
          <h1>{APP_NAME}</h1>
        </div>
        <p className="today">
          {new Date().toLocaleDateString(undefined, {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </p>
      </header>

      <main className="layout">
        <TimerPanel
          mode={mode}
          durations={durations}
          draftDurations={draftDurations}
          progressDeg={progressDeg}
          remainingSeconds={remainingSeconds}
          elapsedSeconds={elapsedSeconds}
          isRunning={isRunning}
          summaryOpen={summary.open}
          taskName={taskName}
          taskCategory={taskCategory}
          autoStartNext={autoStartNext}
          categoryOptions={categoryOptions}
          onTaskNameChange={setTaskName}
          onTaskCategoryChange={setTaskCategory}
          onAutoStartChange={setAutoStartNext}
          onDraftDurationsChange={setDraftDurations}
          onStart={startTimer}
          onPause={pauseTimer}
          onStopAndLog={() => stopAndLog('manual-stop', 'stopped')}
          onResetAndLog={() => stopAndLog('manual-reset', 'reset')}
          onApplyDurations={applyDurations}
        />

        <InsightsPanel
          sessionsCompleted={sessionsCompleted}
          todaySeconds={analytics.todaySeconds}
          weekSeconds={analytics.weekSeconds}
          streakDays={analytics.streakDays}
          topCategories={analytics.topCategories}
          historyDate={historyDate}
          historyItems={historyItems}
          onHistoryDateChange={setHistoryDate}
        />
      </main>

      <SummaryModal
        summary={summary}
        onTaskChange={value => setSummary(prev => ({ ...prev, task: value }))}
        onCategoryChange={value => setSummary(prev => ({ ...prev, category: value }))}
        onNotesChange={value => setSummary(prev => ({ ...prev, notes: value }))}
        onSkip={skipSummary}
        onSave={() => {
          void saveSummary()
        }}
      />
    </div>
  )
}

export default App
