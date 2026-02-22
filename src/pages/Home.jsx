import React, { useEffect, useState } from 'react';
import SongCard from '../components/SongCard';
import UploadModal from '../components/UploadModal';
import { subscribeToSongs } from '../services/songService';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = ({ setCurrentTrack, setIsPlaying, searchQuery }) => {
    const { user, isAdmin } = useAuth();
    const [songs, setSongs] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSong, setEditingSong] = useState(null);
    const [loading, setLoading] = useState(true);

    const filteredSongs = songs.filter(song =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        setLoading(true);
        const unsubscribe = subscribeToSongs((data) => {
            setSongs(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const loadSongs = () => {
        // Esta función se mantiene para compatibilidad con UploadModal (onUploadSuccess)
        // pero la actualización ya ocurre en tiempo real vía onSnapshot.
    };

    const handleOpenUpload = () => {
        setEditingSong(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (song) => {
        setEditingSong(song);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSong(null);
    };

    return (
        <div className="home-content">
            <div className="home-header-row">
                <h1 className="greeting">Mis canciones</h1>
                {isAdmin && (
                    <button className="upload-btn-inline glass clickable" onClick={handleOpenUpload}>
                        Subir nueva
                    </button>
                )}
            </div>

            <section className="section">
                <div className="section-header">
                    <h2>Recientes</h2>
                </div>

                {loading ? (
                    <div className="loading-container">Cargando biblioteca...</div>
                ) : filteredSongs.length === 0 ? (
                    <div className="empty-state">
                        <p>{searchQuery ? `No se encontraron resultados para "${searchQuery}"` : "Aún no has subido ninguna canción."}</p>
                        {!searchQuery && user && (
                            <button className="create-btn glass clickable" onClick={handleOpenUpload}>
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
                                onClick={() => {
                                    setCurrentTrack(song);
                                    setIsPlaying(true);
                                }}
                                onEdit={handleOpenEdit}
                            />
                        ))}
                    </div>
                )}
            </section>

            <UploadModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onUploadSuccess={loadSongs}
                editingSong={editingSong}
            />
        </div>
    );
};

export default Home;
