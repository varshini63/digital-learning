# digital-learning
1.Application Setup:
This application is structured into two main parts:
Backend: Flask application
Frontend: React application


2.Prerequisites:
Before you begin, make sure the following are installed on the person's machine:
Python 3.x for the backend (Flask)
Node.js (preferably version 16 or later) for the frontend (React)
Git (for cloning the repository if needed)
Virtualenv for Python to manage environments
npm for React dependencies


3.Installations:
install dependencies manually, the following packages are required:
Flask,Flask-CORS,PyPDF2,werkzeug
You can install them using:
pip install Flask Flask-CORS PyPDF2 werkzeug
for frontend install the required dependencies with follwoing command:
npm install
if you face any errors then try the follwoing command:
npm install react-scripts@5.0.1 --save
start the frontend with following command:
npm start(after navigating to frontend folder)
start the backend with following command:
python app.py(after navigating to backend folder)

4.How the Application Works
Backend (Flask) API Endpoints:
The backend will expose API endpoints that the frontend will communicate with. Based on the app.py provided, these might include:

POST /upload: Handles file uploads (e.g., PDFs).
GET /summarize: Returns some form of summarized content.
POST /process: Handles data processing or other logic.
Ensure that your frontend application is making requests to these endpoints.
Frontend (React):
The React application will interact with the Flask backend, providing a user interface to interact with the API endpoints. Some important components:
SideNav: Navigation sidebar
Dashboard: Displays some data or user information
VirtualLab: Drag-and-drop functionality for virtual labs (using react-dnd)
Quiz: Handles quiz-related features
Summarize: Summarizes content (likely interacts with Flask)
