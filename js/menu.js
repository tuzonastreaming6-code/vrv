const openMenu  = document.querySelector("#open-menu");
const closeMenu = document.querySelector("#close-menu");
const aside     = document.querySelector("aside");

if (openMenu) {
    openMenu.addEventListener("click", () => aside.classList.add("aside-visible"));
}
if (closeMenu) {
    closeMenu.addEventListener("click", () => aside.classList.remove("aside-visible"));
}