'use client';

import React, { useState, useMemo } from 'react';
import { Lecture, Slide } from '@/lib/types';
import { SAMPLE_LECTURES, regenerateLectureSlides } from '@/data/sampleLectures';
import { Header } from '@/components/Header';
import { VideoPlayer } from '@/components/VideoPlayer';
import { PresentationPanel } from '@/components/PresentationPanel';
import { UploadModal } from '@/components/UploadModal';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Clock,
  Calculator,
  GitBranch,
  Lightbulb,
  ArrowUpRight,
} from 'lucide-react';

export default function HomePage() {
  const [lectures, setLectures] = useState<Lecture[]>(SAMPLE_LECTURES);
  const [currentLecture, setCurrentLecture] = useState<Lecture>(SAMPLE_LECTURES[0]);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPptVisible, setIsPptVisible] = useState<boolean>(true);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);

  // Derive active slide based on current video timestamp
  const currentSlide = useMemo<Slide>(() => {
    if (!currentLecture.slides || currentLecture.slides.length === 0) {
      return {
        id: 'fallback',
        slideNumber: 1,
        title: 'Lecture In Progress',
        section: 'General',
        startTime: 0,
        endTime: 100,
        bullets: ['Lecture footage playing.'],
        speakerTakeaway: 'Follow along with the speaker.',
      };
    }

    const matched = currentLecture.slides.find(
      (s) => currentTime >= s.startTime && currentTime < s.endTime
    );

    if (matched) return matched;
    if (currentTime >= currentLecture.slides[currentLecture.slides.length - 1].endTime) {
      return currentLecture.slides[currentLecture.slides.length - 1];
    }
    return currentLecture.slides[0];
  }, [currentLecture, currentTime]);

  const handleSelectLecture = (lec: Lecture) => {
    setCurrentLecture(lec);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handleSelectSlide = (slide: Slide) => {
    setCurrentTime(slide.startTime);
  };

  const handleTogglePpt = () => {
    setIsPptVisible((prev) => !prev);
  };

  const handleRegenerate = (feedbackPrompt: string) => {
    setIsRegenerating(true);
    setTimeout(() => {
      const updated = regenerateLectureSlides(currentLecture, feedbackPrompt);
      setCurrentLecture(updated);
      setLectures((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      setIsRegenerating(false);
    }, 700);
  };

  const handleLectureCreated = (newLecture: Lecture) => {
    setLectures((prev) => [newLecture, ...prev]);
    setCurrentLecture(newLecture);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-250">
      {/* Studio Navigation Header */}
      <Header
        lectures={lectures}
        currentLecture={currentLecture}
        onSelectLecture={handleSelectLecture}
        onOpenUpload={() => setIsUploadOpen(true)}
        isPptVisible={isPptVisible}
        onTogglePpt={handleTogglePpt}
      />

      {/* Main Studio Arena */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 flex flex-col gap-6">
        {/* Split View Workspace Grid */}
        <div
          className={`grid gap-5 transition-all duration-300 ${
            isPptVisible
              ? 'grid-cols-1 lg:grid-cols-12'
              : 'grid-cols-1 max-w-5xl mx-auto w-full'
          }`}
        >
          {/* Video Player Column */}
          <div
            className={`transition-all duration-300 flex flex-col ${
              isPptVisible ? 'lg:col-span-7' : 'w-full'
            }`}
          >
            <VideoPlayer
              lecture={currentLecture}
              currentSlide={currentSlide}
              currentTime={currentTime}
              duration={currentLecture.duration}
              isPlaying={isPlaying}
              onTimeUpdate={(t) => setCurrentTime(t)}
              onPlayPauseToggle={() => setIsPlaying((p) => !p)}
              onReset={() => {
                setCurrentTime(0);
                setIsPlaying(false);
              }}
              isPptVisible={isPptVisible}
              onTogglePpt={handleTogglePpt}
            />

            {/* Lecture Status Bar */}
            <div className="mt-3 p-3 bg-card border border-black/[0.06] dark:border-white/[0.06] rounded-xl flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-zinc-400" />
                <span>
                  Topic: <strong className="text-zinc-900 dark:text-zinc-200 font-medium">{currentSlide.title}</strong>
                </span>
              </div>
              <span className="font-mono text-zinc-700 dark:text-zinc-400 text-[11px]">
                {formatTime(currentTime)} / {formatTime(currentLecture.duration)}
              </span>
            </div>
          </div>

          {/* Synchronized Presentation Column */}
          {isPptVisible && (
            <div className="lg:col-span-5 flex flex-col animate-in fade-in duration-300 min-h-[500px]">
              <PresentationPanel
                lecture={currentLecture}
                currentSlide={currentSlide}
                currentTime={currentTime}
                onSeekTime={(t) => setCurrentTime(t)}
                onSelectSlide={handleSelectSlide}
                onRegenerate={handleRegenerate}
                onTogglePpt={handleTogglePpt}
                isRegenerating={isRegenerating}
              />
            </div>
          )}
        </div>

        {/* Concept Chapter Timeline & Navigator */}
        <section className="bg-card border border-black/[0.08] dark:border-white/[0.08] rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-zinc-500 dark:text-zinc-400" />
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Lecture Chapter Index
              </h2>
              <span className="text-xs text-zinc-500 hidden sm:inline">
                Click any chapter card to seek video
              </span>
            </div>
            <div className="text-[11px] font-mono text-zinc-500">
              {currentLecture.slides.length} Synchronized Slides
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {currentLecture.slides.map((s) => {
              const isActive = s.id === currentSlide.id;
              return (
                <div
                  key={s.id}
                  onClick={() => handleSelectSlide(s)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? 'bg-zinc-200/60 dark:bg-white/[0.08] border-black/20 dark:border-white/30 shadow-sm ring-1 ring-black/10 dark:ring-white/20'
                      : 'bg-zinc-50/60 dark:bg-zinc-950/40 border-black/[0.06] dark:border-white/[0.06] hover:border-black/15 dark:hover:border-white/15 hover:bg-zinc-100/60 dark:hover:bg-zinc-900/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Badge
                        variant={isActive ? 'default' : 'secondary'}
                        className={`text-[10px] font-mono px-1.5 py-0 ${
                          isActive
                            ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-semibold'
                            : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400'
                        }`}
                      >
                        Slide {s.slideNumber}
                      </Badge>
                      <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                        <Clock className="size-2.5 text-zinc-400" />
                        {formatTime(s.startTime)}
                      </span>
                    </div>

                    <h3 className="text-xs font-medium text-zinc-900 dark:text-zinc-200 line-clamp-1 mb-1">
                      {s.title}
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {s.bullets[0]}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-black/[0.06] dark:border-white/[0.06] text-[10px] text-zinc-500">
                    {s.equation && (
                      <span className="flex items-center gap-0.5 text-zinc-600 dark:text-zinc-400">
                        <Calculator className="size-2.5" />
                        <span>Math</span>
                      </span>
                    )}
                    {s.diagram && (
                      <span className="flex items-center gap-0.5 text-zinc-600 dark:text-zinc-400">
                        <GitBranch className="size-2.5" />
                        <span>Diagram</span>
                      </span>
                    )}
                    {s.example && (
                      <span className="flex items-center gap-0.5 text-zinc-600 dark:text-zinc-400">
                        <Lightbulb className="size-2.5" />
                        <span>Example</span>
                      </span>
                    )}
                    <span className="ml-auto text-zinc-600 dark:text-zinc-400 flex items-center gap-0.5">
                      <span>Jump</span>
                      <ArrowUpRight className="size-2.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onLectureCreated={handleLectureCreated}
      />
    </div>
  );
}
