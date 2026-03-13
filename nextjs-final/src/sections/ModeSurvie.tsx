"use client";
/**
 * ============================================
 * MODE SURVIE (ModeSurvie.tsx)
 * ============================================
 * 
 * Ce fichier gère entièrement le "Mode Survie".
 * 
 * Règles du mode :
 * - 50 questions mélangées (débutant, intermédiaire, expert)
 * - La partie s'arrête dès la première erreur
 * - Le score dépend de la rapidité de la réponse
 * - Un classement est mis à jour après chaque partie
 * - Cooldown de 12h (bouton "réessayer dans 12h")
 * 
 * Gameplay :
 * - La question glisse de droite à gauche (animation 2 secondes)
 * - Une fois l'animation terminée, le timer de 20 secondes se lance
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Questions des 3 niveaux
import { debutantQuestions, intermediaireQuestions, expertQuestions } from '@/data/questions';
import type { Question } from '@/types';

// Icônes
import { Timer, XCircle, ChevronRight, Trophy, Skull, Zap, Clock } from 'lucide-react';

// Composants UI
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// ============================================
// CONSTANTES
// ============================================

const DUREE_QUESTION    = 20;    // Secondes accordées par question
const DUREE_ANIMATION   = 2000;  // Durée de l'animation d'entrée (millisecondes)
const TOTAL_QUESTIONS   = 50;    // Nombre de questions par partie
const HEURES_COOLDOWN   = 12;    // Heures à attendre avant de rejouer

// ============================================
// TYPE : Une entrée dans le classement
// ============================================

interface EntreeClassement {
  /** Nom du joueur */
  nom: string;
  /** Score final obtenu */
  score: number;
  /** Numéro de la dernière question atteinte */
  questionAtteinte: number;
  /** Date de la partie (format lisible) */
  date: string;
}

// ============================================
// PROPS
// ============================================

interface ModeSurvieProps {
  /** Appelée quand le joueur clique sur "Retour à l'accueil" */
  onExit: () => void;
}

// ============================================
// UTILITAIRE : Mélanger un tableau
// ============================================

/**
 * Retourne une copie mélangée aléatoirement du tableau.
 * On utilise l'algorithme Fisher-Yates : on parcourt de la fin
 * vers le début et on échange chaque élément avec un élément
 * choisi au hasard parmi ceux qui le précèdent.
 * Ex : [1, 2, 3] peut donner [3, 1, 2]
 */
function melangerTableau<T>(tableau: T[]): T[] {
  const copie = [...tableau];  // On travaille sur une copie pour ne pas modifier l'original
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];  // Échange des deux éléments
  }
  return copie;
}

/**
 * Génère les 50 questions pour une partie.
 * On pioche dans chaque niveau puis on mélange tout ensemble.
 * Répartition : 17 débutant + 17 intermédiaire + 16 expert = 50
 */
function genererQuestionsPartie(): Question[] {
  const debutant      = melangerTableau(debutantQuestions).slice(0, 17);
  const intermediaire = melangerTableau(intermediaireQuestions).slice(0, 17);
  const expert        = melangerTableau(expertQuestions).slice(0, 16);
  return melangerTableau([...debutant, ...intermediaire, ...expert]);
}

// ============================================
// UTILITAIRE : Sauvegarde dans le navigateur
// ============================================

/** Clés utilisées pour stocker les données dans le navigateur (localStorage) */
const CLE_CLASSEMENT    = 'survie-classement';
const CLE_DERNIERE_PARTIE = 'survie-derniere-partie';

/**
 * Lit le classement sauvegardé dans le navigateur.
 * Retourne un tableau vide si aucune donnée n'est trouvée.
 */
function lireClassement(): EntreeClassement[] {
  const sauvegarde = localStorage.getItem(CLE_CLASSEMENT);
  if (!sauvegarde) return [];
  try {
    return JSON.parse(sauvegarde);
  } catch {
    return [];  // Si les données sont corrompues, on repart de zéro
  }
}

/**
 * Ajoute une nouvelle entrée dans le classement.
 * Trie par score décroissant, garde seulement le top 10,
 * puis sauvegarde dans le navigateur.
 * Retourne le classement mis à jour.
 */
function sauvegarderDansClassement(entree: EntreeClassement): EntreeClassement[] {
  const actuel  = lireClassement();
  const mise_a_jour = [...actuel, entree];
  mise_a_jour.sort((a, b) => b.score - a.score);  // Meilleur score en premier
  const top10   = mise_a_jour.slice(0, 10);        // On garde seulement le top 10
  localStorage.setItem(CLE_CLASSEMENT, JSON.stringify(top10));
  return top10;
}

/** Enregistre l'heure actuelle comme heure de fin de la dernière partie */
function sauvegarderDernierePartie() {
  localStorage.setItem(CLE_DERNIERE_PARTIE, new Date().toISOString());
}

/**
 * Calcule le nombre de millisecondes restantes avant la fin du cooldown.
 * Retourne 0 si le cooldown est déjà terminé.
 */
function calculerCooldownRestant(): number {
  const sauvegarde = localStorage.getItem(CLE_DERNIERE_PARTIE);
  if (!sauvegarde) return 0;
  const cooldownMs = HEURES_COOLDOWN * 60 * 60 * 1000;  // 12h en millisecondes
  const tempsEcoule = Date.now() - new Date(sauvegarde).getTime();
  return Math.max(0, cooldownMs - tempsEcoule);
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export function ModeSurvie({ onExit }: ModeSurvieProps) {

  // ============================================
  // ÉTATS : Phase du jeu
  // ============================================
  
  /**
   * La partie passe par 3 phases :
   * 'intro'    → Pop-up de présentation du mode (avant de jouer)
   * 'jeu'      → Partie en cours
   * 'fin'      → Partie terminée (erreur ou temps écoulé)
   */
  const [phase, setPhase] = useState<'intro' | 'jeu' | 'fin'>('intro');

  // ============================================
  // ÉTATS : Données de la partie
  // ============================================
  
  /** Les 50 questions générées aléatoirement pour cette partie */
  const [questions, setQuestions] = useState<Question[]>([]);
  
  /** Index de la question affichée (0 à 49) */
  const [indexActuel, setIndexActuel] = useState(0);
  
  /** Réponse choisie par le joueur (null = pas encore répondu) */
  const [reponseSelectionnee, setReponseSelectionnee] = useState<number | null>(null);
  
  /** Secondes restantes avant la fin du timer */
  const [tempsRestant, setTempsRestant] = useState(DUREE_QUESTION);
  
  /** Score cumulé du joueur */
  const [score, setScore] = useState(0);
  
  /** Nombre de bonnes réponses données */
  const [nbBonnesReponses, setNbBonnesReponses] = useState(0);
  
  /** Heure à laquelle la question a été affichée — sert à calculer la rapidité */
  const heureDebutQuestion = useRef<number>(Date.now());

  // ============================================
  // ÉTATS : Animation de glissement
  // ============================================
  
  /** true pendant les 2 secondes où la question glisse de droite à gauche */
  const [animationEnCours, setAnimationEnCours] = useState(false);
  
  /** true quand l'animation est terminée et que le timer peut démarrer */
  const [timerActif, setTimerActif] = useState(false);

  // ============================================
  // ÉTATS : Fin de partie
  // ============================================
  
  /** Classement mis à jour après la sauvegarde du score */
  const [classement, setClassement] = useState<EntreeClassement[]>([]);
  
  /** Position du joueur dans le classement (1 = premier) */
  const [rangJoueur, setRangJoueur] = useState(0);
  
  /** Millisecondes restantes avant de pouvoir rejouer */
  const [cooldownMs, setCooldownMs] = useState(0);

  // ============================================
  // EFFET : Mise à jour du compte à rebours du cooldown
  // ============================================
  useEffect(() => {
    // On rafraîchit le compte à rebours seulement sur l'écran de fin
    if (phase !== 'fin') return;

    const intervalle = setInterval(() => {
      setCooldownMs(calculerCooldownRestant());
    }, 1000);

    return () => clearInterval(intervalle);
  }, [phase]);

  // ============================================
  // EFFET : Timer de 20 secondes par question
  // ============================================
  useEffect(() => {
    // Le timer ne tourne que pendant la partie ET après la fin de l'animation
    if (!timerActif || phase !== 'jeu') return;

    const intervalle = setInterval(() => {
      setTempsRestant((prev) => {
        if (prev <= 1) {
          gererFinPartie();  // Temps écoulé = c'est une erreur
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalle);
  }, [timerActif, phase, indexActuel]);

  // ============================================
  // FONCTION : Formater le cooldown en HH:MM:SS
  // ============================================
  const formaterCooldown = (ms: number): string => {
    if (ms <= 0) return '00:00:00';
    const totalSecondes = Math.floor(ms / 1000);
    const h = Math.floor(totalSecondes / 3600);
    const m = Math.floor((totalSecondes % 3600) / 60);
    const s = totalSecondes % 60;
    // padStart(2, '0') : ajoute un zéro devant si nécessaire (ex : 5 → "05")
    const formater = (n: number) => String(n).padStart(2, '0');
    return `${formater(h)}:${formater(m)}:${formater(s)}`;
  };

  // ============================================
  // FONCTION : Lancer l'animation de glissement
  // ============================================
  /**
   * La carte-question entre par la droite et glisse vers sa position.
   * Pendant ces 2 secondes, le timer est bloqué.
   * À la fin de l'animation, le timer de 20s démarre.
   */
  const lancerAnimation = () => {
    setAnimationEnCours(true);   // Active l'animation CSS
    setTimerActif(false);        // Bloque le timer pendant l'animation

    setTimeout(() => {
      setAnimationEnCours(false);  // Fin de l'animation
      setTimerActif(true);         // Lance le timer
      setTempsRestant(DUREE_QUESTION);
      heureDebutQuestion.current = Date.now();  // Mémorise l'heure de début
    }, DUREE_ANIMATION);
  };

  // ============================================
  // FONCTION : Démarrer une nouvelle partie
  // ============================================
  const demarrerPartie = () => {
    const nouvellesQuestions = genererQuestionsPartie();
    setQuestions(nouvellesQuestions);
    setIndexActuel(0);
    setReponseSelectionnee(null);
    setScore(0);
    setNbBonnesReponses(0);
    setPhase('jeu');
    lancerAnimation();  // Lance l'animation de la première question
  };

  // ============================================
  // FONCTION : Calculer les points gagnés sur une question
  // ============================================
  /**
   * Le score dépend du temps de réponse.
   * Réponse immédiate  → 100 points (maximum)
   * Réponse à 20s      →  10 points (minimum)
   */
  const calculerPoints = (): number => {
    const tempsEcouleSecondes = (Date.now() - heureDebutQuestion.current) / 1000;
    const bonusTemps          = Math.max(0, DUREE_QUESTION - tempsEcouleSecondes);
    return Math.round(10 + (bonusTemps / DUREE_QUESTION) * 90);
  };

  // ============================================
  // FONCTION : Terminer la partie
  // ============================================
  /**
   * Appelée quand le joueur se trompe ou que le temps est écoulé.
   * Sauvegarde le score dans le classement et affiche l'écran de fin.
   */
  const gererFinPartie = useCallback(() => {
    setTimerActif(false);  // Arrête le timer

    // Enregistre l'heure de fin pour le cooldown
    sauvegarderDernierePartie();

    // Crée l'entrée du joueur pour le classement
    const entree: EntreeClassement = {
      nom              : 'Vous',
      score            : score,
      questionAtteinte : indexActuel + 1,
      date             : new Date().toLocaleDateString('fr-FR')
    };

    // Sauvegarde et récupère le classement mis à jour
    const classementMisAJour = sauvegarderDansClassement(entree);
    setClassement(classementMisAJour);

    // Calcule la position du joueur (+ 1 car les index commencent à 0)
    const rang = classementMisAJour.findIndex(
      e => e.score === score && e.date === entree.date
    ) + 1;
    setRangJoueur(rang);

    // Lit le cooldown pour l'afficher immédiatement
    setCooldownMs(calculerCooldownRestant());

    setPhase('fin');
  }, [score, indexActuel]);

  // ============================================
  // FONCTION : Cliquer sur une réponse
  // ============================================
  const handleSelectAnswer = (index: number) => {
    // Ignore le clic si déjà répondu ou pendant l'animation
    if (reponseSelectionnee !== null || !timerActif) return;

    setReponseSelectionnee(index);
    setTimerActif(false);  // Arrête le timer dès que le joueur répond

    const questionActuelle = questions[indexActuel];

    if (index === questionActuelle.correctAnswer) {
      // BONNE RÉPONSE : on ajoute les points puis on passe à la suite
      const points = calculerPoints();
      setScore(prev => prev + points);
      setNbBonnesReponses(prev => prev + 1);

      // Courte pause pour que le joueur voie la couleur verte
      setTimeout(() => {
        const indexSuivant = indexActuel + 1;
        if (indexSuivant >= TOTAL_QUESTIONS) {
          gererFinPartie();  // Toutes les questions répondues → victoire
        } else {
          setIndexActuel(indexSuivant);
          setReponseSelectionnee(null);
          lancerAnimation();  // Fait glisser la question suivante
        }
      }, 800);  // 0.8 seconde pour voir le vert

    } else {
      // MAUVAISE RÉPONSE : courte pause pour voir le rouge, puis fin de partie
      setTimeout(() => {
        gererFinPartie();
      }, 1000);  // 1 seconde pour voir le rouge
    }
  };

  // ============================================
  // FONCTION : Couleur du timer selon l'urgence
  // ============================================
  const getCouleurTimer = (): string => {
    if (tempsRestant <= 5)  return 'text-red-500';     // Urgent : rouge
    if (tempsRestant <= 10) return 'text-orange-400';  // Attention : orange
    return 'text-orange-300';                          // Normal : orange clair
  };

  // ============================================
  // FONCTION : Icône selon le niveau de la question
  // ============================================
  const getIconeNiveau = (niveau: string): string => {
    switch (niveau) {
      case 'debutant':      return '🌱';
      case 'intermediaire': return '📚';
      case 'expert':        return '👑';
      default:              return '❓';
    }
  };

  // ============================================
  // RENDU : Pop-up d'introduction
  // ============================================
  if (phase === 'intro') {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-orange-500 rounded-2xl max-w-lg w-full p-8 text-white animate-fade-in">

          {/* Titre */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">💀</div>
            <h1 className="text-3xl font-bold text-orange-400 mb-2">Mode Survie</h1>
            <p className="text-orange-200 text-sm">Jusqu'où pouvez-vous aller ?</p>
          </div>

          {/* Règles du jeu */}
          <div className="bg-orange-950/50 border border-orange-700 rounded-xl p-5 mb-6 space-y-3">

            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" />
              <p className="text-sm text-gray-200">
                <span className="font-bold text-orange-300">50 questions</span> mélangées
                des 3 niveaux (débutant, intermédiaire, expert)
              </p>
            </div>

            <div className="flex items-start gap-3">
              <Skull className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-gray-200">
                <span className="font-bold text-red-300">Une seule erreur</span> et la
                partie s'arrête immédiatement
              </p>
            </div>

            <div className="flex items-start gap-3">
              <Timer className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" />
              <p className="text-sm text-gray-200">
                <span className="font-bold text-orange-300">20 secondes</span> pour
                répondre — le temps écoulé compte comme une erreur
              </p>
            </div>

            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
              <p className="text-sm text-gray-200">
                Le score dépend de votre <span className="font-bold text-yellow-300">rapidité</span> :
                plus vite vous répondez, plus vous gagnez de points
              </p>
            </div>

            <div className="flex items-start gap-3">
              <Trophy className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
              <p className="text-sm text-gray-200">
                Votre score est sauvegardé dans le
                <span className="font-bold text-yellow-300"> classement</span>
              </p>
            </div>

          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onExit}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Retour
            </Button>
            <Button
              onClick={demarrerPartie}
              className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 font-bold text-lg"
            >
              ⚔️ Jouer
            </Button>
          </div>

        </div>
      </div>
    );
  }

  // ============================================
  // RENDU : Écran de fin de partie
  // ============================================
  if (phase === 'fin') {
    // true si le joueur a répondu correctement aux 50 questions
    const estVictoire = nbBonnesReponses === TOTAL_QUESTIONS;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-2xl">

          {/* ----------------------------------------
              CARTE : Résultat de la partie
              ---------------------------------------- */}
          <Card className="mb-6 bg-gray-900 border-2 border-orange-600 text-white">
            <CardContent className="p-8 text-center">

              {/* Emoji de résultat */}
              <div className="text-7xl mb-4">
                {estVictoire ? '🏆' : '💀'}
              </div>

              <h2 className="text-3xl font-bold text-orange-400 mb-1">
                {estVictoire ? 'INCROYABLE !' : 'GAME OVER'}
              </h2>
              <p className="text-gray-400 mb-6">
                {estVictoire
                  ? 'Vous avez répondu correctement aux 50 questions !'
                  : `Éliminé à la question ${indexActuel + 1} sur ${TOTAL_QUESTIONS}`
                }
              </p>

              {/* Stats de la partie */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-orange-950 border border-orange-700 p-4 rounded-xl">
                  <div className="text-3xl font-bold text-orange-400">{score}</div>
                  <div className="text-xs text-gray-400 mt-1">Score total</div>
                </div>
                <div className="bg-orange-950 border border-orange-700 p-4 rounded-xl">
                  <div className="text-3xl font-bold text-yellow-400">{nbBonnesReponses}</div>
                  <div className="text-xs text-gray-400 mt-1">Bonnes réponses</div>
                </div>
                <div className="bg-orange-950 border border-orange-700 p-4 rounded-xl">
                  <div className="text-3xl font-bold text-red-400">#{rangJoueur}</div>
                  <div className="text-xs text-gray-400 mt-1">Classement</div>
                </div>
              </div>

              {/* Boutons de fin */}
              <div className="flex flex-col gap-3">

                {/* Compte à rebours du cooldown — bouton grisé pendant 12h */}
                <div className="flex items-center justify-center gap-3 bg-gray-800 border border-gray-600 rounded-xl p-4">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div className="text-left">
                    <p className="text-sm text-gray-400">Vous pouvez réessayer dans</p>
                    <p className="text-xl font-mono font-bold text-orange-400">
                      {cooldownMs > 0 ? formaterCooldown(cooldownMs) : 'Disponible maintenant !'}
                    </p>
                  </div>
                </div>

                {/* Relancer une session immédiatement */}
                <Button
                  onClick={demarrerPartie}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 font-bold"
                  size="lg"
                >
                  ⚔️ Relancer une session
                </Button>

                {/* Retour à l'accueil */}
                <Button
                  variant="outline"
                  onClick={onExit}
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Retour à l'accueil
                </Button>

              </div>
            </CardContent>
          </Card>

          {/* ----------------------------------------
              CARTE : Classement dynamique
              S'actualise à chaque nouvelle partie
              ---------------------------------------- */}
          <Card className="bg-gray-900 border-2 border-orange-600 text-white">
            <CardContent className="p-6">

              <h3 className="font-bold text-lg text-orange-400 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Classement du Mode Survie
              </h3>

              {/* Liste des scores */}
              {classement.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucun score enregistré.</p>
              ) : (
                <div className="space-y-2">
                  {classement.map((entree, index) => {

                    // Vérifie si cette ligne correspond au joueur actuel
                    const estJoueurActuel = (entree.score === score && index + 1 === rangJoueur);

                    return (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          estJoueurActuel
                            ? 'bg-orange-600 border border-orange-400'   // Ligne du joueur : orange
                            : 'bg-gray-800 border border-gray-700'       // Autres lignes : gris
                        }`}
                      >
                        {/* Rang + Nom */}
                        <div className="flex items-center gap-3">
                          {/* Médaille pour le podium */}
                          <span className="text-lg font-bold w-8 text-center">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                          </span>
                          <div>
                            <p className="font-medium text-sm">
                              {entree.nom}
                              {/* Badge "Vous" sur la ligne du joueur */}
                              {estJoueurActuel && (
                                <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                                  Vous
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-400">
                              Question {entree.questionAtteinte} atteinte · {entree.date}
                            </p>
                          </div>
                        </div>

                        {/* Score */}
                        <p className="font-bold text-orange-300">{entree.score} pts</p>

                      </div>
                    );
                  })}
                </div>
              )}

            </CardContent>
          </Card>

        </div>
      </div>
    );
  }

  // ============================================
  // RENDU : Partie en cours
  // ============================================

  // Sécurité : on attend que les questions soient générées
  if (questions.length === 0) return null;

  const questionActuelle = questions[indexActuel];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-3xl">

        {/* ----------------------------------------
            EN-TÊTE : bouton quitter + score + compteur
            ---------------------------------------- */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={onExit}
            className="text-gray-400 hover:text-white"
          >
            Quitter
          </Button>
          <div className="flex items-center gap-2 bg-orange-950 border border-orange-700 px-4 py-2 rounded-full">
            <Zap className="w-4 h-4 text-orange-400" />
            <span className="font-bold text-orange-300">{score} pts</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-800 border border-gray-600 px-4 py-2 rounded-full">
            <span className="text-sm text-gray-300">✅ {nbBonnesReponses}</span>
          </div>
        </div>

        {/* ----------------------------------------
            BARRE DE PROGRESSION
            ---------------------------------------- */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Question {indexActuel + 1} sur {TOTAL_QUESTIONS}</span>
            <span>{Math.round(((indexActuel + 1) / TOTAL_QUESTIONS) * 100)}%</span>
          </div>
          {/* Barre orange sur fond gris foncé */}
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-600 to-red-600 transition-all duration-500"
              style={{ width: `${((indexActuel + 1) / TOTAL_QUESTIONS) * 100}%` }}
            />
          </div>
        </div>

        {/* ----------------------------------------
            CARTE : Niveau de la question + Timer
            ---------------------------------------- */}
        <Card className={`mb-6 bg-gray-900 border border-orange-700 ${tempsRestant <= 5 ? 'border-red-500' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">

              {/* Badge du niveau */}
              <div className="flex items-center gap-2">
                <span className="text-xl">{getIconeNiveau(questionActuelle.level)}</span>
                <Badge
                  className={
                    questionActuelle.level === 'debutant'
                      ? 'bg-green-900 text-green-300 border border-green-700'
                      : questionActuelle.level === 'intermediaire'
                        ? 'bg-blue-900 text-blue-300 border border-blue-700'
                        : 'bg-purple-900 text-purple-300 border border-purple-700'
                  }
                >
                  {questionActuelle.level === 'debutant'
                    ? 'Débutant'
                    : questionActuelle.level === 'intermediaire'
                      ? 'Intermédiaire'
                      : 'Expert'
                  }
                </Badge>
              </div>

              {/* Secondes restantes */}
              <div className="flex items-center gap-3">
                <Timer className={`w-6 h-6 ${getCouleurTimer()} ${tempsRestant <= 5 ? 'animate-pulse' : ''}`} />
                <span className={`text-2xl font-bold ${getCouleurTimer()}`}>
                  {animationEnCours ? '—' : `${tempsRestant}s`}
                </span>
              </div>

            </div>

            {/* Barre de décompte du timer (cachée pendant l'animation) */}
            {!animationEnCours && (
              <div className="mt-3 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    tempsRestant <= 5
                      ? 'bg-red-500'
                      : tempsRestant <= 10
                        ? 'bg-orange-500'
                        : 'bg-orange-400'
                  }`}
                  style={{ width: `${(tempsRestant / DUREE_QUESTION) * 100}%` }}
                />
              </div>
            )}

          </CardContent>
        </Card>

        {/* ----------------------------------------
            CARTE : Question + réponses
            L'animation CSS fait glisser la carte de droite à gauche
            pendant 2 secondes (DUREE_ANIMATION)
            ---------------------------------------- */}
        <Card
          className="mb-6 bg-gray-900 border-2 border-orange-700"
          style={{
            animation: animationEnCours
              ? `glissementDroite ${DUREE_ANIMATION}ms ease-out forwards`
              : 'none'
          }}
        >
          <CardContent className="p-6">

            {/* Texte de la question */}
            <h2 className="text-xl font-bold text-white mb-6">
              {questionActuelle.question}
            </h2>

            {/* Boutons de réponses */}
            <div className="space-y-3">
              {questionActuelle.options.map((option, index) => {

                // Couleur du bouton : neutre par défaut, puis vert/rouge/grisé après réponse
                let styleBouton = 'border-2 border-gray-600 bg-gray-800 text-white hover:border-orange-500 hover:bg-orange-950';

                if (reponseSelectionnee !== null) {
                  if (index === questionActuelle.correctAnswer) {
                    // La bonne réponse : toujours en vert
                    styleBouton = 'border-2 border-green-500 bg-green-900 text-green-200';
                  } else if (index === reponseSelectionnee) {
                    // La mauvaise réponse choisie par le joueur : en rouge
                    styleBouton = 'border-2 border-red-500 bg-red-900 text-red-200';
                  } else {
                    // Les autres options non choisies : grisées
                    styleBouton = 'border-2 border-gray-700 bg-gray-800 text-gray-500 opacity-50';
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleSelectAnswer(index)}
                    disabled={reponseSelectionnee !== null || animationEnCours || !timerActif}
                    className={`w-full p-4 rounded-lg text-left transition-all ${styleBouton} disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center gap-3">

                      {/* Lettre de l'option : A, B, C ou D */}
                      <span className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center font-medium text-sm">
                        {String.fromCharCode(65 + index)}
                      </span>

                      <span>{option}</span>

                      {/* Icône de résultat — affichée après le clic */}
                      {reponseSelectionnee !== null && index === questionActuelle.correctAnswer && (
                        <ChevronRight className="w-5 h-5 text-green-400 ml-auto" />
                      )}
                      {reponseSelectionnee === index && index !== questionActuelle.correctAnswer && (
                        <XCircle className="w-5 h-5 text-red-400 ml-auto" />
                      )}

                    </div>
                  </button>
                );
              })}
            </div>

          </CardContent>
        </Card>

        {/* Message affiché pendant l'animation (avant que le timer démarre) */}
        {animationEnCours && (
          <div className="text-center text-orange-400 text-sm animate-pulse">
            Préparez-vous...
          </div>
        )}

      </div>

      {/* ----------------------------------------
          ANIMATION CSS : glissement depuis la droite
          La question part hors écran (droite) et arrive à sa position normale
          ---------------------------------------- */}
      <style>{`
        @keyframes glissementDroite {
          from { opacity: 0; transform: translateX(100%); }
          to   { opacity: 1; transform: translateX(0);    }
        }
      `}</style>

    </div>
  );
}
