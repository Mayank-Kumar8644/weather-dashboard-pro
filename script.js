class WeatherDashboard {
    constructor() {
        this.apiKey = '674c819b5b94fc837452001661493cd5'; // Replace with your OpenWeatherMap API key
       this.baseUrl = '/api';

        this.units = 'metric';
        this.favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        this.activeCity = null;
        this.chartInstance = null;
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 60000);
        this.renderFavoritesCount();
        this.searchWeather('London'); // Default city
    }

    cacheElements() {
        // Search & actions
        this.cityInput = document.getElementById('cityInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.voiceBtn = document.getElementById('voiceSearch');
        this.clearBtn = document.getElementById('clearSearch');
        this.quickCities = document.querySelectorAll('.quick-city');

        // UI toggles
        this.unitToggle = document.getElementById('unitToggle');
        this.themeToggle = document.getElementById('themeToggle');
        this.favoriteToggle = document.getElementById('favoriteToggle');
        this.favCount = document.getElementById('favCount');

        // Panels & buttons
        this.favoritesBtn = document.getElementById('favoritesBtn');
        this.favoritesPanel = document.getElementById('favoritesPanel');
        this.closeFavorites = document.getElementById('closeFavorites');
        this.clearFavoritesBtn = document.getElementById('clearFavorites');
        this.importFavoritesBtn = document.getElementById('importFavorites');
        this.exportFavoritesBtn = document.getElementById('exportFavorites');
        this.favoritesList = document.getElementById('favoritesList');

        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsPanel = document.getElementById('settingsPanel');
        this.closeSettings = document.getElementById('closeSettings');
        this.tempUnitSelect = document.getElementById('tempUnit');

        // Alerts & map
        this.weatherAlerts = document.getElementById('weatherAlerts');
        this.closeAlert = document.getElementById('closeAlert');

        // Sections
        this.weatherCard = document.getElementById('weatherCard');
        this.forecastSection = document.getElementById('forecastSection');
        this.hourlyForecast = document.getElementById('hourlyForecast');
        this.weatherCharts = document.getElementById('weatherCharts');
        this.airQualitySection = document.getElementById('airQualitySection');

        // Loading & errors
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.errorMessage = document.getElementById('errorMessage');
    }

    bindEvents() {
        // Search events
        this.searchBtn.addEventListener('click', () => this.searchWeather());
        this.cityInput.addEventListener('keypress', e => { if (e.key === 'Enter') this.searchWeather(); });
        this.voiceBtn.addEventListener('click', () => this.startVoiceSearch());
        this.clearBtn.addEventListener('click', () => { this.cityInput.value = ''; this.clearBtn.classList.add('hidden'); });
        this.cityInput.addEventListener('input', () => { this.clearBtn.classList.toggle('hidden', !this.cityInput.value); });
        this.quickCities.forEach(btn => btn.addEventListener('click', () => this.searchWeather(btn.dataset.city)));

        // UI toggles
        this.unitToggle.addEventListener('click', () => this.toggleUnits());
        this.themeToggle.addEventListener('click', () => document.body.classList.toggle('dark-mode'));

        // Favorites panel
        this.favoriteToggle.addEventListener('click', () => this.toggleFavorite());
        this.favoritesBtn.addEventListener('click', () => this.openFavorites());
        this.closeFavorites.addEventListener('click', () => this.closeFavoritesPanel());
        this.clearFavoritesBtn.addEventListener('click', () => this.clearFavorites());
        this.importFavoritesBtn.addEventListener('click', () => this.importFavorites());
        this.exportFavoritesBtn.addEventListener('click', () => this.exportFavorites());

        // Settings panel
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.closeSettings.addEventListener('click', () => this.closeSettingsPanel());
        this.tempUnitSelect.addEventListener('change', () => {
            this.units = this.tempUnitSelect.value === 'imperial' ? 'imperial' :
                         this.tempUnitSelect.value === 'kelvin' ? 'standard' : 'metric';
            this.searchWeather(this.activeCity);
        });

        // Alerts
        this.closeAlert.addEventListener('click', () => this.weatherAlerts.classList.add('hidden'));
    }

    async searchWeather(city = null) {
    const cityName = city || this.cityInput.value.trim();
    if (!cityName) {
        this.showError('Please enter a city name.');
        return;
    }
    this.activeCity = cityName;
    this.showLoading();
    this.hideError();

    try {
        console.log('Fetching current weather for:', cityName);
        const weather = await this.fetchCurrentWeather(cityName);
        console.log('Weather data received:', weather);

        console.log('Fetching forecast for:', cityName);
        const forecast = await this.fetchForecast(cityName);
        console.log('Forecast data received:', forecast);

        console.log('Fetching air quality for coordinates:', weather.coord);
        const aqi = await this.fetchAirQuality(weather.coord.lat, weather.coord.lon);
        console.log('Air quality data received:', aqi);

        // Display data
        console.log('Displaying weather...');
        this.displayCurrentWeather(weather);

        console.log('Displaying forecast...');
        this.displayForecast(forecast);

        console.log('Displaying hourly forecast...');
        this.displayHourlyForecast(forecast);

        console.log('Displaying weather charts...');
        this.displayWeatherCharts(forecast);

        console.log('Displaying air quality...');
        this.displayAirQuality(aqi);

        console.log('Fetching alerts...');
        this.fetchWeatherAlerts(weather.coord.lat, weather.coord.lon);

        // Show sections
        this.weatherCard.classList.remove('hidden');
        this.forecastSection.classList.remove('hidden');
        this.airQualitySection.classList.remove('hidden');
        console.log('All displays updated successfully.');
    } catch (err) {
        console.error('Error in searchWeather:', err);
        this.showError('City not found or network error. Please try again.');
    } finally {
        this.hideLoading();
        console.log('Loading spinner hidden.');
    }
}

    async fetchCurrentWeather(city) {
        const res = await fetch(`/api/weather/${city}`);


        if (!res.ok) throw new Error('Weather fetch error');
        return res.json();
    }

    async fetchForecast(city) {
       const res = await fetch(`/api/forecast/${city}`);


        if (!res.ok) throw new Error('Forecast fetch error');
        return res.json();
    }

    async fetchAirQuality(lat, lon) {
        const res = await fetch(`/api/airquality?lat=${lat}&lon=${lon}`);


        if (!res.ok) throw new Error('Air quality fetch error');
        return res.json();
    }

    displayCurrentWeather(data) {
        const { name, sys, main, weather, wind, visibility, coord, dt, timezone } = data;

        document.getElementById('cityName').textContent = name;
        document.getElementById('countryName').textContent = sys.country;
        document.getElementById('coordinates').textContent = `${coord.lat.toFixed(2)}°, ${coord.lon.toFixed(2)}°`;

        const localTime = new Date((dt + timezone) * 1000);
        document.getElementById('localTime').textContent = localTime.toUTCString().slice(17, 22);
        document.getElementById('timezone').textContent = `GMT${timezone >= 0 ? '+' : ''}${timezone / 3600}`;

        document.getElementById('currentTemp').textContent = `${Math.round(main.temp)}°${this.units === 'metric' ? 'C' : 'F'}`;
        document.getElementById('feelsLike').textContent = `${Math.round(main.feels_like)}°`;
        document.getElementById('weatherDescription').textContent = weather[0].description;
        document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;
        document.getElementById('humidity').textContent = `${main.humidity}%`;
        document.getElementById('windSpeed').textContent = `${Math.round(wind.speed * 3.6)} km/h`;
        document.getElementById('visibility').textContent = `${(visibility / 1000).toFixed(1)} km`;
        document.getElementById('pressure').textContent = `${main.pressure} hPa`;
        document.getElementById('lastUpdateTime').textContent = new Date().toLocaleTimeString();

        this.favoriteToggle.classList.toggle('active', this.favorites.includes(name));
    }

    displayForecast(data) {
        const dailyContainer = document.getElementById('dailyForecast');
        dailyContainer.innerHTML = '';
        const daily = data.list.filter((_, i) => i % 8 === 0).slice(0, 7);

        daily.forEach(item => {
            const date = new Date(item.dt * 1000);
            const day = date.toLocaleDateString('en-US', { weekday: 'short' });
            const card = document.createElement('div');
            card.className = 'forecast-card';
            card.innerHTML = `
                <div class="forecast-day">${day}</div>
                <div class="forecast-icon"><img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="${item.weather[0].description}"></div>
                <div class="forecast-temps">
                    <span class="forecast-high">${Math.round(item.main.temp_max)}°</span>
                    <span class="forecast-low">${Math.round(item.main.temp_min)}°</span>
                </div>`;
            dailyContainer.appendChild(card);
        });
    }

    displayHourlyForecast(data) {
        const hourlyContainer = this.hourlyForecast.querySelector('.hourly-scroll');
        hourlyContainer.innerHTML = '';
        const next24h = data.list.slice(0, 8);

        next24h.forEach(item => {
            const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const card = document.createElement('div');
            card.className = 'hourly-card';
            card.innerHTML = `
                <div class="hourly-time">${time}</div>
                <div class="hourly-icon"><img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="${item.weather[0].description}"></div>
                <div class="hourly-temp">${Math.round(item.main.temp)}°</div>`;
            hourlyContainer.appendChild(card);
        });

        this.hourlyForecast.classList.remove('hidden');
    }

    displayWeatherCharts(forecast) {
        const ctxContainer = document.getElementById('temperatureChart');
        ctxContainer.innerHTML = '<canvas id="tempChartCanvas"></canvas>';
        const ctx = document.getElementById('tempChartCanvas').getContext('2d');

        const labels = forecast.list.slice(0, 8).map(item =>
            new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit' })
        );
        const temps = forecast.list.slice(0, 8).map(item => item.main.temp);
        const precipitation = forecast.list.slice(0, 8).map(item => item.pop * 100);

        if (this.chartInstance) this.chartInstance.destroy();
        this.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Temperature (°C)',
                        data: temps,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        yAxisID: 'y',
                    },
                    {
                        label: 'Precipitation (%)',
                        data: precipitation,
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        yAxisID: 'y1',
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: { type: 'linear', position: 'left' },
                    y1: { type: 'linear', position: 'right' }
                }
            }
        });

        this.weatherCharts.classList.remove('hidden');
    }

    displayAirQuality(data) {
        if (!data || !data.list || !data.list.length) return;
        const aqi = data.list[0].main.aqi;
        document.getElementById('aqiIndex').textContent = aqi;
        const levels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
        document.getElementById('aqiLevel').textContent = levels[aqi - 1] || '--';
        document.getElementById('aqiFill').style.width = `${aqi * 20}%`;

        const components = data.list[0].components;
        document.querySelector('#pm25 .pollutant-value').textContent = `${components.pm2_5} μg/m³`;
        document.querySelector('#pm10 .pollutant-value').textContent = `${components.pm10} μg/m³`;
        document.querySelector('#no2 .pollutant-value').textContent = `${components.no2} μg/m³`;
        document.querySelector('#o3 .pollutant-value').textContent = `${components.o3} μg/m³`;
    }

    async fetchWeatherAlerts(lat, lon) {
        try {
            const res = await fetch(`/api/alerts?lat=${lat}&lon=${lon}`);


            if (!res.ok) throw new Error('Alerts fetch error');
            const data = await res.json();

            if (data.alerts && data.alerts.length > 0) {
                const alert = data.alerts[0];
                this.displayAlert(alert.event, alert.description, new Date(alert.start * 1000).toLocaleString());
            }
        } catch (err) {
            console.warn('No alerts found or error fetching alerts');
        }
    }

    displayAlert(title, description, time) {
        document.getElementById('alertTitle').textContent = title;
        document.getElementById('alertDescription').textContent = description;
        document.getElementById('alertTime').textContent = time;
        this.weatherAlerts.classList.remove('hidden');
    }

    // === Favorites Management ===
    toggleFavorite() {
        const city = document.getElementById('cityName').textContent;
        if (this.favorites.includes(city)) {
            this.favorites = this.favorites.filter(fav => fav !== city);
        } else {
            this.favorites.push(city);
        }
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
        this.favoriteToggle.classList.toggle('active');
        this.renderFavoritesCount();
        this.renderFavoritesList();
    }

    renderFavoritesCount() {
        this.favCount.textContent = this.favorites.length;
    }

    openFavorites() {
        this.renderFavoritesList();
        this.favoritesPanel.classList.add('active');
    }

    closeFavoritesPanel() {
        this.favoritesPanel.classList.remove('active');
    }

    renderFavoritesList() {
        this.favoritesList.innerHTML = '';
        if (this.favorites.length === 0) {
            this.favoritesList.innerHTML = `
                <div class="no-favorites">
                    <i class="fas fa-heart-broken"></i>
                    <h4>No Favorites Yet</h4>
                    <p>Add cities to your favorites to quickly access their weather information.</p>
                </div>`;
            return;
        }

        this.favorites.forEach(city => {
            const item = document.createElement('div');
            item.className = 'favorite-item';
            item.innerHTML = `
                <span class="favorite-city">${city}</span>
                <button class="remove-fav" data-city="${city}">
                    <i class="fas fa-times"></i>
                </button>`;
            item.querySelector('.favorite-city').addEventListener('click', () => {
                this.searchWeather(city);
                this.closeFavoritesPanel();
            });
            item.querySelector('.remove-fav').addEventListener('click', () => this.removeFavorite(city));
            this.favoritesList.appendChild(item);
        });
    }

    removeFavorite(city) {
        this.favorites = this.favorites.filter(fav => fav !== city);
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
        this.renderFavoritesCount();
        this.renderFavoritesList();
    }

    clearFavorites() {
        this.favorites = [];
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
        this.renderFavoritesCount();
        this.renderFavoritesList();
    }

    importFavorites() {
        const data = prompt('Paste your favorites list (comma-separated):');
        if (data) {
            this.favorites = data.split(',').map(c => c.trim()).filter(Boolean);
            localStorage.setItem('favorites', JSON.stringify(this.favorites));
            this.renderFavoritesCount();
            this.renderFavoritesList();
        }
    }

    exportFavorites() {
        alert('Your favorites: ' + this.favorites.join(', '));
    }

    // === Settings Panel ===
    openSettings() {
        this.settingsPanel.classList.add('active');
    }

    closeSettingsPanel() {
        this.settingsPanel.classList.remove('active');
    }

    // === Map Controls & Radar Animations ===
    initMapControls() {
        this.mapSection = document.getElementById('mapSection');
        this.mapLayers = document.querySelectorAll('.map-layer');
        this.mapFullscreen = document.getElementById('mapFullscreen');
        this.playAnimation = document.getElementById('playAnimation');
        this.timeSlider = document.getElementById('timeSlider');

        this.mapLayers.forEach(layer => {
            layer.addEventListener('click', () => {
                this.mapLayers.forEach(l => l.classList.remove('active'));
                layer.classList.add('active');
                this.loadMapLayer(layer.dataset.layer);
            });
        });

        this.mapFullscreen.addEventListener('click', () => this.toggleMapFullscreen());
        this.playAnimation.addEventListener('click', () => this.toggleMapAnimation());
        this.timeSlider.addEventListener('input', () => this.updateMapTime());
    }

    loadMapLayer(layer) {
        const map = document.getElementById('weatherMap');
        map.innerHTML = `<div class="map-placeholder">
            <i class="fas fa-map"></i>
            <p>Loading ${layer} layer...</p>
        </div>`;
        setTimeout(() => {
            map.innerHTML = `<iframe src="https://embed.windy.com/embed2.html?layer=${layer}&lat=20&lon=78&zoom=4" width="100%" height="400" frameborder="0"></iframe>`;
        }, 1000);
    }

    toggleMapFullscreen() {
        this.mapSection.classList.toggle('fullscreen');
    }

    toggleMapAnimation() {
        const btn = this.playAnimation.querySelector('i');
        if (btn.classList.contains('fa-play')) {
            btn.classList.remove('fa-play');
            btn.classList.add('fa-pause');
            this.startMapAnimation();
        } else {
            btn.classList.remove('fa-pause');
            btn.classList.add('fa-play');
            this.stopMapAnimation();
        }
    }

    startMapAnimation() {
        this.mapAnimationInterval = setInterval(() => {
            this.timeSlider.value = (parseInt(this.timeSlider.value) + 10) % 100;
            this.updateMapTime();
        }, 500);
    }

    stopMapAnimation() {
        clearInterval(this.mapAnimationInterval);
    }

    updateMapTime() {
        document.getElementById('timeCurrent').textContent = `+${this.timeSlider.value}m`;
    }

    // === Voice Search ===
    startVoiceSearch() {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Voice search not supported in this browser.');
            return;
        }
        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'en-US';
        recognition.start();
        recognition.onresult = event => {
            this.cityInput.value = event.results[0][0].transcript;
            this.searchWeather();
        };
    }

    // === Unit Toggle ===
    toggleUnits() {
        if (this.units === 'metric') {
            this.units = 'imperial';
        } else if (this.units === 'imperial') {
            this.units = 'standard';
        } else {
            this.units = 'metric';
        }
        this.unitToggle.classList.toggle('active');
        this.searchWeather(this.activeCity);
    }

    updateDateTime() {
        const now = new Date();
        document.getElementById('lastUpdated').textContent = now.toLocaleTimeString();
    }

    showLoading() {
        this.loadingSpinner.classList.remove('hidden');
    }

    hideLoading() {
        this.loadingSpinner.classList.add('hidden');
    }

    showError(message) {
        document.getElementById('errorDescription').textContent = message;
        this.errorMessage.classList.remove('hidden');
    }

    hideError() {
        this.errorMessage.classList.add('hidden');
    }
}

// === Initialize Weather Dashboard on DOM Load ===
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new WeatherDashboard();
    dashboard.initMapControls();
});
