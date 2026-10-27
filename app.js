// =============================================================
// Registro de Carreras · app.js
// JavaScript puro: DOM, eventos, validación y localStorage
// =============================================================

// ---------- 1. Selección de elementos del DOM ----------
const form = document.querySelector("#formCarrera");
const inputNombre = document.querySelector("#nombre");
const selectCategoria = document.querySelector("#categoria");
const inputFecha = document.querySelector("#fecha");
const inputGanador = document.querySelector("#ganador");
const inputCalificacion = document.querySelector("#calificacion");
const mensaje = document.querySelector("#mensaje");

const lista = document.querySelector("#lista");
const textoVacio = document.querySelector("#vacio");
const inputBuscar = document.querySelector("#buscar");
const selectFiltro = document.querySelector("#filtroCategoria");
const botonBorrarTodo = document.querySelector("#borrarTodo");

const spanTotal = document.querySelector("#totalCarreras");
const spanPromedio = document.querySelector("#promedio");
const spanMejor = document.querySelector("#mejorCarrera");

// Clave con la que se guardan los datos en localStorage
const CLAVE = "registroCarreras";

// ---------- 2. Datos: arreglo de objetos ----------
// Si es la primera visita, getItem devuelve null y se usa un arreglo vacío
const guardadas = localStorage.getItem(CLAVE);
let carreras = guardadas ? JSON.parse(guardadas) : [];

// ---------- 3. Funciones ----------

// Guarda el arreglo en localStorage como texto JSON
function guardar() {
  localStorage.setItem(CLAVE, JSON.stringify(carreras));
}

// Muestra (o borra) el mensaje de error debajo de un campo
function mostrarError(idError, texto) {
  const elemento = document.querySelector(`#${idError}`);
  elemento.textContent = texto;
}

// Quita todos los mensajes de error y los bordes rojos
function limpiarErrores() {
  document.querySelectorAll(".error").forEach((e) => (e.textContent = ""));
  document.querySelectorAll(".invalido").forEach((e) => e.classList.remove("invalido"));
}

// Valida los campos. Devuelve true si todo está correcto.
function validar(datos) {
  let valido = true;
  limpiarErrores();

  // Nombre: obligatorio, entre 3 y 60 caracteres
  if (datos.nombre === "") {
    mostrarError("errorNombre", "Escriba el nombre de la carrera.");
    inputNombre.classList.add("invalido");
    valido = false;
  } else if (datos.nombre.length < 3 || datos.nombre.length > 60) {
    mostrarError("errorNombre", "El nombre debe tener entre 3 y 60 caracteres.");
    inputNombre.classList.add("invalido");
    valido = false;
  }

  // Categoría: debe elegir una opción
  if (datos.categoria === "") {
    mostrarError("errorCategoria", "Seleccione una categoría.");
    selectCategoria.classList.add("invalido");
    valido = false;
  }

  // Fecha: obligatoria y no puede ser futura (solo carreras ya vistas)
  const hoy = fechaDeHoy();
  if (datos.fecha === "") {
    mostrarError("errorFecha", "Seleccione la fecha de la carrera.");
    inputFecha.classList.add("invalido");
    valido = false;
  } else if (datos.fecha > hoy) {
    mostrarError("errorFecha", "La fecha no puede ser futura.");
    inputFecha.classList.add("invalido");
    valido = false;
  }

  // Ganador: obligatorio, mínimo 2 caracteres
  if (datos.ganador.length < 2) {
    mostrarError("errorGanador", "Escriba el nombre del ganador.");
    inputGanador.classList.add("invalido");
    valido = false;
  }

  // Calificación: número entero entre 1 y 10
  if (!Number.isInteger(datos.calificacion) || datos.calificacion < 1 || datos.calificacion > 10) {
    mostrarError("errorCalificacion", "Ingrese un número entero del 1 al 10.");
    inputCalificacion.classList.add("invalido");
    valido = false;
  }

  return valido;
}

// Devuelve la fecha local de hoy en formato "AAAA-MM-DD"
function fechaDeHoy() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

// Convierte "2026-10-11" en "11/10/2026"
function formatearFecha(fechaISO) {
  const [anio, mes, dia] = fechaISO.split("-");
  return `${dia}/${mes}/${anio}`;
}

// Crea el <li> de una carrera con createElement (sin innerHTML)
function crearElemento(carrera) {
  const li = document.createElement("li");
  li.classList.add("registro");

  const etiqueta = document.createElement("span");
  etiqueta.classList.add("etiqueta", `etiqueta-${carrera.categoria.toLowerCase()}`);
  etiqueta.textContent = carrera.categoria;

  const info = document.createElement("div");
  info.classList.add("info");

  const titulo = document.createElement("strong");
  titulo.textContent = carrera.nombre;

  const detalle = document.createElement("small");
  detalle.textContent = `${formatearFecha(carrera.fecha)} · Ganador: ${carrera.ganador}`;

  info.append(titulo, detalle);

  const nota = document.createElement("span");
  nota.classList.add("nota");
  nota.textContent = `${carrera.calificacion}/10`;

  // Botón eliminar: guarda el id de la carrera en un atributo data-
  const botonEliminar = document.createElement("button");
  botonEliminar.type = "button";
  botonEliminar.classList.add("eliminar");
  botonEliminar.textContent = "Eliminar";
  botonEliminar.dataset.id = carrera.id;

  li.append(etiqueta, info, nota, botonEliminar);
  return li;
}

// Devuelve las carreras que coinciden con la búsqueda y el filtro (filter)
function obtenerFiltradas() {
  const texto = inputBuscar.value.trim().toLowerCase();
  const categoria = selectFiltro.value;

  return carreras.filter((c) => {
    const coincideTexto =
      c.nombre.toLowerCase().includes(texto) || c.ganador.toLowerCase().includes(texto);
    const coincideCategoria = categoria === "Todas" || c.categoria === categoria;
    return coincideTexto && coincideCategoria;
  });
}

// Calcula y muestra el total, el promedio (map + reduce) y la mejor carrera
function actualizarResumen() {
  spanTotal.textContent = carreras.length;

  if (carreras.length === 0) {
    spanPromedio.textContent = "–";
    spanMejor.textContent = "–";
    return;
  }

  const notas = carreras.map((c) => c.calificacion);
  const suma = notas.reduce((total, n) => total + n, 0);
  spanPromedio.textContent = (suma / notas.length).toFixed(1);

  const mejor = carreras.reduce((max, c) => (c.calificacion > max.calificacion ? c : max));
  spanMejor.textContent = mejor.nombre;
}

// Vuelve a pintar la lista completa (forEach)
function pintar() {
  lista.textContent = ""; // limpia la lista sin usar innerHTML

  const filtradas = obtenerFiltradas();

  filtradas.forEach((carrera) => {
    lista.appendChild(crearElemento(carrera));
  });

  // Mensaje cuando no hay nada que mostrar
  if (carreras.length === 0) {
    textoVacio.textContent = "Todavía no hay carreras registradas.";
    textoVacio.hidden = false;
  } else if (filtradas.length === 0) {
    textoVacio.textContent = "Ninguna carrera coincide con la búsqueda.";
    textoVacio.hidden = false;
  } else {
    textoVacio.hidden = true;
  }

  botonBorrarTodo.hidden = carreras.length === 0;
  actualizarResumen();
}

// Muestra un mensaje de confirmación por unos segundos
function avisar(texto) {
  mensaje.textContent = texto;
  mensaje.hidden = false;
  setTimeout(() => {
    mensaje.hidden = true;
  }, 3000);
}

// ---------- 4. Eventos ----------

// Evento 1 · submit: valida, crea el objeto, guarda y pinta
form.addEventListener("submit", (e) => {
  e.preventDefault(); // evita que la página se recargue

  const datos = {
    nombre: inputNombre.value.trim(),
    categoria: selectCategoria.value,
    fecha: inputFecha.value,
    ganador: inputGanador.value.trim(),
    calificacion: Number(inputCalificacion.value),
  };

  if (!validar(datos)) {
    return; // si hay errores, no se guarda nada
  }

  // Cada registro es un objeto con un id único
  const nuevaCarrera = { id: Date.now(), ...datos };
  carreras.push(nuevaCarrera);

  guardar();
  pintar();
  form.reset();
  inputNombre.focus();
  avisar(`✔ Se guardó "${nuevaCarrera.nombre}".`);
});

// Evento 2 · click en la lista: elimina la carrera (delegación de eventos)
lista.addEventListener("click", (e) => {
  if (!e.target.classList.contains("eliminar")) {
    return;
  }
  const id = Number(e.target.dataset.id);
  carreras = carreras.filter((c) => c.id !== id); // deja todas menos la eliminada
  guardar();
  pintar();
});

// Evento 3 · input: búsqueda en vivo mientras se escribe
inputBuscar.addEventListener("input", pintar);

// Evento 4 · change: filtrar por categoría
selectFiltro.addEventListener("change", pintar);

// Evento 5 · click: borrar todas las carreras
botonBorrarTodo.addEventListener("click", () => {
  carreras = [];
  guardar();
  pintar();
  avisar("Se borraron todas las carreras.");
});

// ---------- 5. Inicio: pinta lo que haya guardado ----------
pintar();
