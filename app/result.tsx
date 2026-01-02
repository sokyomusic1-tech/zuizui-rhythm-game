import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useGame } from "@/lib/game-context";
import { GoogleAdSense } from "@/components/google-adsense";
import { trpc } from "@/lib/trpc";
import { Platform } from "react-native";

export default function ResultScreen() {
  const router = useRouter();
  const { highScores, loadHighScores, lastGameResult, username } = useGame();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  
  const submitScoreMutation = trpc.leaderboard.submitScore.useMutation();

  // コンテキストからゲーム結果を取得
  const score = lastGameResult?.score || 0;
  const perfect = lastGameResult?.perfect || 0;
  const good = lastGameResult?.good || 0;
  const miss = lastGameResult?.miss || 0;
  const maxCombo = lastGameResult?.maxCombo || 0;
  const difficulty = lastGameResult?.difficulty || "normal";

  const isNewHighScore = score > highScores[difficulty];

  useEffect(() => {
    loadHighScores();
  }, []);

  const handleSubmitScore = async () => {
    if (!username) {
      if (Platform.OS === "web") {
        alert("ユーザー名を設定してください");
      } else {
        Alert.alert("エラー", "ユーザー名を設定してください");
      }
      router.push("/");
      return;
    }

    if (!lastGameResult) {
      return;
    }

    setIsSubmitting(true);

    try {
      await submitScoreMutation.mutateAsync({
        username,
        score,
        difficulty,
        perfect,
        good,
        miss,
        maxCombo,
      });

      setHasSubmitted(true);

      if (Platform.OS === "web") {
        alert("スコアを送信しました！");
      } else {
        Alert.alert("成功", "スコアを送信しました！");
      }
    } catch (error) {
      console.error("Failed to submit score:", error);
      if (Platform.OS === "web") {
        alert("スコアの送信に失敗しました");
      } else {
        Alert.alert("エラー", "スコアの送信に失敗しました");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer className="bg-black p-6">
      <View className="flex-1 justify-center items-center gap-8">
        {/* タイトル */}
        <View className="items-center gap-2">
          <Text className="text-white text-4xl font-bold">RESULT</Text>
          <Text className="text-gray-400 text-lg capitalize">{difficulty}</Text>
        </View>
        {/* スコア */}
        <View className="items-center gap-4 bg-gray-900 rounded-2xl p-8 w-full max-w-sm border-2 border-primary">
          {isNewHighScore && (
            <View className="bg-yellow-500 px-4 py-2 rounded-full mb-2">
              <Text className="text-black font-bold text-sm">NEW HIGH SCORE!</Text>
            </View>
          )}

          <View className="items-center">
            <Text className="text-gray-300 text-sm">Score</Text>
            <Text className="text-primary text-5xl font-bold">{score}</Text>
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
              <Text className="text-gray-300 text-lg">Max Combo</Text>
              <Text className="text-primary text-xl font-bold">{maxCombo}</Text>
            </View>
          </View>
        </View>

        {/* ボタン */}
        <View className="gap-4 w-full max-w-sm">
          {/* スコア送信ボタン */}
          {!hasSubmitted && (
            <TouchableOpacity
              onPress={handleSubmitScore}
              disabled={isSubmitting}
              className="bg-yellow-500 py-4 rounded-full active:opacity-80"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text className="text-black text-center font-bold text-lg">
                  ランキングに送信
                </Text>
              )}
            </TouchableOpacity>
          )}

          {hasSubmitted && (
            <TouchableOpacity
              onPress={() => router.push("/leaderboard")}
              className="bg-yellow-500 py-4 rounded-full active:opacity-80"
            >
              <Text className="text-black text-center font-bold text-lg">
                ランキングを見る
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-primary py-4 rounded-full active:opacity-80"
          >
            <Text className="text-white text-center font-bold text-lg">RETRY</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/")}
            className="bg-gray-800 border-2 border-primary py-4 rounded-full active:opacity-80"
          >
            <Text className="text-primary text-center font-bold text-lg">MENU</Text>
          </TouchableOpacity>
        </View>

        {/* Google AdSense 広告 */}
        <View className="mt-8 w-full max-w-sm self-center">
          <GoogleAdSense client="ca-pub-2991936078376292" slot="5726193644" />
        </View>
      </View>
    </ScreenContainer>
  );
}
