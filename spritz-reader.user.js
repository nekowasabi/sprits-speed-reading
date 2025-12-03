// ==UserScript==
// @name         Spritz Speed Reader
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Spritz-style speed reading overlay for any webpage
// @author       Your Name
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function     () {
    'use strict';

    // State management
    let state = {
        isActive: false,
        isPaused: false,
        wpm: 300,
        currentWordIndex: 0,
        words: [],
        intervalId: null
    };

    /**
     * Calculate Optimal Recognition Point for a word
     * @param {string} word - The word to calculate ORP for
     * @returns {number} - Index of the ORP character
     */
    function getORP(word) {
        const orp = Math.ceil((word.length - 1) / 4);
        if (orp < word.length && /\W/.test(word[orp])) {
            return orp - 1;
        }
        return orp;
    }

    /**
     * Extract readable text from the page
     * @returns {string[]} - Array of words
     */
    function extractWords() {
        const text = document.body.innerText || '';
        // Split by whitespace and filter out empty strings
        return text.split(/\s+/).filter(word => word.length > 0);
    }

    /**
     * Create the Spritz reader UI overlay
     */
    function createUI() {
        // Remove existing overlay if any
        const existing = document.getElementById('spritz-overlay');
        if (existing) {
            existing.remove();
        }

        // Create overlay container
        const overlay = document.createElement('div');
        overlay.id = 'spritz-overlay';
        overlay.innerHTML = `
            <div id="spritz-redicle-container">
                <div id="spritz-redicle"></div>
            </div>
            <div id="spritz-controls">
                <button id="spritz-play-pause">⏸️ Pause</button>
                <label for="spritz-wpm-slider">
                    WPM: <span id="spritz-wpm-display">${state.wpm}</span>
                </label>
                <input type="range" id="spritz-wpm-slider" min="100" max="1000" step="50" value="${state.wpm}">
                <button id="spritz-close">✕ Close</button>
            </div>
            <div id="spritz-progress-container">
                <div id="spritz-progress-bar"></div>
            </div>
        `;

        // Apply styles
        applyStyles(overlay);

        document.body.appendChild(overlay);

        // Attach event listeners
        document.getElementById('spritz-play-pause').addEventListener('click', togglePlayPause);
        document.getElementById('spritz-wpm-slider').addEventListener('input', handleWPMChange);
        document.getElementById('spritz-close').addEventListener('click', closeReader);
    }

    /**
     * Apply CSS styles to the overlay
     */
    function applyStyles(overlay) {
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.9);
            z-index: 999999;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        `;

        const style = document.createElement('style');
        style.textContent = `
            #spritz-redicle-container {
                background-color: #fff;
                padding: 40px 60px;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                margin-bottom: 30px;
            }

            #spritz-redicle {
                font-family: 'Courier New', monospace;
                font-size: 48px;
                font-weight: bold;
                letter-spacing: 2px;
                min-height: 60px;
                min-width: 400px;
                text-align: center;
                display: flex;
                justify-content: center;
                align-items: center;
                position: relative;
            }

            #spritz-redicle .orp-highlight {
                color: #ff0000;
            }

            #spritz-controls {
                display: flex;
                gap: 20px;
                align-items: center;
                background-color: #fff;
                padding: 15px 25px;
                border-radius: 8px;
                margin-bottom: 20px;
            }

            #spritz-controls button {
                padding: 10px 20px;
                font-size: 16px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                background-color: #007bff;
                color: white;
                transition: background-color 0.2s;
            }

            #spritz-controls button:hover {
                background-color: #0056b3;
            }

            #spritz-close {
                background-color: #dc3545 !important;
            }

            #spritz-close:hover {
                background-color: #c82333 !important;
            }

            #spritz-controls label {
                font-size: 16px;
                color: #333;
                font-weight: bold;
            }

            #spritz-wpm-slider {
                width: 200px;
            }

            #spritz-progress-container {
                width: 80%;
                max-width: 600px;
                height: 10px;
                background-color: #333;
                border-radius: 5px;
                overflow: hidden;
            }

            #spritz-progress-bar {
                height: 100%;
                background-color: #007bff;
                width: 0%;
                transition: width 0.1s linear;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Display a word with ORP highlighting
     */
    function displayWord() {
        if (state.currentWordIndex >= state.words.length) {
            // End of text
            pause();
            state.currentWordIndex = 0;
            updateProgress();
            return;
        }

        const word = state.words[state.currentWordIndex];
        const orpIndex = getORP(word);
        const redicle = document.getElementById('spritz-redicle');

        if (!redicle) return;

        // Build word with ORP highlighting
        const before = word.slice(0, orpIndex);
        const orp = word[orpIndex] || '';
        const after = word.slice(orpIndex + 1);

        redicle.innerHTML = `
            <span>${before}</span><span class="orp-highlight">${orp}</span><span>${after}</span>
        `;

        state.currentWordIndex++;
        updateProgress();
    }

    /**
     * Update the progress bar
     */
    function updateProgress() {
        const progressBar = document.getElementById('spritz-progress-bar');
        if (!progressBar) return;

        const progress = (state.currentWordIndex / state.words.length) * 100;
        progressBar.style.width = `${progress}%`;
    }

    /**
     * Start playing the speed reader
     */
    function play() {
        if (state.intervalId) return; // Already playing

        state.isPaused = false;
        const interval = 60000 / state.wpm; // milliseconds per word

        state.intervalId = setInterval(displayWord, interval);

        const playPauseBtn = document.getElementById('spritz-play-pause');
        if (playPauseBtn) {
            playPauseBtn.textContent = '⏸️ Pause';
        }
    }

    /**
     * Pause the speed reader
     */
    function pause() {
        if (state.intervalId) {
            clearInterval(state.intervalId);
            state.intervalId = null;
        }

        state.isPaused = true;

        const playPauseBtn = document.getElementById('spritz-play-pause');
        if (playPauseBtn) {
            playPauseBtn.textContent = '▶️ Play';
        }
    }

    /**
     * Toggle play/pause
     */
    function togglePlayPause() {
        if (state.isPaused || !state.intervalId) {
            play();
        } else {
            pause();
        }
    }

    /**
     * Handle WPM slider change
     */
    function handleWPMChange(e) {
        state.wpm = parseInt(e.target.value, 10);
        document.getElementById('spritz-wpm-display').textContent = state.wpm;

        // Restart with new WPM if currently playing
        if (state.intervalId) {
            pause();
            play();
        }
    }

    /**
     * Close the reader
     */
    function closeReader() {
        pause();
        const overlay = document.getElementById('spritz-overlay');
        if (overlay) {
            overlay.remove();
        }
        state.isActive = false;
        state.currentWordIndex = 0;
    }

    /**
     * Initialize and launch the speed reader
     */
    function launchReader() {
        if (state.isActive) return; // Already active

        state.isActive = true;
        state.words = extractWords();
        state.currentWordIndex = 0;

        if (state.words.length === 0) {
            alert('No readable text found on this page.');
            state.isActive = false;
            return;
        }

        createUI();
        play();
    }

    /**
     * Keyboard event handler
     */
    function handleKeyPress(e) {
        // Ctrl+Shift+S: Launch reader
        if (e.key === 'e') {
            e.preventDefault();
            if (!state.isActive) {
                launchReader();
            }
            return;
        }

        // Only process other shortcuts if reader is active
        if (!state.isActive) return;

        switch (e.key) {
            case ' ':
                e.preventDefault();
                togglePlayPause();
                break;
            case 'Escape':
                e.preventDefault();
                closeReader();
                break;
            case 'ArrowUp':
                e.preventDefault();
                adjustWPM(50);
                break;
            case 'ArrowDown':
                e.preventDefault();
                adjustWPM(-50);
                break;
        }
    }

    /**
     * Adjust WPM by delta
     */
    function adjustWPM(delta) {
        state.wpm = Math.max(100, Math.min(1000, state.wpm + delta));

        const slider = document.getElementById('spritz-wpm-slider');
        const display = document.getElementById('spritz-wpm-display');

        if (slider) slider.value = state.wpm;
        if (display) display.textContent = state.wpm;

        // Restart with new WPM if currently playing
        if (state.intervalId) {
            pause();
            play();
        }
    }

    // Initialize
    document.addEventListener('keydown', handleKeyPress);

})();
