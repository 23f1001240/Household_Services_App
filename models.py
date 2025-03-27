from database import db

class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    address = db.Column(db.String(250), nullable=True)
    phone_number = db.Column(db.String(15), nullable=True)
    pincode = db.Column(db.String(6), nullable=True)

class Professional(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey("service.id"), nullable=False) 
    phone_number = db.Column(db.String(15), nullable=True)
    address = db.Column(db.String(250), nullable=True)
    pincode = db.Column(db.String(6), nullable=True)
    experience = db.Column(db.String(250), nullable=False) 
    documents = db.Column(db.LargeBinary, nullable=True)
    status=db.Column(db.Boolean(),default=False)

    service = db.relationship("Service", backref=db.backref("professional", lazy=True))

class Service(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)

class ServiceRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey("customer.id"), nullable=False)
    professional_id = db.Column(db.Integer, db.ForeignKey("professional.id"), nullable=True)
    service_id = db.Column(db.Integer, db.ForeignKey("service.id"), nullable=False)
    date_of_request = db.Column(db.DateTime, nullable=False)
    remarks = db.Column(db.String(250))
    status = db.Column(db.String(80))
    rating = db.Column(db.Integer, nullable=True)

    customer = db.relationship("Customer", backref=db.backref("service_requests", lazy=True))
    professional = db.relationship("Professional", backref=db.backref("service_requests", lazy=True))
    service = db.relationship("Service", backref=db.backref("service_requests", lazy=True))