import { doc, updateDoc, getDoc, arrayUnion, increment } from 'firebase/firestore'

export interface ModuleProgress {
  xp: number
  quizDone: boolean
  graphUsed: boolean
  exampleRead: boolean
  lastVisited: string
}

interface AppProgress {
  modules: Record<string, ModuleProgress>
  streak: number
  streakDate: string
  dailyXp: number[] // last 56 values (8 weeks × 7 days), index 0 = oldest
}

const KEY = 'oyutech_progress'
const DEFAULT_MOD: ModuleProgress = { xp: 0, quizDone: false, graphUsed: false, exampleRead: false, lastVisited: '' }

function empty(): AppProgress {
  return { modules: {}, streak: 0, streakDate: '', dailyXp: Array(56).fill(0) }
}

function load(): AppProgress {
  if (typeof window === 'undefined') return empty()
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return empty()
    const p = JSON.parse(raw) as AppProgress
    if (!p.dailyXp || p.dailyXp.length !== 56) p.dailyXp = Array(56).fill(0)
    return p
  } catch {
    return empty()
  }
}

function save(data: AppProgress) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(data))
}

function updateStreak(data: AppProgress) {
  const today = new Date().toISOString().slice(0, 10)
  if (data.streakDate === today) return
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  data.streak = data.streakDate === yesterday ? data.streak + 1 : 1
  data.streakDate = today
}

function getFirebaseInstances() {
  try {
    // Dynamic import to avoid SSR issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { auth, db } = require('./firebase')
    return { auth, db }
  } catch {
    return null
  }
}

export function getProgress(): AppProgress {
  return load()
}

export function updateProgress(moduleId: string, updates: Partial<ModuleProgress>) {
  const data = load()
  data.modules[moduleId] = { ...(data.modules[moduleId] ?? DEFAULT_MOD), ...updates, lastVisited: new Date().toISOString() }
  updateStreak(data)
  save(data)
}

export function addXp(moduleId: string, amount: number) {
  const data = load()
  const mod = data.modules[moduleId] ?? { ...DEFAULT_MOD }
  mod.xp += amount
  mod.lastVisited = new Date().toISOString()
  data.modules[moduleId] = mod
  data.dailyXp[55] = (data.dailyXp[55] ?? 0) + amount
  updateStreak(data)
  save(data)

  // Sync to Firestore if logged in
  const instances = getFirebaseInstances()
  if (instances && typeof window !== 'undefined') {
    const { auth, db } = instances
    const user = auth.currentUser
    if (user) {
      updateDoc(doc(db, 'users', user.uid), { totalXP: increment(amount) }).catch(() => {})
    }
  }
}

export function markLessonComplete(lessonId: string) {
  const instances = getFirebaseInstances()
  if (instances && typeof window !== 'undefined') {
    const { auth, db } = instances
    const user = auth.currentUser
    if (user) {
      updateDoc(doc(db, 'users', user.uid), { completedLessons: arrayUnion(lessonId) }).catch(() => {})
    }
  }
}

export function getTotalXP(): number {
  return Object.values(load().modules).reduce((s, m) => s + m.xp, 0)
}

export function getStreak(): number {
  return load().streak
}

export async function syncStreakFromFirestore(): Promise<number> {
  const instances = getFirebaseInstances()
  if (!instances || typeof window === 'undefined') return getStreak()
  const { auth, db } = instances
  const user = auth.currentUser
  if (!user) return getStreak()

  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  try {
    const snap = await getDoc(doc(db, 'users', user.uid))
    if (!snap.exists()) return getStreak()
    const data = snap.data()
    const lastSeen: string = data.lastSeen ?? ''
    let streak: number = data.streak ?? 0

    if (lastSeen === today) {
      return streak
    } else if (lastSeen === yesterday) {
      streak = streak + 1
      await updateDoc(doc(db, 'users', user.uid), { streak, lastSeen: today })
    } else {
      streak = 1
      await updateDoc(doc(db, 'users', user.uid), { streak, lastSeen: today })
    }
    return streak
  } catch {
    return getStreak()
  }
}

export function getWeeklyXp(): number[] {
  return load().dailyXp.slice(49)
}

export function getHeatmapXp(): number[] {
  return load().dailyXp
}

export function getModuleProgress(id: string): ModuleProgress {
  return load().modules[id] ?? { ...DEFAULT_MOD }
}
