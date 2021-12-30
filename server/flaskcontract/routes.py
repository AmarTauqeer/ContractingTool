from flaskcontract import app, socketio, bcrypt
# from flask_bcrypt import Bcrypt
from flaskcontract.models import Message, User, Room, RoomMember, db, ObligationSection
from flask import request, session
from flask.json import jsonify
from functools import wraps

'''
decorator for session
'''


def check_for_session(func):
    @wraps(func)
    def wrapped(*args, **kwargs):
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({"error": "Unauthorized"}), 401
        return func(*args, **kwargs)

    return wrapped


'''
end decorator for session
'''

'''
    Room, room members
'''


@app.route("/contract/api/add_room", methods=["POST"])
@check_for_session
def add_room():
    room_name = request.json["room_name"]
    created_by = request.json["created_by"]
    room_exists = Room.query.filter_by(room_name=room_name).first() is not None

    if room_exists:
        return jsonify({"error": "Room already exist with this name"}), 409

    new_room = Room(room_name=room_name, created_by=created_by)
    db.session.add(new_room)
    db.session.commit()

    return jsonify(
        {
            "id": new_room.room_id,
            "room_name": new_room.room_name,
            "created_by": new_room.created_by,
            "created_at": new_room.created_at,
        }
    ), 200


@app.route("/contract/api/add_obligation_section", methods=["POST"])
@check_for_session
def add_obligation_section():
    name = request.json["name"]
    room_id = request.json["room_id"]

    section_exists = ObligationSection.query.filter_by(name=name, room_id=room_id).first() is not None

    if section_exists:
        return jsonify({"error": "Section already exist with this name"}), 409

    new_section = ObligationSection(name=name, room_id=room_id)
    db.session.add(new_section)
    db.session.commit()

    return jsonify(
        {
            "id": new_section.id,
            "name": new_section.name,
            "room_id": new_section.room_id,
            "created_at": new_section.created_at,
        }
    ), 200


@app.route("/contract/api/get_obligation_section", methods=["GET"])
@check_for_session
def get_obligation_section():
    result = []
    sections = ObligationSection.query.all()
    for section in sections:
        data = {
            "id": section.id,
            "name": section.name,
            "room_id": section.room_id,
            "created_at": section.created_at,
        }
        result.append(data)
    return jsonify({"response": result}), 200


@app.route("/contract/api/add_members", methods=["POST"])
@check_for_session
def add_room_members():
    user_id = request.json["user_id"]
    room_id = request.json["room_id"]
    added_by = request.json["added_by"]

    room_member_exists = RoomMember.query.filter_by(user_id=user_id, room_id=room_id).first() is not None

    if room_member_exists:
        return jsonify({"error": "Room member already exist"}), 409

    new_room_member = RoomMember(user_id=user_id, room_id=room_id, added_by=added_by)
    # print(new_room_member.room_id)
    db.session.add(new_room_member)
    db.session.commit()

    return jsonify(
        {
            "id": new_room_member.room_id,
            "user_id": new_room_member.user_id,
            "added_by": new_room_member.added_by,
            "added_at": new_room_member.added_at,
        }
    ), 200


@app.route("/contract/api/get_room_by_id/<string:id>", methods=["GET"])
@check_for_session
def get_room_by_id(id):
    room = Room.query.filter_by(room_id=id).first()
    data = {
        "id": room.room_id,
        "room_name": room.room_name,
        "created_by": room.created_by,
        "created_at": room.created_at,
    }
    return jsonify({"response": data}), 200


@app.route("/contract/api/get_rooms", methods=["GET"])
@check_for_session
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
@check_for_session
def delete_room(id):
    delete_room = Room.query.filter_by(room_id=id).first()
    db.session.delete(delete_room)
    db.session.commit()
    return jsonify({"success": "Room deleted successfully."}), 200


@app.route("/contract/api/get_room_members/<string:roomid>", methods=["GET"])
@check_for_session
def get_room_members(roomid):
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
    return jsonify({"response": result}), 200


@app.route("/contract/api/get_room_member_byid/<string:id>", methods=["GET"])
@check_for_session
def get_room_member_byid(id):
    member = RoomMember.query.filter_by(room_member_id=id).first()
    user = User.query.filter_by(id=member.user_id).first()
    data = {
        "room_member_id": member.room_member_id,
        "user_id": member.user_id,
        "email": user.email,
        "added_by": member.added_by,
        "added_at": member.added_at,
    }
    return jsonify({"response": data}), 200


@app.route("/contract/api/delete_room_member/<string:id>", methods=["GET"])
@check_for_session
def delete_room_member(id):
    # check if Message exist
    Message = Message.query.filter_by(room_member_id=id).first()
    if Message:
        return jsonify({"Error": "Can't delete member Message messages exist"}), 200
    delete_member = RoomMember.query.filter_by(room_member_id=id).first()
    db.session.delete(delete_member)
    db.session.commit()
    return jsonify({"success": "Member deleted successfully."}), 200
