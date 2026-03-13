// ================================================================
// types/index.js — LES NIVEAUX DU JEU
// ================================================================
// Ce fichier définit les 3 niveaux disponibles dans l'application.
//
// Pour modifier un niveau :
//   - "nom"         → le titre affiché sur la carte
//   - "couleur"     → la couleur du texte du titre (classe Tailwind)
//   - "couleurFond" → la couleur de fond de la carte (classe Tailwind)
//   - "icone"       → l'emoji affiché sur la carte
//   - "description" → le texte court affiché sous le titre
// ================================================================

export const NIVEAUX = [
  {
    id: 'debutant',
    nom: 'Débutant',
    couleur: 'text-green-600',
    couleurFond: 'bg-green-100',
    icone: '🌱',
    description: 'Découvrez les bases du Moyen-Âge',
  },
  {
    id: 'intermediaire',
    nom: 'Intermédiaire',
    couleur: 'text-blue-600',
    couleurFond: 'bg-blue-100',
    icone: '📚',
    description: 'Approfondissez vos connaissances',
  },
  {
    id: 'expert',
    nom: 'Expert',
    couleur: 'text-purple-600',
    couleurFond: 'bg-purple-100',
    icone: '👑',
    description: 'Maîtrisez le Moyen-Âge comme un véritable historien',
  },
]
