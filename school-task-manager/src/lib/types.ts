export type Priority = 'low' | 'medium' | 'high'
export type TaskStatus = 'pending' | 'in-progress' | 'completed'
export type TaskType = 'homework' | 'exam' | 'project' | 'report' | 'other'
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface Subject {
  id: string
  name: string
  color: string
  teacher?: string
  room?: string
  credits?: number
  totalReports?: number
  submittedReports?: number
  totalMonthlyReports?: number
  submittedMonthlyReports?: number
  totalSessions?: number
  attendedSessions?: number
  registeredSessions?: number
  hasExam?: boolean
}

export interface Task {
  id: string
  title: string
  description?: string
  subjectId?: string
  dueDate?: string
  priority: Priority
  status: TaskStatus
  type: TaskType
  estimatedMinutes?: number
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface TimetableSlot {
  id: string
  subjectId: string
  dayOfWeek: DayOfWeek
  period: number
  room?: string
  credits?: number
}

export interface Period {
  period: number
  startTime: string
  endTime: string
}

export interface Memo {
  id: string
  title: string
  content: string
  category?: string
  isPinned: boolean
  color: string
  createdAt: string
  updatedAt: string
}

export interface AppEvent {
  id: string
  title: string
  description?: string
  date: string        // ISO YYYY-MM-DD
  endDate?: string
  startTime?: string  // HH:MM
  endTime?: string    // HH:MM
  type: 'schooling' | 'exam' | 'event' | 'meeting' | 'club' | 'other'
  location?: string
  linkedMemoId?: string
  alarmMinutesBefore?: number  // 0=当日, 60=1時間前, 1440=1日前
  color: string
  createdAt: string
}

export interface LinkItem {
  id: string
  title: string
  url: string
  icon: string        // emoji character e.g. "💬"
  iconImage?: string  // base64 data URL for custom image icon
  category: string
  description?: string
  color: string
}

export interface QuickTodo {
  id: string
  text: string
  completed: boolean
  createdAt: string
}

export interface SlackChannel {
  id: string
  name: string         // display name e.g. "部活動"
  webhookUrl: string
}

export interface AppData {
  subjects: Subject[]
  tasks: Task[]
  timetable: TimetableSlot[]
  periods: Period[]
  memos: Memo[]
  events: AppEvent[]
  links: LinkItem[]
  quickTodos: QuickTodo[]
  slackChannels: SlackChannel[]
}
