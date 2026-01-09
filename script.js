const API_KEY = '9833cc0b607ba10a261366dc104524cc';
const searchForm = document.querySelector('#search-form');
const cityInput = document.querySelector('#city-input');
const historyContainer = document.querySelector('#search-history');
const currentContainer = document.querySelector('#current-weather');
const forecastContainer = document.querySelector('#forecast-container');

document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeatherByCoords(latitude, longitude);
            },
            (error) => {
                console.error('Erro ao obter localização:', error);
                getWeatherByCity('São Paulo');
            }
        );
    } else {
        getWeatherByCity('São Paulo');
    }
});

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
        getWeatherByCity(city);
        cityInput.value = '';
    }
});

async function getWeatherByCoords(lat, lon) {
    showLoader();
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`);
        if (!response.ok) throw new Error('Cidade não encontrada');
        const data = await response.ok ? await response.json() : null;
        if (data) {
            renderCurrentWeather(data);
            getForecast(lat, lon);
        }
    } catch (error) {
        handleError(error.message);
    }
}

async function getWeatherByCity(city) {
    showLoader();
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=pt_br`);
        if (!response.ok) throw new Error('Cidade não encontrada');
        const data = await response.json();
        renderCurrentWeather(data);
        saveToHistory(data.name);
        getForecast(data.coord.lat, data.coord.lon);
    } catch (error) {
        handleError(error.message);
    }
}

async function getForecast(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`);
        const data = await response.json();
        renderForecast(data);
    } catch (error) {
        console.error('Erro ao buscar previsão:', error);
    }
}

function renderCurrentWeather(data) {
    const date = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    const icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    currentContainer.innerHTML = `
        <div class="weather-info">
            <h2>${data.name}, ${data.sys.country}</h2>
            <p class="date">${date}</p>
            <img src="${icon}" alt="${data.weather[0].description}">
            <p class="temp-main">${Math.round(data.main.temp)}°C</p>
            <p>${data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1)}</p>
            
            <div class="weather-details">
                <div class="detail-item">
                    <span class="detail-label">Umidade</span>
                    <span class="detail-value">${data.main.humidity}%</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Vento</span>
                    <span class="detail-value">${Math.round(data.wind.speed * 3.6)} km/h</span>
                </div>
            </div>
        </div>
    `;
    updateBackground(data.weather[0].main);
}

function renderForecast(data) {
    forecastContainer.innerHTML = '';
    const dailyData = data.list.filter(item => item.dt_txt.includes('12:00:00')).slice(0, 5);

    dailyData.forEach(day => {
        const date = new Date(day.dt * 1000).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' });
        const icon = `https://openweathermap.org/img/wn/${day.weather[0].icon}.png`;

        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <p class="forecast-date">${date}</p>
            <img src="${icon}" alt="${day.weather[0].description}">
            <p class="forecast-temp">${Math.round(day.main.temp)}°C</p>
            <p class="forecast-humidity">${day.main.humidity}% UR</p>
        `;
        forecastContainer.appendChild(card);
    });
}

function saveToHistory(city) {
    let history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
    if (!history.includes(city)) {
        history.unshift(city);
        if (history.length > 3) history.pop();
        localStorage.setItem('weatherHistory', JSON.stringify(history));
        loadHistory();
    }
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
    historyContainer.innerHTML = '';
    history.forEach(city => {
        const btn = document.createElement('button');
        btn.className = 'history-btn';
        btn.textContent = city;
        btn.onclick = () => getWeatherByCity(city);
        historyContainer.appendChild(btn);
    });
}

function updateBackground(condition) {
    const body = document.body;
    if (condition === 'Clear') {
        body.style.background = 'linear-gradient(135deg, #fcd34d 0%, #f87171 100%)';
    } else if (condition === 'Rain' || condition === 'Drizzle' || condition === 'Thunderstorm') {
        body.style.background = 'linear-gradient(135deg, #64748b 0%, #334155 100%)';
    } else {
        body.style.background = 'linear-gradient(135deg, #e0f2fe 0%, #f8fafc 100%)';
    }
}

function showLoader() {
    currentContainer.innerHTML = '<div class="loader">Buscando clima...</div>';
    forecastContainer.innerHTML = '';
}

function handleError(message) {
    currentContainer.innerHTML = `<div class="error" style="color: var(--danger); padding: 2rem;">${message}</div>`;
}