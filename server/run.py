from flaskcontract import app
from flaskcontract import socketio
if __name__ == "__main__":
    socketio.run(app,debug=True)
