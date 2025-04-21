const apiKey = '177bab8bb13cf41d86764a1ca008fb92';

const searchBox = document.getElementById('searchBox');
const cityNameElem = document.getElementById('cityName');
const descriptionElem = document.getElementById('description');
const tempElem = document.getElementById('temperature');
const feelsLikeElem = document.getElementById('feelsLike');
const humidityElem = document.getElementById('humidity');
const windElem = document.getElementById('wind');
const forecastContainer = document.getElementById('forecastContainer');
const hourlyContainer = document.getElementById('hourlyContainer');
const weatherIconElem = document.getElementById('weatherIcon');
const spinner = document.getElementById('loadingSpinner');
const toggleBtn = document.getElementById('toggleTheme');
const unitToggle = document.getElementById('unitToggle');
const backgroundVideo = document.getElementById('backgroundVideo');

let currentUnit = 'metric';

searchBox.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    getWeather(searchBox.value);
  }
});

toggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('light');
});

unitToggle.addEventListener('click', () => {
  currentUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
  unitToggle.textContent = currentUnit === 'metric' ? '°F' : '°C';
  if (cityNameElem.textContent !== 'City Name') {
    getWeather(cityNameElem.textContent);
  }
});

async function getWeather(city) {
  try {
    spinner.classList.remove('hidden');

    const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`);
    const geoData = await geoRes.json();
    if (!geoData[0]) throw new Error("Location not found");
    const { lat, lon, name } = geoData[0];

    const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${currentUnit}`);
    const weatherData = await weatherRes.json();

    const current = weatherData.list[0];
    updateWeatherUI(current, name);
    updateForecast(weatherData.list);
    updateHourly(weatherData.list);
    updateBackgroundVideo(current);
  } catch (err) {
    alert("City not found or error fetching data.");
    console.error(err);
  } finally {
    spinner.classList.add('hidden');
  }
}

function updateWeatherUI(current, name) {
  cityNameElem.textContent = name;
  descriptionElem.textContent = current.weather[0].description;
  tempElem.textContent = `${Math.round(current.main.temp)}°`;
  feelsLikeElem.textContent = `Feels like: ${Math.round(current.main.feels_like)}°`;
  humidityElem.textContent = `Humidity: ${current.main.humidity}%`;
  windElem.textContent = `Wind: ${current.wind.speed} ${currentUnit === 'metric' ? 'km/h' : 'mph'}`;

  const iconCode = current.weather[0].icon;
  weatherIconElem.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  weatherIconElem.alt = current.weather[0].main;
}

function updateForecast(forecastList) {
  forecastContainer.innerHTML = '';
  const seenDays = new Set();

  forecastList.forEach(entry => {
    const date = new Date(entry.dt_txt);
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });

    if (date.getHours() === 12 && !seenDays.has(day)) {
      seenDays.add(day);

      const icon = entry.weather[0].icon;
      const temp = Math.round(entry.main.temp);

      forecastContainer.innerHTML += `
        <div class="day">
          <p>${day}</p>
          <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="" />
          <p>${temp}°</p>
        </div>
      `;
    }
  });
}

function updateHourly(forecastList) {
  hourlyContainer.innerHTML = '';
  forecastList.slice(0, 8).forEach(entry => {
    const date = new Date(entry.dt_txt);
    const hour = date.getHours();
    const label = `${hour}:00`;
    const icon = entry.weather[0].icon;
    const temp = Math.round(entry.main.temp);

    hourlyContainer.innerHTML += `
      <div class="hour">
        <p>${label}</p>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="" />
        <p>${temp}°</p>
      </div>
    `;
  });
}

function updateBackgroundVideo(current) {
  const hour = new Date(current.dt * 1000).getHours();
  const isNight = hour >= 19 || hour <= 5;
  let src = "videos/clear.mp4";

  const main = current.weather[0].main.toLowerCase();

  if (isNight) {
    src = "videos/night.mp4";
  } else {
    if (main.includes('cloud')) src = "videos/cloudy.mp4";
    else if (main.includes('rain') || main.includes('drizzle')) src = "videos/rain.mp4";
    else if (main.includes('snow')) src = "videos/snow.mp4";
    else if (main.includes('thunderstorm')) src = "videos/thunder.mp4";
    else if (main.includes('mist') || main.includes('fog') || main.includes('haze')) src = "videos/foggy.mp4";
    else src = "videos/clear.mp4";
  }

  const source = backgroundVideo.querySelector('source');
  if (!source.src.includes(src)) {
    source.src = src;
    backgroundVideo.load();
  }
}

window.addEventListener('load', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      try {
        spinner.classList.remove('hidden');
        const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${currentUnit}`);
        const data = await res.json();

        const current = data.list[0];
        const name = data.city.name;
        updateWeatherUI(current, name);
        updateForecast(data.list);
        updateHourly(data.list);
        updateBackgroundVideo(current);
      } catch (err) {
        alert("Error getting weather.");
        console.error(err);
      } finally {
        spinner.classList.add('hidden');
      }
    });
  }
});