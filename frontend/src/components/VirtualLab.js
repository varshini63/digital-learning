import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './VirtualLab.css';

const VirtualLab = () => {
  const [syllabus, setSyllabus] = useState('');
  const [medium, setMedium] = useState('');
  const [standard, setStandard] = useState('');
  const [subject, setSubject] = useState('');
  const [experiment, setExperiment] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoResults, setVideoResults] = useState([]);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const navigate = useNavigate();

  const syllabusOptions = ['State Syllabus', 'CBSE'];
  const mediumOptions = ['Telugu', 'English'];
  const standards = Array.from({ length: 10 }, (_, i) => i + 1);

  const subjectsBySyllabus = {
    'state syllabus': {
      upTo7th: ['Science', 'Social'],
      from8th: ['Physics', 'Biology', 'Social'],
    },
    cbse: {
      upTo7th: ['Science', 'Social'],
      from8th: ['Physics', 'Biology', 'Chemistry', 'Social'],
    },
  };

  const handleSyllabusSelect = (syllabusType) => {
    setSyllabus(syllabusType);
    setMedium('');
    setStandard('');
    setSubject('');
    setExperiment('');
    setVideoUrl('');
    setVideoResults([]);
  };

  const handleMediumSelect = (mediumType) => {
    setMedium(mediumType);
    setStandard('');
    setSubject('');
    setExperiment('');
    setVideoUrl('');
    setVideoResults([]);
  };

  const handleStandardSelect = (std) => {
    setStandard(std);
    setSubject('');
    setExperiment('');
    setVideoUrl('');
    setVideoResults([]);
  };

  const handleSubjectSelect = (sub) => {
    setSubject(sub);
    setExperiment('');
    setVideoUrl('');
    setVideoResults([]);
  };

  const constructSearchQuery = () => {
    let query = '';
    
    if (medium === 'Telugu') {
      query = `${experiment} ${subject} class ${standard} తెలుగు మీడియం`;
    } else {
      query = `${experiment} ${subject} class ${standard} english medium`;
    }
    
    return query;
  };

  const handleSearchExperiment = async () => {
    if (!experiment) return;

    const query = constructSearchQuery();
    const apiKey = 'AIzaSyBRcEB4-m-rYMPqy3Pu-XJJXEXZC0Dylgg';
    // Changed maxResults to 2 to get only top two videos
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=2&q=${encodeURIComponent(query)}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const videos = data.items.map(item => ({
          id: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.medium.url
        }));
        
        setVideoResults(videos);
        setVideoUrl(`https://www.youtube.com/embed/${videos[0].id}`);
        setSelectedVideoIndex(0);
      } else {
        setVideoResults([]);
        setVideoUrl('');
        alert(`No videos found. Please try a different search.`);
      }
    } catch (error) {
      console.error('Error fetching YouTube data:', error);
      alert('Failed to fetch video. Please try again later.');
    }
  };

  const handleVideoSelect = (index) => {
    setSelectedVideoIndex(index);
    setVideoUrl(`https://www.youtube.com/embed/${videoResults[index].id}`);
  };

  const handleBack = () => {
    if (videoUrl) {
      setVideoUrl('');
      setVideoResults([]);
    } else if (experiment) {
      setExperiment('');
    } else if (subject) {
      setSubject('');
    } else if (standard) {
      setStandard('');
    } else if (medium) {
      setMedium('');
    } else if (syllabus) {
      setSyllabus('');
    } else {
      navigate(-1);
    }
  };

  const getSubjects = () => {
    const normalizedSyllabus = syllabus.toLowerCase();
    return standard <= 7 
      ? subjectsBySyllabus[normalizedSyllabus]?.upTo7th || []
      : subjectsBySyllabus[normalizedSyllabus]?.from8th || [];
  };

  return (
    <div className="virtual-lab-container">
      <h1>Digital Lab</h1>

      <div className="selection-path">
        {syllabus && <span>Syllabus: {syllabus} </span>}
        {medium && <span>| Medium: {medium} </span>}
        {standard && <span>| Standard: {standard} </span>}
        {subject && <span>| Subject: {subject}</span>}
      </div>

      {!syllabus && (
        <div className="selection">
          <h2>Select Syllabus</h2>
          <div className="button-grid">
            {syllabusOptions.map((option) => (
              <button 
                key={option} 
                onClick={() => handleSyllabusSelect(option)} 
                className="selection-button"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {syllabus && !medium && (
        <div className="selection">
          <h2>Select Medium</h2>
          <div className="button-grid">
            {mediumOptions.map((option) => (
              <button 
                key={option} 
                onClick={() => handleMediumSelect(option)} 
                className="selection-button"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {syllabus && medium && !standard && (
        <div className="selection">
          <h2>Select Standard</h2>
          <div className="button-grid">
            {standards.map((std) => (
              <button 
                key={std} 
                onClick={() => handleStandardSelect(std)} 
                className="selection-button"
              >
                {std}
              </button>
            ))}
          </div>
        </div>
      )}

      {syllabus && medium && standard && !subject && (
        <div className="selection">
          <h2>Select Subject</h2>
          <div className="button-grid">
            {getSubjects().map((sub) => (
              <button 
                key={sub} 
                onClick={() => handleSubjectSelect(sub)} 
                className="selection-button"
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {syllabus && medium && standard && subject && (
        <div className="experiment-section">
          <h2>Enter Experiment Name</h2>
          <div className="experiment-input-container">
            <input
              type="text"
              value={experiment}
              onChange={(e) => setExperiment(e.target.value)}
              placeholder={medium === 'Telugu' ? "ప్రయోగం పేరు" : "Enter experiment name"}
              className="experiment-input"
            />
            <button onClick={handleSearchExperiment} className="search-button">
              Search
            </button>
          </div>
        </div>
      )}

{videoResults.length > 0 && (
    <div className="video-section">
      <div className="main-video">
        <iframe
          width="560"
          height="315"
          src={videoUrl}
          title="YouTube Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      <div className="video-thumbnails">
        {videoResults.map((video, index) => (
          <div 
            key={video.id} 
            className={`video-thumbnail ${selectedVideoIndex === index ? 'selected' : ''}`}
            onClick={() => handleVideoSelect(index)}
          >
            <img src={video.thumbnail} alt={video.title} />
            <p>{video.title}</p>
          </div>
        ))}
      </div>
    </div>
  )}

      <button onClick={handleBack} className="back-button">
        Back
      </button>
    </div>
  );
};

export default VirtualLab;