import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useGame } from "@/lib/game-context";
import { useEffect } from "react";

/**
 * Home Screen - NativeWind Example
 *
 * This template uses NativeWind (Tailwind CSS for React Native).
 * You can use familiar Tailwind classes directly in className props.
 *
 * Key patterns:
 * - Use `className` instead of `style` for most styling
 * - Theme colors: use tokens directly (bg-background, text-foreground, bg-primary, etc.); no dark: prefix needed
 * - Responsive: standard Tailwind breakpoints work on web
 * - Custom colors defined in tailwind.config.js
 */
export default function HomeScreen() {
  const router = useRouter();
  const { highScores, loadHighScores } = useGame();

  useEffect(() => {
    loadHighScores();
  }, []);

  return (
    <ScreenContainer className="bg-black p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center gap-8">
          {/* タイトル */}
          <View className="items-center gap-4">
            <Text className="text-5xl font-bold text-white">ZUIZUI</Text>
            <Text className="text-xl text-white">RHYTHM GAME</Text>
            <View className="w-20 h-1 bg-primary rounded-full" />
          </View>

          {/* ハイスコア */}
          <View className="bg-surface rounded-2xl p-6 w-full max-w-sm self-center">
            <Text className="text-white text-lg font-bold mb-4 text-center">ハイスコア</Text>
            <View className="gap-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-green-400 font-semibold">EASY</Text>
                <Text className="text-white text-xl font-bold">{highScores.easy}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-blue-400 font-semibold">NORMAL</Text>
                <Text className="text-white text-xl font-bold">{highScores.normal}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-red-400 font-semibold">HARD</Text>
                <Text className="text-white text-xl font-bold">{highScores.hard}</Text>
              </View>
            </View>
          </View>

          {/* プレイボタン */}
          <View className="items-center">
            <TouchableOpacity
              onPress={() => router.push("/difficulty")}
              className="bg-primary px-12 py-5 rounded-full active:opacity-80"
            >
              <Text className="text-white font-bold text-2xl">PLAY</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
