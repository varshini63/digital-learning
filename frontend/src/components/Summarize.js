import React, { useState } from 'react';

const Summarize = () => {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('text');
  const [error, setError] = useState('');

  const API_URL = 'http://localhost:5000/api/summarize';

  const handleTextSubmit = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    setError('');
    setSummary('');
    
    try {
      console.log('Sending text for summarization...');
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          text: text
        })
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Failed to parse response as JSON. Raw response: ${responseText}`);
      }

      if (!response.ok) {
        throw new Error(data.error || data.details?.error || 'Failed to generate summary');
      }

      setSummary(data.summary);
    } catch (error) {
      console.error('Error details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    setFile(file);
    setLoading(true);
    setError('');
    setSummary('');

    try {
      console.log('Uploading PDF:', file.name);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Failed to parse response as JSON. Raw response: ${responseText}`);
      }

      if (!response.ok) {
        throw new Error(data.error || data.details?.error || 'Failed to generate summary');
      }

      setSummary(data.summary);
    } catch (error) {
      console.error('Error details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md"> {/* Increased max-width */}
      <h1 className="text-2xl font-bold mb-6">Text Summarizer</h1>
      
      <div className="flex mb-6">
        <button
          className={`px-4 py-2 mr-2 rounded-lg ${
            activeTab === 'text' ? 'bg-blue-500 text-white' : 'bg-gray-100'
          }`}
          onClick={() => {
            setActiveTab('text');
            setError('');
            setSummary('');
          }}
        >
          📝 Text Input
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'pdf' ? 'bg-blue-500 text-white' : 'bg-gray-100'
          }`}
          onClick={() => {
            setActiveTab('pdf');
            setError('');
            setSummary('');
          }}
        >
          📄 PDF Upload
        </button>
      </div>

      {activeTab === 'text' && (
        <div className="mb-6">
          <textarea
            placeholder="Enter your text here..."
            className="w-full h-96 p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-medium text-base leading-relaxed" // Increased height and added styling
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ minHeight: '200px' }} // Enforcing minimum height
          />
          <button
            className={`mt-4 px-6 py-2 rounded-lg ${
              loading || !text.trim()
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            onClick={handleTextSubmit}
            disabled={loading || !text.trim()}
          >
            {loading ? 'Summarizing...' : 'Summarize Text'}
          </button>
        </div>
      )}

      {activeTab === 'pdf' && (
        <div className="mb-6">
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="pdf-upload"
            />
            <label
              htmlFor="pdf-upload"
              className="cursor-pointer block"
            >
              <span className="text-4xl mb-2 block">📄</span>
              <p className="mb-2">Click to upload PDF or drag and drop</p>
              <p className="text-sm text-gray-500">PDF files only</p>
            </label>
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Selected file: {file.name}
              </p>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

{summary && (
  <div
    className="mt-6 p-6 bg-gray-50 rounded-lg"
    style={{ marginLeft: '16rem' }} // Adjust the left margin as per the side nav width
  >
    <h3 className="font-semibold mb-4 text-lg">Summary:</h3>
    <p className="whitespace-pre-wrap text-base leading-relaxed">{summary}</p>
  </div>
)}

    </div>
  );
};

export default Summarize;