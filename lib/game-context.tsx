import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SongData } from "./song-data";

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
  lastGameResult: GameScore | null;
  setLastGameResult: (result: GameScore | null) => void;
  username: string | null;
  setUsername: (name: string) => Promise<void>;
  loadUsername: () => Promise<void>;
  selectedSong: SongData | null;
  setSelectedSong: (song: SongData | null) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const HIGH_SCORES_KEY = "@rhythm_game_high_scores";
const USERNAME_KEY = "@rhythm_game_username";

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [highScores, setHighScores] = useState<HighScores>({
    easy: 0,
    normal: 0,
    hard: 0,
  });
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty | null>(null);
  const [lastGameResult, setLastGameResult] = useState<GameScore | null>(null);
  const [username, setUsernameState] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<SongData | null>(null);

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

  const loadUsername = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(USERNAME_KEY);
      if (stored) {
        setUsernameState(stored);
      }
    } catch (error) {
      console.error("Failed to load username:", error);
    }
  }, []);

  const setUsername = useCallback(async (name: string) => {
    try {
      await AsyncStorage.setItem(USERNAME_KEY, name);
      setUsernameState(name);
    } catch (error) {
      console.error("Failed to save username:", error);
    }
  }, []);

  return (
    <GameContext.Provider
      value={{
        highScores,
        loadHighScores,
        saveHighScore,
        currentDifficulty,
        setCurrentDifficulty,
        lastGameResult,
        setLastGameResult,
        username,
        setUsername,
        loadUsername,
        selectedSong,
        setSelectedSong,
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
