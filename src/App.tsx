import { useEffect, useRef, useState } from "react";
import type {
  Album,
  Track,
  LibrarySection,
  PlayerMetadata,
  PlayerState,
} from "./types";
import { AppLayout } from "./components/layout/AppLayout";
import { AlbumTrackList } from "./components/library/AlbumTrackList";

const PLAYER_STORAGE_KEY = "sonic-kiosk-player-v1";

const App = () => {
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

  // guard so auto-next fires only once per finished track
  const autoAdvancedForTrackId = useRef<number | null>(null);

  // Restore player state from localStorage (if any)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PLAYER_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as {
        playerMetadata?: PlayerMetadata | null;
        playerState?: PlayerState;
        currentTrackId?: number | null;
      };

      if (parsed.playerMetadata) {
        setPlayerMetadata(parsed.playerMetadata);
      }

      if (parsed.playerState) {
        setPlayerState((prev) => ({
          ...prev,
          ...parsed.playerState,
        }));
      }

      if (typeof parsed.currentTrackId === "number") {
        setCurrentTrackId(parsed.currentTrackId);
      }
    } catch (err) {
      console.error("Failed to restore player state from storage:", err);
    }
  }, []);

  // ------------------------------------------------------
  // Initial load: fetch albums
  // ------------------------------------------------------
  useEffect(() => {
    const loadAlbums = async () => {
      try {
        const res = await fetch("/albums", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to load albums");
        const data: Album[] = await res.json();
        setAlbums(data);

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
      id: -1,
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

      // reset auto-next guard for new track
      autoAdvancedForTrackId.current = null;

      setPlayerMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album,
        coverUrl: `/track-cover/${track.id}`,
      });

      const trackDuration =
        (track as any).durationSeconds ?? (track as any).duration ?? 0;

      setPlayerState((prev) => ({
        ...prev,
        isPlaying: true,
        currentTime: 0,
        duration: trackDuration,
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
    // Clamp to [0, duration]
    setPlayerState((prev) => {
      const duration = prev.duration || 0;
      const clamped = Math.max(0, Math.min(seconds, duration));
      return {
        ...prev,
        currentTime: clamped,
      };
    });

    // Tell mpv to move playback position
    void fetch(`/seek/${seconds}`).catch((err) => {
      console.error("Error seeking:", err);
    });
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
      // setPlayerMetadata(null); // optional
    } catch (err) {
      console.error("Error stopping playback:", err);
    }
  };

  // ------------------------------------------------------
  // Progress timer: tick every second while playing
  // ------------------------------------------------------
  useEffect(() => {
    if (!playerState.isPlaying || !playerState.duration) {
      return;
    }

    const timerId = window.setInterval(() => {
      setPlayerState((prev) => {
        if (!prev.isPlaying || !prev.duration) return prev;

        const nextTime = prev.currentTime + 1;
        if (nextTime >= prev.duration) {
          // clamp to duration; auto-next effect will handle transition
          return { ...prev, currentTime: prev.duration };
        }
        return { ...prev, currentTime: nextTime };
      });
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [playerState.isPlaying, playerState.duration]);

  // ------------------------------------------------------
  // Auto-advance when current track ends
  // ------------------------------------------------------
  useEffect(() => {
    if (
      !playerState.isPlaying ||
      !playerState.duration ||
      currentTrackId == null
    ) {
      return;
    }

    if (playerState.currentTime < playerState.duration) {
      return;
    }

    // already auto-advanced this track
    if (autoAdvancedForTrackId.current === currentTrackId) {
      return;
    }
    autoAdvancedForTrackId.current = currentTrackId;

    const idx = tracks.findIndex((t) => t.id === currentTrackId);
    if (idx < 0 || idx >= tracks.length - 1) {
      // last track -> stop
      setPlayerState((prev) => ({
        ...prev,
        isPlaying: false,
      }));
      return;
    }

    const nextTrack = tracks[idx + 1];
    void playTrack(nextTrack);
  }, [
    playerState.currentTime,
    playerState.duration,
    playerState.isPlaying,
    currentTrackId,
    tracks,
  ]);

  // Persist player state to localStorage whenever it changes
  useEffect(() => {
    try {
      const payload = JSON.stringify({
        playerMetadata,
        playerState,
        currentTrackId,
      });
      localStorage.setItem(PLAYER_STORAGE_KEY, payload);
    } catch (err) {
      console.error("Failed to save player state to storage:", err);
    }
  }, [playerMetadata, playerState, currentTrackId]);

  // ------------------------------------------------------
  // Render content for active section (main pane)
  // ------------------------------------------------------
  const renderAlbumsSection = () => {
    // Only tracks in main panel; albums moved into sidebar
    return (
      <div className="h-full">
        <AlbumTrackList
          album={selectedAlbum}
          tracks={tracks}
          currentTrackId={currentTrackId}
          onSelectTrack={(track) => {
            void playTrack(track);
          }}
        />
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
      onStop={stopPlayback}
      onSeek={handleSeek}
      onChangeVolume={handleChangeVolume}
      albums={albums}
      selectedAlbum={selectedAlbum}
      onSelectAlbum={handleSelectAlbum}
    >
      {renderContent()}
    </AppLayout>
  );
};

export default App;
