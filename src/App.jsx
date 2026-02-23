import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Player from './components/Player';
import Home from './pages/Home';
import { useAuth } from './context/AuthContext';
import { subscribeToPlaylists, createPlaylist, deletePlaylist } from './services/playlistService';
import './App.css';

// Fast Load: Lazy loading modals
const LoginModal = React.lazy(() => import('./components/LoginModal'));
const UploadModal = React.lazy(() => import('./components/UploadModal'));
const PlaylistModal = React.lazy(() => import('./components/PlaylistModal'));

function App() {
  const { user, logout } = useAuth();
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [currentView, setCurrentView] = useState({ type: 'home' });
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const [playlists, setPlaylists] = useState([]);
  const [queue, setQueue] = useState([]);
  const [isShuffle, setIsShuffle] = useState(() => {
    return localStorage.getItem('shuffle') === 'true';
  });
  const [repeatMode, setRepeatMode] = useState(() => {
    return parseInt(localStorage.getItem('repeat') || '0'); // 0: off, 1: one, 2: all
  });

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('shuffle', isShuffle);
  }, [isShuffle]);

  useEffect(() => {
    localStorage.setItem('repeat', repeatMode);
  }, [repeatMode]);
  const searchInputRef = React.useRef(null);

  // Subscribe to playlists
  useEffect(() => {
    if (!user) {
      setPlaylists([]);
      setCurrentView({ type: 'home' });
      return;
    }

    const unsubscribe = subscribeToPlaylists(user.uid, (data) => {
      setPlaylists(data);
      if (currentView.type === 'playlist') {
        const currentPlaylist = data.find(p => p.id === currentView.id);
        if (currentPlaylist) {
          setCurrentView(prev => ({ ...prev, name: currentPlaylist.name, songIds: currentPlaylist.songIds }));
        }
      }
    });

    return () => unsubscribe();
  }, [user, currentView.id]); // Simplified dependencies

  const handleSearchClick = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleOpenUpload = () => {
    setEditingSong(null);
    setIsUploadOpen(true);
  };

  const handleOpenEdit = (song) => {
    setEditingSong(song);
    setIsUploadOpen(true);
  };

  const handleCreatePlaylist = async (playlistName) => {
    if (!user) return setIsLoginOpen(true);

    // If no name is provided (called from button), open modal
    if (typeof playlistName !== 'string') {
      setIsPlaylistModalOpen(true);
      return;
    }

    try {
      await createPlaylist(user.uid, playlistName);
    } catch (error) {
      console.error("Error al crear lista:", error);
      alert("Hubo un error al crear la lista. Por favor, inténtalo de nuevo.");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Clear state immediately and manually to ensure UI updates even if context is slow
      setPlaylists([]);
      setCurrentView({ type: 'home' });
      setQueue([]);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta lista?")) return;

    try {
      await deletePlaylist(playlistId);
      if (currentView.type === 'playlist' && currentView.id === playlistId) {
        setCurrentView({ type: 'home' });
      }
    } catch (error) {
      console.error("Error al eliminar lista:", error);
    }
  };

  return (
    <div className={`app-container ${isDarkMode ? 'dark-theme' : ''}`}>
      <div className="main-layout">
        <Sidebar
          onSearchClick={handleSearchClick}
          onLoginClick={() => setIsLoginOpen(true)}
          currentView={currentView}
          onViewChange={setCurrentView}
          onUploadClick={handleOpenUpload}
          onCreatePlaylist={handleCreatePlaylist}
          onDeletePlaylist={handleDeletePlaylist}
          playlists={playlists}
        />
        <div className="content-area">
          <Header
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            inputRef={searchInputRef}
            onLoginClick={() => setIsLoginOpen(true)}
            onLogout={handleLogout}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
          />
          <main className="scrollable-content">
            <Home
              setCurrentTrack={setCurrentTrack}
              setIsPlaying={setIsPlaying}
              setQueue={setQueue}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              searchQuery={searchQuery}
              currentView={currentView}
              onViewChange={setCurrentView}
              onUploadClick={handleOpenUpload}
              onEditClick={handleOpenEdit}
              playlists={playlists}
              onCreatePlaylist={handleCreatePlaylist}
              onDeletePlaylist={handleDeletePlaylist}
            />
          </main>
        </div>
      </div>
      <Player
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        setCurrentTrack={setCurrentTrack}
        queue={queue}
        isShuffle={isShuffle}
        setIsShuffle={setIsShuffle}
        repeatMode={repeatMode}
        setRepeatMode={setRepeatMode}
      />
      <React.Suspense fallback={null}>
        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        <UploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onUploadSuccess={() => { }}
          editingSong={editingSong}
        />
        <PlaylistModal
          isOpen={isPlaylistModalOpen}
          onClose={() => setIsPlaylistModalOpen(false)}
          onCreate={handleCreatePlaylist}
        />
      </React.Suspense>
    </div>
  );
}

export default App;
