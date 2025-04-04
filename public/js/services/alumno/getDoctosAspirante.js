document.addEventListener("DOMContentLoaded", () => {
  const body = document.getElementById("content");
  const numalumno = document.getElementById("numeroalumno");
  const select = document.getElementById("filterDocto");
  let gradoSelected = 0;

  if (!body || !numalumno || !select) {
    console.error("Algunos elementos del DOM no se encontraron.");
    return;
  }

  const createUploadForm = () => {
    return `
      <div class="my-4 text-center">
        <input type="file" id="uploadInput" accept="application/pdf" class="form-control mb-2 d-inline-block w-auto">
        <button class="btn btn-primary" id="uploadBtn">Subir Documento</button>
      </div>`;
  };

  // Función para obtener los documentos
  const getDoctos = async () => {
    const url = `/api/doctos?numalumno=${numalumno.value}&grado=${gradoSelected}`;

    body.innerHTML = `
      <div class="d-flex justify-content-center align-items-center" style="height: 100vh;">
        <div class="spinner-border text-primary" role="status"></div>
      </div>`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data.error) {
        body.innerHTML = `<div class="text-center text-danger"><h3>${data.error}</h3></div>`;
        return;
      }

      let content = createUploadForm();

      if (data.doctos?.length > 0) {
        content += `<div class="row">`;
        data.doctos.forEach((item) => {
          content += `
            <div class="col-md-3 col-lg-4 col-12 mb-4">
              <div class="card border-0 shadow-sm">
                <div class="card-body text-center">
                  <img src="/imgs/pdf.png" alt="Documento PDF" class="img-fluid mb-2" style="width: 100px; cursor: pointer;" onclick="viewPDF('${item.ID_DOCTO}')">
                  <h5 class="card-title text-truncate">${item.NOMBRE_ARCHIVO || item.ID_DOCTO}</h5>
                  <p class="text-success"><strong>Entregado</strong></p>
                </div>
              </div>
            </div>`;
        });
        content += `</div>`;
      } else {
        content += `<div class="text-center"><h3>No hay documentos a mostrar</h3></div>`;
      }

      body.innerHTML = content;

      // Asignar evento al botón de subir después de que se renderiza
      document.getElementById("uploadBtn")?.addEventListener("click", uploadDocument);

    } catch (error) {
      console.error("Error al obtener los documentos:", error);
      body.innerHTML = `<div class="text-center text-danger"><h3>Error al cargar documentos</h3></div>`;
    }
  };

  // Función para subir documento
  const uploadDocument = async () => {
    const fileInput = document.getElementById("uploadInput");
    const file = fileInput?.files[0];

    if (!file || file.type !== "application/pdf") {
      alert("Por favor selecciona un archivo PDF válido.");
      return;
    }

    const formData = new FormData();
    formData.append("document", file);
    formData.append("numalumno", numalumno.value);
    formData.append("grado", gradoSelected);

    try {
      const res = await fetch("/api/doctos/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        alert("Documento subido correctamente");
        getDoctos(); // Refrescar la lista
      } else {
        alert("Error al subir documento");
      }
    } catch (err) {
      console.error("Error al subir el documento", err);
      alert("Ocurrió un error al subir el documento");
    }
  };

  // Función para ver PDF
  window.viewPDF = (documentId) => {
    const existingModal = document.getElementById('pdfModal');
    if (existingModal) existingModal.remove();

    const modalHTML = `
      <div class="modal fade" id="pdfModal" tabindex="-1" aria-labelledby="pdfModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-fullscreen">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Visualizando Documento</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
              <iframe src="/doctos/${documentId}" width="100%" height="100%" frameborder="0"></iframe>
            </div>
          </div>
        </div>
      </div>`;

    body.insertAdjacentHTML('beforeend', modalHTML);
    new bootstrap.Modal(document.getElementById('pdfModal')).show();
  };

  select.addEventListener("change", (e) => {
    gradoSelected = e.target.value;
    getDoctos();
  });

  getDoctos();
});