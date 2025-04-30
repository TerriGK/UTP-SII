/**
* Sistema de Administración de Períodos - Código Factorizado
* 
* Este módulo gestiona la selección, bloqueo y administración de períodos académicos
* usando un patrón modular para mejorar la mantenibilidad y organización del código
*/
"use strict";

// Módulo principal encapsulado en un IIFE para evitar contaminación del espacio global
const SistemaPeriodos = (function() {

// Constantes de configuración
const CONFIG = {
 API_ENDPOINTS: {
   CICLOS: "/api/cuatris-navbar",
   ACTUALIZAR_PERIODO: "/api/update/CuatriXGrupos"
 },
 STORAGE_KEYS: {
   PERIODO: "periodoSeleccionado",
   BLOQUEADOS: "periodosBloqueados",
   ULTIMO_CAMBIO: "ultimoCambioPeriodo",
   ACTIVIDAD: "actividadReciente"
 },
 DOM_IDS: {
   SELECT_CICLO: "selectciclo",
   TABLA_PERIODOS: "tabla-periodos",
   CONTADOR_BLOQUEADOS: "contador-bloqueados",
   CONTADOR_DISPONIBLES: "contador-disponibles",
   PERIODO_ACTUAL: "periodo-actual",
   ULTIMO_CAMBIO: "ultimo-cambio",
   BTN_ADMIN: "btn-admin-periodos",
   BTN_DESBLOQUEAR_TODOS: "btn-desbloquear-todos",
   PANEL_BLOQUEO: "panel-bloqueo-periodos",
   ACTIVITY_LOG: "activity-log"
 },
 CLASES_CSS: {
   BTN_OUTLINE_DANGER: "btn-outline-danger",
   BTN_OUTLINE_SUCCESS: "btn-outline-success",
   BTN_OUTLINE_PRIMARY: "btn-outline-primary",
   BTN_SM: "btn btn-sm",
   TABLE_DANGER: "table-danger",
   TABLE_SUCCESS: "table-success",
   BADGE: {
     DANGER: "badge bg-danger",
     SUCCESS: "badge bg-success",
     SECONDARY: "badge bg-secondary"
   }
 }
};

// Caché para elementos DOM frecuentemente usados
const DOM = {
 elements: {},
 
 /**
  * Obtiene un elemento del DOM por su ID, cacheándolo
  * @param {string} id - ID del elemento
  * @returns {HTMLElement} - Elemento del DOM
  */
 get(id) {
   if (!this.elements[id]) {
     this.elements[id] = document.getElementById(id);
   }
   return this.elements[id];
 },
 
 /**
  * Limpia el caché de elementos
  */
 resetCache() {
   this.elements = {};
 }
};

// Módulo para gestionar el almacenamiento local
const Storage = {
 /**
  * Obtiene un valor del localStorage
  * @param {string} key - Clave del valor a obtener
  * @param {boolean} parseJSON - Indica si debe parsearse como JSON
  * @returns {*} - Valor obtenido
  */
 get(key, parseJSON = false) {
   const value = localStorage.getItem(key);
   return parseJSON && value ? JSON.parse(value) : value;
 },
 
 /**
  * Guarda un valor en localStorage
  * @param {string} key - Clave para guardar el valor
  * @param {*} value - Valor a guardar (se convertirá a JSON si no es string)
  */
 set(key, value) {
   const valueToStore = typeof value === 'string' ? value : JSON.stringify(value);
   localStorage.setItem(key, valueToStore);
 },
 
 /**
  * Elimina un valor del localStorage
  * @param {string} key - Clave a eliminar
  */
 remove(key) {
   localStorage.removeItem(key);
 }
};

// Módulo para gestionar períodos bloqueados
const PeriodosBloqueados = {
 /**
  * Obtiene la lista de períodos bloqueados
  * @returns {string[]} - Array con códigos de períodos bloqueados
  */
 obtener() {
   return Storage.get(CONFIG.STORAGE_KEYS.BLOQUEADOS, true) || [];
 },
 
 /**
  * Guarda la lista de períodos bloqueados
  * @param {string[]} lista - Lista de códigos de períodos bloqueados
  */
 guardar(lista) {
   Storage.set(CONFIG.STORAGE_KEYS.BLOQUEADOS, lista);
   ActividadLog.registrar("Actualización de períodos bloqueados");
 },
 
 /**
  * Bloquea un período específico
  * @param {string} periodo - Código del período a bloquear
  */
 bloquear(periodo) {
   const periodosBloqueados = this.obtener();
   if (!periodosBloqueados.includes(periodo)) {
     periodosBloqueados.push(periodo);
     this.guardar(periodosBloqueados);
     ActividadLog.registrar(`Período ${periodo} bloqueado`);
     UI.actualizarEstadisticas();
   }
 },
 
 /**
  * Desbloquea un período específico
  * @param {string} periodo - Código del período a desbloquear
  */
 desbloquear(periodo) {
   const periodosBloqueados = this.obtener();
   const nuevosBloqueados = periodosBloqueados.filter(p => p !== periodo);
   this.guardar(nuevosBloqueados);
   ActividadLog.registrar(`Período ${periodo} desbloqueado`);
   UI.actualizarEstadisticas();
 },
 
 /**
  * Desbloquea todos los períodos
  */
 desbloquearTodos() {
   this.guardar([]);
   ActividadLog.registrar("Todos los períodos han sido desbloqueados");
   UI.actualizarEstadisticas();
 },
 
 /**
  * Verifica si un período está bloqueado
  * @param {string} periodo - Código del período a verificar
  * @returns {boolean} - true si está bloqueado, false en caso contrario
  */
 estaBloqueado(periodo) {
   return this.obtener().includes(periodo);
 }
};

// Módulo para gestionar el período seleccionado
const PeriodoSeleccionado = {
 /**
  * Obtiene el período actualmente seleccionado
  * @returns {string|null} - Código del período seleccionado o null
  */
 obtener() {
   return Storage.get(CONFIG.STORAGE_KEYS.PERIODO);
 },
 
 /**
  * Guarda el período seleccionado
  * @param {string} periodo - Código del período a guardar
  */
 guardar(periodo) {
   Storage.set(CONFIG.STORAGE_KEYS.PERIODO, periodo);
   Storage.set(CONFIG.STORAGE_KEYS.ULTIMO_CAMBIO, new Date().toISOString());
   ActividadLog.registrar(`Período ${periodo} seleccionado como actual`);
 },
 
 /**
  * Actualiza el período seleccionado en el servidor
  * @param {string} periodo - Código del período a actualizar
  * @returns {Promise<object>} - Respuesta JSON del servidor
  */
 async actualizar(periodo) {
   try {
     const config = {
       method: "PUT",
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ periodo })
     };

     const response = await fetch(CONFIG.API_ENDPOINTS.ACTUALIZAR_PERIODO, config);
     if (!response.ok) {
       throw new Error(`Error en la actualización: ${response.status}`);
     }

     // Guardar en localStorage y registrar
     this.guardar(periodo);
     
     // Actualizar la UI
     UI.actualizarEstadisticas();

     return response.json();
   } catch (error) {
     console.error("Error al actualizar período:", error);
     UI.mostrarNotificacion("Error al actualizar el período", "danger");
     throw error;
   }
 }
};

// Módulo para gestionar el registro de actividades
const ActividadLog = {
 /**
  * Registra una nueva actividad
  * @param {string} mensaje - Descripción de la actividad
  */
 registrar(mensaje) {
   const actividades = this.obtener();
   actividades.unshift({
     mensaje,
     fecha: new Date().toISOString()
   });
   
   // Limitar a las últimas 10 actividades
   if (actividades.length > 10) {
     actividades.pop();
   }
   
   Storage.set(CONFIG.STORAGE_KEYS.ACTIVIDAD, actividades);
   this.actualizarUI();
 },
 
 /**
  * Obtiene el registro de actividades
  * @returns {Array} - Lista de actividades
  */
 obtener() {
   return Storage.get(CONFIG.STORAGE_KEYS.ACTIVIDAD, true) || [];
 },
 
 /**
  * Actualiza el log de actividad en la UI
  */
 actualizarUI() {
   const actividadLog = DOM.get(CONFIG.DOM_IDS.ACTIVITY_LOG);
   if (!actividadLog) return;
   
   const actividades = this.obtener();
   
   if (actividades.length === 0) {
     actividadLog.innerHTML = '<p class="text-muted">No hay actividad reciente registrada</p>';
     return;
   }
   
   let html = '';
   
   actividades.forEach(act => {
     const fecha = new Date(act.fecha);
     const fechaFormateada = fecha.toLocaleDateString('es-ES', { 
       day: '2-digit', 
       month: '2-digit',
       hour: '2-digit',
       minute: '2-digit'
     });
     
     html += `
       <div class="mb-3">
         <div class="d-flex justify-content-between">
           <strong>${act.mensaje}</strong>
           <small class="text-muted">${fechaFormateada}</small>
         </div>
       </div>
     `;
   });
   
   actividadLog.innerHTML = html;
 }
};

// Módulo para gestionar la comunicación con la API
const API = {
 /**
  * Obtiene los ciclos desde la API
  * @returns {Promise<Array>} - Lista de ciclos
  */
 async obtenerCiclos() {
   try {
     const response = await fetch(CONFIG.API_ENDPOINTS.CICLOS);
     if (!response.ok) {
       throw new Error(`Error al obtener ciclos: ${response.status}`);
     }
     const { ciclos = [] } = await response.json();
     return ciclos;
   } catch (error) {
     console.error("Error al obtener ciclos:", error);
     throw error;
   }
 }
};

// Módulo para gestionar la interfaz de usuario
const UI = {
 /**
  * Actualiza la tabla de períodos en el dashboard
  * @param {Array} ciclos - Lista de ciclos (opcional)
  */
 async actualizarTablaPeriodos(ciclos) {
   const tablaCuerpo = DOM.get(CONFIG.DOM_IDS.TABLA_PERIODOS);
   if (!tablaCuerpo) return;

   // Si ciclos no se proporciona, obtenerlo de la API
   if (!ciclos) {
     try {
       ciclos = await API.obtenerCiclos();
     } catch (error) {
       console.error("Error al obtener ciclos para la tabla:", error);
       tablaCuerpo.innerHTML = `
         <tr>
           <td colspan="4" class="text-center text-danger">
             <i class="fas fa-exclamation-triangle me-2"></i>
             Error al cargar datos. ${error.message}
           </td>
         </tr>`;
       return;
     }
   }

   const periodosBloqueados = PeriodosBloqueados.obtener();
   const periodoActual = PeriodoSeleccionado.obtener();

   let html = '';

   ciclos.forEach(ciclo => {
     const bloqueado = periodosBloqueados.includes(ciclo.CODIGO_CORTO);
     const esActual = ciclo.CODIGO_CORTO === periodoActual;
     
     html += `
       <tr class="${bloqueado ? 'row-periodo-bloqueado' : (esActual ? 'row-periodo-activo' : '')}">
         <td><strong>${ciclo.CODIGO_CORTO}</strong></td>
         <td>${ciclo.DESCRIPCION}</td>
         <td>
           ${bloqueado 
             ? '<span class="status-badge status-bloqueado"><i class="fas fa-lock me-1"></i>Bloqueado</span>' 
             : (esActual 
               ? '<span class="status-badge status-activo"><i class="fas fa-check-circle me-1"></i>Activo</span>' 
               : '<span class="status-badge status-disponible"><i class="fas fa-circle me-1"></i>Disponible</span>')}
         </td>
         <td>
           <button 
             class="btn-action ${bloqueado ? 'btn-desbloquear' : 'btn-bloquear'}" 
             onclick="${bloqueado 
               ? `SistemaPeriodos.desbloquearPeriodo('${ciclo.CODIGO_CORTO}')` 
               : `SistemaPeriodos.bloquearPeriodo('${ciclo.CODIGO_CORTO}')`}">
             ${bloqueado 
               ? '<i class="fas fa-unlock me-1"></i>Desbloquear' 
               : '<i class="fas fa-lock me-1"></i>Bloquear'}
           </button>
           ${!bloqueado && !esActual 
             ? `<button class="btn-action btn-seleccionar" onclick="SistemaPeriodos.seleccionarPeriodo('${ciclo.CODIGO_CORTO}')">
                 <i class="fas fa-check me-1"></i>Seleccionar
                </button>` 
             : ''}
         </td>
       </tr>
     `;
   });

   tablaCuerpo.innerHTML = html;
 },

 /**
  * Actualiza las estadísticas del dashboard
  */
 async actualizarEstadisticas() {
   const periodosBloqueados = PeriodosBloqueados.obtener();
   const periodoActual = PeriodoSeleccionado.obtener();
   const fechaUltimoCambio = Storage.get(CONFIG.STORAGE_KEYS.ULTIMO_CAMBIO);
   
   try {
     const ciclos = await API.obtenerCiclos();
     
     // Actualizar contadores
     const contadorBloqueados = DOM.get(CONFIG.DOM_IDS.CONTADOR_BLOQUEADOS);
     const contadorDisponibles = DOM.get(CONFIG.DOM_IDS.CONTADOR_DISPONIBLES);
     
     if (contadorBloqueados) {
       contadorBloqueados.textContent = periodosBloqueados.length;
     }
     
     if (contadorDisponibles) {
       contadorDisponibles.textContent = ciclos.length - periodosBloqueados.length;
     }
     
     // Mostrar periodo actual
     const elementoPeriodoActual = DOM.get(CONFIG.DOM_IDS.PERIODO_ACTUAL);
     if (elementoPeriodoActual) {
       const cicloActual = ciclos.find(c => c.CODIGO_CORTO === periodoActual);
       
       if (cicloActual) {
         elementoPeriodoActual.innerHTML = cicloActual.DESCRIPCION + 
           `<div class="small text-muted">(${cicloActual.CODIGO_CORTO})</div>`;
       } else {
         elementoPeriodoActual.textContent = 'No seleccionado';
       }
     }
     
     // Mostrar fecha último cambio
     const elementoUltimoCambio = DOM.get(CONFIG.DOM_IDS.ULTIMO_CAMBIO);
     if (elementoUltimoCambio && fechaUltimoCambio) {
       const fecha = new Date(fechaUltimoCambio);
       elementoUltimoCambio.textContent = fecha.toLocaleDateString('es-ES', { 
         day: '2-digit', 
         month: '2-digit', 
         year: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
       });
     } else if (elementoUltimoCambio) {
       elementoUltimoCambio.textContent = 'Sin cambios recientes';
     }
     
     // Actualizar actividad reciente
     ActividadLog.actualizarUI();
   } catch (error) {
     console.error("Error al actualizar estadísticas:", error);
     
     // Actualizar con datos locales en caso de error
     const contadorBloqueados = DOM.get(CONFIG.DOM_IDS.CONTADOR_BLOQUEADOS);
     const elementoPeriodoActual = DOM.get(CONFIG.DOM_IDS.PERIODO_ACTUAL);
     
     if (contadorBloqueados) {
       contadorBloqueados.textContent = periodosBloqueados.length;
     }
     
     if (elementoPeriodoActual) {
       elementoPeriodoActual.textContent = periodoActual || 'No seleccionado';
     }
   }
 },

 /**
  * Carga los ciclos disponibles en el select del navbar
  */
 async cargarCiclosNavbar() {
   const selectCuatri = DOM.get(CONFIG.DOM_IDS.SELECT_CICLO);
   if (!selectCuatri) return;

   try {
     const response = await fetch(CONFIG.API_ENDPOINTS.CICLOS);
     if (!response.ok) {
       throw new Error(`Error al obtener ciclos: ${response.status}`);
     }

     const { ciclos = [], periodoSelected } = await response.json();
     
     // Verificar si hay un periodo guardado en localStorage
     const periodoGuardado = PeriodoSeleccionado.obtener();
     
     // Determinar qué periodo usar (prioridad: localStorage, luego servidor)
     const periodoActual = periodoGuardado || periodoSelected;

     // Limpiar el select
     selectCuatri.innerHTML = "";

     // Opción por defecto si no hay periodo seleccionado
     if (!periodoActual) {
       selectCuatri.innerHTML = `<option value="none" selected>Seleccionar Ciclo</option>`;
     } else {
       selectCuatri.innerHTML = `<option value="none">Seleccionar Ciclo</option>`;
     }
     
     // Verificar si el ciclo actual está bloqueado
     const periodoActualBloqueado = periodoActual ? PeriodosBloqueados.estaBloqueado(periodoActual) : false;
     
     // Configurar el select según si hay periodo seleccionado y si está bloqueado
     selectCuatri.disabled = periodoActual && periodoActualBloqueado;
     
     if (periodoActual && periodoActualBloqueado) {
       selectCuatri.classList.add('faded');
     } else {
       selectCuatri.classList.remove('faded');
     }

     // Obtener la lista de períodos bloqueados
     const periodosBloqueados = PeriodosBloqueados.obtener();

     // Agregar los ciclos disponibles
     const opcionesCiclos = ciclos.reverse().map(({ CODIGO_CORTO, DESCRIPCION }) => {
       const selected = CODIGO_CORTO === periodoActual ? 'selected' : '';
       const bloqueado = periodosBloqueados.includes(CODIGO_CORTO);
       
       // Marcar visualmente los períodos bloqueados y deshabilitar su selección
       const estado = bloqueado ? ' 🔒' : '';
       const disabled = bloqueado ? 'disabled' : '';
       
       return `<option value="${CODIGO_CORTO}" ${selected} ${disabled}>${DESCRIPCION}${estado}</option>`;
     });

     // Insertar opciones al select
     selectCuatri.innerHTML += opcionesCiclos.join('');
     
     // Crear botón de administración si no existe
     this.crearBotonAdmin();
     
     // Actualizar tabla de períodos
     await this.actualizarTablaPeriodos(ciclos);
     
     // Actualizar estadísticas
     await this.actualizarEstadisticas();

   } catch (error) {
     console.error("Error al cargar los ciclos del navbar:", error);
     selectCuatri.innerHTML = `<option value="none">Error al cargar ciclos</option>`;
     
     const tablaPeriodos = DOM.get(CONFIG.DOM_IDS.TABLA_PERIODOS);
     if (tablaPeriodos) {
       tablaPeriodos.innerHTML = `
         <tr><td colspan="4" class="text-center text-danger">
           <i class="fas fa-exclamation-triangle me-2"></i>
           Error al cargar los ciclos. ${error.message}
         </td></tr>`;
     }
     
     this.mostrarNotificacion("Error al cargar los ciclos", "danger");
   }
 },

 /**
  * Crea y muestra un panel con la lista de períodos para bloquear/desbloquear
  * @param {Array} ciclos - Lista de ciclos disponibles
  */
 mostrarPanelBloqueo(ciclos) {
   // Verificar si ya existe el panel
   let panelExistente = DOM.get(CONFIG.DOM_IDS.PANEL_BLOQUEO);
   if (panelExistente) {
     panelExistente.style.display = 'block';
     return;
   }

   // Obtener períodos bloqueados
   const periodosBloqueados = PeriodosBloqueados.obtener();

   // Crear panel
   const panel = document.createElement('div');
   panel.id = CONFIG.DOM_IDS.PANEL_BLOQUEO;
   panel.className = 'panel-administrar';

   // Crear encabezado
   const header = document.createElement('div');
   header.className = 'panel-header';

   const title = document.createElement('h5');
   title.textContent = 'Administrar Períodos';
   title.className = 'panel-title';

   const closeBtn = document.createElement('button');
   closeBtn.innerHTML = '<i class="fas fa-times"></i>';
   closeBtn.className = 'panel-close';
   closeBtn.onclick = () => panel.style.display = 'none';

   header.appendChild(title);
   header.appendChild(closeBtn);
   panel.appendChild(header);

   // Crear lista de períodos
   const list = document.createElement('div');
   list.className = 'panel-body';

   // Agregar cada período a la lista
   ciclos.forEach(ciclo => {
     const item = document.createElement('div');
     item.className = 'panel-item';

     const itemInfo = document.createElement('div');
     itemInfo.className = 'panel-item-info';
     itemInfo.innerHTML = `
       <div class="panel-item-title">${ciclo.DESCRIPCION}</div>
       <div class="panel-item-code">Código: ${ciclo.CODIGO_CORTO}</div>
     `;

     const toggleBtn = document.createElement('button');
     const bloqueado = periodosBloqueados.includes(ciclo.CODIGO_CORTO);
     toggleBtn.innerHTML = bloqueado ? 
       '<i class="fas fa-unlock"></i> Desbloquear' : 
       '<i class="fas fa-lock"></i> Bloquear';
     toggleBtn.className = bloqueado ? 'btn-action btn-desbloquear' : 'btn-action btn-bloquear';

     toggleBtn.onclick = () => {
       if (bloqueado) {
         PeriodosBloqueados.desbloquear(ciclo.CODIGO_CORTO);
         toggleBtn.innerHTML = '<i class="fas fa-lock"></i> Bloquear';
         toggleBtn.className = 'btn-action btn-bloquear';
       } else {
         PeriodosBloqueados.bloquear(ciclo.CODIGO_CORTO);
         toggleBtn.innerHTML = '<i class="fas fa-unlock"></i> Desbloquear';
         toggleBtn.className = 'btn-action btn-desbloquear';
       }
       // Recargar el navbar para actualizar los estados
       UI.cargarCiclosNavbar();
     };

     item.appendChild(itemInfo);
     item.appendChild(toggleBtn);
     list.appendChild(item);
   });

   panel.appendChild(list);

   // Footer con botón para desbloquear todos
   const footer = document.createElement('div');
   footer.className = 'panel-footer';

   const desbloquearBtn = document.createElement('button');
   desbloquearBtn.innerHTML = '<i class="fas fa-unlock-alt me-2"></i>Desbloquear Todos';
   desbloquearBtn.className = 'btn-desbloquear-todos';

   desbloquearBtn.onclick = () => {
     if (confirm('¿Está seguro que desea desbloquear todos los períodos?')) {
       PeriodosBloqueados.desbloquearTodos();
       UI.cargarCiclosNavbar();
       panel.style.display = 'none';
       UI.mostrarNotificacion("Todos los períodos han sido desbloqueados", "success");
     }
   };

   footer.appendChild(desbloquearBtn);
   panel.appendChild(footer);

   // Añadir al DOM
   document.body.appendChild(panel);
 },

 /**
  * Crea el botón de administración en el navbar
  */
 crearBotonAdmin() {
   // Verificar si ya existe el botón con evento asignado
   const btnAdmin = DOM.get(CONFIG.DOM_IDS.BTN_ADMIN);
   if (btnAdmin && btnAdmin._hasEvent) {
     return;
   }
   
   if (btnAdmin) {
     btnAdmin.onclick = async () => {
       try {
         const ciclos = await API.obtenerCiclos();
         this.mostrarPanelBloqueo(ciclos);
       } catch (error) {
         console.error("Error al obtener los ciclos:", error);
         this.mostrarNotificacion("No se pudieron cargar los ciclos", "danger");
       }
     };
     btnAdmin._hasEvent = true;
   }
 },

 /**
  * Muestra una notificación temporal
  * @param {string} mensaje - Texto de la notificación
  * @param {string} tipo - Tipo de notificación (success, danger, warning, info)
  */
 mostrarNotificacion(mensaje, tipo = 'info') {
   // Verificar si ya existe una notificación
   let notificacionExistente = document.querySelector('.notificacion-flotante');
   if (notificacionExistente) {
     notificacionExistente.remove();
   }
   
   // Crear el elemento de notificación
   const notificacion = document.createElement('div');
   notificacion.className = `notificacion-flotante notificacion-${tipo}`;
   
   // Contenido
   notificacion.innerHTML = `
     <div style="display: flex; align-items: center;">
       <i class="fas ${tipo === 'success' ? 'fa-check-circle' : 
                     tipo === 'danger' ? 'fa-exclamation-circle' : 
                     tipo === 'warning' ? 'fa-exclamation-triangle' : 
                     'fa-info-circle'}" style="margin-right: 10px; font-size: 20px;"></i>
       <div>${mensaje}</div>
     </div>
   `;
   
   // Añadir al DOM
   document.body.appendChild(notificacion);
   
   // Eliminar después de 3 segundos
   setTimeout(() => {
     notificacion.style.animation = 'fadeOut 0.3s ease';
     setTimeout(() => notificacion.remove(), 300);
   }, 3000);
 }
};

// Inicialización del sistema
function inicializar() {
 // Referencia al select de ciclos
 const selectCuatri = DOM.get(CONFIG.DOM_IDS.SELECT_CICLO);
 if (!selectCuatri) {
   console.error("No se encontró el elemento select para ciclos");
   return;
 }

 // Evento para cambio manual del usuario en el select de ciclo
 selectCuatri.addEventListener("change", async (event) => {
   const nuevoPeriodo = event.target.value;
   
   // Ignorar si se selecciona la opción "none"
   if (nuevoPeriodo === "none") return;
   
   // Verificar si el período seleccionado está bloqueado
   if (PeriodosBloqueados.estaBloqueado(nuevoPeriodo)) {
     UI.mostrarNotificacion("Este período está bloqueado y no puede ser seleccionado", "warning");
     
     // Revertir selección
     event.target.value = PeriodoSeleccionado.obtener() || "none";
     return;
   }
   
   try {
     const resultado = await PeriodoSeleccionado.actualizar(nuevoPeriodo);
     console.log("Periodo actualizado:", resultado);
     UI.mostrarNotificacion(`Período ${nuevoPeriodo} seleccionado correctamente`, "success");

     // Preguntar si desea recargar
     if (confirm("Período actualizado correctamente. ¿Desea recargar la página para aplicar los cambios?")) {
       location.reload();
     } else {
       // En lugar de recargar la página, solo actualizamos la UI
       await UI.cargarCiclosNavbar();
     }
   } catch (error) {
     console.warn("Error al cambiar periodo:", error);
     UI.mostrarNotificacion("No se pudo actualizar el período", "danger");
   }
 });

 // Configurar botón para desbloquear todos
 const btnDesbloquearTodos = DOM.get(CONFIG.DOM_IDS.BTN_DESBLOQUEAR_TODOS);
 if (btnDesbloquearTodos) {
   btnDesbloquearTodos.addEventListener('click', async () => {
     if (confirm('¿Está seguro que desea desbloquear todos los períodos?')) {
       PeriodosBloqueados.desbloquearTodos();
       await UI.cargarCiclosNavbar();
       UI.mostrarNotificacion('Todos los períodos han sido desbloqueados', 'success');
     }
   });
 }

 // Escuchar cambios en localStorage para mantener sincronizado el navbar
 window.addEventListener('storage', function(e) {
   if (e.key === CONFIG.STORAGE_KEYS.BLOQUEADOS || e.key === CONFIG.STORAGE_KEYS.PERIODO) {
     // Recargar el navbar cuando hay cambios en los bloqueos o el período seleccionado
     UI.cargarCiclosNavbar();
   }
 });

 // Cargar ciclos al iniciar
 UI.cargarCiclosNavbar();
}

// Métodos públicos del sistema
return {
 /**
  * Inicializa el sistema de administración de períodos
  */
 init() {
   inicializar();
 },

 /**
  * Bloquea un período específico
  * @param {string} periodo - Código del período a bloquear
  */
 bloquearPeriodo(periodo) {
   PeriodosBloqueados.bloquear(periodo);
   UI.actualizarTablaPeriodos();
 },

 /**
  * Desbloquea un período específico
  * @param {string} periodo - Código del período a desbloquear
  */
 desbloquearPeriodo(periodo) {
   PeriodosBloqueados.desbloquear(periodo);
   UI.actualizarTablaPeriodos();
 },

 /**
  * Selecciona un período específico
  * @param {string} periodo - Código del período a seleccionar
  */
 seleccionarPeriodo: async function(periodo) {
   try {
     await PeriodoSeleccionado.actualizar(periodo);
     await UI.cargarCiclosNavbar();
     UI.mostrarNotificacion(`Período ${periodo} seleccionado correctamente`, "success");
   } catch (error) {
     console.error("Error al seleccionar período:", error);
     UI.mostrarNotificacion("No se pudo seleccionar el período", "danger");
   }
 },

 /**
  * Actualiza la tabla de períodos manualmente
  */
 actualizarTabla() {
   UI.actualizarTablaPeriodos();
 },

 /**
  * Recarga todos los datos del sistema
  */
 recargar() {
   UI.cargarCiclosNavbar();
   UI.mostrarNotificacion("Sistema actualizado correctamente", "success");
 }
};
})();

// Inicializar el sistema cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', SistemaPeriodos.init);
