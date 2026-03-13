/**
 * ============================================
 * TYPES - Définitions des structures de données
 * ============================================
 */

// ============================================
// TYPES DE BASE
// ============================================

export type DifficultyLevel = "debutant" | "intermediaire" | "expert";

// ============================================
// STRUCTURE D'UNE SECTION DE COURS
// ============================================

export interface CourseSection {
  id: string;
  title: string;
  content: string;
  image?: string;
}

// ============================================
// STRUCTURE D'UN COURS COMPLET
// ============================================

export interface Course {
  level: DifficultyLevel;
  title: string;
  description: string;
  sections: CourseSection[];
  estimatedTime: number;
}

// ============================================
// STRUCTURE D'UNE QUESTION
// ============================================

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  level: DifficultyLevel;
}

// ============================================
// RÉSULTAT D'UNE RÉPONSE
// ============================================

export interface QuizResult {
  questionId: number;
  selectedAnswer: number;
  correct: boolean;
  timeSpent: number;
}

// ============================================
// BADGE (RÉCOMPENSE)
// ============================================

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
}

// ============================================
// RÉSULTAT D'UN EXAMEN
// ============================================

export interface ExamResult {
  series: number;
  score: number;
  totalQuestions: number;
  completedAt: Date;
}

// ============================================
// PROGRESSION DE L'UTILISATEUR
// ============================================

export interface UserProgress {
  currentLevel: DifficultyLevel | null;
  completedLevels: DifficultyLevel[];
  totalXP: number;
  badges: Badge[];
  quizResults: Record<DifficultyLevel, QuizResult[]>;
  examResults: ExamResult[];
}

// ============================================
// INFORMATIONS D'UN NIVEAU
// ============================================

export interface LevelInfo {
  id: DifficultyLevel;
  name: string;
  color: string;
  bgColor: string;
  icon: string;
  description: string;
  requiredXP: number;
}
