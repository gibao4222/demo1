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

// Lấy danh sách album trong thư viện
export const getLibraryAlbums = async (token) => {
    try {
        const response = await axios.get(`/api/albums/albums/?isInLibrary=true`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching library albums:', error);
        throw error;
    }
};

// Cập nhật trạng thái isInLibrary
export const updateAlbumLibraryStatus = async (token, id, isInLibrary) => {
    try {
        const response = await axios.put(`/api/albums/albums/${id}/update-library-status/`,
            { isInLibrary },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error(`Error updating library status for album with id ${id}:`, error);
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