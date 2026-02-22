import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Player from './components/Player';
import Home from './pages/Home';
import './App.css';

function App() {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = React.useRef(null);

  const handleSearchClick = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <div className="app-container">
      <div className="main-layout">
        <Sidebar onSearchClick={handleSearchClick} />
        <div className="content-area">
          <Header
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            inputRef={searchInputRef}
          />
          <main className="scrollable-content">
            <Home
              setCurrentTrack={setCurrentTrack}
              setIsPlaying={setIsPlaying}
              searchQuery={searchQuery}
            />
          </main>
        </div>
      </div>
      <Player currentTrack={currentTrack} isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
    </div>
  );
}

export default App;
