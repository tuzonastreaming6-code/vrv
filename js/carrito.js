// ── Cargar datos del localStorage ───────────────────────────
let productosEnCarrito = [];
const carritoGuardado = localStorage.getItem("productos-en-carrito");
if (carritoGuardado) {
    productosEnCarrito = JSON.parse(carritoGuardado);
}

// ── Selectores ───────────────────────────────────────────────
const contenedorCarritoVacio     = document.querySelector("#carrito-vacio");
const contenedorCarritoProductos = document.querySelector("#carrito-productos");
const contenedorCarritoAcciones  = document.querySelector("#carrito-acciones");
const contenedorCarritoComprado  = document.querySelector("#carrito-comprado");
const botonVaciar                = document.querySelector("#carrito-acciones-vaciar");
const contenedorTotal            = document.querySelector("#total");
const botonComprar               = document.querySelector("#carrito-acciones-comprar");
const numerito                   = document.querySelector("#numerito");

// ── Renderizar carrito ───────────────────────────────────────
function cargarProductosCarrito() {
    actualizarNumerito();

    if (productosEnCarrito.length > 0) {
        contenedorCarritoVacio.classList.add("disabled");
        contenedorCarritoProductos.classList.remove("disabled");
        contenedorCarritoAcciones.classList.remove("disabled");
        contenedorCarritoComprado.classList.add("disabled");

        contenedorCarritoProductos.innerHTML = "";

        productosEnCarrito.forEach(producto => {
            const div = document.createElement("div");
            div.classList.add("carrito-producto");
            div.innerHTML = `
                <img class="carrito-producto-imagen" src="${producto.imagen}" alt="${producto.titulo}">
                <div class="carrito-producto-titulo">
                    <small>Título</small>
                    <h3>${producto.titulo}</h3>
                </div>
                <div class="carrito-producto-cantidad">
                    <small>Cantidad</small>
                    <p>${producto.cantidad}</p>
                </div>
                <div class="carrito-producto-precio">
                    <small>Precio</small>
                    <p>$${producto.precio.toLocaleString()}</p>
                </div>
                <div class="carrito-producto-subtotal">
                    <small>Subtotal</small>
                    <p>$${(producto.precio * producto.cantidad).toLocaleString()}</p>
                </div>
                <button class="carrito-producto-eliminar" id="${producto.id}">
                    <i class="bi bi-trash-fill"></i>
                </button>
            `;
            contenedorCarritoProductos.append(div);
        });

        // Asignar eventos eliminar
        document.querySelectorAll(".carrito-producto-eliminar").forEach(boton => {
            boton.addEventListener("click", eliminarDelCarrito);
        });

        actualizarTotal();

    } else {
        contenedorCarritoVacio.classList.remove("disabled");
        contenedorCarritoProductos.classList.add("disabled");
        contenedorCarritoAcciones.classList.add("disabled");
        contenedorCarritoComprado.classList.add("disabled");
    }
}

cargarProductosCarrito();

// ── Eliminar producto ────────────────────────────────────────
function eliminarDelCarrito(e) {
    const idBoton = e.currentTarget.id;
    const index = productosEnCarrito.findIndex(p => p.id === idBoton);
    if (index === -1) return;

    productosEnCarrito.splice(index, 1);
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
    cargarProductosCarrito();

    Toastify({
        text: "Producto eliminado",
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        style: {
            background: "linear-gradient(to right, #4b33a8, #785ce9)",
            borderRadius: "2rem",
            textTransform: "uppercase",
            fontSize: ".75rem"
        },
        offset: { x: "1.5rem", y: "1.5rem" }
    }).showToast();
}

// ── Vaciar carrito ───────────────────────────────────────────
botonVaciar.addEventListener("click", () => {
    Swal.fire({
        title: "¿Estás seguro?",
        icon: "question",
        html: `Se van a borrar ${productosEnCarrito.reduce((acc, p) => acc + p.cantidad, 0)} productos.`,
        showCancelButton: true,
        confirmButtonText: "Sí, vaciar",
        cancelButtonText: "Cancelar"
    }).then(result => {
        if (result.isConfirmed) {
            productosEnCarrito = [];
            localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
            cargarProductosCarrito();
        }
    });
});

// ── Calcular total ───────────────────────────────────────────
function actualizarTotal() {
    const totalCalculado = productosEnCarrito.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
    contenedorTotal.innerText = `$${totalCalculado.toLocaleString()}`;
}

// ── Comprar ──────────────────────────────────────────────────
botonComprar.addEventListener("click", () => {
    // Armar el mensaje con los productos
    let mensaje = "🛍️ *Hola! Quiero hacer un pedido:*\n\n";

    productosEnCarrito.forEach(p => {
        mensaje += `▪️ ${p.titulo} x${p.cantidad} — $${(p.precio * p.cantidad).toLocaleString()}\n`;
    });

    const total = productosEnCarrito.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
    mensaje += `\n*Total: $${total.toLocaleString()}*`;

    // Tu número de WhatsApp (con código de país, sin + ni espacios)
    const numeroWhatsApp = "+595971576219"; // ← cambiá esto por tu número real

    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;

    // Limpiar carrito
    productosEnCarrito = [];
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));

    // Mostrar mensaje de éxito y abrir WhatsApp
    contenedorCarritoVacio.classList.add("disabled");
    contenedorCarritoProductos.classList.add("disabled");
    contenedorCarritoAcciones.classList.add("disabled");
    contenedorCarritoComprado.classList.remove("disabled");

    window.open(url, "_blank");
});
// ── Numerito ─────────────────────────────────────────────────
function actualizarNumerito() {
    if (!numerito) return;
    numerito.innerText = productosEnCarrito.reduce((acc, p) => acc + p.cantidad, 0);
}