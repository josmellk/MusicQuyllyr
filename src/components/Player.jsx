import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, Maximize2, Mic2, ListMusic } from 'lucide-react';
import './Player.css';

const Player = ({ currentTrack, isPlaying, setIsPlaying }) => {
    const [volume, setVolume] = useState(0.5);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const audioRef = useRef(new Audio());

    const cleanUrl = (url) => {
        if (!url) return '';
        // Dropbox: Replace dl=0 with raw=1
        if (url.includes('dropbox.com')) {
            return url.replace('dl=0', 'raw=1').replace('dl=1', 'raw=1');
        }
        // Google Drive: Convert view link to direct export link
        if (url.includes('drive.google.com')) {
            const match = url.match(/\/d\/(.+?)\/(view|edit|sharing)/) || url.match(/id=(.+?)(&|$)/);
            if (match && match[1]) {
                // Try a cleaner direct access format
                return `https://docs.google.com/uc?id=${match[1]}`;
            }
        }
        // GitHub: Convert blob link to raw link
        if (url.includes('github.com') && url.includes('/blob/')) {
            return url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
        }
        return url;
    };

    useEffect(() => {
        if (currentTrack) {
            const finalUrl = cleanUrl(currentTrack.audioUrl);
            console.log("Cargando audio desde:", finalUrl);
            audioRef.current.src = finalUrl;
            if (isPlaying) {
                audioRef.current.play().catch(err => console.error("Auto-play error:", err));
            }
        }
    }, [currentTrack]);

    useEffect(() => {
        if (isPlaying) {
            audioRef.current.play().catch(err => console.error("Error playing:", err));
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying]);

    useEffect(() => {
        const audio = audioRef.current;

        const updateProgress = () => {
            setCurrentTime(audio.currentTime);
            setProgress((audio.currentTime / audio.duration) * 100);
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const handleError = (e) => {
            console.error("Audio error:", audio.error);
            if (audio.error && audio.error.code === 4) {
                alert("Error de Formato: No se pudo leer el archivo. \n\nEsto ocurre porque el enlace no es Directo. \n\nTip: Si usas Google Drive, el archivo debe ser pequeño (< 10MB). Si es grande, el navegador bloquea la música por seguridad.");
            }
            setIsPlaying(false);
        };

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('error', handleError);
        audio.addEventListener('ended', () => setIsPlaying(false));

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('error', handleError);
        };
    }, []);

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

    const togglePlay = () => setIsPlaying(!isPlaying);

    return (
        <footer className="player-bar">
            <div className="track-info">
                {currentTrack ? (
                    <>
                        <img src={currentTrack.coverUrl} alt={currentTrack.title} className="now-playing-cover" />
                        <div className="track-details">
                            <p className="track-title text-truncate clickable">{currentTrack.title}</p>
                            <p className="track-artist text-truncate clickable">{currentTrack.artist}</p>
                        </div>
                    </>
                ) : (
                    <div className="no-track">Selecciona una canción</div>
                )}
            </div>

            <div className="playback-controls">
                <div className="control-buttons">
                    <Shuffle size={16} className="control-icon secondary" />
                    <SkipBack size={20} className="control-icon" />
                    <button className="play-pause-btn clickable" onClick={togglePlay}>
                        {isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" />}
                    </button>
                    <SkipForward size={20} className="control-icon" />
                    <Repeat size={16} className="control-icon secondary" />
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
