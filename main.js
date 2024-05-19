import Weather from "./js/scene";

const weather = new Weather();

window.addEventListener("resize", () => {
  weather.resize();
});
