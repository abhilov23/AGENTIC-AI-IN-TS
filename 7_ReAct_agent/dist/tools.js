import { tool } from "@openai/agents";
import { z } from "zod";
export const weatherTool = tool({
    name: "get_weather",
    description: "Get the current weather for a given location",
    parameters: z.object({
        city: z.string().describe("City name (e.g. London, New York, Delhi)"),
    }),
    execute: async ({ city }) => {
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
        const geo = await geoResponse.json();
        if (!geo.results || geo.results.length === 0) {
            throw new Error(`Could not find coordinates for city: ${city}`);
        }
        const location = geo.results[0];
        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`);
        const weather = await weatherResponse.json();
        const current = weather.current;
        return {
            city: location.name,
            country: location.country,
            temperature: `${current.temperature_2m} °C`,
            humidity: `${current.relative_humidity_2m}%`,
            windSpeed: `${current.wind_speed_10m} km/h`,
            weatherCode: current.weather_code,
        };
    }
});
