function descargarTablaExcel() {
    try {
        if (typeof XLSX === 'undefined') {
            throw new Error("La librería XLSX no está cargada correctamente");
        }

        // Obtener las columnas visibles
        const columnasSeleccionadas = AppState.columnas.filter(col => AppState.columnasVisibles[col.id]);

        if (columnasSeleccionadas.length === 0) {
            alert("Debe seleccionar al menos una columna para exportar.");
            return;
        }

        // Obtener datos de la tabla
        const rows = Array.from(document.querySelectorAll("#table-body tr"));
        if (rows.length === 0) {
            throw new Error("No se encontraron datos para exportar");
        }

        const data = rows.map(row => {
            return columnasSeleccionadas.map(col => {
                const cell = row.querySelector(`td[data-columna="${col.id}"]`);
                if (!cell) return "";

                const input = cell.querySelector("input");
                return input ? input.value.trim() : cell.textContent.trim();
            });
        });

        // Crear libro Excel
        const wb = XLSX.utils.book_new();
        const wsData = [
            columnasSeleccionadas.map(col => col.nombre),
            ...data
        ];

        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Ajustar anchos de columna
        ws['!cols'] = columnasSeleccionadas.map(() => ({ wch: 20 }));

        XLSX.utils.book_append_sheet(wb, ws, "Datos");

        // Generar archivo
        const wbout = XLSX.write(wb, { 
            bookType: "xlsx", 
            type: "array",
            cellStyles: true 
        });

        // Descargar archivo
        const blob = new Blob([wbout], { type: "application/octet-stream" });
        const fileName = `Datos_${new Date().toISOString().slice(0, 10)}.xlsx`;

        if (typeof saveAs !== 'undefined') {
            saveAs(blob, fileName);
            alert(`Archivo ${fileName} generado correctamente`);
        } else {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(link.href), 100);
        }
    } catch (error) {
        console.error("Error en descargarTablaExcel:", error);
        alert(`Error al generar el Excel: ${error.message}`);
    }
}
