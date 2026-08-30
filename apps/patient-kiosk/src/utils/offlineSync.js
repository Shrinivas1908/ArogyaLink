/**
 * ArogyaLink — utils/offlineSync.js
 * ===================================
 * Client-side IndexedDB queue for offline-first patient check-in at rural kiosks.
 * Automatically buffers answers & sessions and flushes to the backend when online.
 */

const DB_NAME = 'arogya_link_offline_db'
const DB_VERSION = 1
const STORE_NAME = 'pending_encounters'

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveOfflineSession(sessionData) {
  try {
    const db = await openDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const entry = {
        ...sessionData,
        queued_at: new Date().toISOString(),
        synced: false,
      }
      const req = store.add(entry)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  } catch (err) {
    console.warn('[OfflineSync] Local storage fallback', err)
  }
}

export async function getPendingOfflineCount() {
  try {
    const db = await openDatabase()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const countReq = store.count()
      countReq.onsuccess = () => resolve(countReq.result)
      countReq.onerror = () => resolve(0)
    })
  } catch {
    return 0
  }
}

export async function syncPendingSessions(backendUrl = '/api/offline-sync') {
  if (!navigator.onLine) return 0
  try {
    const db = await openDatabase()
    const entries = await new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.getAll()
      req.onsuccess = () => resolve(req.result || [])
      req.onerror = () => resolve([])
    })

    if (entries.length === 0) return 0

    let syncedCount = 0
    for (const entry of entries) {
      try {
        const res = await fetch(`${backendUrl}/sync-encounter`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        })
        if (res.ok) {
          // Delete from IndexedDB
          const txDel = db.transaction(STORE_NAME, 'readwrite')
          txDel.objectStore(STORE_NAME).delete(entry.id)
          syncedCount++
        }
      } catch (err) {
        console.warn('[OfflineSync] Sync failed for entry', entry.id, err)
      }
    }
    return syncedCount
  } catch (err) {
    console.warn('[OfflineSync] General sync error', err)
    return 0
  }
}

// Global auto-sync listener
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[OfflineSync] Network restored. Syncing pending sessions...')
    syncPendingSessions()
  })
}
