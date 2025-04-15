import axios from '../axios';



export const getPlaylists = async (token) => {
    try {
        const response = await axios.get('/api/playlists/playlists/', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching playlists:', error);
        throw error;
    }
};

export const createPlaylist = async (playlistData, token) => {
    try {
        const response = await axios.post('/api/playlists/create_playlist/', playlistData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error creating playlist:', error);
        throw error;
    }
};

export const updatePlaylist = async (id, playlistData, token) => {
    try {
        const response = await axios.put(`/api/playlists/change_playlist/${id}/`, playlistData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating playlist with id ${id}:`, error);
        throw error;
    }
};

export const deletePlaylist = async (id, token) => {
    try {
        const response = await axios.delete(`/api/playlists/delete_playlist/${id}/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error(`Error deleting playlist with id ${id}:`, error);
        throw error;
    }
};