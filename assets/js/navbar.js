let toggle = document.querySelector(".toggle");
let menu = document.querySelector(".menu");
let icon = document.querySelector(".toggle ion-icon");

toggle.onclick = function () {
  menu.classList.toggle("active");
  icon.setAttribute(
    "name",
    menu.classList.contains("active") ? "close-outline" : "menu-outline"
  );
};

document.body.addEventListener("click", function (event) {
  if (!menu.contains(event.target) && !toggle.contains(event.target)) {
    menu.classList.remove("active");
    icon.setAttribute("name", "menu-outline");
  }
});
