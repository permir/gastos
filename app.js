const form = document.getElementById('form-gasto');
const descripcionInput = document.getElementById('descripcion');
const cantidadInput = document.getElementById('cantidad');
const categoriaInput = document.getElementById('categoria');
const listaGastos = document.getElementById('lista-gastos');
const totalSpan = document.getElementById('total');
const ctx = document.getElementById('graficoCategorias');

let gastos = [];
let grafico;

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const descripcion = descripcionInput.value.trim();
  const cantidad = parseFloat(cantidadInput.value);
  const categoria = categoriaInput.value;

  if (descripcion && !isNaN(cantidad) && categoria) {
    const gasto = {
      descripcion,
      cantidad,
      categoria,
      fecha: new Date()
    };

    db.collection("gastos").add(gasto)
      .then(() => {
        console.log("✅ Gasto guardado en Firebase");
        cargarGastos();  // recargar lista
      })
      .catch((error) => {
        console.error("❌ Error al guardar en Firebase: ", error);
      });

    descripcionInput.value = '';
    cantidadInput.value = '';
    categoriaInput.value = '';
  }
});

function cargarGastos() {
  db.collection("gastos").orderBy("fecha", "desc").get()
    .then((querySnapshot) => {
      gastos = [];
      querySnapshot.forEach((doc) => {
        gastos.push(doc.data());
      });
      actualizarLista();
      actualizarTotal();
      actualizarGrafico();
    });
}

function actualizarLista() {
  listaGastos.innerHTML = '';
  gastos.forEach((gasto) => {
    const li = document.createElement('li');
    li.textContent = `${gasto.categoria} – ${gasto.descripcion}: $${gasto.cantidad.toFixed(2)}`;
    listaGastos.appendChild(li);
  });
}

function actualizarTotal() {
  const total = gastos.reduce((sum, gasto) => sum + gasto.cantidad, 0);
  totalSpan.textContent = total.toFixed(2);
}

function actualizarGrafico() {
  const categorias = {};
  gastos.forEach(gasto => {
    if (!categorias[gasto.categoria]) {
      categorias[gasto.categoria] = 0;
    }
    categorias[gasto.categoria] += gasto.cantidad;
  });

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
