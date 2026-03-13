"use client";
/**
 * ============================================
 * PAGE DU COURS (Course.tsx)
 * ============================================
 * 
 * Cette page affiche le contenu pédagogique d'un niveau.
 * Elle contient :
 * - Un sommaire sur le côté gauche
 * - Le contenu de la section active au centre
 * - Des boutons pour naviguer entre les sections
 * 
 * Quand toutes les sections sont lues, le bouton
 * "Commencer le quiz" apparaît.
 */

import { useState, useEffect } from 'react';  // Hooks React
import { courses } from '@/data/courses';     // Données des cours
import type { DifficultyLevel } from '@/types';

// Icônes
import { ChevronLeft, ChevronRight, BookOpen, Clock, CheckCircle, Play } from 'lucide-react';

// Composants UI
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

// ============================================
// PROPS
// ============================================

interface CourseProps {
  /** Niveau du cours à afficher */
  level: DifficultyLevel;
  /** Fonction appelée pour retourner à l'accueil */
  onBack: () => void;
  /** Fonction appelée pour démarrer le quiz */
  onStartQuiz: () => void;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export function Course({ level, onBack, onStartQuiz }: CourseProps) {
  // Récupère le cours correspondant au niveau
  const course = courses.find(c => c.level === level);
  
  // État : section actuellement affichée (index)
  const [currentSection, setCurrentSection] = useState(0);
  
  // État : liste des sections déjà lues
  const [completedSections, setCompletedSections] = useState<number[]>([]);

  // Si le cours n'existe pas, on ne rend rien
  if (!course) return null;

  // ============================================
  // EFFET : Marquer automatiquement la section comme lue
  // ============================================
  useEffect(() => {
    // Si la section actuelle n'est pas dans la liste des sections lues
    if (!completedSections.includes(currentSection)) {
      // On l'ajoute automatiquement
      setCompletedSections(prev => [...prev, currentSection]);
    }
  }, [currentSection]);  // Se déclenche quand currentSection change

  // ============================================
  // FONCTION : Aller à la section suivante
  // ============================================
  const goToNextSection = () => {
    if (currentSection < course.sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  // ============================================
  // FONCTION : Aller à la section précédente
  // ============================================
  const goToPreviousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  // ============================================
  // FONCTION : Cliquer sur une section du sommaire
  // ============================================
  const handleSectionClick = (index: number) => {
    setCurrentSection(index);
  };

  // ============================================
  // CALCULS
  // ============================================
  
  // Pourcentage de progression
  const progress = ((completedSections.length) / course.sections.length) * 100;
  
  // Toutes les sections sont-elles lues ?
  const allSectionsCompleted = completedSections.length === course.sections.length;

  // ============================================
  // FONCTIONS : Couleurs selon le niveau
  // ============================================
  const getLevelColor = () => {
    switch (level) {
      case 'debutant': return 'text-green-600 bg-green-50 border-green-200';
      case 'intermediaire': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'expert': return 'text-purple-600 bg-purple-50 border-purple-200';
    }
  };

  const getLevelName = () => {
    switch (level) {
      case 'debutant': return 'Débutant';
      case 'intermediaire': return 'Intermédiaire';
      case 'expert': return 'Expert';
    }
  };

  const getLevelIcon = () => {
    switch (level) {
      case 'debutant': return '🌱';
      case 'intermediaire': return '📚';
      case 'expert': return '👑';
    }
  };

  // ============================================
  // RENDU
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      
      {/* ============================================
          EN-TÊTE
          ============================================ */}
      <header className="bg-white border-b border-amber-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Bouton retour */}
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
              <ChevronLeft className="w-5 h-5" />
              Retour
            </Button>
            
            {/* Titre du cours */}
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
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      {/* ============================================
          CONTENU PRINCIPAL
          ============================================ */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          
          {/* ----------------------------------------
              SOMMAIRE (colonne de gauche)
              ---------------------------------------- */}
          <Card className="lg:col-span-1 h-fit">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Sommaire
              </h3>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {course.sections.map((section, index) => (
                    <button
                      key={section.id}
                      onClick={() => handleSectionClick(index)}
                      className={`w-full text-left p-3 rounded-lg text-sm transition-all ${
                        currentSection === index
                          ? getLevelColor()  // Couleur du niveau si sélectionné
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {/* Icône : check si lu, cercle vide sinon */}
                        {completedSections.includes(index) ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                        )}
                        <span className="truncate">{section.title}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* ----------------------------------------
              CONTENU DE LA SECTION (colonne principale)
              ---------------------------------------- */}
          <Card className="lg:col-span-3">
            <CardContent className="p-6">
              <div className="mb-6">
                {/* Numéro de section */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <span>Section {currentSection + 1} sur {course.sections.length}</span>
                </div>
                
                {/* Titre de la section */}
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {course.sections[currentSection].title}
                </h2>
                
                {/* Contenu texte */}
                <div className="prose prose-amber max-w-none">
                  {course.sections[currentSection].content.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-4 text-gray-700 leading-relaxed whitespace-pre-line">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* ----------------------------------------
                  NAVIGATION (boutons Précédent/Suivant)
                  ---------------------------------------- */}
              <div className="flex items-center justify-between pt-6 border-t">
                {/* Bouton Précédent */}
                <Button
                  variant="outline"
                  onClick={goToPreviousSection}
                  disabled={currentSection === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Précédent
                </Button>

                {/* Bouton Suivant OU Commencer le quiz */}
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
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ----------------------------------------
            MESSAGE DE FÉLICITATIONS (si tout lu)
            ---------------------------------------- */}
        {allSectionsCompleted && (
          <Card className="mt-6 border-green-400 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-800 mb-2">
                Félicitations ! Vous avez terminé le cours
              </h3>
              <p className="text-green-700 mb-4">
                Vous êtes maintenant prêt à passer le quiz de {getLevelName()}
              </p>
              <Button
                onClick={onStartQuiz}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Play className="w-5 h-5 mr-2" />
                Commencer le quiz (20 questions)
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
