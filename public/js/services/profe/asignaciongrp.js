// Referencias a elementos del DOM
const table = document.getElementById("table-content");
const boton = document.getElementById("buscar");
const idplan = document.getElementById("idPlan");
const idprofesor = document.getElementById("idprofesor");

let page = 1;
let search = ""; // Definimos la variable search

// Función de debounce para controlar la frecuencia de eventos
function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

// Solo agregamos el evento si el elemento existe
if (boton) {
  boton.addEventListener(
    "input",
    debounce((event) => {
      search = event.target.value;
      page = 1;
      getProfesoresAsig();
    })
  );
}

async function getProfesoresAsig() {
  try {
    // Verificar que los elementos necesarios existan
    if (!table) {
      console.error("Error: Elemento table-content no encontrado");
      return;
    }
    
    if (!idprofesor) {
      console.error("Error: Elemento idprofesor no encontrado");
      table.innerHTML = "<tr><td colspan='5'>Error: ID de profesor no disponible</td></tr>";
      return;
    }

    let url = `/api/profesores/${idprofesor.value}/grupos?page=${page}`;
    
    // Indicador de carga
    table.innerHTML = "<tr><td colspan='5' class='text-center'><div class='spinner-border spinner-border-sm' role='status'><span class='visually-hidden'>Cargando...</span></div> Cargando datos...</td></tr>";
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const api = await response.json();

    let content = "";

    // Verificar si hay datos
    if (!api.data || api.data.length === 0) {
      table.innerHTML = "<tr><td colspan='5' class='text-center'>No se encontraron registros.</td></tr>";
      return;
    }

    // Obtener el año actual para comparar
    const añoActual = new Date().getFullYear();
// 
    api.data.forEach((item, index) => {
      if (item.PERIODO < 1 || item.PERIODO > 3) {
        return; // Filtramos los ciclos fuera del rango
      }

      let query = `idPlan=${item.ID_PLAN}`;
      query += `&claveAsig=${encodeURIComponent(item.CLAVEASIGNATURA)}`;
      query += `&nombreAsig=${encodeURIComponent(item.NOMBREASIGNATURA)}`;
      query += `&grupo=${encodeURIComponent(item.CODIGO_GRUPO)}`;
      query += `&idEtapa=${item.ID_ETAPA}`;
      query += `&inicial=${item.INICIAL}`;
      query += `&final=${item.FINAL}`;
      query += `&periodo=${item.PERIODO}`;

      content += `<tr>`;
      content += `<td>${index + 1}</td>`;
      content += `<td>${item.CLAVEASIGNATURA}</td>`;
      content += `<td>${item.NOMBREASIGNATURA}</td>`;
      content += `<td>${item.CODIGO_GRUPO}</td>`;

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

      // Mostrar el botón de "Subir Calificaciones" solo si:
      // - El ciclo es posterior a 2024
      // - El periodo es 2, 3 o mayor
      // - El año final es mayor o igual que el año actual
      if ((item.INICIAL > 2024 || (item.INICIAL === 2024 && item.FINAL >= 2025)) && 
          item.PERIODO >= 2 && //cambiando este formato se cambia los periodos.
          item.FINAL >= añoActual) {
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
  } catch (error) {
    console.error("Error:", error);
    table.innerHTML = `<tr><td colspan='5' class='text-center text-danger'>Error al cargar los datos: ${error.message}</td></tr>`;
  }
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

// Verificamos que los elementos necesarios existan antes de inicializar
document.addEventListener("DOMContentLoaded", function() {
  // Verificar elementos críticos
  const criticalElements = [
    { id: "table-content", name: "Tabla de contenido" },
    { id: "idprofesor", name: "ID del profesor" }
  ];

  let missingElements = criticalElements.filter(elem => !document.getElementById(elem.id));
  
  if (missingElements.length > 0) {
    console.error("Elementos faltantes:", missingElements.map(e => e.name).join(", "));
    if (table) {
      table.innerHTML = `<tr><td colspan='5' class='text-center text-danger'>
        Error: Faltan elementos necesarios en la página: ${missingElements.map(e => e.name).join(", ")}
      </td></tr>`;
    }
    return;
  }
  
  // Si todos los elementos existen, inicializar la aplicación
  getProfesoresAsig();
});







// // Referencias a elementos del DOM
// const table = document.getElementById("table-content");
// const boton = document.getElementById("buscar");
// const idplan = document.getElementById("idPlan");
// const idprofesor = document.getElementById("idprofesor");

// let page = 1;
// let search = ""; // Definimos la variable search

// // Función de debounce para controlar la frecuencia de eventos
// function debounce(func, timeout = 300) {
//   let timer;
//   return (...args) => {
//     clearTimeout(timer);
//     timer = setTimeout(() => { func.apply(this, args); }, timeout);
//   };
// }

// // Solo agregamos el evento si el elemento existe
// if (boton) {
//   boton.addEventListener(
//     "input",
//     debounce((event) => {
//       search = event.target.value;
//       page = 1;
//       getProfesoresAsig();
//     })
//   );
// }

// async function getProfesoresAsig() {
//   try {
//     // Verificar que los elementos necesarios existan
//     if (!table) {
//       console.error("Error: Elemento table-content no encontrado");
//       return;
//     }
    
//     if (!idprofesor) {
//       console.error("Error: Elemento idprofesor no encontrado");
//       table.innerHTML = "<tr><td colspan='5'>Error: ID de profesor no disponible</td></tr>";
//       return;
//     }

//     let url = `/api/profesores/${idprofesor.value}/grupos?page=${page}`;
    
//     // Indicador de carga
//     table.innerHTML = "<tr><td colspan='5' class='text-center'><div class='spinner-border spinner-border-sm' role='status'><span class='visually-hidden'>Cargando...</span></div> Cargando datos...</td></tr>";
    
//     const response = await fetch(url);
    
//     if (!response.ok) {
//       throw new Error(`Error HTTP: ${response.status}`);
//     }
    
//     const api = await response.json();

//     let content = "";

//     // Verificar si hay datos
//     if (!api.data || api.data.length === 0) {
//       table.innerHTML = "<tr><td colspan='5' class='text-center'>No se encontraron registros.</td></tr>";
//       return;
//     }

//     api.data.forEach((item, index) => {
//       let query = `idPlan=${item.ID_PLAN}`;
//       query += `&claveAsig=${encodeURIComponent(item.CLAVEASIGNATURA)}`;
//       query += `&nombreAsig=${encodeURIComponent(item.NOMBREASIGNATURA)}`;
//       query += `&grupo=${encodeURIComponent(item.CODIGO_GRUPO)}`;
//       query += `&idEtapa=${item.ID_ETAPA}`;
//       query += `&inicial=${item.INICIAL}`;
//       query += `&final=${item.FINAL}`;
//       query += `&periodo=${item.PERIODO}`;

//       content += `<tr>`;
//       content += `<td>${index + 1}</td>`;
//       content += `<td>${item.CLAVEASIGNATURA}</td>`;
//       content += `<td>${item.NOMBREASIGNATURA}</td>`;
//       content += `<td>${item.CODIGO_GRUPO}</td>`;

//       content += `<td><div class="dropdown">
//         <a class="btn btn-custom dropdown-toggle" href="#" role="button" id="dropdownMenuLink${index}" data-bs-toggle="dropdown" aria-expanded="false">
//         <i class="bi bi-three-dots"></i> Opciones
//       </a>
//       <ul class="dropdown-menu" aria-labelledby="dropdownMenuLink${index}">`;

//       content += `<li>
//         <a class="dropdown-item" href="/grupoprofe/${item.CLAVEPROFESOR}/ver_calif?${query}">
//           <i class="bi bi-eye"></i> Ver calificaciones
//         </a>
//       </li>`;

//       // Mostrar siempre el botón de "Subir Calificaciones" sin filtros
//       content += `<li>
//         <a class="dropdown-item" href="/grupoprofe/${item.CLAVEPROFESOR}/subir_calif?${query}">
//           <i class="bi bi-upload"></i> Subir Calificaciones
//         </a>
//       </li>`;

//       content += `</ul></div></td>`;
//       content += "</tr>";
//     });

//     table.innerHTML = content;
//   } catch (error) {
//     console.error("Error:", error);
//     table.innerHTML = `<tr><td colspan='5' class='text-center text-danger'>Error al cargar los datos: ${error.message}</td></tr>`;
//   }
// }

// function onPrev() {
//   if (page > 1) {
//     page--;
//     getProfesoresAsig();
//   }
// }

// function onNext() {
//   page++;
//   getProfesoresAsig();
// }

// // Verificamos que los elementos necesarios existan antes de inicializar
// document.addEventListener("DOMContentLoaded", function() {
//   // Verificar elementos críticos
//   const criticalElements = [
//     { id: "table-content", name: "Tabla de contenido" },
//     { id: "idprofesor", name: "ID del profesor" }
//   ];

//   let missingElements = criticalElements.filter(elem => !document.getElementById(elem.id));
  
//   if (missingElements.length > 0) {
//     console.error("Elementos faltantes:", missingElements.map(e => e.name).join(", "));
//     if (table) {
//       table.innerHTML = `<tr><td colspan='5' class='text-center text-danger'>
//         Error: Faltan elementos necesarios en la página: ${missingElements.map(e => e.name).join(", ")}
//       </td></tr>`;
//     }
//     return;
//   }
  
//   getProfesoresAsig();
// });