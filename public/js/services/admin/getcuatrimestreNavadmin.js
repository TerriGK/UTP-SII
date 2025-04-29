"use strict";

// Elementos del DOM
const selectCuatri = document.getElementById("selectciclo");

// Claves para localStorage
const STORAGE_KEY_PERIODO = "periodoSeleccionado";
const STORAGE_KEY_BLOQUEADOS = "periodosBloqueados";

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
 * Gestión del período seleccionado en localStorage
 */
const storageManager = {
  // Guardar período seleccionado
  guardarPeriodo: (periodo) => {
    localStorage.setItem(STORAGE_KEY_PERIODO, periodo);
  },
  
  // Obtener período guardado
  obtenerPeriodo: () => {
    return localStorage.getItem(STORAGE_KEY_PERIODO);
  },
  
  // Eliminar período guardado
  eliminarPeriodo: () => {
    localStorage.removeItem(STORAGE_KEY_PERIODO);
  },
  
  // Obtener lista de períodos bloqueados
  obtenerPeriodosBloqueados: () => {
    const bloqueados = localStorage.getItem(STORAGE_KEY_BLOQUEADOS);
    return bloqueados ? JSON.parse(bloqueados) : [];
  },
  
  // Guardar lista de períodos bloqueados
  guardarPeriodosBloqueados: (listaBloqueados) => {
    localStorage.setItem(STORAGE_KEY_BLOQUEADOS, JSON.stringify(listaBloqueados));
  },
  
  // Comprobar si un período está bloqueado
  estaBloqueado: (periodo) => {
    const periodosBloqueados = storageManager.obtenerPeriodosBloqueados();
    return periodosBloqueados.includes(periodo);
  },
  
  // Bloquear un período específico
  bloquearPeriodo: (periodo) => {
    const periodosBloqueados = storageManager.obtenerPeriodosBloqueados();
    if (!periodosBloqueados.includes(periodo)) {
      periodosBloqueados.push(periodo);
      storageManager.guardarPeriodosBloqueados(periodosBloqueados);
    }
  },
  
  // Desbloquear un período específico
  desbloquearPeriodo: (periodo) => {
    const periodosBloqueados = storageManager.obtenerPeriodosBloqueados();
    const nuevosBloqueados = periodosBloqueados.filter(p => p !== periodo);
    storageManager.guardarPeriodosBloqueados(nuevosBloqueados);
  }
};

/**
 * Crea y agrega el botón de administración para cada período
 * @param {HTMLElement} container - Contenedor donde se agregará el botón
 * @param {string} periodo - Código del período
 * @param {boolean} bloqueado - Si el período está bloqueado
 */
const crearBotonAdministracion = (container, periodo, bloqueado) => {
  // Crear contenedor para el botón
  const btnContainer = document.createElement('div');
  btnContainer.className = 'periodo-admin-btn';
  btnContainer.style.marginLeft = '10px';
  btnContainer.style.display = 'inline-block';
  
  // Crear botón
  const btn = document.createElement('button');
  btn.className = bloqueado ? 'btn-desbloquear' : 'btn-bloquear';
  btn.textContent = bloqueado ? '🔓 Desbloquear' : '🔒 Bloquear';
  btn.style.padding = '2px 8px';
  btn.style.fontSize = '12px';
  btn.style.borderRadius = '4px';
  btn.style.border = '1px solid #ccc';
  btn.style.backgroundColor = bloqueado ? '#f8d7da' : '#d1e7dd';
  btn.style.cursor = 'pointer';
  
  // Agregar evento al botón
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (bloqueado) {
      storageManager.desbloquearPeriodo(periodo);
      btn.textContent = '🔒 Bloquear';
      btn.className = 'btn-bloquear';
      btn.style.backgroundColor = '#d1e7dd';
    } else {
      storageManager.bloquearPeriodo(periodo);
      btn.textContent = '🔓 Desbloquear';
      btn.className = 'btn-desbloquear';
      btn.style.backgroundColor = '#f8d7da';
    }
    
    // Recargar para reflejar los cambios
    cargarCiclosNavbar();
  });
  
  btnContainer.appendChild(btn);
  container.appendChild(btnContainer);
};

/**
 * Crea el panel de administración de períodos
 */
const crearPanelAdministracion = async () => {
  // Verificar si ya existe el panel para no duplicarlo
  if (document.getElementById('admin-periodos-panel')) {
    return;
  }
  
  try {
    // Obtener los ciclos disponibles
    const response = await fetch("/api/cuatris-navbar");
    if (!response.ok) {
      throw new Error(`Error al obtener ciclos: ${response.status}`);
    }
    
    const { ciclos = [] } = await response.json();
    
    // Crear panel
    const panel = document.createElement('div');
    panel.id = 'admin-periodos-panel';
    panel.style.position = 'fixed';
    panel.style.top = '60px';
    panel.style.right = '20px';
    panel.style.width = '300px';
    panel.style.backgroundColor = 'white';
    panel.style.border = '1px solid #ccc';
    panel.style.borderRadius = '5px';
    panel.style.padding = '15px';
    panel.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    panel.style.zIndex = '9999';
    panel.style.display = 'none';
    
    // Cabecera del panel
    const header = document.createElement('div');
    header.style.borderBottom = '1px solid #eee';
    header.style.paddingBottom = '10px';
    header.style.marginBottom = '10px';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    
    const title = document.createElement('h4');
    title.textContent = 'Administrar Períodos';
    title.style.margin = '0';
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.border = 'none';
    closeBtn.style.background = 'none';
    closeBtn.style.fontSize = '16px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.addEventListener('click', () => {
      panel.style.display = 'none';
    });
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    panel.appendChild(header);
    
    // Lista de períodos
    const periodosList = document.createElement('div');
    periodosList.style.maxHeight = '400px';
    periodosList.style.overflowY = 'auto';
    
    // Obtener los períodos bloqueados
    const periodosBloqueados = storageManager.obtenerPeriodosBloqueados();
    
    // Crear elementos para cada período
    ciclos.forEach(({ CODIGO_CORTO, DESCRIPCION }) => {
      const periodoItem = document.createElement('div');
      periodoItem.style.padding = '8px 0';
      periodoItem.style.borderBottom = '1px solid #eee';
      periodoItem.style.display = 'flex';
      periodoItem.style.justifyContent = 'space-between';
      periodoItem.style.alignItems = 'center';
      
      const periodoInfo = document.createElement('div');
      periodoInfo.textContent = DESCRIPCION;
      periodoInfo.style.fontWeight = 'bold';
      
      const periodoCode = document.createElement('div');
      periodoCode.textContent = `Código: ${CODIGO_CORTO}`;
      periodoCode.style.fontSize = '12px';
      periodoCode.style.color = '#666';
      
      const infoContainer = document.createElement('div');
      infoContainer.appendChild(periodoInfo);
      infoContainer.appendChild(periodoCode);
      
      periodoItem.appendChild(infoContainer);
      
      // Botón de bloqueo/desbloqueo
      const bloqueado = periodosBloqueados.includes(CODIGO_CORTO);
      crearBotonAdministracion(periodoItem, CODIGO_CORTO, bloqueado);
      
      periodosList.appendChild(periodoItem);
    });
    
    panel.appendChild(periodosList);
    
    // Botón para cerrar todos los bloqueos
    const resetContainer = document.createElement('div');
    resetContainer.style.marginTop = '15px';
    resetContainer.style.textAlign = 'center';
    
    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Desbloquear Todos los Períodos';
    resetBtn.style.padding = '8px 16px';
    resetBtn.style.backgroundColor = '#dc3545';
    resetBtn.style.color = 'white';
    resetBtn.style.border = 'none';
    resetBtn.style.borderRadius = '4px';
    resetBtn.style.cursor = 'pointer';
    
    resetBtn.addEventListener('click', () => {
      storageManager.guardarPeriodosBloqueados([]);
      storageManager.eliminarPeriodo();
      cargarCiclosNavbar();
      panel.style.display = 'none';
    });
    
    resetContainer.appendChild(resetBtn);
    panel.appendChild(resetContainer);
    
    // Agregar panel al body
    document.body.appendChild(panel);
    
    return panel;
  } catch (error) {
    console.error("Error al crear panel de administración:", error);
    return null;
  }
};

/**
 * Muestra u oculta el panel de administración
 */
const togglePanelAdministracion = async () => {
  let panel = document.getElementById('admin-periodos-panel');
  
  if (!panel) {
    panel = await crearPanelAdministracion();
    if (!panel) return;
  }
  
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
};

/**
 * Crea el botón de administración en el navbar
 */
const crearBotonAdminNavbar = () => {
  const navbarContainer = selectCuatri.parentElement;
  
  // Verificar si ya existe el botón
  if (document.getElementById('btn-admin-periodos')) {
    return;
  }
  
  // Crear botón de administración
  const adminBtn = document.createElement('button');
  adminBtn.id = 'btn-admin-periodos';
  adminBtn.textContent = '⚙️ Administrar';
  adminBtn.style.marginLeft = '15px';
  adminBtn.style.padding = '5px 10px';
  adminBtn.style.backgroundColor = '#f8f9fa';
  adminBtn.style.border = '1px solid #ced4da';
  adminBtn.style.borderRadius = '4px';
  adminBtn.style.cursor = 'pointer';
  
  // Evento para mostrar/ocultar el panel
  adminBtn.addEventListener('click', togglePanelAdministracion);
  
  // Agregar al DOM
  navbarContainer.appendChild(adminBtn);
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
    
    // Verificar si hay un periodo guardado en localStorage
    const periodoGuardado = storageManager.obtenerPeriodo();
    
    // Determinar qué periodo usar (prioridad: localStorage, luego servidor)
    const periodoActual = periodoGuardado || periodoSelected;

    // Limpiar el select
    selectCuatri.innerHTML = "";

    let optionsHTML = "";
    
    // Opción por defecto
    optionsHTML += `<option value="none">Seleccionar Ciclo</option>`;
    
    // Verificar si el ciclo actual está bloqueado
    const estaBloqueado = periodoActual ? storageManager.estaBloqueado(periodoActual) : false;
    
    // Configurar el select según si hay periodo seleccionado y si está bloqueado
    if (periodoActual && estaBloqueado) {
      selectCuatri.disabled = true; // Bloquear si está bloqueado
    } else {
      selectCuatri.disabled = false; // Mantener habilitado si no está bloqueado
    }

    // Agregar los ciclos disponibles
    ciclos.reverse().forEach(({ CODIGO_CORTO, DESCRIPCION }) => {
      const selected = CODIGO_CORTO === periodoActual ? 'selected' : '';
      const bloqueado = storageManager.estaBloqueado(CODIGO_CORTO);
      
      // Marcar visualmente los períodos bloqueados
      const estado = bloqueado ? ' 🔒' : '';
      
      optionsHTML += `<option value="${CODIGO_CORTO}" ${selected}>${DESCRIPCION}${estado}</option>`;
    });

    // Insertar opciones al select
    selectCuatri.innerHTML = optionsHTML;
    
    // Si tenemos periodo en localStorage pero no en el servidor, actualizarlo en el servidor
    if (periodoGuardado && !periodoSelected && !storageManager.estaBloqueado(periodoGuardado)) {
      try {
        await actualizarPeriodo(periodoGuardado);
      } catch (error) {
        console.warn("No se pudo sincronizar el periodo con el servidor:", error);
      }
    }
    
    // Crear botón de administración si no existe
    crearBotonAdminNavbar();

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
  
  // Ignorar si se selecciona la opción "none"
  if (nuevoPeriodo === "none") return;
  
  // Verificar si el período seleccionado está bloqueado
  if (storageManager.estaBloqueado(nuevoPeriodo)) {
    alert("Este período está bloqueado. Desbloquéelo desde el panel de administración para poder seleccionarlo.");
    // Revertir selección
    event.target.value = storageManager.obtenerPeriodo() || "none";
    return;
  }
  
  try {
    const resultado = await actualizarPeriodo(nuevoPeriodo);
    console.log("Periodo actualizado:", resultado);
    
    // Guardar en localStorage
    storageManager.guardarPeriodo(nuevoPeriodo);
    
    location.reload();
  } catch (error) {
    console.warn("Error al cambiar periodo:", error);
    alert("No se pudo actualizar el período. Por favor, intente nuevamente.");
    // Revertir la selección en caso de error
    event.target.value = storageManager.obtenerPeriodo() || "none";
  }
});

// Exponer funciones al objeto window para acceso desde otras partes de la aplicación
window.periodoManager = {
  bloquearPeriodo: (periodo) => {
    storageManager.bloquearPeriodo(periodo);
    cargarCiclosNavbar();
  },
  
  desbloquearPeriodo: (periodo) => {
    storageManager.desbloquearPeriodo(periodo);
    cargarCiclosNavbar();
  },
  
  desbloquearTodos: () => {
    storageManager.guardarPeriodosBloqueados([]);
    cargarCiclosNavbar();
  },
  
  abrirPanel: togglePanelAdministracion
};

// Cargar ciclos al iniciar
cargarCiclosNavbar();