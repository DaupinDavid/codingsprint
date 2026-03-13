"use client";
/**
 * ============================================
 * MODE SURVIE (ModeSurvie.tsx)
 * ============================================
 * Animations Framer Motion ajoutées :
 * - Intro : overlay fade + carte bounce
 * - Règles : apparaissent en cascade
 * - Questions : slide depuis la droite (remplace l'animation CSS)
 * - Boutons de réponse : cascade + hover/tap + icône pop
 * - Timer : pulse rouge urgent + barre animée
 * - Fin de partie : GAME OVER / VICTOIRE avec scale + shake
 * - Stats en cascade
 * - Classement : lignes en cascade
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { debutantQuestions, intermediaireQuestions, expertQuestions } from '@/data/questions';
import type { Question } from '@/types';

import { Timer, XCircle, ChevronRight, Trophy, Skull, Zap, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// ============================================
// CONSTANTES
// ============================================

const DUREE_QUESTION  = 20;
const DUREE_ANIMATION = 2000;
const TOTAL_QUESTIONS = 50;
const HEURES_COOLDOWN = 12;

interface EntreeClassement {
  nom: string;
  score: number;
  questionAtteinte: number;
  date: string;
}

interface ModeSurvieProps {
  onExit: () => void;
}

// ============================================
// UTILITAIRES
// ============================================

function melangerTableau<T>(tableau: T[]): T[] {
  const copie = [...tableau];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

function genererQuestionsPartie(): Question[] {
  const debutant      = melangerTableau(debutantQuestions).slice(0, 17);
  const intermediaire = melangerTableau(intermediaireQuestions).slice(0, 17);
  const expert        = melangerTableau(expertQuestions).slice(0, 16);
  return melangerTableau([...debutant, ...intermediaire, ...expert]);
}

const CLE_CLASSEMENT      = 'survie-classement';
const CLE_DERNIERE_PARTIE = 'survie-derniere-partie';

function lireClassement(): EntreeClassement[] {
  const sauvegarde = localStorage.getItem(CLE_CLASSEMENT);
  if (!sauvegarde) return [];
  try { return JSON.parse(sauvegarde); } catch { return []; }
}

function sauvegarderDansClassement(entree: EntreeClassement): EntreeClassement[] {
  const actuel      = lireClassement();
  const mise_a_jour = [...actuel, entree];
  mise_a_jour.sort((a, b) => b.score - a.score);
  const top10 = mise_a_jour.slice(0, 10);
  localStorage.setItem(CLE_CLASSEMENT, JSON.stringify(top10));
  return top10;
}

function sauvegarderDernierePartie() {
  localStorage.setItem(CLE_DERNIERE_PARTIE, new Date().toISOString());
}

function calculerCooldownRestant(): number {
  const sauvegarde = localStorage.getItem(CLE_DERNIERE_PARTIE);
  if (!sauvegarde) return 0;
  const cooldownMs   = HEURES_COOLDOWN * 60 * 60 * 1000;
  const tempsEcoule  = Date.now() - new Date(sauvegarde).getTime();
  return Math.max(0, cooldownMs - tempsEcoule);
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export function ModeSurvie({ onExit }: ModeSurvieProps) {
  const [phase,               setPhase]               = useState<'intro' | 'jeu' | 'fin'>('intro');
  const [questions,           setQuestions]           = useState<Question[]>([]);
  const [indexActuel,         setIndexActuel]         = useState(0);
  const [reponseSelectionnee, setReponseSelectionnee] = useState<number | null>(null);
  const [tempsRestant,        setTempsRestant]        = useState(DUREE_QUESTION);
  const [score,               setScore]               = useState(0);
  const [nbBonnesReponses,    setNbBonnesReponses]    = useState(0);
  const heureDebutQuestion = useRef<number>(Date.now());

  const [animationEnCours, setAnimationEnCours] = useState(false);
  const [timerActif,       setTimerActif]       = useState(false);

  const [classement,  setClassement]  = useState<EntreeClassement[]>([]);
  const [rangJoueur,  setRangJoueur]  = useState(0);
  const [cooldownMs,  setCooldownMs]  = useState(0);

  // ============================================
  // TIMER COOLDOWN
  // ============================================
  useEffect(() => {
    if (phase !== 'fin') return;
    const intervalle = setInterval(() => {
      setCooldownMs(calculerCooldownRestant());
    }, 1000);
    return () => clearInterval(intervalle);
  }, [phase]);

  // ============================================
  // TIMER DE QUESTION
  // ============================================
  useEffect(() => {
    if (!timerActif || phase !== 'jeu') return;
    const intervalle = setInterval(() => {
      setTempsRestant((prev) => {
        if (prev <= 1) { gererFinPartie(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalle);
  }, [timerActif, phase, indexActuel]);

  const formaterCooldown = (ms: number): string => {
    if (ms <= 0) return '00:00:00';
    const totalSecondes = Math.floor(ms / 1000);
    const h = Math.floor(totalSecondes / 3600);
    const m = Math.floor((totalSecondes % 3600) / 60);
    const s = totalSecondes % 60;
    const f = (n: number) => String(n).padStart(2, '0');
    return `${f(h)}:${f(m)}:${f(s)}`;
  };

  const lancerAnimation = () => {
    setAnimationEnCours(true);
    setTimerActif(false);
    setTimeout(() => {
      setAnimationEnCours(false);
      setTimerActif(true);
      setTempsRestant(DUREE_QUESTION);
      heureDebutQuestion.current = Date.now();
    }, DUREE_ANIMATION);
  };

  const demarrerPartie = () => {
    const nouvellesQuestions = genererQuestionsPartie();
    setQuestions(nouvellesQuestions);
    setIndexActuel(0);
    setReponseSelectionnee(null);
    setScore(0);
    setNbBonnesReponses(0);
    setPhase('jeu');
    lancerAnimation();
  };

  const calculerPoints = (): number => {
    const tempsEcouleSecondes = (Date.now() - heureDebutQuestion.current) / 1000;
    const bonusTemps = Math.max(0, DUREE_QUESTION - tempsEcouleSecondes);
    return Math.round(10 + (bonusTemps / DUREE_QUESTION) * 90);
  };

  const gererFinPartie = useCallback(() => {
    setTimerActif(false);
    sauvegarderDernierePartie();
    const entree: EntreeClassement = {
      nom: 'Vous', score, questionAtteinte: indexActuel + 1,
      date: new Date().toLocaleDateString('fr-FR')
    };
    const classementMisAJour = sauvegarderDansClassement(entree);
    setClassement(classementMisAJour);
    const rang = classementMisAJour.findIndex(
      e => e.score === score && e.date === entree.date
    ) + 1;
    setRangJoueur(rang);
    setCooldownMs(calculerCooldownRestant());
    setPhase('fin');
  }, [score, indexActuel]);

  const handleSelectAnswer = (index: number) => {
    if (reponseSelectionnee !== null || !timerActif) return;
    setReponseSelectionnee(index);
    setTimerActif(false);
    const questionActuelle = questions[indexActuel];
    if (index === questionActuelle.correctAnswer) {
      const points = calculerPoints();
      setScore(prev => prev + points);
      setNbBonnesReponses(prev => prev + 1);
      setTimeout(() => {
        const indexSuivant = indexActuel + 1;
        if (indexSuivant >= TOTAL_QUESTIONS) {
          gererFinPartie();
        } else {
          setIndexActuel(indexSuivant);
          setReponseSelectionnee(null);
          lancerAnimation();
        }
      }, 800);
    } else {
      setTimeout(() => gererFinPartie(), 1000);
    }
  };

  const getCouleurTimer = (): string => {
    if (tempsRestant <= 5)  return 'text-red-500';
    if (tempsRestant <= 10) return 'text-orange-400';
    return 'text-orange-300';
  };

  const getIconeNiveau = (niveau: string): string => {
    switch (niveau) {
      case 'debutant':      return '🌱';
      case 'intermediaire': return '📚';
      case 'expert':        return '👑';
      default:              return '❓';
    }
  };

  // ============================================
  // RENDU : Intro
  // ============================================
  if (phase === 'intro') {
    return (
      <motion.div
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="bg-gradient-to-br from-gray-900 to-black border-2 border-orange-500 rounded-2xl max-w-lg w-full p-8 text-white"
          initial={{ scale: 0.8, opacity: 0, y: 40 }}
          animate={{ scale: 1,   opacity: 1, y: 0  }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
        >
          {/* Titre */}
          <div className="text-center mb-6">
            <motion.div
              className="text-6xl mb-4"
              animate={{ rotate: [-5, 5, -5, 5, 0] }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              💀
            </motion.div>
            <h1 className="text-3xl font-bold text-orange-400 mb-2">Mode Survie</h1>
            <p className="text-orange-200 text-sm">Jusqu'où pouvez-vous aller ?</p>
          </div>

          {/* Règles — cascade */}
          <motion.div
            className="bg-orange-950/50 border border-orange-700 rounded-xl p-5 mb-6 space-y-3"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.35 } } }}
          >
            {[
              { icon: <Zap    className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" />, text: <><span className="font-bold text-orange-300">50 questions</span> mélangées des 3 niveaux</> },
              { icon: <Skull  className="w-5 h-5 text-red-400 mt-0.5 shrink-0"    />, text: <><span className="font-bold text-red-300">Une seule erreur</span> et la partie s'arrête</> },
              { icon: <Timer  className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" />, text: <><span className="font-bold text-orange-300">20 secondes</span> pour répondre — temps écoulé = erreur</> },
              { icon: <Zap    className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />, text: <>Score selon votre <span className="font-bold text-yellow-300">rapidité</span></> },
              { icon: <Trophy className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />, text: <>Votre score est sauvegardé dans le <span className="font-bold text-yellow-300">classement</span></> },
            ].map((regle, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-3"
                variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
              >
                {regle.icon}
                <p className="text-sm text-gray-200">{regle.text}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Boutons */}
          <motion.div
            className="flex gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ delay: 0.8 }}
          >
            <motion.div className="flex-1" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant="outline"
                onClick={onExit}
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Retour
              </Button>
            </motion.div>
            <motion.div
              className="flex-1"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <Button
                onClick={demarrerPartie}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 font-bold text-lg"
              >
                ⚔️ Jouer
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  // ============================================
  // RENDU : Fin de partie
  // ============================================
  if (phase === 'fin') {
    const estVictoire = nbBonnesReponses === TOTAL_QUESTIONS;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-2xl">

          {/* Carte résultat */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1,   y: 0  }}
            transition={{ type: 'spring', stiffness: 240, damping: 20 }}
          >
            <Card className="mb-6 bg-gray-900 border-2 border-orange-600 text-white">
              <CardContent className="p-8 text-center">

                {/* Emoji résultat — shake si game over */}
                <motion.div
                  className="text-7xl mb-4"
                  initial={{ scale: 0 }}
                  animate={
                    estVictoire
                      ? { scale: [0, 1.3, 1], rotate: [0, -10, 10, 0] }
                      : { scale: [0, 1.2, 1], rotate: [0, -15, 15, -10, 10, 0] }
                  }
                  transition={{ duration: 0.7, delay: 0.15 }}
                >
                  {estVictoire ? '🏆' : '💀'}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0  }}
                  transition={{ delay: 0.35 }}
                >
                  <h2 className="text-3xl font-bold text-orange-400 mb-1">
                    {estVictoire ? 'INCROYABLE !' : 'GAME OVER'}
                  </h2>
                  <p className="text-gray-400 mb-6">
                    {estVictoire
                      ? 'Vous avez répondu correctement aux 50 questions !'
                      : `Éliminé à la question ${indexActuel + 1} sur ${TOTAL_QUESTIONS}`
                    }
                  </p>
                </motion.div>

                {/* Stats — cascade */}
                <motion.div
                  className="grid grid-cols-3 gap-4 mb-6"
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.4 } } }}
                >
                  {[
                    { value: score,            label: 'Score total',      color: 'text-orange-400' },
                    { value: nbBonnesReponses,  label: 'Bonnes réponses',  color: 'text-yellow-400' },
                    { value: `#${rangJoueur}`,  label: 'Classement',       color: 'text-red-400'    },
                  ].map(({ value, label, color }) => (
                    <motion.div
                      key={label}
                      className="bg-orange-950 border border-orange-700 p-4 rounded-xl"
                      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    >
                      <div className={`text-3xl font-bold ${color}`}>{value}</div>
                      <div className="text-xs text-gray-400 mt-1">{label}</div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Boutons */}
                <motion.div
                  className="flex flex-col gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.65 }}
                >
                  {/* Cooldown */}
                  <div className="flex items-center justify-center gap-3 bg-gray-800 border border-gray-600 rounded-xl p-4">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div className="text-left">
                      <p className="text-sm text-gray-400">Vous pouvez réessayer dans</p>
                      <motion.p
                        className="text-xl font-mono font-bold text-orange-400"
                        key={cooldownMs}
                      >
                        {cooldownMs > 0 ? formaterCooldown(cooldownMs) : 'Disponible maintenant !'}
                      </motion.p>
                    </div>
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      onClick={demarrerPartie}
                      className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 font-bold"
                      size="lg"
                    >
                      ⚔️ Relancer une session
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      variant="outline"
                      onClick={onExit}
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Retour à l'accueil
                    </Button>
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Classement — lignes en cascade */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <Card className="bg-gray-900 border-2 border-orange-600 text-white">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg text-orange-400 mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Classement du Mode Survie
                </h3>

                {classement.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Aucun score enregistré.</p>
                ) : (
                  <motion.div
                    className="space-y-2"
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.06, delayChildren: 0.5 } } }}
                  >
                    {classement.map((entree, index) => {
                      const estJoueurActuel = entree.score === score && index + 1 === rangJoueur;
                      return (
                        <motion.div
                          key={index}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            estJoueurActuel
                              ? 'bg-orange-600 border border-orange-400'
                              : 'bg-gray-800 border border-gray-700'
                          }`}
                          variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold w-8 text-center">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                            </span>
                            <div>
                              <p className="font-medium text-sm">
                                {entree.nom}
                                {estJoueurActuel && (
                                  <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">Vous</span>
                                )}
                              </p>
                              <p className="text-xs text-gray-400">
                                Question {entree.questionAtteinte} atteinte · {entree.date}
                              </p>
                            </div>
                          </div>
                          <p className="font-bold text-orange-300">{entree.score} pts</p>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
    );
  }

  // ============================================
  // RENDU : Partie en cours
  // ============================================
  if (questions.length === 0) return null;
  const questionActuelle = questions[indexActuel];
  const timerUrgent      = tempsRestant <= 5;
  const timerAttention   = tempsRestant <= 10;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-3xl">

        {/* En-tête */}
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.4 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="ghost" onClick={onExit} className="text-gray-400 hover:text-white">
              Quitter
            </Button>
          </motion.div>
          <div className="flex items-center gap-2 bg-orange-950 border border-orange-700 px-4 py-2 rounded-full">
            <Zap className="w-4 h-4 text-orange-400" />
            <span className="font-bold text-orange-300">{score} pts</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-800 border border-gray-600 px-4 py-2 rounded-full">
            <span className="text-sm text-gray-300">✅ {nbBonnesReponses}</span>
          </div>
        </motion.div>

        {/* Barre de progression */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Question {indexActuel + 1} sur {TOTAL_QUESTIONS}</span>
            <span>{Math.round(((indexActuel + 1) / TOTAL_QUESTIONS) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-600 to-red-600"
              animate={{ width: `${((indexActuel + 1) / TOTAL_QUESTIONS) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        {/* Timer */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1  }}
          transition={{ delay: 0.2 }}
        >
          <Card className={`bg-gray-900 border ${timerUrgent ? 'border-red-500' : 'border-orange-700'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                {/* Badge niveau */}
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getIconeNiveau(questionActuelle.level)}</span>
                  <Badge className={
                    questionActuelle.level === 'debutant'      ? 'bg-green-900 text-green-300 border border-green-700'   :
                    questionActuelle.level === 'intermediaire'  ? 'bg-blue-900 text-blue-300 border border-blue-700'      :
                                                                  'bg-purple-900 text-purple-300 border border-purple-700'
                  }>
                    {questionActuelle.level === 'debutant' ? 'Débutant' : questionActuelle.level === 'intermediaire' ? 'Intermédiaire' : 'Expert'}
                  </Badge>
                </div>

                {/* Timer */}
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={timerUrgent ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    <Timer className={`w-6 h-6 ${getCouleurTimer()}`} />
                  </motion.div>
                  <motion.span
                    key={tempsRestant}
                    className={`text-2xl font-bold ${getCouleurTimer()}`}
                    initial={{ scale: timerUrgent ? 1.3 : 1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {animationEnCours ? '—' : `${tempsRestant}s`}
                  </motion.span>
                </div>
              </div>

              {/* Barre timer */}
              {!animationEnCours && (
                <div className="mt-3 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      timerUrgent    ? 'bg-red-500'    :
                      timerAttention ? 'bg-orange-500' : 'bg-orange-400'
                    }`}
                    animate={{ width: `${(tempsRestant / DUREE_QUESTION) * 100}%` }}
                    transition={{ duration: 0.9, ease: 'linear' }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Question — slide depuis la droite (remplace l'animation CSS) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={indexActuel}
            initial={{ opacity: 0, x: 120 }}
            animate={{ opacity: 1, x: 0   }}
            exit={{    opacity: 0, x: -80 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <Card className="mb-6 bg-gray-900 border-2 border-orange-700">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-white mb-6">
                  {questionActuelle.question}
                </h2>

                {/* Boutons — cascade */}
                <motion.div
                  className="space-y-3"
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
                >
                  {questionActuelle.options.map((option, index) => {
                    const answered   = reponseSelectionnee !== null;
                    const isSelected = reponseSelectionnee === index;
                    const isCorrect  = index === questionActuelle.correctAnswer;

                    let styleBouton = 'border-2 border-gray-600 bg-gray-800 text-white hover:border-orange-500 hover:bg-orange-950';
                    if (answered) {
                      if (isCorrect)            styleBouton = 'border-2 border-green-500 bg-green-900 text-green-200';
                      else if (isSelected)      styleBouton = 'border-2 border-red-500 bg-red-900 text-red-200';
                      else                      styleBouton = 'border-2 border-gray-700 bg-gray-800 text-gray-500 opacity-50';
                    }

                    return (
                      <motion.button
                        key={index}
                        onClick={() => handleSelectAnswer(index)}
                        disabled={answered || animationEnCours || !timerActif}
                        className={`w-full p-4 rounded-lg text-left transition-colors ${styleBouton} disabled:cursor-not-allowed`}
                        variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}
                        whileHover={!answered && timerActif ? { scale: 1.01, x: 4 } : {}}
                        whileTap={!answered && timerActif ? { scale: 0.98 } : {}}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center font-medium text-sm shrink-0">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span>{option}</span>

                          {/* Icône feedback */}
                          <AnimatePresence>
                            {answered && (isSelected || isCorrect) && (
                              <motion.div
                                className="ml-auto"
                                initial={{ scale: 0, rotate: -90 }}
                                animate={{ scale: 1, rotate: 0   }}
                                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                              >
                                {isCorrect
                                  ? <ChevronRight className="w-5 h-5 text-green-400" />
                                  : <XCircle      className="w-5 h-5 text-red-400"   />
                                }
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.button>
                    );
                  })}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Message "Préparez-vous" pendant l'animation */}
        <AnimatePresence>
          {animationEnCours && (
            <motion.div
              className="text-center text-orange-400 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.5, 1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              Préparez-vous...
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
