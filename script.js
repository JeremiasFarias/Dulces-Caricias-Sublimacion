/* =====================================================
   DULCES CARICIAS SUBLIMACIÓN — SCRIPT
   1. Datos de las galerías
   2. Cambio de imágenes + indicadores (dots)
   3. Lightbox (productos + galería de trabajos)
   4. Menú hamburguesa
   5. Acordeón de preguntas frecuentes
   6. Animaciones al hacer scroll (IntersectionObserver)
===================================================== */

/* 1. DATOS DE LAS GALERÍAS ------------------------- */
const imagenes = [
    [
        "set.png", "set2.png", "set3.png", "set4.png", "set5.png",
        "set6.png", "set7.png", "set8.png", "set9.png", "set10.png"
    ],
    [
        "setmochi.png", "setmochi2.png", "setmochi3.png",
        "setmochi4.png", "setmochi5.png"
    ]
];

/* Imágenes usadas en "Algunos de nuestros trabajos".
   Deben coincidir, en orden, con los botones .trabajo-item del HTML. */
const imagenesTrabajos = ["set3.png", "setmochi2.png", "set5.png", "setmochi4.png"];

let indices = [0, 0];

/* Precarga silenciosa de todas las imágenes de las galerías,
   para que el cambio entre fotos se sienta instantáneo. */
function precargarImagenes() {
    const todas = [...imagenes.flat(), ...imagenesTrabajos];
    todas.forEach((src) => {
        const im = new Image();
        im.src = src;
    });
}

/* 2. CAMBIO DE IMÁGENES + DOTS ---------------------- */
function crearDots() {
    imagenes.forEach((set, i) => {
        const contenedor = document.getElementById("dots" + i);
        if (!contenedor) return;

        contenedor.innerHTML = "";

        set.forEach((_, j) => {
            const dot = document.createElement("span");
            dot.className = "dot" + (j === indices[i] ? " activo" : "");
            dot.addEventListener("click", () => {
                indices[i] = j;
                actualizarImagen(i);
            });
            contenedor.appendChild(dot);
        });
    });
}

function actualizarImagen(i) {
    const img = document.getElementById("img" + i);
    if (!img) return;

    img.classList.add("cambiando");

    setTimeout(() => {
        img.src = imagenes[i][indices[i]];
        img.classList.remove("cambiando");
    }, 180);

    const dots = document.querySelectorAll("#dots" + i + " .dot");
    dots.forEach((dot, j) => dot.classList.toggle("activo", j === indices[i]));

    if (lightboxAbierto === "producto" && lightboxProductoIndex === i) {
        actualizarLightboxImagen();
    }
}

function siguiente(i) {
    indices[i] = (indices[i] + 1) % imagenes[i].length;
    actualizarImagen(i);
}

function anterior(i) {
    indices[i] = (indices[i] - 1 + imagenes[i].length) % imagenes[i].length;
    actualizarImagen(i);
}

/* 3. LIGHTBOX ---------------------------------------- */
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxContador = document.getElementById("lightboxContador");

/* lightboxAbierto: null | "producto" | "trabajos" */
let lightboxAbierto = null;
let lightboxProductoIndex = null;
let lightboxTrabajoIndex = 0;

function abrirLightbox(i) {
    lightboxAbierto = "producto";
    lightboxProductoIndex = i;
    actualizarLightboxImagen();
    mostrarLightbox();
}

function abrirLightboxTrabajos(idx) {
    lightboxAbierto = "trabajos";
    lightboxTrabajoIndex = idx;
    actualizarLightboxImagen();
    mostrarLightbox();
}

function mostrarLightbox() {
    lightbox.classList.add("activo");
    document.body.style.overflow = "hidden";
}

function cerrarLightbox() {
    lightbox.classList.remove("activo");
    lightboxAbierto = null;
    lightboxProductoIndex = null;
    document.body.style.overflow = "";
}

function actualizarLightboxImagen() {
    if (lightboxAbierto === "producto") {
        const i = lightboxProductoIndex;
        lightboxImg.src = imagenes[i][indices[i]];
        lightboxImg.alt = "Vista ampliada del producto";
        if (lightboxContador) {
            lightboxContador.textContent = (indices[i] + 1) + " / " + imagenes[i].length;
        }
    } else if (lightboxAbierto === "trabajos") {
        lightboxImg.src = imagenesTrabajos[lightboxTrabajoIndex];
        lightboxImg.alt = "Vista ampliada de un trabajo de Dulces Caricias";
        if (lightboxContador) {
            lightboxContador.textContent = (lightboxTrabajoIndex + 1) + " / " + imagenesTrabajos.length;
        }
    }
}

function lightboxSiguiente() {
    if (lightboxAbierto === "producto") {
        siguiente(lightboxProductoIndex);
    } else if (lightboxAbierto === "trabajos") {
        lightboxTrabajoIndex = (lightboxTrabajoIndex + 1) % imagenesTrabajos.length;
        actualizarLightboxImagen();
    }
}

function lightboxAnterior() {
    if (lightboxAbierto === "producto") {
        anterior(lightboxProductoIndex);
    } else if (lightboxAbierto === "trabajos") {
        lightboxTrabajoIndex = (lightboxTrabajoIndex - 1 + imagenesTrabajos.length) % imagenesTrabajos.length;
        actualizarLightboxImagen();
    }
}

lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) cerrarLightbox();
});

document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("activo")) return;
    if (e.key === "Escape") cerrarLightbox();
    if (e.key === "ArrowRight") lightboxSiguiente();
    if (e.key === "ArrowLeft") lightboxAnterior();
});

/* Soporte táctil (swipe) para el lightbox en celular */
let toqueInicioX = 0;
let toqueInicioY = 0;

lightbox.addEventListener("touchstart", (e) => {
    const t = e.changedTouches[0];
    toqueInicioX = t.clientX;
    toqueInicioY = t.clientY;
}, { passive: true });

lightbox.addEventListener("touchend", (e) => {
    const t = e.changedTouches[0];
    const deltaX = t.clientX - toqueInicioX;
    const deltaY = t.clientY - toqueInicioY;

    /* Solo se considera swipe si el movimiento horizontal predomina
       sobre el vertical, para no interferir con el scroll. */
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0) {
            lightboxSiguiente();
        } else {
            lightboxAnterior();
        }
    }
}, { passive: true });

/* 4. MENÚ HAMBURGUESA -------------------------------- */
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
const navContainer = document.querySelector(".nav-container");

function cerrarMenu() {
    navMenu.classList.remove("activo");
    navToggle.classList.remove("activo");
    navToggle.setAttribute("aria-expanded", "false");
}

navToggle.addEventListener("click", () => {
    const abierto = navMenu.classList.toggle("activo");
    navToggle.classList.toggle("activo", abierto);
    navToggle.setAttribute("aria-expanded", abierto);
});

document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", cerrarMenu);
});

/* Cerrar el menú al tocar fuera de él */
document.addEventListener("click", (e) => {
    if (!navMenu.classList.contains("activo")) return;
    if (navContainer && !navContainer.contains(e.target)) {
        cerrarMenu();
    }
});

/* Cerrar el menú con la tecla Escape */
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navMenu.classList.contains("activo")) {
        cerrarMenu();
    }
});

/* 5. ACORDEÓN DE PREGUNTAS FRECUENTES ---------------- */
document.querySelectorAll(".faq-pregunta").forEach((boton) => {
    boton.addEventListener("click", () => {
        const item = boton.closest(".faq-item");
        const abierto = item.classList.contains("abierto");

        /* Solo una pregunta abierta a la vez */
        document.querySelectorAll(".faq-item.abierto").forEach((otro) => {
            if (otro !== item) {
                otro.classList.remove("abierto");
                otro.querySelector(".faq-pregunta").setAttribute("aria-expanded", "false");
            }
        });

        item.classList.toggle("abierto", !abierto);
        boton.setAttribute("aria-expanded", String(!abierto));
    });
});

/* 6. ANIMACIONES AL HACER SCROLL --------------------- */
const observer = new IntersectionObserver(
    (entradas) => {
        entradas.forEach((entrada) => {
            if (entrada.isIntersecting) {
                entrada.target.classList.add("visible");
                observer.unobserve(entrada.target);
            }
        });
    },
    { threshold: 0.15 }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

/* Inicialización */
crearDots();
precargarImagenes();
