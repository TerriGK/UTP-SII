// 📌 Referencias a elementos del DOM
const tablaContenido = document.getElementById("table-content");
const botonBuscar = document.getElementById("buscar");
const inputIdPlan = document.getElementById("idPlan");
const inputIdProfesor = document.getElementById("idprofesor");

let paginaActual = 1;
let textoBusqueda = "";
let hiddenCycles = [];

// 📌 Debounce para controlar frecuencia de eventos
function debounce(func, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

// 📌 Verificar si un ciclo está oculto
function isCycleHidden(cycle) {
  return hiddenCycles.includes(cycle);
}

// 📌 Cargar ciclos ocultos desde manager o localStorage
function cargarCiclosOcultos() {
  try {
    if (window.cycleManager?.getHiddenCycles) {
      hiddenCycles = window.cycleManager.getHiddenCycles();
    } else {
      hiddenCycles = JSON.parse(localStorage.getItem("hiddenCycles") || "[]");
    }
  } catch (e) {
    console.error("Error al cargar ciclos ocultos:", e);
    hiddenCycles = [];
  }
}

// 📌 Listeners para cambios de configuración de ciclos
function setupCycleSettingListeners() {
  cargarCiclosOcultos();

  const actualizarCiclos = (e) => {
    hiddenCycles = e.detail.hiddenCycles || [];
    obtenerGruposProfesor();
  };

  ["cycleSetting:changed", "cycleSetting:bulkChanged", "cycleSetting:initialized"]
    .forEach(evt => document.addEventListener(evt, actualizarCiclos));

  window.addEventListener("storage", (e) => {
    if (e.key === "hiddenCycles") {
      cargarCiclosOcultos();
      obtenerGruposProfesor();
    }
  });
}

// 📌 Obtener y renderizar grupos del profesor
async function obtenerGruposProfesor() {
  try {
    if (!tablaContenido || !inputIdProfesor) return;

    cargarCiclosOcultos();

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

    const anioSistema = new Date().getFullYear();
    const ocultosConDatos = [];

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

      const cycleCode = item.CODIGO_CORTO || `${item.INICIAL}-${item.PERIODO}`;
      const mostrarSubir = !isCycleHidden(cycleCode)
        && (item.INICIAL > 2024 || (item.INICIAL === 2024 && item.FINAL >= 2025))
        && item.PERIODO >= 2
        && item.FINAL >= anioSistema;

      if (!mostrarSubir) {
        console.log(`🚫 Botón oculto para ciclo ${cycleCode} - INICIAL: ${item.INICIAL}, FINAL: ${item.FINAL}, PERIODO: ${item.PERIODO}`);
        if (isCycleHidden(cycleCode)) {
          ocultosConDatos.push({
            CODIGO: cycleCode,
            INICIAL: item.INICIAL,
            FINAL: item.FINAL,
            PERIODO: item.PERIODO
          });
        }
      }

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
                ${mostrarSubir ? `
                  <li>
                    <a class="dropdown-item" href="/grupoprofe/${item.CLAVEPROFESOR}/subir_calif?${query}">
                      <i class="bi bi-upload"></i> Subir Calificaciones
                    </a>
                  </li>`:`
                  <!-- Botón oculto: INICIAL ${item.INICIAL}, FINAL ${item.FINAL}, PERIODO ${item.PERIODO} -->
                `}
              </ul>
            </div>
          </td>
        </tr>`;
    }).join("");

    tablaContenido.innerHTML = contenidoHTML;

    // 📌 Mostrar tabla en consola de los ocultos
    if (ocultosConDatos.length) {
      console.table(ocultosConDatos);
    }

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

// 📌 Ciclos ocultos en localStorage
function getHiddenCycles() {
  try {
    return JSON.parse(localStorage.getItem("hiddenCycles") || "[]");
  } catch (e) {
    console.error("Error cargando hiddenCycles:", e);
    return [];
  }
}

function saveHiddenCycles(cycles) {
  localStorage.setItem("hiddenCycles", JSON.stringify(cycles));
}

function ocultarCiclo(cycleCode) {
  const hiddenCycles = getHiddenCycles();
  if (!hiddenCycles.includes(cycleCode)) {
    hiddenCycles.push(cycleCode);
    saveHiddenCycles(hiddenCycles);
    console.log(`✅ Ciclo ${cycleCode} ocultado.`);
  }
}

function mostrarCiclo(cycleCode) {
  let hiddenCycles = getHiddenCycles();
  hiddenCycles = hiddenCycles.filter(c => c !== cycleCode);
  saveHiddenCycles(hiddenCycles);
  console.log(`✅ Ciclo ${cycleCode} mostrado.`);
}

function estaOculto(cycleCode) {
  return getHiddenCycles().includes(cycleCode);
}

function limpiarCiclosOcultos() {
  localStorage.removeItem("hiddenCycles");
  console.log("✅ Ocultos limpiados.");
}

function mostrarOcultos() {
  console.table(getHiddenCycles());
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

  setupCycleSettingListeners();
  obtenerGruposProfesor();
});
