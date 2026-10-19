'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Lecture, Slide } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SidebarClose,
  SidebarOpen,
} from 'lucide-react';

interface VideoPlayerProps {
  lecture: Lecture;
  currentSlide: Slide;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onPlayPauseToggle: () => void;
  onReset: () => void;
  isPptVisible: boolean;
  onTogglePpt: () => void;
}

export function VideoPlayer({
  lecture,
  currentSlide,
  currentTime,
  duration,
  isPlaying,
  onTimeUpdate,
  onPlayPauseToggle,
  onReset,
  isPptVisible,
  onTogglePpt,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [volume, setVolume] = useState<number>(0.9);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch((err) => {
        console.warn('Playback intercepted by browser autoplay policy:', err);
      });
    } else {
      video.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (Math.abs(video.currentTime - currentTime) > 0.5) {
      video.currentTime = currentTime;
    }
  }, [currentTime]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
      videoRef.current.volume = isMuted ? 0 : volume;
    }
  }, [playbackSpeed, volume, isMuted]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      onTimeUpdate(videoRef.current.currentTime);
    }
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    onTimeUpdate(targetTime);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col bg-card border border-black/[0.08] dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-xl transition-all duration-300"
    >
      {/* Video Window Header Bar */}
      <div className="bg-zinc-50 dark:bg-zinc-950/60 border-b border-black/[0.06] dark:border-white/[0.06] px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 truncate">
          <span className="size-2 rounded-full bg-zinc-400" />
          <span className="font-medium text-zinc-900 dark:text-zinc-200 truncate">{lecture.title}</span>
          <span className="text-zinc-400 dark:text-zinc-600 hidden sm:inline">•</span>
          <span className="text-zinc-500 dark:text-zinc-400 hidden sm:inline">{lecture.speaker}</span>
        </div>

        {/* Quick Presentation Toggle in Video Card */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onTogglePpt}
          className="h-7 px-2.5 text-[11px] text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800"
          title="Show or hide presentation slides"
        >
          {isPptVisible ? <SidebarClose className="size-3 mr-1" /> : <SidebarOpen className="size-3 mr-1" />}
          <span>{isPptVisible ? 'Hide Slides' : 'Show Slides'}</span>
        </Button>
      </div>

      {/* Video Viewport */}
      <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden group">
        <video
          ref={videoRef}
          src={lecture.videoUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => onPlayPauseToggle()}
          onError={() => setHasError(true)}
          playsInline
          className="w-full h-full object-contain"
        />

        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 p-6 text-center">
            <h3 className="text-sm font-semibold text-zinc-200">Video Playback Simulated</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm">
              Playing audio synchronized timeline for {lecture.title}.
            </p>
          </div>
        )}

        {/* Floating Active Slide Pill Overlay */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <div className="bg-zinc-950/80 backdrop-blur-xl border border-white/10 px-2.5 py-1 rounded-lg flex items-center gap-2 shadow-lg">
            <Badge variant="secondary" className="text-[10px] font-mono font-medium bg-white/10 text-white border-0">
              Slide {currentSlide.slideNumber}
            </Badge>
            <span className="text-[11px] font-medium text-zinc-200 max-w-[200px] truncate">
              {currentSlide.title}
            </span>
          </div>
        </div>

        {/* Center Play Overlay on Hover/Paused */}
        {!isPlaying && (
          <button
            onClick={onPlayPauseToggle}
            className="absolute inset-0 m-auto size-14 rounded-full bg-white/90 hover:bg-white text-zinc-950 flex items-center justify-center shadow-2xl transition-transform hover:scale-105 active:scale-95"
            aria-label="Play video"
          >
            <Play className="size-6 fill-current ml-0.5" />
          </button>
        )}
      </div>

      {/* Media Controls Bar */}
      <div className="p-3 bg-zinc-50 dark:bg-zinc-950/80 border-t border-black/[0.06] dark:border-white/[0.06] flex flex-col gap-2">
        {/* Scrubber with Chapter & Slide Markers */}
        <div className="relative flex items-center group/scrub">
          <label htmlFor="video-scrubber" className="sr-only">Seek Video Position</label>
          <input
            id="video-scrubber"
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleScrubberChange}
            aria-label="Seek Video Position"
            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-white focus:outline-none transition-all group-hover/scrub:h-2"
          />

          {/* Slide timeline tick marks */}
          <div className="absolute inset-x-0 pointer-events-none top-0 h-1.5 flex">
            {lecture.slides.map((s) => {
              const leftPercent = duration > 0 ? (s.startTime / duration) * 100 : 0;
              return (
                <div
                  key={s.id}
                  style={{ left: `${leftPercent}%` }}
                  className="absolute top-0 w-0.5 h-full bg-zinc-500/40 dark:bg-white/40"
                  title={`Slide ${s.slideNumber}: ${s.title}`}
                />
              );
            })}
          </div>
        </div>

        {/* Lower Row Controls */}
        <div className="flex items-center justify-between text-xs">
          {/* Left Controls: Play/Pause, Rewind, Time */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onPlayPauseToggle}
              className="size-8 p-0 text-zinc-700 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 fill-current ml-0.5" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="size-8 p-0 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800"
              title="Restart from beginning"
            >
              <RotateCcw className="size-3.5" />
            </Button>

            <div className="font-mono text-xs text-zinc-700 dark:text-zinc-300 ml-1">
              <span className="text-zinc-900 dark:text-zinc-100 font-medium">{formatTime(currentTime)}</span>
              <span className="text-zinc-400 dark:text-zinc-600 mx-1">/</span>
              <span className="text-zinc-500">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Controls: Speed, Volume, Fullscreen */}
          <div className="flex items-center gap-2 sm:gap-3">
            <label htmlFor="playback-speed-select" className="sr-only">Playback Speed</label>
            <select
              id="playback-speed-select"
              aria-label="Playback Speed"
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
              className="bg-zinc-200/60 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-300 font-mono text-[11px] px-2 py-1 rounded-md border border-black/10 dark:border-white/10 focus:outline-none cursor-pointer"
            >
              <option value={0.75}>0.75x</option>
              <option value={1.0}>1.0x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
              <option value={2.0}>2.0x</option>
            </select>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
              className="size-8 p-0 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="size-4 text-zinc-500 dark:text-zinc-400" /> : <Volume2 className="size-4" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="size-8 p-0 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
