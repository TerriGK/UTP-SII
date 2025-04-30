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
  // Crear botón
  const btn = document.createElement('button');
  btn.className = bloqueado ? 'btn btn-outline-danger btn-sm' : 'btn btn-outline-success btn-sm';
  btn.innerHTML = bloqueado ? '<i class="bi bi-unlock"></i> Desbloquear' : '<i class="bi bi-lock"></i> Bloquear';
  btn.style.marginLeft = '10px';
  
  // Agregar evento al botón
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (bloqueado) {
      storageManager.desbloquearPeriodo(periodo);
      btn.innerHTML = '<i class="bi bi-lock"></i> Bloquear';
      btn.className = 'btn btn-outline-success btn-sm';
    } else {
      storageManager.bloquearPeriodo(periodo);
      btn.innerHTML = '<i class="bi bi-unlock"></i> Desbloquear';
      btn.className = 'btn btn-outline-danger btn-sm';
    }
    
    // Recargar para reflejar los cambios
    cargarCiclosNavbar();
  });
  
  container.appendChild(btn);
};

/**
 * Crea el panel de administración de períodos
 */
const crearPanelAdministracion = async () => {
  // Verificar si ya existe el panel para no duplicarlo
  if (document.getElementById('admin-periodos-panel')) {
    return document.getElementById('admin-periodos-panel');
  }
  
  try {
    // Obtener los ciclos disponibles
    const response = await fetch("/api/cuatris-navbar");
    if (!response.ok) {
      throw new Error(`Error al obtener ciclos: ${response.status}`);
    }
    
    const { ciclos = [] } = await response.json();
    
    // Crear panel con estilo mejorado
    const panel = document.createElement('div');
    panel.id = 'admin-periodos-panel';
    panel.className = 'card shadow';
    panel.style.position = 'fixed';
    panel.style.top = '70px';
    panel.style.right = '20px';
    panel.style.width = '350px';
    panel.style.maxWidth = '90vw';
    panel.style.zIndex = '9999';
    panel.style.display = 'none';
    panel.style.animation = 'fadeIn 0.3s ease-in-out';
    
    // Agregar estilos de animación
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
    
    // Cabecera del panel
    const header = document.createElement('div');
    header.className = 'card-header bg-primary text-white';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    
    const title = document.createElement('h5');
    title.textContent = 'Administración de Períodos';
    title.className = 'mb-0';
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '<i class="bi bi-x-lg"></i>';
    closeBtn.className = 'btn btn-sm btn-close btn-close-white';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.addEventListener('click', () => {
      panel.style.display = 'none';
    });
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    panel.appendChild(header);
    
    // Cuerpo del panel
    const body = document.createElement('div');
    body.className = 'card-body';
    
    // Lista de períodos
    const periodosList = document.createElement('div');
    periodosList.className = 'list-group mb-4';
    periodosList.style.maxHeight = '400px';
    periodosList.style.overflowY = 'auto';
    
    // Obtener los períodos bloqueados
    const periodosBloqueados = storageManager.obtenerPeriodosBloqueados();
    
    // Crear elementos para cada período
    ciclos.forEach(({ CODIGO_CORTO, DESCRIPCION }) => {
      const periodoItem = document.createElement('div');
      periodoItem.className = 'list-group-item d-flex justify-content-between align-items-center';
      
      // Contenedor de información
      const infoContainer = document.createElement('div');
      
      const periodoInfo = document.createElement('div');
      periodoInfo.textContent = DESCRIPCION;
      periodoInfo.className = 'fw-bold';
      
      const periodoCode = document.createElement('small');
      periodoCode.textContent = `Código: ${CODIGO_CORTO}`;
      periodoCode.className = 'text-muted d-block';
      
      infoContainer.appendChild(periodoInfo);
      infoContainer.appendChild(periodoCode);
      
      // Contenedor de acciones
      const actionsContainer = document.createElement('div');
      
      // Botón de bloqueo/desbloqueo
      const bloqueado = periodosBloqueados.includes(CODIGO_CORTO);
      crearBotonAdministracion(actionsContainer, CODIGO_CORTO, bloqueado);
      
      periodoItem.appendChild(infoContainer);
      periodoItem.appendChild(actionsContainer);
      
      periodosList.appendChild(periodoItem);
    });
    
    // Información de estado actual
    const estadoInfo = document.createElement('div');
    estadoInfo.className = 'alert alert-info mb-3';
    estadoInfo.innerHTML = `
      <strong>Estado actual:</strong> 
      <p class="mb-0">Períodos bloqueados: ${periodosBloqueados.length}</p>
      <small>Los períodos bloqueados no pueden ser seleccionados por los usuarios.</small>
    `;
    
    body.appendChild(estadoInfo);
    body.appendChild(periodosList);
    
    // Botones de acción
    const actionButtons = document.createElement('div');
    actionButtons.className = 'd-flex gap-2 justify-content-center mt-3';
    
    // Botón para cerrar todos los bloqueos
    const resetBtn = document.createElement('button');
    resetBtn.innerHTML = '<i class="bi bi-unlock"></i> Desbloquear Todos';
    resetBtn.className = 'btn btn-danger';
    
    resetBtn.addEventListener('click', () => {
      if (confirm('¿Está seguro que desea desbloquear todos los períodos?')) {
        storageManager.guardarPeriodosBloqueados([]);
        cargarCiclosNavbar();
        panel.style.display = 'none';
      }
    });
    
    actionButtons.appendChild(resetBtn);
    body.appendChild(actionButtons);
    
    panel.appendChild(body);
    
    // Agregar footer con información
    const footer = document.createElement('div');
    footer.className = 'card-footer text-muted small';
    footer.innerHTML = 'Esta configuración se guarda localmente en este navegador.';
    panel.appendChild(footer);
    
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
 * Crea el botón de administración en el navbar SOLO para administradores
 */
const crearBotonAdminNavbar = () => {
  // Solo mostrar el botón si el usuario es administrador
  if (!document.body.classList.contains('admin-user')) {
    return;
  }
  
  const navbarContainer = selectCuatri.parentElement;
  
  // Verificar si ya existe el botón
  if (document.getElementById('btn-admin-periodos')) {
    return;
  }
  
  // Crear botón de administración pero invisible
  const adminBtn = document.createElement('button');
  adminBtn.id = 'btn-admin-periodos';
  adminBtn.innerHTML = '<i class="bi bi-gear-fill"></i> Administrar';
  adminBtn.className = 'btn btn-outline-secondary btn-sm';
  adminBtn.style.marginLeft = '15px';
  
  // Hacer el botón invisible pero funcional
  adminBtn.style.opacity = '0';         // Completamente transparente
  adminBtn.style.pointerEvents = 'all'; // Sigue siendo funcional
  adminBtn.style.position = 'absolute'; // Sacarlo del flujo normal
  
  // Evento para mostrar/ocultar el panel
  adminBtn.addEventListener('click', togglePanelAdministracion);
  
  // Registrar combinación de teclas para administrador (Alt+P)
  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key === 'p') {
      togglePanelAdministracion();
      e.preventDefault();
    }
  });
  
  // Agregar al DOM
  navbarContainer.appendChild(adminBtn);
};

/**
 * Detecta si el usuario actual es administrador
 */
const detectarTipoUsuario = () => {
  // Verificar si el usuario es administrador
  // Basado en el header que incluiste, podemos detectar isAdmin
  const isAdmin = document.querySelector('body').classList.contains('admin-user') || 
                 (typeof isAdmin !== 'undefined' && isAdmin === true);
  
  if (isAdmin) {
    document.body.classList.add('admin-user');
  }
  
  return isAdmin;
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
      
      optionsHTML += `<option value="${CODIGO_CORTO}" ${selected} ${bloqueado ? 'disabled' : ''}>${DESCRIPCION}${estado}</option>`;
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
    
    // Detectar tipo de usuario y crear botón admin si corresponde
    if (detectarTipoUsuario()) {
      crearBotonAdminNavbar();
    }

  } catch (error) {
    console.error("Error al cargar los ciclos del navbar:", error);
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
    // Revertir selección
    event.target.value = storageManager.obtenerPeriodo() || "none";
    return;
  }
  
  try {
    const resultado = await actualizarPeriodo(nuevoPeriodo);
    console.log("Periodo actualizado:", resultado);
        
    // Guardar en localStorage
    storageManager.guardarPeriodo(nuevoPeriodo);
    
    // Recargar la página 
    location.reload();
    
  } catch (error) {
    console.warn("Error al cambiar periodo:", error);
    
    // Revertir la selección en caso de error
    event.target.value = storageManager.obtenerPeriodo() || "none";
  }
});

// Detectar clase admin en el body al cargar la página
document.addEventListener('DOMContentLoaded', function() {
  // Verificar si hay un elemento con atributo isAdmin o basado en la plantilla
  if (document.querySelector('[data-role="admin"]') || 
      document.querySelector('script[data-user-role="admin"]') ||
      (typeof isAdmin !== 'undefined' && isAdmin === true)) {
    document.body.classList.add('admin-user');
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

// Inicializar detección de tipo de usuario
// Agregar una manera de detectar si el usuario es admin basado en el template Handlebars
if (typeof isAdmin !== 'undefined' && isAdmin === true) {
  document.body.classList.add('admin-user');
}

// Cargar ciclos al iniciar
cargarCiclosNavbar();