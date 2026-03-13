// ================================================================
// store.js — LA MÉMOIRE DU JEU
// ================================================================
// Ce fichier stocke toutes les données du joueur :
// - Son niveau actuel
// - Les niveaux qu'il a terminés
// - Son total d'XP
// - Ses badges
// - Ses résultats de quiz et d'examen
//
// Ces données sont SAUVEGARDÉES dans le navigateur (localStorage),
// ce qui veut dire qu'elles restent même après avoir fermé la page.
//
// Comment modifier :
//   - Ajouter un badge → créez une entrée dans BADGES_DISPONIBLES
//   - Changer les XP gagnés → modifiez dans Quiz.jsx / Examen.jsx
//   - Changer les conditions de passage → modifiez peutAccederNiveau
// ================================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ----------------------------------------------------------------
// LISTE DES BADGES
// Chaque badge a un id unique, un nom, une description et une icône
// ----------------------------------------------------------------
export const BADGES_DISPONIBLES = {
  NIVEAU_DEBUTANT: {
    id: 'debutant-complete',
    nom: 'Apprenti Historien',
    description: 'Vous avez terminé le niveau Débutant !',
    icone: '🌱'
  },
  NIVEAU_INTERMEDIAIRE: {
    id: 'intermediaire-complete',
    nom: 'Érudit Médiéval',
    description: 'Vous avez terminé le niveau Intermédiaire !',
    icone: '📚'
  },
  NIVEAU_EXPERT: {
    id: 'expert-complete',
    nom: 'Maître du Moyen-Âge',
    description: 'Vous avez terminé le niveau Expert !',
    icone: '👑'
  },
  SCORE_PARFAIT: {
    id: 'score-parfait',
    nom: 'Score Parfait',
    description: 'Vous avez obtenu 20/20 à un quiz !',
    icone: '⭐'
  },
  RAPIDITE: {
    id: 'rapidite',
    nom: 'Éclair',
    description: 'Vous avez terminé un quiz en moins de 10 minutes !',
    icone: '⚡'
  },
  EXAMEN_REUSSI: {
    id: 'examen-reussi',
    nom: 'Diplômé',
    description: "Vous avez réussi l'examen final !",
    icone: '🎓'
  },
  TOUS_NIVEAUX: {
    id: 'tous-niveaux',
    nom: 'Explorateur Complet',
    description: 'Vous avez terminé tous les niveaux !',
    icone: '🏆'
  }
}

// ----------------------------------------------------------------
// PROGRESSION VIDE (état de départ)
// C'est ce qui s'affiche quand le joueur commence pour la première fois
// ----------------------------------------------------------------
const progressionDeDepart = {
  niveauActuel: null,
  niveauxTermines: [],        // Ex : ['debutant', 'intermediaire']
  totalXP: 0,
  badges: [],
  resultatsQuiz: {            // Résultats pour chaque niveau
    debutant: [],
    intermediaire: [],
    expert: []
  },
  resultatsExamen: []
}

// ----------------------------------------------------------------
// CRÉATION DU STORE
// "create" crée le store, "persist" le sauvegarde dans le navigateur
// ----------------------------------------------------------------
export const useStore = create(
  persist(
    (set, get) => ({

      // La progression du joueur (initialement vide)
      progression: progressionDeDepart,

      // --------------------------------------------------------
      // AJOUTER DES XP
      // Appelée après chaque quiz ou examen réussi
      // --------------------------------------------------------
      ajouterXP: (montant) => {
        set((etat) => ({
          progression: {
            ...etat.progression,
            totalXP: etat.progression.totalXP + montant
          }
        }))
      },

      // --------------------------------------------------------
      // TERMINER UN NIVEAU
      // Appelée quand le joueur réussit un quiz (score >= 12/20)
      // Débloque automatiquement des badges si nécessaire
      // --------------------------------------------------------
      terminerNiveau: (niveau) => {
        set((etat) => {
          // On copie la liste des niveaux terminés
          const niveauxTermines = [...etat.progression.niveauxTermines]

          // On ajoute le niveau seulement s'il n'est pas déjà là
          if (!niveauxTermines.includes(niveau)) {
            niveauxTermines.push(niveau)
          }

          // Vérifie si TOUS les niveaux sont terminés
          const tousTermines = ['debutant', 'intermediaire', 'expert']
            .every(n => niveauxTermines.includes(n))

          // On copie la liste des badges
          const badges = [...etat.progression.badges]

          // On débloque le badge correspondant au niveau
          if (niveau === 'debutant' && !badges.find(b => b.id === BADGES_DISPONIBLES.NIVEAU_DEBUTANT.id)) {
            badges.push({ ...BADGES_DISPONIBLES.NIVEAU_DEBUTANT, debloqueA: new Date() })
          }
          if (niveau === 'intermediaire' && !badges.find(b => b.id === BADGES_DISPONIBLES.NIVEAU_INTERMEDIAIRE.id)) {
            badges.push({ ...BADGES_DISPONIBLES.NIVEAU_INTERMEDIAIRE, debloqueA: new Date() })
          }
          if (niveau === 'expert' && !badges.find(b => b.id === BADGES_DISPONIBLES.NIVEAU_EXPERT.id)) {
            badges.push({ ...BADGES_DISPONIBLES.NIVEAU_EXPERT, debloqueA: new Date() })
          }

          // Si tous les niveaux sont terminés → badge spécial
          if (tousTermines && !badges.find(b => b.id === BADGES_DISPONIBLES.TOUS_NIVEAUX.id)) {
            badges.push({ ...BADGES_DISPONIBLES.TOUS_NIVEAUX, debloqueA: new Date() })
          }

          return {
            progression: {
              ...etat.progression,
              niveauxTermines,
              badges
            }
          }
        })
      },

      // --------------------------------------------------------
      // AJOUTER UN BADGE MANUELLEMENT
      // Appelée pour des badges spéciaux (score parfait, rapidité…)
      // --------------------------------------------------------
      ajouterBadge: (badge) => {
        set((etat) => {
          // Si le badge existe déjà, on ne l'ajoute pas deux fois
          if (etat.progression.badges.find(b => b.id === badge.id)) return etat
          return {
            progression: {
              ...etat.progression,
              badges: [...etat.progression.badges, badge]
            }
          }
        })
      },

      // --------------------------------------------------------
      // SAUVEGARDER LES RÉSULTATS D'UN QUIZ
      // Appelée à la fin du quiz pour garder l'historique
      // --------------------------------------------------------
      sauvegarderResultatsQuiz: (niveau, resultats) => {
        set((etat) => {
          const nbBonnes = resultats.filter(r => r.correct).length
          const tempsTotal = resultats.reduce((total, r) => total + r.tempsPasse, 0)
          const badges = [...etat.progression.badges]

          // Badge score parfait (20/20)
          if (nbBonnes === 20 && !badges.find(b => b.id === BADGES_DISPONIBLES.SCORE_PARFAIT.id)) {
            badges.push({ ...BADGES_DISPONIBLES.SCORE_PARFAIT, debloqueA: new Date() })
          }

          // Badge rapidité (quiz terminé en moins de 10 minutes)
          if (tempsTotal < 600 && !badges.find(b => b.id === BADGES_DISPONIBLES.RAPIDITE.id)) {
            badges.push({ ...BADGES_DISPONIBLES.RAPIDITE, debloqueA: new Date() })
          }

          return {
            progression: {
              ...etat.progression,
              resultatsQuiz: {
                ...etat.progression.resultatsQuiz,
                [niveau]: resultats   // On remplace les résultats pour ce niveau
              },
              badges
            }
          }
        })
      },

      // --------------------------------------------------------
      // SAUVEGARDER LES RÉSULTATS D'UNE SÉRIE D'EXAMEN
      // Appelée à la fin de chaque série (1, 2 ou 3)
      // --------------------------------------------------------
      sauvegarderResultatsExamen: (resultat) => {
        set((etat) => {
          const resultatsExamen = [...etat.progression.resultatsExamen, resultat]
          const badges = [...etat.progression.badges]

          // Badge diplôme (après avoir complété les 3 séries)
          if (resultatsExamen.length >= 3 && !badges.find(b => b.id === BADGES_DISPONIBLES.EXAMEN_REUSSI.id)) {
            badges.push({ ...BADGES_DISPONIBLES.EXAMEN_REUSSI, debloqueA: new Date() })
          }

          return {
            progression: {
              ...etat.progression,
              resultatsExamen,
              badges
            }
          }
        })
      },

      // --------------------------------------------------------
      // CHANGER LE NIVEAU ACTUEL
      // Appelée dans App.jsx quand l'utilisateur choisit un niveau
      // --------------------------------------------------------
      changerNiveauActuel: (niveau) => {
        set((etat) => ({
          progression: { ...etat.progression, niveauActuel: niveau }
        }))
      },

      // --------------------------------------------------------
      // REMETTRE À ZÉRO
      // Efface toute la progression du joueur
      // --------------------------------------------------------
      reinitialiser: () => {
        set({ progression: progressionDeDepart })
      },

      // --------------------------------------------------------
      // PEUT ACCÉDER À UN NIVEAU ? (lecture seule)
      // Débutant → toujours accessible
      // Intermédiaire → seulement si Débutant est terminé
      // Expert → seulement si Intermédiaire est terminé
      // --------------------------------------------------------
      peutAccederNiveau: (niveau) => {
        const { niveauxTermines } = get().progression
        if (niveau === 'debutant')      return true
        if (niveau === 'intermediaire') return niveauxTermines.includes('debutant')
        if (niveau === 'expert')        return niveauxTermines.includes('intermediaire')
        return false
      },

      // --------------------------------------------------------
      // SCORE D'UN NIVEAU (lecture seule)
      // Retourne le nombre de bonnes réponses au dernier quiz
      // --------------------------------------------------------
      scoreNiveau: (niveau) => {
        const resultats = get().progression.resultatsQuiz[niveau]
        if (!resultats || resultats.length === 0) return 0
        return resultats.filter(r => r.correct).length
      }

    }),
    {
      // Nom de la clé dans le localStorage du navigateur
      name: 'wikipedia-learn-sauvegarde',
      // On sauvegarde uniquement la progression (pas les fonctions)
      partialize: (etat) => ({ progression: etat.progression })
    }
  )
)
