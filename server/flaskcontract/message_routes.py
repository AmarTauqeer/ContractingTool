from flaskcontract import app, socketio
from flaskcontract.models import Message,RoomMember, db,User
from flask import request
from flask.json import jsonify
import datetime
from flaskcontract.routes import check_for_session


@socketio.on("Message")
def handle_message_event(data):
    created_at = datetime.datetime.strptime(data['created_at'], "%a %b %d %Y %H:%M:%S %Z")
    new_message = Message(room_member_id=data['room_member_id'], room_id=data['room_id'], message=data['message'],
                            created_at=created_at, obligation_section_id=data['sectionId'])
    print(new_message)
    db.session.add(new_message)
    db.session.commit()

    socketio.emit("Message", data)


'''
routes for message
'''


@app.route("/contract/api/add_message", methods=["POST"])
@check_for_session
def add_message():
    room_member_id = request.json["room_member_id"]
    room_id = request.json["room_id"]
    message = request.json["message"]

    new_message = Message(room_member_id=room_member_id, room_id=room_id, message=message)
    db.session.add(new_message)
    db.session.commit()

    return jsonify(
        {
            "Success": "Record has been inserted successfully"
        }
    ), 200


@app.route("/contract/api/message/<string:roomid>", methods=["GET"])
@check_for_session
def get_message_data(roomid):
    resulted_arry = []
    messages = Message.query.filter_by(room_id=roomid).all()
    print(messages)
    for msg in messages:
        room_member = RoomMember.query.filter_by(room_member_id=msg.room_member_id, room_id=msg.room_id).all()
        for memeber in room_member:
            user = User.query.filter_by(id=memeber.user_id).first()

            data = {
                "message_id": msg.message_id,
                "room_member_id": msg.room_member_id,
                "email": user.email,
                "room_id": msg.room_id,
                "message": msg.message,
                "created_at": msg.created_at,
            }
            resulted_arry.append(data)
    # print(resulted_arry)
    if len(resulted_arry) != 0:
        return jsonify({"response": resulted_arry}), 200
    else:
        return jsonify({"Error": "No record is found or there are some issues"}), 202


@app.route("/contract/api/message/delete/<string:roomid>", methods=["DELETE"])
@check_for_session
def delete_message_data(roomid):
    messages = Message.query.filter_by(room_id=roomid).all()
    for message in messages:
        delete_message = Message.query.filter_by(message_id=message.message_id, room_id=roomid).first()
        db.session.delete(delete_message)
    db.session.commit()

    return jsonify({"Success": "Message deleted from the room"}), 200


'''
end routes for message
'''