// ── Variables globales ───────────────────────────────────────
let productos = [];
let productosEnCarrito = [];
let categoriaActual = "todos";

const contenedorProductos = document.querySelector("#contenedor-productos");
const botonesCategorias   = document.querySelectorAll(".boton-categoria");
const tituloPrincipal     = document.querySelector("#titulo-principal");
const numerito            = document.querySelector("#numerito");
const buscador            = document.querySelector("#buscador");
const ordenarSelect       = document.querySelector("#ordenar");
const contadorProductos   = document.querySelector("#contador-productos");

// Cargar carrito guardado
const carritoGuardado = localStorage.getItem("productos-en-carrito");
if (carritoGuardado) {
    productosEnCarrito = JSON.parse(carritoGuardado);
    actualizarNumerito();
}

// ── Fetch productos ──────────────────────────────────────────
fetch("./js/productos.json")
    .then(response => {
        if (!response.ok) throw new Error("No se pudo cargar productos.json");
        return response.json();
    })
    .then(data => {
        productos = data;
        aplicarFiltros();
    })
    .catch(error => {
        console.error(error);
        contenedorProductos.innerHTML = "<p style='color:red;padding:1rem;'>Error: verificá que productos.json esté en la carpeta /js/</p>";
    });

// ── Función principal — aplica categoría + búsqueda + orden ─
function aplicarFiltros() {
    let resultado = [...productos];

    // 1. Filtrar por categoría
    if (categoriaActual !== "todos") {
        resultado = resultado.filter(p => p.categoria.id === categoriaActual);
    }

    // 2. Filtrar por búsqueda
    const busqueda = buscador.value.trim().toLowerCase();
    if (busqueda) {
        resultado = resultado.filter(p =>
            p.titulo.toLowerCase().includes(busqueda) ||
            (p.descripcion && p.descripcion.toLowerCase().includes(busqueda))
        );
    }

    // 3. Ordenar
    const orden = ordenarSelect.value;
    if (orden === "menor") resultado.sort((a, b) => a.precio - b.precio);
    if (orden === "mayor") resultado.sort((a, b) => b.precio - a.precio);
    if (orden === "az")    resultado.sort((a, b) => a.titulo.localeCompare(b.titulo));
    if (orden === "za")    resultado.sort((a, b) => b.titulo.localeCompare(a.titulo));

    cargarProductos(resultado);
}

// ── Renderizar productos ─────────────────────────────────────
function cargarProductos(productosElegidos) {
    contenedorProductos.innerHTML = "";

    // Actualizar contador
    const cant = productosElegidos.length;
    contadorProductos.innerText = `Mostrando ${cant} producto${cant !== 1 ? "s" : ""}`;

    if (cant === 0) {
        contenedorProductos.innerHTML = "<p style='color:#888;padding:1rem;'>No se encontraron productos.</p>";
        return;
    }

    productosElegidos.forEach(producto => {
        const div = document.createElement("div");
        div.classList.add("producto");

        // Badge (nuevo u oferta según el JSON)
        let badgeHTML = "";
        if (producto.badge === "nuevo")  badgeHTML = `<span class="producto-badge badge-nuevo">Nuevo</span>`;
        if (producto.badge === "oferta") badgeHTML = `<span class="producto-badge badge-oferta">Oferta</span>`;

        div.innerHTML = `
            <div class="producto-imagen-wrap">
                ${badgeHTML}
                <img class="producto-imagen" src="${producto.imagen}" alt="${producto.titulo}">
            </div>
            <div class="producto-detalles">
                <h3 class="producto-titulo">${producto.titulo}</h3>
                ${producto.descripcion ? `<p class="producto-descripcion">${producto.descripcion}</p>` : ""}
                <p class="producto-precio">₲ ${producto.precio.toLocaleString()}</p>
                <button class="producto-agregar" id="${producto.id}">Agregar</button>
            </div>
        `;
        contenedorProductos.append(div);
    });

    // Asignar eventos agregar
    document.querySelectorAll(".producto-agregar").forEach(boton => {
        boton.addEventListener("click", agregarAlCarrito);
    });
}

// ── Filtro por categorías ────────────────────────────────────
botonesCategorias.forEach(boton => {
    boton.addEventListener("click", (e) => {
        document.querySelector("aside").classList.remove("aside-visible");

        botonesCategorias.forEach(b => b.classList.remove("active"));
        e.currentTarget.classList.add("active");

        categoriaActual = e.currentTarget.id;

        if (categoriaActual === "todos") {
            tituloPrincipal.innerText = "Todos los productos";
        } else {
            const cat = productos.find(p => p.categoria.id === categoriaActual);
            tituloPrincipal.innerText = cat ? cat.categoria.nombre : categoriaActual;
        }

        buscador.value = "";
        ordenarSelect.value = "default";
        aplicarFiltros();
    });
});

// ── Buscador en tiempo real ──────────────────────────────────
buscador.addEventListener("input", aplicarFiltros);

// ── Ordenar ──────────────────────────────────────────────────
ordenarSelect.addEventListener("change", aplicarFiltros);

// ── Agregar al carrito ───────────────────────────────────────
function agregarAlCarrito(e) {
    const idBoton = e.currentTarget.id;
    const productoAgregado = productos.find(p => p.id === idBoton);
    if (!productoAgregado) return;

    const index = productosEnCarrito.findIndex(p => p.id === idBoton);
    if (index !== -1) {
        productosEnCarrito[index].cantidad++;
    } else {
        productosEnCarrito.push({ ...productoAgregado, cantidad: 1 });
    }

    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
    actualizarNumerito();

    Toastify({
        text: "Producto agregado",
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
            background: "linear-gradient(to right, #3a5a28, #4e7a35)",
            borderRadius: "2rem",
            textTransform: "uppercase",
            fontSize: ".75rem"
        },
        offset: { x: "1.5rem", y: "1.5rem" }
    }).showToast();
}

// ── Actualizar numerito ──────────────────────────────────────
function actualizarNumerito() {
    if (!numerito) return;
    numerito.innerText = productosEnCarrito.reduce((acc, p) => acc + p.cantidad, 0);
}