// src/App.tsx
import React, { useEffect, useState } from "react";
import type {
  Album,
  Track,
  LibrarySection,
  PlayerMetadata,
  PlayerState,
} from "./types";
import { AppLayout } from "./components/layout/AppLayout";
import { AlbumTrackList } from "./components/library/AlbumTrackList";
import { AlbumList } from "./components/library/AlbumList";

const App: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackId, setCurrentTrackId] = useState<number | null>(null);

  const [activeSection, setActiveSection] = useState<LibrarySection>("albums");

  const [playerMetadata, setPlayerMetadata] = useState<PlayerMetadata | null>(
    null
  );

  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 80,
  });

  // ------------------------------------------------------
  // Initial load: fetch albums
  // ------------------------------------------------------
  useEffect(() => {
    const loadAlbums = async () => {
      try {
        const res = await fetch("/albums");
        if (!res.ok) throw new Error("Failed to load albums");
        const data: Album[] = await res.json();
        setAlbums(data);

        // Optionally auto-select the first album
        if (data.length > 0) {
          void handleSelectAlbum(data[0]);
        }
      } catch (err) {
        console.error("Error loading albums:", err);
      }
    };

    loadAlbums();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------------------------------------------------
  // Helpers
  // ------------------------------------------------------
  const findAlbumByName = (name: string): Album | null => {
    const a = albums.find((al) => al.album === name);
    return a ?? null;
  };

  // ------------------------------------------------------
  // Album selection
  // ------------------------------------------------------
  const handleSelectAlbumByName = async (albumName: string) => {
    const album = findAlbumByName(albumName) ?? {
      album: albumName,
      artist: "",
      trackCount: 0,
    };

    setSelectedAlbum(album);
    setActiveSection("albums");

    try {
      const res = await fetch(`/album/${encodeURIComponent(albumName)}`);
      if (!res.ok) throw new Error("Failed to load album tracks");
      const data: Track[] = await res.json();
      setTracks(data);
    } catch (err) {
      console.error("Error loading album tracks:", err);
      setTracks([]);
    }
  };

  const handleSelectAlbum = async (album: Album) => {
    await handleSelectAlbumByName(album.album);
  };

  // ------------------------------------------------------
  // Playback controls
  // ------------------------------------------------------
  const playTrack = async (track: Track) => {
    try {
      await fetch(`/play/${track.id}`);
      setCurrentTrackId(track.id);

      setPlayerMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album,
        coverUrl: track.coverUrl,
      });

      setPlayerState((prev) => ({
        ...prev,
        isPlaying: true,
        currentTime: 0,
        duration: track.durationSeconds ?? prev.duration,
      }));
    } catch (err) {
      console.error("Error starting playback:", err);
    }
  };

  const handlePlayPause = async () => {
    try {
      await fetch("/pause");
      setPlayerState((prev) => ({
        ...prev,
        isPlaying: !prev.isPlaying,
      }));
    } catch (err) {
      console.error("Error toggling pause:", err);
    }
  };

  const handleNext = async () => {
    if (!tracks.length || currentTrackId == null) return;

    const idx = tracks.findIndex((t) => t.id === currentTrackId);
    if (idx < 0 || idx >= tracks.length - 1) return;

    const nextTrack = tracks[idx + 1];
    await playTrack(nextTrack);
  };

  const handlePrevious = async () => {
    if (!tracks.length || currentTrackId == null) return;

    const idx = tracks.findIndex((t) => t.id === currentTrackId);
    if (idx <= 0) return;

    const prevTrack = tracks[idx - 1];
    await playTrack(prevTrack);
  };

  const handleSeek = (seconds: number) => {
    // No backend seek yet; this just updates the UI.
    setPlayerState((prev) => ({
      ...prev,
      currentTime: Math.max(0, Math.min(seconds, prev.duration || seconds)),
    }));
    // When you add a /seek endpoint, call it here.
  };

  const handleChangeVolume = async (volume: number) => {
    setPlayerState((prev) => ({
      ...prev,
      volume,
    }));

    try {
      await fetch(`/volume/${volume}`);
    } catch (err) {
      console.error("Error setting volume:", err);
    }
  };

  const stopPlayback = async () => {
    try {
      await fetch("/stop");
      setPlayerState((prev) => ({
        ...prev,
        isPlaying: false,
        currentTime: 0,
      }));
      setCurrentTrackId(null);
      // If you want to clear metadata completely on stop, uncomment:
      // setPlayerMetadata(null);
    } catch (err) {
      console.error("Error stopping playback:", err);
    }
  };

  // ------------------------------------------------------
  // Render content for active section
  // ------------------------------------------------------
  const renderAlbumsSection = () => {
    return (
      <div className="flex flex-col md:flex-row gap-4 h-full">
        {/* Left: album list */}
        <div className="md:w-72 flex-shrink-0">
          <AlbumList
            albums={albums}
            selectedAlbum={selectedAlbum}
            onSelectAlbum={handleSelectAlbum}
          />
        </div>

        {/* Right: selected album tracks */}
        <div className="flex-1 min-w-0">
          <AlbumTrackList
            album={selectedAlbum}
            tracks={tracks}
            currentTrackId={currentTrackId}
            onSelectTrack={(track) => {
              void playTrack(track);
            }}
          />
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (activeSection === "albums") {
      return renderAlbumsSection();
    }

    if (activeSection === "home") {
      return (
        <div className="text-zinc-400 text-sm">
          Home screen coming soon. Use the sidebar to switch to{" "}
          <span className="text-lime-300 font-semibold">Albums</span>.
        </div>
      );
    }

    if (activeSection === "artists") {
      return (
        <div className="text-zinc-400 text-sm">
          Artists view not implemented yet. We’ll hook this into the library
          later.
        </div>
      );
    }

    if (activeSection === "tracks") {
      return (
        <div className="text-zinc-400 text-sm">
          Global track list coming soon. For now, browse via{" "}
          <span className="text-lime-300 font-semibold">Albums</span>.
        </div>
      );
    }

    return null;
  };

  return (
    <AppLayout
      activeSection={activeSection}
      onChangeSection={setActiveSection}
      playerMetadata={playerMetadata}
      playerState={playerState}
      onPlayPause={handlePlayPause}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onSeek={handleSeek}
      onChangeVolume={handleChangeVolume}
    >
      {renderContent()}
    </AppLayout>
  );
};

export default App;
