import React, { useEffect, useState, useRef, useCallback } from "react";
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
  const { currentDifficulty, saveHighScore } = useGame();
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

  const player = useAudioPlayer(require("@/assets/audio/zuizui_song.mp3"));

  const notes = currentDifficulty ? NOTES_DATA[currentDifficulty] : [];

  // 音声設定
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true });
    return () => {
      player.release();
    };
  }, []);

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
  }, [gameStarted]);

  // ゲームタイマー
  useEffect(() => {
    if (!gameStarted) return;

    const interval = setInterval(() => {
      gameTimeRef.current += 16;
      setGameTime(gameTimeRef.current);

      // ゲーム終了チェック（曲の長さ + 2秒）
      if (gameTimeRef.current > 208000) {
        clearInterval(interval);
        handleGameEnd();
      }
    }, 16);

    return () => clearInterval(interval);
  }, [gameStarted]);

  // アクティブなノーツを更新
  useEffect(() => {
    if (!gameStarted) return;

    const currentTimeSec = gameTime / 1000;
    const newActiveNotes = notes
      .filter((note) => {
        const noteAppearTime = note.time - NOTE_FALL_DURATION / 1000;
        const noteEndTime = note.time + 0.5;
        return currentTimeSec >= noteAppearTime && currentTimeSec <= noteEndTime;
      })
      .map((note) => note.id);

    setActiveNotes(newActiveNotes);

    // ミス判定（ノーツが通り過ぎた）
    notes.forEach((note) => {
      if (
        !processedNotesRef.current.has(note.id) &&
        currentTimeSec > note.time + JUDGEMENT_GOOD / 1000
      ) {
        processedNotesRef.current.add(note.id);
        handleMiss();
      }
    });
  }, [gameTime, gameStarted]);

  const handleTap = useCallback(
    (lane: number) => {
      if (!gameStarted) return;

      const currentTimeSec = gameTime / 1000;

      // このレーンの最も近いノーツを探す
      const nearestNote = notes
        .filter((note) => note.lane === lane && !processedNotesRef.current.has(note.id))
        .sort((a, b) => Math.abs(a.time - currentTimeSec) - Math.abs(b.time - currentTimeSec))[0];

      if (!nearestNote) return;

      const timeDiff = Math.abs(nearestNote.time - currentTimeSec) * 1000;

      if (timeDiff <= JUDGEMENT_PERFECT) {
        processedNotesRef.current.add(nearestNote.id);
        handlePerfect();
      } else if (timeDiff <= JUDGEMENT_GOOD) {
        processedNotesRef.current.add(nearestNote.id);
        handleGood();
      }
    },
    [gameTime, gameStarted, notes]
  );

  const handlePerfect = () => {
    const newCombo = combo + 1;
    const comboMultiplier = Math.floor(newCombo / 10) * 0.1 + 1;
    const points = Math.floor(100 * comboMultiplier);

    setScore((prev) => prev + points);
    setCombo(newCombo);
    setMaxCombo((prev) => Math.max(prev, newCombo));
    setPerfectCount((prev) => prev + 1);
    setJudgementDisplay({ type: "perfect", time: Date.now() });

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleGood = () => {
    const newCombo = combo + 1;
    const comboMultiplier = Math.floor(newCombo / 10) * 0.1 + 1;
    const points = Math.floor(50 * comboMultiplier);

    setScore((prev) => prev + points);
    setCombo(newCombo);
    setMaxCombo((prev) => Math.max(prev, newCombo));
    setGoodCount((prev) => prev + 1);
    setJudgementDisplay({ type: "good", time: Date.now() });

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleMiss = () => {
    setCombo(0);
    setMissCount((prev) => prev + 1);
    setJudgementDisplay({ type: "miss", time: Date.now() });
  };

  const handleGameEnd = async () => {
    player.pause();

    if (currentDifficulty) {
      await saveHighScore(currentDifficulty, score);
    }

    // リザルト画面へ遷移（パラメータをクエリ文字列として渡す）
    router.replace(
      `/result?score=${score}&perfect=${perfectCount}&good=${goodCount}&miss=${missCount}&maxCombo=${maxCombo}&difficulty=${currentDifficulty || "normal"}` as any
    );
  };

  // 判定表示を自動で消す
  useEffect(() => {
    if (judgementDisplay) {
      const timer = setTimeout(() => setJudgementDisplay(null), 500);
      return () => clearTimeout(timer);
    }
  }, [judgementDisplay]);

  if (!currentDifficulty) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-foreground text-xl">難易度が選択されていません</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-black">
      {/* スコア表示 */}
      <View className="absolute top-4 left-0 right-0 z-10 px-4">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-2xl font-bold">{score}</Text>
            <Text className="text-gray-400 text-sm">Score</Text>
          </View>
          <View className="items-center">
            <Text className="text-white text-xl font-bold">{combo}</Text>
            <Text className="text-gray-400 text-sm">Combo</Text>
          </View>
        </View>
      </View>

      {/* 判定表示 */}
      {judgementDisplay && (
        <View className="absolute top-1/3 left-0 right-0 z-20 items-center">
          <Text
            className={`text-4xl font-bold ${
              judgementDisplay.type === "perfect"
                ? "text-green-400"
                : judgementDisplay.type === "good"
                  ? "text-yellow-400"
                  : "text-red-400"
            }`}
          >
            {judgementDisplay.type.toUpperCase()}
          </Text>
        </View>
      )}

      {/* カウントダウン */}
      {!gameStarted && (
        <View className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center bg-black/80 z-30">
          <Text className="text-white text-6xl font-bold">READY</Text>
        </View>
      )}

      {/* ノーツレーン */}
      <View className="flex-1 relative">
        {/* レーン区切り線 */}
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            className="absolute top-0 bottom-0 w-px bg-gray-700"
            style={{ left: LANE_WIDTH * i }}
          />
        ))}

        {/* ノーツ */}
        {activeNotes.map((noteId) => {
          const note = notes.find((n) => n.id === noteId);
          if (!note) return null;

          const currentTimeSec = gameTime / 1000;
          const noteAppearTime = note.time - NOTE_FALL_DURATION / 1000;
          const progress = (currentTimeSec - noteAppearTime) / (NOTE_FALL_DURATION / 1000);
          const y = progress * (SCREEN_HEIGHT - TAP_AREA_HEIGHT);

          return (
            <View
              key={noteId}
              className="absolute bg-red-500 rounded-full"
              style={{
                left: note.lane * LANE_WIDTH + (LANE_WIDTH - NOTE_SIZE) / 2,
                top: y,
                width: NOTE_SIZE,
                height: NOTE_SIZE,
              }}
            />
          );
        })}

        {/* タップエリア */}
        <View
          className="absolute bottom-0 left-0 right-0 flex-row border-t-2 border-white"
          style={{ height: TAP_AREA_HEIGHT }}
        >
          {[0, 1, 2, 3].map((lane) => (
            <Pressable
              key={lane}
              onPress={() => handleTap(lane)}
              style={({ pressed }) => [
                {
                  flex: 1,
                  backgroundColor: pressed ? "rgba(255,255,255,0.2)" : "transparent",
                },
              ]}
            >
              <View className="flex-1 items-center justify-center">
                <View className="w-12 h-12 rounded-full border-2 border-white/50" />
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
}
