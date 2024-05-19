export const getCurrentCityWeather = (city) => {
  const key = import.meta.env.VITE_WEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}`;

  return fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (data) {
        return {
          city: city,
          weatherData: data,
        };
      }
    })
    .catch((error) => console.log("error!!", error));
};
