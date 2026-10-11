import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Lock, 
  Upload, 
  Image as ImageIcon, 
  Film, 
  Heart, 
  Trash2, 
  Folder, 
  Settings as SettingsIcon, 
  Sun, 
  Moon, 
  Search, 
  Sparkles, 
  RotateCcw, 
  Plus, 
  CheckSquare, 
  Square, 
  AlertCircle,
  FolderPlus,
  Download
} from 'lucide-react';
import type { MediaItem, Album, VaultSettings } from '../types';
import { vaultDB } from '../services/db';
import { sound } from '../services/sound';
import { MediaViewer } from './MediaViewer';
import { SettingsModal } from './SettingsModal';
import { AlbumModal } from './AlbumModal';
import { 
  generateSamplePhoto1, 
  generateSamplePhoto2, 
  generateSamplePhoto3, 
  generateSampleVideo 
} from '../utils/sampleMedia';

interface VaultDashboardProps {
  settings: VaultSettings;
  onLock: () => void;
  onUpdateSettings: (updated: Partial<VaultSettings>) => void;
  onToggleTheme: () => void;
  onOpenInstall?: () => void;
}

export const VaultDashboard: React.FC<VaultDashboardProps> = ({
  settings,
  onLock,
  onUpdateSettings,
  onToggleTheme,
  onOpenInstall,
}) => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  // Active filter tab: 'all' | 'photos' | 'videos' | 'favorites' | 'trash' | `album_${id}`
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load initial data
  const loadData = async () => {
    try {
      setLoading(true);
      const [mediaList, albumsList] = await Promise.all([
        vaultDB.getAllMedia(),
        vaultDB.getAlbums(),
      ]);
      setMedia(mediaList);
      setAlbums(albumsList);
    } catch (err) {
      console.error('Failed to load vault items', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Panic lock on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && viewerIndex === null && !isSettingsOpen && !isAlbumModalOpen) {
        sound.playClick(0.7);
        onLock();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewerIndex, isSettingsOpen, isAlbumModalOpen, onLock]);

  // File import handler
  const handleImportFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    sound.playClick();
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');

      if (!isImage && !isVideo) continue;

      const currentAlbumId = activeTab.startsWith('album_') ? activeTab.replace('album_', '') : null;

      await vaultDB.addMedia({
        name: file.name,
        type: isVideo ? 'video' : 'image',
        mimeType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
        size: file.size,
        blob: file,
        albumId: currentAlbumId,
      });
    }

    await loadData();
  };

  // Load sample media generator
  const handleLoadSampleMedia = async () => {
    sound.playClick();
    setLoading(true);

    const p1 = generateSamplePhoto1();
    const p2 = generateSamplePhoto2();
    const p3 = generateSamplePhoto3();
    const vid = await generateSampleVideo();

    await Promise.all([
      vaultDB.addMedia(p1),
      vaultDB.addMedia(p2),
      vaultDB.addMedia(p3),
      vaultDB.addMedia(vid),
    ]);

    await loadData();
  };

  // Filter items
  const filteredMedia = useMemo(() => {
    return media.filter((item) => {
      // Trash filter
      if (activeTab === 'trash') {
        if (!item.isTrash) return false;
      } else {
        if (item.isTrash) return false;
      }

      // Tab filter
      if (activeTab === 'photos' && item.type !== 'image') return false;
      if (activeTab === 'videos' && item.type !== 'video') return false;
      if (activeTab === 'favorites' && !item.isFavorite) return false;
      if (activeTab.startsWith('album_')) {
        const targetAlbumId = activeTab.replace('album_', '');
        if (item.albumId !== targetAlbumId) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        if (!item.name.toLowerCase().includes(query)) return false;
      }

      return true;
    });
  }, [media, activeTab, searchQuery]);

  // Statistics
  const activePhotosCount = media.filter((m) => !m.isTrash && m.type === 'image').length;
  const activeVideosCount = media.filter((m) => !m.isTrash && m.type === 'video').length;
  const trashCount = media.filter((m) => m.isTrash).length;

  // Single Item Actions
  const handleToggleFavorite = async (id: string) => {
    sound.playClick(1.2);
    await vaultDB.toggleFavorite(id);
    await loadData();
  };

  const handleDeleteItem = async (id: string) => {
    sound.playClick(0.8);
    const isAlreadyTrash = activeTab === 'trash';
    await vaultDB.deleteMedia(id, isAlreadyTrash);
    await loadData();
  };

  const handleRestoreItem = async (id: string) => {
    sound.playClick(1.1);
    await vaultDB.restoreMedia(id);
    await loadData();
  };

  // Batch actions
  const toggleSelect = (id: string) => {
    sound.playClick();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    sound.playClick();
    if (selectedIds.size === filteredMedia.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredMedia.map((m) => m.id)));
    }
  };

  const handleBatchDelete = async () => {
    sound.playClick(0.8);
    const isTrash = activeTab === 'trash';
    for (const id of Array.from(selectedIds)) {
      await vaultDB.deleteMedia(id, isTrash);
    }
    setSelectedIds(new Set());
    setIsSelectMode(false);
    await loadData();
  };

  const handleBatchRestore = async () => {
    sound.playClick(1.1);
    for (const id of Array.from(selectedIds)) {
      await vaultDB.restoreMedia(id);
    }
    setSelectedIds(new Set());
    setIsSelectMode(false);
    await loadData();
  };

  const handleEmptyTrash = async () => {
    sound.playClick(0.75);
    await vaultDB.emptyTrash();
    await loadData();
  };

  const handleClearAll = async () => {
    sound.playClick(0.7);
    await vaultDB.clearAllData();
    await loadData();
    onLock();
  };

  // Album operations
  const handleCreateAlbum = async (name: string) => {
    await vaultDB.addAlbum(name);
    await loadData();
  };

  const handleDeleteAlbum = async (id: string) => {
    await vaultDB.deleteAlbum(id);
    if (activeTab === `album_${id}`) setActiveTab('all');
    await loadData();
  };

  // Thumbnail generator cache helper
  const Thumbnail: React.FC<{ item: MediaItem }> = ({ item }) => {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
      const objUrl = URL.createObjectURL(item.blob);
      setUrl(objUrl);
      return () => URL.revokeObjectURL(objUrl);
    }, [item.blob]);

    if (!url) {
      return <div className="w-full h-full bg-slate-800 animate-pulse" />;
    }

    if (item.type === 'video') {
      return (
        <div className="relative w-full h-full bg-slate-950 flex items-center justify-center">
          <video src={url} className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center">
            <div className="p-3 rounded-full bg-indigo-600/90 text-white shadow-lg backdrop-blur-sm">
              <Film className="w-5 h-5" />
            </div>
          </div>
          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-black/70 text-white">
            VIDEO
          </span>
        </div>
      );
    }

    return (
      <img
        src={url}
        alt={item.name}
        loading="lazy"
        className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
      />
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Top Vault Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Vault Status */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  Secret Media Vault
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Encrypted
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {activePhotosCount} Photos • {activeVideosCount} Videos
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="hidden md:flex items-center relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search hidden files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Install / Download App button */}
            {onOpenInstall && (
              <button
                onClick={onOpenInstall}
                title="Download / Install PWA App"
                className="p-2 rounded-xl border border-indigo-200 dark:border-indigo-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 transition"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            {/* Import / Add Media Button */}
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => handleImportFiles(e.target.files)}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-2 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/25 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Media</span>
            </button>

            {/* Manage Albums */}
            <button
              onClick={() => setIsAlbumModalOpen(true)}
              title="Manage Albums"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            >
              <FolderPlus className="w-4 h-4" />
            </button>

            {/* Settings */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              title="Vault Settings"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              title="Toggle Theme"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

            {/* Panic Lock Button */}
            <button
              onClick={() => {
                sound.playClick(0.7);
                onLock();
              }}
              title="Emergency Quick Lock (Esc)"
              className="py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white dark:text-rose-400 dark:hover:text-white border border-rose-500/20 font-semibold text-xs flex items-center gap-1.5 transition active:scale-95"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Panic Lock</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Vault Content */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 flex-1 flex flex-col gap-6">
        {/* Navigation Filter Tabs */}
        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 text-xs">
            <button
              onClick={() => { setActiveTab('all'); setSelectedIds(new Set()); }}
              className={`px-3.5 py-1.5 rounded-xl font-medium transition ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Media ({activePhotosCount + activeVideosCount})
            </button>
            <button
              onClick={() => { setActiveTab('photos'); setSelectedIds(new Set()); }}
              className={`px-3.5 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition ${
                activeTab === 'photos'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Photos ({activePhotosCount})</span>
            </button>
            <button
              onClick={() => { setActiveTab('videos'); setSelectedIds(new Set()); }}
              className={`px-3.5 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition ${
                activeTab === 'videos'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Videos ({activeVideosCount})</span>
            </button>
            <button
              onClick={() => { setActiveTab('favorites'); setSelectedIds(new Set()); }}
              className={`px-3.5 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition ${
                activeTab === 'favorites'
                  ? 'bg-white dark:bg-slate-800 text-rose-500 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Favorites</span>
            </button>

            {/* Custom Albums */}
            {albums.map((album) => (
              <button
                key={album.id}
                onClick={() => { setActiveTab(`album_${album.id}`); setSelectedIds(new Set()); }}
                className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition ${
                  activeTab === `album_${album.id}`
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>{album.name}</span>
              </button>
            ))}

            {/* Trash Tab */}
            <button
              onClick={() => { setActiveTab('trash'); setSelectedIds(new Set()); }}
              className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition ${
                activeTab === 'trash'
                  ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Trash ({trashCount})</span>
            </button>
          </div>

          {/* Multi-select toggle */}
          {filteredMedia.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setIsSelectMode(!isSelectMode);
                  setSelectedIds(new Set());
                }}
                className={`py-1.5 px-3 rounded-xl border text-xs font-medium transition ${
                  isSelectMode
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {isSelectMode ? 'Cancel Selection' : 'Select'}
              </button>
            </div>
          )}
        </div>

        {/* Batch action bar if items are selected */}
        {isSelectMode && selectedIds.size > 0 && (
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-between text-xs animate-slide-up">
            <div className="flex items-center gap-3">
              <button
                onClick={handleSelectAll}
                className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5"
              >
                {selectedIds.size === filteredMedia.length ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                <span>{selectedIds.size} selected</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {activeTab === 'trash' ? (
                <>
                  <button
                    onClick={handleBatchRestore}
                    className="py-1.5 px-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-500 transition"
                  >
                    Restore Selected
                  </button>
                  <button
                    onClick={handleBatchDelete}
                    className="py-1.5 px-3 rounded-xl bg-rose-600 text-white font-medium hover:bg-rose-500 transition"
                  >
                    Permanently Delete
                  </button>
                </>
              ) : (
                <button
                  onClick={handleBatchDelete}
                  className="py-1.5 px-3 rounded-xl bg-rose-600 text-white font-medium hover:bg-rose-500 transition"
                >
                  Move to Trash
                </button>
              )}
            </div>
          </div>
        )}

        {/* Trash header notice */}
        {activeTab === 'trash' && trashCount > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Items in Trash are stored safely until permanently removed.</span>
            </div>
            <button
              onClick={handleEmptyTrash}
              className="py-1.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold transition"
            >
              Empty Trash Now
            </button>
          </div>
        )}

        {/* Drag & Drop Upload Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleImportFiles(e.dataTransfer.files);
          }}
          className={`relative border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 scale-[0.99]'
              : 'border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="max-w-md mx-auto flex flex-col items-center">
            <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
              Drag & Drop Photos or Videos here
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Supports JPEG, PNG, GIF, WEBP, MP4, WebM. Stored privately on your device.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition"
              >
                Browse Files
              </button>
              <button
                onClick={handleLoadSampleMedia}
                className="py-2 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Load Sample Media</span>
              </button>
            </div>
          </div>
        </div>

        {/* Media Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-slate-200 dark:bg-slate-800/60 animate-pulse" />
            ))}
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 mb-3">
              <ImageIcon className="w-8 h-8 opacity-50" />
            </div>
            <h4 className="text-base font-semibold text-slate-700 dark:text-slate-300">
              No media in this view
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              Use the upload area above to hide your private photos and videos, or click "Load Sample Media" to test.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {filteredMedia.map((item, idx) => {
              const isSelected = selectedIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className={`group relative aspect-square rounded-2xl overflow-hidden border transition-all duration-200 ${
                    isSelected
                      ? 'border-indigo-600 ring-2 ring-indigo-500 shadow-lg'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                  }`}
                >
                  {/* Thumbnail */}
                  <Thumbnail item={item} />

                  {/* Multi-select checkbox overlay */}
                  {isSelectMode && (
                    <div
                      onClick={() => toggleSelect(item.id)}
                      className="absolute inset-0 bg-slate-950/30 z-20 cursor-pointer p-2 flex items-start justify-end"
                    >
                      <div className="p-1 rounded-lg bg-white dark:bg-slate-900 shadow">
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-indigo-600" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Normal hover action overlay */}
                  {!isSelectMode && (
                    <div
                      onClick={() => setViewerIndex(idx)}
                      className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 p-3 flex flex-col justify-between cursor-pointer"
                    >
                      {/* Top action row */}
                      <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleFavorite(item.id)}
                          title="Favorite"
                          className="p-1.5 rounded-lg bg-black/50 text-white hover:text-rose-400 backdrop-blur-sm transition"
                        >
                          <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                        </button>

                        <div className="flex items-center gap-1">
                          {activeTab === 'trash' ? (
                            <button
                              onClick={() => handleRestoreItem(item.id)}
                              title="Restore"
                              className="p-1.5 rounded-lg bg-black/50 text-emerald-400 hover:bg-emerald-600 hover:text-white backdrop-blur-sm transition"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              title="Move to Trash"
                              className="p-1.5 rounded-lg bg-black/50 text-slate-300 hover:text-rose-400 hover:bg-rose-950/50 backdrop-blur-sm transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Bottom title & metadata */}
                      <div>
                        <p className="text-xs font-semibold text-white truncate drop-shadow">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-slate-300 drop-shadow">
                          {(item.size / 1024).toFixed(0)} KB • {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Fullscreen Lightbox & Video Player Modal */}
      {viewerIndex !== null && (
        <MediaViewer
          items={filteredMedia}
          currentIndex={viewerIndex}
          isOpen={viewerIndex !== null}
          onClose={() => setViewerIndex(null)}
          onNavigate={(newIdx) => setViewerIndex(newIdx)}
          onToggleFavorite={handleToggleFavorite}
          onDelete={handleDeleteItem}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onSave={onUpdateSettings}
        onClearAllData={handleClearAll}
        onOpenInstall={onOpenInstall}
      />

      {/* Album Modal */}
      <AlbumModal
        isOpen={isAlbumModalOpen}
        albums={albums}
        onClose={() => setIsAlbumModalOpen(false)}
        onCreateAlbum={handleCreateAlbum}
        onDeleteAlbum={handleDeleteAlbum}
      />
    </div>
  );
};
