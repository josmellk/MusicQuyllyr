import { ChevronLeft, ChevronRight, User, Search } from 'lucide-react';
import './Header.css';

const Header = ({ searchQuery, setSearchQuery, inputRef }) => {
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
                <button className="upgrade-btn clickable">Ver planes</button>
                <button className="profile-btn clickable">
                    <User size={20} />
                    <span>Usuario</span>
                </button>
            </div>
        </header>
    );
};

export default Header;
