export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  role: 'user' | 'admin'
  createdAt?: string
  updatedAt?: string
}

export interface UserProgress {
  userId: string
  totalExercisesCompleted: number
  totalExercisesAttempted: number
  averageScore: number
  streakDays: number
  longestStreak: number
  constructionsLearned: string[]
  bookmarks: string[]
}

export interface UserSettings {
  userId: string
  dailyGoal: number
  notifications: boolean
  theme: 'light' | 'dark' | 'system'
  fontSize: 'small' | 'medium' | 'large'
}
