import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { View, Text, Pressable, Dimensions, Platform, Image } from "react-native";
import { useRouter } from "expo-router";
import { useAudioPlayer, setAudioModeAsync } from "expo-audio";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useGame, type JudgementResult } from "@/lib/game-context";
import { NOTES_DATA, generateNotes } from "@/lib/notes-data";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
const NOTE_FALL_DURATION = 2500; // ノーツが落ちる時間（ミリ秒）
const JUDGEMENT_PERFECT = 150; // Perfect判定の許容誤差（ミリ秒）
const JUDGEMENT_GOOD = 300; // Good判定の許容誤差（ミリ秒）
const JUDGEMENT_NORMAL = 500; // Normal判定の許容誤差（ミリ秒）
const MISS_THRESHOLD = 700; // Miss判定のタイムアウト（ミリ秒）
const LANE_WIDTH = SCREEN_WIDTH / 4;
const TAP_AREA_HEIGHT = 80;
const NOTE_SIZE = 60;

// ノーツコンポーネントをメモ化して点滅を防ぐ
const Note = React.memo(({ note, gameTime }: { note: any; gameTime: number }) => {
  const noteTime = note.time * 1000;
  const progress = (gameTime - (noteTime - NOTE_FALL_DURATION)) / NOTE_FALL_DURATION;
  const top = progress * (SCREEN_HEIGHT - TAP_AREA_HEIGHT);

  return (
    <View
      className="absolute bg-primary rounded-full"
      pointerEvents="none"
      style={{
        width: NOTE_SIZE,
        height: NOTE_SIZE,
        top,
        left: (LANE_WIDTH - NOTE_SIZE) / 2,
      }}
    />
  );
});

export default function GameScreen() {
  const router = useRouter();
  const { currentDifficulty, saveHighScore, setLastGameResult, selectedSong } = useGame();
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [gameTime, setGameTime] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [perfectCount, setPerfectCount] = useState(0);
  const [goodCount, setGoodCount] = useState(0);
  const [normalCount, setNormalCount] = useState(0);
  const [missCount, setMissCount] = useState(0);
  const [activeNotes, setActiveNotes] = useState<string[]>([]);
  const [judgementDisplay, setJudgementDisplay] = useState<JudgementResult | null>(null);
  const [tapEffects, setTapEffects] = useState<{ [key: number]: boolean }>({});
  const [perfectEffects, setPerfectEffects] = useState<{ [key: number]: { show: boolean; y: number } }>({});
  const tapSound = useAudioPlayer(require("@/assets/sounds/tap.wav"));
  const [songDuration, setSongDuration] = useState<number | null>(null);
  const gameTimeRef = useRef(0);
  const processedNotesRef = useRef(new Set<string>());
  const gameEndCalledRef = useRef(false);
  const intervalRef = useRef<any>(null);

  const player = useAudioPlayer(selectedSong?.audioFile || require("@/assets/audio/zuizui_song.mp3"));

  // 選択された曲のBPMと長さに基づいてノーツを生成
  const notes = useMemo(() => {
    return currentDifficulty && selectedSong
      ? generateNotes(currentDifficulty, selectedSong.bpm, selectedSong.duration)
      : currentDifficulty
      ? NOTES_DATA[currentDifficulty]
      : [];
  }, [currentDifficulty, selectedSong]);

  // コンポーネントのアンマウント時に音楽を停止
  useEffect(() => {
    // ブラウザを閉じた時に音楽を停止
    const handleBeforeUnload = () => {
      if (player) {
        player.pause();
        player.release();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && player) {
        player.pause();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      if (player) {
        player.pause();
        player.release();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [player]);

  // ゲーム終了処理
  const handleGameEnd = useCallback(async () => {
    if (gameEndCalledRef.current) return;
    gameEndCalledRef.current = true;
    
    // 音楽を停止
    player.pause();
    
    // タイマーをクリア
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (currentDifficulty) {
      await saveHighScore(currentDifficulty, score);
      
      const result = {
        score,
        perfect: perfectCount,
        good: goodCount + normalCount, // GoodとNormalを合算
        miss: missCount,
        maxCombo,
        difficulty: currentDifficulty,
      };
      
      setLastGameResult(result);
    }

    router.replace("/result" as any);
  }, [score, perfectCount, goodCount, normalCount, missCount, maxCombo, currentDifficulty, saveHighScore, setLastGameResult, router, player]);

  // 音声設定
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true });
  }, []);

  // 曲の長さを取得
  useEffect(() => {
    const checkDuration = setInterval(() => {
      if (player.duration && player.duration > 0) {
        setSongDuration(player.duration * 1000); // 秒をミリ秒に変換
        clearInterval(checkDuration);
      }
    }, 100);

    return () => clearInterval(checkDuration);
  }, [player]);

  // カウントダウン
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !gameStarted) {
      setGameStarted(true);
      player.play();
    }
  }, [countdown, gameStarted, player]);

  // ゲームタイマー
  useEffect(() => {
    if (!gameStarted || !songDuration) return;

    intervalRef.current = setInterval(() => {
      gameTimeRef.current += 16;
      setGameTime(gameTimeRef.current);

      // ゲーム終了チェック（曲の長さ + 2秒）
      if (gameTimeRef.current > songDuration + 2000 && !gameEndCalledRef.current) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setTimeout(() => handleGameEnd(), 0);
      }
    }, 16);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [gameStarted, songDuration, handleGameEnd]);

  // ノーツの更新
  useEffect(() => {
    if (!gameStarted || gameEndCalledRef.current || !songDuration) return;

    const currentTime = gameTime;
    const upcomingNotes = notes.filter((note) => {
      const noteTime = note.time * 1000;
      const timeDiff = noteTime - currentTime;
      // 曲の長さを超えるノーツは生成しない
      if (noteTime > songDuration) return false;
      return timeDiff >= 0 && timeDiff <= NOTE_FALL_DURATION && !processedNotesRef.current.has(note.id);
    });

    const newActiveNotes = upcomingNotes.map((note) => note.id);
    if (newActiveNotes.length > 0) {
      setActiveNotes((prev) => [...prev, ...newActiveNotes]);
      newActiveNotes.forEach((id) => processedNotesRef.current.add(id));
    }
    // 画面外に出たノーツを削除（Miss判定）- 判定範囲を延長
    setActiveNotes((prev) =>
      prev.filter((noteId) => {
        const note = notes.find((n) => n.id === noteId);
        if (!note) return false;

        const noteTime = note.time * 1000;
        const timeDiff = currentTime - noteTime;

        // Miss判定の範囲を超えたら削除
        if (timeDiff > MISS_THRESHOLD) {
          handleMiss();
          return false;
        }
        return true;
      })
    );
  }, [gameTime, gameStarted, notes]);

  const handleTap = (lane: number) => {
    if (!gameStarted) return;

    // タップエフェクトを表示
    setTapEffects(prev => ({ ...prev, [lane]: true }));
    setTimeout(() => {
      setTapEffects(prev => ({ ...prev, [lane]: false }));
    }, 200);

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // タップ効果音を再生
    tapSound.seekTo(0);
    tapSound.play();

    console.log(`Tap on lane ${lane}, gameTime: ${gameTime}, activeNotes:`, activeNotes.length);

    const currentTime = gameTime;
    const laneNotes = activeNotes
      .map((noteId) => notes.find((n) => n.id === noteId))
      .filter((note) => note && note.lane === lane);

    if (laneNotes.length === 0) {
      return; // 空振りはMissにしない
    }

    // 最も近いノーツを判定
    const closestNote = laneNotes.reduce((closest, note) => {
      if (!note || !closest) return note || closest;
      const noteDiff = Math.abs(note.time * 1000 - currentTime);
      const closestDiff = Math.abs(closest.time * 1000 - currentTime);
      return noteDiff < closestDiff ? note : closest;
    });

    if (!closestNote) {
      return;
    }

    const timeDiff = Math.abs(closestNote.time * 1000 - currentTime);

    // ノーツを削除
    setActiveNotes((prev) => prev.filter((id) => id !== closestNote.id));

    // 4段階判定
    if (timeDiff <= JUDGEMENT_PERFECT) {
      handlePerfect();
      // Perfectエフェクトをノーツの位置に表示
      const noteTime = closestNote.time * 1000;
      const progress = (currentTime - (noteTime - NOTE_FALL_DURATION)) / NOTE_FALL_DURATION;
      const notePosition = progress * (SCREEN_HEIGHT - TAP_AREA_HEIGHT);
      const effectId = `${Date.now()}_${lane}`;
      setPerfectEffects(prev => ({ ...prev, [effectId]: { lane, position: notePosition } }));
      setTimeout(() => {
        setPerfectEffects(prev => {
          const newEffects = { ...prev };
          delete newEffects[effectId];
          return newEffects;
        });
      }, 500);
    } else if (timeDiff <= JUDGEMENT_GOOD) {
      handleGood();
    } else if (timeDiff <= JUDGEMENT_NORMAL) {
      handleNormal();
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
    showJudgement("perfect");
  };

  const handleGood = () => {
    setScore((prev) => prev + 70);
    setCombo((prev) => {
      const newCombo = prev + 1;
      setMaxCombo((max) => Math.max(max, newCombo));
      return newCombo;
    });
    setGoodCount((prev) => prev + 1);
    showJudgement("good");
  };

  const handleNormal = () => {
    setScore((prev) => prev + 40);
    setCombo((prev) => {
      const newCombo = prev + 1;
      setMaxCombo((max) => Math.max(max, newCombo));
      return newCombo;
    });
    setNormalCount((prev) => prev + 1);
    showJudgement("normal");
  };

  const handleMiss = () => {
    setCombo(0);
    setMissCount((prev) => prev + 1);
    showJudgement("miss");
  };

  const showJudgement = (type: "perfect" | "good" | "normal" | "miss") => {
    setJudgementDisplay({ type, time: gameTime });
    setTimeout(() => setJudgementDisplay(null), 500);
  };

  // レーンごとのノーツをメモ化
  const notesByLane = useMemo(() => {
    const lanes: { [key: number]: any[] } = { 0: [], 1: [], 2: [], 3: [] };
    activeNotes.forEach((noteId) => {
      const note = notes.find((n) => n.id === noteId);
      if (note) {
        lanes[note.lane].push(note);
      }
    });
    return lanes;
  }, [activeNotes, notes]);

  return (
    <ScreenContainer className="bg-black">
      <View className="flex-1">
        {/* カウントダウン */}
        {!gameStarted && countdown > 0 && (
          <View className="absolute inset-0 items-center justify-center z-50 bg-black/80">
            <Text className="text-white text-9xl font-bold">{countdown}</Text>
          </View>
        )}

        {/* プログレスバー */}
        {gameStarted && songDuration && (
          <View className="absolute top-4 left-0 right-0 px-6 z-10">
            <View className="h-1 bg-gray-800 rounded-full overflow-hidden">
              <View
                className="h-full bg-primary rounded-full"
                style={{
                  width: `${Math.min((gameTime / songDuration) * 100, 100)}%`,
                }}
              />
            </View>
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
                  : judgementDisplay.type === "normal"
                  ? "text-blue-400"
                  : "text-red-400"
              }`}
            >
              {judgementDisplay.type.toUpperCase()}
            </Text>
          </View>
        )}

        {/* ノーツレーン */}
        <View className="flex-1 flex-row">
          {/* Perfect爆発エフェクト */}
          {Object.entries(perfectEffects).map(([effectId, effect]) => (
            <View
              key={effectId}
              className="absolute items-center justify-center"
              style={{
                left: effect.lane * LANE_WIDTH + (LANE_WIDTH - 200) / 2,
                top: effect.position - 100,
                width: 200,
                height: 200,
                pointerEvents: 'none',
              }}
            >
              <Image
                source={require('@/assets/images/particle_effect.png')}
                style={{ width: 200, height: 200 }}
                resizeMode="contain"
              />
            </View>
          ))}
          {[0, 1, 2, 3].map((lane) => (
            <Pressable
              key={lane}
              onPress={() => handleTap(lane)}
              className="flex-1 border-r border-gray-800"
              style={[
                { width: LANE_WIDTH },
                tapEffects[lane] && { backgroundColor: 'rgba(10, 126, 164, 0.3)' }
              ]}
            >
              {/* タップエフェクト */}
              {tapEffects[lane] && (
                <View className="absolute inset-0 bg-primary/30" />
              )}

              {/* ノーツ */}
              {notesByLane[lane].map((note) => (
                <Note key={note.id} note={note} gameTime={gameTime} />
              ))}
            </Pressable>
          ))}
        </View>

        {/* タップエリア */}
        <View
          className="absolute bottom-0 left-0 right-0 flex-row"
          style={{ height: TAP_AREA_HEIGHT }}
          pointerEvents="none"
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
