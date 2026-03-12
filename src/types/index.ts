/**
 * ============================================
 * TYPES - Définitions des structures de données
 * ============================================
 * 
 * Ce fichier définit TOUS les types de données utilisés dans l'application.
 * C'est comme un "dictionnaire" qui dit à TypeScript quelles données on utilise.
 * 
 * Pourquoi ? Pour éviter les erreurs et avoir l'autocomplétion dans VS Code !
 */

// ============================================
// TYPES DE BASE
// ============================================

/**
 * Type représentant les 3 niveaux de difficulté du jeu
 * On utilise 'type' quand on a des valeurs fixes et connues
 */
export type DifficultyLevel = 'debutant' | 'intermediaire' | 'expert';

// ============================================
// STRUCTURE D'UNE SECTION DE COURS
// ============================================

/**
 * Interface = "contrat" qui définit ce qu'on attend dans une section de cours
 * Une section = une partie du cours (ex: "Les châteaux forts")
 */
export interface CourseSection {
  /** Identifiant unique de la section (pour React) */
  id: string;
  /** Titre affiché dans le sommaire */
  title: string;
  /** Contenu textuel complet de la section */
  content: string;
  /** URL d'une image optionnelle */
  image?: string;
}

// ============================================
// STRUCTURE D'UN COURS COMPLET
// ============================================

/**
 * Un cours = un niveau complet avec toutes ses sections
 * Ex: Le cours "Débutant" contient 5 sections
 */
export interface Course {
  /** Niveau de difficulté du cours */
  level: DifficultyLevel;
  /** Titre principal du cours */
  title: string;
  /** Description courte sous le titre */
  description: string;
  /** Liste des sections du cours */
  sections: CourseSection[];
  /** Temps estimé de lecture (en minutes) */
  estimatedTime: number;
}

// ============================================
// STRUCTURE D'UNE QUESTION
// ============================================

/**
 * Une question du quiz avec ses réponses possibles
 */
export interface Question {
  /** Numéro unique de la question */
  id: number;
  /** Texte de la question */
  question: string;
  /** Tableau des 4 réponses possibles */
  options: string[];
  /** Index de la bonne réponse (0=A, 1=B, 2=C, 3=D) */
  correctAnswer: number;
  /** Explication affichée après avoir répondu */
  explanation: string;
  /** Niveau de difficulté de la question */
  level: DifficultyLevel;
}

// ============================================
// RÉSULTAT D'UNE RÉPONSE
// ============================================

/**
 * Stocke le résultat d'une réponse à une question
 * Utilisé pour calculer le score et afficher les corrections
 */
export interface QuizResult {
  /** ID de la question répondue */
  questionId: number;
  /** Index de la réponse choisie (-1 si temps écoulé) */
  selectedAnswer: number;
  /** true si bonne réponse, false sinon */
  correct: boolean;
  /** Temps passé sur cette question (en secondes) */
  timeSpent: number;
}

// ============================================
// BADGE (RÉCOMPENSE)
// ============================================

/**
 * Un badge = récompense débloquée par l'utilisateur
 * Ex: "Score Parfait", "Diplômé", etc.
 */
export interface Badge {
  /** Identifiant unique du badge */
  id: string;
  /** Nom affiché du badge */
  name: string;
  /** Description de comment l'obtenir */
  description: string;
  /** Emoji ou icône du badge */
  icon: string;
  /** Date de déblocage */
  unlockedAt: Date;
}

// ============================================
// RÉSULTAT D'UN EXAMEN
// ============================================

/**
 * Stocke le résultat d'une série d'examen
 * L'examen final a 3 séries de 20 questions
 */
export interface ExamResult {
  /** Numéro de la série (1, 2 ou 3) */
  series: number;
  /** Score obtenu (nombre de bonnes réponses) */
  score: number;
  /** Nombre total de questions (20) */
  totalQuestions: number;
  /** Date de passage */
  completedAt: Date;
}

// ============================================
// PROGRESSION DE L'UTILISATEUR
// ============================================

/**
 * Stocke TOUTE la progression de l'utilisateur
 * C'est ce qui est sauvegardé dans le navigateur
 */
export interface UserProgress {
  /** Niveau actuellement sélectionné */
  currentLevel: DifficultyLevel | null;
  /** Liste des niveaux terminés */
  completedLevels: DifficultyLevel[];
  /** Total des points d'expérience */
  totalXP: number;
  /** Liste des badges débloqués */
  badges: Badge[];
  /** Résultats des quiz par niveau */
  quizResults: Record<DifficultyLevel, QuizResult[]>;
  /** Résultats des examens passés */
  examResults: ExamResult[];
}

// ============================================
// INFORMATIONS D'UN NIVEAU
// ============================================

/**
 * Métadonnées d'un niveau (affichage visuel)
 */
export interface LevelInfo {
  /** ID du niveau */
  id: DifficultyLevel;
  /** Nom affiché */
  name: string;
  /** Classe CSS pour la couleur du texte */
  color: string;
  /** Classe CSS pour la couleur de fond */
  bgColor: string;
  /** Emoji représentatif */
  icon: string;
  /** Description courte */
  description: string;
  /** XP nécessaire pour débloquer */
  requiredXP: number;
}

// ============================================
// DONNÉES CONSTANTES - LES 3 NIVEAUX
// ============================================

/**
 * Tableau contenant les informations des 3 niveaux
 * Utilisé pour afficher les cartes sur la page d'accueil
 */
export const LEVELS: LevelInfo[] = [
  {
    id: 'debutant',
    name: 'Débutant',
    color: 'text-green-600',        // Texte vert
    bgColor: 'bg-green-100',        // Fond vert clair
    icon: '🌱',                      // Emoji pousse
    description: 'Découvrez les bases du Moyen-Âge',
    requiredXP: 0,                  // Accessible dès le début
  },
  {
    id: 'intermediaire',
    name: 'Intermédiaire',
    color: 'text-blue-600',         // Texte bleu
    bgColor: 'bg-blue-100',         // Fond bleu clair
    icon: '📚',                      // Emoji livres
    description: 'Approfondissez vos connaissances',
    requiredXP: 200,                // Nécessite 200 XP
  },
  {
    id: 'expert',
    name: 'Expert',
    color: 'text-purple-600',       // Texte violet
    bgColor: 'bg-purple-100',       // Fond violet clair
    icon: '👑',                      // Emoji couronne
    description: 'Maîtrisez le Moyen-Âge comme un véritable historien',
    requiredXP: 500,                // Nécessite 500 XP
  },
];
