
const state = {
    currentWord: null,
    searchHistory: [],
    favorites: [],
    wordOfTheDay: null,
    trendingWords: ['serendipity', 'ephemeral', 'melancholy', 'eloquent', 'luminous', 'resilience'],
    isLoading: false,
    isDarkMode: false,
    isListening: false
};


const elements = {
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    clearBtn: document.getElementById('clearBtn'),
    voiceBtn: document.getElementById('voiceBtn'),
    themeToggle: document.getElementById('themeToggle'),
    historyBtn: document.getElementById('historyBtn'),
    favoritesBtn: document.getElementById('favoritesBtn'),
    historyDropdown: document.getElementById('historyDropdown'),
    favoritesDropdown: document.getElementById('favoritesDropdown'),
    historyList: document.getElementById('historyList'),
    favoritesList: document.getElementById('favoritesList'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    clearFavoritesBtn: document.getElementById('clearFavoritesBtn'),
    favoritesBadge: document.getElementById('favoritesBadge'),
    wordCount: document.getElementById('wordCount'),
    wotdBanner: document.getElementById('wotdBanner'),
    wotdWord: document.getElementById('wotdWord'),
    wotdExplore: document.getElementById('wotdExplore'),
    trendingTags: document.getElementById('trendingTags'),
    loadingState: document.getElementById('loadingState'),
    errorState: document.getElementById('errorState'),
    resultsContent: document.getElementById('resultsContent'),
    wordTitle: document.getElementById('wordTitle'),
    phoneticSection: document.getElementById('phoneticSection'),
    meaningsSection: document.getElementById('meaningsSection'),
    wordStatsCard: document.getElementById('wordStatsCard'),
    wordGamesSection: document.getElementById('wordGamesSection'),
    sourceSection: document.getElementById('sourceSection'),
    errorTitle: document.getElementById('errorTitle'),
    errorMessage: document.getElementById('errorMessage'),
    favoriteStarBtn: document.getElementById('favoriteStarBtn'),
    scrambledWord: document.getElementById('scrambledWord'),
    revealScrambleBtn: document.getElementById('revealScrambleBtn'),
    rhymeList: document.getElementById('rhymeList')
};


function init() {
    loadThemePreference();
    loadSearchHistory();
    loadFavorites();
    loadWordOfTheDay();
    renderTrendingWords();
    updateStats();
    attachEventListeners();
    
    
    elements.searchInput.focus();
}


function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        state.isDarkMode = true;
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

function toggleTheme() {
    state.isDarkMode = !state.isDarkMode;
    
    if (state.isDarkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
    }
}


function loadSearchHistory() {
    const history = localStorage.getItem('searchHistory');
    if (history) {
        state.searchHistory = JSON.parse(history);
    }
}

function saveSearchHistory() {
    localStorage.setItem('searchHistory', JSON.stringify(state.searchHistory));
}

function addToHistory(word) {
    
    state.searchHistory = state.searchHistory.filter(item => item !== word);
    
    
    state.searchHistory.unshift(word);
    
    
    if (state.searchHistory.length > 20) {
        state.searchHistory = state.searchHistory.slice(0, 20);
    }
    
    saveSearchHistory();
}

function clearHistory() {
    state.searchHistory = [];
    localStorage.removeItem('searchHistory');
    renderHistory();
}

function renderHistory() {
    if (state.searchHistory.length === 0) {
        elements.historyList.innerHTML = `
            <div class="history-empty">
                <p>No search history yet</p>
            </div>
        `;
        return;
    }
    
    elements.historyList.innerHTML = state.searchHistory
        .map(word => `
            <div class="history-item" data-word="${word}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                </svg>
                <span>${word}</span>
            </div>
        `)
        .join('');
    
    
    document.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => {
            const word = item.getAttribute('data-word');
            elements.searchInput.value = word;
            closeHistoryDropdown();
            searchWord();
        });
    });
}

function toggleHistoryDropdown() {
    elements.historyDropdown.classList.toggle('show');
    renderHistory();
}

function closeHistoryDropdown() {
    elements.historyDropdown.classList.remove('show');
}


function loadFavorites() {
    const favorites = localStorage.getItem('favorites');
    if (favorites) {
        state.favorites = JSON.parse(favorites);
    }
}

function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(state.favorites));
}

function toggleFavorite(word) {
    const index = state.favorites.indexOf(word);
    
    if (index > -1) {
       
        state.favorites.splice(index, 1);
    } else {
       
        state.favorites.push(word);
    }
    
    saveFavorites();
    updateFavoriteButton();
    updateStats();
}

function clearFavorites() {
    state.favorites = [];
    localStorage.removeItem('favorites');
    renderFavorites();
    updateStats();
    updateFavoriteButton();
}

function renderFavorites() {
    if (state.favorites.length === 0) {
        elements.favoritesList.innerHTML = `
            <div class="history-empty">
                <p>No favorite words yet</p>
            </div>
        `;
        return;
    }
    
    elements.favoritesList.innerHTML = state.favorites
        .map(word => `
            <div class="history-item" data-word="${word}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span>${word}</span>
            </div>
        `)
        .join('');
    
   
    document.querySelectorAll('#favoritesList .history-item').forEach(item => {
        item.addEventListener('click', () => {
            const word = item.getAttribute('data-word');
            elements.searchInput.value = word;
            closeFavoritesDropdown();
            searchWord();
        });
    });
}

function toggleFavoritesDropdown() {
    elements.favoritesDropdown.classList.toggle('show');
    elements.historyDropdown.classList.remove('show');
    renderFavorites();
}

function closeFavoritesDropdown() {
    elements.favoritesDropdown.classList.remove('show');
}

function updateFavoriteButton() {
    if (state.currentWord && state.favorites.includes(state.currentWord.word)) {
        elements.favoriteStarBtn.classList.add('active');
    } else {
        elements.favoriteStarBtn.classList.remove('active');
    }
}


function loadWordOfTheDay() {
    
    const savedWotd = localStorage.getItem('wotd');
    const savedDate = localStorage.getItem('wotdDate');
    const today = new Date().toDateString();
    
    if (savedWotd && savedDate === today) {
        state.wordOfTheDay = savedWotd;
        elements.wotdWord.textContent = savedWotd;
    } else {
        
        const words = ['serendipity', 'ephemeral', 'luminous', 'eloquent', 'melancholy', 
                       'resilience', 'pristine', 'ethereal', 'sonorous', 'ebullient'];
        const randomWord = words[Math.floor(Math.random() * words.length)];
        state.wordOfTheDay = randomWord;
        elements.wotdWord.textContent = randomWord;
        localStorage.setItem('wotd', randomWord);
        localStorage.setItem('wotdDate', today);
    }
}


function renderTrendingWords() {
    elements.trendingTags.innerHTML = state.trendingWords
        .map(word => `<span class="trending-tag" onclick="searchFromTag('${word}')">${word}</span>`)
        .join('');
}


function updateStats() {
    // Update word count
    elements.wordCount.textContent = state.searchHistory.length;
    
    // Update favorites badge
    if (state.favorites.length > 0) {
        elements.favoritesBadge.textContent = state.favorites.length;
        elements.favoritesBadge.classList.add('show');
    } else {
        elements.favoritesBadge.classList.remove('show');
    }
}


function startVoiceSearch() {
   
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Voice search is not supported in your browser. Please try Chrome, Edge, or Safari.');
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
        state.isListening = true;
        elements.voiceBtn.classList.add('listening');
    };
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        elements.searchInput.value = transcript;
        elements.clearBtn.classList.add('show');
        searchWord();
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        state.isListening = false;
        elements.voiceBtn.classList.remove('listening');
    };
    
    recognition.onend = () => {
        state.isListening = false;
        elements.voiceBtn.classList.remove('listening');
    };
    
    recognition.start();
}


async function fetchWordData(word) {
    const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`;
    
    try {
        const response = await fetch(apiUrl);
        
        // Check if response is ok
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('WORD_NOT_FOUND');
            }
            throw new Error('API_ERROR');
        }
        
        const data = await response.json();
        return data[0]; // Return first result
        
    } catch (error) {
        
        if (error.message === 'Failed to fetch' || !navigator.onLine) {
            throw new Error('NO_INTERNET');
        }
        throw error;
    }
}


function showLoadingState() {
    state.isLoading = true;
    elements.loadingState.classList.add('show');
    elements.errorState.classList.remove('show');
    elements.resultsContent.classList.remove('show');
}

function showErrorState(errorType) {
    state.isLoading = false;
    elements.loadingState.classList.remove('show');
    elements.errorState.classList.add('show');
    elements.resultsContent.classList.remove('show');
    
   
    switch (errorType) {
        case 'WORD_NOT_FOUND':
            elements.errorTitle.textContent = 'Word Not Found';
            elements.errorMessage.textContent = `Sorry, we couldn't find the word "${elements.searchInput.value}". Please check the spelling and try again.`;
            break;
        case 'NO_INTERNET':
            elements.errorTitle.textContent = 'No Internet Connection';
            elements.errorMessage.textContent = 'Please check your internet connection and try again.';
            break;
        case 'EMPTY_SEARCH':
            elements.errorTitle.textContent = 'Enter a Word';
            elements.errorMessage.textContent = 'Please type a word in the search box to look it up.';
            break;
        default:
            elements.errorTitle.textContent = 'Oops!';
            elements.errorMessage.textContent = 'Something went wrong. Please try again later.';
    }
}

function showResultsState() {
    state.isLoading = false;
    elements.loadingState.classList.remove('show');
    elements.errorState.classList.remove('show');
    elements.resultsContent.classList.add('show');
}


function scrambleWord(word) {
    const arr = word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
}

function generateRhymes(word) {
    
    const endings = {
        'tion': ['action', 'motion', 'potion', 'notion'],
        'ing': ['ring', 'sing', 'bring', 'thing'],
        'ight': ['light', 'bright', 'sight', 'fight'],
        'ound': ['sound', 'ground', 'found', 'round'],
        'ess': ['dress', 'press', 'bless', 'stress'],
        'ay': ['day', 'way', 'say', 'play'],
        'ow': ['grow', 'show', 'know', 'flow']
    };
    
    
    for (const [ending, rhymes] of Object.entries(endings)) {
        if (word.toLowerCase().endsWith(ending)) {
            return rhymes.filter(r => r !== word.toLowerCase()).slice(0, 6);
        }
    }
    
    
    return ['blue', 'true', 'new', 'through'].slice(0, 4);
}

function renderWordGames() {
    const word = state.currentWord.word;
    
    
    const scrambled = scrambleWord(word);
    elements.scrambledWord.textContent = scrambled;
    elements.revealScrambleBtn.textContent = 'Reveal Answer';
    elements.revealScrambleBtn.disabled = false;
    
    
    const rhymes = generateRhymes(word);
    if (rhymes.length > 0) {
        elements.rhymeList.innerHTML = rhymes
            .map(rhyme => `<span class="rhyme-tag" onclick="searchFromTag('${rhyme}')">${rhyme}</span>`)
            .join('');
    } else {
        elements.rhymeList.innerHTML = '<p class="game-description">No common rhymes found</p>';
    }
}

function revealScramble() {
    elements.scrambledWord.textContent = state.currentWord.word;
    elements.revealScrambleBtn.textContent = 'Revealed!';
    elements.revealScrambleBtn.disabled = true;
}


function renderWordData(data) {
    
    elements.wordTitle.textContent = data.word;
    
    
    updateFavoriteButton();
    
    
    renderPhonetics(data.phonetics);
    
   
    renderWordStats(data);
    
    
    renderMeanings(data.meanings);
    
    
    renderWordGames();
    
    
    renderSource(data.sourceUrls);
    
    
    showResultsState();
    
    
    elements.resultsContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderPhonetics(phonetics) {
    if (!phonetics || phonetics.length === 0) {
        elements.phoneticSection.innerHTML = '';
        return;
    }
    
    
    let phoneticWithAudio = phonetics.find(p => p.text && p.audio);
    let phoneticWithText = phonetics.find(p => p.text);
    let phoneticToUse = phoneticWithAudio || phoneticWithText || phonetics[0];
    
    let html = '';
    
   
    if (phoneticToUse && phoneticToUse.text) {
        html += `<span class="phonetic-text">${phoneticToUse.text}</span>`;
    }
    
    
    if (phoneticWithAudio && phoneticWithAudio.audio) {
        html += `
            <button class="audio-btn" onclick="playAudio('${phoneticWithAudio.audio}')" title="Listen to pronunciation">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
            </button>
        `;
    }
    
    elements.phoneticSection.innerHTML = html;
}

function renderWordStats(data) {
   
    const totalMeanings = data.meanings.length;
    const totalDefinitions = data.meanings.reduce((sum, m) => sum + m.definitions.length, 0);
    const partsOfSpeech = [...new Set(data.meanings.map(m => m.partOfSpeech))].length;
    
    const html = `
        <div class="stats-grid">
            <div class="stat-box">
                <div class="stat-value">${totalMeanings}</div>
                <div class="stat-label">Meanings</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${totalDefinitions}</div>
                <div class="stat-label">Definitions</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${partsOfSpeech}</div>
                <div class="stat-label">Parts</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${data.word.length}</div>
                <div class="stat-label">Letters</div>
            </div>
        </div>
    `;
    
    elements.wordStatsCard.innerHTML = html;
    elements.wordStatsCard.classList.add('show');
}

function renderMeanings(meanings) {
    if (!meanings || meanings.length === 0) {
        elements.meaningsSection.innerHTML = '<p>No meanings available.</p>';
        return;
    }
    
    const html = meanings.map(meaning => {
        let card = `
            <div class="meaning-card">
                <span class="part-of-speech">${meaning.partOfSpeech}</span>
                <ol class="definition-list">
        `;
        
       
        meaning.definitions.slice(0, 3).forEach((def, index) => {
            card += `
                <li class="definition-item">
                    <span class="definition-number">${index + 1}</span>
                    <div class="definition-content">
                        <p class="definition-text">${def.definition}</p>
                        ${def.example ? `<p class="example-text">"${def.example}"</p>` : ''}
                    </div>
                </li>
            `;
        });
        
        card += `</ol>`;
        
    
        if (meaning.synonyms && meaning.synonyms.length > 0) {
            card += `
                <div class="synonyms-section">
                    <h4 class="synonyms-title">Synonyms</h4>
                    <div class="synonyms-list">
                        ${meaning.synonyms.slice(0, 8).map(syn => 
                            `<span class="synonym-tag" onclick="searchFromTag('${syn}')">${syn}</span>`
                        ).join('')}
                    </div>
                </div>
            `;
        }
        
       
        if (meaning.antonyms && meaning.antonyms.length > 0) {
            card += `
                <div class="antonyms-section">
                    <h4 class="antonyms-title">Antonyms</h4>
                    <div class="antonyms-list">
                        ${meaning.antonyms.slice(0, 8).map(ant => 
                            `<span class="antonym-tag" onclick="searchFromTag('${ant}')">${ant}</span>`
                        ).join('')}
                    </div>
                </div>
            `;
        }
        
        card += `</div>`;
        return card;
    }).join('');
    
    elements.meaningsSection.innerHTML = html;
}

function renderSource(sourceUrls) {
    if (!sourceUrls || sourceUrls.length === 0) {
        elements.sourceSection.innerHTML = '';
        return;
    }
    
    elements.sourceSection.innerHTML = `
        <p class="source-label">Source:</p>
        <a href="${sourceUrls[0]}" target="_blank" rel="noopener noreferrer" class="source-link">
            ${sourceUrls[0]}
        </a>
    `;
}


async function searchWord() {
    const query = elements.searchInput.value.trim();
    
    
    if (!query) {
        showErrorState('EMPTY_SEARCH');
        return;
    }
    
  
    showLoadingState();
    
    try {
        
        const data = await fetchWordData(query);
        
        
        state.currentWord = data;
        
        
        addToHistory(query);
        
      
        updateStats();
        
        
        renderWordData(data);
        
    } catch (error) {
        
        showErrorState(error.message);
    }
}


function playAudio(audioUrl) {
    const audio = new Audio(audioUrl);
    audio.play().catch(err => {
        console.error('Error playing audio:', err);
    });
}

function searchFromTag(word) {
    elements.searchInput.value = word;
    searchWord();
}

function clearSearchInput() {
    elements.searchInput.value = '';
    elements.clearBtn.classList.remove('show');
    elements.searchInput.focus();
}


function attachEventListeners() {
    // Search button click
    elements.searchBtn.addEventListener('click', searchWord);
    
   
    elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchWord();
        }
    });
   
    elements.searchInput.addEventListener('input', () => {
        if (elements.searchInput.value.trim()) {
            elements.clearBtn.classList.add('show');
        } else {
            elements.clearBtn.classList.remove('show');
        }
    });
   
    elements.clearBtn.addEventListener('click', clearSearchInput);
    
    elements.voiceBtn.addEventListener('click', startVoiceSearch);
    
    
    elements.themeToggle.addEventListener('click', toggleTheme);
    
   
    elements.historyBtn.addEventListener('click', toggleHistoryDropdown);
    
    
    elements.favoritesBtn.addEventListener('click', toggleFavoritesDropdown);
    
    
    elements.clearHistoryBtn.addEventListener('click', clearHistory);
    
    
    elements.clearFavoritesBtn.addEventListener('click', clearFavorites);
    
   
    elements.favoriteStarBtn.addEventListener('click', () => {
        if (state.currentWord) {
            toggleFavorite(state.currentWord.word);
        }
    });
    
    
    elements.wotdExplore.addEventListener('click', () => {
        elements.searchInput.value = state.wordOfTheDay;
        searchWord();
    });
    
   
    elements.revealScrambleBtn.addEventListener('click', revealScramble);
    
    
    document.addEventListener('click', (e) => {
        if (!elements.historyDropdown.contains(e.target) && 
            !elements.historyBtn.contains(e.target)) {
            closeHistoryDropdown();
        }
        if (!elements.favoritesDropdown.contains(e.target) && 
            !elements.favoritesBtn.contains(e.target)) {
            closeFavoritesDropdown();
        }
    });
    
    
    elements.historyDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    elements.favoritesDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}


document.addEventListener('DOMContentLoaded', init);
