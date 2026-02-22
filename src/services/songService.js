import { collection, addDoc, getDocs, query, orderBy, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export const saveSongMetadata = async (songData) => {
    try {
        const docRef = await addDoc(collection(db, "songs"), {
            title: songData.title,
            artist: songData.artist,
            audioUrl: songData.audioUrl,
            coverUrl: songData.coverUrl || "https://picsum.photos/seed/music/200",
            createdAt: new Date(),
        });

        return { id: docRef.id, ...songData };
    } catch (error) {
        console.error("Error saving song metadata:", error);
        throw error;
    }
};

export const updateSongMetadata = async (id, songData) => {
    try {
        const docRef = doc(db, "songs", id);
        await updateDoc(docRef, {
            title: songData.title,
            artist: songData.artist,
            audioUrl: songData.audioUrl,
            coverUrl: songData.coverUrl,
            updatedAt: new Date(),
        });
    } catch (error) {
        console.error("Error updating song metadata:", error);
        throw error;
    }
};

export const deleteSongMetadata = async (id) => {
    try {
        await deleteDoc(doc(db, "songs", id));
    } catch (error) {
        console.error("Error deleting song metadata:", error);
        throw error;
    }
};

export const fetchSongs = async () => {
    try {
        const q = query(collection(db, "songs"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching songs:", error);
        return [];
    }
};
