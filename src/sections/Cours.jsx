// ================================================================
// Cours.jsx — LA PAGE DE COURS
// ================================================================
// Cette page affiche le contenu du cours avant le quiz.
// Le cours est divisé en plusieurs sections.
//
// Fonctionnement :
//   - La liste des sections est affichée dans un sommaire (colonne gauche)
//   - Le contenu de la section sélectionnée s'affiche à droite
//   - Chaque section visitée est cochée automatiquement
//   - Une fois toutes les sections lues, un bouton "Commencer le quiz"
//     apparaît en bas de page
//
// Props reçues depuis App.jsx :
//   - niveau          → 'debutant', 'intermediaire' ou 'expert'
//   - surRetour       → fonction appelée quand on clique "Retour"
//   - surDemarrerQuiz → fonction appelée quand on clique "Commencer le quiz"
// ================================================================

import { useState, useEffect } from 'react'
import { cours } from '../data/courses.js'
import { ChevronLeft, ChevronRight, BookOpen, Clock, CheckCircle, Play } from 'lucide-react'

export function Cours({ niveau, surRetour, surDemarrerQuiz }) {

  // On cherche le cours correspondant au niveau choisi
  const contenuDuCours = cours.find(c => c.level === niveau)

  // Index de la section actuellement affichée (commence à 0)
  const [sectionActuelle, setSectionActuelle] = useState(0)

  // Liste des index des sections déjà visitées
  const [sectionsVues, setSectionsVues] = useState([])

  // Si le cours n'existe pas, on n'affiche rien
  if (!contenuDuCours) return null

  // Chaque fois qu'on change de section, on la marque comme vue
  useEffect(() => {
    if (!sectionsVues.includes(sectionActuelle)) {
      setSectionsVues(prev => [...prev, sectionActuelle])
    }
  }, [sectionActuelle])

  // Pourcentage de progression dans le cours
  const pourcentage = (sectionsVues.length / contenuDuCours.sections.length) * 100

  // Toutes les sections ont été vues ?
  const toutesVues = sectionsVues.length === contenuDuCours.sections.length

  // ----------------------------------------------------------------
  // Couleurs selon le niveau (pour la section active dans le sommaire)
  // ----------------------------------------------------------------
  function couleurNiveau() {
    switch (niveau) {
      case 'debutant':      return 'text-green-600 bg-green-50 border-green-200'
      case 'intermediaire': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'expert':        return 'text-purple-600 bg-purple-50 border-purple-200'
    }
  }

  function nomDuNiveau() {
    switch (niveau) {
      case 'debutant':      return 'Débutant'
      case 'intermediaire': return 'Intermédiaire'
      case 'expert':        return 'Expert'
    }
  }

  function iconeDuNiveau() {
    switch (niveau) {
      case 'debutant':      return '🌱'
      case 'intermediaire': return '📚'
      case 'expert':        return '👑'
    }
  }

  // ----------------------------------------------------------------
  // RENDU
  // ----------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">

      {/* ============================================================
          EN-TÊTE FIXE
          Reste visible quand on fait défiler la page
          ============================================================ */}
      <header className="bg-white border-b border-amber-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">

            {/* Bouton retour */}
            <button
              onClick={surRetour}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Retour
            </button>

            {/* Titre du cours */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">{iconeDuNiveau()}</span>
              <div>
                <h1 className="font-bold text-lg">{contenuDuCours.title}</h1>
                <p className="text-sm text-gray-500">{nomDuNiveau()}</p>
              </div>
            </div>

            {/* Durée estimée */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              {contenuDuCours.estimatedTime} min
            </div>

          </div>

          {/* Barre de progression du cours */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progression du cours</span>
              <span>{Math.round(pourcentage)}%</span>
            </div>
            <div className="w-full bg-amber-100 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${pourcentage}%` }}
              />
            </div>
          </div>

        </div>
      </header>

      {/* ============================================================
          CONTENU PRINCIPAL
          ============================================================ */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">

          {/* ----------------------------------------------------------
              SOMMAIRE (colonne gauche)
              Liste de toutes les sections avec leur statut (vu / pas vu)
              ---------------------------------------------------------- */}
          <div className="lg:col-span-1 bg-white rounded-xl border p-4 h-fit shadow-sm">

            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Sommaire
            </h3>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {contenuDuCours.sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => setSectionActuelle(index)}
                  className={`
                    w-full text-left p-3 rounded-lg text-sm transition-all
                    ${sectionActuelle === index ? couleurNiveau() : 'hover:bg-gray-100'}
                  `}
                >
                  <div className="flex items-center gap-2">
                    {/* Coche si la section a été vue, cercle vide sinon */}
                    {sectionsVues.includes(index)
                      ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      : <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                    }
                    <span className="truncate">{section.title}</span>
                  </div>
                </button>
              ))}
            </div>

          </div>

          {/* ----------------------------------------------------------
              CONTENU DE LA SECTION (colonne droite)
              ---------------------------------------------------------- */}
          <div className="lg:col-span-3 bg-white rounded-xl border shadow-sm">
            <div className="p-6">

              {/* Numéro de section */}
              <div className="text-sm text-gray-500 mb-2">
                Section {sectionActuelle + 1} sur {contenuDuCours.sections.length}
              </div>

              {/* Titre de la section */}
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {contenuDuCours.sections[sectionActuelle].title}
              </h2>

              {/* Texte du cours
                  On sépare en paragraphes grâce aux doubles sauts de ligne */}
              <div className="prose prose-amber max-w-none">
                {contenuDuCours.sections[sectionActuelle].content.split('\n\n').map((paragraphe, idx) => (
                  <p key={idx} className="mb-4 text-gray-700 leading-relaxed whitespace-pre-line">
                    {paragraphe}
                  </p>
                ))}
              </div>

              {/* Boutons Précédent / Suivant */}
              <div className="flex items-center justify-between pt-6 border-t">

                <button
                  onClick={() => setSectionActuelle(s => s - 1)}
                  disabled={sectionActuelle === 0}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Précédent
                </button>

                {/* Dernière section → bouton "Commencer le quiz" */}
                {sectionActuelle === contenuDuCours.sections.length - 1 ? (
                  <button
                    onClick={surDemarrerQuiz}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg font-semibold transition-all"
                  >
                    <Play className="w-4 h-4" />
                    Commencer le quiz
                  </button>
                ) : (
                  <button
                    onClick={() => setSectionActuelle(s => s + 1)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg transition-all"
                  >
                    Suivant
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

              </div>
            </div>
          </div>

        </div>

        {/* ----------------------------------------------------------
            BOUTON FINAL : Visible quand toutes les sections sont lues
            ---------------------------------------------------------- */}
        {toutesVues && (
          <div className="mt-6 rounded-xl border border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 p-6 text-center shadow-sm">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-800 mb-2">
              Félicitations ! Vous avez terminé le cours
            </h3>
            <p className="text-green-700 mb-4">
              Vous êtes maintenant prêt à passer le quiz de {nomDuNiveau()}
            </p>
            <button
              onClick={surDemarrerQuiz}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold text-lg transition-all"
            >
              <Play className="w-5 h-5" />
              Commencer le quiz (20 questions)
            </button>
          </div>
        )}

      </main>
    </div>
  )
}
