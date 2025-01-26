from app import db

class Material(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    subject = db.Column(db.String(100), nullable=False)
    standard = db.Column(db.String(50), nullable=False)
    content = db.Column(db.Text, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "subject": self.subject,
            "standard": self.standard,
            "content": self.content
        }
