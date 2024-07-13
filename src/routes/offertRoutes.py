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

@main.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = next((p for p in products if p['id'] == product_id), None)
    if product:
        return jsonify(product)
    else:
        return jsonify({'error': 'Product not found'}), 404

@main.route('/api/products', methods=['POST'])
def add_product():
    new_product = request.json
    new_product['id'] = max(p['id'] for p in products) + 1
    products.append(new_product)
    with open('products.json', 'w') as f:
        json.dump(products, f)
    return jsonify(new_product), 201
    product = next((p for p in products if p['id'] == product_id), None)
    if product:
        return jsonify(product)
    else:
        return jsonify({'error': 'Product not found'}), 404

@main.route('/api/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    product = next((p for p in products if p['id'] == product_id), None)
    if product:
        updates = request.json
        for key, value in updates.items():
            product[key] = value
        with open('products.json', 'w') as f:
            json.dump(products, f)
        return jsonify(product)
    else:
        return jsonify({'error': 'Product not found'}), 404
    
@main.route('/api/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    global products
    products = [p for p in products if p['id'] != product_id]
    with open('products.json', 'w') as f:
        json.dump(products, f)
    return '', 204