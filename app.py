from flask import Flask, render_template, request, Blueprint, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta
from werkzeug.security import generate_password_hash, check_password_hash
import os

from database import db
from models import Admin, Customer, Professional, Service, ServiceRequest

app = Flask(__name__)

app.secret_key = 'Sanjana123'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///project.sqlite3'

app.config['JWT_SECRET_KEY'] = 'IITM'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)  # 1-hour expiry

jwt = JWTManager(app)

db.init_app(app)
app.app_context().push()
with app.app_context():
    db.create_all()

#Admin Credentials
admin_email = "sanjana.nadendla@gmail.com"
if not Admin.query.filter_by(email=admin_email).first():
    admin_password = generate_password_hash("password", method='scrypt') # Password is "password"
    admin = Admin(
        name="Sanjana", 
        email=admin_email, 
        password=admin_password
        )
    db.session.add(admin)
    db.session.commit()
    print("Default admin created.")
else:
    print("Admin already exists.")

def add_predefined_services():
    predefined_services = [
        {"name": "Carpentry", "price": 1000.0},
        {"name": "Cleaning", "price": 2500.0},
        {"name": "Electrical", "price": 1200.0},
        {"name": "Gardening", "price": 900.0},
        {"name": "Painting", "price": 1500.0},
        {"name": "Plumbing", "price": 850.0},
        {"name": "Other", "price": 450.0}
    ]
    
    for service_data in predefined_services:
        if not Service.query.filter_by(name=service_data["name"]).first():
            new_service = Service(
                name=service_data["name"],
                price=service_data["price"]
            )
            db.session.add(new_service)
    
    db.session.commit()

add_predefined_services()

# -------------------authentication and authorization-----------------
auth = Blueprint('auth', __name__)

@auth.route('/auth/login', methods=['POST'])
def login_post():
    data = request.get_json()
    
    user = (Professional.query.filter_by(email=data["email"]).first() or 
            Customer.query.filter_by(email=data["email"]).first() or
            Admin.query.filter_by(email=data["email"]).first())
    
    if not user or not check_password_hash(user.password, data["password"]):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Determine user role
    if isinstance(user, Professional):
        role = 'professional'
    elif isinstance(user, Customer):
        role = 'customer'
    else:
        role = 'admin'

    # Create JWT token with user details
    access_token = create_access_token(identity={
        'id': user.id,
        'role': role,
        'email': user.email
    },
    expires_delta=timedelta(hours=1))
    
    user_data = {
        'id': user.id,
        'role': role,
        'email': user.email,
        'name': user.name,
        'auth_token': access_token
    }
    
    if role == 'professional':
        user_data['status'] = user.status
    
    response = jsonify({"message": "Login successful", "user": user_data})
    return response

UPLOAD_FOLDER = os.path.join('static', 'professional_resumes')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@auth.route('/auth/proregister', methods=['POST'])
def professional_register():
    try:
        # Access form data
        email = request.form.get('email')
        name = request.form.get('name')
        password = request.form.get('password')
        service_id = request.form.get('service_id')
        experience = request.form.get('experience')
        address = request.form.get('address')
        pincode = request.form.get('pincode')
        phone_number = request.form.get('phone_number')

        # Handle file upload
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        # File type validation
        allowed_extensions = {'pdf', 'jpg', 'jpeg', 'png'}
        if not file.filename.lower().endswith(tuple(allowed_extensions)):
            return jsonify({'error': 'Allowed file types: PDF, JPG, JPEG, PNG'}), 400
        
        file_data = file.read()

        # Validate if user already exists
        existing_user = Professional.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({'error': 'Professional already exists'}), 409

        # Check if service exists
        service = db.session.get(Service, service_id)
        if not service:
            return jsonify({'error': 'Invalid service'}), 400

        # Create a new professional
        new_professional = Professional(
            email=email,
            name=name,
            password=generate_password_hash(password, method='scrypt'),
            service_id=service_id,
            experience=experience,
            address=address,
            pincode=pincode,
            phone_number=phone_number,
            documents=file_data
        )

        db.session.add(new_professional)
        db.session.commit()

        # Generate access token
        access_token = create_access_token(identity={
            'id': new_professional.id,
            'role': 'professional',
            'email': new_professional.email
        })

        return jsonify({
            "message": "Professional registration successful. Awaiting approval.",
            "auth_token": access_token
        })

    except Exception as e:
        print(f"Error during professional registration: {e}")
        db.session.rollback()
        return jsonify({"error": "An error occurred while submitting the form."}), 500

@auth.route('/auth/custregister', methods=['POST'])
def customer_register():
    try:
        data = request.get_json()

        # Validate if user already exists
        existing_user = Customer.query.filter_by(email=data["email"]).first()
        if existing_user:
            return jsonify({'error': 'Customer already exists'}), 409

        # Create a new customer
        new_customer = Customer(
            email=data["email"],
            name=data["name"],
            password=generate_password_hash(data["password"], method='scrypt'),
            address=data.get("address"),
            pincode=data.get("pincode"),
            phone_number=data.get("phone_number")
        )

        db.session.add(new_customer)
        db.session.commit()

        # Generate access token
        access_token = create_access_token(identity={
            'id': new_customer.id,
            'role': 'customer',
            'email': new_customer.email
        })

        return jsonify({
            "message": "Customer registration successful",
            "auth_token": access_token
        })
    
    except Exception as e:
        print(f"Error during customer registration: {e}")
        db.session.rollback()
        return jsonify({"error": "An error occurred during registration."}), 500

app.register_blueprint(auth)

@app.route('/api/services', methods=['GET'])
def get_services():
    services = Service.query.all()
    return jsonify([{
        'id': service.id,
        'name': service.name,
        'price': service.price
    } for service in services])

@app.route('/')
def home():
    return render_template('index.html')

if __name__ == '__main__':
    #predefined_admin()
    app.run(debug=True)