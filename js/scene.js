import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { cities } from ".";
import { getCurrentCityWeather } from "../api";

export default class Weather {
  constructor() {
    this.canvas = document.querySelector("canvas");
    this.sizes = { width: window.innerWidth, height: window.innerHeight };
    this.scene = null;
    this.renderer = null;
    this.camera = null;

    this.geomatry = null;
    this.material = null;
    this.mesh = null;

    this.controls = null;
    this.loader = new GLTFLoader();

    this.weatherData = [];

    this.handleCanvasSizes();
    this.init();
    this.createEarth();
    this.createWeather();
    this.handleControlLight();
    this.render();
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("rgba(67, 127, 240, 1)");
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
    });
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.sizes.width / this.sizes.height,
      0.1,
      2000
    );

    this.renderer.render(this.scene, this.camera);
    this.camera.position.z = 5;
  }

  handleControlLight() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 0);

    this.scene.add(ambientLight);
    this.scene.add(directionalLight);
  }

  handleCanvasSizes() {
    this.canvas.style.width = this.sizes.width + "px";
    this.canvas.style.height = this.sizes.height + "px";
    this.canvas.width = this.sizes.width;
    this.canvas.height = this.sizes.height;
  }

  handleModelControl() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
  }

  createEarth() {
    this.loader.load("/models/earth.glb", (glb) => {
      glb.scene.position.y = -2;
      this.scene.add(glb.scene);
    });
  }

  createWeather = async () => {
    await this.getCityWeatherData();
    this.weatherData.map((weather, i) => {
      const formatWeather = weather.weatherData.weather[0].main.toLowerCase();

      this.loader.load("/models/weather.glb", (glb) => {
        let model = glb.scene.children.find(
          (child) => child.name === formatWeather
        );

        if (model) {
          const weatherModel = model.clone();
          this.scene.add(weatherModel);
          weatherModel.position.set(-2 + i, 0, 0);
        } else {
          model = glb.scene.children.find((child) => child.name === "cloud");
        }
      });
    });
  };

  getCityWeatherData = async () => {
    const promies = cities.map((city, i) => getCurrentCityWeather(city));
    try {
      this.weatherData = await Promise.all(promies);
    } catch (error) {
      console.log("error", error);
    }
  };

  controlWeather(index, position) {
    if (this.weatherObject[index]) {
      this.weatherObject[index].position.set(
        position.x,
        position.y,
        position.z
      );
    }
  }

  render = () => {
    requestAnimationFrame(this.render);
    this.renderer.render(this.scene, this.camera);
  };

  resize() {
    this.sizes.width = window.innerWidth;
    this.sizes.height = window.innerHeight;
    this.handleCanvasSizes();
    this.camera.aspect = this.sizes.width / this.sizes.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.sizes.width, this.sizes.height);
  }
}
