"use client";
/**
 * ============================================
 * PAGE DU QUIZ (Quiz.tsx)
 * ============================================
 * 
 * Cette page affiche le quiz interactif avec :
 * - Un compte à rebours de 45 secondes par question
 * - 4 réponses possibles (boutons cliquables)
 * - Une explication après chaque réponse
 * - Un récapitulatif des résultats à la fin
 * 
 * Le timer se décrémente automatiquement et passe
 * à la question suivante si le temps est écoulé.
 */

import { useState, useEffect, useCallback } from 'react';
import { debutantQuestions, intermediaireQuestions, expertQuestions } from '@/data/questions';
import type { DifficultyLevel, QuizResult } from '@/types';
import { useGameStore, AVAILABLE_BADGES } from '@/store/gameStore';

// Icônes
import { Timer, CheckCircle, XCircle, AlertCircle, ChevronRight, Trophy, Star } from 'lucide-react';

// Composants UI
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// ============================================
// PROPS
// ============================================

interface QuizProps {
  /** Niveau du quiz à afficher */
  level: DifficultyLevel;
  /** Fonction appelée quand le quiz est terminé */
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

export function Quiz({ level, onComplete, onExit }: QuizProps) {
  // ============================================
  // RÉCUPÉRATION DES QUESTIONS
  // ============================================
  // Selon le niveau, on récupère le bon tableau de questions
  const questions = {
    debutant: debutantQuestions,
    intermediaire: intermediaireQuestions,
    expert: expertQuestions
  }[level];

  // ============================================
  // STORE (données globales)
  // ============================================
  const { addXP, completeLevel, saveQuizResults } = useGameStore();
  
  // ============================================
  // ÉTATS LOCAUX
  // ============================================
  
  // Index de la question actuelle (0 à 19)
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  // Index de la réponse sélectionnée (-1 = aucune)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  
  // Tableau des résultats de toutes les questions
  const [results, setResults] = useState<QuizResult[]>([]);
  
  // Temps restant (en secondes)
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  
  // Afficher l'explication ?
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Quiz terminé ?
  const [quizCompleted, setQuizCompleted] = useState(false);
  
  // Nouveau badge débloqué ?
  const [newBadge, setNewBadge] = useState<string | null>(null);

  // Question actuelle
  const currentQ = questions[currentQuestion];

  // ============================================
  // EFFET : Gestion du timer
  // ============================================
  useEffect(() => {
    // Si on montre l'explication ou que le quiz est fini, on arrête le timer
    if (showExplanation || quizCompleted) return;

    // Crée un intervalle qui décrémente le timer chaque seconde
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp();  // Temps écoulé !
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Nettoyage : supprime l'intervalle quand le composant se démonte
    return () => clearInterval(timer);
  }, [currentQuestion, showExplanation, quizCompleted]);

  // ============================================
  // FONCTION : Temps écoulé
  // ============================================
  const handleTimeUp = useCallback(() => {
    if (selectedAnswer === null) {
      // Crée un résultat "faux" car temps écoulé
      const result: QuizResult = {
        questionId: currentQ.id,
        selectedAnswer: -1,  // -1 = temps écoulé
        correct: false,
        timeSpent: QUESTION_TIME
      };
      setResults([...results, result]);
      setShowExplanation(true);
    }
  }, [currentQ, results, selectedAnswer]);

  // ============================================
  // FONCTION : Sélectionner une réponse
  // ============================================
  const handleSelectAnswer = (index: number) => {
    // Empêche de changer de réponse si déjà sélectionnée
    if (selectedAnswer !== null || showExplanation) return;
    
    setSelectedAnswer(index);
    
    // Crée le résultat
    const result: QuizResult = {
      questionId: currentQ.id,
      selectedAnswer: index,
      correct: index === currentQ.correctAnswer,
      timeSpent: QUESTION_TIME - timeLeft
    };
    
    setResults([...results, result]);
    setShowExplanation(true);
  };

  // ============================================
  // FONCTION : Question suivante
  // ============================================
  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      // Passe à la question suivante
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setTimeLeft(QUESTION_TIME);  // Réinitialise le timer
    } else {
      // Dernière question -> fin du quiz
      finishQuiz();
    }
  };

  // ============================================
  // FONCTION : Terminer le quiz
  // ============================================
  const finishQuiz = () => {
    // Compte les bonnes réponses
    const correctCount = results.filter(r => r.correct).length;
    
    // Calcule le temps total
    const totalTime = results.reduce((sum, r) => sum + r.timeSpent, 0);
    
    // Calcule les XP gagnés (10 XP par bonne réponse + bonus 100 si parfait)
    const xpEarned = correctCount * 10 + (correctCount === 20 ? 100 : 0);
    addXP(xpEarned);
    
    // Sauvegarde les résultats
    saveQuizResults(level, results);
    
    // Valide le niveau si score >= 12/20
    if (correctCount >= 12) {
      completeLevel(level);
    }
    
    // Vérifie les badges
    if (correctCount === 20) {
      setNewBadge(AVAILABLE_BADGES.PERFECT_QUIZ.name);
    } else if (totalTime < 600) {
      setNewBadge(AVAILABLE_BADGES.SPEED_RUNNER.name);
    }
    
    setQuizCompleted(true);
  };

  // ============================================
  // FONCTION : Nom du niveau
  // ============================================
  const getLevelName = () => {
    switch (level) {
      case 'debutant': return 'Débutant';
      case 'intermediaire': return 'Intermédiaire';
      case 'expert': return 'Expert';
    }
  };

  // ============================================
  // RENDU : Écran de résultats
  // ============================================
  if (quizCompleted) {
    const correctCount = results.filter(r => r.correct).length;
    const percentage = Math.round((correctCount / questions.length) * 100);
    const passed = correctCount >= 12;  // 12/20 minimum pour valider

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          
          {/* Carte principale des résultats */}
          <Card className="text-center">
            <CardContent className="p-8">
              {/* Badge nouveau */}
              {newBadge && (
                <div className="mb-6 animate-bounce">
                  <Badge className="bg-yellow-400 text-yellow-900 px-4 py-2 text-lg">
                    <Trophy className="w-5 h-5 mr-2" />
                    Nouveau badge débloqué : {newBadge}
                  </Badge>
                </div>
              )}

              {/* Icône de résultat */}
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
                passed ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {passed ? (
                  <Trophy className="w-12 h-12 text-green-600" />
                ) : (
                  <AlertCircle className="w-12 h-12 text-red-600" />
                )}
              </div>

              {/* Titre */}
              <h2 className="text-3xl font-bold mb-2">
                {passed ? 'Félicitations !' : 'Quiz terminé'}
              </h2>
              <p className="text-gray-600 mb-6">
                {passed 
                  ? `Vous avez validé le niveau ${getLevelName()} !`
                  : `Vous n'avez pas atteint le score minimum (12/20) pour valider le niveau.`
                }
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-amber-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-amber-600">{correctCount}/20</div>
                  <div className="text-sm text-gray-600">Bonnes réponses</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{percentage}%</div>
                  <div className="text-sm text-gray-600">Score</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">+{correctCount * 10}</div>
                  <div className="text-sm text-gray-600">XP gagné</div>
                </div>
              </div>

              {/* Bouton de retour */}
              <div className="space-y-3">
                {passed ? (
                  <Button 
                    onClick={onComplete}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    size="lg"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Continuer
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={onComplete}
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      Retour à l'accueil
                    </Button>
                    <p className="text-sm text-gray-500">
                      Vous pouvez réessayer le quiz plus tard
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Révision des réponses */}
          <Card className="mt-6">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">Révision des réponses</h3>
              <div className="space-y-4">
                {results.map((result, idx) => {
                  const question = questions.find(q => q.id === result.questionId);
                  if (!question) return null;
                  
                  return (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-lg ${
                        result.correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {result.correct ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium mb-2">{question.question}</p>
                          <p className="text-sm text-gray-600">
                            Votre réponse: {result.selectedAnswer >= 0 ? question.options[result.selectedAnswer] : 'Temps écoulé'}
                          </p>
                          {!result.correct && (
                            <p className="text-sm text-green-600 mt-1">
                              Bonne réponse: {question.options[question.correctAnswer]}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 mt-2 italic">
                            {question.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDU : Interface du quiz en cours
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
            <Star className="w-5 h-5 text-amber-500" />
            <span className="font-medium">{getLevelName()}</span>
          </div>
          <div className="w-20" />
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
                    {/* Lettre (A, B, C, D) */}
                    <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-medium text-sm">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{option}</span>
                    
                    {/* Icône de validation */}
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

        {/* Explication (affichée après réponse) */}
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
              
              {/* Bouton question suivante */}
              <Button
                onClick={handleNext}
                className="mt-4 w-full bg-gradient-to-r from-amber-600 to-orange-600"
              >
                {currentQuestion < questions.length - 1 ? (
                  <>
                    Question suivante
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
