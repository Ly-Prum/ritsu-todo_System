'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Subject, Task, TimetableSlot, Period, Memo, AppData, AppEvent, LinkItem, QuickTodo, SlackChannel } from './types'
import { generateId } from './utils'
import type { Lang } from './i18n'

export type ThemeColor = 'emerald' | 'sky' | 'purple' | 'amber' | 'indigo' | 'teal' | 'orange' | 'mono' | 'white'
export type ThemeMode = 'dark' | 'light'

export const THEME_COLORS: Record<ThemeColor, { label: string; primary: string; primaryLight: string; secondary: string; secondaryLight: string; category: string }> = {
  emerald: { label: 'エメラルド',   primary: '#10b981', primaryLight: '#34d399', secondary: '#0ea5e9', secondaryLight: '#38bdf8', category: '単色' },
  sky:     { label: 'スカイブルー', primary: '#0ea5e9', primaryLight: '#38bdf8', secondary: '#8b5cf6', secondaryLight: '#a78bfa', category: '単色' },
  purple:  { label: 'パープル',     primary: '#8b5cf6', primaryLight: '#a78bfa', secondary: '#ec4899', secondaryLight: '#f472b6', category: '単色' },
  amber:   { label: 'アンバー',     primary: '#f59e0b', primaryLight: '#fbbf24', secondary: '#10b981', secondaryLight: '#34d399', category: '単色' },
  indigo:  { label: 'インディゴ',   primary: '#6366f1', primaryLight: '#818cf8', secondary: '#06b6d4', secondaryLight: '#22d3ee', category: '単色' },
  teal:    { label: 'ティール',     primary: '#14b8a6', primaryLight: '#2dd4bf', secondary: '#0ea5e9', secondaryLight: '#38bdf8', category: '単色' },
  orange:  { label: 'オレンジ',     primary: '#f97316', primaryLight: '#fb923c', secondary: '#f59e0b', secondaryLight: '#fbbf24', category: '単色' },
  mono:    { label: 'モノトーン',   primary: '#6b7280', primaryLight: '#9ca3af', secondary: '#9ca3af', secondaryLight: '#d1d5db', category: 'モノ・ホワイト' },
  white:   { label: 'ホワイト',     primary: '#64748b', primaryLight: '#e2e8f0', secondary: '#475569', secondaryLight: '#f1f5f9', category: 'モノ・ホワイト' },
}

export interface IntegrationSettings {
  slackWebhookUrl: string
  slackNotifyDaysBefore: number
  notificationsEnabled: boolean
  dashAlertEnabled: boolean
  dashAlertDays: number
  themeColor: ThemeColor
  themeMode: ThemeMode
}

interface AppStore extends AppData {
  integrations: IntegrationSettings
  freeNote: string
  language: Lang
  sidebarIcon: string
  bgImage: string
  bgImageMobile: string
  bgPosition: string
  bgPositionMobile: string
  bgX: number
  bgY: number
  bgZoom: number
  headerBanner: string
  headerBannerY: number
  headerBannerHeight: number
  headerBannerZoom: number
  setLanguage: (lang: Lang) => void
  setSidebarIcon: (url: string) => void
  setBgImage: (url: string) => void
  setBgImageMobile: (url: string) => void
  setBgPosition: (pos: string) => void
  setBgPositionMobile: (pos: string) => void
  setBgX: (x: number) => void
  setBgY: (y: number) => void
  setBgZoom: (z: number) => void
  setHeaderBanner: (url: string) => void
  setHeaderBannerY: (y: number) => void
  setHeaderBannerHeight: (h: number) => void
  setHeaderBannerZoom: (z: number) => void

  // Subjects
  addSubject: (subject: Omit<Subject, 'id'>) => void
  updateSubject: (id: string, updates: Partial<Subject>) => void
  deleteSubject: (id: string) => void

  // Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void

  // Timetable
  addSlot: (slot: Omit<TimetableSlot, 'id'>) => void
  updateSlot: (id: string, updates: Partial<TimetableSlot>) => void
  deleteSlot: (id: string) => void
  updatePeriods: (periods: Period[]) => void

  // Memos
  addMemo: (memo: Omit<Memo, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateMemo: (id: string, updates: Partial<Memo>) => void
  deleteMemo: (id: string) => void

  // Events
  addEvent: (event: Omit<AppEvent, 'id' | 'createdAt'>) => void
  updateEvent: (id: string, updates: Partial<AppEvent>) => void
  deleteEvent: (id: string) => void

  // Links
  addLink: (link: Omit<LinkItem, 'id'>) => void
  updateLink: (id: string, updates: Partial<LinkItem>) => void
  deleteLink: (id: string) => void
  clearLinks: () => void

  // QuickTodos
  addQuickTodo: (text: string) => void
  updateQuickTodo: (id: string, updates: Partial<QuickTodo>) => void
  deleteQuickTodo: (id: string) => void

  // SlackChannels
  addSlackChannel: (channel: Omit<SlackChannel, 'id'>) => void
  updateSlackChannel: (id: string, updates: Partial<SlackChannel>) => void
  deleteSlackChannel: (id: string) => void

  // Integrations
  updateIntegrations: (settings: Partial<IntegrationSettings>) => void

  // FreeNote
  updateFreeNote: (note: string) => void

  // Import/Export
  exportData: () => AppData
  importData: (data: AppData) => void
  resetData: () => void
}

const defaultPeriods: Period[] = [
  { period: 1, startTime: '08:30', endTime: '09:20' },
  { period: 2, startTime: '09:30', endTime: '10:20' },
  { period: 3, startTime: '10:30', endTime: '11:20' },
  { period: 4, startTime: '11:30', endTime: '12:20' },
  { period: 5, startTime: '13:10', endTime: '14:00' },
  { period: 6, startTime: '14:10', endTime: '15:00' },
  { period: 7, startTime: '15:10', endTime: '16:00' },
]

const defaultIntegrations: IntegrationSettings = {
  slackWebhookUrl: '',
  slackNotifyDaysBefore: 1,
  notificationsEnabled: true,
  dashAlertEnabled: true,
  dashAlertDays: 7,
  themeColor: 'emerald',
  themeMode: 'dark',
}

const now = () => new Date().toISOString()

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      subjects: [],
      tasks: [],
      timetable: [],
      periods: defaultPeriods,
      memos: [],
      events: [],
      links: [],
      quickTodos: [],
      slackChannels: [],
      integrations: defaultIntegrations,
      freeNote: '',
      language: 'ja' as Lang,
      sidebarIcon: '',
      bgImage: '',
      bgImageMobile: '',
      bgPosition: 'center',
      bgPositionMobile: 'center',
      bgX: 50,
      bgY: 50,
      bgZoom: 1,
      headerBanner: '',
      headerBannerY: 50,
      headerBannerHeight: 260,
      headerBannerZoom: 1,
      setLanguage: (lang) => set({ language: lang }),
      setSidebarIcon: (url) => set({ sidebarIcon: url }),
      setBgImage: (url) => set({ bgImage: url }),
      setBgImageMobile: (url) => set({ bgImageMobile: url }),
      setBgPosition: (pos) => set({ bgPosition: pos }),
      setBgPositionMobile: (pos) => set({ bgPositionMobile: pos }),
      setBgX: (x) => set({ bgX: x }),
      setBgY: (y) => set({ bgY: y }),
      setBgZoom: (z) => set({ bgZoom: z }),
      setHeaderBanner: (url) => set({ headerBanner: url }),
      setHeaderBannerY: (y) => set({ headerBannerY: y }),
      setHeaderBannerHeight: (h) => set({ headerBannerHeight: h }),
      setHeaderBannerZoom: (z) => set({ headerBannerZoom: z }),

      addSubject: (subject) => set((s) => ({ subjects: [...s.subjects, { ...subject, id: generateId() }] })),
      updateSubject: (id, updates) => set((s) => ({ subjects: s.subjects.map((x) => x.id === id ? { ...x, ...updates } : x) })),
      deleteSubject: (id) => set((s) => ({ subjects: s.subjects.filter((x) => x.id !== id) })),

      addTask: (task) => set((s) => ({ tasks: [...s.tasks, { ...task, id: generateId(), createdAt: now(), updatedAt: now() }] })),
      updateTask: (id, updates) => set((s) => ({ tasks: s.tasks.map((x) => x.id === id ? { ...x, ...updates, updatedAt: now() } : x) })),
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((x) => x.id !== id) })),

      addSlot: (slot) => set((s) => ({ timetable: [...s.timetable, { ...slot, id: generateId() }] })),
      updateSlot: (id, updates) => set((s) => ({ timetable: s.timetable.map((x) => x.id === id ? { ...x, ...updates } : x) })),
      deleteSlot: (id) => set((s) => ({ timetable: s.timetable.filter((x) => x.id !== id) })),
      updatePeriods: (periods) => set({ periods }),

      addMemo: (memo) => set((s) => ({ memos: [...s.memos, { ...memo, id: generateId(), createdAt: now(), updatedAt: now() }] })),
      updateMemo: (id, updates) => set((s) => ({ memos: s.memos.map((x) => x.id === id ? { ...x, ...updates, updatedAt: now() } : x) })),
      deleteMemo: (id) => set((s) => ({ memos: s.memos.filter((x) => x.id !== id) })),

      addEvent: (event) => set((s) => ({ events: [...s.events, { ...event, id: generateId(), createdAt: now() }] })),
      updateEvent: (id, updates) => set((s) => ({ events: s.events.map((x) => x.id === id ? { ...x, ...updates } : x) })),
      deleteEvent: (id) => set((s) => ({ events: s.events.filter((x) => x.id !== id) })),

      addLink: (link) => set((s) => ({ links: [...s.links, { ...link, id: generateId() }] })),
      updateLink: (id, updates) => set((s) => ({ links: s.links.map((x) => x.id === id ? { ...x, ...updates } : x) })),
      deleteLink: (id) => set((s) => ({ links: s.links.filter((x) => x.id !== id) })),
      clearLinks: () => set({ links: [] }),

      addQuickTodo: (text) => set((s) => ({ quickTodos: [...s.quickTodos, { id: generateId(), text, completed: false, createdAt: now() }] })),
      updateQuickTodo: (id, updates) => set((s) => ({ quickTodos: s.quickTodos.map((x) => x.id === id ? { ...x, ...updates } : x) })),
      deleteQuickTodo: (id) => set((s) => ({ quickTodos: s.quickTodos.filter((x) => x.id !== id) })),

      addSlackChannel: (channel) => set((s) => ({ slackChannels: [...s.slackChannels, { ...channel, id: generateId() }] })),
      updateSlackChannel: (id, updates) => set((s) => ({ slackChannels: s.slackChannels.map((x) => x.id === id ? { ...x, ...updates } : x) })),
      deleteSlackChannel: (id) => set((s) => ({ slackChannels: s.slackChannels.filter((x) => x.id !== id) })),

      updateIntegrations: (settings) => set((s) => ({ integrations: { ...s.integrations, ...settings } })),

      updateFreeNote: (note) => set({ freeNote: note }),

      exportData: () => {
        const { subjects, tasks, timetable, periods, memos, events, links, quickTodos, slackChannels } = get()
        return { subjects, tasks, timetable, periods, memos, events, links, quickTodos, slackChannels }
      },
      importData: (data) => set({
        subjects: data.subjects ?? [],
        tasks: data.tasks ?? [],
        timetable: data.timetable ?? [],
        periods: data.periods ?? defaultPeriods,
        memos: data.memos ?? [],
        events: data.events ?? [],
        links: data.links ?? [],
        quickTodos: data.quickTodos ?? [],
        slackChannels: data.slackChannels ?? [],
      }),
      resetData: () => set({
        subjects: [], tasks: [], timetable: [], periods: defaultPeriods, memos: [],
        events: [], links: [], quickTodos: [], slackChannels: [],
      }),
    }),
    { name: 'school-task-manager' }
  )
)
