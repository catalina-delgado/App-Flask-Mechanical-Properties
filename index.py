from src import init_app
from settings import config

configuration = config['development']
app = init_app(configuration)

if __name__ =='__main__':
    app.run(host = '192.168.1.1', port=8081, debug=True)