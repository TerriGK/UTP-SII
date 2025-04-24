const STORAGE_KEY = 'hiddenCycles';
const $ = id => document.getElementById(id);
const elements = {
  activeList: $('activeCyclesList'),
  hiddenList: $('hiddenCyclesList'),
  notification: $('notification'),
};

const state = {
  cycles: [],
  selected: new Set(),
  hidden: new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')),
};

const saveHiddenToStorage = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(state.hidden)));
};

const notify = (msg, type = 'success', time = 3000) => {
  const el = elements.notification;
  el.textContent = msg;
  el.className = `notification ${type} show`;
  setTimeout(() => el.classList.remove('show'), time);
};

const fetchCycles = async () => {
  try {
    elements.activeList.innerHTML = `<div class="loading"><i class="fas fa-spinner fa-spin"></i> Cargando ciclos...</div>`;
    const res = await fetch('/api/cuatris-navbar');
    if (!res.ok) throw new Error('Error al cargar ciclos');
    const data = await res.json();
    state.cycles = data.ciclos || [];
    renderAll();
    notify('Ciclos cargados correctamente');
  } catch (e) {
    elements.activeList.innerHTML = `<div class="loading"><i class="fas fa-exclamation-triangle"></i> ${e.message}</div>`;
    notify(e.message, 'error');
  }
};

const renderAll = () => {
  renderCycles(elements.activeList, cycle => !state.hidden.has(cycle.CODIGO_CORTO), true);
  renderCycles(elements.hiddenList, cycle => state.hidden.has(cycle.CODIGO_CORTO), false);
};

const renderCycles = (container, filterFn, isActive) => {
  container.innerHTML = '';
  const filtered = state.cycles.filter(filterFn);
  if (!filtered.length) {
    container.innerHTML = `<div class="no-cycles">${isActive ? 'No hay ciclos disponibles' : 'No hay ciclos ocultos'}</div>`;
    return;
  }
  filtered.forEach(cycle => renderItem(cycle, container, isActive));
};

const renderItem = (cycle, container, isActive) => {
  const li = document.createElement('li');
  li.className = `cycle-item ${state.selected.has(cycle.CODIGO_CORTO) ? 'selected' : ''}`;
  li.dataset.id = cycle.CODIGO_CORTO;
  li.innerHTML = `
    <div class="cycle-info">
      <span class="cycle-name">${cycle.DESCRIPCION}</span>
      <span class="cycle-code">${cycle.CODIGO_CORTO}</span>
    </div>
    <button class="btn btn-info">
      <i class="fas fa-${isActive ? 'eye-slash' : 'eye'}"></i>
      ${isActive ? 'Ocultar' : 'Mostrar'}
    </button>
  `;
  li.querySelector('button').onclick = () => {
    isActive ? hideCycle(cycle) : showCycle(cycle);
  };
  container.appendChild(li);
};

const hideCycle = (cycle) => {
  state.hidden.add(cycle.CODIGO_CORTO);
  saveHiddenToStorage();
  renderAll();
  notify(`${cycle.DESCRIPCION} oculto`);
};

const showCycle = (cycle) => {
  state.hidden.delete(cycle.CODIGO_CORTO);
  saveHiddenToStorage();
  renderAll();
  notify(`${cycle.DESCRIPCION} mostrado`);
};

fetchCycles();