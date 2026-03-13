"use client";
// ================================================
// PAGE PRINCIPALE — remplace App.tsx
// "use client" obligatoire : useState + interactions
// ================================================

import { useState } from "react";
import type { DifficultyLevel } from "@/types";
import { Home }   from "@/sections/Home";
import { Course } from "@/sections/Course";
import { Quiz }   from "@/sections/Quiz";
import { Exam }   from "@/sections/Exam";
import { useGameStore } from "@/store/gameStore";

type View = "home" | "course" | "quiz" | "exam";

export default function Page() {
  const [currentView,   setCurrentView]   = useState<View>("home");
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel | null>(null);
  const { setCurrentLevel } = useGameStore();

  const handleSelectLevel = (level: DifficultyLevel) => {
    setSelectedLevel(level);
    setCurrentLevel(level);
    setCurrentView("course");
  };

  const handleBackToHome = () => {
    setCurrentView("home");
    setSelectedLevel(null);
    setCurrentLevel(null);
  };

  return (
    <div>
      {currentView === "home" && (
        <Home onSelectLevel={handleSelectLevel} onStartExam={() => setCurrentView("exam")} />
      )}
      {currentView === "course" && selectedLevel && (
        <Course level={selectedLevel} onBack={handleBackToHome} onStartQuiz={() => setCurrentView("quiz")} />
      )}
      {currentView === "quiz" && selectedLevel && (
        <Quiz level={selectedLevel} onComplete={handleBackToHome} onExit={handleBackToHome} />
      )}
      {currentView === "exam" && (
        <Exam onComplete={() => setCurrentView("home")} onExit={handleBackToHome} />
      )}
    </div>
  );
}
