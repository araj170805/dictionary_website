// ===================================
// STATE MANAGEMENT
// ===================================
const state = {
    currentWord: null,
    searchHistory: [],
    isLoading: false,
    isDarkMode: false
};

// ===================================
// DOM ELEMENTS
// ===================================
const elements = {
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    clearBtn: document.getElementById('clearBtn'),
    themeToggle: document.getElementById('themeToggle'),
    historyBtn: document.getElementById('historyBtn'),
    historyDropdown: document.getElementById('historyDropdown'),
    historyList: document.getElementById('historyList'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    loadingState: document.getElementById('loadingState'),
    errorState: document.getElementById('errorState'),
    resultsContent: document.getElementById('resultsContent'),
    wordTitle: document.getElementById('wordTitle'),
    phoneticSection: document.getElementById('phoneticSection'),
    meaningsSection: document.getElementById('meaningsSection'),
    sourceSection: document.getElementById('sourceSection'),
    errorTitle: document.getElementById('errorTitle'),
    errorMessage: document.getElementById('errorMessage')
};

// ===================================
// INITIALIZATION
// ===================================
function init() {
    loadThemePreference();
    loadSearchHistory();
    attachEventListeners();
    
    // Focus on search input on page load
    elements.searchInput.focus();
}

// ===================================
// THEME MANAGEMENT
// ===================================
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

// ===================================
// SEARCH HISTORY MANAGEMENT
// ===================================
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
    // Remove if already exists
    state.searchHistory = state.searchHistory.filter(item => item !== word);
    
    // Add to beginning
    state.searchHistory.unshift(word);
    
    // Keep only last 20 searches
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
    
    // Attach click handlers to history items
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

// ===================================
// API FUNCTIONS
// ===================================
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
        // Check for network errors
        if (error.message === 'Failed to fetch' || !navigator.onLine) {
            throw new Error('NO_INTERNET');
        }
        throw error;
    }
}

// ===================================
// UI STATE FUNCTIONS
// ===================================
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
    
    // Set error message based on type
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

// ===================================
// RENDER FUNCTIONS
// ===================================
function renderWordData(data) {
    // Render word title
    elements.wordTitle.textContent = data.word;
    
    // Render phonetics
    renderPhonetics(data.phonetics);
    
    // Render meanings
    renderMeanings(data.meanings);
    
    // Render source
    renderSource(data.sourceUrls);
    
    // Show results
    showResultsState();
    
    // Scroll to results
    elements.resultsContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderPhonetics(phonetics) {
    if (!phonetics || phonetics.length === 0) {
        elements.phoneticSection.innerHTML = '';
        return;
    }
    
    // Find phonetic with text and audio
    let phoneticWithAudio = phonetics.find(p => p.text && p.audio);
    let phoneticWithText = phonetics.find(p => p.text);
    let phoneticToUse = phoneticWithAudio || phoneticWithText || phonetics[0];
    
    let html = '';
    
    // Add phonetic text
    if (phoneticToUse && phoneticToUse.text) {
        html += `<span class="phonetic-text">${phoneticToUse.text}</span>`;
    }
    
    // Add audio button
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
        
        // Add definitions
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
        
        // Add synonyms
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
        
        // Add antonyms
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

// ===================================
// SEARCH FUNCTION
// ===================================
async function searchWord() {
    const query = elements.searchInput.value.trim();
    
    // Validate input
    if (!query) {
        showErrorState('EMPTY_SEARCH');
        return;
    }
    
    // Show loading state
    showLoadingState();
    
    try {
        // Fetch word data
        const data = await fetchWordData(query);
        
        // Save to state
        state.currentWord = data;
        
        // Add to history
        addToHistory(query);
        
        // Render results
        renderWordData(data);
        
    } catch (error) {
        // Show appropriate error
        showErrorState(error.message);
    }
}

// ===================================
// UTILITY FUNCTIONS
// ===================================
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

// ===================================
// EVENT LISTENERS
// ===================================
function attachEventListeners() {
    // Search button click
    elements.searchBtn.addEventListener('click', searchWord);
    
    // Enter key on search input
    elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchWord();
        }
    });
    
    // Show/hide clear button
    elements.searchInput.addEventListener('input', () => {
        if (elements.searchInput.value.trim()) {
            elements.clearBtn.classList.add('show');
        } else {
            elements.clearBtn.classList.remove('show');
        }
    });
    
    // Clear button click
    elements.clearBtn.addEventListener('click', clearSearchInput);
    
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // History button
    elements.historyBtn.addEventListener('click', toggleHistoryDropdown);
    
    // Clear history button
    elements.clearHistoryBtn.addEventListener('click', clearHistory);
    
    // Close history dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!elements.historyDropdown.contains(e.target) && 
            !elements.historyBtn.contains(e.target)) {
            closeHistoryDropdown();
        }
    });
    
    // Prevent history dropdown from closing when clicking inside
    elements.historyDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// ===================================
// START APPLICATION
// ===================================
document.addEventListener('DOMContentLoaded', init);
