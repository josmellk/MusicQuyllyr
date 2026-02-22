import React, { useState, useRef, useEffect } from 'react';
import { Play, Edit2, Heart, Plus, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toggleLike } from '../services/songService';
import { addSongToPlaylist, removeSongFromPlaylist } from '../services/playlistService';
import './SongCard.css';

const SongCard = ({ song, onClick, onEdit, playlists = [], isCurrent = false, isPlaying = false }) => {
    const { user, isAdmin } = useAuth();
    const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
    const [addingTo, setAddingTo] = useState(null); // Feedback for adding action
    const menuRef = useRef(null);
    const isLiked = song.likedBy?.includes(user?.uid);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowPlaylistMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLikeClick = (e) => {
        e.stopPropagation();
        if (!user) return alert('Debes iniciar sesión para guardar canciones');
        setShowPlaylistMenu(!showPlaylistMenu);
    };

    const handleToggleFavorite = async (e) => {
        e.stopPropagation();
        try {
            await toggleLike(song.id, user.uid, isLiked);
        } catch (error) {
            console.error("Error al actualizar favorito:", error);
        }
    };

    const handleTogglePlaylist = async (e, playlist) => {
        e.stopPropagation();
        const isInPlaylist = playlist.songIds?.includes(song.id);
        setAddingTo(playlist.id); // Triggers loading/feedback
        try {
            if (isInPlaylist) {
                await removeSongFromPlaylist(playlist.id, song.id);
            } else {
                await addSongToPlaylist(playlist.id, song.id);
            }
        } catch (error) {
            console.error("Error al actualizar lista:", error);
        } finally {
            setTimeout(() => setAddingTo(null), 1000); // Clear feedback after animation
        }
    };

    return (
        <div className={`song-card clickable ${isCurrent ? 'playing' : ''}`} onClick={onClick}>
            <div className="card-image-container">
                <img src={song.coverUrl} alt={song.title} className="card-image" />

                {isCurrent && (
                    <div className="playing-overlay glass">
                        <div className={`playing-animation ${isPlaying ? 'active' : ''}`}>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                )}

                <div className="card-overlay">
                    <button className="play-button glass">
                        <Play fill="black" color="black" size={24} />
                    </button>

                    <button
                        className={`like-button glass ${isLiked ? 'liked' : ''}`}
                        onClick={handleLikeClick}
                        title="Agregar a lista"
                    >
                        <Heart size={20} fill={isLiked ? "var(--spotify-green)" : "none"} color={isLiked ? "var(--spotify-green)" : "white"} />
                    </button>

                    {showPlaylistMenu && (
                        <div className="playlist-menu glass show" ref={menuRef} onClick={e => e.stopPropagation()}>
                            <div className="menu-header">Agregar a...</div>
                            <div className="menu-item" onClick={handleToggleFavorite}>
                                <div className="item-info">
                                    <Heart size={16} fill={isLiked ? "var(--color-accent)" : "none"} color={isLiked ? "var(--color-accent)" : "white"} />
                                    <span>Mis Favoritos</span>
                                </div>
                                {isLiked && <Check size={16} color="var(--color-accent)" />}
                            </div>
                            <div className="menu-divider"></div>
                            {playlists.length === 0 && (
                                <div className="menu-empty">No tienes listas creadas</div>
                            )}
                            {playlists.map(playlist => {
                                const isInPlaylist = playlist.songIds?.includes(song.id);
                                const isUpdating = addingTo === playlist.id;
                                return (
                                    <div key={playlist.id} className="menu-item" onClick={(e) => handleTogglePlaylist(e, playlist)}>
                                        <div className="item-info">
                                            {isUpdating ? (
                                                <div className="menu-spinner"></div>
                                            ) : (
                                                <Plus size={16} color={isInPlaylist ? "var(--color-accent)" : "white"} />
                                            )}
                                            <span className={isInPlaylist ? 'active' : ''}>{playlist.name}</span>
                                        </div>
                                        {isInPlaylist && <Check size={16} color="var(--color-accent)" />}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {isAdmin && (
                        <button
                            className="edit-button glass"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(song);
                            }}
                        >
                            <Edit2 size={16} color="white" />
                        </button>
                    )}
                </div>
            </div>
            <h3 className="card-title text-truncate">{song.title}</h3>
            <p className="card-artist text-truncate">{song.artist}</p>
        </div>
    );
};

export default SongCard;
