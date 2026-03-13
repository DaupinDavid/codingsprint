"use client";
/**
 * ============================================
 * PAGE DU COURS (Course.tsx)
 * ============================================
 * Animations Framer Motion ajoutées :
 * - Header glisse vers le bas
 * - Sommaire apparaît depuis la gauche
 * - Contenu de section slide gauche/droite selon la direction
 * - Card félicitations apparaît avec un bounce
 * - Boutons avec whileHover / whileTap
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { courses } from '@/data/courses';
import type { DifficultyLevel } from '@/types';

import { ChevronLeft, ChevronRight, BookOpen, Clock, CheckCircle, Play } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

// ============================================
// VARIANTS
// ============================================

const slideDown = {
  hidden: { opacity: 0, y: -40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const bouncIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 18 },
  },
};

// ============================================
// PROPS
// ============================================

interface CourseProps {
  level: DifficultyLevel;
  onBack: () => void;
  onStartQuiz: () => void;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export function Course({ level, onBack, onStartQuiz }: CourseProps) {
  const course = courses.find(c => c.level === level);
  const [currentSection, setCurrentSection]       = useState(0);
  const [completedSections, setCompletedSections] = useState<number[]>([]);

  // Direction du slide : 1 = vers la gauche (suivant), -1 = vers la droite (précédent)
  const direction = useRef(1);

  if (!course) return null;

  useEffect(() => {
    if (!completedSections.includes(currentSection)) {
      setCompletedSections(prev => [...prev, currentSection]);
    }
  }, [currentSection]);

  const goToNextSection = () => {
    if (currentSection < course.sections.length - 1) {
      direction.current = 1;
      setCurrentSection(currentSection + 1);
    }
  };

  const goToPreviousSection = () => {
    if (currentSection > 0) {
      direction.current = -1;
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSectionClick = (index: number) => {
    direction.current = index > currentSection ? 1 : -1;
    setCurrentSection(index);
  };

  const progress           = (completedSections.length / course.sections.length) * 100;
  const allSectionsCompleted = completedSections.length === course.sections.length;

  const getLevelColor = () => {
    switch (level) {
      case 'debutant':      return 'text-green-600 bg-green-50 border-green-200';
      case 'intermediaire': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'expert':        return 'text-purple-600 bg-purple-50 border-purple-200';
    }
  };

  const getLevelName = () => {
    switch (level) {
      case 'debutant':      return 'Débutant';
      case 'intermediaire': return 'Intermédiaire';
      case 'expert':        return 'Expert';
    }
  };

  const getLevelIcon = () => {
    switch (level) {
      case 'debutant':      return '🌱';
      case 'intermediaire': return '📚';
      case 'expert':        return '👑';
    }
  };

  // Variants du slide de contenu — dépendent de la direction
  const contentVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * 80 }),
    center: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } },
    exit:  (dir: number) => ({ opacity: 0, x: dir * -80, transition: { duration: 0.25, ease: 'easeIn' } }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">

      {/* ============================================
          EN-TÊTE — glisse vers le bas
          ============================================ */}
      <motion.header
        className="bg-white border-b border-amber-200 sticky top-0 z-10"
        variants={slideDown}
        initial="hidden"
        animate="visible"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Bouton retour */}
            <motion.div whileHover={{ x: -3 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
                <ChevronLeft className="w-5 h-5" />
                Retour
              </Button>
            </motion.div>

            {/* Titre */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getLevelIcon()}</span>
              <div>
                <h1 className="font-bold text-lg">{course.title}</h1>
                <p className="text-sm text-gray-500">{getLevelName()}</p>
              </div>
            </div>

            {/* Temps estimé */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              {course.estimatedTime} min
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progression du cours</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <motion.div
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            >
              <Progress value={progress} className="h-2" />
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* ============================================
          CONTENU PRINCIPAL
          ============================================ */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">

          {/* ----------------------------------------
              SOMMAIRE — glisse depuis la gauche
              ---------------------------------------- */}
          <motion.div
            className="lg:col-span-1 h-fit"
            variants={slideInLeft}
            initial="hidden"
            animate="visible"
          >
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Sommaire
                </h3>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {course.sections.map((section, index) => (
                      <motion.button
                        key={section.id}
                        onClick={() => handleSectionClick(index)}
                        className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                          currentSection === index ? getLevelColor() : 'hover:bg-gray-100'
                        }`}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      >
                        <div className="flex items-center gap-2">
                          <AnimatePresence mode="wait">
                            {completedSections.includes(index) ? (
                              <motion.div
                                key="check"
                                initial={{ scale: 0, rotate: -90 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                              >
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              </motion.div>
                            ) : (
                              <motion.div
                                key="circle"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                              >
                                <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <span className="truncate">{section.title}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>

          {/* ----------------------------------------
              CONTENU — slide gauche/droite
              ---------------------------------------- */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.15, ease: 'easeOut' }}
          >
            <Card>
              <CardContent className="p-6">
                {/* Zone de contenu avec slide animé */}
                <div className="mb-6 overflow-hidden">
                  <AnimatePresence mode="wait" custom={direction.current}>
                    <motion.div
                      key={currentSection}
                      custom={direction.current}
                      variants={contentVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                    >
                      {/* Numéro de section */}
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <span>Section {currentSection + 1} sur {course.sections.length}</span>
                      </div>

                      {/* Titre */}
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        {course.sections[currentSection].title}
                      </h2>

                      {/* Contenu */}
                      <div className="prose prose-amber max-w-none">
                        {course.sections[currentSection].content.split('\n\n').map((paragraph, idx) => (
                          <p key={idx} className="mb-4 text-gray-700 leading-relaxed whitespace-pre-line">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <motion.div whileHover={{ x: -3 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      onClick={goToPreviousSection}
                      disabled={currentSection === 0}
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Précédent
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    {currentSection === course.sections.length - 1 ? (
                      <Button
                        onClick={onStartQuiz}
                        className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Commencer le quiz
                      </Button>
                    ) : (
                      <Button
                        onClick={goToNextSection}
                        className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                      >
                        Suivant
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ----------------------------------------
            FÉLICITATIONS — bounce à l'apparition
            ---------------------------------------- */}
        <AnimatePresence>
          {allSectionsCompleted && (
            <motion.div
              variants={bouncIn}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.9 }}
              className="mt-6"
            >
              <Card className="border-green-400 bg-gradient-to-r from-green-50 to-emerald-50">
                <CardContent className="p-6 text-center">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-green-800 mb-2">
                    Félicitations ! Vous avez terminé le cours
                  </h3>
                  <p className="text-green-700 mb-4">
                    Vous êtes maintenant prêt à passer le quiz de {getLevelName()}
                  </p>
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    <Button
                      onClick={onStartQuiz}
                      size="lg"
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Commencer le quiz (20 questions)
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
