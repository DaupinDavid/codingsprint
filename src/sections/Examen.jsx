// ================================================================
// Examen.jsx — LA PAGE D'EXAMEN FINAL
// ================================================================
// Cette page gère l'examen final composé de 3 séries de 20 questions.
// Fonctionnement identique au Quiz, mais en 3 rounds enchaînés.
//
// Déroulement :
//   Série 1 (20 questions) → Série 2 (20 questions) → Série 3 (20 questions)
//   → Écran de résultats avec diplôme si score global >= 60%
//
// Props reçues depuis App.jsx :
//   - surTermine → fonction appelée quand l'examen est terminé
//   - surQuitter → fonction appelée quand on clique "Quitter"
// ================================================================

import { useState, useEffect, useCallback } from 'react'
import { questionsExamen } from '../data/questions.js'
import { useStore, BADGES_DISPONIBLES } from '../store/store.js'
import { Timer, CheckCircle, XCircle, AlertCircle, ChevronRight, Trophy, GraduationCap, Medal } from 'lucide-react'

const TEMPS_PAR_QUESTION = 45

export function Examen({ surTermine, surQuitter }) {

  const { ajouterXP, sauvegarderResultatsExamen } = useStore()

  // Numéro de la série actuelle (0, 1 ou 2)
  const [serieActuelle, setSerieActuelle]       = useState(0)

  // Index de la question dans la série (0 à 19)
  const [questionActuelle, setQuestionActuelle] = useState(0)

  // Index de la réponse cliquée (null = pas encore répondu)
  const [reponseChoisie, setReponseChoisie]     = useState(null)

  // Résultats par série : tableau de 3 tableaux
  const [resultatsSeries, setResultatsSeries]   = useState([[], [], []])

  // Timer
  const [tempsRestant, setTempsRestant]         = useState(TEMPS_PAR_QUESTION)

  // Afficher ou non l'explication
  const [montrerExplication, setMontrerExplication] = useState(false)

  // Examen terminé ?
  const [examenTermine, setExamenTermine]       = useState(false)

  // Badge débloqué à afficher à la fin
  const [nouveauBadge, setNouveauBadge]         = useState(null)

  // Questions de la série actuelle
  const questions = questionsExamen[serieActuelle]
  const question  = questions[questionActuelle]

  // ----------------------------------------------------------------
  // GESTION DU TIMER
  // ----------------------------------------------------------------
  const tempsEcoule = useCallback(() => {
    if (reponseChoisie === null) {
      const resultat = {
        idQuestion:     question.id,
        reponseChoisie: -1,
        correct:        false,
        tempsPasse:     TEMPS_PAR_QUESTION
      }
      setResultatsSeries(prev => {
        const copie = [...prev]
        copie[serieActuelle] = [...copie[serieActuelle], resultat]
        return copie
      })
      setMontrerExplication(true)
    }
  }, [question, serieActuelle, reponseChoisie])

  useEffect(() => {
    if (montrerExplication || examenTermine) return

    const minuterie = setInterval(() => {
      setTempsRestant(prev => {
        if (prev <= 1) { tempsEcoule(); return 0 }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(minuterie)
  }, [questionActuelle, montrerExplication, examenTermine, serieActuelle, tempsEcoule])

  // ----------------------------------------------------------------
  // CLIC SUR UNE RÉPONSE
  // ----------------------------------------------------------------
  function choisirReponse(index) {
    if (reponseChoisie !== null || montrerExplication) return

    setReponseChoisie(index)

    const resultat = {
      idQuestion:     question.id,
      reponseChoisie: index,
      correct:        index === question.correctAnswer,
      tempsPasse:     TEMPS_PAR_QUESTION - tempsRestant
    }

    setResultatsSeries(prev => {
      const copie = [...prev]
      copie[serieActuelle] = [...copie[serieActuelle], resultat]
      return copie
    })

    setMontrerExplication(true)
  }

  // ----------------------------------------------------------------
  // PASSER À LA QUESTION / SÉRIE SUIVANTE
  // ----------------------------------------------------------------
  function questionSuivante() {

    if (questionActuelle < questions.length - 1) {
      // Il reste des questions dans cette série
      setQuestionActuelle(questionActuelle + 1)
      setReponseChoisie(null)
      setMontrerExplication(false)
      setTempsRestant(TEMPS_PAR_QUESTION)

    } else {
      // Fin de la série → on sauvegarde le score
      const scoreSerie = resultatsSeries[serieActuelle].filter(r => r.correct).length
      sauvegarderResultatsExamen({
        serie:          serieActuelle + 1,
        score:          scoreSerie,
        totalQuestions: 20,
        completedAt:    new Date()
      })

      if (serieActuelle < 2) {
        // Il reste des séries → on passe à la suivante
        setSerieActuelle(serieActuelle + 1)
        setQuestionActuelle(0)
        setReponseChoisie(null)
        setMontrerExplication(false)
        setTempsRestant(TEMPS_PAR_QUESTION)
      } else {
        // C'était la dernière série → on termine l'examen
        terminerLExamen()
      }
    }
  }

  // ----------------------------------------------------------------
  // FIN DE L'EXAMEN
  // ----------------------------------------------------------------
  function terminerLExamen() {
    // On aplatit les 3 tableaux de résultats en un seul
    const tousLesResultats = resultatsSeries.flat()
    const nbBonnes  = tousLesResultats.filter(r => r.correct).length

    // XP : 15 par bonne réponse + 500 bonus de complétion
    const xpGagne = nbBonnes * 15 + 500
    ajouterXP(xpGagne)

    setNouveauBadge(BADGES_DISPONIBLES.EXAMEN_REUSSI.nom)
    setExamenTermine(true)
  }

  // ----------------------------------------------------------------
  // STYLE D'UN BOUTON DE RÉPONSE
  // ----------------------------------------------------------------
  function styleReponse(index) {
    if (reponseChoisie === null) {
      return 'hover:bg-amber-50 border-2 border-gray-200 hover:border-amber-300'
    }
    if (reponseChoisie === index) {
      return index === question.correctAnswer
        ? 'bg-green-100 border-2 border-green-500'
        : 'bg-red-100 border-2 border-red-500'
    }
    if (index === question.correctAnswer) return 'bg-green-100 border-2 border-green-500'
    return 'bg-gray-50 border-2 border-gray-200 opacity-50'
  }

  // ================================================================
  // ÉCRAN DE RÉSULTATS FINAUX
  // ================================================================
  if (examenTermine) {
    const tousLesResultats = resultatsSeries.flat()
    const nbBonnes  = tousLesResultats.filter(r => r.correct).length
    const pourcentage = Math.round((nbBonnes / 60) * 100)
    const reussi    = nbBonnes >= 36  // Passage à 60%

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white rounded-xl shadow-sm border border-amber-400 p-8 text-center">

            {/* Badge débloqué */}
            {nouveauBadge && (
              <div className="mb-6">
                <span className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 px-4 py-2 rounded-full text-lg font-semibold animate-bounce">
                  <Medal className="w-5 h-5" />
                  Nouveau badge : {nouveauBadge}
                </span>
              </div>
            )}

            {/* Icône de résultat */}
            <div className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6 ${reussi ? 'bg-gradient-to-br from-amber-100 to-yellow-100' : 'bg-red-100'}`}>
              {reussi
                ? <GraduationCap className="w-14 h-14 text-amber-600" />
                : <AlertCircle className="w-14 h-14 text-red-600" />
              }
            </div>

            <h2 className="text-4xl font-bold mb-2 text-amber-900">
              {reussi ? 'Diplôme obtenu !' : 'Examen terminé'}
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              {reussi
                ? 'Félicitations ! Vous êtes maintenant un expert du Moyen-Âge !'
                : "Vous pouvez retenter l'examen pour améliorer votre score."}
            </p>

            {/* Score par série */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {resultatsSeries.map((resultats, idx) => (
                <div key={idx} className="bg-amber-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">
                    {resultats.filter(r => r.correct).length}/20
                  </div>
                  <div className="text-sm text-gray-600">Série {idx + 1}</div>
                </div>
              ))}
            </div>

            {/* Score global */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{nbBonnes}/60</div>
                <div className="text-sm text-gray-600">Bonnes réponses</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{pourcentage}%</div>
                <div className="text-sm text-gray-600">Score global</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">+{nbBonnes * 15 + 500}</div>
                <div className="text-sm text-gray-600">XP gagné</div>
              </div>
            </div>

            {/* Certificat de réussite */}
            {reussi && (
              <div className="bg-gradient-to-r from-amber-100 to-yellow-100 p-6 rounded-lg mb-6">
                <Trophy className="w-12 h-12 text-amber-600 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-amber-900 mb-2">Certificat de réussite</h3>
                <p className="text-amber-800">
                  Wikipedia Learn certifie que vous avez maîtrisé le programme sur le Moyen-Âge
                </p>
              </div>
            )}

            <button
              onClick={surTermine}
              className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 text-lg"
            >
              <CheckCircle className="w-5 h-5" />
              Retour à l'accueil
            </button>

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

        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={surQuitter}
            className="px-4 py-2 text-gray-600 hover:bg-white/50 rounded-lg transition-colors"
          >
            Quitter
          </button>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-amber-600" />
            <span className="font-medium">Examen Final</span>
          </div>
          <div className="w-20" />
        </div>

        {/* Indicateur de série : Série 1 / Série 2 / Série 3 */}
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                s === serieActuelle + 1
                  ? 'bg-amber-600 text-white'           // Série en cours → orange
                  : s < serieActuelle + 1
                    ? 'bg-green-500 text-white'          // Série terminée → vert
                    : 'bg-gray-200 text-gray-500'        // Série future → gris
              }`}
            >
              Série {s}
            </div>
          ))}
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

        {/* Timer */}
        <div className={`mb-6 bg-white rounded-xl border p-4 shadow-sm ${tempsRestant <= 10 ? 'border-red-400' : ''}`}>
          <div className="flex items-center justify-center gap-3">
            <Timer className={`w-6 h-6 ${tempsRestant <= 10 ? 'text-red-500 animate-pulse' : 'text-amber-600'}`} />
            <span className={`text-2xl font-bold ${tempsRestant <= 10 ? 'text-red-500' : 'text-amber-900'}`}>
              {tempsRestant}s
            </span>
          </div>
        </div>

        {/* Question + réponses */}
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
                  <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-medium text-sm flex-shrink-0">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
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

        {/* Explication + bouton suivant */}
        {montrerExplication && (
          <div className={`mb-6 rounded-xl border p-4 shadow-sm ${
            reponseChoisie === question.correctAnswer ? 'bg-green-50 border-green-300' : 'bg-amber-50 border-amber-300'
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
                : serieActuelle < 2
                  ? <> Série suivante <ChevronRight className="w-4 h-4" /> </>
                  : 'Voir les résultats'
              }
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
