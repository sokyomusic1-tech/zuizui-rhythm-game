import React, { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useGame } from "@/lib/game-context";
import { songs } from "@/lib/song-data";

export default function PracticeScreen() {
  const router = useRouter();
  const { setSelectedSong, setCurrentDifficulty } = useGame();

  const handleStartPractice = () => {
    console.log("[practice.tsx] Starting practice mode");
    // 練習曲を取得
    const practiceSong = songs.find(song => song.id === "practice");
    console.log("[practice.tsx] Practice song found:", practiceSong);
    if (!practiceSong) {
      console.error("[practice.tsx] Practice song not found");
      return;
    }
    // 練習曲を選択
    console.log("[practice.tsx] Setting selected song:", practiceSong.id);
    setSelectedSong(practiceSong.id);
    // 難易度をEASYに設定
    console.log("[practice.tsx] Setting difficulty: easy");
    setCurrentDifficulty("easy");
    // ゲーム画面に遷移
    console.log("[practice.tsx] Navigating to /game");
    router.push("/game");
  };

  return (
    <ScreenContainer className="bg-black">
      <View className="flex-1 p-6 gap-6 justify-center">
        {/* ヘッダー */}
        <View className="items-center gap-2">
          <Text className="text-4xl font-bold text-white">練習モード</Text>
          <View className="w-16 h-1 bg-primary rounded-full" />
        </View>

        {/* 説明 */}
        <View className="bg-gray-900 rounded-2xl p-6 gap-4 border-2 border-primary">
          <Text className="text-primary text-2xl font-bold text-center">
            🎮 初心者向け練習曲
          </Text>

          <View className="gap-3">
            <View className="bg-gray-800 rounded-lg p-4">
              <Text className="text-white text-base">
                ✅ ゆっくりとしたテンポ（BPM 80）
              </Text>
            </View>

            <View className="bg-gray-800 rounded-lg p-4">
              <Text className="text-white text-base">
                ✅ 簡単な配置のノーツ
              </Text>
            </View>

            <View className="bg-gray-800 rounded-lg p-4">
              <Text className="text-white text-base">
                ✅ 通常・ロング・フリックノーツを練習
              </Text>
            </View>

            <View className="bg-gray-800 rounded-lg p-4">
              <Text className="text-white text-base">
                ✅ 失敗してもOK！何度でも挑戦できます
              </Text>
            </View>
          </View>

          <View className="bg-primary/20 rounded-lg p-4 border-2 border-primary">
            <Text className="text-primary text-center font-bold">
              💡 ヒント: 判定ラインに合わせてタップしよう！
            </Text>
          </View>
        </View>

        {/* ボタン */}
        <View className="gap-4">
          <TouchableOpacity
            onPress={handleStartPractice}
            className="bg-primary rounded-2xl p-6"
          >
            <Text className="text-white text-center font-bold text-xl">
              練習を始める 🎵
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-gray-800 rounded-2xl p-4"
          >
            <Text className="text-white text-center font-bold text-lg">
              戻る
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}
