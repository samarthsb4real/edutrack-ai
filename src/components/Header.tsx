'use client';

import React, { useState, useEffect } from 'react';
import { Lecture } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  ChevronDown,
  SidebarClose,
  SidebarOpen,
  Sun,
  Moon,
} from 'lucide-react';

interface HeaderProps {
  lectures: Lecture[];
  currentLecture: Lecture;
  onSelectLecture: (lecture: Lecture) => void;
  onOpenUpload: () => void;
  isPptVisible: boolean;
  onTogglePpt: () => void;
}

export function Header({
  lectures,
  currentLecture,
  onSelectLecture,
  onOpenUpload,
  isPptVisible,
  onTogglePpt,
}: HeaderProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('edutrack_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('edutrack_theme', 'light');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/75 backdrop-blur-2xl border-b border-black/[0.08] dark:border-white/[0.08] px-4 py-3 sm:px-6 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Studio Window Controls & Title */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            {/* App Brand Mark & Title */}
            <div className="flex items-center gap-2.5">
              <div className="size-7 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center font-semibold text-xs shadow-sm">
                E
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    EduTrack
                  </h1>
                  <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 border-black/10 dark:border-white/15 text-zinc-600 dark:text-zinc-400">
                    Studio 2.4
                  </Badge>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal hidden sm:block">
                  Multimodal Lecture Perception & Presentation Engine
                </p>
              </div>
            </div>

          {/* Quick PPT Toggle for mobile */}
          <Button
            variant="outline"
            size="sm"
            onClick={onTogglePpt}
            className="sm:hidden text-xs h-8 border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900/80 text-zinc-800 dark:text-zinc-300"
          >
            {isPptVisible ? <SidebarClose className="size-3.5 mr-1" /> : <SidebarOpen className="size-3.5 mr-1" />}
            <span>{isPptVisible ? 'Hide Slides' : 'Show Slides'}</span>
          </Button>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Lecture Switcher Menu */}
          <div className="relative flex-1 sm:flex-none">
            <label htmlFor="lecture-select" className="sr-only">
              Select Lecture
            </label>
            <select
              id="lecture-select"
              aria-label="Select Lecture"
              value={currentLecture.id}
              onChange={(e) => {
                const found = lectures.find((l) => l.id === e.target.value);
                if (found) onSelectLecture(found);
              }}
              className="w-full sm:w-72 bg-zinc-100 dark:bg-zinc-900/90 hover:bg-zinc-200/70 dark:hover:bg-zinc-850 text-zinc-900 dark:text-zinc-200 text-xs font-medium rounded-lg border border-black/10 dark:border-white/10 px-3 py-1.5 pr-8 focus:outline-none focus:ring-1 focus:ring-black/20 dark:focus:ring-white/20 appearance-none cursor-pointer transition-colors shadow-sm"
            >
              {lectures.map((lec) => (
                <option key={lec.id} value={lec.id} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 py-1">
                  {lec.title}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500 dark:text-zinc-400" />
          </div>

          {/* PPT Visibility Toggle Button (Desktop) */}
          <Button
            variant="outline"
            size="sm"
            onClick={onTogglePpt}
            className={`hidden sm:flex items-center gap-1.5 text-xs h-8 font-medium transition-colors shadow-sm ${
              isPptVisible
                ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-black/10 dark:border-white/15'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-black/10 dark:border-white/10 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
            title="Toggle presentation panel"
          >
            {isPptVisible ? <SidebarClose className="size-3.5" /> : <SidebarOpen className="size-3.5" />}
            <span>{isPptVisible ? 'Hide Slides' : 'Show Slides'}</span>
          </Button>

          {/* Theme Toggle Button (Light / Dark) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="size-8 p-0 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>

          {/* Upload Lecture Video Button */}
          <Button
            size="sm"
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 text-xs h-8 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-950 font-medium shadow-sm transition-all active:scale-[0.98]"
          >
            <Upload className="size-3.5" />
            <span>Upload Video</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
