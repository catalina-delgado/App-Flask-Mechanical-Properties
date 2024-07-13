document.getElementById('inputArchivo').addEventListener('change', handleFile)

Plotly.newPlot('grafico-interactivo', [{
    x: [],
    y: [],
    type: 'line',
    line: {color:'#2644bb'}
}]);
Plotly.relayout('grafico-interactivo', {
    xaxis: {title:'Deformación (%)'},
    yaxis: {title:'Esfuerzo (MPa)'},
    margin: {
        t: 20, // top margin
        b: 40  // bottom margin
        }
    });
Plotly.newPlot('simulado', [{
    x: [],
    y: [],
    type: 'line',
    line: {color:'#188e18'},
    fill: 'tozeroy',
    fillcolor: 'rgba(0, 100, 80, 0.2)'        
}]);
Plotly.relayout('simulado', {
    height: 350,
    xaxis: {title:'Deformación (%)'},
    yaxis: {title:'Esfuerzo (MPa)'},
    margin: {
        t: 20, // top margin
        b: 40  // bottom margin
        }
    });

window.onload = function() {
    cargarDatos('/get_datos');
    // cargarDatos('/procesar_datos');
};

function cargarDatos(route) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', route, true);

    xhr.onload = function() {
        if (xhr.status == 200) {
            var data = xhr.responseText;
            objeto = JSON.parse(data)
            
            console.log(objeto)

            datos = objeto['Datos']
            caracteristicas = objeto['caracteristica']
            under_curve = objeto['under_curve']

            mostrarDatos(datos, 'grafico-interactivo');
            mostrarCaracteristicas(caracteristicas);
            mostrarDatos(under_curve, 'simulado');
            mostrarSimulated_data(under_curve);
        }
    };
    xhr.send();
};

function mostrarDatos(data, id) {

    traceCurva ={
        x: [data.deformacion],
        y: [data.carga]
    }
    
    Plotly.update(id, traceCurva);
}

function mostrarCaracteristicas(data) {
    var data = data.data
    var propiedades = Object.keys(data);
    console.log(propiedades)

    var elementoContenedor = document.createElement('div')
        elementoContenedor.id = 'tabla';

    propiedades.forEach(function(propiedad) {
        var elementoLista = document.createElement('div');
        elementoLista.classList.add('row');
        elementoLista.classList.add('m-3');
        var p = document.createElement('p');
        var div1 = document.createElement('div');
        div1.classList.add('col');
        div1.classList.add('borde');
        var div2 = document.createElement('div');
        div2.classList.add('col');
        div2.classList.add('borde');
        var div3 = document.createElement('div');
        div3.classList.add('col');
        div3.classList.add('borde');
        div3.textContent = "MPa";
        
        switch (propiedad) {
            
            case 'E':
                p.textContent = "Módulo de Young"
                div1.textContent = propiedad;
                div2.textContent = data[propiedad];
                break;

            case 'Sy':
                p.textContent = "Esfuerzo de Fluencia"
                div1.textContent = propiedad;
                div2.textContent = Math.round(data[propiedad]*100)/100;
                break;
        
            case 'Sf':
                p.textContent = "Esfuerzo Último"
                div1.textContent = propiedad;
                div2.textContent = Math.round(data[propiedad]*100)/100;
                break;

            case 'dL':
                p.textContent = "Alargamiento"
                div1.textContent = propiedad;
                div2.textContent = Math.round(data[propiedad]*100)/100;
                div3.textContent = "mm";
                break;
        }
        
        elementoLista.appendChild(p);
        elementoLista.appendChild(div1);// columna 1
        elementoLista.appendChild(div2);// columna 2
        elementoLista.appendChild(div3);// columna 3

        elementoContenedor.appendChild(elementoLista);
    });
    document.getElementById('lista').appendChild(elementoContenedor);
}

function mostrarSimulated_data(data) {
    var data = data
    var propiedades = Object.keys(data);
    console.log(propiedades)

    div11 = document.getElementById('div11')
    div12 = document.getElementById('div12')
    div21 = document.getElementById('div21')
    div22 = document.getElementById('div22')

    propiedades.forEach(function(propiedad) {
        
        switch (propiedad) {
            
            case 'area':
                div11.textContent = propiedad;
                div12.textContent = Math.round(data[propiedad]*100)/100;
                break;

            case 'Sy':
                div21.textContent = propiedad;
                div22.textContent = Math.round(data[propiedad]*100)/100;
                break;
        }
    });
}

async function handleFile(evento) {
    var archivo = evento.target.files[0];
    reader = new FileReader();
    reader.onload = function (e) {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        var dataBase = {};
        
        workbook.SheetNames.forEach(function(sheetName) {
            const XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
            dataBase = JSON.stringify(XL_row_object);
        });
        enviar(dataBase, '/procesar_datos')
    }

    reader.readAsBinaryString(archivo);
}

function enviar(database, rute) {
    fetch(rute, {
        method: 'POST',
        headers: {'Content-Type': 'application/json',},
        body: JSON.stringify(database),
    })
    .then((response) => {
        if (response.ok) {
        return response.json();
        } else {
        throw new Error('Error en la solicitud: ' + response.status);
        }
    })
    .then((data) => {
                    
        var datos = data['Datos']
        var caracteristicas = data['caracteristica']
        var under_curve = data['under_curve']

        console.log(caracteristicas)

        mostrarDatos(datos, 'grafico-interactivo');
        limpiar('tabla')
        mostrarCaracteristicas(caracteristicas);
        mostrarDatos(under_curve, 'simulado');
    })
    .catch((error) => {
        console.error('Error en la solicitud:', error);
    });  
}

function limpiar(id) {
    const elemento = document.getElementById(id);
    elemento.remove();
}