# Weather Dashboard Pro

An advanced weather dashboard that provides **real-time weather data**, **5-day forecasts**, **air quality index (AQI)**, and **interactive charts**, powered by the OpenWeather API.

<img width="1795" height="951" alt="Screenshot 2025-07-22 204315" src="https://github.com/user-attachments/assets/8d07fc9f-2db1-450c-960d-28c1cb083a81" />


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

## Technologies Used

###  Frontend
- **HTML5**
- **CSS3** – with modern features like `backdrop-filter`
- **Vanilla JavaScript (ES6+)**
- **Responsive Layouts** – using CSS **Grid** and **Flexbox**

###  Backend
- **Node.js**
- **Express.js**
- **Axios** – for making HTTP requests
- **CORS** – to handle cross-origin requests
- **Environment Variables** – for secure configuration management

---

## Live Demo
([https://your-weather-app.onrender.com](https://weather-dashboard-pro.onrender.com/))

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
