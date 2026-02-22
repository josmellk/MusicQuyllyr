import React, { useState } from 'react';
import { Play, Edit2, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toggleLike } from '../services/songService';
import './SongCard.css';

const SongCard = ({ song, onClick, onEdit }) => {
    const { user } = useAuth();
    const isLiked = song.likedBy?.includes(user?.uid);

    const handleLike = async (e) => {
        e.stopPropagation();
        if (!user) return alert('Debes iniciar sesión para marcar favoritos');

        try {
            await toggleLike(song.id, user.uid, isLiked);
            // Nota: El componente padre (Home) debería refrescar la lista para ver el cambio reflejado
            // Alternativa: Podríamos usar un estado local aquí para feedback instantáneo
        } catch (error) {
            console.error("Error al actualizar favorito:", error);
        }
    };

    return (
        <div className="song-card clickable" onClick={onClick}>
            <div className="card-image-container">
                <img src={song.coverUrl} alt={song.title} className="card-image" />
                <div className="card-overlay">
                    <button className="play-button glass">
                        <Play fill="black" color="black" size={24} />
                    </button>

                    <button
                        className={`like-button glass ${isLiked ? 'liked' : ''}`}
                        onClick={handleLike}
                    >
                        <Heart size={20} fill={isLiked ? "var(--spotify-green)" : "none"} color={isLiked ? "var(--spotify-green)" : "white"} />
                    </button>

                    {user && (
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
