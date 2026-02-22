import React from 'react';
import { Play, Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './SongCard.css';

const SongCard = ({ song, onClick, onEdit }) => {
    const { user } = useAuth();

    return (
        <div className="song-card clickable" onClick={onClick}>
            <div className="card-image-container">
                <img src={song.coverUrl} alt={song.title} className="card-image" />
                <div className="card-overlay">
                    <button className="play-button glass">
                        <Play fill="black" color="black" size={24} />
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
