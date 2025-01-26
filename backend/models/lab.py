from app import db

class VirtualLab(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    experiment_name = db.Column(db.String(100), nullable=False)
    subject = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    video_url = db.Column(db.String(200), nullable=False)  # AI-generated video URL

    def to_dict(self):
        return {
            "id": self.id,
            "experiment_name": self.experiment_name,
            "subject": self.subject,
            "description": self.description,
            "video_url": self.video_url
        }
