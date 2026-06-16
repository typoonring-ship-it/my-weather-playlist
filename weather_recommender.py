import random
import requests

# 1. web에서 날씨 정보 불러오기 - 날씨 상태 API 설정하고 요청하기
def get_weather():
    # 서울의 위도(Latitude)와 경도(Longitude) 설정
    lat = 37.5665
    lon = 126.9780
    
    # Open-Meteo 무료 API 사용 (API Key가 필요 없어 누구나 즉시 실행 가능)
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=weather_code,temperature_2m&timezone=Asia/Seoul"
    
    try:
        response = requests.get(url, timeout=5)
        # HTTP 에러가 발생한 경우 예외 발생
        response.raise_for_status()
        data = response.json()
        
        # WMO 날씨 코드를 가져옴
        weather_code = data["current"]["weather_code"]
        temp = data["current"]["temperature_2m"]
        return weather_code, temp
    except Exception as e:
        # 2. 예외 케이스(날씨 정보 불러오는 데 실패)의 경우
        print(f"[경고] 날씨 정보를 가져오는 데 실패했습니다: {e}")
        return None, None

# 3. 날씨별 노래 데이터베이스 만들기
song_database = {
    "Clear": [
        {"title": "1979", "artist": "The Smashing Pumpkins"},
        {"title": "Heaven knows I`m miserable now", "artist": "The Smiths"},
        {"title": "All You Need Is Love", "artist": "The Beatles"},
        {"title": "Fly Me To The Moon", "artist": "Frank Sinatra"},
        {"title": "What A Wonderful World", "artist": "Louis Armstrong"}
    ],
    "Rain": [
        {"title": "Fake Plastic Trees", "artist": "Radiohead"},
        {"title": "가시나무", "artist": "시인과 촌장"},
        {"title": "Underwater", "artist": "dosii(도시)"},
        {"title": "Over The Rainbow", "artist": "Judy Garland"},
        {"title": "Feels So Good", "artist": "Chuck Mangione"}
    ],
    "Clouds": [
        {"title": "Present Tense", "artist": "Radiohead"},
        {"title": "High Hopes", "artist": "Pink Floyd"},
        {"title": "Do I Wanna Know?", "artist": "Arctic Monkeys"},
        {"title": "Grey Room", "artist": "Damien Rice"},
        {"title": "Flin; Fig From France", "artist": "검정치마"}
    ],
    "Snow": [
        {"title": "가장 보통의 존재", "artist": "언니네 이발관"},
        {"title": "눈", "artist": "이상의 날개"},
        {"title": "Delicate", "artist": "Damien Rice"},
        {"title": "Nude", "artist": "Radiohead"},
        {"title": "잊어야 한다는 마음으로", "artist": "김광석"}
    ],
    "Thunderstorm": [
        {"title": "The National Anthem", "artist": "Radiohead"},
        {"title": "Children Of Sanchez", "artist": "Chuck Mangione"}
    ],
    "Fallback": [
        {"title": "What A Wonderful World", "artist": "Louis Armstrong"},
        {"title": "Feels So Good", "artist": "Chuck Mangione"},
        {"title": "Delicate", "artist": "Damien Rice"}
    ]
}

# 4. 불러온 날씨 상태 정보에 맞는 날씨별 노래 데이터베이스 매칭하는 함수 만들기
def get_weather_category(weather_code):
    if weather_code is None:
        return "Fallback"
    
    # WMO Weather Codes 매핑
    # 0: 맑음
    # 1, 2, 3: 구름 조금, 흐림
    # 45, 48: 안개
    # 51-67, 80-82: 비/소나기
    # 71-77, 85-86: 눈
    # 95-99: 번개/폭풍우
    
    if weather_code == 0:
        return "Clear"
    elif weather_code in [1, 2, 3, 45, 48]:
        return "Clouds"
    elif weather_code in [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82]:
        return "Rain"
    elif weather_code in [71, 73, 75, 77, 85, 86]:
        return "Snow"
    elif weather_code in [95, 96, 99]:
        return "Thunderstorm"
    else:
        return "Clouds"  # 기본값

# 5. 날씨별 노래 데이터베이스 중 한 곡을 랜덤으로 추천 및 프로그램 실행
def run_recommender():
    print("=" * 50)
    print("      🌦️  실시간 날씨 기반 노래 추천 서비스  🎶")
    print("=" * 50)
    
    weather_code, temp = get_weather()
    category = get_weather_category(weather_code)
    
    # 카테고리에 맞는 노래 목록 가져오기
    songs = song_database.get(category, song_database["Fallback"])
    # 6. 한 곡을 랜덤으로 추천
    recommended_song = random.choice(songs)
    
    # 결과 출력
    if weather_code is not None:
        weather_desc = {
            "Clear": "맑음 ☀️",
            "Clouds": "흐림/안개 ☁️",
            "Rain": "비/소나기 🌧️",
            "Snow": "눈 ❄️",
            "Thunderstorm": "천둥번개 ⚡"
        }.get(category, "흐림 ☁️")
        
        print(f"📍 현재 서울 날씨: {weather_desc} (온도: {temp}°C)")
    else:
        print("📍 날씨 정보를 읽어오지 못해 기분 좋은 추천 곡을 준비했습니다.")
        
    print(f"🎵 오늘 날씨에 딱 맞는 추천 곡:")
    print(f"   ▶ 『 {recommended_song['title']} 』 - {recommended_song['artist']}")
    print("=" * 50)

if __name__ == "__main__":
    run_recommender()
