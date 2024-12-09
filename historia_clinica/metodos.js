axios.defaults.baseURL = 'http://localhost:5000';

function busqueda_historia_cedula(cedula) {
    cedula = cedula.trim();
    try {
        // Realizar la solicitud con Axios
        axios.get(`/historia_cedula/${cedula}`)
            .then(function (response) {
                // Limpiar cualquier tabla previa
                $('#resultTable').DataTable().clear().destroy();

                // Insertar los resultados en la tabla
                let tableBody = document.querySelector('#resultTable tbody');
                tableBody.innerHTML = ''; // Limpiar la tabla existente

                response.data.forEach(item => {
                    let row = document.createElement('tr');

                    // Crear botones de Editar y Eliminar
                    let editButton = `<button class="btn btn-warning" onclick="editarItem(${item.id})">Editar</button>`;
                    let deleteButton = `<button class="btn btn-danger" onclick="eliminarItem(${item.id})">Eliminar</button>`;

                    // Insertar el texto de evolución con el botón "..."
                    let evolucionTexto = item.evolucion;
                    let truncatedText = evolucionTexto.length > 100 ? evolucionTexto.slice(0, 100) + '...' : evolucionTexto;
                    let showMoreButton = evolucionTexto.length > 100 ? `<span class="show-more" onclick="toggleText(this)">...</span>` : '';

                    row.innerHTML = `
                        <td>${item.id}</td>
                        <td>${item.Cedula}</td>
                        <td>${item.Medico}</td>
                        <td>${item.Fecha}</td>
                        <td class="long-text" data-full-text="${evolucionTexto}">
                            ${truncatedText} ${showMoreButton}
                        </td>
                        <td>
                            ${editButton}
                            ${deleteButton}
                        </td>
                    `;

                    tableBody.appendChild(row);
                });

                // Re-iniciar DataTables
                $('#resultTable').DataTable({
                    language: {
                        lengthMenu: 'Mostrar _MENU_ entradas',
                        search: 'Buscar:',
                        paginate: {
                            first: "Primero",
                            last: "Último",
                            next: "Siguiente",
                            previous: "Anterior"
                        },
                        info: "Mostrando _START_ a _END_ de _TOTAL_ entradas"
                    },
                    initComplete: function () {
                        // Mover los controles de DataTable después del campo "Número"
                        const tableWrapper = $('#resultTable_wrapper');
                        const dataTableControls = tableWrapper.find('.dataTables_length, .dataTables_filter');
                    
                        // Mover los controles después del contenedor del input 'Número'
                        const numeroContainer = document.querySelector('#numero').parentNode;
                        numeroContainer.parentNode.insertBefore(dataTableControls[0], numeroContainer.nextSibling); // Mover lengthMenu
                        numeroContainer.parentNode.insertBefore(dataTableControls[1], numeroContainer.nextSibling); // Mover Search
                    }
                });
            })
            .catch(function (error) {
                console.error("Error en la petición:", error);
                document.getElementById("responseContainer").innerText = "Ocurrió un error al realizar la consulta. Revisa la consola para más detalles.";
            });
    } catch (error) {
        console.error("Error en la función de búsqueda:", error);
        document.getElementById("responseContainer").innerText = "Ocurrió un error al procesar la solicitud.";
    }
}

// Función para alternar el texto
function toggleText(button) {
    let textElement = button.parentElement;
    let fullText = textElement.getAttribute('data-full-text');
    
    // Verificar si el texto está expandido
    if (textElement.classList.contains('expanded')) {
        textElement.classList.remove('expanded');
        textElement.innerHTML = fullText.slice(0, 100) + ' <span class="show-more" onclick="toggleText(this)">...</span>';
    } else {
        textElement.classList.add('expanded');
        textElement.innerHTML = fullText + ' <span class="show-more" onclick="toggleText(this)">...</span>';
    }
}

// Función para editar un elemento
function editarItem(id) {
    axios.get(`/historia_id/${id}`)
        .then(response => {
            const item = response.data;

            // Llenar los campos del modal con los datos específicos de la historia seleccionada
            document.getElementById('editCedula').value = item.Cedula;
            document.getElementById('editCedula').dataset.id = item.id;  // Establecer el 'id' en el atributo 'data-id'
            document.getElementById('editMedico').value = item.Medico;
            document.getElementById('editEvolucion').value = item.evolucion;

            // Mostrar el modal
            document.getElementById('editModal').style.display = 'block';
        })
        .catch(error => {
            console.error("Error al obtener los detalles:", error);
            alert("Error al cargar los datos para edición.");
        });

        document.getElementById('editForm').addEventListener('submit', function (event) {
            event.preventDefault();
        
            const idHistoria = document.getElementById('editCedula').dataset.id; // Ahora tiene el 'id' del dataset
            const data = {
                medico: document.getElementById('editMedico').value,
                evolucion: document.getElementById('editEvolucion').value,
            };
        
            axios.put(`/historia_id/${idHistoria}`, data)  // Usar el id correcto para actualizar
                .then(response => {
                    alert('Registro actualizado con éxito');
                    document.getElementById('editModal').style.display = 'none';
                    busqueda_historia_cedula(document.getElementById('numero').value); // Actualizar tabla
                })
                .catch(error => {
                    console.error("Error al actualizar el registro:", error);
                    alert("Error al actualizar el registro.");
                });
        });
        
}




// Función para eliminar un elemento
function eliminarItem(cedula) {
    if (confirm(`¿Estás seguro de que deseas eliminar el registro con cédula: ${cedula}?`)) {
        axios.delete(`/historia_cedula/${cedula}`)
            .then(response => {
                alert('Registro eliminado correctamente');
                busqueda_historia_cedula(document.getElementById('numero').value);
            })
            .catch(error => {
                console.error("Error al eliminar el item:", error);
                alert("Ocurrió un error al eliminar el registro.");
            });
    }
}

// Escuchar el clic en el botón de cierre
document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('editModal').style.display = 'none'; // Cambiar el estilo a oculto
});



