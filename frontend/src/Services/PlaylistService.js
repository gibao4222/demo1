import axios from '../axios';

export const getPlaylists = async (token) => {
    try {
        const response = await axios.get('/api/playlists/playlists/', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching playlists:', error);
        throw error;
    }
};

export const getPlaylistDetail = async (id, token) => {
    try {
        const response = await axios.get(`/api/playlists/playlists/?target_id=${id}`, {
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
                // 'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating playlist with id ${id}:`, error.response?.data || error.message);
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

// Playlist Song
export const getSongById = async (id, token) => {
    try {
        const response = await axios.get(`/api/songs/songs/${id}/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching song with id ${id}:`, error);
        throw error;
    }
};

export const getSongPlaylist = async (playlistId, token) => {
    try {
        const response = await axios.get(`/api/playlists/playlist-songs/${playlistId}/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching songs for playlist ${playlistId}:`, error);
        throw error;
    }
};

export const addSongToPlaylist = async (playlistId, songId, token) => {
    try {
        const response = await axios.post('/api/playlists/create-playlist-song/', {
            id_playlist: playlistId,
            id_song: songId
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error adding song to playlist:', error);
        throw error;
    }
};

export const deleteSongFromPlaylist = async (playlistSongId, token) => {
    try {
        const response = await axios.delete(`/api/playlists/delete-playlist-song/${playlistSongId}/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error(`Error deleting song from playlist with id ${playlistSongId}:`, error);
        throw error;
    }
};