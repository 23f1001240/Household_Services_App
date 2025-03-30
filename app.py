from flask import Flask, render_template, request, Blueprint, jsonify, url_for, send_file
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from datetime import timedelta, date, datetime
from sqlalchemy import or_ #for multiple conditioning
from sqlalchemy.orm import joinedload
from sqlalchemy.sql import func #for mathematical functions
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
import os
import base64
import io

from database import db
from models import Admin, Customer, Professional, Service, ServiceRequest

app = Flask(__name__)
CORS(app)

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

# -------------------Blueprint for API calls and responses of Admin-----------------
admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/customers', methods=['GET'])
def get_customers():
    try:
        customers = Customer.query.all()
        results = [
            {
                'id': c.id,
                'name': c.name,
                'email': c.email,
                'phone_number': c.phone_number
            } for c in customers
        ]
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/summary', methods=['GET'])
def get_summary():
    try:
        # Fetch overall customer ratings (average rating per service from ServiceRequest table)
        ratings = db.session.query(Service.name, db.func.avg(ServiceRequest.rating).label('average_rating')) \
            .join(Service, Service.id == ServiceRequest.service_id) \
            .filter(ServiceRequest.rating.isnot(None)) \
            .group_by(Service.name).all()

        ratings_result = [
            {"service_name": r[0], "average_rating": round(r[1], 2) if r[1] else 0} for r in ratings
        ]

        # Fetch service requests summary (count per status)
        requests_summary = db.session.query(ServiceRequest.status, db.func.count().label('count')) \
            .group_by(ServiceRequest.status).all()

        requests_result = [{"status": r[0], "count": r[1]} for r in requests_summary]

        # Fetch services distribution (count per service)
        services_distribution = db.session.query(Service.name, db.func.count(ServiceRequest.id).label('count')) \
            .join(Service, Service.id == ServiceRequest.service_id) \
            .group_by(Service.name).all()

        services_result = [{"service_name": s[0], "count": s[1]} for s in services_distribution]

        # Fetch professionals status (count per approval status)
        professionals_status = db.session.query(Professional.status, db.func.count().label('count')) \
            .group_by(Professional.status).all()

        professionals_result = [{"status": p[0], "count": p[1]} for p in professionals_status]

        return jsonify({
            "ratings": ratings_result,
            "requestsSummary": requests_result,
            "servicesDistribution": services_result,
            "professionalsStatus": professionals_result
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
       
@admin_bp.route('/search', methods=['GET'])
def search():
    category = request.args.get('category', 'services')
    query = request.args.get('query', '').strip().lower()

    results = []
    
    try:
        if category == 'services':
            services = Service.query.filter(
                or_(Service.name.ilike(f'%{query}%'), Service.price.ilike(f'%{query}%'))
            ).all()
            results = [{'id': s.id, 'name': s.name, 'price': s.price} for s in services]
        
        elif category == 'customers':
            customers = Customer.query.filter(
                or_(
                    Customer.name.ilike(f'%{query}%'),
                    Customer.email.ilike(f'%{query}%'),
                    Customer.phone_number.ilike(f'%{query}%')
                )
            ).all()
            results = [{'id': c.id, 'name': c.name, 'email': c.email, 'phone_number': c.phone_number} for c in customers]
        
        elif category == 'professionals':
            professionals = Professional.query.filter(
                or_(
                    Professional.name.ilike(f'%{query}%'),
                    Professional.email.ilike(f'%{query}%'),
                    Professional.phone_number.ilike(f'%{query}%'),
                    Professional.experience.ilike(f'%{query}%')
                )
            ).all()
            results = [{
                'id': p.id,
                'name': p.name,
                'email': p.email,
                'service_id': p.service_id,
                'status': p.status
            } for p in professionals]
        
        elif category == 'requests':
            requests = ServiceRequest.query.filter(
                ServiceRequest.status.ilike(f'%{query}%')
            ).all()
            results = [{
                'id': r.id,
                'customer_id': r.customer_id,
                'professional_id': r.professional_id,
                'service_id': r.service_id,
                'date_of_request': r.date_of_request.isoformat(),
                'status': r.status
            } for r in requests]
        
        else:
            return jsonify({"error": "Invalid search category"}), 400

        return jsonify(results)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/services', methods=['GET', 'POST'])
def get_services():
    if request.method == 'GET':
        db.session.expire_all()
        
        services = Service.query.all()
        return jsonify([{
            'id': service.id,
            'name': service.name,
            'price': service.price
        } for service in services])
        
    elif request.method == 'POST':
        data = request.get_json()
        
        if not data or 'name' not in data or 'price' not in data:
            return jsonify({'error': 'Missing name or price'}), 400
            
        try:
            new_service = Service(
                name=data['name'],
                price=float(data['price'])
            )
            db.session.add(new_service)
            db.session.commit()
            
            return jsonify({
                'id': new_service.id,
                'name': new_service.name,
                'price': new_service.price
            }), 201
            
        except ValueError:
            return jsonify({'error': 'Invalid price format'}), 400
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

@admin_bp.route('/services/<int:id>', methods=['PUT', 'DELETE'])
def handle_service(id):
    try:
        service = Service.query.get_or_404(id)
        
        if request.method == 'PUT':
            data = request.get_json()
            if 'price' not in data:
                return jsonify({"error": "Price is required"}), 400
            
            service.price = float(data['price'])
            db.session.commit()
            
            return jsonify({
                "id": service.id,
                "name": service.name,
                "price": service.price
            })
        
        elif request.method == 'DELETE':
            db.session.delete(service)
            db.session.commit() 
            db.session.expire_all()
            
            return jsonify({
                "message": "Service deleted successfully",
                "deleted_id": id
            }), 200
            
    except ValueError:
        db.session.rollback()
        return jsonify({"error": "Invalid price format"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/professionals', methods=['GET'])
def get_professionals():
    try:
        professionals = Professional.query.options(
            joinedload(Professional.service)
        ).all()
        
        return jsonify([{
            "id": p.id,
            "name": p.name,
            "email": p.email,
            "phone": p.phone_number,
            "address": p.address,
            "pincode": p.pincode,
            "experience": p.experience,
            "service_id": p.service.id,
            "service_name": p.service.name,
            "status": p.status
        } for p in professionals])
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@admin_bp.route('/professionals/<int:id>/approve', methods=['PUT'])
def approve_professional(id):
    try:
        professional = Professional.query.get_or_404(id)
        
        # Only prevent duplicate approvals
        if professional.status == 'Approved':
            return jsonify({
                "error": "Professional already approved",
                "current_status": professional.status
            }), 400
            
        professional.status = "Approved"
        db.session.commit()
        
        return jsonify({
            "message": "Professional status updated to Approved",
            "professional": {
                "id": professional.id,
                "status": professional.status,
                "previous_status": "Rejected" if professional.status == 'Rejected' else 'Pending'
            }
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/professionals/<int:id>/reject', methods=['PUT'])
def reject_professional(id):
    try:
        professional = Professional.query.get_or_404(id)
        
        # Only prevent duplicate rejections
        if professional.status == 'Rejected':
            return jsonify({
                "error": "Professional already rejected",
                "current_status": professional.status
            }), 400
            
        professional.status = "Rejected"
        db.session.commit()
        
        return jsonify({
            "message": "Professional status updated to Rejected",
            "professional": {
                "id": professional.id,
                "status": professional.status,
                "previous_status": "Approved" if professional.status == 'Approved' else 'Pending'
            }
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/professionals/<int:id>', methods=['DELETE'])
def delete_professional(id):
    try:
        professional = Professional.query.get_or_404(id)
        db.session.delete(professional)
        db.session.commit()
        return jsonify({
            "message": "Professional deleted",
            "deleted_id": id
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

VALID_STATUSES = ['Requested', 'Accepted', 'In Progress', 'Completed', 'Cancelled']

@admin_bp.route('/service-requests')
def get_service_requests():
    try:
        requests = ServiceRequest.query.options(
            joinedload(ServiceRequest.customer),
            joinedload(ServiceRequest.professional),
            joinedload(ServiceRequest.service)
        ).order_by(ServiceRequest.date_of_request.desc()).all()
        
        return jsonify([{
            "id": r.id,
            "customer_name": r.customer.name,
            "customer_email": r.customer.email,
            "provider_name": r.professional.name if r.professional else None,
            "provider_email": r.professional.email if r.professional else None,
            "service_name": r.service.name,
            "date_of_request": r.date_of_request.isoformat(),
            "remarks": r.remarks,
            "status": r.status,
            "rating": r.rating
        } for r in requests])
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/service-requests/<int:id>', methods=['PUT'])
def update_request_status(id):
    try:
        request_data = ServiceRequest.query.get_or_404(id)
        new_status = request.json.get('status')
        
        if new_status not in VALID_STATUSES:
            return jsonify({"error": f"Invalid status. Must be one of: {VALID_STATUSES}"}), 400
        
        request_data.status = new_status
        db.session.commit()
        
        return jsonify({
            "message": "Request status updated",
            "updated_request": {
                "id": request_data.id,
                "new_status": request_data.status
            }
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# -------------------Blueprint for API calls and responses of Professional-----------------
prof_bp = Blueprint('professional', __name__, url_prefix='/api/professional')

@prof_bp.route('/summary', methods=['GET'])
def get_professional_summary():
    try:
        # Fetch customer ratings for professionals (from ServiceRequest table)
        ratings = db.session.query(Customer.name, ServiceRequest.rating) \
            .join(Customer, Customer.id == ServiceRequest.customer_id) \
            .filter(ServiceRequest.rating.isnot(None)) \
            .all()

        ratings_result = [
            {"customer_name": r[0], "rating": r[1]} for r in ratings
        ]

        # Fetch service requests summary (Received, Completed, Rejected)
        request_counts = db.session.query(
            func.count().label('total_requests'),
            func.sum(func.case([(ServiceRequest.status == "Completed", 1)], else_=0)).label('completed'),
            func.sum(func.case([(ServiceRequest.status == "Rejected", 1)], else_=0)).label('rejected')
        ).first()

        requests_result = {
            "received": request_counts.total_requests if request_counts.total_requests else 0,
            "completed": request_counts.completed if request_counts.completed else 0,
            "rejected": request_counts.rejected if request_counts.rejected else 0
        }

        return jsonify({
            "ratings": ratings_result,
            "serviceRequests": requests_result
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@prof_bp.route('/search', methods=['GET'])
def search_customers():
    query = request.args.get('query', '').strip().lower()
    category = request.args.get('category', 'customers')

    if not query:
        return jsonify({"error": "Search query cannot be empty"}), 400

    if category != 'customers':
        return jsonify({"error": "Invalid search category"}), 400

    results = []

    try:
        customers = Customer.query.filter(
            or_(
                Customer.name.ilike(f'%{query}%'),
                Customer.pincode.ilike(f'%{query}%'),
                Customer.phone_number.ilike(f'%{query}%')
            )
        ).all()

        results = [{
            'id': c.id,
            'name': c.name,
            'email': c.email,
            'phone_number': c.phone_number,
            'pincode': c.pincode,
            'address': c.address
        } for c in customers]

        return jsonify(results)

    except Exception as e:
        import traceback
        print("ERROR in /search:", traceback.format_exc()) 
        return jsonify({"error": str(e)}), 500

@prof_bp.route('/<int:id>/resume', methods=['GET'])
def get_resume(id):
    # Fetch the professional by ID
    professional = Professional.query.get(id)
    
    if not professional:
        return jsonify({'error': 'Professional not found'}), 404
    
    if not professional.documents:
        return jsonify({'error': 'No resume found for this professional'}), 404
    
    # Convert binary resume data to an in-memory file
    resume_data = io.BytesIO(professional.documents)
    
    # Detect the file type (assuming PDF)
    return send_file(resume_data, mimetype="application/pdf", download_name=f"resume_{id}.pdf", as_attachment=False)

    
@prof_bp.route('/today-services', methods=['GET'])
@jwt_required()
def today_services():
    professional_id = get_jwt_identity().get('id')
    today = date.today()
    
    services = ServiceRequest.query.filter(
        ServiceRequest.professional_id == professional_id,
        ServiceRequest.service_date == today,
        ServiceRequest.status.in_(['Pending', 'Accepted'])
    ).all()
    
    return jsonify([{
        "id": s.id,
        "customer_name": s.customer.name,
        "service_name": s.service.name,
        "service_time": s.service_time.strftime('%H:%M'),
        "location": s.location,
        "status": s.status
    } for s in services])

@prof_bp.route('/completed-services', methods=['GET'])
@jwt_required()
def completed_services():
    professional_id = get_jwt_identity().get('id')
    
    services = ServiceRequest.query.filter(
        ServiceRequest.professional_id == professional_id,
        ServiceRequest.status == 'Completed'
    ).order_by(ServiceRequest.service_date.desc()).limit(20).all()
    
    return jsonify([{
        "id": s.id,
        "customer_name": s.customer.name,
        "service_name": s.service.name,
        "completed_date": s.service_date.strftime('%Y-%m-%d'),
        "rating": s.rating,
        "feedback": s.feedback
    } for s in services])

@prof_bp.route('/pending-requests-count', methods=['GET'])
@jwt_required()
def pending_requests_count():
    professional_id = get_jwt_identity().get('id')
    count = ServiceRequest.query.filter(
        ServiceRequest.professional_id == professional_id,
        ServiceRequest.status == 'Pending'
    ).count()
    
    return jsonify({"count": count})

@prof_bp.route('/services/<int:service_id>/accept', methods=['PUT'])
@jwt_required()
def accept_service(service_id):
    professional_id = get_jwt_identity().get('id')
    service = ServiceRequest.query.filter_by(
        id=service_id,
        professional_id=professional_id
    ).first_or_404()
    
    service.status = 'Accepted'
    db.session.commit()
    
    return jsonify({"message": "Service accepted"})

@prof_bp.route('/services/<int:service_id>/reject', methods=['PUT'])
@jwt_required()
def reject_service(service_id):
    professional_id = get_jwt_identity().get('id')
    service = ServiceRequest.query.filter_by(
        id=service_id,
        professional_id=professional_id
    ).first_or_404()
    
    service.status = 'Rejected'
    db.session.commit()
    
    return jsonify({"message": "Service rejected"})

@prof_bp.route('/profile', methods=['GET', 'PUT'])
@jwt_required()
def professional_profile():
    professional_id = get_jwt_identity().get('id')
    professional = Professional.query.get_or_404(professional_id)
    
    if request.method == 'GET':
        return jsonify({
            "id": professional.id,
            "name": professional.name,
            "email": professional.email,
            "phone": professional.phone,
            "bio": professional.bio,
            "profile_pic": professional.profile_pic,
            "service": professional.service.name if professional.service else None
        })
    
    elif request.method == 'PUT':
        data = request.get_json()
        professional.name = data.get('name', professional.name)
        professional.phone = data.get('phone', professional.phone)
        professional.bio = data.get('bio', professional.bio)
        db.session.commit()
        
        return jsonify({"message": "Profile updated"})
@prof_bp.route('/upload-profile-pic', methods=['POST'])
@jwt_required()
def upload_profile_pic():
    # Verify authentication
    professional_id = get_jwt_identity().get('id')
    professional = Professional.query.get_or_404(professional_id)
    
    # Handle file upload
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    # File type validation
    allowed_extensions = {'jpg', 'jpeg', 'png'}
    if not file.filename.lower().endswith(tuple(allowed_extensions)):
        return jsonify({'error': 'Allowed file types: JPG, JPEG, PNG'}), 400

    try:
        # Secure filename and save
        filename = f"prof_{professional_id}_{secure_filename(file.filename)}"
        upload_path = os.path.join(app.config['UPLOAD_FOLDER'], 'profiles', filename)
        
        # Create directory if doesn't exist
        os.makedirs(os.path.dirname(upload_path), exist_ok=True)
        file.save(upload_path)

        # Update professional record
        professional.profile_pic = filename
        db.session.commit()

        return jsonify({
            'message': 'Profile picture uploaded successfully',
            'profile_pic': url_for('static', 
                                 filename=f"uploads/profiles/{filename}",
                                 _external=True)
        })

    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Profile pic upload failed: {str(e)}")
        return jsonify({'error': 'Failed to process image'}), 500

# -------------------Blueprint for API calls and responses of Customers-----------------
cust_bp = Blueprint('customer', __name__, url_prefix='/api/customer')
@cust_bp.route('/search', methods=['GET'])
@jwt_required()
def search_services():
    search_query = request.args.get('query', '').strip()
    
    # Base query with actual database data
    query = db.session.query(
        Service.id,
        Service.name,
        Service.price,
        Service.description,
        func.count(Professional.id).label('professionals_count')
    ).outerjoin(
        Professional, Professional.service_id == Service.id
    ).filter(
        Professional.status == 'Approved'
    ).group_by(
        Service.id
    )
    
    # Apply name filter only
    if search_query:
        query = query.filter(Service.name.ilike(f'%{search_query}%'))
    
    # Execute query and format results
    services = query.all()
    
    return jsonify([{
        'id': s.id,
        'name': s.name,
        'price': float(s.price),
        'description': s.description,
        'professionals_count': s.professionals_count
    } for s in services])

@cust_bp.route('/suggested', methods=['GET'])
@jwt_required()
def suggested_services():
    # Mock suggested services data
    suggested_services = [
        {
            'id': 1,
            'name': 'Plumbing',
            'price': 50.0,
            'description': 'Professional plumbing services',
            'avg_rating': 4.5,
            'reviews': 42,
            'professionals_count': 15
        },
        {
            'id': 2,
            'name': 'Electrical',
            'price': 70.0,
            'description': 'Certified electricians',
            'avg_rating': 4.2,
            'reviews': 35,
            'professionals_count': 12
        },
        {
            'id': 3,
            'name': 'Cleaning',
            'price': 30.0,
            'description': 'Thorough cleaning services',
            'avg_rating': 4.7,
            'reviews': 58,
            'professionals_count': 20
        },
        {
            'id': 4,
            'name': 'Gardening',
            'price': 40.0,
            'description': 'Landscaping and garden maintenance',
            'avg_rating': 4.3,
            'reviews': 27,
            'professionals_count': 8
        }
    ]
    
    return jsonify(suggested_services)

@cust_bp.route('/service-requests', methods=['POST'])
@jwt_required()
def create_service_request():
    customer_id = get_jwt_identity().get('id')
    data = request.get_json()
    
    # Validate input
    if not data.get('service_id'):
        return jsonify({'error': 'Service ID is required'}), 400
    
    if not data.get('requested_date'):
        return jsonify({'error': 'Requested date is required'}), 400
    
    try:
        # Create new service request
        new_request = ServiceRequest(
            customer_id=customer_id,
            service_id=data['service_id'],
            date_of_request=datetime.utcnow(),
            requested_date=datetime.strptime(data['requested_date'], '%Y-%m-%d').date(),
            remarks=data.get('remarks', ''),
            status='Pending'
        )
        
        db.session.add(new_request)
        db.session.commit()
        
        return jsonify({
            'message': 'Service request created successfully',
            'request_id': new_request.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# -------------------Blueprint for authentication and authorization-----------------
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
    


app.register_blueprint(admin_bp)
app.register_blueprint(prof_bp)
app.register_blueprint(cust_bp) 
app.register_blueprint(auth)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/services', methods=['GET'])
def get_services():
    services = Service.query.all()
    return jsonify([{
        'id': s.id,
        'name': s.name,
        'price': s.price
    } for s in services])

if __name__ == '__main__':
    #predefined_admin()
    app.run(debug=True)