import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, Maximize2, Mic2, ListMusic } from 'lucide-react';
import './Player.css';

const Player = ({ currentTrack, isPlaying, setIsPlaying, setCurrentTrack, queue = [], isShuffle, setIsShuffle, repeatMode, setRepeatMode }) => {
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

            // Reiniciar el audio para la nueva pista
            audioRef.current.pause();
            audioRef.current.src = finalUrl;
            audioRef.current.load(); // Forzar carga del nuevo recurso

            if (isPlaying) {
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(err => {
                        console.error("Auto-play blocked or error:", err);
                        setIsPlaying(false);
                    });
                }
            }
        }
    }, [currentTrack]);

    useEffect(() => {
        if (!currentTrack?.audioUrl) return;

        if (isPlaying) {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    console.error("Manual play error:", err);
                    setIsPlaying(false);
                });
            }
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying]);

    const handleNext = () => {
        if (queue.length === 0) return;

        let nextIndex;
        const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);

        if (isShuffle) {
            nextIndex = Math.floor(Math.random() * queue.length);
            // Evitar que se repita la misma canción si hay más de una
            if (nextIndex === currentIndex && queue.length > 1) {
                nextIndex = (nextIndex + 1) % queue.length;
            }
        } else {
            nextIndex = currentIndex + 1;
            if (nextIndex >= queue.length) {
                if (repeatMode === 2) { // Repeat All
                    nextIndex = 0;
                } else {
                    return setIsPlaying(false);
                }
            }
        }

        const nextTrack = queue[nextIndex];
        if (nextTrack.id === currentTrack?.id) {
            // Si es la misma canción (ej. lista de 1), reiniciar manualmente
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
        const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);

        if (isShuffle) {
            prevIndex = Math.floor(Math.random() * queue.length);
        } else {
            prevIndex = currentIndex - 1;
            if (prevIndex < 0) {
                prevIndex = repeatMode === 2 ? queue.length - 1 : 0;
            }
        }

        const prevTrack = queue[prevIndex];
        if (prevTrack.id === currentTrack?.id) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => setIsPlaying(false));
            setIsPlaying(true);
        } else {
            setCurrentTrack(prevTrack);
            setIsPlaying(true);
        }
    };

    useEffect(() => {
        const audio = audioRef.current;

        // Sincronizar loop nativo para modo "Repetir una" (Modo 1 ahora)
        audio.loop = (repeatMode === 1);

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

        const handleEnded = () => {
            if (repeatMode === 1) { // Repetir Una
                audio.currentTime = 0;
                audio.play().catch(console.error);
            } else {
                handleNext();
            }
        };

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('error', handleError);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [queue, currentTrack, isShuffle, repeatMode]);

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
            // Si no hay canción pero hay cola, empezar reproducción
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
