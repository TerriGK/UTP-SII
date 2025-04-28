'use strict';

const table      = document.getElementById('table-container');
const inputSearch= document.getElementById('buscar');

let limit        = 300;
let skip         = 0;
let search       = '';
let orderBy      = 'inicial';
let sort         = 'desc';
let gruposLength = 0;

inputSearch.addEventListener('input', debounce(() => {
  search = inputSearch.value;
  skip   = 0;   
  getGrupos();
}, 500));

// 📌 Llamada a la API
const getGrupos = async () => {
  table.innerHTML = '';

  const url = `/api/gruposCalifi`
            + `?limit=${limit}`
            + `&skip=${skip}`
            + `&orderBy=${orderBy}`
            + `&sort=${sort}`
            + `&search=${encodeURIComponent(search)}`;

  try {
    const res    = await fetch(url);
    const { grupos } = await res.json();

    let content = '';
    grupos
      .filter(item => item.CLAVEPROFESOR_TITULAR)   
      .forEach((item, i) => {
        content += `
          <tr onclick="window.location.href='${window.location.pathname}/${item.CODIGO_GRUPO}'">
            <td>${i + 1}</td>
            <td>${item.CODIGO_CARRERA}</td>
            <td>${item.INICIAL}</td>
            <td>${item.FINAL}</td>
            <td>${item.CODIGO_GRUPO}</td>
            <td>${item.GRADO}</td>
            <td>${item.GRUPO}</td>
            <td>${item.INSCRITOS} de ${item.CUPO_MAXIMO}</td>
            <td>${item.CLAVEPROFESOR_TITULAR}</td>
          </tr>`;
      });

    table.innerHTML = content;
    gruposLength    = grupos.length;

  } catch (error) {
    console.error('Error al cargar grupos:', error);
    table.innerHTML = `
      <tr>
        <td colspan="9" style="text-align:center; color:red;">
          Error al cargar los datos.
        </td>
      </tr>`;
  }
};

const handleOrder = by => { orderBy = by; getGrupos(); };
const handleSort  = by => { sort    = by; getGrupos(); };

const prev = () => {
  if (skip >= limit) {
    skip -= limit;
    getGrupos();
  }
};

const next = () => {
  if (gruposLength >= limit) {
    skip += limit;
    getGrupos();
  }
};

// Primera carga
getGrupos();
