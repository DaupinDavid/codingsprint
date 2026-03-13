"use client";
// ================================================
// PAGE PRINCIPALE — Next.js (remplace App.tsx)
// ================================================
// Inclut le Mode Survie en plus des 4 vues de base.

import { useState } from "react";
import type { DifficultyLevel } from "@/types";
import { Home }        from "@/sections/Home";
import { Course }      from "@/sections/Course";
import { Quiz }        from "@/sections/Quiz";
import { Exam }        from "@/sections/Exam";
import { ModeSurvie }  from "@/sections/ModeSurvie";
import { useGameStore } from "@/store/gameStore";

// Les 5 vues possibles (4 de base + survie)
type Vue = "accueil" | "cours" | "quiz" | "examen" | "survie";

export default function Page() {
  const [vueActuelle,       setVueActuelle]       = useState<Vue>("accueil");
  const [niveauSelectionne, setNiveauSelectionne] = useState<DifficultyLevel | null>(null);
  const { setCurrentLevel } = useGameStore();

  // Sélectionner un niveau → aller au cours
  const handleSelectLevel = (level: DifficultyLevel) => {
    setNiveauSelectionne(level);
    setCurrentLevel(level);
    setVueActuelle("cours");
  };

  // Retour à l'accueil depuis n'importe où
  const handleRetourAccueil = () => {
    setVueActuelle("accueil");
    setNiveauSelectionne(null);
    setCurrentLevel(null);
  };

  return (
    <div>
      {vueActuelle === "accueil" && (
        <Home
          onSelectLevel={handleSelectLevel}
          onStartExam={() => setVueActuelle("examen")}
          onStartSurvival={() => setVueActuelle("survie")}
        />
      )}

      {vueActuelle === "cours" && niveauSelectionne && (
        <Course
          level={niveauSelectionne}
          onBack={handleRetourAccueil}
          onStartQuiz={() => setVueActuelle("quiz")}
        />
      )}

      {vueActuelle === "quiz" && niveauSelectionne && (
        <Quiz
          level={niveauSelectionne}
          onComplete={handleRetourAccueil}
          onExit={handleRetourAccueil}
        />
      )}

      {vueActuelle === "examen" && (
        <Exam
          onComplete={() => setVueActuelle("accueil")}
          onExit={handleRetourAccueil}
        />
      )}

      {vueActuelle === "survie" && (
        <ModeSurvie
          onExit={handleRetourAccueil}
        />
      )}
    </div>
  );
}
