import axios from '../axios';

// Album
export const getAlbumById = async (token, id) => {
    try {
        const response = await axios.get(`/api/albums/albums/${id}/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching album with id ${id}:`, error);
        throw error;
    }
};

// AlbumSong
export const getAlbumSongById = async (token, id) => {
    try {
        const response = await axios.get(`/api/albums/album-songs/?id_album=${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching album songs for album id ${id}:`, error);
        throw error;
    }
};