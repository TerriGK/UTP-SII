"use strict";

// Elemento del DOM
const selectCuatri = document.getElementById("selectciclo");

/**
 * Actualiza el período seleccionado en el servidor
 * @param {string} periodo - Código del período a actualizar
 * @returns {Promise<object>} Respuesta JSON del servidor
 */
const actualizarPeriodo = async (periodo) => {
  const config = {
    method: "PUT",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ periodo })
  };

  const response = await fetch("/api/update/CuatriXGrupos", config);
  if (!response.ok) {
    throw new Error(`Error en la actualización: ${response.status}`);
  }

  return response.json();
};

/**
 * Carga los ciclos disponibles en el select del navbar
 */
const cargarCiclosNavbar = async () => {
  try {
    const response = await fetch("/api/cuatris-navbar");
    if (!response.ok) {
      throw new Error(`Error al obtener ciclos: ${response.status}`);
    }

    const { ciclos = [], periodoSelected } = await response.json();

    // Limpiar el select
    selectCuatri.innerHTML = "";

    let optionsHTML = "";

    // Si hay un periodo seleccionado, mostrarlo como primera opción
    if (periodoSelected) {
      optionsHTML += `<option value="${periodoSelected}" selected>${periodoSelected}</option>`;
    } else {
      optionsHTML += `<option value="none" selected>Seleccionar Ciclo</option>`;
    }

    // Agregar los ciclos disponibles
    ciclos.reverse().forEach(({ CODIGO_CORTO, DESCRIPCION }) => {
      // Evitar duplicar la opción ya seleccionada
      if (DESCRIPCION !== periodoSelected) {
        optionsHTML += `<option value="${CODIGO_CORTO}">${DESCRIPCION}</option>`;
      }
    });

    // Insertar opciones al select
    selectCuatri.innerHTML = optionsHTML;

  } catch (error) {
    console.error("Error al cargar los ciclos del navbar:", error);
    alert("No se pudieron cargar los ciclos. Intente nuevamente más tarde.");
  }
};

/**
 * Evento para cambio manual del usuario en el select de ciclo
 */
selectCuatri.addEventListener("change", async (event) => {
  const nuevoPeriodo = event.target.value;
  try {
    const resultado = await actualizarPeriodo(nuevoPeriodo);
    console.log("Periodo actualizado:", resultado);

    location.reload();
  } catch (error) {
    console.warn("Error al cambiar periodo:", error);
    alert("No se pudo actualizar el período. Por favor, intente nuevamente.");
  }
});

// Cargar ciclos al iniciar
cargarCiclosNavbar();
