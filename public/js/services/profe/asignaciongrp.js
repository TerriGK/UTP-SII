// 📌 Referencias a elementos del DOM
const tablaContenido = document.getElementById("table-content");
const botonBuscar = document.getElementById("buscar");
const inputIdProfesor = document.getElementById("idprofesor");

let paginaActual = 1;
let textoBusqueda = "";

// 📌 Debounce para controlar frecuencia de eventos
function debounce(func, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

// 📌 Obtener y renderizar grupos del profesor
async function obtenerGruposProfesor() {
  try {
    if (!tablaContenido || !inputIdProfesor) return;

    const url = `/api/profesores/${inputIdProfesor.value}/grupos?page=${paginaActual}`;
    tablaContenido.innerHTML = `<tr><td colspan='5' class='text-center'>
      <div class='spinner-border spinner-border-sm' role='status'></div> Cargando datos...
    </td></tr>`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const { data = [] } = await response.json();
    if (!data.length) {
      tablaContenido.innerHTML = "<tr><td colspan='5' class='text-center'>No se encontraron registros.</td></tr>";
      return;
    }

    const contenidoHTML = data.map((item, index) => {
      const query = new URLSearchParams({
        idPlan: item.ID_PLAN,
        claveAsig: item.CLAVEASIGNATURA,
        nombreAsig: item.NOMBREASIGNATURA,
        grupo: item.CODIGO_GRUPO,
        idEtapa: item.ID_ETAPA,
        inicial: item.INICIAL,
        final: item.FINAL,
        periodo: item.PERIODO
      }).toString();

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${item.CLAVEASIGNATURA}</td>
          <td>${item.NOMBREASIGNATURA}</td>
          <td>${item.CODIGO_GRUPO}</td>
          <td>
            <div class="dropdown">
              <a class="btn btn-custom dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                <i class="bi bi-three-dots"></i> Opciones
              </a>
              <ul class="dropdown-menu">
                <li>
                  <a class="dropdown-item" href="/grupoprofe/${item.CLAVEPROFESOR}/ver_calif?${query}">
                    <i class="bi bi-eye"></i> Ver calificaciones
                  </a>
                </li>
                <li>
                  <a class="dropdown-item" href="/grupoprofe/${item.CLAVEPROFESOR}/subir_calif?${query}">
                    <i class="bi bi-upload"></i> Subir Calificaciones
                  </a>
                </li>
              </ul>
            </div>
          </td>
        </tr>`;
    }).join("");

    tablaContenido.innerHTML = contenidoHTML;

  } catch (error) {
    console.error("Error:", error);
    tablaContenido.innerHTML = `<tr><td colspan='5' class='text-center text-danger'>Error: ${error.message}</td></tr>`;
  }
}

// 📌 Navegación entre páginas
function irPaginaAnterior() {
  if (paginaActual > 1) {
    paginaActual--;
    obtenerGruposProfesor();
  }
}

function irPaginaSiguiente() {
  paginaActual++;
  obtenerGruposProfesor();
}

// 📌 Configuración inicial
document.addEventListener("DOMContentLoaded", () => {
  const elementosRequeridos = [
    { id: "table-content", nombre: "Tabla de contenido" },
    { id: "idprofesor", nombre: "ID del profesor" }
  ];

  const faltantes = elementosRequeridos.filter(e => !document.getElementById(e.id));
  if (faltantes.length) {
    const mensajeError = faltantes.map(e => e.nombre).join(", ");
    console.error("Faltan elementos:", mensajeError);
    if (tablaContenido) {
      tablaContenido.innerHTML = `<tr><td colspan='5' class='text-center text-danger'>Error: Faltan ${mensajeError}</td></tr>`;
    }
    return;
  }

  if (botonBuscar) {
    botonBuscar.addEventListener("input", debounce((e) => {
      textoBusqueda = e.target.value;
      paginaActual = 1;
      obtenerGruposProfesor();
    }));
  }

  obtenerGruposProfesor();
});
