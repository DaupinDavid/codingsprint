import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Badges disponibles
export const AVAILABLE_BADGES = {
  DEBUTANT_COMPLETE: {
    id: 'debutant-complete',
    name: 'Apprenti Historien',
    description: 'Vous avez terminé le niveau Débutant !',
    icon: '🌱'
  },
  INTERMEDIAIRE_COMPLETE: {
    id: 'intermediaire-complete',
    name: 'Érudit Médiéval',
    description: 'Vous avez terminé le niveau Intermédiaire !',
    icon: '📚'
  },
  EXPERT_COMPLETE: {
    id: 'expert-complete',
    name: 'Maître du Moyen-Âge',
    description: 'Vous avez terminé le niveau Expert !',
    icon: '👑'
  },
  PERFECT_QUIZ: {
    id: 'perfect-quiz',
    name: 'Score Parfait',
    description: 'Vous avez obtenu 20/20 à un quiz !',
    icon: '⭐'
  },
  SPEED_RUNNER: {
    id: 'speed-runner',
    name: 'Éclair',
    description: 'Vous avez terminé un quiz en moins de 10 minutes !',
    icon: '⚡'
  },
  EXAM_COMPLETE: {
    id: 'exam-complete',
    name: 'Diplômé',
    description: "Vous avez réussi l'examen final !",
    icon: '🎓'
  },
  ALL_LEVELS: {
    id: 'all-levels',
    name: 'Explorateur Complet',
    description: 'Vous avez terminé tous les niveaux !',
    icon: '🏆'
  }
}

const initialProgress = {
  currentLevel: null,
  completedLevels: [],
  totalXP: 0,
  badges: [],
  quizResults: {
    debutant: [],
    intermediaire: [],
    expert: []
  },
  examResults: []
}

export const useGameStore = create(
  persist(
    (set, get) => ({
      progress: initialProgress,

      addXP: (amount) => {
        set((state) => ({
          progress: {
            ...state.progress,
            totalXP: state.progress.totalXP + amount
          }
        }))
      },

      completeLevel: (level) => {
        set((state) => {
          const newCompletedLevels = [...state.progress.completedLevels]
          if (!newCompletedLevels.includes(level)) {
            newCompletedLevels.push(level)
          }

          const allLevelsCompleted = ['debutant', 'intermediaire', 'expert'].every(
            l => newCompletedLevels.includes(l)
          )

          const newBadges = [...state.progress.badges]

          if (level === 'debutant' && !newBadges.find(b => b.id === AVAILABLE_BADGES.DEBUTANT_COMPLETE.id)) {
            newBadges.push({ ...AVAILABLE_BADGES.DEBUTANT_COMPLETE, unlockedAt: new Date() })
          }
          if (level === 'intermediaire' && !newBadges.find(b => b.id === AVAILABLE_BADGES.INTERMEDIAIRE_COMPLETE.id)) {
            newBadges.push({ ...AVAILABLE_BADGES.INTERMEDIAIRE_COMPLETE, unlockedAt: new Date() })
          }
          if (level === 'expert' && !newBadges.find(b => b.id === AVAILABLE_BADGES.EXPERT_COMPLETE.id)) {
            newBadges.push({ ...AVAILABLE_BADGES.EXPERT_COMPLETE, unlockedAt: new Date() })
          }
          if (allLevelsCompleted && !newBadges.find(b => b.id === AVAILABLE_BADGES.ALL_LEVELS.id)) {
            newBadges.push({ ...AVAILABLE_BADGES.ALL_LEVELS, unlockedAt: new Date() })
          }

          return {
            progress: {
              ...state.progress,
              completedLevels: newCompletedLevels,
              badges: newBadges
            }
          }
        })
      },

      addBadge: (badge) => {
        set((state) => {
          if (state.progress.badges.find(b => b.id === badge.id)) return state
          return {
            progress: {
              ...state.progress,
              badges: [...state.progress.badges, badge]
            }
          }
        })
      },

      saveQuizResults: (level, results) => {
        set((state) => {
          const correctAnswers = results.filter(r => r.correct).length
          const totalTime = results.reduce((sum, r) => sum + r.timeSpent, 0)
          const newBadges = [...state.progress.badges]

          if (correctAnswers === 20 && !newBadges.find(b => b.id === AVAILABLE_BADGES.PERFECT_QUIZ.id)) {
            newBadges.push({ ...AVAILABLE_BADGES.PERFECT_QUIZ, unlockedAt: new Date() })
          }
          if (totalTime < 600 && !newBadges.find(b => b.id === AVAILABLE_BADGES.SPEED_RUNNER.id)) {
            newBadges.push({ ...AVAILABLE_BADGES.SPEED_RUNNER, unlockedAt: new Date() })
          }

          return {
            progress: {
              ...state.progress,
              quizResults: {
                ...state.progress.quizResults,
                [level]: results
              },
              badges: newBadges
            }
          }
        })
      },

      saveExamResults: (result) => {
        set((state) => {
          const newExamResults = [...state.progress.examResults, result]
          const newBadges = [...state.progress.badges]

          if (newExamResults.length >= 3 && !newBadges.find(b => b.id === AVAILABLE_BADGES.EXAM_COMPLETE.id)) {
            newBadges.push({ ...AVAILABLE_BADGES.EXAM_COMPLETE, unlockedAt: new Date() })
          }

          return {
            progress: {
              ...state.progress,
              examResults: newExamResults,
              badges: newBadges
            }
          }
        })
      },

      setCurrentLevel: (level) => {
        set((state) => ({
          progress: { ...state.progress, currentLevel: level }
        }))
      },

      resetProgress: () => {
        set({ progress: initialProgress })
      },

      canAccessLevel: (level) => {
        const { completedLevels } = get().progress
        if (level === 'debutant') return true
        if (level === 'intermediaire') return completedLevels.includes('debutant')
        if (level === 'expert') return completedLevels.includes('intermediaire')
        return false
      },

      getLevelScore: (level) => {
        const results = get().progress.quizResults[level]
        if (!results || results.length === 0) return 0
        return results.filter(r => r.correct).length
      },

      getTotalCorrectAnswers: () => {
        const { quizResults } = get().progress
        let total = 0
        Object.values(quizResults).forEach(results => {
          total += results.filter(r => r.correct).length
        })
        return total
      },

      getExamAverage: () => {
        const { examResults } = get().progress
        if (examResults.length === 0) return 0
        const total = examResults.reduce((sum, r) => sum + r.score, 0)
        return Math.round((total / examResults.length) * 100) / 100
      }
    }),
    {
      name: 'wikipedia-learn-storage',
      partialize: (state) => ({ progress: state.progress })
    }
  )
)
