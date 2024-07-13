from flask import Flask
from .routes import DeformacionRoutes
from .routes import matchRoutes

app = Flask(__name__)
        

def init_app(config):
    # configuracion
    app.config.from_object(config)
    
    # rutas (blueprints)
    app.register_blueprint(DeformacionRoutes.main)
    app.register_blueprint(matchRoutes.main)
    
    return app