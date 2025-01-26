import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';


function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    phone: '',
    dwelling_area: '',
    standard: '',
    medium: '',
    board: '',
    password: '',
    verifyPassword: '',
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    const phoneRegex = /^[6-9]\d{9}$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
    const dwellingAreaRegex = /^[A-Za-z\s]+$/;  // Only alphabets and spaces allowed
  
    // Check for blank fields
    for (const field in formData) {
      if (!formData[field].trim()) {
        newErrors[field] = 'This field is required';
      }
    }
  
    // Email validation
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Email must be a valid Gmail address';
    }
  
    // Phone number validation
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number. Must be 10 digits starting with 6-9.';
    }
  
    // Check if password and verifyPassword match
    if (formData.password && formData.verifyPassword && formData.password !== formData.verifyPassword) {
      newErrors.verifyPassword = 'Passwords do not match';
    }
  
    // Password validation
    if (formData.password && !passwordRegex.test(formData.password)) {
      newErrors.password = 'Password must contain a capital letter, a number, a special character, and be at least 8 characters long';
    }
  
    // Dwelling Area validation (only alphabets and spaces allowed)
    if (formData.dwelling_area && !dwellingAreaRegex.test(formData.dwelling_area)) {
      newErrors.dwelling_area = 'Dwelling area should only contain alphabets and spaces';
    }
  
    // Check if board selection is valid
    if (!formData.board) {
      newErrors.board = 'Please select a syllabus (State or CBSE)';
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const checkUsernameUnique = async () => {
    try {
      const response = await fetch(`http://localhost:5000/check-username?username=${formData.username}`);
      const result = await response.json();
      if (result.exists) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          username: 'Username already exists. Please choose another one.',
        }));
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking username:', error);
      alert('An error occurred while checking username uniqueness.');
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) return; // Stop submission if form is invalid
  
    const isUsernameUnique = await checkUsernameUnique();
    if (!isUsernameUnique) return; // Stop submission if username is not unique
  
    console.log("Form Data to Submit:", formData);  // Log the form data
  
    try {
      const response = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      alert(result.message);
  
      if (result.message === 'User registered successfully') {
        navigate('/login');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Signup failed. Please try again.');
    }
  };
  

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    // Handle single selection for board
    if (name === 'board' && type === 'radio') {
      setFormData({ ...formData, board: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Clear the error for the current field
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <h1>Signup</h1>
        <input
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        {errors.username && <p className="error">{errors.username}</p>}
      </div>

      <div>
        <input
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        {errors.name && <p className="error">{errors.name}</p>}
      </div>

      <div>
        <input
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        {errors.email && <p className="error">{errors.email}</p>}
      </div>

      <div>
        <input
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        {errors.phone && <p className="error">{errors.phone}</p>}
      </div>

      <div>
        <input
          name="dwelling_area"
          placeholder="Dwelling Area"
          value={formData.dwelling_area}
          onChange={handleChange}
          required
        />
        {errors.dwelling_area && <p className="error">{errors.dwelling_area}</p>}
      </div>

      <div>
        <select name="standard" onChange={handleChange} required>
          <option value="">Select Standard</option>
          {Array.from({ length: 10 }, (_, i) => (
            <option key={i + 1} value={i + 1}>{`${i + 1} Standard`}</option>
          ))}
        </select>
        {errors.standard && <p className="error">{errors.standard}</p>}
      </div>

      <div>
        <select name="medium" onChange={handleChange} required>
          <option value="">Select Medium</option>
          <option value="Telugu">Telugu Medium</option>
          <option value="English">English Medium</option>
        </select>
        {errors.medium && <p className="error">{errors.medium}</p>}
      </div>

      <div className="radio-group">
  <label>
    <input
      type="radio"
      name="board"
      value="State"
      onChange={handleChange}
      checked={formData.board === 'State'}
    />
    State Syllabus
  </label>
  <label>
    <input
      type="radio"
      name="board"
      value="CBSE"
      onChange={handleChange}
      checked={formData.board === 'CBSE'}
    />
    CBSE
  </label>
</div>
{errors.board && <p className="error">{errors.board}</p>}
      <div>
        <input
          type="password"
          name="password"
          placeholder="Create Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        {errors.password && <p className="error">{errors.password}</p>}
      </div>

      <div>
        <input
          type="password"
          name="verifyPassword"
          placeholder="Verify Password"
          value={formData.verifyPassword}
          onChange={handleChange}
          required
        />
        {errors.verifyPassword && <p className="error">{errors.verifyPassword}</p>}
      </div>

      <button type="submit">Signup</button>
    </form>
  );
}

export default Signup;
