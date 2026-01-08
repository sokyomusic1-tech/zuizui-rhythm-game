import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { useRouter } from "expo-router";

export default function RequestScreen() {
  const router = useRouter();

  const handleChannelPress = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>楽曲リクエスト投票</Text>
          <Text style={styles.subtitle}>
            プレイしたい楽曲をYouTubeチャンネルでリクエストしてください
          </Text>
        </View>

        <View style={styles.channelsContainer}>
          {/* PSYCHOMMUNITY2024 */}
          <TouchableOpacity
            style={styles.channelCard}
            onPress={() => handleChannelPress("https://www.youtube.com/@PSYCHOMMUNITY2024")}
          >
            <View style={styles.channelHeader}>
              <View style={styles.youtubeIcon}>
                <Text style={styles.playIcon}>▶</Text>
              </View>
              <View style={styles.channelInfo}>
                <Text style={styles.channelName}>PSYCHOMMUNITY2024</Text>
                <Text style={styles.channelLabel}>YouTubeチャンネル</Text>
              </View>
            </View>
            <Text style={styles.channelDescription}>
              コミュニティタブでリクエストを受け付けています
            </Text>
            <View style={styles.channelIdContainer}>
              <Text style={styles.channelId}>@PSYCHOMMUNITY2024</Text>
            </View>
          </TouchableOpacity>

          {/* おっかんの曲 */}
          <TouchableOpacity
            style={styles.channelCard}
            onPress={() => handleChannelPress("https://www.youtube.com/channel/UCnYZSxNGV65Ba3pA2S_WEIQ")}
          >
            <View style={styles.channelHeader}>
              <View style={styles.youtubeIcon}>
                <Text style={styles.playIcon}>▶</Text>
              </View>
              <View style={styles.channelInfo}>
                <Text style={styles.channelName}>おっかんの曲</Text>
                <Text style={styles.channelLabel}>YouTubeチャンネル</Text>
              </View>
            </View>
            <Text style={styles.channelDescription}>
              コミュニティタブでリクエストを受け付けています
            </Text>
            <View style={styles.channelIdContainer}>
              <Text style={styles.channelId}>UCnYZSxNGV65Ba3pA2S_WEIQ</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* リクエスト方法 */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>リクエスト方法</Text>
          <View style={styles.instructionsList}>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>1.</Text>
              <Text style={styles.instructionText}>
                上記のYouTubeチャンネルにアクセス
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>2.</Text>
              <Text style={styles.instructionText}>
                コミュニティタブを開く
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>3.</Text>
              <Text style={styles.instructionText}>
                投票またはコメントでリクエスト
              </Text>
            </View>
          </View>
        </View>

        {/* 戻るボタン */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>戻る</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    color: "#ffffff",
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: "#9CA3AF",
    fontSize: 18,
  },
  channelsContainer: {
    gap: 16,
  },
  channelCard: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: "#374151",
  },
  channelHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  youtubeIcon: {
    width: 48,
    height: 48,
    backgroundColor: "#DC2626",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  playIcon: {
    color: "#ffffff",
    fontSize: 24,
  },
  channelInfo: {
    flex: 1,
  },
  channelName: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
  channelLabel: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  channelDescription: {
    color: "#D1D5DB",
    fontSize: 16,
    marginBottom: 12,
  },
  channelIdContainer: {
    backgroundColor: "rgba(216, 67, 21, 0.2)",
    borderRadius: 8,
    padding: 12,
  },
  channelId: {
    color: "#D84315",
    fontSize: 14,
    fontFamily: "monospace",
  },
  instructionsCard: {
    marginTop: 32,
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: "#374151",
  },
  instructionsTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  instructionsList: {
    gap: 12,
  },
  instructionItem: {
    flexDirection: "row",
  },
  instructionNumber: {
    color: "#D84315",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 12,
  },
  instructionText: {
    color: "#D1D5DB",
    fontSize: 16,
    flex: 1,
  },
  backButton: {
    marginTop: 32,
    backgroundColor: "#374151",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
});
