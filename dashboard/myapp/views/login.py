from myapp import app
from flask_login import current_user, login_user, logout_user, LoginManager, login_required
import requests
from myapp.models import User
from flask import redirect, request, render_template

login_manager = LoginManager(app)
login_manager.login_view = 'login'


@login_manager.user_loader
def load_user(id):
    return User.query.filter_by(id=id).first()


@app.route('/login', methods=['POST', 'GET'])
def login():
    user_name = request.form.get('username', '')
    user_password = request.form.get('password', '')
    if user_name != '' and user_password != '':
        user = User.query.filter_by(account=user_name).first()
        if not user:
            user = User(name='', account=user_name)
            user.save()
        login_user(user)
        return redirect('/#/index')
    else:
        return render_template('login.html')


@login_required
@app.route('/logout', methods=['GET'])
def logout():
    logout_user()
    return redirect('/login')
