import { useCallback, useEffect, useState } from 'react'
import { addSession, getAllSessions, openSessionDb } from '../lib/sessionDb'
import type { SessionRecord } from '../types/session'

interface UseSessionStoreResult {
  dbReady: boolean
  sessions: SessionRecord[]
  saveSession: (session: SessionRecord) => Promise<void>
  refreshSessions: () => Promise<void>
}

export function useSessionStore(): UseSessionStoreResult {
  const [db, setDb] = useState<IDBDatabase | null>(null)
  const [sessions, setSessions] = useState<SessionRecord[]>([])

  const refreshSessions = useCallback(async () => {
    if (!db) return
    const rows = await getAllSessions(db)
    setSessions(rows)
  }, [db])

  const saveSession = useCallback(async (session: SessionRecord) => {
    if (!db) return
    await addSession(db, session)
    await refreshSessions()
  }, [db, refreshSessions])

  useEffect(() => {
    let active = true

    async function init() {
      try {
        const instance = await openSessionDb()
        if (!active) return
        setDb(instance)
        const rows = await getAllSessions(instance)
        if (!active) return
        setSessions(rows)
      } catch {
        if (!active) return
        setDb(null)
        setSessions([])
      }
    }

    void init()

    return () => {
      active = false
    }
  }, [])

  return {
    dbReady: db !== null,
    sessions,
    saveSession,
    refreshSessions
  }
}
