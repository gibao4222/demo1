import React from 'react';

const Chatbot = () => {
  return (
    <div className='w-full h-[690px]'>
      <iframe
        src="http://localhost:8501/"
        width="100%"
        height="100%"
        title="Chatbot Interface"
        frameBorder="0"
      />
    </div>
  );
};

export default Chatbot;