"use client";
/**
 * ============================================
 * PAGE DE L'EXAMEN FINAL (Exam.tsx)
 * ============================================
 * 
 * Cette page affiche l'examen final avec :
 * - 3 séries de 20 questions (60 questions total)
 * - Questions mélangées de tous les niveaux
 * - Un timer de 45 secondes par question
 * - Un diplôme à la fin si réussi (60% minimum)
 * 
 * L'examen est accessible uniquement après avoir
 * terminé les 3 niveaux (Débutant, Intermédiaire, Expert).
 */

import { useState, useEffect, useCallback } from 'react';
import { examQuestions } from '@/data/questions';
import type { QuizResult, ExamResult } from '@/types';
import { useGameStore, AVAILABLE_BADGES } from '@/store/gameStore';

// Icônes
import { Timer, CheckCircle, XCircle, AlertCircle, ChevronRight, Trophy, GraduationCap, Medal } from 'lucide-react';

// Composants UI
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// ============================================
// PROPS
// ============================================

interface ExamProps {
  /** Fonction appelée quand l'examen est terminé */
  onComplete: () => void;
  /** Fonction appelée quand l'utilisateur quitte */
  onExit: () => void;
}

// ============================================
// CONSTANTES
// ============================================

const QUESTION_TIME = 45;  // 45 secondes par question

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export function Exam({ onComplete, onExit }: ExamProps) {
  // ============================================
  // STORE
  // ============================================
  const { addXP, saveExamResults } = useGameStore();
  
  // ============================================
  // ÉTATS LOCAUX
  // ============================================
  
  // Série actuelle (0, 1 ou 2)
  const [currentSeries, setCurrentSeries] = useState(0);
  
  // Question actuelle dans la série (0 à 19)
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  // Réponse sélectionnée
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  
  // Résultats de chaque série (tableau de 3 tableaux)
  const [seriesResults, setSeriesResults] = useState<QuizResult[][]>([[], [], []]);
  
  // Timer
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  
  // Afficher l'explication ?
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Examen terminé ?
  const [examCompleted, setExamCompleted] = useState(false);
  
  // Nouveau badge débloqué ?
  const [newBadge, setNewBadge] = useState<string | null>(null);

  // Questions de la série actuelle
  const questions = examQuestions[currentSeries];
  const currentQ = questions[currentQuestion];

  // ============================================
  // EFFET : Timer
  // ============================================
  useEffect(() => {
    if (showExplanation || examCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, showExplanation, examCompleted, currentSeries]);

  // ============================================
  // FONCTION : Temps écoulé
  // ============================================
  const handleTimeUp = useCallback(() => {
    if (selectedAnswer === null) {
      const result: QuizResult = {
        questionId: currentQ.id,
        selectedAnswer: -1,
        correct: false,
        timeSpent: QUESTION_TIME
      };
      // Ajoute le résultat à la série actuelle
      const newResults = [...seriesResults];
      newResults[currentSeries] = [...newResults[currentSeries], result];
      setSeriesResults(newResults);
      setShowExplanation(true);
    }
  }, [currentQ, seriesResults, currentSeries, selectedAnswer]);

  // ============================================
  // FONCTION : Sélectionner une réponse
  // ============================================
  const handleSelectAnswer = (index: number) => {
    if (selectedAnswer !== null || showExplanation) return;
    
    setSelectedAnswer(index);
    
    const result: QuizResult = {
      questionId: currentQ.id,
      selectedAnswer: index,
      correct: index === currentQ.correctAnswer,
      timeSpent: QUESTION_TIME - timeLeft
    };
    
    // Sauvegarde dans la série actuelle
    const newResults = [...seriesResults];
    newResults[currentSeries] = [...newResults[currentSeries], result];
    setSeriesResults(newResults);
    setShowExplanation(true);
  };

  // ============================================
  // FONCTION : Question suivante
  // ============================================
  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      // Passe à la question suivante dans la même série
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setTimeLeft(QUESTION_TIME);
    } else {
      // Fin de la série
      const seriesScore = seriesResults[currentSeries].filter(r => r.correct).length;
      
      // Sauvegarde le résultat de cette série
      const examResult: ExamResult = {
        series: currentSeries + 1,
        score: seriesScore,
        totalQuestions: 20,
        completedAt: new Date()
      };
      saveExamResults(examResult);
      
      if (currentSeries < 2) {
        // Passe à la série suivante
        setCurrentSeries(currentSeries + 1);
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setTimeLeft(QUESTION_TIME);
      } else {
        // Fin de l'examen (3 séries terminées)
        finishExam();
      }
    }
  };

  // ============================================
  // FONCTION : Terminer l'examen
  // ============================================
  const finishExam = () => {
    // Compte toutes les bonnes réponses sur les 3 séries
    const totalCorrect = seriesResults.flat().filter(r => r.correct).length;
    
    // XP : 15 par bonne réponse + bonus de 500
    const xpEarned = totalCorrect * 15 + 500;
    addXP(xpEarned);
    
    // Débloque le badge Diplômé
    setNewBadge(AVAILABLE_BADGES.EXAM_COMPLETE.name);
    setExamCompleted(true);
  };

  // ============================================
  // RENDU : Écran de résultats
  // ============================================
  if (examCompleted) {
    const totalCorrect = seriesResults.flat().filter(r => r.correct).length;
    const totalQuestions = 60;
    const percentage = Math.round((totalCorrect / totalQuestions) * 100);
    const passed = totalCorrect >= 36;  // 60% pour réussir

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          
          <Card className="text-center border-amber-400">
            <CardContent className="p-8">
              {/* Badge nouveau */}
              {newBadge && (
                <div className="mb-6 animate-bounce">
                  <Badge className="bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 px-4 py-2 text-lg">
                    <Medal className="w-5 h-5 mr-2" />
                    Nouveau badge débloqué : {newBadge}
                  </Badge>
                </div>
              )}

              {/* Icône */}
              <div className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6 ${
                passed ? 'bg-gradient-to-br from-amber-100 to-yellow-100' : 'bg-red-100'
              }`}>
                {passed ? (
                  <GraduationCap className="w-14 h-14 text-amber-600" />
                ) : (
                  <AlertCircle className="w-14 h-14 text-red-600" />
                )}
              </div>

              {/* Titre */}
              <h2 className="text-4xl font-bold mb-2 text-amber-900">
                {passed ? 'Diplôme obtenu !' : 'Examen terminé'}
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                {passed 
                  ? 'Félicitations ! Vous êtes maintenant un expert du Moyen-Âge !'
                  : 'Vous pouvez retenter l\'examen pour améliorer votre score.'
                }
              </p>

              {/* Scores par série */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {seriesResults.map((results, idx) => {
                  const score = results.filter(r => r.correct).length;
                  return (
                    <div key={idx} className="bg-amber-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-amber-600">{score}/20</div>
                      <div className="text-sm text-gray-600">Série {idx + 1}</div>
                    </div>
                  );
                })}
              </div>

              {/* Stats globales */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{totalCorrect}/{totalQuestions}</div>
                  <div className="text-sm text-gray-600">Total bonnes réponses</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{percentage}%</div>
                  <div className="text-sm text-gray-600">Score global</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">+{totalCorrect * 15 + 500}</div>
                  <div className="text-sm text-gray-600">XP gagné</div>
                </div>
              </div>

              {/* Certificat (si réussi) */}
              {passed && (
                <div className="bg-gradient-to-r from-amber-100 to-yellow-100 p-6 rounded-lg mb-6">
                  <Trophy className="w-12 h-12 text-amber-600 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-amber-900 mb-2">Certificat de réussite</h3>
                  <p className="text-amber-800">
                    Wikipedia Learn certifie que vous avez maîtrisé le programme sur le Moyen-Âge
                  </p>
                </div>
              )}

              {/* Bouton retour */}
              <Button 
                onClick={onComplete}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                size="lg"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Retour à l'accueil
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDU : Interface de l'examen en cours
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        
        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onExit}>
            Quitter
          </Button>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-amber-600" />
            <span className="font-medium">Examen Final</span>
          </div>
          <div className="w-20" />
        </div>

        {/* Indicateur de série */}
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                s === currentSeries + 1
                  ? 'bg-amber-600 text-white'      // Série active
                  : s < currentSeries + 1
                    ? 'bg-green-500 text-white'    // Série terminée
                    : 'bg-gray-200 text-gray-500'  // Série future
              }`}
            >
              Série {s}
            </div>
          ))}
        </div>

        {/* Barre de progression */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestion + 1} sur {questions.length}</span>
            <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
          </div>
          <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-2" />
        </div>

        {/* Timer */}
        <Card className={`mb-6 ${timeLeft <= 10 ? 'border-red-400' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-3">
              <Timer className={`w-6 h-6 ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-amber-600'}`} />
              <span className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-amber-900'}`}>
                {timeLeft}s
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Question */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-6">{currentQ.question}</h2>
            
            {/* Boutons de réponses */}
            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(index)}
                  disabled={selectedAnswer !== null}
                  className={`w-full p-4 rounded-lg text-left transition-all ${
                    selectedAnswer === null
                      ? 'hover:bg-amber-50 border-2 border-gray-200 hover:border-amber-300'
                      : selectedAnswer === index
                        ? index === currentQ.correctAnswer
                          ? 'bg-green-100 border-2 border-green-500'
                          : 'bg-red-100 border-2 border-red-500'
                        : index === currentQ.correctAnswer && selectedAnswer !== null
                          ? 'bg-green-100 border-2 border-green-500'
                          : 'bg-gray-50 border-2 border-gray-200 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-medium text-sm">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{option}</span>
                    {selectedAnswer === index && (
                      index === currentQ.correctAnswer ? (
                        <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                      )
                    )}
                    {selectedAnswer !== null && index === currentQ.correctAnswer && selectedAnswer !== index && (
                      <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Explication */}
        {showExplanation && (
          <Card className={`mb-6 ${
            selectedAnswer === currentQ.correctAnswer ? 'bg-green-50 border-green-300' : 'bg-amber-50 border-amber-300'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {selectedAnswer === currentQ.correctAnswer ? (
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-amber-500 mt-0.5" />
                )}
                <div>
                  <p className="font-medium mb-1">
                    {selectedAnswer === currentQ.correctAnswer ? 'Bonne réponse !' : 'Explication'}
                  </p>
                  <p className="text-gray-600">{currentQ.explanation}</p>
                </div>
              </div>
              
              {/* Bouton suivant (question, série ou résultats) */}
              <Button
                onClick={handleNext}
                className="mt-4 w-full bg-gradient-to-r from-amber-600 to-orange-600"
              >
                {currentQuestion < questions.length - 1 ? (
                  <>
                    Question suivante
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                ) : currentSeries < 2 ? (
                  <>
                    Série suivante
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  'Voir les résultats'
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
