const form = document.getElementById('form-gasto');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const descripcionInput = document.getElementById('descripcion');
const cantidadInput = document.getElementById('cantidad');
const categoriaInput = document.getElementById('categoria');
const listaGastos = document.getElementById('lista-gastos');
const totalSpan = document.getElementById('total');
const ctx = document.getElementById('graficoCategorias');
let gastos = [];
let grafico;

loginBtn.onclick = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider);
};

logoutBtn.onclick = () => {
  firebase.auth().signOut();
};

firebase.auth().onAuthStateChanged(user => {
  if (user) {
    console.log("✅ Sesión iniciada:", user.displayName);
    form.style.display = 'block';
    logoutBtn.style.display = 'inline-block';
    loginBtn.style.display = 'none';
    cargarGastos(user.uid);
  } else {
    form.style.display = 'none';
    logoutBtn.style.display = 'none';
    loginBtn.style.display = 'inline-block';
  }
});

form.addEventListener('submit', function (e) {
  e.preventDefault();
  const descripcion = descripcionInput.value.trim();
  const cantidad = parseFloat(cantidadInput.value);
  const categoria = categoriaInput.value;
  const user = firebase.auth().currentUser;

  if (user && descripcion && !isNaN(cantidad) && categoria) {
    const gasto = {
      descripcion,
      cantidad,
      categoria,
      fecha: new Date(),
      uid: user.uid
    };

    db.collection("gastos").add(gasto)
      .then(() => {
        cargarGastos(user.uid);
        descripcionInput.value = '';
        cantidadInput.value = '';
        categoriaInput.value = '';
      })
      .catch(error => console.error("❌ Error al guardar:", error));
  }
});

function cargarGastos(uid) {
  db.collection("gastos").where("uid", "==", uid).orderBy("fecha", "desc").get()
    .then(snapshot => {
      gastos = [];
      snapshot.forEach(doc => gastos.push(doc.data()));
      actualizarLista();
      actualizarTotal();
      actualizarGrafico();
    });
}

function actualizarLista() {
  listaGastos.innerHTML = '';
  gastos.forEach(gasto => {
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

  const context = ctx.getContext('2d');
  if (grafico) grafico.destroy();
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
      plugins: { legend: { position: 'bottom' } }
    }
  });
}
