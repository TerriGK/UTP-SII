const table = document.getElementById("table-content");
const boton = document.getElementById("buscar");
const idplan = document.getElementById("idPlan");

let page = 1;

boton.addEventListener(
  "input",
  debounce((event) => {
    search = event.target.value;
    page = 1;
    getProfesoresAsig();
  })
);

async function getProfesoresAsig() {
  let url = `/api/profesores/${idprofesor.value}/grupos?page=${page}`;
  const response = await fetch(url);
  const api = await response.json();

  let content = "";

  // Verificar si hay ciclo seleccionado
  const cicloSeleccionado = selectCuatri.value !== "none";
  
  // Si no hay ciclo seleccionado, no mostrar los botones
  if (!cicloSeleccionado) {
    table.innerHTML = "<tr><td colspan='5'>Seleccione un ciclo.</td></tr>";
    return;
  }

  // Obtener el año del ciclo seleccionado
  const añoCicloSeleccionado = parseInt(selectCuatri.value.split('-')[0]);

  // Obtener el año actual para comparar con el ciclo
  const añoActual = new Date().getFullYear(); // Año actual

  api.data.forEach((item, index) => {
    if (item.PERIODO < 1 || item.PERIODO > 3) {
      return; // Filtramos los ciclos fuera del rango
    }

    let query = `idPlan=${item.ID_PLAN}`;
    query += `&claveAsig=${item.CLAVEASIGNATURA}`;
    query += `&nombreAsig=${item.NOMBREASIGNATURA}`;
    query += `&grupo=${item.CODIGO_GRUPO}`;
    query += `&idEtapa=${item.ID_ETAPA}`;
    query += `&inicial=${item.INICIAL}`;
    query += `&final=${item.FINAL}`;
    query += `&periodo=${item.PERIODO}`;

    content += `<tr>`;
    content += `<td>${index + 1}</td>`;
    content += `<td>${item.CLAVEASIGNATURA}</td>`;
    content += `<td>${item.NOMBREASIGNATURA}</td>`;
    content += `<td>${item.CODIGO_GRUPO}</td>`;

    // Solo mostrar el dropdown si hay ciclo seleccionado
    content += `<td><div class="dropdown">
      <a class="btn btn-custom dropdown-toggle" href="#" role="button" id="dropdownMenuLink${index}" data-bs-toggle="dropdown" aria-expanded="false">
      <i class="bi bi-three-dots"></i> Opciones
    </a>
    <ul class="dropdown-menu" aria-labelledby="dropdownMenuLink${index}">`;

    content += `<li>
      <a class="dropdown-item" href="/grupoprofe/${item.CLAVEPROFESOR}/ver_calif?${query}">
        <i class="bi bi-eye"></i> Ver calificaciones
      </a>
    </li>`;

    // Mostrar el botón de "Subir Calificaciones" solo si el ciclo seleccionado es posterior al ciclo actual
    if (item.FINAL >= añoActual) {
      content += `<li>
        <a class="dropdown-item" href="/grupoprofe/${item.CLAVEPROFESOR}/subir_calif?${query}">
          <i class="bi bi-upload"></i> Subir Calificaciones
        </a>
      </li>`;
    }

    content += `</ul></div></td>`;
    content += "</tr>";
  });

  table.innerHTML = content;
}


function onPrev() {
  if (page > 1) {
    page--;
    getProfesoresAsig();
  }
}

function onNext() {
  page++;
  getProfesoresAsig();
}

getProfesoresAsig();
