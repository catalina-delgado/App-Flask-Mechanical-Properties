function downloadFile() {
        
    const data = [
        ["POSIT", "FORCE", "EXT"]
    ];
  
    let csvContent = "";
    data.forEach(row => {
        csvContent += row.join(";") + "\n";
    });
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
  
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

document.getElementById('inputArchivo').addEventListener('change', handleFile)

async function handleFile(evento) {

    var archivo = evento.target.files[0];
    if (archivo) {
        fileCaracteristics(archivo)
    } else {
        console.log('No se seleccionó ningún archivo.');
    }
}

function fileCaracteristics(archivo) {
    var infoArchivo = document.getElementById('infoArchivo');
    var icono = obtenerIcono(archivo.name.split('.').pop().toLowerCase());
    var iconoElemento = document.createElement('img');
    iconoElemento.classList.add('w-px');
    iconoElemento.src = icono
    infoArchivo.appendChild(iconoElemento);
    var nombreElemento = document.createElement('span');
    nombreElemento.classList.add('text-white');
    nombreElemento.textContent = archivo.name;
    infoArchivo.appendChild(nombreElemento);
}

function obtenerIcono(tipoArchivo) {
    var extPermitidas = /(xlsx|xlx|svg)$/i;
    var tipo;

    // Verificar si el tipoArchivo coincide con alguna extensión permitida
    if (extPermitidas.test(tipoArchivo)) {
        // Asignar un icono específico según la extensión del archivo
        switch (tipoArchivo) {
            case 'xlsx':
                tipo = 'excel-logo.png';
                break;
            case 'xlx':
                tipo = 'excel_2000.png';
                break;
            case 'svg':
                tipo = 'excel-logo.png';
                break;
            default:
                tipo = 'default.png'; // Icono por defecto si la extensión no coincide con ninguna de las anteriores
                break;
        }
    } else {
        tipo = 'default.png'; // Icono por defecto si la extensión no es permitida
    }

    return '/static/images/' + tipo;
}