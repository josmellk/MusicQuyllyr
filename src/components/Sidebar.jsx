import React, { useState, useEffect } from 'react';
import { Home, Search, Library, Plus, Heart, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { subscribeToSongs } from '../services/songService';
import LoginModal from './LoginModal';
import './Sidebar.css';

const Sidebar = ({ onSearchClick }) => {
    const { user, logout, isAdmin } = useAuth();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [likedCount, setLikedCount] = useState(0);

    useEffect(() => {
        const unsubscribe = subscribeToSongs((songs) => {
            const count = songs.filter(song => song.likedBy?.includes(user?.uid)).length;
            setLikedCount(count);
        });
        return () => unsubscribe();
    }, [user]);

    return (
        <aside className="sidebar">
            <div className="nav-card glass">
                <div className="nav-item active clickable">
                    <Home size={24} />
                    <span>Inicio</span>
                </div>
                <div className="nav-item clickable" onClick={onSearchClick}>
                    <Search size={24} />
                    <span>Buscar</span>
                </div>
            </div>

            <div className="library-card glass">
                <div className="library-header">
                    <div className="library-title clickable">
                        <Library size={24} />
                        <span>Tu biblioteca</span>
                    </div>
                    <button className="add-btn clickable">
                        <Plus size={20} />
                    </button>
                </div>

                <div className="library-content">
                    <div className="playlist-item clickable">
                        <div className="playlist-icon heart">
                            <Heart size={20} fill="white" />
                        </div>
                        <div className="playlist-info">
                            <p className="playlist-name">Canciones que te gustan</p>
                            <p className="playlist-type">Playlist • {likedCount} canciones</p>
                        </div>
                    </div>
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
                        <button className="login-trigger-btn clickable" onClick={() => setIsLoginOpen(true)}>
                            <User size={20} />
                            <span>Entrar / Registrarse</span>
                        </button>
                    )}
                </div>
            </div>

            <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        </aside>
    );
};

export default Sidebar;
