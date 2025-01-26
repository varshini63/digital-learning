import React, { useState } from 'react';
import axios from 'axios';
import './Quiz.css';

const Quiz = () => {
  const [medium, setMedium] = useState('');
  const [standard, setStandard] = useState('');
  const [board, setBoard] = useState('');
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState([]);
  const [options, setOptions] = useState([]);
  const [correctOptions, setCorrectOptions] = useState([]);
  const [explanations, setExplanations] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attempted, setAttempted] = useState({});

  const resetQuiz = () => {
    // Reset all state variables to their initial values
    setMedium('');
    setStandard('');
    setBoard('');
    setTopic('');
    setQuestions([]);
    setOptions([]);
    setCorrectOptions([]);
    setExplanations([]);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setScore(0);
    setShowResult(false);
    setLoading(false);
    setError(null);
    setAttempted({});
  };


  const parseQuizContent = (content) => {
    try {
      const questionBlocks = content
        .split(/(?=\*\*Question \d+\*\*)/g)
        .filter(block => block.trim());
      
      const parsedQuestions = [];
      const parsedOptions = [];
      const parsedCorrectOptions = [];
      const parsedExplanations = [];

      for (const block of questionBlocks) {
        const cleanBlock = block
          .replace(/(\r\n|\n|\r){2,}/g, '\n')
          .trim()
          .split('\n')
          .filter(line => line.trim() && line !== '<br>');

        if (cleanBlock.length >= 6) {
          const questionLine = cleanBlock[0].replace(/\*\*Question \d+\*\*/, '').replace(/\*\*/g, '').trim();
          const question = questionLine || cleanBlock[1];

          const optionStartIndex = cleanBlock.findIndex(line => line.match(/^\([a-d]\)/));
          if (optionStartIndex === -1) continue;

          const options = cleanBlock
            .slice(optionStartIndex, optionStartIndex + 4)
            .map(opt => opt.replace(/^\([a-d]\)\s*/, '').trim());

          const answerLine = cleanBlock.find(line => line.toLowerCase().includes('answer:'));
          if (!answerLine) continue;
          
          const correctAnswer = answerLine
            .replace(/^answer:\s*/i, '')
            .replace(/^\([a-d]\)\s*/, '')
            .trim();

          const explanationLine = cleanBlock.find(line => line.toLowerCase().includes('explanation:'));
          const explanation = explanationLine
            ? explanationLine.replace(/^explanation:\s*/i, '').trim()
            : '';

          parsedQuestions.push(question);
          parsedOptions.push(options);
          parsedCorrectOptions.push(correctAnswer);
          parsedExplanations.push(explanation);
        }
      }

      return {
        questions: parsedQuestions,
        options: parsedOptions,
        correctOptions: parsedCorrectOptions,
        explanations: parsedExplanations
      };
    } catch (error) {
      console.error('Error parsing quiz content:', error);
      throw new Error('Failed to parse quiz content');
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('http://localhost:5000/generate_quiz', {
        medium,
        standard,
        board,
        topic,
      });

      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const content = response.data.candidates[0].content.parts[0].text;
        const parsedData = parseQuizContent(content);
        
        if (parsedData.questions.length > 0) {
          setQuestions(parsedData.questions);
          setOptions(parsedData.options);
          setCorrectOptions(parsedData.correctOptions);
          setExplanations(parsedData.explanations);
          setCurrentQuestionIndex(0);
          setScore(0);
          setAttempted({});
          setShowResult(false);
        } else {
          throw new Error('No questions were generated');
        }
      } else {
        throw new Error('Invalid response format from the quiz generation API');
      }
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
      setError(error.message || 'An error occurred while fetching quiz questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    if (!medium || !standard || !board || !topic) {
      alert('Please fill in all fields to start the quiz.');
      return;
    }
    fetchQuestions();
  };

  const handleOptionSelect = (optionIndex) => {
    if (attempted[currentQuestionIndex]) return;
  
    setSelectedOption(optionIndex);
    setAttempted(prev => ({ ...prev, [currentQuestionIndex]: true }));
  
    // Get the selected option text
    const selectedAnswer = options[currentQuestionIndex][optionIndex];
    
    // Extract the correct answer, handling the markdown formatting
    const correctAnswerText = correctOptions[currentQuestionIndex]
      .replace(/\*\*Answer:\s*\(?([a-d])\)?\*\*/i, '$1') // Extract letter from "**Answer: (b)**" format
      .toLowerCase()
      .trim();
  
    // Check if the selected option index matches the correct answer letter
    const isCorrect = String.fromCharCode(97 + optionIndex) === correctAnswerText;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  
  const handleNext = () => {
    if (!attempted[currentQuestionIndex]) {
      alert('Please attempt the current question before moving to the next one.');
      return;
    }
    setCurrentQuestionIndex(prev => prev + 1);
    setSelectedOption(null);
  };

  const handlePrevious = () => {
    setCurrentQuestionIndex(prev => prev - 1);
    setSelectedOption(null);
  };

  const handleSubmit = () => {
    if (!attempted[currentQuestionIndex]) {
      alert('Please attempt the current question before submitting.');
      return;
    }
    setShowResult(true);
  };

  if (loading) {
    return (
      <div className="quiz-container">
        <div className="loading">Loading quiz questions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-container">
        <div className="error">
          {error}
          <button onClick={() => window.location.reload()} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="quiz-container">
        <h2>Start Quiz</h2>
        <div className="form-group">
          <label>Medium:</label>
          <select value={medium} onChange={(e) => setMedium(e.target.value)}>
            <option value="">Select Medium</option>
            <option value="English">English</option>
            <option value="Telugu">Telugu</option>
          </select>
        </div>

        <div className="form-group">
          <label>Standard:</label>
          <input
            type="number"
            value={standard}
            onChange={(e) => setStandard(e.target.value)}
            placeholder="Enter Standard (e.g., 10)"
          />
        </div>

        <div className="form-group">
          <label>Board:</label>
          <input
            type="text"
            value={board}
            onChange={(e) => setBoard(e.target.value)}
            placeholder="Enter Board (e.g., CBSE)"
          />
        </div>

        <div className="form-group">
          <label>Topic:</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter Topic (e.g., Algebra)"
          />
        </div>

        <button onClick={handleStartQuiz} className="start-button">
          Start Quiz
        </button>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="quiz-container">
        <h2>Quiz Result</h2>
        <div className="result">
          <p className="score">Your Score: {score}/{questions.length}</p>
          <p className="percentage">
            Percentage: {((score / questions.length) * 100).toFixed(2)}%
          </p>
        </div>
        <button onClick={resetQuiz} className="retry-button">
          Take Another Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h3>Question {currentQuestionIndex + 1} of {questions.length}</h3>
        <div className="quiz-score">Current Score: {score}</div>
      </div>

      <div className="question">
        <p>{questions[currentQuestionIndex]}</p>
      </div>

      <div className="options">
  {options[currentQuestionIndex]?.map((option, index) => {
    const correctAnswerText = correctOptions[currentQuestionIndex]
      .replace(/\*\*Answer:\s*\(?([a-d])\)?\*\*/i, '$1')
      .toLowerCase()
      .trim();
    
    const isCorrect = String.fromCharCode(97 + index) === correctAnswerText;
    
    return (
      <button
        key={index}
        className={`option-button ${
          attempted[currentQuestionIndex]
            ? isCorrect
              ? 'correct'
              : selectedOption === index
              ? 'incorrect'
              : ''
            : selectedOption === index
            ? 'selected'
            : ''
        }`}
        onClick={() => handleOptionSelect(index)}
        disabled={attempted[currentQuestionIndex]}
      >
        {`${String.fromCharCode(97 + index)}) ${option}`}
      </button>
    );
  })}
</div>
      {attempted[currentQuestionIndex] && (
        <div className="explanation">
          <p><strong>Correct Answer:</strong> {correctOptions[currentQuestionIndex]}</p>
          <p><strong>Explanation:</strong> {explanations[currentQuestionIndex]}</p>
        </div>
      )}

      <div className="navigation-buttons">
        {currentQuestionIndex > 0 && (
          <button onClick={handlePrevious} className="nav-button">
            Previous
          </button>
        )}
        {currentQuestionIndex < questions.length - 1 ? (
          <button 
            onClick={handleNext} 
            disabled={!attempted[currentQuestionIndex]}
            className="nav-button"
          >
            Next
          </button>
        ) : (
          <button 
            onClick={handleSubmit}
            disabled={!attempted[currentQuestionIndex]}
            className="nav-button submit-button"
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;