import React, { useState } from 'react';
import { X, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            onClose();
        } catch (error) {
            alert('Error al iniciar sesión: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="login-modal glass">
                <div className="modal-header">
                    <div className="icon-circle">
                        <Lock size={24} color="white" />
                    </div>
                    <h2>Modo Administrador</h2>
                    <p className="modal-subtitle">Inicia sesión para editar tu biblioteca</p>
                    <button className="close-btn clickable" onClick={onClose}><X /></button>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <input
                        type="email"
                        placeholder="Email de administrador"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="text-input"
                        required
                    />

                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="text-input"
                        required
                    />

                    <button
                        type="submit"
                        className={`submit-btn clickable ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Iniciando sesión...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;
