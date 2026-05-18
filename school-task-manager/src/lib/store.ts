'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Subject, Task, TimetableSlot, Period, Memo, AppData, AppEvent, LinkItem, QuickTodo, SlackChannel } from './types'
import { generateId } from './utils'
import type { Lang } from './i18n'

export interface IntegrationSettings {
  slackWebhookUrl: string
  slackNotifyDaysBefore: number   // 何日前に通知するか
  notificationsEnabled: boolean   // ブラウザ通知
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
  headerBanner: string
  setLanguage: (lang: Lang) => void
  setSidebarIcon: (url: string) => void
  setBgImage: (url: string) => void
  setBgImageMobile: (url: string) => void
  setBgPosition: (pos: string) => void
  setBgPositionMobile: (pos: string) => void
  setHeaderBanner: (url: string) => void

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
      headerBanner: '',
      setLanguage: (lang) => set({ language: lang }),
      setSidebarIcon: (url) => set({ sidebarIcon: url }),
      setBgImage: (url) => set({ bgImage: url }),
      setBgImageMobile: (url) => set({ bgImageMobile: url }),
      setBgPosition: (pos) => set({ bgPosition: pos }),
      setBgPositionMobile: (pos) => set({ bgPositionMobile: pos }),
      setHeaderBanner: (url) => set({ headerBanner: url }),

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
