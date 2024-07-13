from flask import Blueprint, render_template, jsonify, request
import pandas as pd
import json
import os

main = Blueprint('match_blueprint',__name__, template_folder='../templates')

@main.route('/layout')
def plotting():
    return render_template('layout.html')

import json
ruta_json = os.path.abspath(os.path.join(os.path.dirname(__file__),'..','static/json','products.json'))
with open(ruta_json) as f:
    products = json.load(f)

@main.route('/api/products', methods=['GET'])
def get_products():
    return jsonify(products)
