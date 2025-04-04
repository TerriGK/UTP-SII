"use strict";

const table = document.getElementById("table-container");
const inputSearch = document.getElementById("buscar");
const load = document.getElementById("load");

let limit = 1000;
let skip = 0;
let search = "";
let orderBy = "inicial";
let sort = "desc";
let gruposLength = 0;

const IDAuth = window.IDAuth || ""; 

inputSearch.addEventListener("input", debounce(() => {
  search = inputSearch.value;
  skip = 0;
  getGrupos(IDAuth);
}));

const getGrupos = async (IDAuth) => {
  table.innerHTML = "";
  load.style.display = "block";

  const url = `/api/gruposCalifi?limit=${limit}&skip=${skip}&orderBy=${orderBy}&sort=${sort}&IDAuth=${IDAuth}`;
  const res = await fetch(url);
  const { grupos } = await res.json();

  load.style.display = "none";

  let content = "";
  grupos
    .filter(item => item.CLAVEPROFESOR_TITULAR)
    .forEach((item, i) => {
      content += `<tr onclick="window.location.href=window.location.href+'/${item.CODIGO_GRUPO}'">`;
      content += `<td>${i + 1}</td>`;
      content += `<td>${item.CODIGO_CARRERA}</td>`;
      content += `<td>${item.INICIAL}</td>`;
      content += `<td>${item.FINAL}</td>`;
      content += `<td>${item.CODIGO_GRUPO}</td>`;
      content += `<td>${item.GRADO}</td>`;
      content += `<td>${item.GRUPO}</td>`;
      content += `<td>${item.INSCRITOS} de ${item.CUPO_MAXIMO}</td>`;
      content += `<td>${item.CLAVEPROFESOR_TITULAR}</td>`;
      content += "</tr>";
    });

  table.innerHTML = content;
  gruposLength = grupos.length;
};

const handleOrder = (by) => {
  orderBy = by;
  getGrupos(IDAuth);
};

const handleSort = (by) => {
  sort = by;
  getGrupos(IDAuth);
};

const prev = () => {
  if (skip >= limit) {
    skip -= limit;
    getGrupos(IDAuth);
  }
};

const next = () => {
  if (!(gruposLength < limit)) {
    skip += limit;
    getGrupos(IDAuth);
  }
};

getGrupos(IDAuth);
