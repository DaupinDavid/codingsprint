"use client";
/**
 * ============================================
 * STORE - Gestion de l'état global (Zustand)
 * ============================================
 * 
 * Ce fichier gère TOUTES les données qui doivent être
 * partagées entre les différentes pages de l'application.
 * 
 * C'est comme une "base de données" en mémoire qui :
 * - Stocke la progression de l'utilisateur
 * - Gère les XP et les badges
 * - Sauvegarde automatiquement dans le navigateur
 * 
 * Technologie : Zustand (plus simple que Redux)
 */

import { create } from 'zustand';           // Fonction pour créer le store
import { persist } from 'zustand/middleware'; // Pour sauvegarder dans localStorage
import type { UserProgress, Badge, QuizResult, DifficultyLevel, ExamResult } from '@/types';

// ============================================
// INTERFACE DU STORE
// ============================================

/**
 * Définit toutes les données et fonctions disponibles dans le store
 */
interface GameState {
  // === DONNÉES ===
  /** La progression complète de l'utilisateur */
  progress: UserProgress;
  
  // === ACTIONS (fonctions pour modifier les données) ===
  /** Ajoute des points d'expérience */
  addXP: (amount: number) => void;
  /** Marque un niveau comme terminé */
  completeLevel: (level: DifficultyLevel) => void;
  /** Ajoute un badge à la collection */
  addBadge: (badge: Badge) => void;
  /** Sauvegarde les résultats d'un quiz */
  saveQuizResults: (level: DifficultyLevel, results: QuizResult[]) => void;
  /** Sauvegarde le résultat d'un examen */
  saveExamResults: (result: ExamResult) => void;
  /** Définit le niveau actuellement sélectionné */
  setCurrentLevel: (level: DifficultyLevel | null) => void;
  /** Réinitialise TOUTE la progression (attention !) */
  resetProgress: () => void;
  
  // === GETTERS (fonctions pour lire les données) ===
  /** Vérifie si un niveau est accessible */
  canAccessLevel: (level: DifficultyLevel) => boolean;
  /** Récupère le score d'un niveau */
  getLevelScore: (level: DifficultyLevel) => number;
  /** Compte le total de bonnes réponses */
  getTotalCorrectAnswers: () => number;
  /** Calcule la moyenne des examens */
  getExamAverage: () => number;
}

// ============================================
// ÉTAT INITIAL (valeurs par défaut)
// ============================================

/**
 * Quand l'utilisateur arrive pour la première fois,
 * sa progression est vide (aucun niveau complété, 0 XP, etc.)
 */
const initialProgress: UserProgress = {
  currentLevel: null,           // Aucun niveau sélectionné
  completedLevels: [],          // Aucun niveau terminé
  totalXP: 0,                   // 0 points d'expérience
  badges: [],                   // Aucun badge
  quizResults: {                // Résultats vides pour chaque niveau
    debutant: [],
    intermediaire: [],
    expert: []
  },
  examResults: []               // Aucun examen passé
};

// ============================================
// DÉFINITION DES BADGES
// ============================================

/**
 * Tous les badges disponibles dans le jeu.
 * Chaque badge a un ID unique, un nom, une description et une icône.
 */
export const AVAILABLE_BADGES = {
  /** Badge débloqué en terminant le niveau Débutant */
  DEBUTANT_COMPLETE: {
    id: 'debutant-complete',
    name: 'Apprenti Historien',
    description: 'Vous avez terminé le niveau Débutant !',
    icon: '🌱'
  },
  /** Badge débloqué en terminant le niveau Intermédiaire */
  INTERMEDIAIRE_COMPLETE: {
    id: 'intermediaire-complete',
    name: 'Érudit Médiéval',
    description: 'Vous avez terminé le niveau Intermédiaire !',
    icon: '📚'
  },
  /** Badge débloqué en terminant le niveau Expert */
  EXPERT_COMPLETE: {
    id: 'expert-complete',
    name: 'Maître du Moyen-Âge',
    description: 'Vous avez terminé le niveau Expert !',
    icon: '👑'
  },
  /** Badge débloqué en faisant un score parfait (20/20) */
  PERFECT_QUIZ: {
    id: 'perfect-quiz',
    name: 'Score Parfait',
    description: 'Vous avez obtenu 20/20 à un quiz !',
    icon: '⭐'
  },
  /** Badge débloqué en terminant un quiz très vite */
  SPEED_RUNNER: {
    id: 'speed-runner',
    name: 'Éclair',
    description: 'Vous avez terminé un quiz en moins de 10 minutes !',
    icon: '⚡'
  },
  /** Badge débloqué en terminant l'examen final */
  EXAM_COMPLETE: {
    id: 'exam-complete',
    name: 'Diplômé',
    description: 'Vous avez réussi l\'examen final !',
    icon: '🎓'
  },
  /** Badge débloqué en terminant tous les niveaux */
  ALL_LEVELS: {
    id: 'all-levels',
    name: 'Explorateur Complet',
    description: 'Vous avez terminé tous les niveaux !',
    icon: '🏆'
  }
};

// ============================================
// CRÉATION DU STORE
// ============================================

/**
 * Crée le store Zustand avec persistance dans localStorage.
 * 
 * La persistance signifie que les données sont sauvegardées
 * automatiquement dans le navigateur et restaurées au rechargement.
 */
export const useGameStore = create<GameState>()(
  persist(
    // Fonction qui définit l'état initial et les actions
    (set, get) => ({
      // État initial
      progress: initialProgress,

      // ============================================
      // ACTION : Ajouter des XP
      // ============================================
      addXP: (amount: number) => {
        set((state) => ({
          progress: {
            ...state.progress,                    // Garde toutes les autres données
            totalXP: state.progress.totalXP + amount  // Ajoute les nouveaux XP
          }
        }));
      },

      // ============================================
      // ACTION : Compléter un niveau
      // ============================================
      completeLevel: (level: DifficultyLevel) => {
        set((state) => {
          // Crée une nouvelle liste avec le niveau ajouté
          const newCompletedLevels = [...state.progress.completedLevels];
          if (!newCompletedLevels.includes(level)) {
            newCompletedLevels.push(level);
          }
          
          // Vérifie si tous les niveaux sont terminés
          const allLevelsCompleted = ['debutant', 'intermediaire', 'expert'].every(
            l => newCompletedLevels.includes(l as DifficultyLevel)
          );
          
          // Ajoute les badges correspondants automatiquement
          const newBadges = [...state.progress.badges];
          
          if (level === 'debutant' && !newBadges.find(b => b.id === AVAILABLE_BADGES.DEBUTANT_COMPLETE.id)) {
            newBadges.push({
              ...AVAILABLE_BADGES.DEBUTANT_COMPLETE,
              unlockedAt: new Date()  // Date actuelle
            });
          }
          
          if (level === 'intermediaire' && !newBadges.find(b => b.id === AVAILABLE_BADGES.INTERMEDIAIRE_COMPLETE.id)) {
            newBadges.push({
              ...AVAILABLE_BADGES.INTERMEDIAIRE_COMPLETE,
              unlockedAt: new Date()
            });
          }
          
          if (level === 'expert' && !newBadges.find(b => b.id === AVAILABLE_BADGES.EXPERT_COMPLETE.id)) {
            newBadges.push({
              ...AVAILABLE_BADGES.EXPERT_COMPLETE,
              unlockedAt: new Date()
            });
          }
          
          if (allLevelsCompleted && !newBadges.find(b => b.id === AVAILABLE_BADGES.ALL_LEVELS.id)) {
            newBadges.push({
              ...AVAILABLE_BADGES.ALL_LEVELS,
              unlockedAt: new Date()
            });
          }
          
          return {
            progress: {
              ...state.progress,
              completedLevels: newCompletedLevels,
              badges: newBadges
            }
          };
        });
      },

      // ============================================
      // ACTION : Ajouter un badge manuellement
      // ============================================
      addBadge: (badge: Badge) => {
        set((state) => {
          // Vérifie si le badge existe déjà (évite les doublons)
          if (state.progress.badges.find(b => b.id === badge.id)) {
            return state;  // Ne fait rien si déjà présent
          }
          return {
            progress: {
              ...state.progress,
              badges: [...state.progress.badges, badge]
            }
          };
        });
      },

      // ============================================
      // ACTION : Sauvegarder les résultats d'un quiz
      // ============================================
      saveQuizResults: (level: DifficultyLevel, results: QuizResult[]) => {
        set((state) => {
          // Calcule le nombre de bonnes réponses
          const correctAnswers = results.filter(r => r.correct).length;
          // Calcule le temps total passé
          const totalTime = results.reduce((sum, r) => sum + r.timeSpent, 0);
          
          // Ajoute des badges si conditions remplies
          const newBadges = [...state.progress.badges];
          
          // Badge score parfait (20/20)
          if (correctAnswers === 20 && !newBadges.find(b => b.id === AVAILABLE_BADGES.PERFECT_QUIZ.id)) {
            newBadges.push({
              ...AVAILABLE_BADGES.PERFECT_QUIZ,
              unlockedAt: new Date()
            });
          }
          
          // Badge speed runner (moins de 10 minutes = 600 secondes)
          if (totalTime < 600 && !newBadges.find(b => b.id === AVAILABLE_BADGES.SPEED_RUNNER.id)) {
            newBadges.push({
              ...AVAILABLE_BADGES.SPEED_RUNNER,
              unlockedAt: new Date()
            });
          }
          
          return {
            progress: {
              ...state.progress,
              quizResults: {
                ...state.progress.quizResults,
                [level]: results  // Sauvegarde les résultats pour ce niveau
              },
              badges: newBadges
            }
          };
        });
      },

      // ============================================
      // ACTION : Sauvegarder un résultat d'examen
      // ============================================
      saveExamResults: (result: ExamResult) => {
        set((state) => {
          const newExamResults = [...state.progress.examResults, result];
          const newBadges = [...state.progress.badges];
          
          // Badge examen complété après 3 séries
          if (newExamResults.length >= 3 && !newBadges.find(b => b.id === AVAILABLE_BADGES.EXAM_COMPLETE.id)) {
            newBadges.push({
              ...AVAILABLE_BADGES.EXAM_COMPLETE,
              unlockedAt: new Date()
            });
          }
          
          return {
            progress: {
              ...state.progress,
              examResults: newExamResults,
              badges: newBadges
            }
          };
        });
      },

      // ============================================
      // ACTION : Définir le niveau actuel
      // ============================================
      setCurrentLevel: (level: DifficultyLevel | null) => {
        set((state) => ({
          progress: {
            ...state.progress,
            currentLevel: level
          }
        }));
      },

      // ============================================
      // ACTION : Réinitialiser la progression
      // ============================================
      resetProgress: () => {
        set({ progress: initialProgress });
      },

      // ============================================
      // GETTER : Vérifier l'accès à un niveau
      // ============================================
      canAccessLevel: (level: DifficultyLevel) => {
        const { completedLevels } = get().progress;
        
        // Débutant : toujours accessible
        if (level === 'debutant') return true;
        // Intermédiaire : nécessite Débutant terminé
        if (level === 'intermediaire') return completedLevels.includes('debutant');
        // Expert : nécessite Intermédiaire terminé
        if (level === 'expert') return completedLevels.includes('intermediaire');
        return false;
      },

      // ============================================
      // GETTER : Récupérer le score d'un niveau
      // ============================================
      getLevelScore: (level: DifficultyLevel) => {
        const results = get().progress.quizResults[level];
        if (!results || results.length === 0) return 0;
        // Compte les réponses correctes
        return results.filter(r => r.correct).length;
      },

      // ============================================
      // GETTER : Total de bonnes réponses
      // ============================================
      getTotalCorrectAnswers: () => {
        const { quizResults } = get().progress;
        let total = 0;
        // Parcourt tous les niveaux et additionne les bonnes réponses
        Object.values(quizResults).forEach(results => {
          total += results.filter(r => r.correct).length;
        });
        return total;
      },

      // ============================================
      // GETTER : Moyenne des examens
      // ============================================
      getExamAverage: () => {
        const { examResults } = get().progress;
        if (examResults.length === 0) return 0;
        // Calcule la moyenne des scores
        const total = examResults.reduce((sum, r) => sum + r.score, 0);
        return Math.round((total / examResults.length) * 100) / 100;
      }
    }),
    {
      // Configuration de la persistance
      name: 'wikipedia-learn-storage',  // Nom dans localStorage
      partialize: (state) => ({ progress: state.progress })  // Ne sauvegarde que 'progress'
    }
  )
);
