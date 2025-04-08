function descargarTablaExcel() {
  try {
    // Obtener datos del encabezado
    const cardTitle = document.querySelector(".card-title")?.textContent.trim() || "Calificaciones";
    const profesor = document.querySelector(".professor-details p:first-child")?.textContent.trim() || "Profesor no identificado";
    const asignatura = document.querySelector("#asig")?.textContent.trim() || "Asignatura no especificada";
    const grupo = document.querySelector("#grupo")?.textContent.trim() || "Grupo no especificado";
    const evaluacion = document.querySelector("#idPlan option:checked")?.textContent.trim() || "Evaluación no especificada";

    // Obtener datos de la tabla
    const rows = Array.from(document.querySelectorAll("#table-content tr"));
    const data = rows.map((row, index) => {
      const cells = row.querySelectorAll("td");
      if (cells.length >= 3) {
        return [
          index + 1,
          cells[1]?.textContent.trim() || "",
          cells[2]?.textContent.trim() || "",
          row.querySelector("input")?.value.trim() || cells[3]?.textContent.trim() || ""
        ];
      }
      return null;
    }).filter(Boolean);

    if (data.length === 0) {
      throw new Error("No hay datos de calificaciones para exportar");
    }

    // Crear libro de Excel
    const wb = XLSX.utils.book_new();

    // Configurar datos con formato mejorado
    const wsData = [
      [cardTitle],
      [profesor],
      [`${asignatura} - ${grupo}`],
      [`Evaluación: ${evaluacion}`],
      [`Fecha de exportación: ${new Date().toLocaleDateString()}`],
      [],
      [],
      [],
      [],
      ["#", "Nombre del Estudiante", "Matrícula", "Calificación"],
      ...data
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Aplicar estilos y formatos
    ws["!cols"] = [
      { wch: 5 },  // Número
      { wch: 35 }, // Nombre
      { wch: 15 }, // Matrícula
      { wch: 12 }  // Calificación
    ];

    // Añadir bordes a los datos
    const range = XLSX.utils.decode_range(ws["!ref"]);
    for (let R = 6; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = { c: C, r: R };
        const cell_ref = XLSX.utils.encode_cell(cell_address);
        if (!ws[cell_ref]) continue;

        ws[cell_ref].s = {
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        };

        // Encabezados en negrita
        if (R === 6) {
          ws[cell_ref].s.font = { bold: true };
          ws[cell_ref].s.fill = { fgColor: { rgb: "F2F2F2" } };
        }
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, "Calificaciones");

    // Generar nombre de archivo seguro
    const cleanText = (str) => str.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s-]/g, "").replace(/\s+/g, "_");
    const fileName = `Calificaciones_${cleanText(asignatura)}_${cleanText(grupo)}_${new Date().toISOString().slice(0, 10)}.xlsx`;

    // Exportar archivo
    XLSX.writeFile(wb, fileName);

    // Notificación discreta (opcional)
    const toast = document.createElement("div");
    toast.textContent = `Archivo "${fileName}" generado correctamente`;
    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    toast.style.backgroundColor = "#28a745";
    toast.style.color = "white";
    toast.style.padding = "10px 20px";
    toast.style.borderRadius = "4px";
    toast.style.zIndex = "1000";
    toast.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);

  } catch (error) {
    console.error("Error al exportar a Excel:", error);

    // Mostrar error sin usar alert()
    const errorMsg = document.createElement("div");
    errorMsg.textContent = `Error: ${error.message}`;
    errorMsg.style.position = "fixed";
    errorMsg.style.bottom = "20px";
    errorMsg.style.left = "50%";
    errorMsg.style.transform = "translateX(-50%)";
    errorMsg.style.backgroundColor = "#dc3545";
    errorMsg.style.color = "white";
    errorMsg.style.padding = "10px 20px";
    errorMsg.style.borderRadius = "4px";
    errorMsg.style.zIndex = "1000";
    document.body.appendChild(errorMsg);

    setTimeout(() => errorMsg.remove(), 5000);
  }
}