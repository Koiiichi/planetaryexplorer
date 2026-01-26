"use client";

import { useState, useEffect } from "react";
import { Star, X, MapPin, Trash2 } from "lucide-react";

interface Bookmark {
    id: string;
    name: string;
    body: string;
    lat: number;
    lon: number;
    createdAt: string;
}

interface BookmarksDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (bookmark: Bookmark) => void;
}

export default function BookmarksDrawer({
    isOpen,
    onClose,
    onNavigate,
}: BookmarksDrawerProps) {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('pe_bookmarks');
        if (stored) {
            try {
                setBookmarks(JSON.parse(stored));
            } catch {
                // ignore
            }
        }
    }, [isOpen]);

    const removeBookmark = (id: string) => {
        const updated = bookmarks.filter(b => b.id !== id);
        setBookmarks(updated);
        localStorage.setItem('pe_bookmarks', JSON.stringify(updated));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed right-6 bottom-6 w-full md:w-[320px] max-h-[50vh] glass-card z-50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Star size={20} className="text-yellow-400" />
                    <h3 className="text-white font-semibold text-lg">Bookmarks</h3>
                </div>
                <button
                    onClick={onClose}
                    className="text-white/60 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
                    title="Close"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[calc(50vh-80px)]">
                {bookmarks.length === 0 ? (
                    <div className="text-white/60 text-sm text-center py-4">
                        No bookmarks yet. Click the star on a search result to save it.
                    </div>
                ) : (
                    bookmarks.map((bookmark) => (
                        <div
                            key={bookmark.id}
                            className="flex items-center justify-between bg-white/5 hover:bg-white/10 rounded-lg p-3 transition-colors group"
                        >
                            <button
                                onClick={() => onNavigate(bookmark)}
                                className="flex-1 text-left"
                            >
                                <div className="font-medium text-white">{bookmark.name}</div>
                                <div className="text-xs text-white/60 flex items-center gap-1">
                                    <MapPin size={12} />
                                    <span className="capitalize">{bookmark.body}</span>
                                    <span>•</span>
                                    <span>{bookmark.lat.toFixed(2)}°, {bookmark.lon.toFixed(2)}°</span>
                                </div>
                            </button>
                            <button
                                onClick={() => removeBookmark(bookmark.id)}
                                className="text-white/40 hover:text-red-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
                                title="Remove bookmark"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// Helper function to add a bookmark (can be called from ResultCard or elsewhere)
export function addBookmark(name: string, body: string, lat: number, lon: number) {
    const stored = localStorage.getItem('pe_bookmarks');
    let bookmarks: Bookmark[] = [];
    if (stored) {
        try {
            bookmarks = JSON.parse(stored);
        } catch {
            // ignore
        }
    }

    const newBookmark: Bookmark = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        body,
        lat,
        lon,
        createdAt: new Date().toISOString(),
    };

    // Avoid duplicates
    if (!bookmarks.some(b => b.name === name && b.body === body)) {
        bookmarks.unshift(newBookmark);
        localStorage.setItem('pe_bookmarks', JSON.stringify(bookmarks.slice(0, 50)));
        return true;
    }
    return false;
}
