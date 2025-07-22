# Weather Dashboard Pro

An advanced weather dashboard that provides **real-time weather data**, **5-day forecasts**, **air quality index (AQI)**, and **interactive charts**, powered by the OpenWeather API.

![Weather Dashboard Screenshot](https://via.placeholder.com/1200x600?text=Weather+Dashboard+Pro)

---

## Features
- **Real-time current weather** for any city
- **5-day forecast with 3-hour intervals**
- **Air Quality Index (AQI) with PM2.5, PM10, NO₂, and O₃ readings**
- **Interactive temperature & precipitation charts** (Chart.js)
- **Quick search and voice search**
- **Favorites panel** for saving preferred cities
- **Weather alerts handling**
- **Responsive design with dark/light mode**

---

## Tech Stack
- **Frontend**: HTML5, CSS3, JavaScript, Chart.js
- **Backend**: Node.js, Express, Axios
- **API**: OpenWeatherMap (Weather, Forecast, Air Pollution, Alerts)
- **Hosting**: Render

---

## Live Demo
[https://your-weather-app.onrender.com](https://your-weather-app.onrender.com)

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- An [OpenWeatherMap API key](https://openweathermap.org/)

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/weather-dashboard-pro.git
cd weather-dashboard-pro

# Install dependencies
npm install

# Create an .env file with your API key
echo "OPENWEATHER_API_KEY=your_api_key_here" > .env

# Start the server
npm start
