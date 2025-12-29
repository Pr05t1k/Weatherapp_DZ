const express = require('express');
const app = express();
const PORT = 3000;

// Мидлвар для статических файлов
app.use(express.static('public'));
app.use(express.json());

// Массив для хранения городов (вместо БД)
let cities = [
  { id: 1, name: "Москва", temperature: "+5°C", weather: "облачно" },
  { id: 2, name: "Санкт-Петербург", temperature: "+3°C", weather: "дождь" },
  { id: 3, name: "Новосибирск", temperature: "-10°C", weather: "солнечно" }
];

// Главная страница
app.get('/', (req, res) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Погодное приложение</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .city { border: 1px solid #ddd; padding: 15px; margin: 10px; border-radius: 5px; }
            .sunny { background-color: #fff8e1; }
            .cloudy { background-color: #f5f5f5; }
            .rainy { background-color: #e3f2fd; }
        </style>
    </head>
    <body>
        <h1>🌤️ Погодное приложение</h1>
        
        <h2>Добавить новый город:</h2>
        <form id="addCityForm">
            <input type="text" id="cityName" placeholder="Название города" required>
            <input type="text" id="cityTemp" placeholder="Температура" required>
            <select id="cityWeather">
                <option value="солнечно">Солнечно</option>
                <option value="облачно">Облачно</option>
                <option value="дождь">Дождь</option>
            </select>
            <button type="submit">Добавить</button>
        </form>
        
        <h2>Текущая погода:</h2>
        <div id="cities"></div>
        
        <script>
            // Загружаем города при загрузке страницы
            async function loadCities() {
                const response = await fetch('/api/cities');
                const cities = await response.json();
                displayCities(cities);
            }
            
            // Отображаем города
            function displayCities(cities) {
                const container = document.getElementById('cities');
                container.innerHTML = cities.map(city => \`
                    <div class="city \${getWeatherClass(city.weather)}">
                        <h3>🏙️ \${city.name}</h3>
                        <p><strong>Температура:</strong> \${city.temperature}</p>
                        <p><strong>Погода:</strong> \${city.weather}</p>
                        <button onclick="deleteCity(\${city.id})">Удалить</button>
                    </div>
                \`).join('');
            }
            
            // Класс для погоды
            function getWeatherClass(weather) {
                if (weather === 'солнечно') return 'sunny';
                if (weather === 'облачно') return 'cloudy';
                if (weather === 'дождь') return 'rainy';
                return '';
            }
            
            // Удаление города
            async function deleteCity(id) {
                await fetch(\`/api/cities/\${id}\`, { method: 'DELETE' });
                loadCities();
            }
            
            // Добавление города
            document.getElementById('addCityForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const newCity = {
                    name: document.getElementById('cityName').value,
                    temperature: document.getElementById('cityTemp').value,
                    weather: document.getElementById('cityWeather').value
                };
                
                await fetch('/api/cities', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newCity)
                });
                
                // Очищаем форму
                e.target.reset();
                loadCities();
            });
            
            // Загружаем города при старте
            loadCities();
        </script>
    </body>
    </html>
  `);
});

// API: Получить все города
app.get('/api/cities', (req, res) => {
  res.json(cities);
});

// API: Добавить город
app.post('/api/cities', (req, res) => {
  const newCity = {
    id: cities.length + 1,
    name: req.body.name,
    temperature: req.body.temperature,
    weather: req.body.weather
  };
  cities.push(newCity);
  res.json(newCity);
});

// API: Удалить город
app.delete('/api/cities/:id', (req, res) => {
  const id = parseInt(req.params.id);
  cities = cities.filter(city => city.id !== id);
  res.json({ message: 'Город удален' });
});

// API: Получить погоду по городу
app.get('/api/weather/:city', (req, res) => {
  const city = cities.find(c => 
    c.name.toLowerCase() === req.params.city.toLowerCase()
  );
  
  if (city) {
    res.json(city);
  } else {
    // Если город не найден, генерируем случайную погоду
    const temps = ["-15°C", "-5°C", "+2°C", "+10°C", "+20°C"];
    const weathers = ["солнечно", "облачно", "дождь", "снег"];
    res.json({
      name: req.params.city,
      temperature: temps[Math.floor(Math.random() * temps.length)],
      weather: weathers[Math.floor(Math.random() * weathers.length)]
    });
  }
});

// Статус приложения
app.get('/api/status', (req, res) => {
  res.json({
    status: 'OK',
    version: '1.0',
    citiesCount: cities.length,
    timestamp: new Date().toLocaleString()
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`✅ Приложение запущено на http://localhost:${PORT}`);
  console.log(`📌 Основные эндпоинты:`);
  console.log(`   http://localhost:${PORT}/ - Главная страница`);
  console.log(`   http://localhost:${PORT}/api/cities - Все города`);
  console.log(`   http://localhost:${PORT}/api/status - Статус`);
  console.log(`   http://localhost:${PORT}/api/weather/Москва - Погода в городе`);
});
//экспорт приложения
module.exports = server;