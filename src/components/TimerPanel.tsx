import type { CSSProperties } from 'react'
import { formatDuration, formatTimer } from '../lib/time'
import type { SessionMode, TimerDurations } from '../types/session'

interface TimerPanelProps {
  mode: SessionMode
  durations: TimerDurations
  draftDurations: TimerDurations
  progressDeg: number
  remainingSeconds: number
  elapsedSeconds: number
  isRunning: boolean
  summaryOpen: boolean
  taskName: string
  taskCategory: string
  autoStartNext: boolean
  categoryOptions: string[]
  onTaskNameChange: (value: string) => void
  onTaskCategoryChange: (value: string) => void
  onAutoStartChange: (value: boolean) => void
  onDraftDurationsChange: (value: TimerDurations) => void
  onStart: () => void
  onPause: () => void
  onStopAndLog: () => void
  onResetAndLog: () => void
  onApplyDurations: () => void
}

export function TimerPanel({
  mode,
  durations,
  draftDurations,
  progressDeg,
  remainingSeconds,
  elapsedSeconds,
  isRunning,
  summaryOpen,
  taskName,
  taskCategory,
  autoStartNext,
  categoryOptions,
  onTaskNameChange,
  onTaskCategoryChange,
  onAutoStartChange,
  onDraftDurationsChange,
  onStart,
  onPause,
  onStopAndLog,
  onResetAndLog,
  onApplyDurations
}: TimerPanelProps) {
  const modeLabel = mode === 'work' ? `Focus session • ${durations.workMinutes}m` : `Break session • ${durations.restMinutes}m`

  return (
    <section className="timer-panel">
      <div className="mode-pill">
        <span className={`dot ${mode}`} aria-hidden="true" />
        {modeLabel}
      </div>

      <div
        className="ring"
        style={{ '--progress': `${progressDeg}deg` } as CSSProperties}
        role="img"
        aria-label={`Remaining time ${formatTimer(remainingSeconds)}`}
      >
        <div className="ring-inner">
          <p className="label">Remaining</p>
          <p className="time">{formatTimer(remainingSeconds)}</p>
          <p className="hint">Elapsed {formatDuration(elapsedSeconds)}</p>
        </div>
      </div>

      <div className="controls">
        <button className="btn primary" onClick={onStart} disabled={isRunning || summaryOpen}>Invoke Loop</button>
        <button className="btn secondary" onClick={onPause} disabled={!isRunning || summaryOpen}>Stall Time</button>
        <button className="btn ghost-danger" onClick={onStopAndLog} disabled={summaryOpen}>Seal Chronicle</button>
        <button className="btn secondary" onClick={onResetAndLog} disabled={summaryOpen}>Rewind Ritual</button>
      </div>

      <div className="input-card">
        <h2>Current focus</h2>
        <div className="form-grid">
          <label>
            Task
            <input
              type="text"
              value={taskName}
              onChange={event => onTaskNameChange(event.target.value)}
              placeholder="e.g. Calculus chapter 5"
            />
          </label>
          <label>
            Category
            <input
              type="text"
              value={taskCategory}
              onChange={event => onTaskCategoryChange(event.target.value)}
              list="categories"
              placeholder="e.g. Math"
            />
          </label>
        </div>

        <label className="toggle-line">
          <input type="checkbox" checked={autoStartNext} onChange={event => onAutoStartChange(event.target.checked)} />
          Auto-cast the next cycle
        </label>

        <div className="timer-config">
          <label>
            Focus (min)
            <input
              type="number"
              min={1}
              max={180}
              value={draftDurations.workMinutes}
              onChange={event => onDraftDurationsChange({ ...draftDurations, workMinutes: Number(event.target.value) })}
            />
          </label>
          <label>
            Break (min)
            <input
              type="number"
              min={1}
              max={120}
              value={draftDurations.restMinutes}
              onChange={event => onDraftDurationsChange({ ...draftDurations, restMinutes: Number(event.target.value) })}
            />
          </label>
          <button className="btn secondary config-btn" onClick={onApplyDurations} disabled={isRunning || summaryOpen}>
            Bind New Runes
          </button>
        </div>

        <datalist id="categories">
          {categoryOptions.map(option => (
            <option key={option} value={option} />
          ))}
        </datalist>
      </div>
    </section>
  )
}
