import { useNavigate } from 'react-router-dom';

const PlaylistItem = ({ playlist }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/PlaylistDetail/${playlist.id}`, { state: { playlist } });
    };

    return (
        <li
            className="p-3 flex items-center hover:bg-neutral-800 cursor-pointer transition-colors duration-200"
            onClick={handleClick}
        >
            <div className="flex items-center w-full">
                <img
                    src={playlist.image || '/img/null.png'}
                    alt={playlist.name}
                    className="w-12 h-12 mr-4 rounded"
                />
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-white">{playlist.name}</h3>
                    <p className="text-gray-400 text-sm">Playlist</p>
                </div>
            </div>
        </li>
    );
};

export default PlaylistItem;