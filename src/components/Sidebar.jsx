import React, { useState, useEffect } from 'react';
import { Home, Search, Library, Plus, Heart, User, LogOut, Music, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { subscribeToSongs } from '../services/songService';
import { createPlaylist, subscribeToPlaylists } from '../services/playlistService';
import './Sidebar.css';

const Sidebar = ({ onSearchClick, onLoginClick, currentView, onViewChange, onUploadClick, onCreatePlaylist, onDeletePlaylist, playlists = [] }) => {
    const { user, logout, isAdmin } = useAuth();
    const [likedCount, setLikedCount] = useState(0);

    useEffect(() => {
        const unsubscribeSongs = subscribeToSongs((songs) => {
            if (user) {
                const count = songs.filter(song => song.likedBy?.includes(user?.uid)).length;
                setLikedCount(count);
            } else {
                setLikedCount(0);
            }
        });

        return () => {
            unsubscribeSongs();
        };
    }, [user]);

    const handleCreatePlaylist = async () => {
        if (onCreatePlaylist) onCreatePlaylist();
    };

    return (
        <aside className="sidebar">
            <div className="nav-card glass">
                <div
                    className={`nav-item clickable ${currentView.type === 'home' ? 'active' : ''}`}
                    onClick={() => onViewChange({ type: 'home' })}
                >
                    <Home size={24} />
                    <span>Inicio</span>
                </div>
                <div className="nav-item clickable" onClick={onSearchClick}>
                    <Search size={24} />
                    <span>Buscar</span>
                </div>
                {/* Mobile-only Library item */}
                <div
                    className={`nav-item clickable mobile-only ${currentView.type === 'library' || currentView.type === 'liked' || currentView.type === 'playlist' ? 'active' : ''}`}
                    onClick={() => onViewChange({ type: 'library' })}
                >
                    <Library size={24} />
                    <span>Tu biblioteca</span>
                </div>
                {isAdmin && (
                    <div className="nav-item clickable" onClick={onUploadClick}>
                        <Music size={24} />
                        <span>Subir Música</span>
                    </div>
                )}
            </div>

            <div className="library-card glass">
                <div className="library-header">
                    <div className="library-title clickable" onClick={() => onViewChange({ type: 'home' })}>
                        <Library size={24} />
                        <span>Tu biblioteca</span>
                    </div>
                    <button className="add-btn clickable" onClick={handleCreatePlaylist} title="Crear lista">
                        <Plus size={20} />
                    </button>
                </div>

                <div className="library-content">
                    <div
                        className={`playlist-item clickable ${currentView.type === 'liked' ? 'active' : ''}`}
                        onClick={() => onViewChange({ type: 'liked' })}
                    >
                        <div className="playlist-icon heart">
                            <Heart size={20} fill="white" />
                        </div>
                        <div className="playlist-info">
                            <p className="playlist-name">Canciones que te gustan</p>
                            <p className="playlist-type">Playlist • {likedCount} canciones</p>
                        </div>
                    </div>

                    {playlists.map(playlist => (
                        <div
                            key={playlist.id}
                            className={`playlist-item clickable ${currentView.type === 'playlist' && currentView.id === playlist.id ? 'active' : ''}`}
                            onClick={() => onViewChange({ type: 'playlist', id: playlist.id, name: playlist.name, songIds: playlist.songIds })}
                        >
                            <div className="playlist-icon">
                                <Music size={20} color="var(--text-muted)" />
                            </div>
                            <div className="playlist-info">
                                <p className="playlist-name">{playlist.name}</p>
                                <p className="playlist-type">Playlist • {playlist.songIds?.length || 0} canciones</p>
                            </div>
                            <button
                                className="delete-playlist-btn clickable"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeletePlaylist(playlist.id);
                                }}
                                title="Eliminar lista"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="admin-section">
                    {user ? (
                        <div className="user-profile clickable" onClick={logout}>
                            <div className="profile-icon">
                                <LogOut size={16} color="white" />
                            </div>
                            <div className="profile-info">
                                <p className="user-name">{isAdmin ? 'Administrador' : 'Mi Cuenta'}</p>
                                <p className="logout-text">Cerrar sesión</p>
                            </div>
                        </div>
                    ) : (
                        <button className="login-trigger-btn clickable" onClick={onLoginClick}>
                            <User size={20} />
                            <span>Entrar / Registrarse</span>
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
