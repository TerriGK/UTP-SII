const UI = {
    elements: {
        table: document.getElementById("table-container"),
        tableHeader: document.getElementById("table-header"),
        tableBody: document.getElementById("table-body") || document.createElement('tbody'),
        columnToggles: document.getElementById("column-toggles"),
        loadingIndicator: document.getElementById("load"),
        saveSelectedBtn: document.getElementById("save-selected-btn")
    },

    initialize: function () {
        if (!document.getElementById("table-body")) {
            this.elements.tableBody.id = "table-body";
            this.elements.table.appendChild(this.elements.tableBody);
        }
    },

    showLoading: function (show) {
        this.elements.loadingIndicator.style.display = show ? 'flex' : 'none';
        this.elements.table.style.opacity = show ? '0.5' : '1';
        this.elements.table.style.pointerEvents = show ? 'none' : 'auto';
    },
};

const AppState = {
    columnasVisibles: {},
    columnas: [
        { id: "MATRICULA", nombre: "MATRICULA", visible: false, editable: false },
        { id: "NUMEROALUMNO", nombre: "NUMEROALUMNO", visible: false, editable: false },
        { id: "MATRICULA_OFICIAL", nombre: "MATRICULA_OFICIAL", visible: false, editable: false },
        { id: "NOMBRE", nombre: "NOMBRE", visible: false, editable: false },
        { id: "PATERNO", nombre: "PATERNO", visible: false, editable: false },
        { id: "MATERNO", nombre: "MATERNO", visible: false, editable: false },
        { id: "TIPO_SEG_MED", nombre: "TIPO_SEG_MED.", visible: false, editable: true },
        { id: "NUM_IMSS", nombre: "NUM_IMSS.", visible: false, editable: true },
        { id: "NUM_IMSS_VERIFICADOR", nombre: "NUM_IMSS_VERIFICADOR", visible: false, editable: true },
        { id: "GENERO", nombre: "GENERO", visible: false, editable: true },
        { id: "NIVEL", nombre: "NIVEL", visible: false, editable: true },
        { id: "GRADO", nombre: "GRADO", visible: false, editable: true },
        { id: "SUBNIVEL", nombre: "SUBNIVEL", visible: false, editable: true },
        { id: "STATUS", nombre: "STATUS", visible: false, editable: true },
        { id: "CLAVE_CIUDADANA", nombre: "CLAVE_CIUDADANA", visible: false, editable: true },
        { id: "ESTADO_CIVIL", nombre: "ESTADO_CIVIL", visible: false, editable: true },
        { id: "FECHA_NACIMIENTO", nombre: "FECHA_NACIMIENTO", visible: false, editable: true },
        { id: "DOMICILIO", nombre: "DOMICILIO", visible: false, editable: true },
        { id: "ENTRE_CALLES", nombre: "ENTRE_CALLES", visible: false, editable: true },
        { id: "CP", nombre: "CP", visible: false, editable: true },
        { id: "CIUDAD", nombre: "CIUDAD", visible: false, editable: true },
        { id: "ESTADO", nombre: "ESTADO", visible: false, editable: true },
        { id: "LATITUD", nombre: "LATITUD", visible: false, editable: true },
        { id: "LOGINTUD", nombre: "LOGINTUD", visible: false, editable: true },
        { id: "TELEFONO", nombre: "TELEFONO", visible: false, editable: true },
        { id: "CELULAR", nombre: "CELULAR", visible: false, editable: true },
        { id: "TELEFONOTRABAJO", nombre: "TELEFONOTRABAJO", visible: false, editable: true },
        { id: "NOMBRETUTOR", nombre: "NOMBRETUTOR", visible: false, editable: true },
        { id: "PARENTESCO", nombre: "PARENTESCO", visible: false, editable: true },
        { id: "OBSERVACIONES", nombre: "OBSERVACIONES", visible: false, editable: true },
        { id: "ADICIONALES", nombre: "ADICIONALES", visible: false, editable: true },
        { id: "EMAIL", nombre: "EMAIL", visible: false, editable: true },
        { id: "EMAIL_ALTERNO", nombre: "EMAIL_ALTERNO", visible: false, editable: true },
        { id: "FECHA_BAJA", nombre: "FECHA_BAJA", visible: false, editable: true },
        { id: "ANIOEGRESO", nombre: "ANIOEGRESO", visible: false, editable: true },
        { id: "LUGAR_NACIMIENTO", nombre: "LUGAR_NACIMIENTO", visible: false, editable: true },
        { id: "ESTADO_NACIMIENTO", nombre: "ESTADO_NACIMIENTO", visible: false, editable: true },
        { id: "NACIONALIDAD", nombre: "NACIONALIDAD", visible: false, editable: true },
        { id: "ESCUELA_PROCEDENCIA", nombre: "ESCUELA DE PROCEDENCIA", visible: false, editable: true },
        { id: "ESCOLARIDAD", nombre: "ESCOLARIDAD", visible: false, editable: true },
        { id: "ESTADO_ESCOLARIDAD", nombre: "ESTADO_ESCOLARIDAD", visible: false, editable: true },
        { id: "FECHA_EGRESO", nombre: "FECHA_EGRESO", visible: false, editable: true },
        { id: "FECHA_INGRESO", nombre: "FECHA_INGRESO", visible: false, editable: true },
        { id: "FECHA_CREACION", nombre: "FECHA_CREACION", visible: false, editable: true },
        { id: "FECHA_ACTUALIZACION", nombre: "FECHA_ACTUALIZACION", visible: false, editable: true },
        { id: "PROMEDIO_ESC_ANTERIOR", nombre: "PROMEDIO_ESC_ANTERIOR", visible: false, editable: true },
        { id: "PROMEDIO_EX_ADMISION", nombre: "PROMEDIO_EX_ADMISION", visible: false, editable: true },
        { id: "CERTIFICADO", nombre: "CERTIFICADO", visible: false, editable: true },
        { id: "SITUACION_CERTIFICADO", nombre: "SITUACION_CERTIFICADO", visible: false, editable: true },
        { id: "ALUMNO_ALTAINICIAL", nombre: "ALUMNO_ALTAINICIAL", visible: false, editable: true },
        { id: "ALUMNO_ALTAFINAL", nombre: "ALUMNO_ALTAFINAL", visible: false, editable: true },
        { id: "ALUMNO_ALTAPERIODO", nombre: "ALUMNO_ALTAPERIODO", visible: false, editable: true },
        { id: "FECHA_PROSPECCION", nombre: "FECHA_PROSPECCION", visible: false, editable: true },
        { id: "PROSPECCION_FINAL", nombre: "PROSPECCION_FINAL", visible: false, editable: true },
        { id: "PROSPECCION_INICIAL", nombre: "PROSPECCION_INICIAL", visible: false, editable: true },
        { id: "PROSPECCION_PERIODO", nombre: "PROSPECCION_PERIODO", visible: false, editable: true },
        { id: "EGRESO_INICIAL", nombre: "EGRESO_INICIAL", visible: false, editable: true },
        { id: "EGRESO_FINAL", nombre: "EGRESO_FINAL", visible: false, editable: true },
        { id: "EGRESO_PERIODO", nombre: "EGRESO_PERIODO", visible: false, editable: true },
        { id: "BECA", nombre: "BECA", visible: false, editable: true },
        { id: "CUENTA_BECA", nombre: "CUENTA_BECA", visible: false, editable: true },
        { id: "TARJETA_BECA", nombre: "TARJETA_BECA", visible: false, editable: true },
        { id: "PESO_KG", nombre: "PESO_KG", visible: false, editable: true },
        { id: "CONTACTO", nombre: "CONTACTO", visible: false, editable: true },
        { id: "PARENTESCO_CONTACTO", nombre: "PARENTESCO_CONTACTO", visible: false, editable: true },
        { id: "TEL_CONTACTO", nombre: "TEL_CONTACTO", visible: false, editable: true },
        { id: "LENGUAINDIGENA", nombre: "LENGUAINDIGENA", visible: false, editable: true },
        { id: "DISCAPACIDAD", nombre: "DISCAPACIDAD", visible: false, editable: true },
        { id: "ENFERNEDAD", nombre: "ENFERNEDAD", visible: false, editable: true },
        { id: "ALERGIAS", nombre: "ALERGIAS", visible: false, editable: true },
        { id: "NOMBREPADRE", nombre: "NOMBREPADRE", visible: false, editable: true },
        { id: "NOMBREMADRE", nombre: "NOMBREMADRE", visible: false, editable: true },
        { id: "PERSONASDEPENDENINGRESO", nombre: "PERSONASDEPENDENINGRESO", visible: false, editable: true },
        { id: "VIVENCASA", nombre: "VIVENCASA", visible: false, editable: true },
        { id: "HERMANOS", nombre: "HERMANOS", visible: false, editable: true },
        { id: "LUGARNACIMIENTO", nombre: "LUGARNACIMIENTO", visible: false, editable: true },
        { id: "HERMANOSESTUDIAN", nombre: "HERMANOSESTUDIAN", visible: false, editable: true },
        { id: "HORARIOTRABAJAS", nombre: "HORARIOTRABAJAS", visible: false, editable: true },
        { id: "ESCOLARIDADCONYUGE", nombre: "ESCOLARIDADCONYUGE", visible: false, editable: true },
        { id: "HIJOS0A5", nombre: "HIJOS0A5", visible: false, editable: true },
        { id: "HIJOS6A12", nombre: "HIJOS6A12", visible: false, editable: true },
        { id: "HIJOS13A18", nombre: "HIJOS13A18", visible: false, editable: true },
        { id: "HIJOSMAYORES", nombre: "HIJOSMAYORES", visible: false, editable: true },
        { id: "CARRERA_ORIGEN_MOV_ACAD", nombre: "CARRERA_ORIGEN_MOV_ACAD", visible: false, editable: true },
        { id: "FOLIO_CENEVAL", nombre: "FOLIO_CENEVAL", visible: false, editable: true },
        { id: "FOLIO_ACTA_EXEN_TSU", nombre: "FOLIO_ACTA_EXEN_TSU", visible: false, editable: true },
        { id: "LIBRO_ACTA_EXEN_TSU", nombre: "LIBRO_ACTA_EXEN_TSU", visible: false, editable: true },
        { id: "FOJAS_ACTA_EXEN_TSU", nombre: "FOJAS_ACTA_EXEN_TSU", visible: false, editable: true },
        { id: "FOLIO_CERTIFICADO_TSU", nombre: "FOLIO_CERTIFICADO_TSU", visible: false, editable: true },
        { id: "LIBRO_CERTIFICADO_TSU", nombre: "LIBRO_CERTIFICADO_TSU", visible: false, editable: true },
        { id: "FOJAS_CERTIFICADO_TSU", nombre: "FOJAS_CERTIFICADO_TSU", visible: false, editable: true },
        { id: "FOLIO_TITULACION_TSU", nombre: "FOLIO_TITULACION_TSU", visible: false, editable: true },
        { id: "LIBRO_TITULACION_TSU", nombre: "LIBRO_TITULACION_TSU", visible: false, editable: true },
        { id: "FOJA_TITULACION_TSU", nombre: "FOJA_TITULACION_TSU ", visible: false, editable: true },
        { id: "FOLIO_TITULACION", nombre: "FOLIO_TITULACION", visible: false, editable: true },
        { id: "FECHA_TRAMITE", nombre: "FECHA_TRAMITE", visible: false, editable: true },
        { id: "TITULACION_FOLIOPAGO", nombre: "TITULACION_FOLIOPAGO", visible: false, editable: true },
        { id: "EMPRESA_NR", nombre: "EMPRESA_NR", visible: false, editable: true },
        { id: "ASESOR_EMPRESARIAL", nombre: "ASESOR_EMPRESARIAL", visible: false, editable: true },
        { id: "ASESOR_EMPRESARIAL_INT", nombre: "ASESOR_EMPRESARIAL_INT", visible: false, editable: true },
        { id: "ESTADIA_INICIO", nombre: "ESTADIA_INICIO", visible: false, editable: true },
        { id: "ESTADIA_TERMINO", nombre: "ESTADIA_TERMINO", visible: false, editable: true },
        { id: "FOLIO_CSS", nombre: "FOLIO_CSS", visible: false, editable: true },
        { id: "LIBRO_CSS", nombre: "LIBRO_CSS", visible: false, editable: true },
        { id: "FOJAS_CSS", nombre: "FOJAS_CSS", visible: false, editable: true },
        { id: "PROYECTO_NOMBRE", nombre: "PROYECTO_NOMBRE", visible: false, editable: true },
        { id: "CAI_FECHA", nombre: "CAI_FECHA", visible: false, editable: true },
        { id: "ASESOR_ACADEMICO", nombre: "ASESOR_ACADEMICO", visible: false, editable: true },
        { id: "ASESOR_ACAD_EXT", nombre: "ASESOR_ACAD_EXT", visible: false, editable: true },
        { id: "PROYECTO_OBS", nombre: "PROYECTO_OBS", visible: false, editable: true },
        { id: "TRAMITE_COMPLETO", nombre: "TRAMITE_COMPLETO", visible: false, editable: true },
        { id: "FOLIO_CEX", nombre: "FOLIO_CEX", visible: false, editable: true },
        { id: "LIBRO_CEX", nombre: "LIBRO_CEX", visible: false, editable: true },
        { id: "FOJAS_CEX", nombre: "FOJAS_CEX", visible: false, editable: true },
        { id: "SOLICITUD_TITULACION_LIC", nombre: "SOLICITUD_TITULACION_LIC", visible: false, editable: true },
        { id: "FOLIO_TITULACION_LIC", nombre: "FOLIO_TITULACION_LIC", visible: false, editable: true },
        { id: "FECHA_TRAMITE_LIC", nombre: "FECHA_TRAMITE_LIC", visible: false, editable: true },
        { id: "FOLIO_PAGO_TIT_LIC", nombre: "FOLIO_PAGO_TIT_LIC", visible: false, editable: true },
        { id: "NUM_CEDULA_TSU", nombre: "NUM_CEDULA_TSU", visible: false, editable: true },
        { id: "EMPRESA_ESTADIA_LIC", nombre: "EMPRESA_ESTADIA_LIC", visible: false, editable: true },
        { id: "ASESOR_EMPRESARIAL_LIC", nombre: "ASESOR_EMPRESARIAL_LIC", visible: false, editable: true },
        { id: "FECHA_INICIO_EST_LIC", nombre: "FECHA_INICIO_EST_LIC", visible: false, editable: true },
        { id: "FECHA_FIN_EST_LIC", nombre: "FECHA_FIN_EST_LIC", visible: false, editable: true },
        { id: "FECHA_LIBERACION_EST_LIC", nombre: "FECHA_LIBERACION_EST_LIC", visible: false, editable: true },
        { id: "PROYECTO_EST_LIC", nombre: "PROYECTO_EST_LIC", visible: false, editable: true },
        { id: "FECHA_AUTORIZACION_LIC", nombre: "FECHA_AUTORIZACION_LIC", visible: false, editable: true },
        { id: "ASESOR_ACAD_LIC", nombre: "ASESOR_ACAD_LIC", visible: false, editable: true },
        { id: "OBS_PROYECTO_LIC", nombre: "OBS_PROYECTO_LIC", visible: false, editable: true },
        { id: "FECHA_INGRESO_LIC", nombre: "FECHA_INGRESO_LIC", visible: false, editable: true },
        { id: "FECHA_EGRESO_LIC", nombre: "FECHA_EGRESO_LIC", visible: false, editable: true },
        { id: "INICIO_BACH", nombre: "INICIO_BACH", visible: false, editable: true },
        { id: "FIN_BACH", nombre: "FIN_BACH", visible: false, editable: true },
        { id: "FOLIO_CERLIC", nombre: "FOLIO_CERLIC", visible: false, editable: true },
        { id: "LIBRO_CERLIC", nombre: "LIBRO_CERLIC", visible: false, editable: true },
        { id: "FOJA_CERLIC", nombre: "FOJA_CERLIC", visible: false, editable: true },
        { id: "FOLIO_CSSLIC", nombre: "FOLIO_CSSLIC", visible: false, editable: true },
        { id: "LIBRO_CSSLIC", nombre: "LIBRO_CSSLIC", visible: false, editable: true },
        { id: "FOJA_CSSLIC", nombre: "FOJA_CSSLIC", visible: false, editable: true },
        { id: "FOLIO_TITLIC", nombre: "FOLIO_TITLIC", visible: false, editable: true },
        { id: "LIBRO_TITLIC", nombre: "LIBRO TITLIC", visible: false, editable: true },
        { id: "FOJA_TITLIC", nombre: "FOJA_TITLIC", visible: false, editable: true },
        { id: "ALUMNO_PASSWORD", nombre: "ALUMNO_PASSWORD", visible: false, editable: true },
        { id: "NUM_CEDULA_LIC", nombre: "NUM_CEDULA_LIC", visible: false, editable: true },
        { id: "ESTADOCIVIL", nombre: "ESTADOCIVIL", visible: false, editable: true },
    ],

    initColumnVisibility: function () {
        try {
            const savedSelection = JSON.parse(localStorage.getItem('columnSelection'));
            this.columnasVisibles = savedSelection || {};
        } catch (error) {
            console.error("Error al cargar selección de columnas:", error);
        }
    },

    saveColumnVisibility: function () {
        try {
            localStorage.setItem('columnSelection', JSON.stringify(this.columnasVisibles));
            location.reload();
        } catch (error) {
            console.error("Error al guardar selección de columnas:", error);
        }
    }
};

const ColumnManager = {
    init: function () {
        this.renderColumnToggles();
        this.renderTableHeaders();
    },

    renderColumnToggles: function () {
        UI.elements.columnToggles.innerHTML = '';
        AppState.columnas.forEach(columna => {
            const toggleContainer = document.createElement('div');
            toggleContainer.className = 'form-check form-check-inline';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'form-check-input';
            checkbox.id = `toggle-${columna.id}`;
            checkbox.checked = AppState.columnasVisibles[columna.id];
            checkbox.addEventListener('change', () => {
                AppState.columnasVisibles[columna.id] = checkbox.checked;
                ColumnManager.renderTableHeaders();
                AlumnoManager.updateTableVisibility();
            });

            const label = document.createElement('label');
            label.className = 'form-check-label';
            label.htmlFor = `toggle-${columna.id}`;
            label.textContent = columna.nombre;

            toggleContainer.appendChild(checkbox);
            toggleContainer.appendChild(label);
            UI.elements.columnToggles.appendChild(toggleContainer);
        });
    },

    renderTableHeaders: function () {
        const headers = AppState.columnas
            .filter(col => AppState.columnasVisibles[col.id])
            .map(col => `<th>${col.nombre}</th>`)
            .join('');
        UI.elements.tableHeader.innerHTML = `<tr>${headers}</tr>`;
    }
};

const AlumnoManager = {
    fetchAlumnos: async function () {
        UI.showLoading(true);
        try {
            const response = await fetch('/api/alumnos');
            const data = await response.json();
            this.renderAlumnos(data.alumnos);
        } catch (error) {
            console.error("Error al obtener alumnos:", error);
        } finally {
            UI.showLoading(false);
        }
    },

    renderAlumnos: function (alumnos) {
        UI.elements.tableBody.innerHTML = '';
        alumnos.forEach(alumno => {
            const row = document.createElement('tr');
            AppState.columnas.forEach(columna => {
                const td = document.createElement('td');
                td.dataset.columna = columna.id;
                td.textContent = alumno[columna.id] || '';
                td.style.display = AppState.columnasVisibles[columna.id] ? '' : 'none';

                if (columna.editable) {
                    td.contentEditable = "true";
                    td.style.backgroundColor = "#f8f9fa";
                } else {
                    td.contentEditable = "false";
                    td.style.backgroundColor = "#ddd";
                }
                row.appendChild(td);
            });
            UI.elements.tableBody.appendChild(row);
        });
    },

    updateTableVisibility: function () {
        document.querySelectorAll('td[data-columna]').forEach(td => {
            const colId = td.dataset.columna;
            td.style.display = AppState.columnasVisibles[colId] ? '' : 'none';
        });
    }
};

function initApp() {
    UI.initialize();
    AppState.initColumnVisibility();
    ColumnManager.init();
    if (UI.elements.saveSelectedBtn) {
        UI.elements.saveSelectedBtn.addEventListener('click', AppState.saveColumnVisibility);
    }
    AlumnoManager.fetchAlumnos();
}

document.addEventListener('DOMContentLoaded', initApp);
