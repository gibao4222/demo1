import React from 'react';
import { HiOutlinePencil } from 'react-icons/hi2';
import { RiDeleteBin7Line } from 'react-icons/ri';

const OptionPlaylist = ({ isOptionOpen, setIsOptionOpen, onEdit, onDelete, modalPosition }) => {
    if (!isOptionOpen) return null;

    const handleCloseOptionModal = (e) => {
        if (e.target === e.currentTarget) {
            setIsOptionOpen(false);
        }
    };

    // Đảm bảo modalPosition có giá trị hợp lệ
    const position = modalPosition && modalPosition.top !== undefined && modalPosition.left !== undefined
        ? { top: modalPosition.top, left: modalPosition.left }
        : { top: 0, left: 0 };

    return (
        <div className="fixed inset-0 z-50" onClick={handleCloseOptionModal}>
            <div
                className="absolute bg-[#282828] text-white rounded-lg shadow-lg w-auto"
                style={{ top: `${position.top}px`, left: `${position.left}px` }}
            >
                <ul className="py-2">
                    <li
                        className="flex items-center px-4 py-2 hover:bg-[#3E3E3E] cursor-pointer"
                        onClick={() => {
                            onEdit();
                            setIsOptionOpen(false);
                        }}
                    >
                        <HiOutlinePencil className="mr-3 text-lg" />
                        <span>Sửa thông tin chi tiết</span>
                    </li>
                    <li
                        className="flex items-center px-4 py-2 hover:bg-[#3E3E3E] cursor-pointer"
                        onClick={() => {
                            onDelete();
                            setIsOptionOpen(false);
                        }}
                    >
                        <RiDeleteBin7Line className="mr-3 text-lg" />
                        <span>Xóa</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default OptionPlaylist;