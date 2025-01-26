import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { materialLinks } from './materialLinks';
import './Material.css';

const Material = () => {
  const [syllabus, setSyllabus] = useState('');
  const [medium, setMedium] = useState('');
  const [standard, setStandard] = useState('');
  const [subject, setSubject] = useState('');
  const navigate = useNavigate();

  const syllabusOptions = ['State Syllabus'];
  const mediumOptions = ['Telugu', 'English'];
  const standards = Array.from({ length: 10 }, (_, i) => i + 1); // Standards 1 to 10

  const handleBack = () => {
    if (subject) {
      setSubject('');
    } else if (standard) {
      setStandard('');
    } else if (medium) {
      setMedium('');
    } else if (syllabus) {
      setSyllabus('');
    } else {
      navigate(-1); // Go back in browser history
    }
  };

  const getSubjects = () => {
    return materialLinks['state']?.[standard]?.[medium] || {};
  };

  const getMaterialLinks = () => {
    return materialLinks['state']?.[standard]?.[medium]?.[subject] || [];
  };

  return (
    <div className="material-container">
      <h1>Materials</h1>

      {!syllabus && (
        <div className="selection">
          <h2>Select Syllabus</h2>
          {syllabusOptions.map((option) => (
            <button
              key={option}
              onClick={() => setSyllabus(option)}
              className="syllabus-button"
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {syllabus && !medium && (
        <div className="selection">
          <h2>Select Medium</h2>
          {mediumOptions.map((option) => (
            <button
              key={option}
              onClick={() => setMedium(option)}
              className="medium-button"
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {syllabus && medium && !standard && (
        <div className="selection">
          <h2>Select Standard</h2>
          {standards.map((std) => (
            <button
              key={std}
              onClick={() => setStandard(std)}
              className="standard-button"
            >
              {std}
            </button>
          ))}
        </div>
      )}

      {syllabus && medium && standard && !subject && (
        <div className="selection">
          <h2>Select Subject</h2>
          {Object.keys(getSubjects()).map((sub) => (
            <button
              key={sub}
              onClick={() => setSubject(sub)}
              className="subject-button"
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {syllabus && medium && standard && subject && (
        <div className="selection">
          <h2>Materials for {subject}</h2>
          {getMaterialLinks().map((item) => (
            <div key={item.id} className="material-item">
              <h3>{item.topic}</h3>
              <a href={item.content} target="_blank" rel="noopener noreferrer" className="download-link">
                Open Material
              </a>
            </div>
          ))}
        </div>
      )}

      <button onClick={handleBack} className="back-button">
        Back
      </button>
    </div>
  );
};

export default Material;
