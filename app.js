// Obtén referencias a elementos del DOM
const form = document.getElementById('form-gasto');
const descripcionInput = document.getElementById('descripcion');
const cantidadInput = document.getElementById('cantidad');
const categoriaInput = document.getElementById('categoria');
const listaGastos = document.getElementById('lista-gastos');
const totalSpan = document.getElementById('total');
const ctx = document.getElementById('graficoCategorias');

let gastos = [];
let grafico;

// Cuando se envía el formulario:
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

    // Guarda en Firestore
    db.collection("gastos").add(gasto)
      .then(() => {
        console.log("✅ Gasto guardado en Firebase");
        cargarGastos();  // volver a cargar la lista y gráfica
      })
      .catch((error) => {
        console.error("❌ Error al guardar en Firebase: ", error);
      });

    // Limpia los inputs
    descripcionInput.value = '';
    cantidadInput.value = '';
    categoriaInput.value = '';
  }
});

// Función para cargar todos los gastos desde Firestore
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
    })
    .catch((error) => {
      console.error("❌ Error al leer gastos de Firebase: ", error);
    });
}

// Función para actualizar la lista visible en pantalla
function actualizarLista() {
  listaGastos.innerHTML = '';
  gastos.forEach((gasto) => {
    const li = document.createElement('li');
    li.textContent = `${gasto.categoria} – ${gasto.descripcion}: $${gasto.cantidad.toFixed(2)}`;
    listaGastos.appendChild(li);
  });
}

// Función para actualizar el total
function actualizarTotal() {
  const total = gastos.reduce((sum, gasto) => sum + gasto.cantidad, 0);
  totalSpan.textContent = total.toFixed(2);
}

// Función para actualizar el gráfico con Chart.js
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

// Carga inicial de datos al abrir la página
cargarGastos();
