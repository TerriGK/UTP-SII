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

    const { ciclos = [], periodoSelected: periodoDesdeAPI } = await response.json();

    // Usar ciclo guardado localmente si existe, de lo contrario el que viene de la API
    const periodoGuardado = localStorage.getItem("periodoSeleccionado");
    const periodoSeleccionado = periodoGuardado || periodoDesdeAPI;

    // Limpiar el select
    selectCuatri.innerHTML = "";

    let optionsHTML = periodoSeleccionado
      ? `<option value="${periodoSeleccionado}">${periodoSeleccionado}</option>`
      : `<option value="none">Seleccionar Ciclo</option>`;

    // Generar opciones para el select
    ciclos.reverse().forEach(({ CODIGO_CORTO, DESCRIPCION }) => {
      const isSelected = CODIGO_CORTO === periodoSeleccionado ? 'selected' : '';
      optionsHTML += `<option value="${CODIGO_CORTO}" ${isSelected}>${DESCRIPCION}</option>`;
    });

    selectCuatri.innerHTML = optionsHTML;

    // Si el ciclo 2 existe y no está seleccionado, lo seleccionamos automáticamente (opcional)
    const cicloDos = ciclos.find(c => c.CODIGO_CORTO === "2");
    if (cicloDos && cicloDos.CODIGO_CORTO !== periodoSeleccionado && !periodoGuardado) {
      console.log("Cargando automáticamente el periodo 2...");
      selectCuatri.value = cicloDos.CODIGO_CORTO;

      await actualizarPeriodo(cicloDos.CODIGO_CORTO);
      localStorage.setItem("periodoSeleccionado", cicloDos.CODIGO_CORTO);
      console.log("Periodo 2 cargado exitosamente.");
      location.reload();
    }

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
    // Guardar el nuevo período en localStorage
    localStorage.setItem("periodoSeleccionado", nuevoPeriodo);

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
