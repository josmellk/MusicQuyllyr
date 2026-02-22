import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, User, Search, LogOut, Moon, Sun, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = ({ searchQuery, setSearchQuery, inputRef, onLoginClick, isDarkMode, setIsDarkMode }) => {
    const { user, logout, isAdmin } = useAuth();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setShowProfileMenu(false);
        await logout();
    };

    return (
        <header className="header">
            <div className="nav-controls">
                <button className="nav-btn clickable">
                    <ChevronLeft size={24} />
                </button>
                <button className="nav-btn clickable">
                    <ChevronRight size={24} />
                </button>
            </div>

            <div className="search-container">
                <div className="search-bar glass">
                    <Search size={20} className="search-icon" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="¿Qué quieres escuchar?"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="user-controls" ref={menuRef}>
                {user ? (
                    <div className="profile-container">
                        <button
                            className={`profile-btn clickable ${showProfileMenu ? 'active' : ''}`}
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                        >
                            <div className="profile-avatar">
                                <User size={18} />
                            </div>
                            <span>{isAdmin ? 'Administrador' : (user.displayName || user.email?.split('@')[0] || 'Mi Cuenta')}</span>
                            <ChevronDown size={16} className={`arrow-icon ${showProfileMenu ? 'rotate' : ''}`} />
                        </button>

                        {showProfileMenu && (
                            <div className="profile-dropdown glass show">
                                <div className="dropdown-header">
                                    <p className="user-email">{user.email}</p>
                                </div>
                                <div className="dropdown-divider"></div>
                                <div className="dropdown-item" onClick={() => setIsDarkMode(!isDarkMode)}>
                                    <div className="item-content">
                                        {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
                                        <span>Modo Oscuro</span>
                                    </div>
                                    <div className={`toggle-switch ${isDarkMode ? 'on' : ''}`}>
                                        <div className="toggle-knob"></div>
                                    </div>
                                </div>
                                <div className="dropdown-divider"></div>
                                <div className="dropdown-item logout" onClick={handleLogout}>
                                    <LogOut size={16} />
                                    <span>Cerrar sesión</span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <button className="login-btn glass clickable" onClick={onLoginClick}>
                        Entrar
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;
