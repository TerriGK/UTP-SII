// Elementos del DOM
const body = document.getElementById("content");
const numalumno = document.getElementById("numeroalumno");
const select = document.getElementById("filterDocto");
let gradoSelected = 0;
let currentOpenPreview = null; // Variable global para controlar la vista previa actual

/**
 * Función principal para obtener documentos
 */
const getDoctos = async () => {
  showLoadingSpinner();

  try {
    const { doctos = [] } = await fetchDoctos();
    renderContent(doctos);
    setupPreviewEvents();
  } catch (error) {
    console.error(error);
    showErrorMessage("Error al cargar documentos");
  }
};

/**
 * Configura los eventos de vista previa
 */
const setupPreviewEvents = () => {
  document.querySelectorAll('.preview-btn').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const doctoId = this.dataset.doctoId;
      const previewContainer = document.getElementById(`preview-container-${doctoId}`);

      // Si ya está abierto, solo cerrarlo
      if (currentOpenPreview === previewContainer) {
        previewContainer.style.display = 'none';
        currentOpenPreview = null;
        return;
      }

      // Cerrar el anterior si existe
      if (currentOpenPreview) {
        currentOpenPreview.style.display = 'none';
      }

      // Configurar el nuevo
      if (!previewContainer.innerHTML) {
        previewContainer.innerHTML = `
          <div class="preview-wrapper bg-light p-3 rounded-3 border" style="box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.1)">
            <iframe src="/doctos/${doctoId}#toolbar=0&navpanes=0" width="100%" height="400px" class="border-0 mb-3 rounded-2"></iframe>
            <div class="d-flex justify-content-center gap-3">
              <a href="/doctos/${doctoId}" target="_blank" class="btn btn-primary px-3 py-2 d-flex align-items-center">
                <i class="fas fa-external-link-alt me-2"></i> Abrir completo
              </a>
              <button class="btn btn-outline-secondary px-3 py-2 d-flex align-items-center close-preview">
                <i class="fas fa-times me-2"></i> Cerrar
              </button>
            </div>
          </div>
        `;

        previewContainer.querySelector('.close-preview').addEventListener('click', (e) => {
          e.preventDefault();
          previewContainer.style.display = 'none';
          currentOpenPreview = null;
        });
      }

      // Mostrar el nuevo
      previewContainer.style.display = 'block';
      currentOpenPreview = previewContainer;
    });
  });
};

// Eliminé la función showPreview ya que su lógica está integrada en setupPreviewEvents

/**
 * Muestra el spinner de carga
 */
const showLoadingSpinner = () => {
  body.innerHTML = `
    <div class="text-center py-5">
      <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div>
      <p class="mt-3 text-muted fs-5">Cargando documentos...</p>
    </div>
  `;
};

/**
 * Obtiene documentos de la API
 */
const fetchDoctos = async () => {
  const response = await fetch(`/api/doctos?numalumno=${numalumno.value}&grado=${gradoSelected}`);
  if (!response.ok) throw new Error("Error en la respuesta del servidor");
  return await response.json();
};

/**
 * Renderiza el contenido principal
 */
const renderContent = (doctos) => {
  body.innerHTML = doctos.length > 0 ? generateDoctoCards(doctos) : generateEmptyMessage();
};

/**
 * Genera las tarjetas de documentos
 */
const generateDoctoCards = (doctos) => {
  return doctos.map(item => {
    const isEntregado = item.ENTREGADO === true || item.ENTREGADO === 'SI' || item.ESTADO === 'ENTREGADO';
    const status = {
      color: isEntregado ? 'success' : 'danger',
      text: isEntregado ? 'Entregado' : 'Pendiente'
    };

    return `
    <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
      <div class="card h-100 shadow-sm border-0" style="border-radius: 12px; overflow: hidden;">
        <div class="card-body text-center d-flex flex-column p-4">
          <!-- Icono PDF con indicador de estado -->
          <div class="position-relative mx-auto mb-4" style="width: 80px;">
            <img src="/imgs/pdf.png" alt="PDF" class="img-fluid" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1))">
            <span class="position-absolute top-0 start-100 translate-middle p-2 bg-${status.color} border border-2 border-white rounded-circle" style="box-shadow: 0 0 0 2px var(--bs-${status.color})">
              <span class="visually-hidden">${status.text}</span>
            </span>
          </div>
          
          <!-- Información del documento -->
          <h5 class="card-title mb-3 fs-5 fw-semibold">${item.ID_DOCTO}</h5>
          <span class="badge bg-${status.color} rounded-pill mb-4 px-3 py-2 fs-6">${status.text}</span>
          
          <!-- Botones de acción -->
          <div class="mt-auto d-grid gap-2">
            <button class="btn btn-outline-primary preview-btn py-2 d-flex align-items-center justify-content-center" data-docto-id="${item.ID_DOCTO}">
              <i class="far fa-eye me-2"></i> Vista previa
            </button>
            <a href="/doctos/${item.ID_DOCTO}" target="_blank" class="btn btn-primary py-2 d-flex align-items-center justify-content-center">
              <i class="fas fa-file-download me-2"></i> Descargar
            </a>
          </div>
        </div>
      </div>
      <div id="preview-container-${item.ID_DOCTO}" class="preview-container mt-3" style="display:none;"></div>
    </div>`;
  }).join('');
};

/**
 * Mensaje cuando no hay documentos
 */
const generateEmptyMessage = () => {
  return `
    <div class="text-center py-5">
      <i class="far fa-folder-open fa-4x text-muted mb-4" style="opacity: 0.6"></i>
      <h3 class="text-muted fw-normal mb-3">No se encontraron documentos</h3>
      <p class="text-muted fs-5">Prueba con otros filtros de búsqueda</p>
    </div>
  `;
};

/**
 * Muestra mensaje de error
 */
const showErrorMessage = (message) => {
  body.innerHTML = `
    <div class="text-center py-5">
      <i class="fas fa-exclamation-triangle fa-4x text-danger mb-4" style="opacity: 0.8"></i>
      <h3 class="text-danger fw-normal mb-4">${message}</h3>
      <button class="btn btn-outline-primary px-4 py-2 d-flex align-items-center mx-auto" onclick="getDoctos()">
        <i class="fas fa-sync-alt me-2"></i> Reintentar
      </button>
    </div>
  `;
};

// Event Listeners
select.addEventListener("change", (e) => {
  gradoSelected = e.target.value;
  getDoctos();
});

// Inicialización
document.addEventListener('DOMContentLoaded', getDoctos);