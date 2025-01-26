import React, { useState } from 'react';
import axios from 'axios';

const Doubts = () => {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // State to manage loading

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true when the request starts
    setResponse('');
    setError('');

    const formData = new FormData();
    if (text) formData.append('text', text);
    if (image) formData.append('image', image);

    try {
      const res = await axios.post('http://127.0.0.1:5000/submit_doubt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.status === 'success' && Array.isArray(res.data.response)) {
        setResponse(res.data.response.join('\n\n'));
      } else if (typeof res.data.response === 'string') {
        setResponse(res.data.response);
      } else {
        setError('Invalid response format received');
      }
    } catch (err) {
      console.error('Error details:', err);
      setError(err.response?.data?.message || 'Error submitting your doubt.');
      setResponse('');
    } finally {
      setLoading(false); // Set loading to false after the request completes
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: '20px' }}>
      <h1>Submit Your Doubt</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <textarea
          placeholder="Enter your doubt here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows="4"
          style={{ padding: '10px', fontSize: '16px' }}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          style={{ padding: '5px' }}
        />
        <button
          type="submit"
          style={{
            padding: '10px',
            backgroundColor: loading ? '#999' : '#4CAF50', // Change color when loading
            color: 'white',
            fontSize: '16px',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer', // Disable the button when loading
          }}
          disabled={loading} // Disable the button while loading
        >
          {loading ? 'Submitting...' : 'Submit Doubt'}
        </button>
      </form>
      {response && (
        <div
          style={{
            marginTop: '20px',
            padding: '10px',
            backgroundColor: '#DFF2BF',
            color: '#4F8A10',
            borderRadius: '5px',
            whiteSpace: 'pre-wrap',
          }}
        >
          <strong>Response:</strong> {response}
        </div>
      )}
      {error && (
        <div
          style={{
            marginTop: '20px',
            padding: '10px',
            backgroundColor: '#FFBABA',
            color: '#D8000C',
            borderRadius: '5px',
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
};

export default Doubts;
