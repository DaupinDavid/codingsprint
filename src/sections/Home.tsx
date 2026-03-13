"use client";
/**
 * ============================================
 * PAGE D'ACCUEIL (Home.tsx)
 * ============================================
 * Animations Framer Motion ajoutées :
 * - Header glisse vers le bas au chargement
 * - Cards des niveaux apparaissent en cascade
 * - Card Mode Survie pulse en continu
 * - Badges pop un par un
 * - Fix hydration Zustand (localStorage)
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { LEVELS } from "@/content/levels";
import type { DifficultyLevel } from "@/types";

import {
  BookOpen,
  Trophy,
  Star,
  Target,
  RotateCcw,
  GraduationCap,
  Skull,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// ============================================
// VARIANTS D'ANIMATION (configurations réutilisables)
// ============================================

/** Fondu + glissement vers le haut */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

/** Header glisse vers le bas */
const slideDown = {
  hidden: { opacity: 0, y: -40 },
  visible: { opacity: 1, y: 0 },
};

/** Conteneur qui anime ses enfants en cascade */
const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12, // 120ms entre chaque enfant
    },
  },
};

/** Badges pop avec un effet de rebond */
const badgePop = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 15 },
  },
};

// ============================================
// PROPS
// ============================================

interface HomeProps {
  onSelectLevel: (level: DifficultyLevel) => void;
  onStartExam: () => void;
  onStartSurvival: () => void;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export function Home({
  onSelectLevel,
  onStartExam,
  onStartSurvival,
}: HomeProps) {
  // ============================================
  // FIX HYDRATION ZUSTAND
  // Le store Zustand lit localStorage côté client seulement.
  // Sans ce fix, le serveur rend "0" et le client rend "19" → crash.
  // On attend que le composant soit monté avant d'afficher les données du store.
  // ============================================
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { progress, canAccessLevel, getLevelScore, resetProgress } =
    useGameStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Valeurs sûres pour le SSR (avant hydration)
  const totalXP = isClient ? progress.totalXP : 0;
  const badgesCount = isClient ? progress.badges.length : 0;
  const completedCount = isClient ? progress.completedLevels.length : 0;
  const badges = isClient ? progress.badges : [];

  const getLevelStatus = (level: DifficultyLevel) => {
    if (!isClient) return { text: "Disponible", color: "bg-blue-500" };
    if (progress.completedLevels.includes(level))
      return { text: "Complété", color: "bg-green-500" };
    if (progress.currentLevel === level)
      return { text: "En cours", color: "bg-yellow-500" };
    if (canAccessLevel(level))
      return { text: "Disponible", color: "bg-blue-500" };
    return { text: "Verrouillé", color: "bg-gray-400" };
  };

  const peutCommencerExamen = isClient && progress.completedLevels.length === 3;

  // ============================================
  // RENDU
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* ============================================
          EN-TÊTE — glisse vers le bas
          ============================================ */}
      <motion.header
        className="bg-gradient-to-r from-amber-800 via-orange-700 to-amber-800 text-white py-6 shadow-lg"
        variants={slideDown}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
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

            {/* Stats XP et Badges */}
            <div className="flex items-center gap-4">
              <motion.div
                className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <Star className="w-5 h-5 text-yellow-300" />
                <span className="font-bold">{totalXP} XP</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <Trophy className="w-5 h-5 text-yellow-300" />
                <span className="font-bold">{badgesCount} Badges</span>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ============================================
          CONTENU PRINCIPAL
          ============================================ */}
      <main className="container mx-auto px-4 py-8">
        {/* ----------------------------------------
            CARTE : Progression globale
            Apparaît en fondu + glissement
            ---------------------------------------- */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="mb-8 border-amber-200 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <Target className="w-5 h-5" />
                Votre progression
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progression globale</span>
                  <span>{Math.round((completedCount / 3) * 100)}%</span>
                </div>
                <Progress
                  value={(completedCount / 3) * 100}
                  className="h-3 bg-amber-100"
                />

                {/* Scores par niveau — apparaissent en cascade */}
                <motion.div
                  className="grid grid-cols-3 gap-4 mt-4"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {[
                    {
                      level: "debutant" as DifficultyLevel,
                      label: "Débutant",
                      bg: "bg-green-50",
                      text: "text-green-600",
                    },
                    {
                      level: "intermediaire" as DifficultyLevel,
                      label: "Intermédiaire",
                      bg: "bg-blue-50",
                      text: "text-blue-600",
                    },
                    {
                      level: "expert" as DifficultyLevel,
                      label: "Expert",
                      bg: "bg-purple-50",
                      text: "text-purple-600",
                    },
                  ].map(({ level, label, bg, text }) => (
                    <motion.div
                      key={level}
                      className={`text-center p-3 ${bg} rounded-lg`}
                      variants={fadeUp}
                    >
                      <div className={`text-2xl font-bold ${text}`}>
                        {isClient ? getLevelScore(level) : 0}
                      </div>
                      <div className="text-xs text-gray-600">{label}</div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ----------------------------------------
            GRILLE DES 3 NIVEAUX — cascade
            ---------------------------------------- */}
        <motion.div
          className="grid md:grid-cols-3 gap-6 mb-8"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {LEVELS.map((level) => {
            const statut = getLevelStatus(level.id);
            const estBloque = isClient ? !canAccessLevel(level.id) : false;
            const score = isClient ? getLevelScore(level.id) : 0;

            return (
              <motion.div key={level.id} variants={fadeUp}>
                <motion.div
                  whileHover={!estBloque ? { scale: 1.04, y: -4 } : {}}
                  whileTap={!estBloque ? { scale: 0.97 } : {}}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card
                    className={`relative overflow-hidden ${
                      estBloque
                        ? "opacity-70"
                        : "cursor-pointer shadow-lg hover:shadow-xl"
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
                      <p className="text-gray-600 text-sm mb-4">
                        {level.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          {score > 0 ? `${score}/20 questions` : "20 questions"}
                        </div>
                        <div className="text-sm text-gray-500">
                          45s/question
                        </div>
                      </div>
                      {score > 0 && (
                        <div className="mt-3">
                          <Progress
                            value={(score / 20) * 100}
                            className="h-2"
                          />
                        </div>
                      )}
                    </CardContent>

                    {estBloque && (
                      <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                        <div className="bg-white/90 px-4 py-2 rounded-full text-sm font-medium">
                          🔒 Terminez le niveau précédent
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ----------------------------------------
            CARTE : Mode Survie — pulse en continu
            ---------------------------------------- */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <motion.div
            animate={{
              boxShadow: [
                "0 0 0px #ea580c",
                "0 0 20px #ea580c",
                "0 0 0px #ea580c",
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="rounded-xl mb-8"
          >
            <Card className="bg-gradient-to-r from-gray-900 to-black border-2 border-orange-600 text-white overflow-hidden relative">
              {/* Crâne décoratif */}
              <motion.div
                className="absolute right-6 top-1/2 -translate-y-1/2 text-8xl opacity-10 select-none"
                animate={{ rotate: [-3, 3, -3] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                💀
              </motion.div>

              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-orange-400">
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
                  50 questions mélangées. Une erreur et tout s'arrête. Testez
                  vos limites et grimpez dans le classement !
                </p>
                <div className="flex items-center gap-6 mb-6 text-sm text-gray-400">
                  <span>💀 Une vie</span>
                  <span>⏱️ 20s / question</span>
                  <span>🏆 Classement sauvegardé</span>
                </div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    onClick={onStartSurvival}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-700 hover:to-red-800 font-bold text-base"
                    size="lg"
                  >
                    <Skull className="w-5 h-5 mr-2" />
                    Entrer en Mode Survie
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* ----------------------------------------
            CARTE : Examen Final
            ---------------------------------------- */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mb-8"
        >
          <Card
            className={
              peutCommencerExamen
                ? "border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50"
                : "border-gray-200 bg-gray-50"
            }
          >
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
                  : "Terminez les 3 niveaux pour débloquer l'examen final."}
              </p>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    3 séries de 20 questions
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Questions mélangées
                  </span>
                </div>
              </div>
              <motion.div
                whileHover={peutCommencerExamen ? { scale: 1.02 } : {}}
                whileTap={peutCommencerExamen ? { scale: 0.97 } : {}}
              >
                <Button
                  onClick={onStartExam}
                  disabled={!peutCommencerExamen}
                  className={`w-full ${
                    peutCommencerExamen
                      ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                      : "bg-gray-400"
                  }`}
                  size="lg"
                >
                  {peutCommencerExamen ? "Commencer l'examen" : "Verrouillé"}
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ----------------------------------------
            SECTION : Badges — pop un par un
            ---------------------------------------- */}
        <AnimatePresence>
          {badges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.4 }}
            >
              <Card className="mb-8 border-amber-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-900">
                    <Trophy className="w-5 h-5" />
                    Vos badges ({badges.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <motion.div
                    className="flex flex-wrap gap-3"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {badges.map((badge) => (
                      <motion.div key={badge.id} variants={badgePop}>
                        <Dialog>
                          <DialogTrigger asChild>
                            <motion.div
                              className="flex items-center gap-2 bg-gradient-to-r from-amber-100 to-yellow-100 px-4 py-2 rounded-full cursor-pointer"
                              whileHover={{
                                scale: 1.08,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                              }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <span className="text-2xl">{badge.icon}</span>
                              <span className="font-medium text-amber-900">
                                {badge.name}
                              </span>
                            </motion.div>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <span className="text-3xl">{badge.icon}</span>
                                {badge.name}
                              </DialogTitle>
                              <DialogDescription>
                                {badge.description}
                              </DialogDescription>
                            </DialogHeader>
                            <p className="text-sm text-gray-500">
                              Débloqué le{" "}
                              {new Date(badge.unlockedAt).toLocaleDateString(
                                "fr-FR",
                              )}
                            </p>
                          </DialogContent>
                        </Dialog>
                      </motion.div>
                    ))}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ----------------------------------------
            BOUTON : Réinitialiser
            ---------------------------------------- */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            variant="outline"
            onClick={() => setShowResetConfirm(true)}
            className="text-gray-500 hover:text-red-600"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Réinitialiser ma progression
          </Button>
        </motion.div>

        {/* ----------------------------------------
            DIALOGUE : Confirmation de réinitialisation
            ---------------------------------------- */}
        <AnimatePresence>
          {showResetConfirm && (
            <motion.div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <Card className="max-w-md w-full mx-4">
                  <CardHeader>
                    <CardTitle className="text-red-600">
                      Réinitialiser ?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Êtes-vous sûr de vouloir réinitialiser votre progression ?
                      Cette action est irréversible.
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
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
