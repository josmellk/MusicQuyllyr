import React, { useState } from 'react';
import { X, Music, Image as ImageIcon } from 'lucide-react';
import { saveSongMetadata, updateSongMetadata, deleteSongMetadata } from '../services/songService';
import './UploadModal.css';

const UploadModal = ({ isOpen, onClose, onUploadSuccess, editingSong }) => {
    const [audioUrl, setAudioUrl] = useState('');
    const [coverUrl, setCoverUrl] = useState('');
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (editingSong) {
            setAudioUrl(editingSong.audioUrl || '');
            setCoverUrl(editingSong.coverUrl || '');
            setTitle(editingSong.title || '');
            setArtist(editingSong.artist || '');
        } else {
            setAudioUrl('');
            setCoverUrl('');
            setTitle('');
            setArtist('');
        }
    }, [editingSong, isOpen]);

    if (!isOpen) return null;

    const cleanUrl = (url) => {
        if (!url) return '';
        // Dropbox: Replace dl=0 with raw=1
        if (url.includes('dropbox.com')) {
            return url.replace('dl=0', 'raw=1').replace('dl=1', 'raw=1');
        }
        // Google Drive: Convert view link to direct export link
        if (url.includes('drive.google.com')) {
            const match = url.match(/\/d\/(.+?)\/(view|edit|sharing)/) || url.match(/id=(.+?)(&|$)/);
            if (match && match[1]) {
                return `https://drive.google.com/uc?export=download&id=${match[1]}`;
            }
        }
        // GitHub: Convert blob link to raw link
        if (url.includes('github.com') && url.includes('/blob/')) {
            return url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
        }
        return url;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!audioUrl || !title || !artist) return alert('Por favor completa los campos obligatorios (Título, Artista y URL de la canción)');

        try {
            const finalAudioUrl = cleanUrl(audioUrl);
            const finalCoverUrl = cleanUrl(coverUrl);

            if (editingSong) {
                await updateSongMetadata(editingSong.id, { title, artist, audioUrl: finalAudioUrl, coverUrl: finalCoverUrl });
            } else {
                await saveSongMetadata({ title, artist, audioUrl: finalAudioUrl, coverUrl: finalCoverUrl });
            }

            onUploadSuccess();
            onClose();
        } catch (error) {
            alert('Error al guardar la canción: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!editingSong) return;
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta canción?')) return;

        setLoading(true);
        try {
            await deleteSongMetadata(editingSong.id);
            onUploadSuccess();
            onClose();
        } catch (error) {
            alert('Error al eliminar la canción: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="upload-modal glass">
                <div className="modal-header">
                    <h2>{editingSong ? 'Editar canción' : 'Agregar nueva canción'}</h2>
                    <p className="modal-subtitle">
                        {editingSong ? 'Modifica los detalles de tu canción' : 'Puntea enlaces directos a tus archivos'}
                    </p>
                    <button className="close-btn clickable" onClick={onClose}><X /></button>
                </div>

                <form onSubmit={handleSubmit} className="upload-form">
                    <input
                        type="text"
                        placeholder="Título de la canción"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="text-input"
                    />

                    <input
                        type="text"
                        placeholder="Artista"
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                        className="text-input"
                    />

                    <div className="input-group-url">
                        <Music size={20} className="input-icon" />
                        <input
                            type="text"
                            placeholder="Enlace del archivo MP3 (URL)"
                            value={audioUrl}
                            onChange={(e) => setAudioUrl(e.target.value)}
                            className="text-input full-width"
                        />
                    </div>

                    <div className="input-group-url">
                        <ImageIcon size={20} className="input-icon" />
                        <input
                            type="text"
                            placeholder="Enlace de la carátula/imagen (Opcional)"
                            value={coverUrl}
                            onChange={(e) => setCoverUrl(e.target.value)}
                            className="text-input full-width"
                        />
                    </div>

                    <p className="help-text">
                        Tip: **Dropbox** es la opción más confiable. Sube tu archivo, copia el enlace y pégalo aquí. El sistema lo ajustará automáticamente.
                    </p>
                    <p className="help-text">
                        <strong>¿Qué es un enlace directo?</strong> Es un link que carga la canción de inmediato. Evita enlaces que lleven a páginas con anuncios o botones de descarga grandes.
                    </p>

                    <div className="examples-box">
                        <span>Opciones recomendadas:</span>
                        <ul>
                            <li><strong>Dropbox (Recomendado):</strong> Copia el link y pégalo. (Ej: <code>dropbox.com/.../musica.mp3?dl=0</code>)</li>
                            <li><strong>GitHub:</strong> Usa el link del botón "Raw" de tu repositorio.</li>
                            <li><strong>Discord:</strong> Sube el archivo a un canal y usa "Copiar enlace del archivo".</li>
                            <li><strong>Firebase:</strong> Si sabes usarlo, los enlaces de Firebase Storage son permanentes.</li>
                        </ul>
                    </div>

                    <div className="button-group">
                        <button
                            type="submit"
                            className={`submit-btn clickable ${loading ? 'loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? 'Guardando...' : (editingSong ? 'Actualizar' : 'Agregar a mi biblioteca')}
                        </button>

                        {editingSong && (
                            <button
                                type="button"
                                className="delete-btn clickable"
                                onClick={handleDelete}
                                disabled={loading}
                            >
                                {loading ? 'Eliminando...' : 'Eliminar canción'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadModal;
