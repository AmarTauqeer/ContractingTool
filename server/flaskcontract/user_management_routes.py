from flaskcontract import app, socketio, bcrypt
from flaskcontract.models import User, db
from flask import request, session
from flask.json import jsonify
from flaskcontract.routes import check_for_session

'''
routes for user management
'''


@app.route("/contract/api/get_user", methods=["GET"])
@check_for_session
def get_current_user():
    user_id = session.get("user_id")
    if user_id:
        user = User.query.filter_by(id=user_id).first()
        if user:
            return jsonify(
                {
                    "id": user.id,
                    "email": user.email,
                    "phone": user.phone,
                    "address": user.address,
                    "user_type": user.user_type,
                    "city": user.city,
                    "state": user.state,
                    "country": user.country,
                }
            ), 200
        else:
            return jsonify({"error": "user doesn't exist"}),200
    else:
        return jsonify({"error":"You are not logged in"}),200



@app.route("/contract/api/get_user_by_id/<string:id>", methods=["GET"])
@check_for_session
def get_user_by_id(id):
    user = User.query.filter_by(id=id).first()
    return jsonify(
        {
            "id": user.id,
            "email": user.email,
        }
    ), 200


@app.route("/contract/api/get_all_users", methods=["GET"])
@check_for_session
def get_all_user():
    resulted_arry = []
    users = User.query.all()
    for user in users:
        data = {
            "id": user.id,
            "email": user.email,
            "phone": user.phone,
            "address": user.address,
            "user_type": user.user_type,
            "city": user.city,
            "state": user.state,
            "country": user.country,
        }
        resulted_arry.append(data)

    if len(resulted_arry) != 0:
        return jsonify({"response": resulted_arry}), 200
    else:
        return jsonify({"Error": "No record is found or there are some issues"}), 202


@app.route("/contract/api/register", methods=["POST"])
def register_user():
    email = request.json["email"]
    password = request.json["password"]

    user_exists = User.query.filter_by(email=email).first() is not None

    if user_exists:
        return jsonify({"error": "User already exist with this email"}), 409

    hashed_password = bcrypt.generate_password_hash(password)
    new_user = User(email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    session["user_id"] = new_user.id

    return jsonify({"response": "New user created"}), 200


@app.route("/contract/api/login", methods=["POST"])
def login_user():
    email = request.json["email"]
    password = request.json["password"]

    user = User.query.filter_by(email=email).first()

    if user is None:
        return jsonify({"error": "Unauthorized"}), 401

    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": "Unauthorized"}), 401

    session["user_id"] = user.id

    return jsonify(
        {
            "id": user.id,
            "email": user.email,
        }
    ), 200


@app.route("/contract/api/logout", methods=["GET"])
@check_for_session
def logout_user():
    session.pop("user_id")
    return jsonify({"logout": "logout successfully"}), 200


'''
end routes for user management
'''
