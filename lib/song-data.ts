export interface SongData {
  id: string;
  title: string;
  bpm: number;
  duration: number; // 秒単位
  durationDisplay: string; // 表示用（例: "3:27"）
  coverImage: string | any; // URLまたはrequire()
  audioFile: any;
}

export const songs: SongData[] = [
  {
    id: "zuizui_rock",
    title: "ズイズイソング 和風ロック",
    bpm: 82,
    duration: 207, // 3分27秒
    durationDisplay: "3:27",
    coverImage: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663153379247/TxPbLVQBPuXQYZMH.jpg",
    audioFile: require("@/assets/audio/zuizui_song.mp3"),
  },
  {
    id: "zuizui_anime",
    title: "ズイズイソング2025 アニメソング風",
    bpm: 76,
    duration: 229, // 3分49秒
    durationDisplay: "3:49",
    coverImage: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663153379247/JgoFIxUcZwkRVBdo.jpg",
    audioFile: require("@/assets/audio/zuizui_anime.mp3"),
  },
  {
    id: "moechakka_fire",
    title: "モエチャッカファイア (Cover) Metal x EDM",
    bpm: 81.6,
    duration: 233, // 3分53秒
    durationDisplay: "3:53",
    coverImage: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663153379247/KGYPiUjtNkQhjWmP.jpg",
    audioFile: require("@/assets/audio/moechakka_fire.mp3"),
  },
];
