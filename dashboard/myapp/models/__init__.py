from myapp import db
import time


class Cluster(db.Model):
    __tablename__ = 'cluster'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True, nullable=False)
    queue_address = db.Column(db.String(255), nullable=False)
    queue_size = db.Column(db.Integer)

    def __repr__(self):
        return '<Cluster %r>' % self.name


class Node(db.Model):
    __tablename__ = 'node'
    id = db.Column(db.Integer, primary_key=True)
    cluster_id = db.Column(db.Integer, db.ForeignKey('cluster.id'), nullable=False)
    cluster = db.relationship('Cluster', backref=db.backref('nodes', lazy='dynamic'))
    ip = db.Column(db.String(255), unique=True, nullable=False)
    size = db.Column(db.Integer, nullable=False)
    used = db.Column(db.Integer)

    def __repr__(self):
        return '<Node %r>' % self.ip


class BackupType(db.Model):
    __tablename__ = 'backup_type'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False, unique=True)

    def to_json(self):
        return {'id': self.id, 'name': self.name}

    def __repr__(self):
        return '<backup_type %r>' % self.name


class Business(db.Model):
    __tablename__ = 'business'
    id = db.Column(db.Integer, primary_key=True)
    business_id = db.Column(db.Integer, nullable=False, unique=True)
    name = db.Column(db.String(255))

    def to_json(self):
        return {'id': self.id, 'name': self.name}

    def __repr__(self):
        return '<business %r>' % self.name


class BackupInstance(db.Model):
    __tablename__ = 'backup_instance'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    server_id = db.Column(db.String(255), nullable=False)

    backup_type_id = db.Column(db.Integer, db.ForeignKey('backup_type.id'), nullable=False)
    backup_type = db.relationship('BackupType', backref=db.backref('backupinstances', lazy='dynamic'))
    business_id = db.Column(db.Integer, db.ForeignKey('business.id'), nullable=False)
    business = db.relationship('Business', backref=db.backref('backupinstances', lazy='dynamic'))
    instance = db.Column(db.Integer, nullable=False)


class User(db.Model):
    def __init__(self, name='', account='', status=1):
        self.name = name
        self.account = account
        self.create_time = int(time.time())
        self.status = status

    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True)
    account = db.Column(db.String(255), unique=True)
    create_time = db.Column(db.Integer)
    status = db.Column(db.Integer)
    focus_business = db.Column(db.Text)

    def to_json(self):
        return {'id': self.id,
                'name': self.name,
                'account': self.account,
                'create_time': self.create_time,
                'status': self.status,
                }

    def save(self):
        db.session.add(self)
        db.session.commit()

    def is_authenticated(self):
        return True

    def is_active(self):
        return True

    def get_id(self):
        return unicode(self.id)

    def __repr__(self):
        return '<User %r>' % self.name
