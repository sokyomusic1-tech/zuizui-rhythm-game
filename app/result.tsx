import React, { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useGame, type Difficulty } from "@/lib/game-context";
import { GoogleAdSense } from "@/components/google-adsense";

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { highScores, loadHighScores } = useGame();

  const score = parseInt(params.score as string) || 0;
  const perfect = parseInt(params.perfect as string) || 0;
  const good = parseInt(params.good as string) || 0;
  const miss = parseInt(params.miss as string) || 0;
  const maxCombo = parseInt(params.maxCombo as string) || 0;
  const difficulty = (params.difficulty as Difficulty) || "normal";

  const isNewHighScore = score > highScores[difficulty];

  useEffect(() => {
    loadHighScores();
  }, []);

  return (
    <ScreenContainer className="bg-black p-6">
      <View className="flex-1 justify-center items-center gap-8">
        {/* タイトル */}
        <View className="items-center gap-2">
          <Text className="text-white text-4xl font-bold">RESULT</Text>
          <Text className="text-gray-400 text-lg capitalize">{difficulty}</Text>
        </View>

        {/* スコア */}
        <View className="items-center gap-4 bg-surface rounded-2xl p-8 w-full max-w-sm">
          {isNewHighScore && (
            <View className="bg-yellow-500 px-4 py-2 rounded-full mb-2">
              <Text className="text-black font-bold text-sm">NEW HIGH SCORE!</Text>
            </View>
          )}

          <View className="items-center">
            <Text className="text-gray-400 text-sm">Score</Text>
            <Text className="text-white text-5xl font-bold">{score}</Text>
          </View>

          <View className="w-full h-px bg-border my-2" />

          {/* 統計 */}
          <View className="w-full gap-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-green-400 text-lg font-semibold">Perfect</Text>
              <Text className="text-white text-xl font-bold">{perfect}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-yellow-400 text-lg font-semibold">Good</Text>
              <Text className="text-white text-xl font-bold">{good}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-red-400 text-lg font-semibold">Miss</Text>
              <Text className="text-white text-xl font-bold">{miss}</Text>
            </View>

            <View className="w-full h-px bg-border my-2" />

            <View className="flex-row justify-between items-center">
              <Text className="text-gray-400 text-lg">Max Combo</Text>
              <Text className="text-white text-xl font-bold">{maxCombo}</Text>
            </View>
          </View>
        </View>

        {/* ボタン */}
        <View className="gap-4 w-full max-w-sm">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-primary py-4 rounded-full active:opacity-80"
          >
            <Text className="text-white text-center font-bold text-lg">RETRY</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/")}
            className="bg-surface py-4 rounded-full active:opacity-80"
          >
            <Text className="text-white text-center font-bold text-lg">MENU</Text>
          </TouchableOpacity>
        </View>

        {/* Google AdSense 広告 */}
        <View className="mt-8 w-full max-w-sm self-center">
          <GoogleAdSense client="ca-pub-2991936078376292" />
        </View>
      </View>
    </ScreenContainer>
  );
}
