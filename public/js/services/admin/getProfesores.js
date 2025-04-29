const table = document.getElementById("table-content");
const boton = document.getElementById("buscar");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const pageInfo = document.getElementById("page-info");

let page = 1;
let search = "";

// Función de debounce para la búsqueda
boton.addEventListener(
  "input",
  debounce((event) => {
    search = event.target.value;
    page = 1; // Reiniciar a la primera página cada vez que se realiza una búsqueda
    getProfesores();
  })
);

// Función para obtener los profesores
async function getProfesores() {
  let url = `/api/profesores?page=${page}&search=${search}`;
  const response = await fetch(url);
  const api = await response.json();

  // Verificar si la respuesta contiene datos
  if (api.data) {
    let content = "";
    api.data.forEach((item, index) => {
      content += `<tr>`;
      content += `<td>${index + 1}</td>`;
      content += `<td>${item.CLAVEPROFESOR}</td>`;
      content += `<td>${item.NOMBREPROFESOR}</td>`;
      content += `<td><div class="dropdown">
        <a class="btn btn-secondary dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-bs-toggle="dropdown" aria-expanded="false">
        Ver Más
      </a>
      <ul class="dropdown-menu" aria-labelledby="dropdownMenuLink">
        <li><a class="dropdown-item" href="/Maestro/${item.CLAVEPROFESOR}">Ver Ficha</a></li>
        <li><a class="dropdown-item" href="/Maestro/${item.CLAVEPROFESOR}/asignacion">Asignación de Grupo</a></li>
        <li><a class="dropdown-item" href="/Maestro/${item.CLAVEPROFESOR}/Perfil">Perfil Académico</a></li>
        <li><a class="dropdown-item" href="/Maestro/${item.CLAVEPROFESOR}/profesores-list">Horario Contratado</a></li>
      </ul>
      </div></td>`;
      content += `</tr>`;
    });

    table.innerHTML = content;

    // Actualizar la paginación
    updatePagination(api.totalPages);
  }
}

// Función para actualizar la paginación
function updatePagination(totalPages) {
  // Actualizar la información de la página
  pageInfo.textContent = `${page}`;

  // Habilitar/deshabilitar botones de paginación
  prevBtn.disabled = page === 1;
  nextBtn.disabled = page === totalPages;
}

// Función para manejar el botón "anterior"
function onPrev() {
  if (page > 1) {
    page--;
    getProfesores();
  }
}

// Función para manejar el botón "siguiente"
function onNext() {
  page++;
  getProfesores();
}

// Inicializar la carga de los profesores al cargar la página
getProfesores();
