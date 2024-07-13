from flask import Blueprint, render_template, jsonify, request
from sklearn import linear_model
from scipy.optimize import curve_fit
from scipy.integrate import quad
import pandas as pd
import numpy as np
import json
import os

main = Blueprint('deformacion_blueprint',__name__, template_folder='../templates')

@main.route('/')
def plotting():
    ruta_html = os.path.abspath(os.path.join(os.path.dirname(__file__),'..','templates','index.html'))
    return render_template('index.html')

@main.route('/procesar_datos', methods=['GET'])
def procesar_datos():
    try:
        data = request.get_json()
        df = pd.DataFrame(json.loads(data))
        Force = df.FORCE.tolist()
        Extencion = df.EXT.tolist()
        Large = df.POSIT.tolist()
        Datos = {'carga':Force, 'deformacion':Extencion, 'alargamiento':Large}
        caracteristica = obtener_caracteristica(Datos)
        under_curve = obtener_simulated_data(Datos)
        
        return jsonify({'Datos':Datos, 
                'caracteristica':caracteristica, 
                'under_curve':under_curve})
    except Exception as e:
        return jsonify({'error':str(e)})
        

@main.route('/get_datos', methods=['GET'])
def cargar_datos():
    try:
        ruta_xlsx = os.path.join(os.path.dirname(__file__),'..','database','1020.xlsx')
        data = pd.read_excel(ruta_xlsx)
        esfuerzo = data.CH6.tolist() #Fuerza aplicada en N
        deformacion = data.CH5.tolist() #alargamiento del especímen %
        alargamiento = data.POSIT.tolist() #alargamiento del especímen
        Datos = {'carga':esfuerzo, 'deformacion':deformacion, 'alargamiento':alargamiento}
        caracteristica = obtener_caracteristica(Datos)
        under_curve = obtener_simulated_data(Datos)
        
        return jsonify({'Datos':Datos, 
                'caracteristica':caracteristica, 
                'under_curve':under_curve})
    except Exception as e:
        return jsonify({'error':str(e)})

def param(esfuerzo, deformacion, alargamiento):
    Sigma = []
    Epsilon = []
    delta_l = []
    
    for i, element in enumerate(esfuerzo):
        if element > 500 and element < 1500:
            Sigma.append(element)
            epsilon = deformacion[i]
            Epsilon.append(epsilon)
            delta_l.append(alargamiento[i])
            
    regresion_lineal = linear_model.LinearRegression() # instancia de LinearRegression
    regresion_lineal.fit(np.reshape(Epsilon,(-1,1)), Sigma)
    E = 1.4*regresion_lineal.coef_/100
    
    estimado_sigma = regresion_lineal.predict(np.reshape(Epsilon,(-1,1)))
    rho = np.corrcoef(Epsilon, estimado_sigma)
    Sy_sigma = np.amax(Sigma)
    sd_e = deformacion[np.where(esfuerzo==Sy_sigma)[0][0]]
    
    return {'E':E, 'sy':Sy_sigma, 'sut':np.amax(esfuerzo)}

def obtener_caracteristica(Datos):
    esfuerzo = Datos['carga']
    deformacion = Datos['deformacion']
    alargamiento = Datos['alargamiento']
    elongacion = np.max(alargamiento)
    esfuerzo_ultimo = np.max(esfuerzo)
    esfuerzo_fractura = esfuerzo[len(esfuerzo)-1]
    
    propiedades = param(esfuerzo, deformacion, alargamiento)
    
    caracteristicas = {'Sy':propiedades['sy'], 
                       'Sf':propiedades['sut'], 
                       'E':str(propiedades['E']), 
                       'dL':elongacion}
    
    return {'success':True, 'data':caracteristicas}

def maxwell(t, E, eta):
    return E * (1-np.exp(-t / eta))*3.4

def potencia_series(e, *N):
    #  ecuación constitutiva de fluencia
    # e - variable independiente, deformación
    # N - arreglo de parámetros de la serie k y n
    
    a = len(N) // 2  # Dividir los parámetros en K y n
    k = N[:a] # k - coeficientes de la serie
    n = N[a:] # n - numero de parámetros de la serie
    resultado = 0
    for i in range(a):
        resultado += k[i] * e**n[i]
    return resultado

def points_key(x, sigma_pred):
    # x variable independiente - deformacion
    # sigma_pred variable dependiente - esfuerzo predicho
    
    derivada_esfuerzo = np.gradient(sigma_pred, x)
    umbral_derivada = 1e-3
    indice = None
    for i, valor in enumerate(derivada_esfuerzo):
        if  valor < umbral_derivada:
            indice = i
            break
    return x[indice], derivada_esfuerzo

def obtener_simulated_data(Datos):
    
    xata = Datos['deformacion']
    yata = Datos['carga']
    
    # datos experimentales simulados
    xdata = np.linspace(0, 0.05, 100)  # Deformación
    ydata = maxwell(xdata, 200, 0.006) + np.random.normal(0, 5, len(xdata))  # Datos con ruido

    popt_pn, pcov_pn = curve_fit(potencia_series, xdata, ydata, p0=[200, 0.01])
    
    area, _ = quad(potencia_series, xdata[0], xdata[-1], args=tuple(popt_pn))
    x_fill = np.linspace(xdata[0], xdata[-1], 100)
    y_fill = potencia_series(x_fill, *popt_pn)
    
    sigma_pred = potencia_series(xdata, popt_pn)
    # x_estab, derivada_esfuerzo = points_key(xdata, sigma_pred)
    # 'Sy':ydata[x_estab]
    
    # return {'successs':True, 
    #         'carga':y_fill.tolist(), 
    #         'deformacion':x_fill.tolist(), 
    #         'area':area,
    #         'Sy':x_estab}
    
    return {'successs':True, 
            'carga':ydata.tolist(), 
            'deformacion':xdata.tolist(), 
            'area':145,
            'Sy':800}