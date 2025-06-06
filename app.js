const form = document.getElementById('form-gasto');
const descripcionInput = document.getElementById('descripcion');
const cantidadInput = document.getElementById('cantidad');
const categoriaInput = document.getElementById('categoria');
const listaGastos = document.getElementById('lista-gastos');
const totalSpan = document.getElementById('total');

let gastos = [];

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const descripcion = descripcionInput.value.trim();
  const cantidad = parseFloat(cantidadInput.value);
  const categoria = categoriaInput.value;

  if (descripcion && !isNaN(cantidad) && categoria) {
    const gasto = { descripcion, cantidad, categoria };
    gastos.push(gasto);
    actualizarLista();
    actualizarTotal();
    guardarGastos();

    descripcionInput.value = '';
    cantidadInput.value = '';
    categoriaInput.value = '';
  }
});

function actualizarLista() {
  listaGastos.innerHTML = '';
  gastos.forEach((gasto, index) => {
    const li = document.createElement('li');
    li.textContent = `${gasto.categoria} – ${gasto.descripcion}: $${gasto.cantidad.toFixed(2)}`;

    const btnEliminar = document.createElement('button');
    btnEliminar.textContent = '❌';
    btnEliminar.onclick = () => eliminarGasto(index);
    li.appendChild(btnEliminar);

    listaGastos.appendChild(li);
  });
  guardarGastos();
  actualizarGrafico();
}

function actualizarTotal() {
  const total = gastos.reduce((sum, gasto) => sum + gasto.cantidad, 0);
  totalSpan.textContent = total.toFixed(2);
}

function eliminarGasto(index) {
  gastos.splice(index, 1);
  actualizarLista();
  actualizarTotal();
  guardarGastos();
}

function guardarGastos() {
  localStorage.setItem('gastos', JSON.stringify(gastos));
}

function cargarGastos() {
  const data = localStorage.getItem('gastos');
  if (data) {
    gastos = JSON.parse(data);
    actualizarLista();
    actualizarTotal();
    actualizarGrafico();
  }
}

let grafico;

function actualizarGrafico() {
  const categorias = {};
  gastos.forEach(gasto => {
    if (!categorias[gasto.categoria]) {
      categorias[gasto.categoria] = 0;
    }
    categorias[gasto.categoria] += gasto.cantidad;
  });

  const ctx = document.getElementById('graficoCategorias');
  if (!ctx) return;
  const context = ctx.getContext('2d');

  if (grafico) {
    grafico.destroy();
  }

  grafico = new Chart(context, {
    type: 'pie',
    data: {
      labels: Object.keys(categorias),
      datasets: [{
        label: 'Gastos por Categoría',
        data: Object.values(categorias),
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

cargarGastos();
