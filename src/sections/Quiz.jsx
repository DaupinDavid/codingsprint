// ================================================================
// Quiz.jsx — LA PAGE DE QUIZ
// ================================================================
// Cette page gère un quiz de 20 questions.
//
// Déroulement :
//   1. Une question s'affiche avec 4 réponses possibles
//   2. Le joueur a 45 secondes pour répondre
//   3. Après le clic, la bonne réponse s'affiche en vert
//   4. Une explication apparaît, puis on passe à la question suivante
//   5. À la fin, on affiche les résultats (score, XP, badges)
//   6. Si score >= 12/20, le niveau est validé
//
// Props reçues depuis App.jsx :
//   - niveau     → 'debutant', 'intermediaire' ou 'expert'
//   - surTermine → fonction appelée quand le quiz est terminé
//   - surQuitter → fonction appelée quand on clique "Quitter"
// ================================================================

import { useState, useEffect, useCallback } from 'react'
import { questionsDebutant, questionsIntermediaire, questionsExpert } from '../data/questions.js'
import { useStore, BADGES_DISPONIBLES } from '../store/store.js'
import { Timer, CheckCircle, XCircle, AlertCircle, ChevronRight, Trophy, Star } from 'lucide-react'

// Durée maximale pour répondre à une question (en secondes)
const TEMPS_PAR_QUESTION = 45

export function Quiz({ niveau, surTermine, surQuitter }) {

  // On choisit les questions selon le niveau
  const questions = {
    debutant:      questionsDebutant,
    intermediaire: questionsIntermediaire,
    expert:        questionsExpert
  }[niveau]

  // Fonctions du store pour sauvegarder la progression
  const { ajouterXP, terminerNiveau, sauvegarderResultatsQuiz } = useStore()

  // Index de la question affichée (0 = première question)
  const [questionActuelle, setQuestionActuelle] = useState(0)

  // Index de la réponse cliquée (null = pas encore répondu)
  const [reponseChoisie, setReponseChoisie] = useState(null)

  // Liste des résultats de chaque question (correct ou non, temps passé)
  const [resultats, setResultats] = useState([])

  // Secondes restantes pour répondre
  const [tempsRestant, setTempsRestant] = useState(TEMPS_PAR_QUESTION)

  // Afficher ou non l'explication sous les réponses
  const [montrerExplication, setMontrerExplication] = useState(false)

  // Le quiz est-il terminé ?
  const [quizTermine, setQuizTermine] = useState(false)

  // Badge débloqué pendant le quiz (pour l'afficher à la fin)
  const [nouveauBadge, setNouveauBadge] = useState(null)

  // Raccourci vers la question actuelle
  const question = questions[questionActuelle]

  // ----------------------------------------------------------------
  // GESTION DU TIMER
  // Quand le temps est écoulé → on enregistre une réponse vide
  // ----------------------------------------------------------------
  const tempsEcoule = useCallback(() => {
    if (reponseChoisie === null) {
      const resultat = {
        idQuestion:    question.id,
        reponseChoisie: -1,    // -1 = pas de réponse
        correct:       false,
        tempsPasse:    TEMPS_PAR_QUESTION
      }
      setResultats(prev => [...prev, resultat])
      setMontrerExplication(true)
    }
  }, [question, reponseChoisie])

  // Le timer se déclenche chaque seconde sauf si l'explication est visible
  useEffect(() => {
    if (montrerExplication || quizTermine) return

    const minuterie = setInterval(() => {
      setTempsRestant(prev => {
        if (prev <= 1) { tempsEcoule(); return 0 }
        return prev - 1
      })
    }, 1000)

    // On efface la minuterie quand le composant change
    return () => clearInterval(minuterie)
  }, [questionActuelle, montrerExplication, quizTermine, tempsEcoule])

  // ----------------------------------------------------------------
  // CLIC SUR UNE RÉPONSE
  // ----------------------------------------------------------------
  function choisirReponse(index) {
    // Si déjà répondu, on ignore
    if (reponseChoisie !== null || montrerExplication) return

    setReponseChoisie(index)

    const resultat = {
      idQuestion:     question.id,
      reponseChoisie: index,
      correct:        index === question.correctAnswer,
      tempsPasse:     TEMPS_PAR_QUESTION - tempsRestant
    }
    setResultats(prev => [...prev, resultat])
    setMontrerExplication(true)
  }

  // ----------------------------------------------------------------
  // PASSER À LA QUESTION SUIVANTE
  // ----------------------------------------------------------------
  function questionSuivante() {
    if (questionActuelle < questions.length - 1) {
      // Il reste des questions → on avance
      setQuestionActuelle(questionActuelle + 1)
      setReponseChoisie(null)
      setMontrerExplication(false)
      setTempsRestant(TEMPS_PAR_QUESTION)
    } else {
      // C'était la dernière → on termine le quiz
      terminerLeQuiz()
    }
  }

  // ----------------------------------------------------------------
  // FIN DU QUIZ
  // ----------------------------------------------------------------
  function terminerLeQuiz() {
    const tousLesResultats = [...resultats]
    const nbBonnes  = tousLesResultats.filter(r => r.correct).length
    const tempsTotal = tousLesResultats.reduce((total, r) => total + r.tempsPasse, 0)

    // Calcul des XP : 10 par bonne réponse + 100 bonus si score parfait
    const xpGagne = nbBonnes * 10 + (nbBonnes === 20 ? 100 : 0)
    ajouterXP(xpGagne)
    sauvegarderResultatsQuiz(niveau, tousLesResultats)

    // On valide le niveau si le joueur a au moins 12/20
    if (nbBonnes >= 12) terminerNiveau(niveau)

    // Vérification des badges spéciaux
    if (nbBonnes === 20) {
      setNouveauBadge(BADGES_DISPONIBLES.SCORE_PARFAIT.nom)
    } else if (tempsTotal < 600) {
      setNouveauBadge(BADGES_DISPONIBLES.RAPIDITE.nom)
    }

    setQuizTermine(true)
  }

  // ----------------------------------------------------------------
  // STYLE D'UN BOUTON DE RÉPONSE selon si on a répondu ou non
  // ----------------------------------------------------------------
  function styleReponse(index) {
    // Avant de répondre → style neutre avec hover
    if (reponseChoisie === null) {
      return 'hover:bg-amber-50 border-2 border-gray-200 hover:border-amber-300'
    }
    // La réponse choisie par le joueur
    if (reponseChoisie === index) {
      return index === question.correctAnswer
        ? 'bg-green-100 border-2 border-green-500'   // Bonne réponse → vert
        : 'bg-red-100 border-2 border-red-500'        // Mauvaise réponse → rouge
    }
    // La bonne réponse (si le joueur a mal répondu)
    if (index === question.correctAnswer) {
      return 'bg-green-100 border-2 border-green-500'
    }
    // Les autres réponses → grisées
    return 'bg-gray-50 border-2 border-gray-200 opacity-50'
  }

  function nomDuNiveau() {
    switch (niveau) {
      case 'debutant':      return 'Débutant'
      case 'intermediaire': return 'Intermédiaire'
      case 'expert':        return 'Expert'
    }
  }

  // ================================================================
  // ÉCRAN DE RÉSULTATS (affiché à la fin du quiz)
  // ================================================================
  if (quizTermine) {
    const nbBonnes  = resultats.filter(r => r.correct).length
    const pourcentage = Math.round((nbBonnes / questions.length) * 100)
    const reussi    = nbBonnes >= 12  // Passage à 12/20

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">

          {/* Carte principale des résultats */}
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">

            {/* Badge débloqué (si applicable) */}
            {nouveauBadge && (
              <div className="mb-6">
                <span className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full text-lg font-semibold animate-bounce">
                  <Trophy className="w-5 h-5" />
                  Nouveau badge : {nouveauBadge}
                </span>
              </div>
            )}

            {/* Icône de résultat */}
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${reussi ? 'bg-green-100' : 'bg-red-100'}`}>
              {reussi
                ? <Trophy className="w-12 h-12 text-green-600" />
                : <AlertCircle className="w-12 h-12 text-red-600" />
              }
            </div>

            <h2 className="text-3xl font-bold mb-2">
              {reussi ? 'Félicitations !' : 'Quiz terminé'}
            </h2>
            <p className="text-gray-600 mb-6">
              {reussi
                ? `Vous avez validé le niveau ${nomDuNiveau()} !`
                : `Score minimum non atteint (12/20 requis). Vous pouvez réessayer.`
              }
            </p>

            {/* Statistiques */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-amber-600">{nbBonnes}/20</div>
                <div className="text-sm text-gray-600">Bonnes réponses</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{pourcentage}%</div>
                <div className="text-sm text-gray-600">Score</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">+{nbBonnes * 10}</div>
                <div className="text-sm text-gray-600">XP gagné</div>
              </div>
            </div>

            {/* Bouton de retour */}
            {reussi ? (
              <button
                onClick={surTermine}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Continuer
              </button>
            ) : (
              <>
                <button
                  onClick={surTermine}
                  className="w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-50 mb-2"
                >
                  Retour à l'accueil
                </button>
                <p className="text-sm text-gray-500">Vous pouvez réessayer le quiz plus tard</p>
              </>
            )}

          </div>

          {/* Révision de toutes les réponses */}
          <div className="bg-white rounded-xl shadow-sm border mt-6 p-6">
            <h3 className="font-bold text-lg mb-4">Révision des réponses</h3>
            <div className="space-y-4">
              {resultats.map((resultat, idx) => {
                const q = questions.find(q => q.id === resultat.idQuestion)
                if (!q) return null
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg ${resultat.correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
                  >
                    <div className="flex items-start gap-3">
                      {resultat.correct
                        ? <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        : <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      }
                      <div className="flex-1">
                        <p className="font-medium mb-2">{q.question}</p>
                        <p className="text-sm text-gray-600">
                          Votre réponse : {resultat.reponseChoisie >= 0 ? q.options[resultat.reponseChoisie] : 'Temps écoulé'}
                        </p>
                        {!resultat.correct && (
                          <p className="text-sm text-green-600 mt-1">
                            Bonne réponse : {q.options[q.correctAnswer]}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 mt-2 italic">{q.explanation}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    )
  }

  // ================================================================
  // ÉCRAN DE JEU (une question à la fois)
  // ================================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">

        {/* En-tête : bouton quitter + nom du niveau */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={surQuitter}
            className="px-4 py-2 text-gray-600 hover:bg-white/50 rounded-lg transition-colors"
          >
            Quitter
          </button>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            <span className="font-medium">{nomDuNiveau()}</span>
          </div>
          <div className="w-20" /> {/* Espace vide pour centrer le titre */}
        </div>

        {/* Barre de progression */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {questionActuelle + 1} sur {questions.length}</span>
            <span>{Math.round(((questionActuelle + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-amber-100 rounded-full h-2">
            <div
              className="bg-amber-500 h-2 rounded-full transition-all"
              style={{ width: `${((questionActuelle + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Timer : devient rouge sous 10 secondes */}
        <div className={`mb-6 bg-white rounded-xl border p-4 shadow-sm ${tempsRestant <= 10 ? 'border-red-400' : ''}`}>
          <div className="flex items-center justify-center gap-3">
            <Timer className={`w-6 h-6 ${tempsRestant <= 10 ? 'text-red-500 animate-pulse' : 'text-amber-600'}`} />
            <span className={`text-2xl font-bold ${tempsRestant <= 10 ? 'text-red-500' : 'text-amber-900'}`}>
              {tempsRestant}s
            </span>
          </div>
        </div>

        {/* Question + choix de réponses */}
        <div className="mb-6 bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-xl font-bold mb-6">{question.question}</h2>
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => choisirReponse(index)}
                disabled={reponseChoisie !== null}
                className={`w-full p-4 rounded-lg text-left transition-all ${styleReponse(index)}`}
              >
                <div className="flex items-center gap-3">
                  {/* Lettre : A, B, C, D */}
                  <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-medium text-sm flex-shrink-0">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                  {/* Icône après le clic */}
                  {reponseChoisie === index && (
                    index === question.correctAnswer
                      ? <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                      : <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                  )}
                  {reponseChoisie !== null && index === question.correctAnswer && reponseChoisie !== index && (
                    <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Explication + bouton "Suivant" (apparaît après le clic) */}
        {montrerExplication && (
          <div className={`mb-6 rounded-xl border p-4 shadow-sm ${
            reponseChoisie === question.correctAnswer
              ? 'bg-green-50 border-green-300'
              : 'bg-amber-50 border-amber-300'
          }`}>
            <div className="flex items-start gap-3">
              {reponseChoisie === question.correctAnswer
                ? <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                : <AlertCircle className="w-6 h-6 text-amber-500 mt-0.5 flex-shrink-0" />
              }
              <div>
                <p className="font-medium mb-1">
                  {reponseChoisie === question.correctAnswer ? 'Bonne réponse !' : 'Explication'}
                </p>
                <p className="text-gray-600">{question.explanation}</p>
              </div>
            </div>
            <button
              onClick={questionSuivante}
              className="mt-4 w-full py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              {questionActuelle < questions.length - 1
                ? <> Question suivante <ChevronRight className="w-4 h-4" /> </>
                : 'Voir les résultats'
              }
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
