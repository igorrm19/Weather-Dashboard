const API_KEY = '';
const searchForm = document.querySelector('#search-form');
const cityInput = document.querySelector('#city-input');
const historyContainer = document.querySelector('#search-history');
const currentContainer = document.querySelector('#current-weather');
const forecastContainer = document.querySelector('#forecast-container');

document.addEventListener('DOMContentLoaded', () => {
    console.log('Duo Weather Dashboard iniciado.');
});

async function getWeatherByCoords(lat, lon) {
}

async function getWeatherByCity(city) {
}

function renderCurrentWeather(data) {
}

function renderForecast(data) {
}

function saveToHistory(city) {
}

function loadHistory() {
}