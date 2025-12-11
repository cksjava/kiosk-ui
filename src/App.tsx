import { useEffect, useState } from "react";

interface Track {
  id: number;
  title: string;
  artist: string;
  album: string;
}

export default function App() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [current, setCurrent] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(80);

  // Fetch library
  useEffect(() => {
    fetch("/tracks")
      .then(r => r.json())
      .then(setTracks)
      .catch(console.error);
  }, []);

  async function play(id: number) {
    await fetch(`/play/${id}`);
    setCurrent(id);
    setPlaying(true);
  }
  async function togglePause() {
    await fetch(`/pause`);
    setPlaying(p => !p);
  }
  async function stop() {
    await fetch(`/stop`);
    setCurrent(null);
    setPlaying(false);
  }
  async function setVol(v: number) {
    setVolume(v);
    await fetch(`/volume/${v}`);
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-neutral-900 to-neutral-800">
      {/* Header */}
      <header className="p-4 text-center text-2xl font-bold tracking-wide text-white/90">
        🎵 Raspberry Pi Audio Kiosk
      </header>

      {/* Library */}
      <div className="flex-1 overflow-y-auto px-6 pb-20 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {tracks.map(t => (
          <div
            key={t.id}
            className={`p-4 rounded-2xl backdrop-blur bg-white/5 border border-white/10 
              hover:bg-white/10 transition cursor-pointer ${
                t.id === current ? "ring-2 ring-lime-400" : ""
              }`}
            onClick={() => play(t.id)}
          >
            <img
              src={`/cover/${t.id}`}
              onError={e => ((e.currentTarget.src = "/placeholder.png"))}
              className="w-full aspect-square object-cover rounded-xl mb-3 shadow-md"
            />
            <div className="font-semibold truncate">{t.title}</div>
            <div className="text-sm text-white/60 truncate">{t.artist}</div>
            <div className="text-xs text-white/40 truncate">{t.album}</div>
          </div>
        ))}
      </div>

      {/* Floating Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-lg p-4 flex items-center justify-between">
        <div className="flex gap-3 items-center">
          <button
            onClick={togglePause}
            className="p-3 rounded-full bg-lime-500 text-black font-bold text-lg transition hover:bg-lime-400"
          >
            {playing ? "⏸" : "▶"}
          </button>
          <button
            onClick={stop}
            className="p-3 rounded-full bg-red-600 text-white font-bold text-lg transition hover:bg-red-500"
          >
            ⏹
          </button>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={e => setVol(Number(e.target.value))}
          className="w-1/3 accent-lime-400"
        />
      </div>
    </div>
  );
}
