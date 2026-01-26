"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SearchBar from '../components/SearchBar';
import ResultCard from '../components/ResultCard';
import HUD from '../components/HUD';
import TileViewerWrapper from '../components/tileViewWrapper';
import AdvancedDrawer from '../components/AdvancedDrawer';
import BookmarksDrawer from '../components/BookmarksDrawer';
import { ToastProvider, useToast } from '../components/Toast';

function ExplorerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedBody, setSelectedBody] = useState<string>("moon");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [showResultCard, setShowResultCard] = useState(false);
  const [showNotFound, setShowNotFound] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ name: string; body: string; category: string }>>([]);
  const [navigationParams, setNavigationParams] = useState<{
    body?: string;
    lat?: number;
    lon?: number;
    zoom?: number;
  }>({});
  const [navTimestamp, setNavTimestamp] = useState<number>(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // New state for last search location (for recenter button)
  const [lastSearchLocation, setLastSearchLocation] = useState<{ lat: number; lon: number; name: string } | null>(null);

  // Search history
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // AI Description
  const [aiDescription, setAiDescription] = useState<string | undefined>();

  // Bookmarks drawer state
  const [showBookmarks, setShowBookmarks] = useState(false);

  // Advanced settings state
  const [selectedDataset, setSelectedDataset] = useState<string>("default");
  const [splitViewEnabled, setSplitViewEnabled] = useState(false);
  const [splitLayerId, setSplitLayerId] = useState<string>("");
  const [osdToolbarVisible, setOsdToolbarVisible] = useState(false);

  // Load advanced settings from localStorage
  useEffect(() => {
    const storedAdvancedOpen = localStorage.getItem('pe_advanced_open');
    const storedDataset = localStorage.getItem('pe_dataset');
    const storedSplitView = localStorage.getItem('pe_split_view');
    const storedSplitLayer = localStorage.getItem('pe_split_layer');
    const storedOsdToolbar = localStorage.getItem('pe_osd_toolbar');

    if (storedAdvancedOpen === 'true') {
      setShowAdvanced(true);
    }
    if (storedDataset) {
      setSelectedDataset(storedDataset);
    }
    if (storedSplitView === 'true') {
      setSplitViewEnabled(true);
    }
    if (storedSplitLayer) {
      setSplitLayerId(storedSplitLayer);
    }
    if (storedOsdToolbar === 'true') {
      setOsdToolbarVisible(true);
    }

    // Load search history
    const storedHistory = localStorage.getItem('pe_search_history');
    if (storedHistory) {
      try {
        setSearchHistory(JSON.parse(storedHistory));
      } catch {
        // ignore
      }
    }
  }, []);

  // Save advanced state to localStorage
  useEffect(() => {
    localStorage.setItem('pe_advanced_open', showAdvanced.toString());
  }, [showAdvanced]);

  useEffect(() => {
    localStorage.setItem('pe_dataset', selectedDataset);
  }, [selectedDataset]);

  useEffect(() => {
    localStorage.setItem('pe_split_view', splitViewEnabled.toString());
  }, [splitViewEnabled]);

  useEffect(() => {
    localStorage.setItem('pe_split_layer', splitLayerId);
  }, [splitLayerId]);

  useEffect(() => {
    localStorage.setItem('pe_osd_toolbar', osdToolbarVisible.toString());
  }, [osdToolbarVisible]);

  useEffect(() => {
    const query = searchParams.get('search');
    const bodyParam = searchParams.get('body') || searchParams.get('filter');
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const zoom = searchParams.get('zoom');

    if (bodyParam) {
      setSelectedBody(bodyParam);
    }

    setNavigationParams({
      body: bodyParam || undefined,
      lat: lat ? parseFloat(lat) : undefined,
      lon: lon ? parseFloat(lon) : undefined,
      zoom: zoom ? parseInt(zoom) : undefined,
    });

    const t = searchParams.get('_t');
    if (t) setNavTimestamp(parseInt(t));

    if (query !== null) {
      setSearchQuery(query);
      if (query.trim()) {
        performSearch(query.trim());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    setShowNotFound(false);
    setSuggestions([]);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const result = await response.json();
      console.log('ui.flow', 'search_completed', { query, found: result.found });

      if (result.found) {
        setSelectedBody(result.body);
        setSearchResult(result.feature);
        setShowResultCard(true);

        // Store AI description
        console.log('[Explorer] AI Description from API:', result.ai_description);
        setAiDescription(result.ai_description);

        // Store last search location for recenter button
        setLastSearchLocation({
          lat: result.lat,
          lon: result.lon,
          name: result.feature?.name || query
        });

        // Save to search history (max 10 items, no duplicates)
        const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
        setSearchHistory(newHistory);
        localStorage.setItem('pe_search_history', JSON.stringify(newHistory));

        const params = new URLSearchParams();
        params.append('search', query);
        params.append('body', result.body);
        params.append('lat', result.lat.toString());
        params.append('lon', result.lon.toString());
        params.append('zoom', '6');
        router.push(`/explorer?${params.toString()}`);
      } else {
        setShowNotFound(true);
        setSuggestions(result.suggestions || []);
        console.log('ui.flow', 'search_not_found', { query, suggestions: result.suggestions?.length || 0 });
      }
    } catch (error: any) {
      console.error('Search error:', error);
      setShowNotFound(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      performSearch(query.trim());
    }
  };

  const handleSuggestionSelect = (suggestion: { name: string; body: string; category: string }) => {
    setSuggestions([]);
    setShowNotFound(false);
    setSearchQuery(suggestion.name);
    handleSearch(suggestion.name);
  };

  const handleBodyChange = (body: string) => {
    setSelectedBody(body);
    setSearchQuery(''); // Clear search when switching bodies
    setSearchResult(null); // Clear previous result
    setShowResultCard(false); // Hide result card
    const params = new URLSearchParams();
    // Do not preserve search query when switching bodies
    params.append('body', body);
    router.push(`/explorer?${params.toString()}`);
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Full-bleed viewer */}
      <div id="viewer" className="fixed inset-0" style={{ zIndex: 1 }}>
        <div className="w-full h-full">
          <TileViewerWrapper
            searchQuery={searchQuery}
            initialBody={navigationParams.body || selectedBody}
            initialLat={navigationParams.lat}
            initialLon={navigationParams.lon}
            initialZoom={navigationParams.zoom}
            navTimestamp={navTimestamp}
            selectedDataset={selectedDataset}
            splitViewEnabled={splitViewEnabled}
            splitLayerId={splitLayerId}
            osdToolbarVisible={osdToolbarVisible}
            onFeatureSelected={(feature) => {
              console.log('[Explorer] Reverse search feature selected:', feature);
              setSearchResult(feature);
              setShowResultCard(true);
            }}
          />
        </div>
      </div>

      {/* Search bar overlay */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 w-full px-4 z-40">
        <div className="mx-auto max-w-[520px] md:max-w-[480px] sm:max-w-[420px]">
          <SearchBar
            value={searchQuery}
            onSearch={handleSearch}
            isLoading={isSearching}
            suggestions={suggestions}
            onSuggestionSelect={handleSuggestionSelect}
            showNotFound={showNotFound}
            notFoundMessage="Try one of the suggestions below or refine your search"
            onDismissNotFound={() => setShowNotFound(false)}
            searchHistory={searchHistory}
          />
        </div>
      </div>

      {/* HUD overlay */}
      <HUD
        selectedBody={selectedBody}
        onBodyChange={handleBodyChange}
        showZoomControls={false}
        showHomeButton={true}
        showAdvancedButton={true}
        onAdvancedToggle={() => setShowAdvanced(!showAdvanced)}
        advancedOpen={showAdvanced}
      />

      {/* Advanced drawer */}
      <AdvancedDrawer
        isOpen={showAdvanced}
        onClose={() => setShowAdvanced(false)}
        onDatasetChange={setSelectedDataset}
        onSplitViewToggle={setSplitViewEnabled}
        onSplitLayerChange={setSplitLayerId}
        onOsdToolbarToggle={setOsdToolbarVisible}
        currentDataset={selectedDataset}
        currentBody={selectedBody}
        splitViewEnabled={splitViewEnabled}
        splitLayerId={splitLayerId}
        osdToolbarVisible={osdToolbarVisible}
      />

      {/* Result card overlay */}
      {showResultCard && console.log('[Explorer] Passing aiDescription to ResultCard:', aiDescription)}
      <ResultCard
        isOpen={showResultCard}
        onClose={() => setShowResultCard(false)}
        feature={searchResult}
        provider={searchResult?.provider}
        aiDescription={aiDescription}
        onBookmarkResult={(success) => {
          showToast(success ? 'Bookmark saved!' : 'Already bookmarked', success ? 'success' : 'info');
        }}
      />

      {/* Action buttons container - properly spaced */}
      <div className="fixed bottom-20 right-6 z-30 flex flex-row-reverse items-center gap-3">
        {/* Recenter Button (visible when search result exists) */}
        {lastSearchLocation && (
          <button
            onClick={() => {
              const params = new URLSearchParams();
              params.append('body', selectedBody);
              params.append('lat', lastSearchLocation.lat.toString());
              params.append('lon', lastSearchLocation.lon.toString());
              params.append('zoom', '6');
              // timestamp forces the URL to change even if coords are same, triggering useEffect
              params.append('_t', Date.now().toString());
              router.push(`/explorer?${params.toString()}`);
            }}
            className="glass-card p-3 hover:bg-white/20 transition-colors group"
            title={`Return to ${lastSearchLocation.name}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80 group-hover:text-white">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
              <line x1="12" y1="2" x2="12" y2="5" />
              <line x1="12" y1="19" x2="12" y2="22" />
              <line x1="2" y1="12" x2="5" y2="12" />
              <line x1="19" y1="12" x2="22" y2="12" />
            </svg>
          </button>
        )}

        {/* Share Link Button (visible when search result exists) */}
        {lastSearchLocation && (
          <button
            onClick={() => {
              const shareUrl = `${window.location.origin}/explorer?body=${selectedBody}&lat=${lastSearchLocation.lat}&lon=${lastSearchLocation.lon}&zoom=6&search=${encodeURIComponent(lastSearchLocation.name)}`;
              navigator.clipboard.writeText(shareUrl);
              showToast('Link copied to clipboard!');
            }}
            className="glass-card p-3 hover:bg-white/20 transition-colors group"
            title="Copy shareable link"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80 group-hover:text-white">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </button>
        )}

        {/* Bookmarks Toggle Button */}
        <button
          onClick={() => setShowBookmarks(!showBookmarks)}
          className="glass-card p-3 hover:bg-white/20 transition-colors group"
          title="View bookmarks"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={showBookmarks ? "#facc15" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={showBookmarks ? "text-yellow-400" : "text-white/80 group-hover:text-white"}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      </div>

      {/* BookmarksDrawer */}
      <BookmarksDrawer
        isOpen={showBookmarks}
        onClose={() => setShowBookmarks(false)}
        onNavigate={(bookmark) => {
          setShowBookmarks(false);
          setSelectedBody(bookmark.body);
          const params = new URLSearchParams();
          params.append('search', bookmark.name); // Trigger search to open card
          params.append('body', bookmark.body);
          params.append('lat', bookmark.lat.toString());
          params.append('lon', bookmark.lon.toString());
          params.append('zoom', '6');
          router.push(`/explorer?${params.toString()}`);
        }}
      />

      {/* Not found fallback glass card */}
      {showNotFound && !suggestions.length && (
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-4 z-40">
          <div className="glass-card text-center">
            <div className="text-white/90 font-semibold text-lg mb-2">
              Feature Not Found
            </div>
            <p className="text-white/70 text-sm mb-4">
              The requested feature could not be found in our dataset, or the request was not understood.
              Please try refining your search or use a different query.
            </p>
            <button
              onClick={() => setShowNotFound(false)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm pointer-events-none" style={{ zIndex: 10 }}>
        Made with ❤️ by Slack Overflow
      </div>
    </div>
  );
}

export default function ExplorerPage() {
  return (
    <ToastProvider>
      <Suspense fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-black">
          <div className="text-white text-xl">Loading explorer...</div>
        </div>
      }>
        <ExplorerContent />
      </Suspense>
    </ToastProvider>
  );
}
