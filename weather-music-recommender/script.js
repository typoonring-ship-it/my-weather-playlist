// SkyTunes Weather-based Song Recommender Logic

// 1. 날씨별 노래 데이터베이스 구축
const songDatabase = {
    "Clear": [
        { title: "1979", artist: "The Smashing Pumpkins" },
        { title: "Heaven knows I`m miserable now", artist: "The Smiths" },
        { title: "All You Need Is Love", artist: "The Beatles" },
        { title: "Fly Me To The Moon", artist: "Frank Sinatra" },
        { title: "What A Wonderful World", artist: "Louis Armstrong" }
    ],
    "Rain": [
        { title: "Fake Plastic Trees", artist: "Radiohead" },
        { title: "가시나무", artist: "시인과 촌장" },
        { title: "Underwater", artist: "dosii(도시)" },
        { title: "Over The Rainbow", artist: "Judy Garland" },
        { title: "Feels So Good", artist: "Chuck Mangione" }
    ],
    "Clouds": [
        { title: "Present Tense", artist: "Radiohead" },
        { title: "High Hopes", artist: "Pink Floyd" },
        { title: "Do I Wanna Know?", artist: "Arctic Monkeys" },
        { title: "Grey Room", artist: "Damien Rice" },
        { title: "Flin; Fig From France", artist: "검정치마" }
    ],
    "Snow": [
        { title: "가장 보통의 존재", artist: "언니네 이발관" },
        { title: "눈", artist: "이상의 날개" },
        { title: "Delicate", artist: "Damien Rice" },
        { title: "Nude", artist: "Radiohead" },
        { title: "잊어야 한다는 마음으로", artist: "김광석" }
    ],
    "Thunderstorm": [
        { title: "The National Anthem", artist: "Radiohead" },
        { title: "Children Of Sanchez", artist: "Chuck Mangione" }
    ],
    "Fallback": [
        { title: "What A Wonderful World", artist: "Louis Armstrong" },
        { title: "Feels So Good", artist: "Chuck Mangione" },
        { title: "Delicate", artist: "Damien Rice" }
    ]
};

// DOM Elements
const body = document.body;
const locationNameEl = document.getElementById("location-name");
const weatherIconWrapper = document.getElementById("weather-icon-wrapper");
const weatherTempEl = document.getElementById("weather-temp");
const weatherDescEl = document.getElementById("weather-desc");
const songTitleEl = document.getElementById("song-title");
const songArtistEl = document.getElementById("song-artist");
const vinylDisc = document.getElementById("vinyl-disc");
const weatherBadge = document.getElementById("weather-badge");
const btnReroll = document.getElementById("btn-reroll");
const btnRefreshLocation = document.getElementById("btn-refresh-location");
const linkYoutube = document.getElementById("link-youtube");
const linkSpotify = document.getElementById("link-spotify");

// State Variables
let currentCategory = "Fallback";
let lastSong = null;

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
    fetchWeatherAndRecommend();
    
    // Event Listeners
    btnReroll.addEventListener("click", () => {
        recommendSong(currentCategory);
        // Spin vinyl briefly on click
        vinylDisc.style.transform = "scale(0.9)";
        setTimeout(() => {
            vinylDisc.style.transform = "scale(1)";
        }, 150);
    });
    
    btnRefreshLocation.addEventListener("click", () => {
        locationNameEl.innerHTML = `<i class="fa-solid fa-location-dot"></i> 위치 찾는 중...`;
        weatherIconWrapper.innerHTML = `<div class="loader-spinner"></div>`;
        weatherTempEl.textContent = "--°C";
        weatherDescEl.textContent = "날씨 정보를 읽어오는 중...";
        
        // Reset vinyl animations
        vinylDisc.classList.remove("playing");
        songTitleEl.textContent = "추천 중...";
        songArtistEl.textContent = "잠시만 기다려 주세요";
        
        fetchWeatherAndRecommend();
    });
});

// Fetch Location & Weather
function fetchWeatherAndRecommend() {
    // Geolocation API check
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                locationNameEl.innerHTML = `<i class="fa-solid fa-location-dot"></i> 현재 내 위치`;
                getWeatherData(lat, lon);
            },
            (error) => {
                console.warn("위치 정보를 가져올 수 없습니다. 서울 기준으로 날씨를 조회합니다.", error);
                locationNameEl.innerHTML = `<i class="fa-solid fa-location-dot"></i> 서울 (기본값)`;
                // Default to Seoul coordinates
                getWeatherData(37.5665, 126.9780);
            },
            { timeout: 8000 }
        );
    } else {
        locationNameEl.innerHTML = `<i class="fa-solid fa-location-dot"></i> 서울 (기본값)`;
        getWeatherData(37.5665, 126.9780);
    }
}

// Fetch weather from Open-Meteo API
async function getWeatherData(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,temperature_2m&timezone=auto`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("API 요청 실패");
        
        const data = await response.json();
        const weatherCode = data.current.weather_code;
        const temp = Math.round(data.current.temperature_2m);
        
        // Match Weather Category
        currentCategory = getWeatherCategory(weatherCode);
        
        // Update Weather UI
        updateWeatherUI(currentCategory, weatherCode, temp);
        
        // Recommend Song
        recommendSong(currentCategory);
        
    } catch (error) {
        console.error("날씨 정보 파싱 에러:", error);
        // Fallback state
        currentCategory = "Fallback";
        updateWeatherUI("Fallback", null, "--");
        recommendSong("Fallback");
    }
}

// Map WMO Code to weather category
function getWeatherCategory(code) {
    if (code === 0) {
        return "Clear";
    } else if ([1, 2, 3, 45, 48].includes(code)) {
        return "Clouds";
    } else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
        return "Rain";
    } else if ([71, 73, 75, 77, 85, 86].includes(code)) {
        return "Snow";
    } else if ([95, 96, 99].includes(code)) {
        return "Thunderstorm";
    } else {
        return "Clouds"; // Default fallback
    }
}

// Update UI (Theme colors, weather icons and descriptions)
function updateWeatherUI(category, code, temp) {
    // 1. Update Body Theme Class
    body.className = ""; // clear all
    
    const themeMap = {
        "Clear": "sunny",
        "Clouds": "cloudy",
        "Rain": "rainy",
        "Snow": "snowy",
        "Thunderstorm": "rainy",
        "Fallback": "default"
    };
    body.classList.add(`theme-${themeMap[category] || "default"}`);
    
    // 2. Set Badges
    const badgeText = {
        "Clear": "Clear Sky ☀️",
        "Clouds": "Cloudy Sky ☁️",
        "Rain": "Rainy Day 🌧️",
        "Snow": "Snowy Day ❄️",
        "Thunderstorm": "Thunderstorm ⚡",
        "Fallback": "SkyTunes 🎵"
    };
    weatherBadge.textContent = badgeText[category] || "SkyTunes";
    
    // 3. Set Temp & Description
    weatherTempEl.textContent = temp !== "--" ? `${temp}°C` : "--°C";
    
    // Get Icon & Korean Weather description
    let iconHTML = "";
    let descText = "";
    
    switch (code) {
        case 0:
            iconHTML = `<i class="fa-solid fa-sun" style="color: #ff9f43; animation: spin 20s linear infinite;"></i>`;
            descText = "맑음";
            break;
        case 1:
        case 2:
            iconHTML = `<i class="fa-solid fa-cloud-sun" style="color: #f5cd79;"></i>`;
            descText = "구름 조금";
            break;
        case 3:
            iconHTML = `<i class="fa-solid fa-cloud" style="color: #b2bec3;"></i>`;
            descText = "흐림";
            break;
        case 45:
        case 48:
            iconHTML = `<i class="fa-solid fa-smog" style="color: #cbd5e1;"></i>`;
            descText = "안개";
            break;
        case 51:
        case 53:
        case 55:
        case 56:
        case 57:
            iconHTML = `<i class="fa-solid fa-cloud-rain" style="color: #70a1ff;"></i>`;
            descText = "이슬비";
            break;
        case 61:
        case 63:
        case 65:
            iconHTML = `<i class="fa-solid fa-cloud-showers-heavy" style="color: #54a0ff;"></i>`;
            descText = "비";
            break;
        case 66:
        case 67:
            iconHTML = `<i class="fa-solid fa-cloud-meatball" style="color: #70a1ff;"></i>`;
            descText = "얼어붙는 비";
            break;
        case 71:
        case 73:
        case 75:
        case 77:
            iconHTML = `<i class="fa-solid fa-snowflake" style="color: #74b9ff; animation: pulse 2s infinite alternate;"></i>`;
            descText = "눈";
            break;
        case 80:
        case 81:
        case 82:
            iconHTML = `<i class="fa-solid fa-cloud-showers-water" style="color: #2e86de;"></i>`;
            descText = "소나기";
            break;
        case 85:
        case 86:
            iconHTML = `<i class="fa-solid fa-snowflake" style="color: #a55eee;"></i>`;
            descText = "소낙눈";
            break;
        case 95:
        case 96:
        case 99:
            iconHTML = `<i class="fa-solid fa-cloud-bolt" style="color: #feca57;"></i>`;
            descText = "천둥번개";
            break;
        default:
            iconHTML = `<i class="fa-solid fa-music" style="color: var(--primary-color);"></i>`;
            descText = "기분 좋은 날";
    }
    
    if (category === "Fallback") {
        iconHTML = `<i class="fa-solid fa-triangle-exclamation" style="color: #ff9f43;"></i>`;
        descText = "연결 지연";
    }
    
    weatherIconWrapper.innerHTML = iconHTML;
    weatherDescEl.textContent = descText;
}

// Select a random song from Category
function recommendSong(category) {
    const list = songDatabase[category] || songDatabase["Fallback"];
    
    // Choose songs randomly and make sure it doesn't match the last one (if list size > 1)
    let selectedSong;
    if (list.length > 1) {
        do {
            const randomIndex = Math.floor(Math.random() * list.length);
            selectedSong = list[randomIndex];
        } while (lastSong && selectedSong.title === lastSong.title);
    } else {
        selectedSong = list[0];
    }
    
    lastSong = selectedSong;
    
    // Update Song UI
    songTitleEl.textContent = selectedSong.title;
    songArtistEl.textContent = selectedSong.artist;
    
    // Update External Search Links
    const query = encodeURIComponent(`${selectedSong.artist} ${selectedSong.title}`);
    linkYoutube.href = `https://www.youtube.com/results?search_query=${query}`;
    linkSpotify.href = `https://open.spotify.com/search/${query}`;
    
    // Activate Vinyl Spinning & Music Waves
    vinylDisc.classList.add("playing");
}
