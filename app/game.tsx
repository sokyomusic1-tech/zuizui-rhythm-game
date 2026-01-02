import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, Pressable, Dimensions, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useAudioPlayer, setAudioModeAsync } from "expo-audio";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { ScreenContainer } from "@/components/screen-container";
import { useGame, type GameScore, type JudgementResult } from "@/lib/game-context";
import { NOTES_DATA } from "@/lib/notes-data";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
const NOTE_FALL_DURATION = 2000; // ノーツが落ちる時間（ミリ秒）
const JUDGEMENT_PERFECT = 50; // Perfect判定の許容誤差（ミリ秒）
const JUDGEMENT_GOOD = 100; // Good判定の許容誤差（ミリ秒）
const LANE_WIDTH = SCREEN_WIDTH / 4;
const TAP_AREA_HEIGHT = 80;
const NOTE_SIZE = 60;

export default function GameScreen() {
  const router = useRouter();
  const { currentDifficulty, saveHighScore, setLastGameResult } = useGame();
  const [gameStarted, setGameStarted] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [perfectCount, setPerfectCount] = useState(0);
  const [goodCount, setGoodCount] = useState(0);
  const [missCount, setMissCount] = useState(0);
  const [activeNotes, setActiveNotes] = useState<string[]>([]);
  const [judgementDisplay, setJudgementDisplay] = useState<JudgementResult | null>(null);
  const gameTimeRef = useRef(0);
  const processedNotesRef = useRef(new Set<string>());
  const gameEndCalledRef = useRef(false);

  const player = useAudioPlayer(require("@/assets/audio/zuizui_song.mp3"));

  const notes = currentDifficulty ? NOTES_DATA[currentDifficulty] : [];

  // ゲーム終了処理（useCallbackで最新の値を参照）
  const handleGameEnd = useCallback(async () => {
    if (gameEndCalledRef.current) return; // 二重呼び出し防止
    gameEndCalledRef.current = true;
    
    player.pause();

    alert(`Game End: score=${score}, perfect=${perfectCount}, good=${goodCount}`);

    if (currentDifficulty) {
      await saveHighScore(currentDifficulty, score);
      
      // ゲーム結果をコンテキストに保存
      const result = {
        score,
        perfect: perfectCount,
        good: goodCount,
        miss: missCount,
        maxCombo,
        difficulty: currentDifficulty,
      };
      
      console.log("Saving game result:", result);
      setLastGameResult(result);
      
      alert(`Saved result: score=${result.score}`);
    }

    // リザルト画面へ遷移
    router.replace("/result" as any);
  }, [score, perfectCount, goodCount, missCount, maxCombo, currentDifficulty, saveHighScore, setLastGameResult, router, player]);

  // 音声設定
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true });
    return () => {
      player.release();
    };
  }, [player]);

  // ゲーム開始
  useEffect(() => {
    if (!gameStarted) {
      // 3秒のカウントダウン後に開始
      const timer = setTimeout(() => {
        setGameStarted(true);
        player.play();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [gameStarted, player]);

  // ゲームタイマー
  useEffect(() => {
    if (!gameStarted) return;

    const interval = setInterval(() => {
      gameTimeRef.current += 16;
      setGameTime(gameTimeRef.current);

      // ゲーム終了チェック（曲の長さ + 2秒）
      if (gameTimeRef.current > 208000 && !gameEndCalledRef.current) {
        clearInterval(interval);
        // 次のレンダリングで呼び出す
        setTimeout(() => handleGameEnd(), 0);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [gameStarted, handleGameEnd]);

  // アクティブなノーツを更新
  useEffect(() => {
    if (!gameStarted) return;

    const currentTime = gameTime;
    const upcomingNotes = notes.filter((note) => {
      const noteTime = note.time * 1000;
      const timeDiff = noteTime - currentTime;
      return timeDiff >= 0 && timeDiff <= NOTE_FALL_DURATION && !processedNotesRef.current.has(note.id);
    });

    const newActiveNotes = upcomingNotes.map((note) => note.id);
    if (newActiveNotes.length > 0) {
      setActiveNotes((prev) => [...prev, ...newActiveNotes]);
      newActiveNotes.forEach((id) => processedNotesRef.current.add(id));
    }

    // 画面外に出たノーツを削除（Miss判定）
    setActiveNotes((prev) =>
      prev.filter((noteId) => {
        const note = notes.find((n) => n.id === noteId);
        if (!note) return false;

        const noteTime = note.time * 1000;
        const timeDiff = currentTime - noteTime;

        if (timeDiff > JUDGEMENT_GOOD) {
          // Miss判定
          handleMiss();
          return false;
        }
        return true;
      })
    );
  }, [gameTime, gameStarted, notes]);

  const handleTap = (lane: number) => {
    if (!gameStarted) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const currentTime = gameTime;
    const laneNotes = activeNotes
      .map((noteId) => notes.find((n) => n.id === noteId))
      .filter((note) => note && note.lane === lane);

    if (laneNotes.length === 0) {
      handleMiss();
      return;
    }

    // 最も近いノーツを判定
    const closestNote = laneNotes.reduce((closest, note) => {
      if (!note || !closest) return note || closest;
      const noteDiff = Math.abs(note.time * 1000 - currentTime);
      const closestDiff = Math.abs(closest.time * 1000 - currentTime);
      return noteDiff < closestDiff ? note : closest;
    });

    if (!closestNote) {
      handleMiss();
      return;
    }

    const timeDiff = Math.abs(closestNote.time * 1000 - currentTime);

    // ノーツを削除
    setActiveNotes((prev) => prev.filter((id) => id !== closestNote.id));

    // 判定
    if (timeDiff <= JUDGEMENT_PERFECT) {
      handlePerfect();
    } else if (timeDiff <= JUDGEMENT_GOOD) {
      handleGood();
    } else {
      handleMiss();
    }
  };

  const handlePerfect = () => {
    setScore((prev) => prev + 100);
    setCombo((prev) => {
      const newCombo = prev + 1;
      setMaxCombo((max) => Math.max(max, newCombo));
      return newCombo;
    });
    setPerfectCount((prev) => prev + 1);
    setJudgementDisplay({ type: "perfect", time: Date.now() });
  };

  const handleGood = () => {
    setScore((prev) => prev + 50);
    setCombo((prev) => {
      const newCombo = prev + 1;
      setMaxCombo((max) => Math.max(max, newCombo));
      return newCombo;
    });
    setGoodCount((prev) => prev + 1);
    setJudgementDisplay({ type: "good", time: Date.now() });
  };

  const handleMiss = () => {
    setCombo(0);
    setMissCount((prev) => prev + 1);
    setJudgementDisplay({ type: "miss", time: Date.now() });
  };

  // 判定表示を自動で消す
  useEffect(() => {
    if (judgementDisplay) {
      const timer = setTimeout(() => {
        setJudgementDisplay(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [judgementDisplay]);

  // カウントダウン表示
  const [countdown, setCountdown] = useState(3);
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  return (
    <ScreenContainer className="bg-black">
      <View className="flex-1">
        {/* カウントダウン */}
        {!gameStarted && countdown > 0 && (
          <View className="absolute inset-0 items-center justify-center z-50 bg-black/80">
            <Text className="text-white text-9xl font-bold">{countdown}</Text>
          </View>
        )}

        {/* スコア表示 */}
        <View className="absolute top-12 left-0 right-0 flex-row justify-between px-6 z-10">
          <View>
            <Text className="text-white text-2xl font-bold">{score}</Text>
            <Text className="text-gray-400 text-sm">Score</Text>
          </View>
          <View className="items-end">
            <Text className="text-primary text-2xl font-bold">{combo}</Text>
            <Text className="text-gray-400 text-sm">Combo</Text>
          </View>
        </View>

        {/* 判定表示 */}
        {judgementDisplay && (
          <View className="absolute top-1/3 left-0 right-0 items-center z-20">
            <Text
              className={`text-5xl font-bold ${
                judgementDisplay.type === "perfect"
                  ? "text-yellow-400"
                  : judgementDisplay.type === "good"
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {judgementDisplay.type.toUpperCase()}
            </Text>
          </View>
        )}

        {/* ノーツレーン */}
        <View className="flex-1 flex-row">
          {[0, 1, 2, 3].map((lane) => (
            <Pressable
              key={lane}
              onPress={() => handleTap(lane)}
              className="flex-1 border-r border-gray-800"
              style={{ width: LANE_WIDTH }}
            >
              {/* ノーツ */}
              {activeNotes
                .map((noteId) => notes.find((n) => n.id === noteId))
                .filter((note) => note && note.lane === lane)
                .map((note) => {
                  if (!note) return null;
                  const noteTime = note.time * 1000;
                  const progress = (gameTime - (noteTime - NOTE_FALL_DURATION)) / NOTE_FALL_DURATION;
                  const top = progress * (SCREEN_HEIGHT - TAP_AREA_HEIGHT);

                  return (
                    <View
                      key={note.id}
                      className="absolute bg-primary rounded-full"
                      style={{
                        width: NOTE_SIZE,
                        height: NOTE_SIZE,
                        top,
                        left: (LANE_WIDTH - NOTE_SIZE) / 2,
                      }}
                    />
                  );
                })}
            </Pressable>
          ))}
        </View>

        {/* タップエリア */}
        <View
          className="absolute bottom-0 left-0 right-0 flex-row"
          style={{ height: TAP_AREA_HEIGHT }}
        >
          {[0, 1, 2, 3].map((lane) => (
            <View
              key={lane}
              className="flex-1 bg-primary/20 border-r border-primary items-center justify-center"
            >
              <View className="w-16 h-16 rounded-full border-4 border-primary" />
            </View>
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
}
