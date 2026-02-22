import React, { useState } from 'react';
import { X, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isRegister) {
                await register(email, password);
            } else {
                await login(email, password);
            }
            onClose();
        } catch (error) {
            const action = isRegister ? 'registrarte' : 'iniciar sesión';
            alert(`Error al ${action}: ` + error.message);
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
                    <h2>{isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
                    <p className="modal-subtitle">
                        {isRegister
                            ? 'Regístrate para guardar tus canciones favoritas'
                            : 'Inicia sesión para acceder a tu biblioteca'}
                    </p>
                    <button className="close-btn clickable" onClick={onClose}><X /></button>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <input
                        type="email"
                        placeholder="Email"
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
                        {loading
                            ? (isRegister ? 'Creando cuenta...' : 'Iniciando sesión...')
                            : (isRegister ? 'Registrarse' : 'Entrar')}
                    </button>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="toggle-auth-btn clickable"
                            onClick={() => setIsRegister(!isRegister)}
                        >
                            {isRegister
                                ? '¿Ya tienes cuenta? Inicia sesión'
                                : '¿No tienes cuenta? Regístrate'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;
