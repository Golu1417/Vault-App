import React, { useState } from 'react';
import { X, FolderPlus, Folder, Trash2 } from 'lucide-react';
import type { Album } from '../types';
import { sound } from '../services/sound';

interface AlbumModalProps {
  isOpen: boolean;
  albums: Album[];
  onClose: () => void;
  onCreateAlbum: (name: string) => void;
  onDeleteAlbum: (id: string) => void;
}

export const AlbumModal: React.FC<AlbumModalProps> = ({
  isOpen,
  albums,
  onClose,
  onCreateAlbum,
  onDeleteAlbum,
}) => {
  const [newAlbumName, setNewAlbumName] = useState('');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumName.trim()) return;
    onCreateAlbum(newAlbumName.trim());
    setNewAlbumName('');
    sound.playClick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Manage Albums
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Organize photos and videos into private collections
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Create new album form */}
        <form onSubmit={handleCreate} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="New album name..."
            value={newAlbumName}
            onChange={(e) => setNewAlbumName(e.target.value)}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center gap-1.5 transition shrink-0"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Create</span>
          </button>
        </form>

        {/* Existing albums list */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {albums.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              No custom albums yet. Create one above to organize your media!
            </div>
          ) : (
            albums.map((album) => (
              <div
                key={album.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60"
              >
                <div className="flex items-center gap-2.5">
                  <Folder className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {album.name}
                  </span>
                </div>
                <button
                  onClick={() => onDeleteAlbum(album.id)}
                  title="Delete Album"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
