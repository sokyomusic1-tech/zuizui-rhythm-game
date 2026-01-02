export interface SongData {
  id: string;
  title: string;
  bpm: number;
  coverImage: any;
  audioFile: any;
}

export const songs: SongData[] = [
  {
    id: "zuizui_rock",
    title: "ズイズイソング 和風ロック",
    bpm: 82,
    coverImage: require("@/assets/images/icon.png"),
    audioFile: require("@/assets/audio/zuizui_song.mp3"),
  },
  {
    id: "zuizui_anime",
    title: "ズイズイソング2025 アニメソング風",
    bpm: 76,
    coverImage: require("@/assets/images/songs/zuizui_anime.jpg"),
    audioFile: require("@/assets/audio/zuizui_anime.mp3"),
  },
];
