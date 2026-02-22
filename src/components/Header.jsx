import { ChevronLeft, ChevronRight, User, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = ({ searchQuery, setSearchQuery, inputRef, onLoginClick }) => {
    const { user, logout, isAdmin } = useAuth();

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

            <div className="user-controls">
                <button
                    className="profile-btn clickable"
                    onClick={user ? logout : onLoginClick}
                    title={user ? 'Cerrar sesión' : 'Iniciar sesión'}
                >
                    <User size={20} />
                    <span>{user ? (isAdmin ? 'Admin' : 'Mi Cuenta') : 'Entrar'}</span>
                </button>
            </div>
        </header>
    );
};

export default Header;
