const apiKey = '2468637f8b084886b52153200240110';
let unit = 'C';
let map;

const toggleUnitButton = document.getElementById('toggle-unit');
const searchButton = document.getElementById('search-button');
const locationInput = document.getElementById('location-input');
const mainWeatherContainer = document.getElementById('main-weather');
const mapContainer = document.getElementById('map');
const forecastContainer = document.getElementById('forecast');

toggleUnitButton.addEventListener('click', () => {
    unit = unit === 'C' ? 'F' : 'C';
    toggleUnitButton.textContent = `°${unit}`;
    fetchWeather();
});

searchButton.addEventListener('click', fetchWeather);

function fetchWeather() {
    const location = locationInput.value || 'Singapore';
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=4`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            updateMainWeather(data);
            updateForecast(data);
            updateMap(data);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            displayError('Error fetching weather data. Please try again later.');
        });
}

function updateMainWeather(data) {
    const current = data.current;
    const location = data.location;
    const forecast = data.forecast.forecastday[0];

    const temp = unit === 'C' ? current.temp_c : current.temp_f;
    const feelsLike = unit === 'C' ? current.feelslike_c : current.feelslike_f;

    mainWeatherContainer.innerHTML = `
        <h1><img src="${current.condition.icon}" alt="${current.condition.text}"> ${temp}°</h1>
        <p>Feels like ${feelsLike}°</p>
        <p>${current.condition.text}</p>
        <p>${location.name}, ${location.region}, ${location.country}</p>
        <p>${new Date(forecast.date).toDateString()}</p>
        <div class="row details">
            <div class="col">
                <p>Chance of rain</p>
                <p>${forecast.day.daily_chance_of_rain}%</p>
            </div>
            <div class="col">
                <p>Humidity</p>
                <p>${current.humidity}%</p>
            </div>
            <div class="col">
                <p>Sunrise</p>
                <p>${forecast.astro.sunrise}</p>
            </div>
            <div class="col">
                <p>Sunset</p>
                <p>${forecast.astro.sunset}</p>
            </div>
        </div>
    `;
}

function updateForecast(data) {
    const forecastDays = data.forecast.forecastday;

    forecastContainer.innerHTML = '';
    forecastDays.forEach(day => {
        const temp = unit === 'C' ? day.day.avgtemp_c : day.day.avgtemp_f;

        const forecastCard = document.createElement('div');
        forecastCard.className = 'col-md-4';
        forecastCard.innerHTML = `
            <div class="weather-card text-center">
                <h2><img src="${day.day.condition.icon}" alt="${day.day.condition.text}"> ${temp}°</h2>
                <p>${day.day.condition.text}</p>
                <p>${new Date(day.date).toDateString()}</p>
                <div class="row details">
                    <div class="col">
                        <p>Chance of rain</p>
                        <p>${day.day.daily_chance_of_rain}%</p>
                    </div>
                    <div class="col">
                        <p>Humidity</p>
                        <p>${day.day.avghumidity}%</p>
                    </div>
                    <div class="col">
                        <p>Sunrise</p>
                        <p>${day.astro.sunrise}</p>
                    </div>
                    <div class="col">
                        <p>Sunset</p>
                        <p>${day.astro.sunset}</p>
                    </div>
                </div>
            </div>
        `;
        forecastContainer.appendChild(forecastCard);
    });
}

function updateMap(data) {
    if (map) {
        map.remove();
    }

    const location = data.location;
    const lat = location.lat;
    const lon = location.lon;

    map = L.map('map').setView([lat, lon], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a >',
        subdomains: ['a', 'b', 'c']
    }).addTo(map);

    const marker = L.marker([lat, lon]).addTo(map);
    marker.bindPopup(`<b>${location.name}</b><br>${location.region}, ${location.country}`);
}

function displayError(message) {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'alert alert-danger';
    errorContainer.textContent = message;
    document.body.appendChild(errorContainer);
    setTimeout(() => {
        document.body.removeChild(errorContainer);
    }, 3000);
}

fetchWeather();