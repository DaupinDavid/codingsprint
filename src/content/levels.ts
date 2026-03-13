import type { LevelInfo } from "@/types";

export const LEVELS: LevelInfo[] = [
  {
    id: "debutant",
    name: "Débutant",
    color: "text-green-600",
    bgColor: "bg-green-100",
    icon: "🌱",
    description: "Découvrez les bases du Moyen-Âge",
    requiredXP: 0,
  },
  {
    id: "intermediaire",
    name: "Intermédiaire",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    icon: "📚",
    description: "Approfondissez vos connaissances",
    requiredXP: 200,
  },
  {
    id: "expert",
    name: "Expert",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    icon: "👑",
    description: "Maîtrisez le Moyen-Âge comme un véritable historien",
    requiredXP: 500,
  },
];
