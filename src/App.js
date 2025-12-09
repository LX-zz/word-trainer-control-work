import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // Состояния приложения
  const [words, setWords] = useState([]);
  const [currentWord, setCurrentWord] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newWord, setNewWord] = useState({
    word: '',
    translation: '',
    example: '',
    tags: ''
  });
  const [filterTag, setFilterTag] = useState('');

  // Базовая URL для API (ваш Express сервер на порту 3000)
  const API_URL = 'http://localhost:3000/api';

  // Загрузить все слова
  const loadWords = async () => {
    try {
      const url = filterTag ? `${API_URL}/words?tag=${filterTag}` : `${API_URL}/words`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setWords(data.data);
      }
    } catch (error) {
      console.error('Ошибка загрузки слов:', error);
      alert('Не удалось загрузить слова. Убедитесь, что Express сервер запущен на порту 3000');
    }
  };

  // Загрузить статистику
  const loadStats = async () => {
    try {
      const response = await fetch(`${API_URL}/stats`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    }
  };

  // Получить случайное слово для тренировки
  const getRandomWord = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/words/random`);
      const data = await response.json();
      
      if (data.success) {
        setCurrentWord({
          ...data.data,
          showTranslation: false
        });
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Ошибка получения случайного слова:', error);
    } finally {
      setLoading(false);
    }
  };

  // Добавить новое слово
  const addWord = async (e) => {
    e.preventDefault();
    
    if (!newWord.word || !newWord.translation) {
      alert('Заполните слово и перевод');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/words`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word: newWord.word,
          translation: newWord.translation,
          example: newWord.example,
          tags: newWord.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Слово добавлено!');
        setNewWord({ word: '', translation: '', example: '', tags: '' });
        loadWords();
        loadStats();
      }
    } catch (error) {
      console.error('Ошибка добавления слова:', error);
    }
  };

  // Отметить слово как выученное
  const markAsLearned = async (id) => {
    try {
      const response = await fetch(`${API_URL}/words/${id}/learned`, {
        method: 'PUT'
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Слово отмечено как выученное!');
        setCurrentWord(null);
        loadWords();
        loadStats();
      }
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  // Удалить слово
  const deleteWord = async (id) => {
    if (!window.confirm('Удалить слово?')) return;
    
    try {
      const response = await fetch(`${API_URL}/words/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Слово удалено!');
        loadWords();
        loadStats();
      }
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  // Инициализация при загрузке
  useEffect(() => {
    loadWords();
    loadStats();
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>📚 Тренажёр слов - Контрольная работа</h1>
        <p>Express.js + React приложение для изучения иностранных слов</p>
      </header>

      <main className="container">
        {/* Статистика */}
        <div className="stats-section">
          <h2>📊 Статистика</h2>
          {stats ? (
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">Всего слов:</span>
                <span className="stat-value">{stats.totalWords}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Выучено:</span>
                <span className="stat-value">{stats.learnedWords}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Прогресс:</span>
                <span className="stat-value">{stats.learningProgress}%</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Тренировок:</span>
                <span className="stat-value">{stats.totalPracticeCount}</span>
              </div>
            </div>
          ) : (
            <p>Загрузка статистики...</p>
          )}
          <button onClick={() => { loadStats(); loadWords(); }} className="btn">
            Обновить
          </button>
        </div>

        {/* Тренировка */}
        <div className="practice-section">
          <h2>💪 Тренировка</h2>
          {currentWord ? (
            <div className="word-card">
              <h3>{currentWord.word}</h3>
              {currentWord.showTranslation ? (
                <>
                  <p className="translation">{currentWord.translation}</p>
                  {currentWord.example && <p>Пример: {currentWord.example}</p>}
                  <div className="tags">
                    {currentWord.tags.map((tag, i) => (
                      <span key={i} className="tag">{tag}</span>
                    ))}
                  </div>
                  <div className="actions">
                    <button 
                      onClick={() => markAsLearned(currentWord.id)}
                      className="btn btn-success"
                    >
                      ✓ Выучено
                    </button>
                    <button 
                      onClick={() => setCurrentWord({...currentWord, showTranslation: false})}
                      className="btn"
                    >
                      Скрыть
                    </button>
                  </div>
                </>
              ) : (
                <button 
                  onClick={() => setCurrentWord({...currentWord, showTranslation: true})}
                  className="btn btn-primary"
                >
                  Показать перевод
                </button>
              )}
            </div>
          ) : (
            <p>Нажмите кнопку для получения слова</p>
          )}
          <button 
            onClick={getRandomWord} 
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Загрузка...' : '🎲 Случайное слово'}
          </button>
        </div>

        {/* Добавление слова */}
        <div className="add-section">
          <h2>➕ Добавить слово</h2>
          <form onSubmit={addWord}>
            <input
              type="text"
              placeholder="Слово (англ.) *"
              value={newWord.word}
              onChange={(e) => setNewWord({...newWord, word: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Перевод *"
              value={newWord.translation}
              onChange={(e) => setNewWord({...newWord, translation: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Пример"
              value={newWord.example}
              onChange={(e) => setNewWord({...newWord, example: e.target.value})}
            />
            <input
              type="text"
              placeholder="Теги (через запятую)"
              value={newWord.tags}
              onChange={(e) => setNewWord({...newWord, tags: e.target.value})}
            />
            <button type="submit" className="btn btn-secondary">
              Добавить
            </button>
          </form>
        </div>

        {/* Список слов */}
        <div className="words-section">
          <h2>📖 Все слова</h2>
          <div className="filter">
            <input
              type="text"
              placeholder="Фильтр по тегу"
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
            />
            <button onClick={loadWords} className="btn">
              Применить
            </button>
            <button onClick={() => { setFilterTag(''); loadWords(); }} className="btn">
              Сбросить
            </button>
          </div>
          
          {words.length === 0 ? (
            <p>Слов не найдено</p>
          ) : (
            <div className="words-grid">
              {words.map(word => (
                <div key={word.id} className={`word-item ${word.learned ? 'learned' : ''}`}>
                  <h4>{word.word} - {word.translation}</h4>
                  {word.example && <p className="example">{word.example}</p>}
                  <div className="tags">
                    {word.tags.map((tag, i) => (
                      <span key={i} className="tag">{tag}</span>
                    ))}
                  </div>
                  <div className="word-info">
                    <span>Тренировок: {word.practiceCount}</span>
                    <button 
                      onClick={() => deleteWord(word.id)}
                      className="btn-small"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <p>Контрольная работа №5 - Express.js + React приложение</p>
        <div className="api-info">
          <p><strong>API endpoints:</strong></p>
          <code>GET /api/words</code> | 
          <code>GET /api/words/random</code> | 
          <code>POST /api/words</code> | 
          <code>GET /api/stats</code>
        </div>
      </footer>
    </div>
  );
}

export default App;