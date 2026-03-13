"use client";
/**
 * ============================================
 * PAGE DE L'EXAMEN FINAL (Exam.tsx)
 * ============================================
 * Animations Framer Motion ajoutées :
 * - Questions slident à chaque changement
 * - Boutons de réponse en cascade
 * - Feedback vert/rouge animé
 * - Transition entre les séries (flash + bounce)
 * - Explication glisse vers le haut
 * - Écran résultats avec diplôme animé et stats en cascade
 * - Badge diplôme pop avec spring
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { examQuestions } from '@/data/questions';
import type { QuizResult, ExamResult } from '@/types';
import { useGameStore, AVAILABLE_BADGES } from '@/store/gameStore';

import { Timer, CheckCircle, XCircle, AlertCircle, ChevronRight, Trophy, GraduationCap, Medal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// ============================================
// PROPS
// ============================================

interface ExamProps {
  onComplete: () => void;
  onExit: () => void;
}

const QUESTION_TIME = 45;

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export function Exam({ onComplete, onExit }: ExamProps) {
  const { addXP, saveExamResults } = useGameStore();

  const [currentSeries,   setCurrentSeries]   = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer,  setSelectedAnswer]  = useState<number | null>(null);
  const [seriesResults,   setSeriesResults]   = useState<QuizResult[][]>([[], [], []]);
  const [timeLeft,        setTimeLeft]        = useState(QUESTION_TIME);
  const [showExplanation, setShowExplanation] = useState(false);
  const [examCompleted,   setExamCompleted]   = useState(false);
  const [newBadge,        setNewBadge]        = useState<string | null>(null);

  // Clé unique par question + série pour forcer le re-mount de l'AnimatePresence
  const questionKey = `${currentSeries}-${currentQuestion}`;

  const questions = examQuestions[currentSeries];
  const currentQ  = questions[currentQuestion];
  const timerUrgent = timeLeft <= 10;

  // ============================================
  // TIMER
  // ============================================
  useEffect(() => {
    if (showExplanation || examCompleted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { handleTimeUp(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentQuestion, showExplanation, examCompleted, currentSeries]);

  const handleTimeUp = useCallback(() => {
    if (selectedAnswer === null) {
      const result: QuizResult = {
        questionId: currentQ.id,
        selectedAnswer: -1,
        correct: false,
        timeSpent: QUESTION_TIME
      };
      const newResults = [...seriesResults];
      newResults[currentSeries] = [...newResults[currentSeries], result];
      setSeriesResults(newResults);
      setShowExplanation(true);
    }
  }, [currentQ, seriesResults, currentSeries, selectedAnswer]);

  const handleSelectAnswer = (index: number) => {
    if (selectedAnswer !== null || showExplanation) return;
    setSelectedAnswer(index);
    const result: QuizResult = {
      questionId: currentQ.id,
      selectedAnswer: index,
      correct: index === currentQ.correctAnswer,
      timeSpent: QUESTION_TIME - timeLeft
    };
    const newResults = [...seriesResults];
    newResults[currentSeries] = [...newResults[currentSeries], result];
    setSeriesResults(newResults);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setTimeLeft(QUESTION_TIME);
    } else {
      const seriesScore = seriesResults[currentSeries].filter(r => r.correct).length;
      const examResult: ExamResult = {
        series: currentSeries + 1,
        score: seriesScore,
        totalQuestions: 20,
        completedAt: new Date()
      };
      saveExamResults(examResult);

      if (currentSeries < 2) {
        setCurrentSeries(currentSeries + 1);
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setTimeLeft(QUESTION_TIME);
      } else {
        finishExam();
      }
    }
  };

  const finishExam = () => {
    const totalCorrect = seriesResults.flat().filter(r => r.correct).length;
    const xpEarned = totalCorrect * 15 + 500;
    addXP(xpEarned);
    setNewBadge(AVAILABLE_BADGES.EXAM_COMPLETE.name);
    setExamCompleted(true);
  };

  // ============================================
  // RENDU : Résultats finaux
  // ============================================
  if (examCompleted) {
    const totalCorrect   = seriesResults.flat().filter(r => r.correct).length;
    const totalQuestions = 60;
    const percentage     = Math.round((totalCorrect / totalQuestions) * 100);
    const passed         = totalCorrect >= 36;

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8">
        <div className="container mx-auto px-4 max-w-3xl">

          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            transition={{ type: 'spring', stiffness: 240, damping: 20 }}
          >
            <Card className="text-center border-amber-400">
              <CardContent className="p-8">

                {/* Badge diplôme */}
                <AnimatePresence>
                  {newBadge && (
                    <motion.div
                      className="mb-6"
                      initial={{ opacity: 0, y: -20, scale: 0.7 }}
                      animate={{ opacity: 1, y: 0,   scale: 1   }}
                      transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.5 }}
                    >
                      <Badge className="bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 px-4 py-2 text-lg">
                        <Medal className="w-5 h-5 mr-2" />
                        Nouveau badge : {newBadge}
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Icône diplôme / fail */}
                <motion.div
                  className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6 ${
                    passed
                      ? 'bg-gradient-to-br from-amber-100 to-yellow-100'
                      : 'bg-red-100'
                  }`}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0    }}
                  transition={{ type: 'spring', stiffness: 240, damping: 18, delay: 0.1 }}
                >
                  {passed
                    ? <GraduationCap className="w-14 h-14 text-amber-600" />
                    : <AlertCircle   className="w-14 h-14 text-red-600"   />
                  }
                </motion.div>

                {/* Titre */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0  }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-4xl font-bold mb-2 text-amber-900">
                    {passed ? 'Diplôme obtenu !' : 'Examen terminé'}
                  </h2>
                  <p className="text-gray-600 mb-6 text-lg">
                    {passed
                      ? 'Félicitations ! Vous êtes maintenant un expert du Moyen-Âge !'
                      : "Vous pouvez retenter l'examen pour améliorer votre score."
                    }
                  </p>
                </motion.div>

                {/* Scores par série — cascade */}
                <motion.div
                  className="grid grid-cols-3 gap-4 mb-6"
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.35 } } }}
                >
                  {seriesResults.map((res, idx) => {
                    const score = res.filter(r => r.correct).length;
                    return (
                      <motion.div
                        key={idx}
                        className="bg-amber-50 p-4 rounded-lg"
                        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                      >
                        <div className="text-2xl font-bold text-amber-600">{score}/20</div>
                        <div className="text-sm text-gray-600">Série {idx + 1}</div>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* Stats globales — cascade */}
                <motion.div
                  className="grid grid-cols-3 gap-4 mb-8"
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.55 } } }}
                >
                  {[
                    { value: `${totalCorrect}/${totalQuestions}`, label: 'Total bonnes réponses', bg: 'bg-green-50',  text: 'text-green-600'  },
                    { value: `${percentage}%`,                    label: 'Score global',           bg: 'bg-blue-50',   text: 'text-blue-600'   },
                    { value: `+${totalCorrect * 15 + 500}`,       label: 'XP gagné',               bg: 'bg-purple-50', text: 'text-purple-600' },
                  ].map(({ value, label, bg, text }) => (
                    <motion.div
                      key={label}
                      className={`${bg} p-4 rounded-lg`}
                      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    >
                      <div className={`text-3xl font-bold ${text}`}>{value}</div>
                      <div className="text-sm text-gray-600">{label}</div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Certificat */}
                <AnimatePresence>
                  {passed && (
                    <motion.div
                      className="bg-gradient-to-r from-amber-100 to-yellow-100 p-6 rounded-lg mb-6"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1   }}
                      transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.7 }}
                    >
                      <motion.div
                        animate={{ rotate: [0, -8, 8, -8, 0] }}
                        transition={{ duration: 0.6, delay: 0.9 }}
                      >
                        <Trophy className="w-12 h-12 text-amber-600 mx-auto mb-3" />
                      </motion.div>
                      <h3 className="text-xl font-bold text-amber-900 mb-2">Certificat de réussite</h3>
                      <p className="text-amber-800">
                        Wikipedia Learn certifie que vous avez maîtrisé le programme sur le Moyen-Âge
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bouton retour */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    onClick={onComplete}
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                    size="lg"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Retour à l'accueil
                  </Button>
                </motion.div>

              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDU : Examen en cours
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">

        {/* En-tête */}
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.4 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="ghost" onClick={onExit}>Quitter</Button>
          </motion.div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-amber-600" />
            <span className="font-medium">Examen Final</span>
          </div>
          <div className="w-20" />
        </motion.div>

        {/* Indicateur de série — les pastilles s'animent au changement */}
        <motion.div
          className="flex justify-center gap-2 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          {[1, 2, 3].map((s) => (
            <motion.div
              key={s}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                s === currentSeries + 1
                  ? 'bg-amber-600 text-white'
                  : s < currentSeries + 1
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
              }`}
              animate={s === currentSeries + 1 ? { scale: [1, 1.12, 1] } : { scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              {s < currentSeries + 1 ? '✓ ' : ''}Série {s}
            </motion.div>
          ))}
        </motion.div>

        {/* Barre de progression */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestion + 1} sur {questions.length}</span>
            <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
          </div>
          <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-2" />
        </motion.div>

        {/* Timer */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1  }}
          transition={{ delay: 0.25 }}
        >
          <Card className={timerUrgent ? 'border-red-400' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-3">
                <motion.div
                  animate={timerUrgent ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.6, repeat: Infinity }}
                >
                  <Timer className={`w-6 h-6 ${timerUrgent ? 'text-red-500' : 'text-amber-600'}`} />
                </motion.div>
                <motion.span
                  key={timeLeft}
                  className={`text-2xl font-bold ${timerUrgent ? 'text-red-500' : 'text-amber-900'}`}
                  initial={{ scale: timerUrgent ? 1.3 : 1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {timeLeft}s
                </motion.span>
              </div>
              {/* Barre de timer */}
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${timerUrgent ? 'bg-red-500' : 'bg-amber-500'}`}
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLeft / QUESTION_TIME) * 100}%` }}
                  transition={{ duration: 0.9, ease: 'linear' }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Question — slide à chaque changement */}
        <AnimatePresence mode="wait">
          <motion.div
            key={questionKey}
            initial={{ opacity: 0, x: 60  }}
            animate={{ opacity: 1, x: 0   }}
            exit={{    opacity: 0, x: -60 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-6">{currentQ.question}</h2>

                {/* Boutons — cascade */}
                <motion.div
                  className="space-y-3"
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
                >
                  {currentQ.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect  = index === currentQ.correctAnswer;
                    const answered   = selectedAnswer !== null;

                    let bgClass = 'hover:bg-amber-50 border-2 border-gray-200 hover:border-amber-300';
                    if (answered) {
                      if (isSelected && isCorrect)  bgClass = 'bg-green-100 border-2 border-green-500';
                      else if (isSelected)           bgClass = 'bg-red-100 border-2 border-red-500';
                      else if (isCorrect)            bgClass = 'bg-green-100 border-2 border-green-500';
                      else                           bgClass = 'bg-gray-50 border-2 border-gray-200 opacity-50';
                    }

                    return (
                      <motion.button
                        key={index}
                        onClick={() => handleSelectAnswer(index)}
                        disabled={answered}
                        className={`w-full p-4 rounded-lg text-left transition-colors ${bgClass}`}
                        variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}
                        whileHover={!answered ? { scale: 1.01, x: 4 } : {}}
                        whileTap={!answered ? { scale: 0.98 } : {}}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-medium text-sm shrink-0">
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
                                  ? <CheckCircle className="w-5 h-5 text-green-500" />
                                  : <XCircle     className="w-5 h-5 text-red-500"   />
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

        {/* Explication — glisse vers le haut */}
        <AnimatePresence>
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0  }}
              exit={{    opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`mb-6 ${
                selectedAnswer === currentQ.correctAnswer
                  ? 'bg-green-50 border-green-300'
                  : 'bg-amber-50 border-amber-300'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {selectedAnswer === currentQ.correctAnswer
                      ? <CheckCircle className="w-6 h-6 text-green-500 mt-0.5" />
                      : <AlertCircle className="w-6 h-6 text-amber-500 mt-0.5" />
                    }
                    <div>
                      <p className="font-medium mb-1">
                        {selectedAnswer === currentQ.correctAnswer ? 'Bonne réponse !' : 'Explication'}
                      </p>
                      <p className="text-gray-600">{currentQ.explanation}</p>
                    </div>
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      onClick={handleNext}
                      className="mt-4 w-full bg-gradient-to-r from-amber-600 to-orange-600"
                    >
                      {currentQuestion < questions.length - 1 ? (
                        <>Question suivante <ChevronRight className="w-4 h-4 ml-2" /></>
                      ) : currentSeries < 2 ? (
                        <>Série suivante <ChevronRight className="w-4 h-4 ml-2" /></>
                      ) : (
                        'Voir les résultats'
                      )}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
