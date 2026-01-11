import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";

export default function TutorialScreen() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);

  const tutorialPages = [
    {
      title: "ゲームの基本",
      content: [
        "画面下部のタップエリアをタイミングよくタップして、落ちてくるノーツを判定します。",
        "判定ラインに合わせてタップすることで、高得点を獲得できます。",
        "4つのレーンがあり、それぞれのレーンに対応する位置をタップします。"
      ]
    },
    {
      title: "ノーツの種類",
      content: [
        "【通常ノーツ】\n丸いノーツです。判定ラインに来たらタップします。",
        "【ロングノーツ】\n縦長のバーがついたノーツです。タップして長押しし、終点で離します。",
        "【フリックノーツ】\n矢印がついたノーツです。タップした後、矢印の方向にスワイプします。"
      ]
    },
    {
      title: "判定システム",
      content: [
        "【PERFECT】\n±150ms以内 - 最高得点（100点）",
        "【GOOD】\n±300ms以内 - 良い得点（70点）",
        "【NORMAL】\n±500ms以内 - 普通の得点（40点）",
        "【MISS】\n判定範囲外 - 得点なし、コンボ途切れ"
      ]
    },
    {
      title: "スコアボーナス",
      content: [
        "【難易度ボーナス】\nEASY: 1.0倍 / NORMAL: 1.2倍 / HARD: 1.5倍",
        "【スピードボーナス】\n0.5x: 0.8倍 / 1.0x: 1.0倍 / 2.0x: 1.5倍",
        "【フィーバーモード】\n50コンボ達成で発動！10秒間スコア1.5倍"
      ]
    },
    {
      title: "練習モード",
      content: [
        "初心者向けの練習曲が用意されています。",
        "各ノーツタイプを順番に練習できます。",
        "失敗してもペナルティはありません。",
        "準備ができたら、「練習を始める」ボタンをタップしてください！"
      ]
    }
  ];

  const currentPageData = tutorialPages[currentPage];

  const handleNext = () => {
    if (currentPage < tutorialPages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleStartPractice = () => {
    router.push("/practice");
  };

  return (
    <ScreenContainer className="bg-black">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 p-6 gap-6">
          {/* ヘッダー */}
          <View className="items-center gap-2 mt-8">
            <Text className="text-4xl font-bold text-white">チュートリアル</Text>
            <View className="w-16 h-1 bg-primary rounded-full" />
          </View>

          {/* ページインジケーター */}
          <View className="flex-row justify-center gap-2">
            {tutorialPages.map((_, index) => (
              <View
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentPage ? "bg-primary" : "bg-gray-600"
                }`}
              />
            ))}
          </View>

          {/* コンテンツ */}
          <View className="bg-gray-900 rounded-2xl p-6 flex-1 border-2 border-primary">
            <Text className="text-primary text-2xl font-bold mb-6 text-center">
              {currentPageData.title}
            </Text>

            <View className="gap-4">
              {currentPageData.content.map((text, index) => (
                <View key={index} className="bg-gray-800 rounded-lg p-4">
                  <Text className="text-white text-base leading-6">{text}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ナビゲーションボタン */}
          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={handlePrev}
              disabled={currentPage === 0}
              className={`flex-1 rounded-2xl p-4 ${
                currentPage === 0 ? "bg-gray-700" : "bg-gray-800"
              }`}
            >
              <Text
                className={`text-center font-bold text-lg ${
                  currentPage === 0 ? "text-gray-500" : "text-white"
                }`}
              >
                ← 前へ
              </Text>
            </TouchableOpacity>

            {currentPage === tutorialPages.length - 1 ? (
              <TouchableOpacity
                onPress={handleStartPractice}
                className="flex-1 bg-primary rounded-2xl p-4"
              >
                <Text className="text-white text-center font-bold text-lg">
                  練習を始める 🎮
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleNext}
                className="flex-1 bg-primary rounded-2xl p-4"
              >
                <Text className="text-white text-center font-bold text-lg">
                  次へ →
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* 戻るボタン */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-gray-800 rounded-2xl p-4"
          >
            <Text className="text-white text-center font-bold text-lg">
              ホームに戻る
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
