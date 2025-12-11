import { useEffect, useState } from "react";

interface Album {
  album: string;
  artist: string;
  trackCount: number;
}

interface Track {
  id: number;
  title: string;
  artist: string;
  album: string;
}

export default function App() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [current, setCurrent] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(80);

  // Load all albums initially
  useEffect(() => {
    fetch("/albums")
      .then(r => r.json())
      .then(setAlbums)
      .catch(console.error);
  }, []);

  async function openAlbum(name: string) {
    setSelectedAlbum(name);
    const data = await fetch(`/album/${encodeURIComponent(name)}`).then(r => r.json());
    setTracks(data);
  }

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

  function goBack() {
    setSelectedAlbum(null);
    setTracks([]);
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-neutral-900 to-neutral-800 text-white">
      {/* Header */}
      <header className="p-4 text-center text-2xl font-bold tracking-wide">
        🎵 Raspberry Pi Audio Kiosk
      </header>

      {/* Albums view */}
      {!selectedAlbum && (
        <div className="flex-1 overflow-y-auto px-6 pb-24">
          <h2 className="text-lg font-semibold mb-3 text-white/70">Albums</h2>
          <ul className="space-y-2">
            {albums.map(a => (
              <li
                key={a.album}
                onClick={() => openAlbum(a.album)}
                className="flex justify-between items-center bg-white/5 hover:bg-white/10 transition rounded-xl px-4 py-3 cursor-pointer"
              >
                <div>
                  <div className="font-semibold">{a.album}</div>
                  <div className="text-sm text-white/60">{a.artist}</div>
                </div>
                <div className="text-white/40 text-sm">
                  {a.trackCount} track{a.trackCount !== 1 ? "s" : ""}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tracks view */}
      {selectedAlbum && (
        <div className="flex-1 overflow-y-auto px-6 pb-24">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-white/70">
              {selectedAlbum}
            </h2>
            <button
              onClick={goBack}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white/60"
            >
              ⟵ Back
            </button>
          </div>
          <ul className="space-y-2">
            {tracks.map(t => (
              <li
                key={t.id}
                onClick={() => play(t.id)}
                className={`flex justify-between items-center bg-white/5 hover:bg-white/10 transition rounded-xl px-4 py-3 cursor-pointer ${
                  t.id === current ? "ring-2 ring-lime-400" : ""
                }`}
              >
                <div>
                  <div className="font-semibold truncate">{t.title}</div>
                  <div className="text-sm text-white/60">{t.artist}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Floating controls */}
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
