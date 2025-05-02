import React from 'react';

function MenuSub({ show, position, onAddToQueue }) {
    if (!show) return null;

    return (
        <div
            className="fixed bg-gray-800 rounded-lg shadow-lg z-50 py-2"
            style={{ top: position.y, left: position.x }}
        >
            <ul>
                <li
                    className="px-4 py-2 text-white hover:bg-gray-700 cursor-pointer"
                    onClick={onAddToQueue}
                >
                    Add to Queue
                </li>
            </ul>
        </div>
    );
}

export default MenuSub;