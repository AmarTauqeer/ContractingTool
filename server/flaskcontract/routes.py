from flaskcontract import app, socketio,bcrypt
# from flask_bcrypt import Bcrypt
import datetime
from flaskcontract.models import Chat, User, Room, RoomMember, db
from flask_apispec import marshal_with
from marshmallow import Schema, fields
from flask import request, session
from flask.json import jsonify

# bcrypt=Bcrypt(app)

@socketio.on("chat")
def handle_chat_event(data):
    created_at = datetime.datetime.strptime(data['created_at'], "%a %b %d %Y %H:%M:%S %Z")
    new_chat_message = Chat(room_member_id=data['room_member_id'], room_id=data['room_id'], message=data['message'],
                            created_at=created_at)
    db.session.add(new_chat_message)
    db.session.commit()

    socketio.emit("chat", data)


class AuthenticationSchema(Schema):
    Email = fields.String(required=False, description="Email")
    Password = fields.String(required=False, description="Password")


class RoomSchema(Schema):
    RoomName = fields.String(required=False, description="Room name")
    CreatedBy = fields.String(required=False, description="Created by")
    CreatedAt = fields.DateTime(required=False, description="Created at")
    UserId = fields.String(required=False, description="User id")


class RoomMemberSchema(Schema):
    RoomMemberName = fields.String(required=False, description="Room member name")
    RoomId = fields.String(required=False, description="Room id")
    AddedBy = fields.String(required=False, description="Added by")
    AddedAt = fields.DateTime(required=False, description="Added at")


@app.route("/contract/api/addmessage", methods=["POST"])
@marshal_with(RoomSchema)
def add_chat_message():
    room_member_id = request.json["room_member_id"]
    room_id = request.json["room_id"]
    message = request.json["message"]

    new_chat = Chat(room_member_id=room_member_id, room_id=room_id, message=message)
    db.session.add(new_chat)
    db.session.commit()

    return jsonify(
        {
            "Success": "Record has been inserted successfully"
        }
    ), 200


@app.route("/contract/api/chat/<string:roomid>")
def get_chat_data(roomid):
    resulted_arry = []
    chat_messages = Chat.query.filter_by(room_id=roomid).all()
    for chat in chat_messages:
        room_member = RoomMember.query.filter_by(room_member_id=chat.room_member_id, room_id=chat.room_id).all()
        for memeber in room_member:
            user = User.query.filter_by(id=memeber.user_id).first()

            data = {
                "chat_id": chat.chat_id,
                "room_member_id": chat.room_member_id,
                "email": user.email,
                "room_id": chat.room_id,
                "message": chat.message,
                "created_at": chat.created_at,
            }
            resulted_arry.append(data)
    # print(resulted_arry)
    if len(resulted_arry) != 0:
        return jsonify({"response": resulted_arry}), 200
    else:
        return jsonify({"Error": "No record is found or there are some issues"}), 202


@app.route("/contract/api/get_user")
def get_current_user():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    user = User.query.filter_by(id=user_id).first()
    return jsonify(
        {
            "id": user.id,
            "email": user.email,
        }
    )


@app.route("/contract/api/get_user_by_id/<string:id>")
def get_user_by_id(id):
    user = User.query.filter_by(id=id).first()
    return jsonify(
        {
            "id": user.id,
            "email": user.email,
        }
    ), 200


@app.route("/contract/api/get_all_users")
def get_all_user():
    # user_id = session.get("user_id")
    #
    # if not user_id:
    #     return jsonify({"error": "Unauthorized"}), 401

    resulted_arry = []
    users = User.query.all()
    for user in users:
        data = {
            "id": user.id,
            "email": user.email,
        }
        resulted_arry.append(data)

    if len(resulted_arry) != 0:
        return jsonify({"response": resulted_arry}), 200
    else:
        return jsonify({"Error": "No record is found or there are some issues"}), 202


@app.route("/contract/api/register", methods=["POST"])
@marshal_with(AuthenticationSchema)
def register_user():
    email = request.json["email"]
    password = request.json["password"]

    user_exists = User.query.filter_by(email=email).first() is not None

    if user_exists:
        return jsonify({"error": "User already exist with this email"}), 409


    hashed_password = bcrypt.generate_password_hash(password)
    # print("haspassword  : {}".format(hashed_password))
    new_user = User(email=email, password=hashed_password)
    # print("new user password  : {}".format(new_user.password))
    db.session.add(new_user)
    db.session.commit()
    session["user_id"] = new_user.id

    return jsonify({"response": "New user created"}), 200


@app.route("/contract/api/login", methods=["POST"])
@marshal_with(AuthenticationSchema)
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
    )


@app.route("/logout", methods=["POST"])
def logout_user():
    session.pop("user_id")
    return "200"


'''
    Room and room members
'''


@app.route("/contract/api/addroom", methods=["POST"])
@marshal_with(RoomSchema)
def add_room():
    room_name = request.json["room_name"]
    created_by = request.json["created_by"]

    room_exists = Room.query.filter_by(room_name=room_name).first() is not None

    if room_exists:
        return jsonify({"error": "Room already exist with this name"}), 409

    new_room = Room(room_name=room_name, created_by=created_by)
    print(new_room.room_id)
    db.session.add(new_room)
    db.session.commit()

    return jsonify(
        {
            "id": new_room.room_id,
            "room_name": new_room.room_name,
            "created_by": new_room.created_by,
            "created_at": new_room.created_at,
        }
    )


@app.route("/contract/api/addmembers", methods=["POST"])
@marshal_with(RoomMemberSchema)
def add_room_members():
    request_data = request.get_json()

    for data in request_data:
        record = {
            'user_id': data["user_id"],
            'room_id': data["room_id"],
            'added_by': data["added_by"],

        }
        # print(record)
        member_exists = RoomMember.query.filter_by(user_id=record["user_id"],
                                                   room_id=record["room_id"]).first() is not None
        if member_exists:
            pass
            # return jsonify({"error": "Member already exist with this name"}), 409
        else:
            new_room_member = RoomMember(user_id=record["user_id"], room_id=record["room_id"],
                                         added_by=record["added_by"])
            db.session.add(new_room_member)
        db.session.commit()

    return jsonify({"Success": "Members inserted successfully"}), 200

    # member_exists = RoomMember.query.filter_by(user_id=user_id, room_id=room_id).first() is not None
    #
    # if member_exists:
    #     return jsonify({"error": "Member already exist with this name"}), 409
    #
    # new_room_member = RoomMember(user_id=user_id,room_id=room_id, added_by=added_by)
    # db.session.add(new_room_member)
    # db.session.commit()


@app.route("/contract/api/get_room_by_id/<string:id>")
def get_room_by_id(id):
    room = Room.query.filter_by(room_id=id).first()
    data = {
        "id": room.room_id,
        "room_name": room.room_name,
        "created_by": room.created_by,
        "created_at": room.created_at,
    }
    return jsonify({"response": data}), 200


@app.route("/contract/api/get_rooms")
def get_rooms():
    result = []
    rooms = Room.query.all()
    for room in rooms:
        data = {
            "id": room.room_id,
            "room_name": room.room_name,
            "created_by": room.created_by,
            "created_at": room.created_at,
        }
        result.append(data)
    return jsonify({"response": result}), 200


@app.route("/contract/api/delete_room/<string:id>", methods=["GET"])
def delete_room(id):
    delete_room = Room.query.filter_by(room_id=id).first()
    db.session.delete(delete_room)
    db.session.commit()
    return jsonify({"success": "Room deleted successfully."}), 200


@app.route("/contract/api/get_room_members/<string:roomid>", methods=["GET"])
def get_room_members(roomid):
    # print(roomid)
    result = []
    members = RoomMember.query.filter_by(room_id=roomid).all()
    for member in members:
        data = {
            "id": member.room_member_id,
            "user_id": member.user_id,
            "added_by": member.added_by,
            "added_at": member.added_at,
        }
        result.append(data)
        # print(result)
    return jsonify({"response": result}), 200


@app.route("/contract/api/get_room_member_byid/<string:id>", methods=["GET"])
def get_room_member_byid(id):
    member = RoomMember.query.filter_by(room_member_id=id).first()
    user = User.query.filter_by(id=member.user_id).first()
    # print(member.room_member_id)
    data = {
        "room_member_id": member.room_member_id,
        "user_id": member.user_id,
        "email": user.email,
        "added_by": member.added_by,
        "added_at": member.added_at,
    }
    # print(result)
    return jsonify({"response": data}), 200


@app.route("/contract/api/delete_room_member/<string:id>", methods=["GET"])
def delete_room_member(id):
    delete_member = RoomMember.query.filter_by(room_member_id=id).first()
    db.session.delete(delete_member)
    db.session.commit()
    return jsonify({"success": "Member deleted successfully."}), 200
