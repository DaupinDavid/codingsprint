// ================================================================
// App.jsx — LE CHEF D'ORCHESTRE
// ================================================================
// Ce fichier décide QUELLE PAGE afficher.
// Quand l'utilisateur clique sur quelque chose, on change de page.
//
// Les 5 pages possibles :
//   'accueil' → La page d'accueil avec les niveaux
//   'cours'   → La lecture du cours avant le quiz
//   'quiz'    → Le quiz de 20 questions
//   'examen'  → L'examen final (3 séries de 20 questions)
//   'survie'  → Mode Survie (50 questions, 1 erreur = game over)
// ================================================================

import { useState } from 'react'

// On importe chaque page depuis le dossier "sections"
import { Accueil }    from './sections/Accueil.jsx'
import { Cours }      from './sections/Cours.jsx'
import { Quiz }       from './sections/Quiz.jsx'
import { Examen }     from './sections/Examen.jsx'
import { ModeSurvie } from './sections/ModeSurvie.jsx'

// Le store contient toutes les données sauvegardées du joueur
import { useStore } from './store/store.js'

// ================================================================
// COMPOSANT PRINCIPAL
// ================================================================

function App() {

  // "pageActuelle" = la page qui s'affiche à l'écran
  // On commence toujours par la page d'accueil
  const [pageActuelle, setPageActuelle] = useState('accueil')

  // "niveauChoisi" = le niveau que l'utilisateur a sélectionné
  // null = personne n'a encore choisi de niveau
  const [niveauChoisi, setNiveauChoisi] = useState(null)

  // On récupère la fonction pour mettre à jour le niveau dans le store
  const { changerNiveauActuel } = useStore()

  // ----------------------------------------------------------------
  // FONCTIONS DE NAVIGATION
  // Chaque fonction répond à une action de l'utilisateur
  // ----------------------------------------------------------------

  // L'utilisateur clique sur un niveau → on ouvre le cours
  function allerAuCours(niveau) {
    setNiveauChoisi(niveau)         // On retient le niveau choisi
    changerNiveauActuel(niveau)     // On le sauvegarde dans le store
    setPageActuelle('cours')        // On affiche la page du cours
  }

  // L'utilisateur clique "Commencer le quiz" → on ouvre le quiz
  function allerAuQuiz() {
    setPageActuelle('quiz')
  }

  // Le quiz est terminé → on revient à l'accueil
  function quizTermine() {
    setPageActuelle('accueil')
    setNiveauChoisi(null)
    changerNiveauActuel(null)
  }

  // L'utilisateur clique "Examen Final" → on ouvre l'examen
  function allerALExamen() {
    setPageActuelle('examen')
  }

  // L'examen est terminé → on revient à l'accueil
  function examenTermine() {
    setPageActuelle('accueil')
  }

  // L'utilisateur clique "Mode Survie" → on ouvre le mode survie
  function allerAuModeSurvie() {
    setPageActuelle('survie')
  }

  // L'utilisateur clique "Retour" → on revient à l'accueil
  function retourAccueil() {
    setPageActuelle('accueil')
    setNiveauChoisi(null)
    changerNiveauActuel(null)
  }

  // ----------------------------------------------------------------
  // AFFICHAGE
  // On montre une seule page à la fois selon "pageActuelle"
  // Les accolades {} permettent de passer des fonctions aux pages
  // ----------------------------------------------------------------

  return (
    <div className="font-sans">

      {/* PAGE : Accueil */}
      {pageActuelle === 'accueil' && (
        <Accueil
          surSelectNiveau={allerAuCours}
          surDemarrerExamen={allerALExamen}
          surDemarrerSurvie={allerAuModeSurvie}
        />
      )}

      {/* PAGE : Cours — on vérifie qu'un niveau est bien choisi */}
      {pageActuelle === 'cours' && niveauChoisi && (
        <Cours
          niveau={niveauChoisi}
          surRetour={retourAccueil}
          surDemarrerQuiz={allerAuQuiz}
        />
      )}

      {/* PAGE : Quiz — on vérifie qu'un niveau est bien choisi */}
      {pageActuelle === 'quiz' && niveauChoisi && (
        <Quiz
          niveau={niveauChoisi}
          surTermine={quizTermine}
          surQuitter={retourAccueil}
        />
      )}

      {/* PAGE : Examen Final */}
      {pageActuelle === 'examen' && (
        <Examen
          surTermine={examenTermine}
          surQuitter={retourAccueil}
        />
      )}

      {/* PAGE : Mode Survie */}
      {pageActuelle === 'survie' && (
        <ModeSurvie
          surQuitter={retourAccueil}
        />
      )}

    </div>
  )
}

export default App
