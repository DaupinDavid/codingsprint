"use client";
import { useEffect } from "react";
import { useGameStore } from "@/store/gameStore";

export default function HydrateStore() {
  useEffect(() => {
    useGameStore.persist.rehydrate();
  }, []);
  return null;
}
