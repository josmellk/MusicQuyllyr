import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, Maximize2, Mic2, ListMusic } from 'lucide-react';
import './Player.css';

const Player = ({ currentTrack, isPlaying, setIsPlaying, setCurrentTrack, queue = [], isShuffle, setIsShuffle, repeatMode, setRepeatMode }) => {
    const [volume, setVolume] = useState(0.5);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const audioRef = useRef(new Audio());

    const cleanUrl = (url) => {
        if (!url) return '';
        // Dropbox: Force direct download subdomain for instant streaming
        if (url.includes('dropbox.com')) {
            return url
                .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
                .replace('?dl=0', '')
                .replace('?dl=1', '')
                .replace('?raw=1', '');
        }
        // Google Drive: Convert view link to direct export link
        if (url.includes('drive.google.com')) {
            const match = url.match(/\/d\/(.+?)\/(view|edit|sharing)/) || url.match(/id=(.+?)(&|$)/);
            if (match && match[1]) {
                return `https://drive.google.com/uc?id=${match[1]}`;
            }
        }
        // GitHub: Convert blob link to raw link
        if (url.includes('github.com') && url.includes('/blob/')) {
            return url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
        }
        return url;
    };

    // Use refs for stable event listeners without re-binding
    const stateRef = useRef({ queue, currentTrack, isShuffle, repeatMode, isPlaying });
    useEffect(() => {
        stateRef.current = { queue, currentTrack, isShuffle, repeatMode, isPlaying };
    }, [queue, currentTrack, isShuffle, repeatMode, isPlaying]);

    useEffect(() => {
        const audio = audioRef.current;
        audio.preload = 'auto';
        audio.crossOrigin = 'anonymous';

        const handleEnded = () => {
            if (stateRef.current.repeatMode === 1) {
                audio.currentTime = 0;
                audio.play().catch(console.error);
            } else {
                handleNext();
            }
        };

        const updateProgress = () => {
            if (!audio.duration) return;
            setCurrentTime(audio.currentTime);
            setProgress((audio.currentTime / audio.duration) * 100);
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const handleError = (e) => {
            console.error("Audio error:", audio.error);
            setIsPlaying(false);
        };

        const handleLoadStart = () => setIsLoading(true);
        const handleCanPlay = () => setIsLoading(false);
        const handleWaiting = () => setIsLoading(true);

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('error', handleError);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('loadstart', handleLoadStart);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('waiting', handleWaiting);

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('loadstart', handleLoadStart);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('waiting', handleWaiting);
        };
    }, []);

    // TURBO: Fast track loading and playback logic
    useEffect(() => {
        if (!currentTrack) return;

        const finalUrl = cleanUrl(currentTrack.audioUrl);
        const audio = audioRef.current;

        if (audio.dataset.rawSrc !== finalUrl) {
            audio.pause();
            audio.src = finalUrl;
            audio.dataset.rawSrc = finalUrl;
        }

        if (isPlaying) {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    if (err.name !== 'AbortError') {
                        setIsPlaying(false);
                    }
                });
            }
        } else {
            audio.pause();
        }
    }, [currentTrack, isPlaying]);

    const handleNext = () => {
        if (queue.length === 0) return;

        let nextIndex;
        const state = stateRef.current;
        const currentIndex = queue.findIndex(t => t.id === state.currentTrack?.id);

        if (state.isShuffle) {
            nextIndex = Math.floor(Math.random() * queue.length);
            if (nextIndex === currentIndex && queue.length > 1) {
                nextIndex = (nextIndex + 1) % queue.length;
            }
        } else {
            nextIndex = currentIndex + 1;
            if (nextIndex >= queue.length) {
                if (state.repeatMode === 2) {
                    nextIndex = 0;
                } else {
                    return setIsPlaying(false);
                }
            }
        }

        const nextTrack = queue[nextIndex];
        if (nextTrack.id === state.currentTrack?.id) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => setIsPlaying(false));
            setIsPlaying(true);
        } else {
            setCurrentTrack(nextTrack);
            setIsPlaying(true);
        }
    };

    const handlePrev = () => {
        if (queue.length === 0) return;

        let prevIndex;
        const state = stateRef.current;
        const currentIndex = queue.findIndex(t => t.id === state.currentTrack?.id);

        if (state.isShuffle) {
            prevIndex = Math.floor(Math.random() * queue.length);
        } else {
            prevIndex = currentIndex - 1;
            if (prevIndex < 0) {
                prevIndex = state.repeatMode === 2 ? queue.length - 1 : 0;
            }
        }

        const prevTrack = queue[prevIndex];
        if (prevTrack.id === state.currentTrack?.id) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => setIsPlaying(false));
            setIsPlaying(true);
        } else {
            setCurrentTrack(prevTrack);
            setIsPlaying(true);
        }
    };

    useEffect(() => {
        audioRef.current.loop = (repeatMode === 1);
    }, [repeatMode]);

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        audioRef.current.volume = newVolume;
    };

    const handleProgressChange = (e) => {
        const newProgress = parseFloat(e.target.value);
        const newTime = (newProgress / 100) * audioRef.current.duration;
        audioRef.current.currentTime = newTime;
        setProgress(newProgress);
    };

    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const togglePlay = () => {
        if (!currentTrack && queue.length > 0) {
            const startIndex = isShuffle ? Math.floor(Math.random() * queue.length) : 0;
            setCurrentTrack(queue[startIndex]);
            setIsPlaying(true);
        } else if (currentTrack) {
            setIsPlaying(!isPlaying);
        }
    };

    const toggleRepeat = () => {
        setRepeatMode((repeatMode + 1) % 3);
    };

    const getRepeatTitle = () => {
        if (repeatMode === 0) return "Repetición: Desactivada";
        if (repeatMode === 1) return "Repetición: Una";
        return "Repetición: Todas";
    };

    return (
        <footer className="player-bar">
            <div className="track-info">
                {currentTrack ? (
                    <>
                        <img src={currentTrack.coverUrl} alt={currentTrack.title} className={`now-playing-cover ${isLoading ? 'loading-pulse' : ''}`} />
                        <div className="track-details">
                            <p className="track-title text-truncate clickable">
                                {isLoading ? "Cargando..." : currentTrack.title}
                            </p>
                            <p className="track-artist text-truncate clickable">{currentTrack.artist}</p>
                        </div>
                    </>
                ) : (
                    <div className="no-track">Selecciona una canción</div>
                )}
            </div>

            <div className="playback-controls">
                <div className="control-buttons">
                    <Shuffle
                        size={16}
                        className={`control-icon secondary ${isShuffle ? 'active' : ''}`}
                        onClick={() => setIsShuffle(!isShuffle)}
                        title={isShuffle ? "Desactivar aleatorio" : "Activar aleatorio"}
                    />
                    <SkipBack size={20} className="control-icon" onClick={handlePrev} />
                    <button className="play-pause-btn clickable" onClick={togglePlay}>
                        {isPlaying ? <Pause size={28} fill="black" strokeWidth={3} /> : <Play size={28} fill="black" />}
                    </button>
                    <SkipForward size={20} className="control-icon" onClick={handleNext} />
                    <div className="repeat-container" onClick={toggleRepeat} title={getRepeatTitle()}>
                        <Repeat
                            size={16}
                            className={`control-icon secondary ${repeatMode > 0 ? 'active' : ''}`}
                        />
                        {repeatMode === 1 && <span className="repeat-badge">1</span>}
                    </div>
                </div>

                <div className="progress-container">
                    <span className="time">{formatTime(currentTime)}</span>
                    <div className="progress-bar-wrapper">
                        <input
                            type="range"
                            className="progress-slider"
                            min="0"
                            max="100"
                            step="0.1"
                            value={isNaN(progress) ? 0 : progress}
                            onChange={handleProgressChange}
                        />
                        <div className="progress-bar-fill" style={{ width: `${isNaN(progress) ? 0 : progress}%` }}></div>
                    </div>
                    <span className="time">{formatTime(duration)}</span>
                </div>
            </div>

            <div className="volume-controls">
                <Mic2 size={16} className="control-icon secondary" />
                <ListMusic size={16} className="control-icon secondary" />
                <Volume2 size={20} className="control-icon" />
                <div className="volume-bar-wrapper">
                    <input
                        type="range"
                        className="volume-slider"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                    />
                    <div className="volume-bar-fill" style={{ width: `${volume * 100}%` }}></div>
                </div>
                <Maximize2 size={16} className="control-icon secondary" />
            </div>
        </footer>
    );
};

export default Player;
