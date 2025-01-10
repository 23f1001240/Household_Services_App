from flask import Flask, render_template
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from database import db
from models import Service, Professional, Customer, ServiceRequest, Review

app = Flask(__name__)

app.secret_key = 'Sanjana123'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///project.sqlite3'
jwt = JWTManager(app)

db.init_app(app)
app.app_context().push()
with app.app_context():
    db.create_all()


@jwt.user_identity_loader
def user_identity_lookup(user):
    # Return the ID and role to distinguish between Customer and Professional
    return {"id": user.id, "role": user.__tablename__}

@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    identity = jwt_data["sub"]
    user_id = identity["id"]
    role = identity["role"]

    if role == "customer":
        return Customer.query.filter_by(id=user_id).first()
    elif role == "professional":
        return Professional.query.filter_by(id=user_id).first()
    return None

@app.route('/')
def hw():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)