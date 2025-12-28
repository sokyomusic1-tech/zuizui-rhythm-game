import React, { createContext, useContext, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Difficulty = "easy" | "normal" | "hard";

export interface Note {
  id: string;
  time: number; // 曲開始からの秒数
  lane: 0 | 1 | 2 | 3; // 4つのレーン
}

export interface JudgementResult {
  type: "perfect" | "good" | "miss";
  time: number;
}

export interface GameScore {
  score: number;
  perfect: number;
  good: number;
  miss: number;
  maxCombo: number;
  difficulty: Difficulty;
}

export interface HighScores {
  easy: number;
  normal: number;
  hard: number;
}

interface GameContextType {
  highScores: HighScores;
  loadHighScores: () => Promise<void>;
  saveHighScore: (difficulty: Difficulty, score: number) => Promise<void>;
  currentDifficulty: Difficulty | null;
  setCurrentDifficulty: (difficulty: Difficulty | null) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const HIGH_SCORES_KEY = "@rhythm_game_high_scores";

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [highScores, setHighScores] = useState<HighScores>({
    easy: 0,
    normal: 0,
    hard: 0,
  });
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty | null>(null);

  const loadHighScores = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(HIGH_SCORES_KEY);
      if (stored) {
        setHighScores(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load high scores:", error);
    }
  }, []);

  const saveHighScore = useCallback(
    async (difficulty: Difficulty, score: number) => {
      try {
        const newHighScores = { ...highScores };
        if (score > newHighScores[difficulty]) {
          newHighScores[difficulty] = score;
          setHighScores(newHighScores);
          await AsyncStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(newHighScores));
        }
      } catch (error) {
        console.error("Failed to save high score:", error);
      }
    },
    [highScores]
  );

  return (
    <GameContext.Provider
      value={{
        highScores,
        loadHighScores,
        saveHighScore,
        currentDifficulty,
        setCurrentDifficulty,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within GameProvider");
  }
  return context;
}
