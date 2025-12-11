// src/components/player/VolumeControl.tsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeOff, faVolumeLow, faVolumeHigh } from "@fortawesome/free-solid-svg-icons";

interface VolumeControlProps {
  volume: number; // 0-100
  onChangeVolume: (value: number) => void;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  onChangeVolume,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    onChangeVolume(Math.min(100, Math.max(0, value)));
  };

  const icon =
    volume === 0 ? faVolumeOff : volume < 50 ? faVolumeLow : faVolumeHigh;

  return (
    <div
      className="
        flex flex-col items-center justify-center
        gap-2
        md:px-4
        text-xs md:text-[11px]
      "
      aria-label="Volume control"
    >
      <span className="text-zinc-400 hidden md:inline-block mb-1">
        Volume
      </span>
      <FontAwesomeIcon icon={icon} className="text-zinc-200 mb-1" />

      {/* Vertical on md+ screens */}
      <div className="hidden md:flex flex-col items-center h-28">
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={handleChange}
          className="
            accent-lime-400
            h-24
            [writing-mode:bt-lr]
            origin-center
            rotate-180
          "
        />
      </div>

      {/* Horizontal on mobile */}
      <div className="md:hidden w-24">
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={handleChange}
          className="accent-lime-400 w-full"
        />
      </div>
    </div>
  );
};
