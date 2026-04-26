import { formatDuration } from '../lib/time'
import type { SummaryDraft, SummaryReason } from '../types/session'

interface SummaryModalProps {
  summary: SummaryDraft
  onTaskChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onNotesChange: (value: string) => void
  onSkip: () => void
  onSave: () => void
}

function describeSummaryReason(reason?: SummaryReason): string {
  if (reason === 'timer-complete') return 'Session complete. Add context for your records.'
  if (reason === 'manual-stop') return 'Timer stopped. Log your progress before reset.'
  if (reason === 'manual-reset') return 'Timer reset. Save what you completed.'
  if (reason === 'restore-pending') return 'Recovered after app close. Save this interrupted session.'
  return 'Save this session to your local timeline.'
}

export function SummaryModal({ summary, onTaskChange, onCategoryChange, onNotesChange, onSkip, onSave }: SummaryModalProps) {
  if (!summary.open) return null

  return (
    <div className="modal-backdrop" onClick={onSkip}>
      <div className="modal" onClick={event => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Session summary">
        <h3>Session summary</h3>
        <p className="modal-subtitle">{describeSummaryReason(summary.context?.reason)}</p>
        <p className="duration-chip">Tracked time: {formatDuration(summary.context?.durationSeconds ?? 0)}</p>

        <label>
          Task
          <input type="text" value={summary.task} onChange={event => onTaskChange(event.target.value)} placeholder="What did you finish?" />
        </label>

        <label>
          Category
          <input
            type="text"
            value={summary.category}
            onChange={event => onCategoryChange(event.target.value)}
            list="categories"
            placeholder="Select or type category"
          />
        </label>

        <label>
          Notes
          <textarea value={summary.notes} onChange={event => onNotesChange(event.target.value)} placeholder="Optional notes" />
        </label>

        <div className="modal-actions">
          <button className="btn secondary" onClick={onSkip}>Dismiss Echo</button>
          <button className="btn primary" onClick={onSave}>Inscribe Chronicle</button>
        </div>
      </div>
    </div>
  )
}
