import React, { useState } from 'react';
import axios from '../axios'; // Import instance Axios đã cấu hình

const Chatbot = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse('');

    try {
      const res = await axios.post('/api/chat/chatbot/', {
        user_id: 17, // Giả sử user_id là 17, bạn có thể lấy từ localStorage hoặc context
        query,
      });
      setResponse(res.data.answer || res.data.response || 'No response');
    } catch (error) {
      setResponse('Error: Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Chatbot</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nhập câu hỏi..."
          style={{ flex: 1, padding: '8px' }}
          disabled={loading}
          className='bg-neutral-900'
        />
        <button
          type="submit"
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
          disabled={loading}
        >
          {loading ? 'Đang gửi...' : 'Gửi'}
        </button>
      </form>
      {response && (
        <div
          style={{
            marginTop: '20px',
            padding: '10px',
            backgroundColor: '#8c96a1',
            borderRadius: '4px',
          }}
        >
          <strong>Trả lời:</strong> {response}
        </div>
      )}
    </div>
  );
};

export default Chatbot;