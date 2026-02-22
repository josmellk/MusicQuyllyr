import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Heart, Music, Trash2 } from 'lucide-react';
import SongCard from '../components/SongCard';
import { subscribeToSongs } from '../services/songService';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = ({ setCurrentTrack, setIsPlaying, setQueue, currentTrack, isPlaying, searchQuery, currentView, onViewChange, onUploadClick, onEditClick, playlists = [], onCreatePlaylist, onDeletePlaylist }) => {
    const { user, isAdmin } = useAuth();
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);

    const filteredSongs = useMemo(() => {
        return songs.filter(song => {
            const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                song.artist.toLowerCase().includes(searchQuery.toLowerCase());

            if (currentView.type === 'liked') {
                return matchesSearch && song.likedBy?.includes(user?.uid);
            }

            if (currentView.type === 'playlist') {
                return matchesSearch && currentView.songIds?.includes(song.id);
            }

            return matchesSearch;
        });
    }, [songs, searchQuery, currentView, user?.uid]);

    useEffect(() => {
        setLoading(true);
        const unsubscribe = subscribeToSongs((data) => {
            setSongs(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Keep queue in sync with current view/search
    useEffect(() => {
        setQueue(filteredSongs);
    }, [filteredSongs, setQueue]);

    const getTitle = () => {
        if (currentView.type === 'liked') return 'Canciones que te gustan';
        if (currentView.type === 'playlist') return currentView.name || 'Mi lista';
        if (currentView.type === 'library') return 'Tu biblioteca';
        return 'Mis canciones';
    };

    if (currentView.type === 'library') {
        return (
            <div className="home-content">
                <div className="home-header-row">
                    <h1 className="greeting">{getTitle()}</h1>
                    <button className="upload-btn-inline glass clickable" onClick={() => onCreatePlaylist()}>
                        <Plus size={20} /> Nueva lista
                    </button>
                </div>

                <div className="library-grid mobile-library">
                    <div
                        className="library-item-card glass clickable"
                        onClick={() => onViewChange({ type: 'liked' })}
                    >
                        <div className="playlist-icon heart">
                            <Heart size={32} fill="white" />
                        </div>
                        <h3>Favoritos</h3>
                        <p>Playlist • {songs.filter(s => s.likedBy?.includes(user?.uid)).length} canciones</p>
                    </div>

                    {playlists.map(playlist => (
                        <div
                            key={playlist.id}
                            className="library-item-card glass clickable"
                            onClick={() => onViewChange({ type: 'playlist', id: playlist.id, name: playlist.name, songIds: playlist.songIds })}
                        >
                            <div className="playlist-icon">
                                <Music size={32} />
                            </div>
                            <h3>{playlist.name}</h3>
                            <p>Playlist • {playlist.songIds?.length || 0} canciones</p>
                            <button
                                className="delete-library-btn clickable"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeletePlaylist(playlist.id);
                                }}
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="home-content">
            <div className="home-header-row">
                <h1 className="greeting">{getTitle()}</h1>
                {isAdmin && (
                    <button className="upload-btn-inline glass clickable" onClick={onUploadClick}>
                        Subir nueva
                    </button>
                )}
            </div>

            <section className="section">
                <div className="section-header">
                    <h2>{currentView.type === 'home' ? 'Recientes' : 'Contenido'}</h2>
                </div>

                {loading ? (
                    <div className="loading-container">Cargando biblioteca...</div>
                ) : filteredSongs.length === 0 ? (
                    <div className="empty-state">
                        <p>{searchQuery ? `No se encontraron resultados para "${searchQuery}"` : "Aún no has subido ninguna canción."}</p>
                        {!searchQuery && user && isAdmin && (
                            <button className="create-btn glass clickable" onClick={onUploadClick}>
                                Subir mi primera canción
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="song-grid">
                        {filteredSongs.map(song => (
                            <SongCard
                                key={song.id}
                                song={song}
                                playlists={playlists}
                                isCurrent={currentTrack?.id === song.id}
                                isPlaying={isPlaying}
                                onClick={() => {
                                    if (currentTrack?.id === song.id) {
                                        setIsPlaying(!isPlaying);
                                    } else {
                                        setQueue(filteredSongs);
                                        setCurrentTrack(song);
                                        setIsPlaying(true);
                                    }
                                }}
                                onEdit={onEditClick}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;
