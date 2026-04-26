import { formatDuration } from '../lib/time'
import type { SessionRecord } from '../types/session'

interface InsightsPanelProps {
  sessionsCompleted: number
  todaySeconds: number
  weekSeconds: number
  streakDays: number
  topCategories: Array<[string, number]>
  historyDate: string
  historyItems: SessionRecord[]
  onHistoryDateChange: (value: string) => void
}

export function InsightsPanel({
  sessionsCompleted,
  todaySeconds,
  weekSeconds,
  streakDays,
  topCategories,
  historyDate,
  historyItems,
  onHistoryDateChange
}: InsightsPanelProps) {
  return (
    <section className="insights-panel">
      <div className="metric-grid">
        <article className="metric-card">
          <p className="metric-label">Today</p>
          <p className="metric-value">{formatDuration(todaySeconds)}</p>
        </article>
        <article className="metric-card">
          <p className="metric-label">Last 7 Days</p>
          <p className="metric-value">{formatDuration(weekSeconds)}</p>
        </article>
        <article className="metric-card">
          <p className="metric-label">Completed Sessions</p>
          <p className="metric-value">{sessionsCompleted}</p>
        </article>
        <article className="metric-card">
          <p className="metric-label">Streak</p>
          <p className="metric-value">{streakDays}d</p>
        </article>
      </div>

      <div className="section-block">
        <h2>Category breakdown</h2>
        {topCategories.length === 0 ? (
          <p className="empty">No saved sessions yet.</p>
        ) : (
          <ul className="category-list">
            {topCategories.map(([name, seconds]) => {
              const max = topCategories[0][1] || 1
              const width = Math.round((seconds / max) * 100)
              return (
                <li key={name}>
                  <div className="category-header">
                    <span>{name}</span>
                    <strong>{formatDuration(seconds)}</strong>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${width}%` }} />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="section-block">
        <div className="history-head">
          <h2>History by date</h2>
          <input type="date" value={historyDate} onChange={event => onHistoryDateChange(event.target.value)} />
        </div>
        {historyItems.length === 0 ? (
          <p className="empty">No records for this date.</p>
        ) : (
          <ul className="history-list">
            {historyItems.map(item => (
              <li key={item.id} className="history-item">
                <div className="history-top">
                  <span>{new Date(item.endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className={`state ${item.status}`}>{item.status}</span>
                </div>
                <p className="history-task">{item.task}</p>
                <p className="history-meta">
                  {item.category} • {formatDuration(item.durationSeconds)} • {item.mode.toUpperCase()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
