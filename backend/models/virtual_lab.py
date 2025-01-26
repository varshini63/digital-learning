from app import db

class VirtualLab(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    subject = db.Column(db.String(100), nullable=False)
    standard = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=True)

    def __init__(self, subject, standard, description=None):
        self.subject = subject
        self.standard = standard
        self.description = description

    def to_dict(self):
        return {
            "id": self.id,
            "subject": self.subject,
            "standard": self.standard,
            "description": self.description
        }

    def __repr__(self):
        return f'<VirtualLab {self.subject} - {self.standard}>'
