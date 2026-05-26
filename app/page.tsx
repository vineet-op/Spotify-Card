import { SpotifyPlayer } from "./components/spotify-player";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-white font-sans text-black overflow-hidden">
      <SpotifyPlayer />
    </div>
  );
}
