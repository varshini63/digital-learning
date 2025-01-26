from models import create_app, db  # Import create_app and db from the models package
from flask import request, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS  # Import CORS
import requests
import re
import os
import PyPDF2
import base64
import json

# Create the Flask app using the function from _init_.py
app = create_app()

# Enable CORS for the app, restrict to localhost for development
CORS(app)  # Restrict access to localhost:3000

# Define your routes
@app.route('/')
def index():
    return "Hello, Oracle Database!"

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    try:
        # Add more debug information
        print("Received data:", data)
        
        # Validate password length
        if not data.get('password') or len(data['password']) < 8:
            return jsonify({"message": "Password must be at least 8 characters long."}), 400
        
        # Additional validations
        if not data.get('username') or not data.get('email'):
            return jsonify({"message": "Username and email are required."}), 400

        from models.students import Student
        
        if Student.find_by_username(data['username']):
            return jsonify({"message": "Username already exists. Please choose a different one."}), 400

        # Creating user
        new_user = Student(
            username=data['username'],
            email=data['email'],
            phone=data['phone'],
            name=data['name'],
            dwelling_area=data['dwelling_area'],
            standard=data['standard'],
            medium=data['medium'],
            board=data['board'],
            password=data['password']  # No password hashing for now
        )
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "User registered successfully"}), 201

    except Exception as e:
        db.session.rollback()
        print("Error during signup:", e)
        return jsonify({"message": "An error occurred during signup.", "error": str(e)}), 500


@app.route('/login', methods=['POST'])
def login():
    try:
        if not request.is_json:
            return jsonify({"message": "Invalid JSON input."}), 400
        
        data = request.json
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({"message": "Username and password are required."}), 400

        from models.students import Student
        user = Student.query.filter_by(username=username).first()
        if user and user.password == password:  # No password hashing for now
            return jsonify({"message": "Login successful", "user": user.to_dict()}), 200
        return jsonify({"message": "Invalid credentials."}), 401
    except Exception as e:
        return jsonify({"message": "An error occurred during login.", "error": str(e)}), 500

@app.route('/check-username', methods=['GET'])
def check_username():
    username = request.args.get('username')
    if not username:
        return jsonify({"message": "Username is required."}), 400

    from models.students import Student
    user = Student.find_by_username(username)
    if user:
        return jsonify({"exists": True})
    return jsonify({"exists": False})

@app.route('/dashboard/<int:user_id>', methods=['GET'])
def dashboard(user_id):
    from models.students import Student
    user = Student.query.get(user_id)
    if user:
        return jsonify({"dashboard": f"Welcome {user.name}, this is your dashboard."})
    return jsonify({"message": "User not found."}), 404

@app.route('/labs/<subject>/<standard>', methods=['GET'])
def get_labs(subject, standard):
    try:
        from models.virtual_lab import VirtualLab
        labs = VirtualLab.query.filter_by(subject=subject, standard=standard).all()
        labs_data = [lab.to_dict() for lab in labs]
        return jsonify({"labs": labs_data})
    except Exception as e:
        return jsonify({"message": "Error occurred while fetching labs.", "error": str(e)}), 500

@app.route('/material/<subject>/<standard>', methods=['GET'])
def get_material(subject, standard):
    try:
        from models.material import Material
        materials = Material.query.filter_by(subject=subject, standard=standard).all()
        material_data = [material.to_dict() for material in materials]
        return jsonify({"materials": material_data})
    except Exception as e:
        return jsonify({"message": "Error occurred while fetching materials.", "error": str(e)}), 500

GEMINI_API_KEY_QUIZ = 'AIzaSyDN91BmsvWD_UwH0pM7_bCudJivksH_iGE'  # Add a separate API key for quiz generation
GEMINI_API_URL_QUIZ = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

@app.route('/generate_quiz', methods=['POST'])
def generate_quiz():
    try:
        data = request.json
        medium = data.get('medium')
        standard = data.get('standard')
        board = data.get('board')
        topic = data.get('topic')
        
        print(f"Received data: {data}")  # Debug log

        # Validate required inputs
        if not all([medium, standard, board, topic]):
            return jsonify({
                "error": "Medium, standard, board, and topic are required fields."
            }), 400

        # Construct the query for quiz generation
        query = f"""Generate 8 multiple-choice questions (MCQs) on the topic '{topic}' 
        for a standard {standard} student studying in {medium}, following the {board} syllabus. 
        Format each question as follows:
        **Question**
        (a) Option1
        (b) Option2
        (c) Option3
        (d) Option4
        **Answer: (correct_option)**
        Explanation: explanation_text
        
        Use three newlines between questions."""

        # Prepare the payload for the Gemini API
        payload = {
            "contents": [{
                "parts": [{"text": query}]
            }]
        }

        # Send the request to the Gemini API
        response = requests.post(
            GEMINI_API_URL_QUIZ,
            params={'key': GEMINI_API_KEY_QUIZ},
            json=payload,
            headers={"Content-Type": "application/json"}
        )

        print("Gemini API response:", response.json())  # Debug log

        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({
                "error": "Failed to generate quiz from Gemini API.",
                "details": response.text
            }), response.status_code

    except Exception as e:
        print(f"Error generating quiz: {e}")  # Debug log
        return jsonify({
            "error": "Error occurred while generating quiz.",
            "details": str(e)
        }), 500

def parse_quiz_content(content):
    """
    Parse the raw quiz content into structured data.
    """
    quiz_data = {
        "questions": [],
        "options": [],
        "correct_answers": [],
        "explanations": []
    }

    # Split content into question blocks
    question_blocks = content.strip().split('\n\n\n')
    
    for block in question_blocks:
        lines = block.strip().split('\n')
        
        if len(lines) < 7:  # Skip malformed entries
            continue

        # Clean and extract question text
        question = lines[0].replace('**', '').strip()
        quiz_data["questions"].append(question)

        # Extract and clean options
        options = []
        for i in range(1, 5):
            option = lines[i].strip()
            # Remove option labels like (a), (b), etc.
            option = re.sub(r'^\([a-d]\)\s*', '', option)
            # Remove any asterisks
            option = option.replace('*', '').strip()
            options.append(option)
        quiz_data["options"].append(options)

        # Extract correct answer
        correct_answer_line = lines[5].replace('**', '').replace('Answer:', '').strip()
        # Extract the option text without the label
        correct_answer = re.sub(r'^\([a-d]\)\s*', '', correct_answer_line).strip()
        quiz_data["correct_answers"].append(correct_answer)

        # Extract explanation
        explanation = lines[6].replace('Explanation:', '').strip()
        quiz_data["explanations"].append(explanation)

    return quiz_data

# Update the start_quiz route to handle the new structured data
@app.route('/start_quiz', methods=['POST'])
def start_quiz():
    try:
        data = request.json
        current_question_index = data.get('current_question_index', 0)
        quiz_data = data.get('quiz_data')

        if not quiz_data:
            return jsonify({
                "success": False,
                "message": "Quiz data is required."
            }), 400

        # Check if there are remaining questions
        if current_question_index >= len(quiz_data['questions']):
            return jsonify({
                "success": True,
                "message": "Quiz completed!",
                "score": data.get('score', 0)
            })

        return jsonify({
            "success": True,
            "current_question": {
                "question": quiz_data['questions'][current_question_index],
                "options": quiz_data['options'][current_question_index],
                "correct_answer": quiz_data['correct_answers'][current_question_index],
                "explanation": quiz_data['explanations'][current_question_index]
            },
            "next_question_index": current_question_index + 1,
            "total_questions": len(quiz_data['questions'])
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Error while starting quiz",
            "error": str(e)
        }), 500

def parse_quiz_content(content):
    questions = []
    options = []
    correct_option = []
    explanations = []

    question_blocks = content.strip().split("\n\n\n")
    
    for block in question_blocks:
        lines = block.strip().split("\n")
        
        if len(lines) < 7:
            continue  # Skip malformed entries

        question_text = lines[0].strip()
        questions.append(question_text)

        opts = [line.strip() for line in lines[1:5]]  # First 4 lines as options
        options.extend(opts)

        correct_ans = lines[5].strip().replace("**Answer:", "").strip()  # Correct option
        correct_option.append(correct_ans)

        explanation = lines[6].strip().replace("Explanation:", "").strip()  # Explanation
        explanations.append(explanation)

    return questions, options, correct_option, explanations

@app.route('/add_lab', methods=['POST'])
def add_lab():
    data = request.json
    try:
        from models.virtual_lab import VirtualLab
        new_lab = VirtualLab(
            subject=data['subject'],
            standard=data['standard'],
            experiment=data['experiment'],
            instructions=data['instructions']
        )
        db.session.add(new_lab)
        db.session.commit()
        return jsonify({"message": "Lab added successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error occurred while adding lab.", "error": str(e)}), 500

@app.route('/add_material', methods=['POST'])
def add_material():
    data = request.json
    try:
        from models.material import Material
        new_material = Material(
            subject=data['subject'],
            standard=data['standard'],
            topic=data['topic'],
            content=data['content']
        )
        db.session.add(new_material)
        db.session.commit()
        return jsonify({"message": "Material added successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error occurred while adding material.", "error": str(e)}), 500


GEMINI_API_KEY = 'AIzaSyCurdrR6zWwj7N4aoNpkWf7XZ4HGr8JqJs'  # Add the API key here
GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

@app.route('/proxy/guidelines', methods=['POST'])
def proxy_guidelines():
    try:
        data = request.json
        query = data.get('query', '')
        
        if not query:
            return jsonify({"message": "Query is required."}), 400

        # Prepare request data in the required format for Gemini API
        payload = {
            "contents": [{
                "parts": [{"text": query}]
            }]
        }

        # Send the request to the Gemini API
        response = requests.post(
            GEMINI_API_URL,
            params={'key': GEMINI_API_KEY},
            json=payload,
            headers={"Content-Type": "application/json"}
        )

        print("Gemini API response:", response.json())  # Add this line for debugging

        if response.status_code == 200:
            result = response.json()

            # Extracting the content part of the response
            content = result.get('candidates', [])
            steps = []
            for candidate in content:
                if 'content' in candidate and 'parts' in candidate['content']:
                    for part in candidate['content']['parts']:
                        if 'text' in part:
                            steps.append(part['text'])

            if steps:
                return jsonify({"steps": steps})
            else:
                return jsonify({"message": "No guidelines found."}), 404

        else:
            return jsonify({"message": "Failed to fetch guidelines from Gemini API.", "error": response.text}), response.status_code

    except Exception as e:
        return jsonify({"message": "Error while proxying request", "error": str(e)}), 500


GEMINI_API_KEY = "AIzaSyCc33T4hztirZEhqdJ8Wk7VaKMIHRAHsf8"
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"

@app.route("/api/summarize", methods=["POST"])
def summarize():
    try:
        print("Request received:", request.method)
        print("Content-Type:", request.headers.get('Content-Type'))
        
        # Handle file upload
        if request.files:
            print("Processing file upload")
            uploaded_file = request.files["file"]
            if uploaded_file.content_type != "application/pdf":
                return jsonify({"error": "Only PDF files are supported."}), 400
            
            pdf_reader = PyPDF2.PdfReader(uploaded_file)
            text = " ".join(page.extract_text() for page in pdf_reader.pages)
        
        # Handle JSON data
        elif request.is_json:
            print("Processing JSON data")
            data = request.get_json()
            text = data.get("text", "").strip()
            if not text:
                return jsonify({"error": "Input text is empty."}), 400
        else:
            return jsonify({"error": "Invalid request format"}), 400

        # Enhanced prompt for more detailed summary
        prompt = """
        Please provide a comprehensive summary of the following text. The summary should:
        1. Cover all main points and key details
        2. Maintain the logical flow of ideas
        3. Include important examples and evidence
        4. Be well-structured with clear paragraphs
        5. Be approximately 40-50% of the original length
        
        Here's the text to summarize:
        {text}
        """.format(text=text)

        # Prepare Gemini API request with parameters for longer output
        payload = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 2048,  # Increased max tokens for longer output
                "stopSequences": []
            },
            "safetySettings": [
                {
                    "category": "HARM_CATEGORY_HARASSMENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_HATE_SPEECH",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        }

        print("Sending request to Gemini API...")
        response = requests.post(
            GEMINI_API_URL,
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code != 200:
            print("Gemini API error:", response.text)
            return jsonify({"error": "Failed to get response from Gemini"}), response.status_code

        response_data = response.json()
        summary = response_data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "No summary generated.")

        # Post-process the summary to ensure proper formatting
        summary = summary.strip()
        
        # If summary is too short relative to input, make another request for more details
        if len(summary.split()) < len(text.split()) * 0.3:  # If summary is less than 30% of original
            supplementary_prompt = f"""
            Please provide additional important details for this summary, focusing on:
            - Any missing key points
            - Supporting evidence and examples
            - Technical details or specifications
            - Relevant context and implications
            
            Original text: {text}
            Current summary: {summary}
            """
            
            supplementary_payload = {
                "contents": [{
                    "parts": [{
                        "text": supplementary_prompt
                    }]
                }],
                "generationConfig": payload["generationConfig"]
            }
            
            supplementary_response = requests.post(
                GEMINI_API_URL,
                json=supplementary_payload,
                headers={"Content-Type": "application/json"}
            )
            
            if supplementary_response.status_code == 200:
                additional_details = supplementary_response.json().get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                summary = f"{summary}\n\nAdditional Details:\n{additional_details}"

        return jsonify({"summary": summary})

    except Exception as e:
        print("Error in summarize route:", str(e))
        return jsonify({"error": str(e)}), 500
    
GEMINI_API_URL_Doubts = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCLmXej8O5V1JciQaJBdtRBUhIBJ0wTy1k"

@app.route('/submit_doubt', methods=['POST'])
def submit_doubt():
    try:
        doubt_text = request.form.get('text', 'Please analyze this image')  # Default text if none provided
        doubt_image = request.files.get('image')

        payload = {
            "contents": [{
                "parts": []
            }]
        }
        
        # Always add text first
        payload["contents"][0]["parts"].append({"text": doubt_text})
        
        if doubt_image:
            image_bytes = doubt_image.read()
            encoded_image = base64.b64encode(image_bytes).decode('utf-8')
            
            payload["contents"][0]["parts"].append({
                "inline_data": {
                    "mime_type": doubt_image.content_type or "image/jpeg",
                    "data": encoded_image
                }
            })

        response = requests.post(GEMINI_API_URL_Doubts, json=payload, headers={"Content-Type": "application/json"})
        response.raise_for_status()
        
        result = response.json()
        text_response = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "No response")
        
        return jsonify({"status": "success", "response": [text_response]}), 200

    except requests.exceptions.RequestException as e:
        print(f"API Error: {e.response.text if hasattr(e, 'response') else str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500
    except Exception as e:
        print(f"Server Error: {str(e)}")
        return jsonify({"status": "error", "message": f"Server Error: {str(e)}"}), 500
    

if __name__ == "__main__":
    app.run(debug=True)