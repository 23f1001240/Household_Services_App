from flask import Flask, render_template
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from database import db
from models import #update models in models

app = Flask(__name__)

app.secret_key = 'Sanjana123'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///project.sqlite3'
jwt = JWTManager(app)

db.init_app(app)
with app.app_context():
    db.create_all()


@jwt.user_identity_loader
def user_identity_lookup(user):
    return user.id

@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    identity = jwt_data["sub"]
    return User.query.filter_by(id=identity).first()

@app.route('/')
def hw():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)