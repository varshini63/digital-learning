// Home.js
import React from 'react';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Welcome to the Rural Education Platform</h1>
        <p>Empowering rural communities with access to quality education and resources.</p>
      </header>
      <section className="home-content">
        <div className="vision">
          <h2>Our Vision</h2>
          <p>To bridge the educational gap in rural areas through technology and innovation.</p>
        </div>
        <div className="mission">
          <h2>Our Mission</h2>
          <p>
            Provide accessible learning materials, interactive virtual labs, and a community-driven platform for growth.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Home;
