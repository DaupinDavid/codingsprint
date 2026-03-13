// ================================================================
// ModeSurvie.jsx — LE MODE SURVIE
// ================================================================
// Ce mode est un défi : 50 questions mélangées, UNE seule vie.
// La moindre erreur (ou le temps écoulé) = game over.
//
// Déroulement :
//   1. Écran d'introduction avec les règles
//   2. Les questions défilent une à une avec animation d'entrée
//   3. Chaque bonne réponse rapporte des points (selon la rapidité)
//   4. Une mauvaise réponse ou le timer à 0 → écran de fin
//   5. Le score est sauvegardé dans un classement local (localStorage)
//
// Props reçues depuis App.jsx :
//   - surQuitter → fonction appelée quand on retourne à l'accueil
// ================================================================

import { useState, useEffect, useCallback, useRef } from 'react'
import { questionsDebutant, questionsIntermediaire, questionsExpert } from '../data/questions.js'
import { Timer, XCircle, ChevronRight, Trophy, Skull, Zap, Clock } from 'lucide-react'

// ----------------------------------------------------------------
// RÉGLAGES DU MODE SURVIE
// Modifiez ces valeurs pour ajuster la difficulté
// ----------------------------------------------------------------
const TEMPS_PAR_QUESTION  = 20     // Secondes par question
const DUREE_ANIMATION     = 2000   // Durée de l'animation d'entrée (ms)
const NB_QUESTIONS        = 50     // Nombre total de questions
const HEURES_COOLDOWN     = 12     // Heures à attendre avant de rejouer

// ----------------------------------------------------------------
// CLÉS DE SAUVEGARDE (dans le localStorage du navigateur)
// ----------------------------------------------------------------
const CLE_CLASSEMENT  = 'survie-classement'
const CLE_DERNIERE_PARTIE = 'survie-derniere-partie'

// ----------------------------------------------------------------
// FONCTIONS UTILITAIRES
// ----------------------------------------------------------------

// Mélange un tableau dans un ordre aléatoire (algorithme Fisher-Yates)
function melangerTableau(tableau) {
  const copie = [...tableau]
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copie[i], copie[j]] = [copie[j], copie[i]]
  }
  return copie
}

// Génère les 50 questions de la partie en piochant dans les 3 niveaux
// Répartition : 17 débutant + 17 intermédiaire + 16 expert = 50
function genererQuestions() {
  const debutant      = melangerTableau(questionsDebutant).slice(0, 17)
  const intermediaire = melangerTableau(questionsIntermediaire).slice(0, 17)
  const expert        = melangerTableau(questionsExpert).slice(0, 16)
  return melangerTableau([...debutant, ...intermediaire, ...expert])
}

// Lit le classement sauvegardé dans le navigateur
function lireClassement() {
  try {
    const sauvegarde = localStorage.getItem(CLE_CLASSEMENT)
    return sauvegarde ? JSON.parse(sauvegarde) : []
  } catch {
    return []
  }
}

// Ajoute un score dans le classement et ne garde que le top 10
function ajouterAuClassement(entree) {
  const classement = [...lireClassement(), entree]
  classement.sort((a, b) => b.score - a.score)    // Meilleur score en premier
  const top10 = classement.slice(0, 10)
  localStorage.setItem(CLE_CLASSEMENT, JSON.stringify(top10))
  return top10
}

// Enregistre l'heure de fin de partie (pour le cooldown)
function sauvegarderFinDePartie() {
  localStorage.setItem(CLE_DERNIERE_PARTIE, new Date().toISOString())
}

// Retourne le nombre de millisecondes restantes avant de pouvoir rejouer
function cooldownRestant() {
  const sauvegarde = localStorage.getItem(CLE_DERNIERE_PARTIE)
  if (!sauvegarde) return 0
  const ecoulee = Date.now() - new Date(sauvegarde).getTime()
  return Math.max(0, HEURES_COOLDOWN * 3600 * 1000 - ecoulee)
}

// ================================================================
// COMPOSANT PRINCIPAL
// ================================================================
export function ModeSurvie({ surQuitter }) {

  // "phase" représente l'étape actuelle :
  // 'intro' = écran d'accueil, 'jeu' = partie en cours, 'fin' = résultats
  const [phase, setPhase] = useState('intro')

  // Les 50 questions générées pour cette partie
  const [questions, setQuestions] = useState([])

  // Index de la question affichée (0 à 49)
  const [indexQuestion, setIndexQuestion] = useState(0)

  // Index de la réponse cliquée (null = pas encore répondu)
  const [reponseChoisie, setReponseChoisie] = useState(null)

  // Secondes restantes pour répondre
  const [tempsRestant, setTempsRestant] = useState(TEMPS_PAR_QUESTION)

  // Score accumulé pendant la partie
  const [score, setScore] = useState(0)

  // Nombre de bonnes réponses (pour l'écran de fin)
  const [nbBonnes, setNbBonnes] = useState(0)

  // Heure de début de la question (pour calculer la rapidité)
  const heureDebut = useRef(Date.now())

  // true = la question est en train de glisser depuis la droite
  const [animationActive, setAnimationActive] = useState(false)

  // true = le timer peut s'écouler (false pendant l'animation)
  const [timerActif, setTimerActif] = useState(false)

  // Classement final (après la partie)
  const [classement, setClassement] = useState([])

  // Position du joueur dans le classement
  const [rang, setRang] = useState(0)

  // Millisecondes restantes avant de pouvoir rejouer
  const [cooldown, setCooldown] = useState(0)

  // ----------------------------------------------------------------
  // Mise à jour du compte à rebours de cooldown (écran de fin)
  // ----------------------------------------------------------------
  useEffect(() => {
    if (phase !== 'fin') return
    const minuterie = setInterval(() => setCooldown(cooldownRestant()), 1000)
    return () => clearInterval(minuterie)
  }, [phase])

  // ----------------------------------------------------------------
  // Timer de 20 secondes (actif seulement pendant le jeu)
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!timerActif || phase !== 'jeu') return

    const minuterie = setInterval(() => {
      setTempsRestant(prev => {
        if (prev <= 1) {
          // Le temps est écoulé → fin de partie
          finDePartie()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(minuterie)
  }, [timerActif, phase, indexQuestion])

  // ----------------------------------------------------------------
  // Lance l'animation d'entrée de la question (glissement depuis la droite)
  // Pendant les 2 secondes d'animation, le timer est pausé
  // ----------------------------------------------------------------
  function lancerAnimation() {
    setAnimationActive(true)
    setTimerActif(false)

    setTimeout(() => {
      setAnimationActive(false)
      setTimerActif(true)
      setTempsRestant(TEMPS_PAR_QUESTION)
      heureDebut.current = Date.now()
    }, DUREE_ANIMATION)
  }

  // ----------------------------------------------------------------
  // Démarre une nouvelle partie
  // ----------------------------------------------------------------
  function demarrerPartie() {
    setQuestions(genererQuestions())
    setIndexQuestion(0)
    setReponseChoisie(null)
    setScore(0)
    setNbBonnes(0)
    setPhase('jeu')
    lancerAnimation()
  }

  // ----------------------------------------------------------------
  // Calcule les points gagnés selon la rapidité de réponse
  // Réponse immédiate → 100 pts / Réponse à la dernière seconde → 10 pts
  // ----------------------------------------------------------------
  function calculerPoints() {
    const tempsEcoule = (Date.now() - heureDebut.current) / 1000
    const bonusTemps  = Math.max(0, TEMPS_PAR_QUESTION - tempsEcoule)
    return Math.round(10 + (bonusTemps / TEMPS_PAR_QUESTION) * 90)
  }

  // ----------------------------------------------------------------
  // Fin de partie (erreur ou temps écoulé)
  // ----------------------------------------------------------------
  const finDePartie = useCallback(() => {
    setTimerActif(false)
    sauvegarderFinDePartie()

    const entree = {
      nom:              'Vous',
      score,
      questionAtteinte: indexQuestion + 1,
      date:             new Date().toLocaleDateString('fr-FR')
    }

    const nouveauClassement = ajouterAuClassement(entree)
    setClassement(nouveauClassement)

    // Trouve la position du joueur dans le classement
    const position = nouveauClassement.findIndex(
      e => e.score === score && e.date === entree.date
    ) + 1
    setRang(position)

    setCooldown(cooldownRestant())
    setPhase('fin')
  }, [score, indexQuestion])

  // ----------------------------------------------------------------
  // Clic sur une réponse
  // ----------------------------------------------------------------
  function choisirReponse(index) {
    // On ignore si déjà répondu ou pendant l'animation
    if (reponseChoisie !== null || !timerActif) return

    setReponseChoisie(index)
    setTimerActif(false)

    const question = questions[indexQuestion]

    if (index === question.correctAnswer) {
      // BONNE RÉPONSE → on ajoute les points et on passe à la suivante
      const points = calculerPoints()
      setScore(prev => prev + points)
      setNbBonnes(prev => prev + 1)

      setTimeout(() => {
        const suivant = indexQuestion + 1
        if (suivant >= NB_QUESTIONS) {
          // Toutes les questions répondues → victoire !
          finDePartie()
        } else {
          setIndexQuestion(suivant)
          setReponseChoisie(null)
          lancerAnimation()
        }
      }, 800) // Pause pour voir le vert

    } else {
      // MAUVAISE RÉPONSE → fin de partie après une courte pause
      setTimeout(() => finDePartie(), 1000) // Pause pour voir le rouge
    }
  }

  // ----------------------------------------------------------------
  // Couleur du timer selon l'urgence
  // ----------------------------------------------------------------
  function couleurTimer() {
    if (tempsRestant <= 5)  return 'text-red-500'
    if (tempsRestant <= 10) return 'text-orange-400'
    return 'text-orange-300'
  }

  // ----------------------------------------------------------------
  // Icône d'un niveau
  // ----------------------------------------------------------------
  function iconeNiveau(niveau) {
    switch (niveau) {
      case 'debutant':      return '🌱'
      case 'intermediaire': return '📚'
      case 'expert':        return '👑'
      default:              return '❓'
    }
  }

  // ----------------------------------------------------------------
  // Formate un cooldown en HH:MM:SS
  // ----------------------------------------------------------------
  function formaterCooldown(ms) {
    if (ms <= 0) return '00:00:00'
    const s = Math.floor(ms / 1000)
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    const pad = (n) => String(n).padStart(2, '0')
    return `${pad(h)}:${pad(m)}:${pad(sec)}`
  }

  // ================================================================
  // ÉCRAN D'INTRODUCTION
  // ================================================================
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
                <span className="font-bold text-orange-300">{NB_QUESTIONS} questions</span> mélangées des 3 niveaux
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Skull className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-gray-200">
                <span className="font-bold text-red-300">Une seule erreur</span> et la partie s'arrête
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Timer className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" />
              <p className="text-sm text-gray-200">
                <span className="font-bold text-orange-300">{TEMPS_PAR_QUESTION} secondes</span> par question — le temps écoulé compte comme une erreur
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
              <p className="text-sm text-gray-200">
                Plus vous répondez vite, plus vous gagnez de <span className="font-bold text-yellow-300">points</span>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Trophy className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
              <p className="text-sm text-gray-200">
                Votre score est sauvegardé dans le <span className="font-bold text-yellow-300">classement</span>
              </p>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3">
            <button
              onClick={surQuitter}
              className="flex-1 py-2 px-4 border border-gray-600 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
            >
              Retour
            </button>
            <button
              onClick={demarrerPartie}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold text-lg rounded-lg transition-all"
            >
              ⚔️ Jouer
            </button>
          </div>

        </div>
      </div>
    )
  }

  // ================================================================
  // ÉCRAN DE FIN DE PARTIE
  // ================================================================
  if (phase === 'fin') {
    const estVictoire = nbBonnes === NB_QUESTIONS

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-2xl">

          {/* Résultat de la partie */}
          <div className="mb-6 bg-gray-900 border-2 border-orange-600 rounded-xl text-white p-8 text-center shadow-xl">

            <div className="text-7xl mb-4">{estVictoire ? '🏆' : '💀'}</div>
            <h2 className="text-3xl font-bold text-orange-400 mb-1">
              {estVictoire ? 'INCROYABLE !' : 'GAME OVER'}
            </h2>
            <p className="text-gray-400 mb-6">
              {estVictoire
                ? `Vous avez répondu correctement aux ${NB_QUESTIONS} questions !`
                : `Éliminé à la question ${indexQuestion + 1} sur ${NB_QUESTIONS}`
              }
            </p>

            {/* Statistiques */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-orange-950 border border-orange-700 p-4 rounded-xl">
                <div className="text-3xl font-bold text-orange-400">{score}</div>
                <div className="text-xs text-gray-400 mt-1">Score total</div>
              </div>
              <div className="bg-orange-950 border border-orange-700 p-4 rounded-xl">
                <div className="text-3xl font-bold text-yellow-400">{nbBonnes}</div>
                <div className="text-xs text-gray-400 mt-1">Bonnes réponses</div>
              </div>
              <div className="bg-orange-950 border border-orange-700 p-4 rounded-xl">
                <div className="text-3xl font-bold text-red-400">#{rang}</div>
                <div className="text-xs text-gray-400 mt-1">Classement</div>
              </div>
            </div>

            {/* Cooldown et boutons */}
            <div className="flex flex-col gap-3">

              {/* Compte à rebours avant de pouvoir rejouer */}
              <div className="flex items-center justify-center gap-3 bg-gray-800 border border-gray-600 rounded-xl p-4">
                <Clock className="w-5 h-5 text-gray-400" />
                <div className="text-left">
                  <p className="text-sm text-gray-400">Vous pouvez réessayer dans</p>
                  <p className="text-xl font-mono font-bold text-orange-400">
                    {cooldown > 0 ? formaterCooldown(cooldown) : 'Disponible maintenant !'}
                  </p>
                </div>
              </div>

              <button
                onClick={demarrerPartie}
                className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold rounded-lg transition-all text-lg"
              >
                ⚔️ Relancer une session
              </button>

              <button
                onClick={surQuitter}
                className="w-full py-2 border border-gray-600 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
              >
                Retour à l'accueil
              </button>

            </div>
          </div>

          {/* Classement */}
          <div className="bg-gray-900 border-2 border-orange-600 rounded-xl text-white p-6 shadow-xl">
            <h3 className="font-bold text-lg text-orange-400 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Classement du Mode Survie
            </h3>

            {classement.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucun score enregistré.</p>
            ) : (
              <div className="space-y-2">
                {classement.map((entree, index) => {
                  // Met en évidence la ligne du joueur actuel
                  const estLeJoueur = entree.score === score && index + 1 === rang

                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        estLeJoueur
                          ? 'bg-orange-600 border border-orange-400'   // Ligne du joueur
                          : 'bg-gray-800 border border-gray-700'       // Autres joueurs
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Médaille pour le podium */}
                        <span className="text-lg font-bold w-8 text-center">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                        </span>
                        <div>
                          <p className="font-medium text-sm">
                            {entree.nom}
                            {estLeJoueur && (
                              <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">Vous</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400">
                            Question {entree.questionAtteinte} atteinte · {entree.date}
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-orange-300">{entree.score} pts</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    )
  }

  // ================================================================
  // ÉCRAN DE JEU (une question à la fois)
  // ================================================================

  // Sécurité : on attend que les questions soient prêtes
  if (questions.length === 0) return null

  const question = questions[indexQuestion]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-3xl">

        {/* En-tête : bouton quitter, score, compteur de bonnes réponses */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={surQuitter}
            className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            Quitter
          </button>
          <div className="flex items-center gap-2 bg-orange-950 border border-orange-700 px-4 py-2 rounded-full">
            <Zap className="w-4 h-4 text-orange-400" />
            <span className="font-bold text-orange-300">{score} pts</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-800 border border-gray-600 px-4 py-2 rounded-full">
            <span className="text-sm text-gray-300">✅ {nbBonnes}</span>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Question {indexQuestion + 1} sur {NB_QUESTIONS}</span>
            <span>{Math.round(((indexQuestion + 1) / NB_QUESTIONS) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-600 to-red-600 transition-all duration-500"
              style={{ width: `${((indexQuestion + 1) / NB_QUESTIONS) * 100}%` }}
            />
          </div>
        </div>

        {/* Niveau de la question + Timer */}
        <div className={`mb-6 bg-gray-900 border rounded-xl p-4 shadow-sm ${tempsRestant <= 5 ? 'border-red-500' : 'border-orange-700'}`}>
          <div className="flex items-center justify-between">

            {/* Badge du niveau */}
            <div className="flex items-center gap-2">
              <span className="text-xl">{iconeNiveau(question.level)}</span>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${
                question.level === 'debutant'
                  ? 'bg-green-900 text-green-300 border-green-700'
                  : question.level === 'intermediaire'
                    ? 'bg-blue-900 text-blue-300 border-blue-700'
                    : 'bg-purple-900 text-purple-300 border-purple-700'
              }`}>
                {question.level === 'debutant' ? 'Débutant' : question.level === 'intermediaire' ? 'Intermédiaire' : 'Expert'}
              </span>
            </div>

            {/* Secondes restantes */}
            <div className="flex items-center gap-3">
              <Timer className={`w-6 h-6 ${couleurTimer()} ${tempsRestant <= 5 ? 'animate-pulse' : ''}`} />
              {/* Pendant l'animation → tiret, sinon → temps restant */}
              <span className={`text-2xl font-bold ${couleurTimer()}`}>
                {animationActive ? '—' : `${tempsRestant}s`}
              </span>
            </div>

          </div>

          {/* Barre de décompte (cachée pendant l'animation) */}
          {!animationActive && (
            <div className="mt-3 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  tempsRestant <= 5 ? 'bg-red-500' : tempsRestant <= 10 ? 'bg-orange-500' : 'bg-orange-400'
                }`}
                style={{ width: `${(tempsRestant / TEMPS_PAR_QUESTION) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* Carte de la question (animée : glissement depuis la droite) */}
        <div
          className="mb-6 bg-gray-900 border-2 border-orange-700 rounded-xl shadow-sm"
          style={{
            animation: animationActive
              ? `glissementDroite ${DUREE_ANIMATION}ms ease-out forwards`
              : 'none'
          }}
        >
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-6">{question.question}</h2>

            <div className="space-y-3">
              {question.options.map((option, index) => {

                // Couleur du bouton selon si on a répondu et si c'est correct
                let style = 'border-2 border-gray-600 bg-gray-800 text-white hover:border-orange-500 hover:bg-orange-950'
                if (reponseChoisie !== null) {
                  if (index === question.correctAnswer) {
                    style = 'border-2 border-green-500 bg-green-900 text-green-200'       // Bonne réponse
                  } else if (index === reponseChoisie) {
                    style = 'border-2 border-red-500 bg-red-900 text-red-200'             // Mauvaise réponse
                  } else {
                    style = 'border-2 border-gray-700 bg-gray-800 text-gray-500 opacity-50' // Autres
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => choisirReponse(index)}
                    disabled={reponseChoisie !== null || animationActive || !timerActif}
                    className={`w-full p-4 rounded-lg text-left transition-all ${style} disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center font-medium text-sm flex-shrink-0">
                        {String.fromCharCode(65 + index)} {/* A, B, C ou D */}
                      </span>
                      <span>{option}</span>
                      {reponseChoisie !== null && index === question.correctAnswer && (
                        <ChevronRight className="w-5 h-5 text-green-400 ml-auto" />
                      )}
                      {reponseChoisie === index && index !== question.correctAnswer && (
                        <XCircle className="w-5 h-5 text-red-400 ml-auto" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

          </div>
        </div>

        {/* Message pendant l'animation */}
        {animationActive && (
          <div className="text-center text-orange-400 text-sm animate-pulse">
            Préparez-vous...
          </div>
        )}

      </div>

      {/* Animation CSS : la question arrive depuis la droite */}
      <style>{`
        @keyframes glissementDroite {
          from { opacity: 0; transform: translateX(100%); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

    </div>
  )
}
