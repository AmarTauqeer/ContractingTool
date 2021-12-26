from flask_sqlalchemy import SQLAlchemy
from uuid import uuid4
from datetime import datetime

db = SQLAlchemy()


def get_uuid():
    return uuid4().hex


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    email = db.Column(db.String(345), unique=True)
    password = db.Column(db.Text, nullable=False)


class Room(db.Model):
    __tablename__ = "room"
    room_id = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    room_name = db.Column(db.String(400), unique=True, nullable=False)
    created_by = db.Column(db.String(300), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now())
    members = db.relationship('RoomMember', backref='parent', cascade="all,delete")


class RoomMember(db.Model):
    __tablename__ = "room_member"
    room_member_id = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    user_id = db.Column('user_id', db.String(32), db.ForeignKey("users.id"), nullable=False)
    room_id = db.Column('room_id', db.String(32), db.ForeignKey("room.room_id", ondelete='cascade'), nullable=False)
    added_by = db.Column(db.String(300), nullable=False)
    added_at = db.Column(db.DateTime, nullable=False, default=datetime.now())
    is_room_admin = db.Column(db.Boolean, default=False)


class Chat(db.Model):
    __tablename__ = "chat"
    chat_id = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    room_member_id = db.Column('room_member_id', db.String(32), db.ForeignKey("room_member.room_member_id"),
                               nullable=False)
    room_id = db.Column('room_id', db.String(32), db.ForeignKey("room.room_id"),
                        nullable=False)

    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now())
    message = db.Column(db.String(400))
