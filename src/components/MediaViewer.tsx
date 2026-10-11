import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Trash2, 
  Heart, 
  Calendar, 
  FileText,
  Film
} from 'lucide-react';
import type { MediaItem } from '../types';
import { sound } from '../services/sound';

interface MediaViewerProps {
  items: MediaItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}

export const MediaViewer: React.FC<MediaViewerProps> = ({
  items,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
  onToggleFavorite,
  onDelete,
}) => {
  const currentItem = items[currentIndex];

  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Generate blob URL safely and clean up
  const mediaUrl = useMemo(() => {
    if (!currentItem || !currentItem.blob) return null;
    return URL.createObjectURL(currentItem.blob);
  }, [currentItem]);

  useEffect(() => {
    return () => {
      if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    };
  }, [mediaUrl]);

  // Reset transforms on item change
  useEffect(() => {
    setZoom(1);
    setRotation(0);
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) onNavigate(currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        if (currentIndex < items.length - 1) onNavigate(currentIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, items.length, onClose, onNavigate]);

  if (!isOpen || !currentItem) return null;

  const handleDownload = () => {
    if (!mediaUrl) return;
    const a = document.createElement('a');
    a.href = mediaUrl;
    a.download = currentItem.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    sound.playClick();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-xl animate-fade-in text-white select-none">
      {/* Top action bar */}
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/50">
        <div className="flex items-center gap-3 truncate max-w-[50%]">
          {currentItem.type === 'video' ? (
            <Film className="w-5 h-5 text-indigo-400 shrink-0" />
          ) : (
            <FileText className="w-5 h-5 text-sky-400 shrink-0" />
          )}
          <div className="truncate">
            <h3 className="text-sm font-semibold truncate leading-tight">
              {currentItem.name}
            </h3>
            <p className="text-[11px] text-slate-400">
              {formatFileSize(currentItem.size)} • {currentIndex + 1} of {items.length}
            </p>
          </div>
        </div>

        {/* Center tools (for images) */}
        {currentItem.type === 'image' && (
          <div className="hidden sm:flex items-center gap-1 bg-slate-800/60 rounded-xl p-1 border border-slate-700/60">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
              title="Zoom Out"
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs px-2 font-mono text-slate-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
              title="Zoom In"
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setRotation((r) => (r + 90) % 360)}
              title="Rotate 90°"
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleFavorite(currentItem.id)}
            title="Toggle Favorite"
            className={`p-2 rounded-xl transition ${
              currentItem.isFavorite
                ? 'text-rose-500 bg-rose-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Heart className={`w-5 h-5 ${currentItem.isFavorite ? 'fill-rose-500' : ''}`} />
          </button>

          <button
            onClick={handleDownload}
            title="Download / Unhide to Device"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <Download className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              onDelete(currentItem.id);
              if (items.length <= 1) {
                onClose();
              } else if (currentIndex >= items.length - 1) {
                onNavigate(currentIndex - 1);
              }
            }}
            title="Move to Trash"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          <div className="h-5 w-px bg-slate-800 mx-1" />

          <button
            onClick={onClose}
            title="Close Viewer"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main media viewport */}
      <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden">
        {currentItem.type === 'video' ? (
          <video
            src={mediaUrl || ''}
            controls
            autoPlay
            className="max-h-[82vh] max-w-full rounded-xl shadow-2xl object-contain bg-black"
          />
        ) : (
          <div className="relative max-h-full max-w-full flex items-center justify-center overflow-auto">
            <img
              src={mediaUrl || ''}
              alt={currentItem.name}
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: 'transform 0.15s ease-out',
              }}
              className="max-h-[82vh] max-w-full rounded-lg shadow-2xl object-contain pointer-events-auto"
            />
          </div>
        )}

        {/* Previous navigation button */}
        {currentIndex > 0 && (
          <button
            onClick={() => onNavigate(currentIndex - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/70 hover:bg-slate-800 text-white backdrop-blur-md border border-slate-700/60 shadow-lg transition active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next navigation button */}
        {currentIndex < items.length - 1 && (
          <button
            onClick={() => onNavigate(currentIndex + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/70 hover:bg-slate-800 text-white backdrop-blur-md border border-slate-700/60 shadow-lg transition active:scale-95"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom info footer */}
      <div className="h-12 px-6 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>Added: {new Date(currentItem.createdAt).toLocaleString()}</span>
        </div>
        <div className="hidden sm:block">
          Use ← / → arrow keys to navigate, Esc to close
        </div>
      </div>
    </div>
  );
};
