import type { ChangeEvent } from "react";

interface VolumeControlProps {
  volume: number; // 0–100
  onChangeVolume: (value: number) => void;
}

const getVolumeLabel = (v: number): string => {
  if (v === 0) return "Mute";
  if (v <= 30) return "Low";
  if (v <= 70) return "Medium";
  return "High";
};

export const VolumeControl = ({
  volume,
  onChangeVolume,
}: VolumeControlProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    if (Number.isNaN(v)) return;
    onChangeVolume(Math.max(0, Math.min(100, v)));
  };

  const levelLabel = getVolumeLabel(volume);

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <span className="text-[11px] uppercase tracking-[0.18em] text-zinc-400">
        Volume
      </span>

      <span className="text-[11px] text-zinc-300">
        {volume}% · <span className="text-lime-300">{levelLabel}</span>
      </span>

      <div className="h-32 flex items-center justify-center">
        {/* Horizontal range rotated to become vertical */}
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={handleChange}
          className="
            w-32
            accent-lime-400
            -rotate-90
            origin-center
            cursor-pointer
          "
          aria-label="Volume"
        />
      </div>
    </div>
  );
};
