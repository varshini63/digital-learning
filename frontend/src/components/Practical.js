import React, { useState } from 'react';
import './Practical.css';
import axios from 'axios';

const Practical = () => {
  const [medium, setMedium] = useState('');
  const [experiment, setExperiment] = useState('');
  const [guidelines, setGuidelines] = useState([]);
  const [loading, setLoading] = useState(false); // New state for loading

  const fetchGuidelines = async (experiment, medium) => {
    try {
      setLoading(true); // Start loading
      const response = await axios.post('http://localhost:5000/proxy/guidelines', {
        query: `Define the concept and later the procedure for performing ${experiment} in ${medium} step by step`,
      });

      if (response.data.steps && Array.isArray(response.data.steps) && response.data.steps.length > 0) {
        const formattedGuidelines = response.data.steps
          .map((step) => step.split('**').filter((point) => point.trim() !== '').map((point) => point.trim()))
          .flat()
          .map((point) => point.split('\n').map((line) => line.trim()))
          .flat();

        setGuidelines(formattedGuidelines);
      } else {
        setGuidelines(['No guidelines found.']);
      }
    } catch (error) {
      console.error('Error fetching guidelines:', error);
      setGuidelines(['Failed to fetch guidelines. Please try again.']);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleSearch = () => {
    if (!experiment.trim()) {
      alert('Please enter the name of the experiment.');
      return;
    }
    if (!loading) {
      fetchGuidelines(experiment, medium);
    }
  };

  return (
    
    <div className="practical-container">
      <h1>Theory Explanation and Guidelines for experiment</h1>
      {!medium && (
        <div className="selection">
          <h2>Select Medium</h2>
          <button onClick={() => setMedium('English')}>English</button>
          <button onClick={() => setMedium('Telugu')}>Telugu</button>
        </div>
      )}

      {medium && (
        <div className="selection">
          <h2>Enter Experiment Name</h2>
          <input
            type="text"
            value={experiment}
            onChange={(e) => setExperiment(e.target.value)}
            placeholder="Experiment Name"
          />
          <button onClick={handleSearch} disabled={loading}>
            {loading ? 'Loading...' : 'Search'} {/* Change button text while loading */}
          </button>
        </div>
      )}

      {loading && <p className="loading-message">Fetching guidelines, please wait...</p>} {/* Loading message */}

      {guidelines.length > 0 && !loading && (
        <div className="guidelines">
          <h3>Guidelines</h3>
          <ul>
            {guidelines.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Practical;
