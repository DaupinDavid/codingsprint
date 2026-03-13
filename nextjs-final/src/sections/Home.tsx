"use client";
/**
 * ============================================
 * PAGE D'ACCUEIL (Home.tsx)
 * ============================================
 * 
 * Cette page est la première que voit l'utilisateur.
 * Elle affiche :
 * - Le titre et le logo de l'application
 * - La progression de l'utilisateur (XP, badges)
 * - Les 3 niveaux de difficulté (cartes cliquables)
 * - L'accès au Mode Survie (NOUVEAU)
 * - L'accès à l'examen final (quand débloqué)
 * 
 * C'est comme le "menu principal" du jeu.
 * 
 * MODIFICATION : Ajout de la carte "Mode Survie" et de la prop onStartSurvival
 */

import { useState } from 'react';  // Hook pour gérer l'état local
import { useGameStore } from '@/store/gameStore';  // Notre store de données
import { LEVELS } from '@/types';  // Les informations des niveaux
import type { DifficultyLevel } from '@/types';

// Icônes importées depuis la bibliothèque Lucide
import { BookOpen, Trophy, Star, Target, RotateCcw, GraduationCap, Skull } from 'lucide-react';

// Composants UI de shadcn/ui
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// ============================================
// PROPS (données reçues du parent)
// ============================================

interface HomeProps {
  /** Fonction appelée quand l'utilisateur clique sur un niveau */
  onSelectLevel: (level: DifficultyLevel) => void;
  /** Fonction appelée quand l'utilisateur veut faire l'examen */
  onStartExam: () => void;
  /** Fonction appelée quand l'utilisateur veut jouer en Mode Survie */
  onStartSurvival: () => void;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export function Home({ onSelectLevel, onStartExam, onStartSurvival }: HomeProps) {
  // Récupère la progression depuis le store
  const { progress, canAccessLevel, getLevelScore, resetProgress } = useGameStore();
  
  // État pour afficher/masquer la confirmation de réinitialisation
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // ============================================
  // FONCTION : Déterminer le statut d'un niveau
  // ============================================
  const getLevelStatus = (level: DifficultyLevel) => {
    if (progress.completedLevels.includes(level)) {
      return { text: 'Complété', color: 'bg-green-500' };
    }
    if (progress.currentLevel === level) {
      return { text: 'En cours', color: 'bg-yellow-500' };
    }
    if (canAccessLevel(level)) {
      return { text: 'Disponible', color: 'bg-blue-500' };
    }
    return { text: 'Verrouillé', color: 'bg-gray-400' };
  };

  // ============================================
  // VÉRIFICATION : Examen débloqué ?
  // ============================================
  // L'examen est accessible seulement quand les 3 niveaux sont terminés
  const peutCommencerExamen = progress.completedLevels.length === 3;

  // ============================================
  // RENDU (HTML affiché à l'écran)
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      
      {/* ============================================
          EN-TÊTE (Header)
          ============================================ */}
      <header className="bg-gradient-to-r from-amber-800 via-orange-700 to-amber-800 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo et titre */}
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-xl">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Wikipedia Learn</h1>
                <p className="text-amber-100 text-sm">Le Moyen-Âge</p>
              </div>
            </div>
            
            {/* Stats (XP et Badges) */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <Star className="w-5 h-5 text-yellow-300" />
                <span className="font-bold">{progress.totalXP} XP</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <Trophy className="w-5 h-5 text-yellow-300" />
                <span className="font-bold">{progress.badges.length} Badges</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ============================================
          CONTENU PRINCIPAL
          ============================================ */}
      <main className="container mx-auto px-4 py-8">
        
        {/* ----------------------------------------
            CARTE : Progression globale
            ---------------------------------------- */}
        <Card className="mb-8 border-amber-200 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <Target className="w-5 h-5" />
              Votre progression
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Barre de progression globale */}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progression globale</span>
                <span>{Math.round((progress.completedLevels.length / 3) * 100)}%</span>
              </div>
              <Progress
                value={(progress.completedLevels.length / 3) * 100}
                className="h-3 bg-amber-100"
              />
              
              {/* Scores par niveau */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {getLevelScore('debutant')}
                  </div>
                  <div className="text-xs text-gray-600">Débutant</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {getLevelScore('intermediaire')}
                  </div>
                  <div className="text-xs text-gray-600">Intermédiaire</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {getLevelScore('expert')}
                  </div>
                  <div className="text-xs text-gray-600">Expert</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ----------------------------------------
            GRILLE DES 3 NIVEAUX
            ---------------------------------------- */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {LEVELS.map((level) => {
            const statut    = getLevelStatus(level.id);
            const estBloque = !canAccessLevel(level.id);
            const score     = getLevelScore(level.id);

            return (
              <Card
                key={level.id}
                className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                  estBloque ? 'opacity-70' : 'cursor-pointer shadow-lg hover:shadow-xl'
                } ${level.bgColor}`}
                onClick={() => !estBloque && onSelectLevel(level.id)}
              >
                {/* Badge de statut */}
                <div className="absolute top-0 right-0 p-4">
                  <Badge className={`${statut.color} text-white`}>
                    {statut.text}
                  </Badge>
                </div>
                
                <CardHeader>
                  <div className="text-4xl mb-2">{level.icon}</div>
                  <CardTitle className={`text-xl ${level.color}`}>
                    {level.name}
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">{level.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {score > 0 ? `${score}/20 questions` : '20 questions'}
                    </div>
                    <div className="text-sm text-gray-500">45s/question</div>
                  </div>
                  {/* Barre de progression du niveau */}
                  {score > 0 && (
                    <div className="mt-3">
                      <Progress value={(score / 20) * 100} className="h-2" />
                    </div>
                  )}
                </CardContent>
                
                {/* Overlay pour les niveaux verrouillés */}
                {estBloque && (
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                    <div className="bg-white/90 px-4 py-2 rounded-full text-sm font-medium">
                      🔒 Terminez le niveau précédent
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* ----------------------------------------
            CARTE : Mode Survie
            Couleurs orange et noire — icône crâne
            ---------------------------------------- */}
        <Card className="mb-8 bg-gradient-to-r from-gray-900 to-black border-2 border-orange-600 text-white overflow-hidden relative">
          
          {/* Crâne décoratif en arrière-plan */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-8xl opacity-10 select-none">
            💀
          </div>

          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-orange-400">
              {/* Icône distinctive : crâne sur fond orange */}
              <div className="bg-orange-600 p-2 rounded-lg">
                <Skull className="w-6 h-6 text-white" />
              </div>
              Mode Survie
              <Badge className="bg-orange-600 text-white border-none ml-auto">
                NOUVEAU
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-gray-300 mb-4">
              50 questions mélangées. Une erreur et tout s'arrête.
              Testez vos limites et grimpez dans le classement !
            </p>
            {/* Infos rapides du mode */}
            <div className="flex items-center gap-6 mb-6 text-sm text-gray-400">
              <span>💀 Une vie</span>
              <span>⏱️ 20s / question</span>
              <span>🏆 Classement sauvegardé</span>
            </div>
            <Button
              onClick={onStartSurvival}
              className="w-full bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-700 hover:to-red-800 font-bold text-base"
              size="lg"
            >
              <Skull className="w-5 h-5 mr-2" />
              Entrer en Mode Survie
            </Button>
          </CardContent>
        </Card>

        {/* ----------------------------------------
            CARTE : Examen Final
            ---------------------------------------- */}
        <Card className={`mb-8 ${peutCommencerExamen ? 'border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50' : 'border-gray-200 bg-gray-50'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6" />
              Examen Final
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              {peutCommencerExamen
                ? "Félicitations ! Vous pouvez maintenant passer l'examen final pour obtenir votre diplôme."
                : "Terminez les 3 niveaux pour débloquer l'examen final."
              }
            </p>
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
            <Button
              onClick={onStartExam}
              disabled={!peutCommencerExamen}
              className={`w-full ${
                peutCommencerExamen
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700'
                  : 'bg-gray-400'
              }`}
              size="lg"
            >
              {peutCommencerExamen ? "Commencer l'examen" : "Verrouillé"}
            </Button>
          </CardContent>
        </Card>

        {/* ----------------------------------------
            SECTION : Badges débloqués
            ---------------------------------------- */}
        {progress.badges.length > 0 && (
          <Card className="mb-8 border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <Trophy className="w-5 h-5" />
                Vos badges ({progress.badges.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {progress.badges.map((badge) => (
                  <Dialog key={badge.id}>
                    <DialogTrigger asChild>
                      <div className="flex items-center gap-2 bg-gradient-to-r from-amber-100 to-yellow-100 px-4 py-2 rounded-full cursor-pointer hover:shadow-md transition-shadow">
                        <span className="text-2xl">{badge.icon}</span>
                        <span className="font-medium text-amber-900">{badge.name}</span>
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <span className="text-3xl">{badge.icon}</span>
                          {badge.name}
                        </DialogTitle>
                        <DialogDescription>{badge.description}</DialogDescription>
                      </DialogHeader>
                      <p className="text-sm text-gray-500">
                        Débloqué le {new Date(badge.unlockedAt).toLocaleDateString('fr-FR')}
                      </p>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ----------------------------------------
            BOUTON : Réinitialiser la progression
            ---------------------------------------- */}
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setShowResetConfirm(true)}
            className="text-gray-500 hover:text-red-600"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Réinitialiser ma progression
          </Button>
        </div>

        {/* ----------------------------------------
            DIALOGUE : Confirmation de réinitialisation
            ---------------------------------------- */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="max-w-md w-full mx-4">
              <CardHeader>
                <CardTitle className="text-red-600">Réinitialiser ?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Êtes-vous sûr de vouloir réinitialiser votre progression ? Cette action est irréversible.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      resetProgress();
                      setShowResetConfirm(false);
                    }}
                    className="flex-1"
                  >
                    Réinitialiser
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
