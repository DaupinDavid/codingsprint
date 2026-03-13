// ================================================================
// Accueil.jsx — LA PAGE D'ACCUEIL
// ================================================================
// Cette page est la première que voit l'utilisateur.
// Elle affiche :
//   - L'en-tête avec le titre, l'XP et les badges
//   - La progression globale du joueur
//   - Les 3 cartes de niveaux (Débutant / Intermédiaire / Expert)
//   - La carte Mode Survie
//   - La carte Examen Final (verrouillée jusqu'à la fin des 3 niveaux)
//   - La liste des badges débloqués
//   - Le bouton pour réinitialiser la progression
//
// Props reçues depuis App.jsx :
//   - surSelectNiveau   → fonction appelée quand on clique sur un niveau
//   - surDemarrerExamen → fonction appelée quand on clique sur "Examen"
//   - surDemarrerSurvie → fonction appelée quand on clique sur "Mode Survie"
// ================================================================

import { useState } from 'react'
import { useStore } from '../store/store.js'
import { NIVEAUX } from '../types/index.js'
import { BookOpen, Trophy, Star, Target, RotateCcw, GraduationCap, Skull } from 'lucide-react'

export function Accueil({ surSelectNiveau, surDemarrerExamen, surDemarrerSurvie }) {

  // On récupère les données et fonctions du store
  const { progression, peutAccederNiveau, scoreNiveau, reinitialiser } = useStore()

  // Afficher ou non la fenêtre de confirmation de réinitialisation
  const [confirmerReinit, setConfirmerReinit] = useState(false)

  // Badge à afficher en détail dans une fenêtre (null = aucune fenêtre)
  const [badgeEnDetail, setBadgeEnDetail] = useState(null)

  // ----------------------------------------------------------------
  // FONCTIONS UTILITAIRES
  // ----------------------------------------------------------------

  // Renvoie le statut et la couleur d'un niveau selon la progression
  function statutDuNiveau(idNiveau) {
    if (progression.niveauxTermines.includes(idNiveau))
      return { texte: 'Complété', couleur: 'bg-green-500' }
    if (progression.niveauActuel === idNiveau)
      return { texte: 'En cours', couleur: 'bg-yellow-500' }
    if (peutAccederNiveau(idNiveau))
      return { texte: 'Disponible', couleur: 'bg-blue-500' }
    return { texte: 'Verrouillé', couleur: 'bg-gray-400' }
  }

  // L'examen est accessible uniquement si les 3 niveaux sont terminés
  const examenDebloque = progression.niveauxTermines.length === 3

  // Calcul du pourcentage de progression globale (0 → 33 → 66 → 100%)
  const pourcentageGlobal = Math.round((progression.niveauxTermines.length / 3) * 100)

  // ----------------------------------------------------------------
  // RENDU (ce qui s'affiche à l'écran)
  // ----------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">

      {/* ============================================================
          EN-TÊTE
          Affiche le titre de l'application, l'XP et le nombre de badges
          ============================================================ */}
      <header className="bg-gradient-to-r from-amber-800 via-orange-700 to-amber-800 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">

            {/* Logo + Titre */}
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-xl">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Wikipedia Learn</h1>
                <p className="text-amber-100 text-sm">Le Moyen-Âge</p>
              </div>
            </div>

            {/* Compteurs XP et Badges */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <Star className="w-5 h-5 text-yellow-300" />
                <span className="font-bold">{progression.totalXP} XP</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <Trophy className="w-5 h-5 text-yellow-300" />
                <span className="font-bold">{progression.badges.length} Badges</span>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* ============================================================
          CONTENU PRINCIPAL
          ============================================================ */}
      <main className="container mx-auto px-4 py-8">

        {/* ----------------------------------------------------------
            CARTE : Progression globale
            Affiche une barre de progression et le score de chaque niveau
            ---------------------------------------------------------- */}
        <div className="mb-8 border border-amber-200 bg-white/80 backdrop-blur rounded-xl p-6 shadow-sm">

          <h2 className="flex items-center gap-2 text-amber-900 font-bold text-lg mb-4">
            <Target className="w-5 h-5" />
            Votre progression
          </h2>

          {/* Barre de progression */}
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progression globale</span>
            <span>{pourcentageGlobal}%</span>
          </div>
          <div className="w-full bg-amber-100 rounded-full h-3">
            <div
              className="bg-amber-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${pourcentageGlobal}%` }}
            />
          </div>

          {/* Score de chaque niveau */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{scoreNiveau('debutant')}</div>
              <div className="text-xs text-gray-600">Débutant</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{scoreNiveau('intermediaire')}</div>
              <div className="text-xs text-gray-600">Intermédiaire</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{scoreNiveau('expert')}</div>
              <div className="text-xs text-gray-600">Expert</div>
            </div>
          </div>

        </div>

        {/* ----------------------------------------------------------
            GRILLE DES 3 NIVEAUX
            Chaque carte représente un niveau cliquable
            ---------------------------------------------------------- */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {NIVEAUX.map((niveau) => {

            const statut    = statutDuNiveau(niveau.id)
            const estBloque = !peutAccederNiveau(niveau.id)
            const score     = scoreNiveau(niveau.id)

            return (
              <div
                key={niveau.id}
                className={`
                  relative overflow-hidden rounded-xl border transition-all duration-300
                  ${niveau.couleurFond}
                  ${estBloque ? 'opacity-70' : 'cursor-pointer shadow-lg hover:scale-105 hover:shadow-xl'}
                `}
                onClick={() => !estBloque && surSelectNiveau(niveau.id)}
              >

                {/* Badge de statut (coin supérieur droit) */}
                <div className="absolute top-0 right-0 p-4">
                  <span className={`${statut.couleur} text-white text-xs font-semibold px-2 py-1 rounded-full`}>
                    {statut.texte}
                  </span>
                </div>

                {/* Contenu de la carte */}
                <div className="p-6">
                  <div className="text-4xl mb-2">{niveau.icone}</div>
                  <h3 className={`text-xl font-bold mb-2 ${niveau.couleur}`}>{niveau.nom}</h3>
                  <p className="text-gray-600 text-sm mb-4">{niveau.description}</p>

                  {/* Infos : questions et temps */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{score > 0 ? `${score}/20 questions` : '20 questions'}</span>
                    <span>45s/question</span>
                  </div>

                  {/* Barre de progression du niveau (si déjà joué) */}
                  {score > 0 && (
                    <div className="mt-3 w-full bg-white/50 rounded-full h-2">
                      <div
                        className="bg-amber-500 h-2 rounded-full"
                        style={{ width: `${(score / 20) * 100}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Cadenas affiché sur les niveaux verrouillés */}
                {estBloque && (
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                    <div className="bg-white/90 px-4 py-2 rounded-full text-sm font-medium">
                      🔒 Terminez le niveau précédent
                    </div>
                  </div>
                )}

              </div>
            )
          })}
        </div>

        {/* ----------------------------------------------------------
            CARTE : Mode Survie
            50 questions mélangées, une seule vie
            ---------------------------------------------------------- */}
        <div className="mb-8 bg-gradient-to-r from-gray-900 to-black border-2 border-orange-600 text-white overflow-hidden relative rounded-xl shadow-lg">

          {/* Crâne décoratif en arrière-plan */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-8xl opacity-10 select-none pointer-events-none">
            💀
          </div>

          <div className="p-6">

            {/* Titre */}
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-orange-600 p-2 rounded-lg">
                <Skull className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-orange-400">Mode Survie</h2>
              <span className="ml-auto bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                NOUVEAU
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-300 mb-4">
              50 questions mélangées. Une erreur et tout s'arrête.
              Testez vos limites et grimpez dans le classement !
            </p>

            {/* Règles rapides */}
            <div className="flex items-center gap-6 mb-5 text-sm text-gray-400">
              <span>💀 Une vie</span>
              <span>⏱️ 20s / question</span>
              <span>🏆 Classement sauvegardé</span>
            </div>

            {/* Bouton d'accès */}
            <button
              onClick={surDemarrerSurvie}
              className="w-full py-3 px-6 bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-700 hover:to-red-800 text-white font-bold text-base rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              <Skull className="w-5 h-5" />
              Entrer en Mode Survie
            </button>

          </div>
        </div>

        {/* ----------------------------------------------------------
            CARTE : Examen Final
            Disponible seulement quand les 3 niveaux sont terminés
            ---------------------------------------------------------- */}
        <div className={`
          mb-8 rounded-xl border p-6 shadow-sm
          ${examenDebloque
            ? 'border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50'
            : 'border-gray-200 bg-gray-50'}
        `}>

          <h2 className="flex items-center gap-2 font-bold text-lg mb-3">
            <GraduationCap className="w-6 h-6" />
            Examen Final
          </h2>

          <p className="text-gray-600 mb-4">
            {examenDebloque
              ? "Félicitations ! Vous pouvez maintenant passer l'examen final pour obtenir votre diplôme."
              : "Terminez les 3 niveaux pour débloquer l'examen final."}
          </p>

          {/* Infos sur l'examen */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">3 séries de 20 questions</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Questions mélangées</span>
            </div>
          </div>

          <button
            onClick={surDemarrerExamen}
            disabled={!examenDebloque}
            className={`
              w-full py-3 px-6 rounded-lg font-semibold text-white text-lg transition-all
              ${examenDebloque
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 cursor-pointer'
                : 'bg-gray-400 cursor-not-allowed'}
            `}
          >
            {examenDebloque ? "Commencer l'examen" : "Verrouillé"}
          </button>

        </div>

        {/* ----------------------------------------------------------
            SECTION : Badges débloqués
            Affichée seulement si le joueur a au moins un badge
            ---------------------------------------------------------- */}
        {progression.badges.length > 0 && (
          <div className="mb-8 rounded-xl border border-amber-200 bg-white/80 p-6 shadow-sm">

            <h2 className="flex items-center gap-2 text-amber-900 font-bold text-lg mb-4">
              <Trophy className="w-5 h-5" />
              Vos badges ({progression.badges.length})
            </h2>

            <div className="flex flex-wrap gap-3">
              {progression.badges.map((badge) => (
                // Clic sur un badge → ouvre sa fiche détaillée
                <button
                  key={badge.id}
                  onClick={() => setBadgeEnDetail(badge)}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-100 to-yellow-100 px-4 py-2 rounded-full hover:shadow-md transition-shadow"
                >
                  <span className="text-2xl">{badge.icone}</span>
                  <span className="font-medium text-amber-900">{badge.nom}</span>
                </button>
              ))}
            </div>

          </div>
        )}

        {/* ----------------------------------------------------------
            BOUTON : Réinitialiser la progression
            ---------------------------------------------------------- */}
        <div className="text-center">
          <button
            onClick={() => setConfirmerReinit(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Réinitialiser ma progression
          </button>
        </div>

      </main>

      {/* ============================================================
          FENÊTRE MODALE : Confirmation de réinitialisation
          S'affiche par-dessus la page quand on clique sur "Réinitialiser"
          ============================================================ */}
      {confirmerReinit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">

            <h3 className="text-red-600 font-bold text-xl mb-3">Réinitialiser ?</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir effacer toute votre progression ? Cette action est irréversible.
            </p>

            <div className="flex gap-3">
              {/* Annuler → on ferme la fenêtre */}
              <button
                onClick={() => setConfirmerReinit(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              {/* Confirmer → on efface tout et on ferme */}
              <button
                onClick={() => { reinitialiser(); setConfirmerReinit(false) }}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Oui, réinitialiser
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================
          FENÊTRE MODALE : Détail d'un badge
          S'affiche quand on clique sur un badge
          Cliquer en dehors de la fenêtre la ferme
          ============================================================ */}
      {badgeEnDetail && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setBadgeEnDetail(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 p-6"
            onClick={e => e.stopPropagation()} // Empêche la fermeture si on clique dans la fenêtre
          >
            <div className="text-center mb-4">
              <span className="text-5xl">{badgeEnDetail.icone}</span>
              <h3 className="font-bold text-xl mt-2">{badgeEnDetail.nom}</h3>
              <p className="text-gray-500 mt-1">{badgeEnDetail.description}</p>
            </div>
            <p className="text-sm text-gray-400 text-center">
              Débloqué le {new Date(badgeEnDetail.debloqueA).toLocaleDateString('fr-FR')}
            </p>
            <button
              onClick={() => setBadgeEnDetail(null)}
              className="mt-4 w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
