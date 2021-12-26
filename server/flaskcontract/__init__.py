from flask import Flask
from .config import ApplicationConfig
from flask_socketio import SocketIO

from flask_session import Session
from flaskcontract.models import db
from flask_bcrypt import Bcrypt
from flask_cors import CORS


from flask_swagger_ui import get_swaggerui_blueprint

from flask_migrate import Migrate

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

migrate = Migrate(app, db)

# swagger configuration
SWAGGER_URL = '/swagger'
API_URL = '/static/swagger.json'
SWAGGER_BLUEPRINT = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={
        'app_name': "Contractors collaboration tool specification"
    }
)
app.register_blueprint(SWAGGER_BLUEPRINT, url_prefix=SWAGGER_URL)
app.config.from_object(ApplicationConfig)
bcrypt = Bcrypt(app)
CORS(app, supports_credentials=True)
server_session = Session(app)
db.init_app(app)

with app.app_context():
    db.create_all()

from flaskcontract import routes