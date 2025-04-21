const apiKey = "";
const searchInput = document.getElementById("searchInput");
const unitToggle = document.getElementById("unitToggle");
const themeToggle = document.getElementById("themeToggle");
let isCelsius = true;

function fetchWeather(city) {
  const units = isCelsius ? "metric" : "imperial";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${apiKey}`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== 200) throw new Error(data.message);
      updateCurrentWeather(data);
      fetchForecast(data.coord.lat, data.coord.lon);
      setBackgroundVideo(data);
    })
    .catch(() => alert("Unable to load weather."));
}

function fetchForecast(lat, lon) {
  const units = isCelsius ? "metric" : "imperial";
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      updateHourlyForecast(data.list);
      updateFiveDayForecast(data.list);
      updateDetails(data.list[0]);
    });
}

function updateCurrentWeather(data) {
  document.getElementById("cityName").textContent = data.name;
  document.getElementById("weatherDescription").textContent = data.weather[0].description;
  document.getElementById("temperature").textContent = `${Math.round(data.main.temp)}°${isCelsius ? "C" : "F"}`;
  document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
}

function updateHourlyForecast(list) {
  const container = document.getElementById("hourlyContainer");
  container.innerHTML = "";
  for (let i = 0; i < 8; i++) {
    const item = list[i];
    const time = new Date(item.dt * 1000);
    const hour = time.getHours() % 12 || 12;
    const ampm = time.getHours() >= 12 ? "PM" : "AM";
    const div = document.createElement("div");
    div.className = "hour";
    div.innerHTML = `
      <p>${hour}${ampm}</p>
      <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png"/>
      <p>${Math.round(item.main.temp)}°</p>
    `;
    container.appendChild(div);
  }
}

function updateFiveDayForecast(list) {
    const container = document.getElementById("forecastContainer");
    container.innerHTML = "";
    const daily = {};
    
    list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const day = date.toLocaleDateString(undefined, { weekday: "short" });
      
      // Only store one item per day (first one encountered)
      if (!daily[day]) {
        daily[day] = item;
      }
    });
  
    // Only show 5 days
    Object.keys(daily).slice(0, 5).forEach(day => {
      const item = daily[day];
      const div = document.createElement("div");
      div.className = "forecast-day";
      div.innerHTML = `
        <p>${day}</p>
        <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png"/>
        <p>${Math.round(item.main.temp)}°</p>
      `;
      container.appendChild(div);
    });
  }

function updateDetails(item) {
  document.getElementById("feelsLike").textContent = `Feels like: ${Math.round(item.main.feels_like)}°`;
  document.getElementById("humidity").textContent = `Humidity: ${item.main.humidity}%`;
  document.getElementById("wind").textContent = `Wind: ${item.wind.speed} ${isCelsius ? "m/s" : "mph"}`;
  document.getElementById("chanceOfRain").textContent = `Chance of Rain: ${Math.round((item.pop || 0) * 100)}%`;
  const uvUrl = `https://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${item.coord?.lat}&lon=${item.coord?.lon}`;
  fetch(uvUrl)
    .then(res => res.json())
    .then(uv => {
      document.getElementById("uvIndex").textContent = `UV Index: ${uv.value}`;
    })
    .catch(() => {
      document.getElementById("uvIndex").textContent = "UV Index: N/A";
    });
}

function setBackgroundVideo(data) {
  const icon = data.weather[0].icon;
  const hour = new Date(data.dt * 1000).getHours();
  const isNight = icon.includes("n") || hour < 6 || hour > 18;
  const main = data.weather[0].main.toLowerCase();
  let videoFile = "clear.mp4";

  if (isNight) {
    videoFile = "nighttime.mp4";
  } else if (main.includes("cloud")) {
    videoFile = "cloudy.mp4";
  } else if (main.includes("fog") || main.includes("mist") || main.includes("haze")) {
    videoFile = "foggy.mp4";
  } else if (main.includes("rain") || main.includes("drizzle")) {
    videoFile = "rain.mp4";
  } else if (main.includes("thunder")) {
    videoFile = "thunder.mp4";
  } else if (main.includes("snow")) {
    videoFile = "snow.mp4";
  } else if (main.includes("clear")) {
    videoFile = "sunny.mp4";
  }

  const video = document.getElementById("background-video");
  video.src = `videos/${videoFile}`;
  video.load();
  video.play();
}

// Event Listeners
searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter") fetchWeather(searchInput.value);
});

unitToggle.addEventListener("click", () => {
  isCelsius = !isCelsius;
  unitToggle.textContent = isCelsius ? "°F" : "°C";
  fetchWeather(document.getElementById("cityName").textContent);
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
});

// Auto-load a default city
fetchWeather("New York");
