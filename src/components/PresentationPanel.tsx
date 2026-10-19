'use client';

import React, { useState } from 'react';
import { Lecture, Slide } from '@/lib/types';
import { exportLectureToPptx } from '@/lib/exportPptx';
import { MathView } from '@/components/MathView';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  RotateCw,
  Download,
  SidebarClose,
  ChevronLeft,
  ChevronRight,
  Calculator,
  GitBranch,
  Lightbulb,
  CheckCircle,
  Clock,
  Send,
  X,
  FileText,
  Presentation,
  BookOpen,
  Volume2,
} from 'lucide-react';

interface PresentationPanelProps {
  lecture: Lecture;
  currentSlide: Slide;
  currentTime: number;
  onSeekTime: (time: number) => void;
  onSelectSlide: (slide: Slide) => void;
  onRegenerate: (feedbackPrompt: string) => void;
  onTogglePpt: () => void;
  isRegenerating: boolean;
}

export function PresentationPanel({
  lecture,
  currentSlide,
  currentTime,
  onSeekTime,
  onSelectSlide,
  onRegenerate,
  onTogglePpt,
  isRegenerating,
}: PresentationPanelProps) {
  const [activeTab, setActiveTab] = useState<'slides' | 'transcript' | 'summary'>('slides');
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [feedbackPrompt, setFeedbackPrompt] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const currentIndex = lecture.slides.findIndex((s) => s.id === currentSlide.id);
  const prevSlide = currentIndex > 0 ? lecture.slides[currentIndex - 1] : null;
  const nextSlide = currentIndex < lecture.slides.length - 1 ? lecture.slides[currentIndex + 1] : null;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportLectureToPptx(lecture);
      setExportNotice('Presentation exported successfully.');
      setTimeout(() => setExportNotice(null), 4000);
    } catch (err) {
      console.error('Export error:', err);
      setExportNotice('Export complete.');
      setTimeout(() => setExportNotice(null), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  const handleApplyRegenerate = (promptToUse?: string) => {
    const text = promptToUse || feedbackPrompt;
    if (!text.trim()) return;
    onRegenerate(text);
    setIsRefining(false);
    setFeedbackPrompt('');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col bg-card border border-black/[0.08] dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-xl relative transition-all duration-300 h-full">
      {/* Studio Toolbar with Segmented Controls */}
      <div className="bg-zinc-50 dark:bg-zinc-950/60 border-b border-black/[0.06] dark:border-white/[0.06] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Segmented Control Tabs */}
        <div className="flex items-center gap-1 bg-zinc-200/70 dark:bg-white/[0.06] p-0.5 rounded-lg border border-black/[0.05] dark:border-white/[0.05]">
          <button
            onClick={() => setActiveTab('slides')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === 'slides'
                ? 'bg-white dark:bg-white/15 text-zinc-950 dark:text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200'
            }`}
          >
            <Presentation className="size-3.5" />
            <span>Slides</span>
          </button>

          <button
            onClick={() => setActiveTab('transcript')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === 'transcript'
                ? 'bg-white dark:bg-white/15 text-zinc-950 dark:text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200'
            }`}
          >
            <FileText className="size-3.5" />
            <span>Transcript</span>
            {lecture.transcript && (
              <span className="text-[10px] font-mono px-1 rounded bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-zinc-300">
                {lecture.transcript.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === 'summary'
                ? 'bg-white dark:bg-white/15 text-zinc-950 dark:text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200'
            }`}
          >
            <BookOpen className="size-3.5" />
            <span>Summary</span>
          </button>
        </div>

        {/* Action Buttons: Regenerate, Export PPT, Hide Panel */}
        <div className="flex items-center gap-1.5">
          {activeTab === 'slides' && (
            <>
              {/* Regenerate Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRefining(!isRefining)}
                disabled={isRegenerating}
                className="h-7 text-[11px] px-2.5 border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-750"
                title="Refine and regenerate slides"
              >
                <RotateCw className={`size-3 mr-1 ${isRegenerating ? 'animate-spin' : ''}`} />
                <span>Regenerate</span>
              </Button>

              {/* Export PPTX Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={isExporting}
                className="h-7 text-[11px] px-2.5 border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-750"
                title="Download PowerPoint presentation file"
              >
                <Download className="size-3 mr-1" />
                <span>{isExporting ? 'Exporting...' : 'Export PPTX'}</span>
              </Button>
            </>
          )}

          {/* Hide PPT Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onTogglePpt}
            className="size-7 p-0 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800"
            title="Hide presentation panel"
          >
            <SidebarClose className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Export Notification Banner */}
      {exportNotice && (
        <div className="bg-zinc-100 dark:bg-zinc-800 border-b border-black/10 dark:border-white/10 text-zinc-800 dark:text-zinc-200 text-xs px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="size-3.5 text-zinc-600 dark:text-zinc-300" />
            <span>{exportNotice}</span>
          </div>
          <button onClick={() => setExportNotice(null)} className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200">
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Refine / Regenerate Feedback Popover Box */}
      {isRefining && activeTab === 'slides' && (
        <div className="bg-zinc-50 dark:bg-zinc-950/90 border-b border-black/10 dark:border-white/10 p-3 text-xs animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-zinc-800 dark:text-zinc-200">
              Refine Presentation
            </span>
            <button
              onClick={() => setIsRefining(false)}
              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-0.5"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={feedbackPrompt}
              onChange={(e) => setFeedbackPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyRegenerate()}
              placeholder="Specify adjustments, e.g. add step-by-step derivations or simplify bullet points..."
              className="flex-1 bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-black/20 dark:focus:ring-white/20"
              autoFocus
            />
            <Button
              size="sm"
              onClick={() => handleApplyRegenerate()}
              disabled={!feedbackPrompt.trim() || isRegenerating}
              className="h-8 px-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white text-xs font-medium"
            >
              <Send className="size-3 mr-1" />
              <span>Apply</span>
            </Button>
          </div>

          {/* Quick Suggestions (Clean typography, zero emojis) */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
            <span className="text-[10px] text-zinc-500 font-medium">Suggestions:</span>
            {[
              'Add step-by-step math derivations',
              'Add visual flowcharts and curves',
              'Make bullet points concise',
              'Include real-world applied examples',
            ].map((tag) => (
              <button
                key={tag}
                onClick={() => handleApplyRegenerate(tag)}
                className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-200/60 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-black/5 dark:border-white/5 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB 1: PRESENTATION SLIDES VIEW */}
      {activeTab === 'slides' && (
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Slide Header Section */}
          <div className="border-b border-black/[0.08] dark:border-white/[0.08] pb-3">
            <div className="flex items-center justify-between gap-2 text-xs mb-1">
              <span className="font-medium text-zinc-500 dark:text-zinc-400 text-[11px] tracking-wide">
                {currentSlide.section}
              </span>
              <Badge variant="outline" className="font-mono text-[10px] text-zinc-600 dark:text-zinc-400 border-black/10 dark:border-white/10 bg-zinc-100/80 dark:bg-zinc-900/60 flex items-center gap-1">
                <Clock className="size-2.5 text-zinc-400" />
                {formatTime(currentSlide.startTime)} – {formatTime(currentSlide.endTime)}
              </Badge>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight leading-snug">
              {currentSlide.title}
            </h2>
          </div>

          {/* Bullet Points */}
          <div className="space-y-2">
            {currentSlide.bullets.map((point, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                <span className="size-1.5 rounded-full bg-zinc-500 dark:bg-zinc-400 mt-2 flex-shrink-0" />
                <span>{point}</span>
              </div>
            ))}
          </div>

          {/* Extracted Mathematical Equation Card */}
          {currentSlide.equation && (
            <div className="bg-zinc-50 dark:bg-zinc-950/80 border border-black/10 dark:border-white/10 rounded-xl p-3.5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="size-3.5 text-zinc-500 dark:text-zinc-400" />
                <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300 uppercase tracking-wider">
                  {currentSlide.equation.label}
                </span>
              </div>
              <div className="bg-white dark:bg-zinc-900/90 border border-black/5 dark:border-white/5 rounded-lg py-3 px-3.5 my-1.5 overflow-x-auto shadow-inner flex items-center justify-center min-h-[58px]">
                <MathView formula={currentSlide.equation.formula} />
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5 leading-normal">
                {currentSlide.equation.explanation}
              </p>
            </div>
          )}

          {/* Diagram Card: Flowchart or Graph */}
          {currentSlide.diagram && (
            <div className="bg-zinc-50 dark:bg-zinc-950/60 border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <GitBranch className="size-3.5 text-zinc-500 dark:text-zinc-400" />
                  <span className="text-[11px] font-medium text-zinc-800 dark:text-zinc-200">
                    {currentSlide.diagram.title}
                  </span>
                </div>
                <Badge variant="outline" className="text-[9px] text-zinc-500 dark:text-zinc-400 uppercase font-mono border-black/10 dark:border-white/10">
                  {currentSlide.diagram.type}
                </Badge>
              </div>

              {/* Flowchart or Comparison Representation */}
              {currentSlide.diagram.nodes && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 my-2">
                  {currentSlide.diagram.nodes.map((node, nIdx) => (
                    <div
                      key={node.id}
                      className={`p-2.5 rounded-lg border text-center relative ${
                        node.highlight
                          ? 'bg-zinc-200/70 dark:bg-white/[0.08] border-black/20 dark:border-white/20 text-zinc-900 dark:text-white shadow-sm'
                          : 'bg-white dark:bg-zinc-900/60 border-black/[0.06] dark:border-white/[0.06] text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <div className="font-medium text-xs">{node.label}</div>
                      {node.desc && <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">{node.desc}</div>}
                      {nIdx < (currentSlide.diagram?.nodes?.length || 0) - 1 && (
                        <span className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 text-xs">
                          →
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Graph Visualization */}
              {currentSlide.diagram.chartData && (
                <div className="my-2 bg-white dark:bg-zinc-950 border border-black/[0.06] dark:border-white/[0.06] rounded-lg p-3 flex flex-col items-center">
                  <svg width="220" height="90" viewBox="0 0 100 50" className="w-full max-w-[280px]">
                    <line x1="10" y1="5" x2="10" y2="45" stroke="#a1a1aa" className="dark:stroke-zinc-700" strokeWidth="1" />
                    <line x1="10" y1="45" x2="95" y2="45" stroke="#a1a1aa" className="dark:stroke-zinc-700" strokeWidth="1" />
                    {currentSlide.diagram.chartData.curves.map((curve, cIdx) => (
                      <path
                        key={cIdx}
                        d={curve.path}
                        fill="none"
                        stroke="#1d1d1f"
                        className="dark:stroke-zinc-100"
                        strokeWidth="1.5"
                      />
                    ))}
                    <circle cx="50" cy="25" r="2.5" fill="#1d1d1f" className="dark:fill-white" />
                  </svg>
                  <div className="flex justify-between w-full max-w-[280px] text-[9px] text-zinc-500 dark:text-zinc-400 font-mono mt-1">
                    <span>{currentSlide.diagram.chartData.yLabel}</span>
                    <span>{currentSlide.diagram.chartData.xLabel}</span>
                  </div>
                </div>
              )}

              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 italic">
                {currentSlide.diagram.summary}
              </p>
            </div>
          )}

          {/* Applied Example */}
          {currentSlide.example && (
            <div className="bg-zinc-50 dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-3 flex items-start gap-2.5">
              <Lightbulb className="size-4 text-zinc-500 dark:text-zinc-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-zinc-700 dark:text-zinc-300">
                <strong className="text-zinc-900 dark:text-zinc-100 font-medium">Example: </strong>
                <span>{currentSlide.example}</span>
              </div>
            </div>
          )}

          {/* Speaker Takeaway */}
          <div className="bg-zinc-100/80 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-3 flex items-start gap-2.5">
            <CheckCircle className="size-4 text-zinc-700 dark:text-zinc-300 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-zinc-800 dark:text-zinc-200">
              <strong className="text-zinc-950 dark:text-white font-medium">Takeaway: </strong>
              <span>{currentSlide.speakerTakeaway}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE SYNCHRONIZED TRANSCRIPT VIEW */}
      {activeTab === 'transcript' && (
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3">
          <div className="border-b border-black/[0.08] dark:border-white/[0.08] pb-2.5 flex items-center justify-between text-xs">
            <span className="font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Volume2 className="size-4 text-zinc-500 dark:text-zinc-400" />
              Speech-to-Text Transcript
            </span>
            <span className="text-[11px] text-zinc-500">
              Click any line to seek video
            </span>
          </div>

          <div className="space-y-2">
            {lecture.transcript?.map((item) => {
              const isActive = currentTime >= item.startTime && currentTime < item.endTime;
              return (
                <div
                  key={item.id}
                  onClick={() => onSeekTime(item.startTime)}
                  className={`p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                    isActive
                      ? 'bg-zinc-200/80 dark:bg-white/10 border-black/20 dark:border-white/25 shadow-sm text-zinc-950 dark:text-white font-medium'
                      : 'bg-zinc-50/50 dark:bg-zinc-950/40 border-black/[0.06] dark:border-white/[0.06] hover:bg-zinc-100 dark:hover:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-medium text-[11px] ${isActive ? 'text-zinc-950 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`}>
                      {item.speaker || 'Speaker'}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-500 flex items-center gap-1">
                      <Clock className="size-2.5" />
                      {formatTime(item.startTime)} – {formatTime(item.endTime)}
                    </span>
                  </div>
                  <p className="leading-relaxed">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: EXECUTIVE FINAL SUMMARY VIEW */}
      {activeTab === 'summary' && lecture.summary && (
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
          <div className="border-b border-black/[0.08] dark:border-white/[0.08] pb-3">
            <Badge variant="outline" className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400 border-black/10 dark:border-white/10 uppercase tracking-widest">
              Executive Summary
            </Badge>
            <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed mt-2.5 bg-zinc-50 dark:bg-zinc-950/60 p-3 rounded-xl border border-black/[0.08] dark:border-white/[0.08]">
              {lecture.summary.overview}
            </p>
          </div>

          {/* Key Insights */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="size-3.5 text-zinc-500 dark:text-zinc-400" />
              Key Insights
            </h3>
            <div className="space-y-1.5">
              {lecture.summary.keyInsights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-950/40 p-2.5 rounded-lg border border-black/[0.06] dark:border-white/[0.06]">
                  <span className="size-1.5 rounded-full bg-zinc-500 dark:bg-zinc-400 mt-1.5 flex-shrink-0" />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Core Theorems & Principles */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="size-3.5 text-zinc-500 dark:text-zinc-400" />
              Core Theorems & Formulations
            </h3>
            <div className="space-y-1.5">
              {lecture.summary.coreTheoremsOrPrinciples.map((thm, idx) => (
                <div key={idx} className="bg-white dark:bg-zinc-950 border border-black/[0.06] dark:border-white/[0.06] rounded-lg p-2.5 font-mono text-xs text-zinc-800 dark:text-zinc-200 shadow-sm">
                  {thm}
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Review */}
          <div className="bg-zinc-50 dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-3.5 text-xs space-y-1">
            <strong className="text-zinc-900 dark:text-zinc-200 font-medium block">Recommended Review & Practice:</strong>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {lecture.summary.recommendedReview}
            </p>
          </div>
        </div>
      )}

      {/* Slide Navigation Footer & Jump Selector (Shown on Slides view) */}
      {activeTab === 'slides' && (
        <div className="bg-zinc-50 dark:bg-zinc-950/80 border-t border-black/[0.06] dark:border-white/[0.06] px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
          {/* Prev Slide */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => prevSlide && onSelectSlide(prevSlide)}
            disabled={!prevSlide}
            className="h-7 px-2.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            title="Jump to previous slide"
          >
            <ChevronLeft className="size-3.5 mr-1" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          {/* Slide Jump Pill Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {lecture.slides.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelectSlide(s)}
                className={`size-7 rounded-md text-[11px] font-mono font-medium flex items-center justify-center transition-all ${
                  s.id === currentSlide.id
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-semibold shadow-sm'
                    : 'bg-zinc-200/60 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                }`}
                title={`Slide ${s.slideNumber}: ${s.title} (${formatTime(s.startTime)})`}
              >
                {s.slideNumber}
              </button>
            ))}
          </div>

          {/* Next Slide */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => nextSlide && onSelectSlide(nextSlide)}
            disabled={!nextSlide}
            className="h-7 px-2.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            title="Jump to next slide"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="size-3.5 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
