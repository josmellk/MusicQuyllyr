import { collection, addDoc, query, where, orderBy, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

export const subscribeToPlaylists = (userId, callback) => {
    if (!userId) return () => { };

    const q = query(
        collection(db, "playlists"),
        where("ownerId", "==", userId)
    );

    return onSnapshot(q, (snapshot) => {
        const playlists = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        callback(playlists);
    }, (error) => {
        console.error("Error subscribing to playlists:", error);
    });
};

export const createPlaylist = async (userId, name = "Mi lista") => {
    try {
        const docRef = await addDoc(collection(db, "playlists"), {
            name: name,
            ownerId: userId,
            songIds: [],
            createdAt: new Date(),
        });
        return { id: docRef.id, name, songIds: [], ownerId: userId };
    } catch (error) {
        console.error("Error creating playlist:", error);
        throw error;
    }
};

export const addSongToPlaylist = async (playlistId, songId) => {
    try {
        const docRef = doc(db, "playlists", playlistId);
        await updateDoc(docRef, {
            songIds: arrayUnion(songId)
        });
    } catch (error) {
        console.error("Error adding song to playlist:", error);
        throw error;
    }
};

export const removeSongFromPlaylist = async (playlistId, songId) => {
    try {
        const docRef = doc(db, "playlists", playlistId);
        await updateDoc(docRef, {
            songIds: arrayRemove(songId)
        });
    } catch (error) {
        console.error("Error removing song from playlist:", error);
        throw error;
    }
};

export const deletePlaylist = async (playlistId) => {
    try {
        await deleteDoc(doc(db, "playlists", playlistId));
    } catch (error) {
        console.error("Error deleting playlist:", error);
        throw error;
    }
};
