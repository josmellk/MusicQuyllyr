import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Player from './components/Player';
import Home from './pages/Home';
import LoginModal from './components/LoginModal';
import UploadModal from './components/UploadModal';
import { useAuth } from './context/AuthContext';
import { subscribeToPlaylists, createPlaylist, deletePlaylist } from './services/playlistService';
import PlaylistModal from './components/PlaylistModal';
import './App.css';

function App() {
  const { user } = useAuth();
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

  useEffect(() => {
    const unsubscribe = user ? subscribeToPlaylists(user.uid, (data) => {
      setPlaylists(data);
      // Update currentView if it's a playlist to reflect title/content changes
      if (currentView.type === 'playlist') {
        const currentPlaylist = data.find(p => p.id === currentView.id);
        if (currentPlaylist) {
          setCurrentView(prev => ({ ...prev, name: currentPlaylist.name, songIds: currentPlaylist.songIds }));
        }
      }
    }) : () => {
      setPlaylists([]);
    };
    return () => unsubscribe();
  }, [user, currentView.id]);

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
        />
        <div className="content-area">
          <Header
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            inputRef={searchInputRef}
            onLoginClick={() => setIsLoginOpen(true)}
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
    </div>
  );
}

export default App;
