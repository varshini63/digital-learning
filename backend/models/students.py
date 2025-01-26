from app import db

class Student(db.Model):
    __tablename__ = 'users_studs'  # Updated table name

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)  # Unique username
    email = db.Column(db.String(100), unique=True, nullable=False)  # Unique email
    phone = db.Column(db.String(10), unique=True, nullable=False)  # Unique phone number
    name = db.Column(db.String(100), nullable=False)
    dwelling_area = db.Column(db.String(200), nullable=False)
    standard = db.Column(db.String(10), nullable=False)
    medium = db.Column(db.String(50), nullable=False)
    board = db.Column(db.String(100))  # This can store a single syllabus (e.g., State or CBSE)
    password = db.Column(db.String(200), nullable=False)

    def __init__(self, username, email, phone, name, dwelling_area, standard, medium, board, password):
        self.username = username
        self.email = email
        self.phone = phone
        self.name = name
        self.dwelling_area = dwelling_area
        self.standard = standard
        self.medium = medium
        self.board = board
        self.password = password

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'phone': self.phone,
            'name': self.name,
            'dwelling_area': self.dwelling_area,
            'standard': self.standard,
            'medium': self.medium,
            'board': self.board,
            'password': self.password,
        }

    @staticmethod
    def find_by_username(username):
        """Find a student by username."""
        return Student.query.filter_by(username=username).first()
    
    @staticmethod
    def find_by_email(email):
        """Find a student by email."""
        return Student.query.filter_by(email=email).first()

