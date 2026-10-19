'use client';

import React, { useState, useRef } from 'react';
import { Lecture } from '@/lib/types';
import { createCustomLectureFromUpload } from '@/data/sampleLectures';
import { Button } from '@/components/ui/button';
import {
  Upload,
  FileVideo,
  CheckCircle2,
  X,
  Loader2,
  Cpu,
} from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLectureCreated: (newLecture: Lecture) => void;
}

const PROCESSING_STAGES = [
  { step: 1, label: 'Reading Video & Audio Stream (VAD Segmentation)', progress: 20 },
  { step: 2, label: 'Transcribing Speaker Explanations (Speech-to-Text)', progress: 45 },
  { step: 3, label: 'Extracting Core Concepts, Theorems & Equations', progress: 70 },
  { step: 4, label: 'Synthesizing Presentation Deck with Visual Diagrams', progress: 90 },
  { step: 5, label: 'Synchronizing Slide Timestamps to Lecture Playback', progress: 100 },
];

export function UploadModal({ isOpen, onClose, onLectureCreated }: UploadModalProps) {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const startProcessing = () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(15);
    setCurrentStageIndex(0);

    const runPipeline = (stage: number) => {
      if (stage < PROCESSING_STAGES.length) {
        setCurrentStageIndex(stage);
        setProgress(PROCESSING_STAGES[stage].progress);
        setTimeout(() => {
          runPipeline(stage + 1);
        }, 750);
      } else {
        setTimeout(() => {
          const newLecture = createCustomLectureFromUpload(selectedFile, 150);
          onLectureCreated(newLecture);
          setIsProcessing(false);
          setSelectedFile(null);
          onClose();
        }, 500);
      }
    };

    setTimeout(() => {
      runPipeline(1);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white/95 dark:bg-zinc-900/95 border border-black/10 dark:border-white/10 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative">
        {/* Modal Header */}
        <div className="bg-zinc-50 dark:bg-zinc-950/70 border-b border-black/[0.06] dark:border-white/[0.06] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 border border-black/10 dark:border-white/10 flex items-center justify-center">
              <Upload className="size-4 text-zinc-700 dark:text-zinc-300" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Upload Lecture Video</h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Generate synchronized presentation slides from recorded footage
              </p>
            </div>
          </div>
          {!isProcessing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="size-7 p-0 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5">
          {!isProcessing ? (
            <div className="space-y-4">
              {/* Dropzone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-black/30 dark:border-white/40 bg-black/[0.02] dark:bg-white/[0.05]'
                    : 'border-black/15 dark:border-white/15 hover:border-black/25 dark:hover:border-white/25 bg-zinc-50/70 dark:bg-zinc-950/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/mkv,video/webm,video/quicktime"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-2">
                  <div className="size-11 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-black/10 dark:border-white/10 flex items-center justify-center text-zinc-700 dark:text-zinc-300 mb-1">
                    <FileVideo className="size-5" />
                  </div>
                  <span className="text-xs font-medium text-zinc-900 dark:text-zinc-200">
                    {selectedFile ? selectedFile.name : 'Select or drag video file'}
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    {selectedFile
                      ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB • Click to replace`
                      : 'Supports MP4, MKV, WebM, QuickTime MOV'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={startProcessing}
                  disabled={!selectedFile}
                  className="text-xs bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-950 font-medium"
                >
                  <span>Process Lecture</span>
                </Button>
              </div>
            </div>
          ) : (
            /* Pipeline Progress */
            <div className="py-4 space-y-5">
              <div className="text-center space-y-1">
                <div className="inline-flex size-11 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-black/10 dark:border-white/10 items-center justify-center text-zinc-800 dark:text-zinc-200">
                  <Cpu className="size-5 animate-pulse" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Analyzing Lecture Footage
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                  {PROCESSING_STAGES[currentStageIndex]?.label}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                  <span>Processing</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${progress}%` }}
                    className="h-full bg-zinc-900 dark:bg-white transition-all duration-300 rounded-full"
                  />
                </div>
              </div>

              {/* Stage Checklist */}
              <div className="space-y-2 bg-zinc-50 dark:bg-zinc-950/60 p-3 rounded-xl border border-black/[0.06] dark:border-white/[0.06]">
                {PROCESSING_STAGES.map((st, sIdx) => {
                  const isDone = sIdx < currentStageIndex;
                  const isCurrent = sIdx === currentStageIndex;
                  return (
                    <div
                      key={st.step}
                      className="flex items-center gap-2.5 text-xs text-zinc-700 dark:text-zinc-300"
                    >
                      {isDone ? (
                        <CheckCircle2 className="size-3.5 text-zinc-500 dark:text-zinc-400 flex-shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="size-3.5 text-zinc-900 dark:text-white animate-spin flex-shrink-0" />
                      ) : (
                        <span className="size-3.5 rounded-full border border-black/10 dark:border-white/10 flex-shrink-0" />
                      )}
                      <span className={isCurrent ? 'text-zinc-900 dark:text-zinc-100 font-medium' : isDone ? 'text-zinc-400 line-through' : 'text-zinc-500'}>
                        {st.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
