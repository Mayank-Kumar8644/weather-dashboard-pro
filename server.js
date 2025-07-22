const express = require('express');
const cors = require('cors');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve frontend files

// Rate limiting: 100 requests per 15 minutes per IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Environment variables
const API_KEY = process.env.OPENWEATHER_API_KEY || 'YOUR_API_KEY_HERE';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const ONECALL_URL = 'https://api.openweathermap.org/data/3.0/onecall';

// Simple in-memory cache (expires in 5 minutes)
const cache = new Map();
function setCache(key, data) {
    cache.set(key, { data, timestamp: Date.now() });
}
function getCache(key) {
    const cached = cache.get(key);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > 5 * 60 * 1000) {
        cache.delete(key);
        return null;
    }
    return cached.data;
}

// Routes
app.get('/api/weather/:city', async (req, res) => {
    try {
        const { city } = req.params;
        const cacheKey = `weather-${city.toLowerCase()}`;
        const cached = getCache(cacheKey);
        if (cached) return res.json(cached);

        const response = await axios.get(`${BASE_URL}/weather`, {
            params: { q: city, appid: API_KEY, units: 'metric' }
        });
        setCache(cacheKey, response.data);
        res.json(response.data);
    } catch (error) {
        res.status(404).json({ error: 'City not found' });
    }
});

app.get('/api/forecast/:city', async (req, res) => {
    try {
        const { city } = req.params;
        const cacheKey = `forecast-${city.toLowerCase()}`;
        const cached = getCache(cacheKey);
        if (cached) return res.json(cached);

        const response = await axios.get(`${BASE_URL}/forecast`, {
            params: { q: city, appid: API_KEY, units: 'metric' }
        });
        setCache(cacheKey, response.data);
        res.json(response.data);
    } catch (error) {
        res.status(404).json({ error: 'Forecast data not found' });
    }
});

app.get('/api/airquality', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) return res.status(400).json({ error: 'Latitude and longitude are required' });

        const cacheKey = `aqi-${lat}-${lon}`;
        const cached = getCache(cacheKey);
        if (cached) return res.json(cached);

        const response = await axios.get(`${BASE_URL}/air_pollution`, {
            params: { lat, lon, appid: API_KEY }
        });
        setCache(cacheKey, response.data);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Air quality data fetch failed' });
    }
});

// Alerts endpoint (OneCall API)
// app.get('/api/alerts', async (req, res) => {
//     try {
//         const { lat, lon } = req.query;
//         if (!lat || !lon) return res.status(400).json({ error: 'Latitude and longitude are required' });

//         const cacheKey = `alerts-${lat}-${lon}`;
//         const cached = getCache(cacheKey);
//         if (cached) return res.json(cached);

//         const response = await axios.get(ONECALL_URL, {
//             params: { lat, lon, appid: API_KEY, exclude: 'current,minutely,hourly,daily' }
//         });
//         setCache(cacheKey, response.data);
//         res.json(response.data);
//     } catch (error) {
//         res.status(500).json({ error: 'Weather alerts fetch failed' });
//     }
// });
app.get('/api/alerts', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) return res.json({ alerts: [] });

        const cacheKey = `alerts-${lat}-${lon}`;
        const cached = getCache(cacheKey);
        if (cached) return res.json(cached);

        const response = await axios.get(ONECALL_URL, {
            params: { lat, lon, appid: API_KEY, exclude: 'current,minutely,hourly,daily' }
        });

        // If no alerts in data, send empty array
        const data = response.data;
        if (!data.alerts) {
            setCache(cacheKey, { alerts: [] });
            return res.json({ alerts: [] });
        }

        setCache(cacheKey, data);
        res.json(data);
    } catch (error) {
        console.warn('Alert fetch failed:', error.response?.data || error.message);
        // Return empty alerts instead of 500
        res.json({ alerts: [] });
    }
});



// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`Weather API server running on http://localhost:${PORT}`);
});
