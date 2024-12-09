axios.defaults.baseURL = 'http://localhost:5000'; // Base URL de la API

function realizarConsulta() {
    const numero = document.getElementById('numero').value; // Número ingresado
    const tipo = document.getElementById('tipo').value;


        busqueda_historia_cedula(numero)
    }


document.getElementById('fetch-historia').addEventListener('click', realizarConsulta);