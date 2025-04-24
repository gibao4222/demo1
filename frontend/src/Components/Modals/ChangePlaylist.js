import React, { useState, useEffect } from 'react';
import { HiOutlinePencil } from 'react-icons/hi2';
import { RiDeleteBin7Line } from 'react-icons/ri';
import { IoMusicalNotesOutline } from 'react-icons/io5';
import { updatePlaylist } from '../../Services/PlaylistService';

const ModalChangePlaylist = ({
  isModalOpen,
  closeModal,
  imageSrc,
  setImageSrc,
  name,
  setName,
  description,
  setDescription,
  fileInputRef,
  playlistId,
  token,
}) => {
  const [isHoveredModal, setIsHoveredModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState(imageSrc);
  const [tempName, setTempName] = useState(name);
  const [tempDescription, setTempDescription] = useState(description);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (isModalOpen) {
      setTempImageSrc(imageSrc);
      setTempName(name);
      setTempDescription(description);
      setSelectedFile(null);
    }
  }, [isModalOpen, imageSrc, name, description]);

  const handleTempImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setTempImageSrc(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append('name', tempName);
      formData.append('description', tempDescription);
      if (selectedFile) {
        formData.append('image', selectedFile); // Gửi file gốc
      }

      const updatedPlaylist = await updatePlaylist(playlistId, formData, token);
      console.log('Playlist updated successfully:', updatedPlaylist);

      setImageSrc(updatedPlaylist.image);
      setName(updatedPlaylist.name);
      setDescription(updatedPlaylist.description);

      // Gửi sự kiện playlistUpdated
      window.dispatchEvent(new Event('playlistUpdated'));

      closeModal();
    } catch (error) {
      console.error('Failed to update playlist:', error.response?.data || error.message);
      alert('Có lỗi xảy ra khi cập nhật playlist: ' + JSON.stringify(error.response?.data || error.message));
    }
  };

  const handleRemoveTempImage = () => {
    setTempImageSrc('/img/null.png');
    setSelectedFile(null);
  };

  const renderInputField = (value, setValue, isEditing, setIsEditing, label, customClass = '') => (
    <div className={`relative w-full ${customClass}`}>
      <label
        className={`absolute left-4 transition-all duration-300 text-gray-500 pointer-events-none ${isEditing || value
          ? 'top-0 text-xs -translate-y-2 bg-gradient-to-b from-[#282828] to-[#3F4040] text-white px-1'
          : 'top-1/2 transform -translate-y-1/2 text-base'
          }`}
      >
        {label}
      </label>
      {isEditing ? (
        label === 'Mô tả' ? (
          <textarea
            placeholder="Thêm phần mô tả không bắt buộc"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            className="w-full px-4 py-2 bg-[#3F4040] text-white text-base border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors h-full resize-none"
            rows="4"
          />
        ) : (
          <input
            type="text"
            placeholder="Tên"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            className="w-full px-4 py-2 bg-[#3F4040] text-white text-base border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors h-full"
          />
        )
      ) : (
        <div
          className="bg-[#3F4040] text-white p-2 rounded cursor-pointer w-full h-full"
          onClick={() => setIsEditing(true)}
        >
          {value || `Thêm ${label.toLowerCase()}`}
        </div>
      )}
    </div>
  );

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
      <div className="bg-[#282828] text-white rounded-lg p-6 w-[600px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Sửa thông tin chi tiết</h2>
          <button
            onClick={closeModal}
            className="text-[#A7A7A7] hover:text-white text-lg"
          >
            ✕
          </button>
        </div>

        <div className="flex items-start gap-4 mb-4">
          <div
            className="relative w-47 h-47 shadow-2xl shadow-black rounded overflow-hidden"
            onMouseEnter={() => setIsHoveredModal(true)}
            onMouseLeave={() => setIsHoveredModal(false)}
          >
            <label className="cursor-pointer block w-full h-full">
              {tempImageSrc ? (
                <img
                  src={tempImageSrc}
                  alt="Album cover"
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center rounded">
                  <IoMusicalNotesOutline className="text-gray-400 text-6xl" />
                </div>
              )}

              {isHoveredModal && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 rounded">
                  <HiOutlinePencil className="text-white text-5xl mb-2" />
                  <span className="text-white font-bold">Chọn ảnh</span>
                </div>
              )}

              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                className="hidden"
                ref={fileInputRef}
                onChange={handleTempImageChange}
              />
            </label>

            {isHoveredModal && tempImageSrc && (
              <div
                className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-2 cursor-pointer"
                onClick={handleRemoveTempImage}
              >
                <RiDeleteBin7Line className="text-white text-lg" />
              </div>
            )}
          </div>

          <div className="flex flex-col w-full">
            {renderInputField(tempName, setTempName, isEditing, setIsEditing, 'Tên')}
            <div className="mt-4">
              {renderInputField(tempDescription, setTempDescription, isEditingDescription, setIsEditingDescription, 'Mô tả', 'h-20')}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-white text-black font-bold py-2 px-6 rounded-full hover:bg-gray-200"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalChangePlaylist;