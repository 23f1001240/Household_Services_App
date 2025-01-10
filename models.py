from database import db

class Service(db.Model):
    __tablename__ = 'service'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String, nullable=False, unique=True)
    base_price = db.Column(db.Float, nullable=False)
    time_required = db.Column(db.Integer, nullable=False)  # in minutes
    description = db.Column(db.String(1000))

    professionals = db.relationship('Professional', backref='service', lazy=True)
    service_requests = db.relationship('ServiceRequest', backref='service', lazy=True)

class Professional(db.Model):
    __tablename__ = 'professional'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String, nullable=False)
    address = db.Column(db.String, nullable=False)
    pincode = db.Column(db.String, nullable=False)
    date_created = db.Column(db.DateTime, nullable=False)
    description = db.Column(db.String(1000))
    service_id = db.Column(db.Integer, db.ForeignKey('service.id'), nullable=False)
    experience = db.Column(db.Integer, nullable=False)  # in years
    profile_docs = db.Column(db.BLOB, nullable=True)
    approved = db.Column(db.Boolean, default=False)
    rating = db.Column(db.Float, nullable=True)

    reviews = db.relationship('Review', backref='professional', lazy=True)
    service_requests = db.relationship('ServiceRequest', backref='professional', lazy=True)

class Customer(db.Model):
    __tablename__ = 'customer'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    address = db.Column(db.String, nullable=False)
    pincode = db.Column(db.String, nullable=False)
    date_joined = db.Column(db.DateTime, nullable=False)

    reviews = db.relationship('Review', backref='customer', lazy=True)
    service_requests = db.relationship('ServiceRequest', backref='customer', lazy=True)

class ServiceRequest(db.Model):
    __tablename__ = 'service_request'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    service_id = db.Column(db.Integer, db.ForeignKey('service.id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    professional_id = db.Column(db.Integer, db.ForeignKey('professional.id'), nullable=True)
    date_of_request = db.Column(db.DateTime, nullable=False)
    date_of_completion = db.Column(db.DateTime, nullable=True)
    service_status = db.Column(db.String, nullable=False, default='requested')  # requested/assigned/closed
    remarks = db.Column(db.String, nullable=True)

class Review(db.Model):
    __tablename__ = 'review'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    professional_id = db.Column(db.Integer, db.ForeignKey('professional.id'), nullable=False)
    rating = db.Column(db.Float, nullable=False)  # 1.0 to 5.0
    review_text = db.Column(db.String, nullable=True)
    date_posted = db.Column(db.DateTime, nullable=False)
