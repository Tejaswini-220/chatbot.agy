/**
 * Aether AI Chatbot Application Core Logic
 * Handles state, DOM interactions, Web Audio API sound synthesis,
 * theme management, mock response engine, and localStorage persistence.
 */

// App State
const state = {
    conversations: [], // Array of conversation objects: { id, title, personality, messages, temp, tokens, systemPrompt }
    currentChatId: null,
    currentPersonality: 'nova',
    settings: {
        soundEffects: true,
        animatedBg: true,
        username: 'Guest User'
    },
    isTyping: false
};

// Personality Definitions
const personalities = {
    nova: {
        name: 'Nova',
        status: 'Creative & Witty Generalist',
        welcome: 'Hello! I am Nova, your creative companion. I love brainstorming ideas, writing stories, exploring science, or just having a fascinating chat. What is on your mind today?',
        suggestions: [
            { label: 'Creative Writing', text: 'Write a short, suspenseful story about a lighthouse keeper who discovers a secret door.' },
            { label: 'Explain Simply', text: 'Explain quantum computing using a simple analogy of a flipping coin.' },
            { label: 'Brainstorm Ideas', text: 'Help me brainstorm 5 unique app ideas that combine cooking and gardening.' },
            { label: 'Fun Quiz', text: 'Give me a quick 3-question trivia challenge about deep ocean exploration.' }
        ],
        responses: {
            default: [
                "That's a fascinating perspective! I've been thinking about how similar patterns show up in nature and art.",
                "Ooh, let's explore that! If we looked at this from another angle, what do you think would happen?",
                "I like the way you think! Here is an idea: what if we combined that concept with something completely unexpected?",
                "Let's dive deeper into this. Tell me more about what you have in mind!"
            ],
            hello: "Hey there! Great to connect. I'm feeling super creative today—what kind of ideas or questions should we tackle?",
            joke: "Why don't scientists trust atoms? Because they make up everything! Plus, they have a lot of negative energy... looking at you, electrons.",
            philosophy: "Is technology separating us or bringing us closer? Maybe it's doing both. We build mirrors of our minds in code, hoping to find ourselves. What do you think?",
            future: "The future is a canvas painted by the choices we make today. Personally, I'm hoping for a future with flying cars and infinite tea refills."
        }
    },
    syntact: {
        name: 'Syntact',
        status: 'Coding & Tech Assistant',
        welcome: 'Greetings. I am Syntact, optimized for programming, debugging, and systems engineering. Ask me to write code, design algorithms, or explain technical architectures.',
        suggestions: [
            { label: 'Write Code', text: 'Write a JavaScript function to throttle calls to an API request.' },
            { label: 'CSS Grid Layout', text: 'Show me how to create a responsive 3-column layout with CSS Grid.' },
            { label: 'Explain API', text: 'Explain the difference between REST APIs and WebSockets, and when to use each.' },
            { label: 'Optimize Code', text: 'Optimize this mock Python list lookup: [x for x in list if x in other_list]' }
        ],
        responses: {
            default: [
                "Understood. Let's analyze the requirements. We should structure the solution to maximize efficiency and maintain clean design patterns.",
                "To implement this correctly, we need to consider edge cases. Let's write a robust implementation with error handling.",
                "That approach works, but we can optimize the time complexity from O(N^2) to O(N) by using a hash map or set lookup. Let's look at the implementation.",
                "Here is how you can set up that architecture. Let me write a concise configuration schema for you."
            ],
            hello: "Hello. System status: fully operational. Ready to assist with coding tasks, algorithm design, or architectural reviews.",
            joke: "There are 10 types of people in the world: those who understand binary, and those who don't. (And those who didn't expect a base-3 joke, but let's stick to base-2 for now).",
            code: "Here is a clean implementation of a utility function in JavaScript:\n\n```javascript\n// Delays execution until wait time has elapsed\nfunction debounce(func, wait) {\n    let timeout;\n    return function(...args) {\n        clearTimeout(timeout);\n        timeout = setTimeout(() => {\n            func.apply(this, args);\n        }, wait);\n    };\n}\n\n// Usage example:\nwindow.addEventListener('resize', debounce(() => {\n    console.log('Window resized!');\n}, 250));\n```\nLet me know if you need to adapt this for a framework like React or Vue.",
            python: "Here is a standard snippet to load, parse, and filter data using Python's list comprehensions:\n\n```python\nimport json\n\ndef load_and_filter_users(json_data):\n    # Parse JSON string\n    users = json.loads(json_data)\n    \n    # Filter users: active status and age > 18\n    active_users = [\n        {\n            'id': u['id'],\n            'name': u['name'].strip().title(),\n            'email': u['email'].lower()\n        }\n        for u in users\n        if u.get('is_active') and u.get('age', 0) > 18\n    ]\n    return active_users\n```\nThis reads user data and performs sanitization. Let me know if you need to fetch this from an API asynchronously.",
            db: "When selecting a database model, consider these trade-offs:\n\n* **Relational (SQL)**: Best for complex transactions (ACID compliance) and highly structured schemas (e.g., PostgreSQL).\n* **NoSQL (Document)**: Excellent for horizontal scalability and dynamic schemas (e.g., MongoDB).\n* **Key-Value**: Ultra-fast lookups (e.g., Redis, used for caching and session state)."
        }
    },
    aura: {
        name: 'Aura',
        status: 'Mindfulness & Zen Guide',
        welcome: 'Welcome, traveler. I am Aura, your space for calm and self-reflection. Take a deep breath, leave the noise of the day behind, and let us explore your thoughts in a peaceful space.',
        suggestions: [
            { label: 'Calm Breathing', text: 'Guide me through a simple 1-minute box breathing meditation exercise.' },
            { label: 'Stress Relief', text: 'I feel overwhelmed by my work tasks. How can I regain focus and calm?' },
            { label: 'Mindful Quote', text: 'Share a Zen reflection or quote about living in the present moment.' },
            { label: 'Evening Winddown', text: 'Give me 3 mindful habits to prepare my mind for a restful sleep.' }
        ],
        responses: {
            default: [
                "Let us paused for a moment. Take a gentle breath in... and let it go. How does it feel to step back from the rush?",
                "That is a very human feeling. It is completely okay to feel that way. Let's look at this together, gently.",
                "In the rush of solving problems, we sometimes forget to simply *be*. What is one small thing you can appreciate in this present moment?",
                "Your mind is like water. When it is turbulent, it is difficult to see. But when you let it settle, the clarity returns. Let us sit with this for a moment."
            ],
            hello: "Welcome. I hope you are taking care of yourself today. Take a slow breath. How can I help you find some quiet and clarity right now?",
            joke: "Why did the Zen master buy a hot dog? Because he wanted to be 'one with everything'. He then paid with a $20 bill, and when he asked for change, the vendor replied: 'Change must come from within.'",
            meditation: "Let us try a short breathing cycle together. Follow these simple steps:\n\n1. **Inhale** slowly through your nose for 4 seconds, feeling your chest rise.\n2. **Hold** your breath gently for 4 seconds.\n3. **Exhale** fully through your mouth for 4 seconds, letting go of any tension.\n4. **Rest** empty for 4 seconds.\n\nRepeat this cycle three times. Notice how the muscles in your shoulders begin to soften.",
            mindfulness: "Remember: you are not your thoughts; you are the sky, and your thoughts are just clouds passing through. Some are light, some are stormy, but they all eventually drift away. Let them pass without judgment."
        }
    }
};

// Web Audio API Synthesizer for Retro UI Sound Effects
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(type) {
    if (!state.settings.soundEffects) return;
    
    try {
        initAudio();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        
        const now = audioCtx.currentTime;
        
        if (type === 'send') {
            // High clicky bloop for message sent
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
            
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'receive') {
            // Elegant double bloop for incoming message
            const osc1 = audioCtx.createOscillator();
            const osc2 = audioCtx.createOscillator();
            const gain1 = audioCtx.createGain();
            const gain2 = audioCtx.createGain();
            
            osc1.type = 'triangle';
            osc1.frequency.setValueAtTime(587.33, now); // D5
            gain1.gain.setValueAtTime(0.08, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            osc1.connect(gain1);
            gain1.connect(audioCtx.destination);
            
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(880, now + 0.08); // A5
            gain2.gain.setValueAtTime(0.08, now + 0.08);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            
            osc1.start(now);
            osc1.stop(now + 0.15);
            osc2.start(now + 0.08);
            osc2.stop(now + 0.25);
        } else if (type === 'click') {
            // Subtle click sound for UI actions
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1000, now);
            gain.gain.setValueAtTime(0.02, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start(now);
            osc.stop(now + 0.03);
        }
    } catch (e) {
        console.warn("Audio Context blocked or failed to load:", e);
    }
}

// DOM Elements
const body = document.body;
const sidebar = document.getElementById('sidebar');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const newChatBtn = document.getElementById('new-chat-btn');
const historyList = document.getElementById('history-list');
const settingsTrigger = document.getElementById('settings-trigger');
const settingsModal = document.getElementById('settings-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const soundToggle = document.getElementById('sound-toggle');
const animationToggle = document.getElementById('animation-toggle');
const usernameInput = document.getElementById('username-input');
const clearAllDataBtn = document.getElementById('clear-all-data-btn');

const botAvatarMain = document.getElementById('bot-avatar-main');
const botNameDisplay = document.getElementById('bot-name-display');
const botStatusDisplay = document.getElementById('bot-status-display');
const personalityBtns = document.querySelectorAll('.personality-btn');

const configToggleBtn = document.getElementById('config-toggle-btn');
const configDrawer = document.getElementById('config-drawer');
const closeDrawerBtn = document.getElementById('close-drawer-btn');
const tempSlider = document.getElementById('temp-slider');
const tempVal = document.getElementById('temp-val');
const tokensSlider = document.getElementById('tokens-slider');
const tokensVal = document.getElementById('tokens-val');
const systemInstructions = document.getElementById('system-instructions');

const chatMessagesContainer = document.getElementById('chat-messages-container');
const welcomeContainer = document.getElementById('welcome-container');
const welcomeBotName = document.getElementById('welcome-bot-name');
const suggestionsGrid = document.getElementById('suggestions-grid');
const messagesList = document.getElementById('messages-list');

const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const clearChatBtn = document.getElementById('clear-chat-btn');
const exportChatBtn = document.getElementById('export-chat-btn');
const voiceInputBtn = document.getElementById('voice-input-btn');
const toastMessage = document.getElementById('toast-message');

// Initialize App
function initApp() {
    loadSettings();
    loadConversations();
    
    // Set up default state if no history exists
    if (state.conversations.length === 0) {
        createNewConversation(state.currentPersonality);
    } else {
        // Select most recent conversation
        selectConversation(state.conversations[0].id);
    }
    
    registerEventListeners();
    renderSidebarHistory();
    applySettingsToDOM();
}

// Load Settings from LocalStorage
function loadSettings() {
    const savedSettings = localStorage.getItem('aether_settings');
    if (savedSettings) {
        state.settings = { ...state.settings, ...JSON.parse(savedSettings) };
    }
}

// Load Conversations from LocalStorage
function loadConversations() {
    const savedChats = localStorage.getItem('aether_conversations');
    if (savedChats) {
        state.conversations = JSON.parse(savedChats);
        
        // Find last active conversation if it exists
        const lastActiveId = localStorage.getItem('aether_active_chat_id');
        if (lastActiveId && state.conversations.some(c => c.id === lastActiveId)) {
            state.currentChatId = lastActiveId;
        } else if (state.conversations.length > 0) {
            state.currentChatId = state.conversations[0].id;
        }
    }
}

// Save App Data to LocalStorage
function saveAppData() {
    localStorage.setItem('aether_settings', JSON.stringify(state.settings));
    localStorage.setItem('aether_conversations', JSON.stringify(state.conversations));
    localStorage.setItem('aether_active_chat_id', state.currentChatId);
}

// Apply settings to the DOM
function applySettingsToDOM() {
    soundToggle.checked = state.settings.soundEffects;
    animationToggle.checked = state.settings.animatedBg;
    usernameInput.value = state.settings.username;
    
    // Update profile display
    document.querySelector('.user-name').textContent = state.settings.username;
    document.querySelector('.user-avatar').textContent = state.settings.username.charAt(0).toUpperCase();
    
    // Background blobs animation status
    if (state.settings.animatedBg) {
        body.classList.remove('paused-blobs');
    } else {
        body.classList.add('paused-blobs');
    }
}

// Register DOM Event Listeners
function registerEventListeners() {
    // Menu Sidebar Toggle (Mobile)
    mobileMenuBtn.addEventListener('click', () => {
        playSound('click');
        sidebar.classList.toggle('open');
    });

    // Close mobile sidebar when clicking on a main area
    document.querySelector('.chat-area').addEventListener('click', () => {
        if (sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    });

    // New Chat Button
    newChatBtn.addEventListener('click', () => {
        playSound('click');
        createNewConversation(state.currentPersonality);
        sidebar.classList.remove('open');
    });

    // Clear Chat Log Button
    clearChatBtn.addEventListener('click', () => {
        playSound('click');
        clearCurrentConversation();
    });

    // Export Conversation Button
    exportChatBtn.addEventListener('click', () => {
        playSound('click');
        exportCurrentConversation();
    });

    // Settings Modal triggers
    settingsTrigger.addEventListener('click', () => {
        playSound('click');
        settingsModal.classList.add('open');
    });

    closeModalBtn.addEventListener('click', () => {
        playSound('click');
        settingsModal.classList.remove('open');
    });

    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            playSound('click');
            settingsModal.classList.remove('open');
        }
    });

    // Settings adjustments
    soundToggle.addEventListener('change', () => {
        state.settings.soundEffects = soundToggle.checked;
        saveAppData();
        playSound('click');
    });

    animationToggle.addEventListener('change', () => {
        state.settings.animatedBg = animationToggle.checked;
        saveAppData();
        applySettingsToDOM();
    });

    usernameInput.addEventListener('change', () => {
        state.settings.username = usernameInput.value.trim() || 'Guest User';
        saveAppData();
        applySettingsToDOM();
    });

    clearAllDataBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to delete all chats and settings? This cannot be undone.")) {
            localStorage.clear();
            state.conversations = [];
            state.currentChatId = null;
            state.currentPersonality = 'nova';
            state.settings = {
                soundEffects: true,
                animatedBg: true,
                username: 'Guest User'
            };
            initApp();
            settingsModal.classList.remove('open');
            showToast("System Reset Completed.");
        }
    });

    // Personality switching buttons
    personalityBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const personality = btn.getAttribute('data-personality');
            if (personality !== state.currentPersonality) {
                playSound('click');
                switchPersonality(personality);
            }
        });
    });

    // Parameter drawers
    configToggleBtn.addEventListener('click', () => {
        playSound('click');
        configDrawer.classList.toggle('open');
    });

    closeDrawerBtn.addEventListener('click', () => {
        playSound('click');
        configDrawer.classList.remove('open');
    });

    // Live slider value displays
    tempSlider.addEventListener('input', () => {
        const value = tempSlider.value;
        tempVal.textContent = value;
        updateActiveChatConfig('temp', parseFloat(value));
    });

    tokensSlider.addEventListener('input', () => {
        const value = tokensSlider.value;
        tokensVal.textContent = value;
        updateActiveChatConfig('tokens', parseInt(value));
    });

    systemInstructions.addEventListener('input', () => {
        updateActiveChatConfig('systemPrompt', systemInstructions.value);
    });

    // Textarea auto-resize & input triggers
    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = (chatInput.scrollHeight - 6) + 'px';
    });

    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleUserMessageSend();
        }
    });

    sendBtn.addEventListener('click', () => {
        handleUserMessageSend();
    });

    // Voice simulation
    voiceInputBtn.addEventListener('click', () => {
        playSound('click');
        showToast("Listening... (Simulated voice recognition enabled)");
        voiceInputBtn.classList.add('pulse');
        
        setTimeout(() => {
            voiceInputBtn.classList.remove('pulse');
            const voicePrompts = [
                "Give me a funny programming joke.",
                "How do I practice breathing to relieve anxiety?",
                "Draft a short riddle about stars.",
                "Write an HTML structure for a login form."
            ];
            const randomPrompt = voicePrompts[Math.floor(Math.random() * voicePrompts.length)];
            chatInput.value = randomPrompt;
            chatInput.dispatchEvent(new Event('input'));
            showToast("Voice transcribed: \"" + randomPrompt + "\"");
        }, 2500);
    });
}

// Create a New Chat Session
function createNewConversation(personalityName) {
    const id = 'chat_' + Date.now();
    const welcomeMsg = personalities[personalityName].welcome;
    
    const newChat = {
        id: id,
        title: 'New Conversation',
        personality: personalityName,
        temp: 0.7,
        tokens: 512,
        systemPrompt: `You are ${personalities[personalityName].name}, the user's ${personalities[personalityName].status}. Respond fully fitting your profile personality.`,
        messages: []
    };
    
    state.conversations.unshift(newChat);
    state.currentChatId = id;
    state.currentPersonality = personalityName;
    
    saveAppData();
    renderSidebarHistory();
    selectConversation(id);
}

// Select a specific chat conversation
function selectConversation(id) {
    state.currentChatId = id;
    const chat = state.conversations.find(c => c.id === id);
    if (!chat) return;
    
    state.currentPersonality = chat.personality;
    
    // Sync configurations drawer
    tempSlider.value = chat.temp;
    tempVal.textContent = chat.temp;
    tokensSlider.value = chat.tokens;
    tokensVal.textContent = chat.tokens;
    systemInstructions.value = chat.systemPrompt || '';
    
    // Switch themes & active elements
    body.className = `theme-${chat.personality}`;
    
    personalityBtns.forEach(btn => {
        if (btn.getAttribute('data-personality') === chat.personality) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Update headers display
    botAvatarMain.textContent = personalities[chat.personality].name.charAt(0);
    botNameDisplay.textContent = personalities[chat.personality].name;
    botStatusDisplay.textContent = personalities[chat.personality].status;
    welcomeBotName.textContent = personalities[chat.personality].name;
    
    // Render suggestion chips
    renderSuggestionChips(chat.personality);
    
    // Sync Messages
    renderMessages(chat.messages);
    renderSidebarHistory();
    
    // Close sidebar (on mobile) and configs
    configDrawer.classList.remove('open');
}

// Switch personality of current chat (if empty) or create a new chat with that personality
function switchPersonality(personalityName) {
    const activeChat = state.conversations.find(c => c.id === state.currentChatId);
    
    if (activeChat && activeChat.messages.length === 0) {
        // Current chat is empty, safe to just swap personality
        activeChat.personality = personalityName;
        activeChat.title = `Chat with ${personalities[personalityName].name}`;
        activeChat.systemPrompt = `You are ${personalities[personalityName].name}, the user's ${personalities[personalityName].status}. Respond fully fitting your profile personality.`;
        
        state.currentPersonality = personalityName;
        saveAppData();
        selectConversation(state.currentChatId);
    } else {
        // Active chat has history, create a new one with target personality
        createNewConversation(personalityName);
    }
}

// Update Active Chat configuration on slider adjustments
function updateActiveChatConfig(key, val) {
    const activeChat = state.conversations.find(c => c.id === state.currentChatId);
    if (activeChat) {
        activeChat[key] = val;
        saveAppData();
    }
}

// Clear current conversation messages log
function clearCurrentConversation() {
    const activeChat = state.conversations.find(c => c.id === state.currentChatId);
    if (activeChat) {
        activeChat.messages = [];
        activeChat.title = 'New Conversation';
        saveAppData();
        renderMessages([]);
        renderSidebarHistory();
        showToast("Conversation cleared.");
    }
}

// Export current conversation as markdown file
function exportCurrentConversation() {
    const activeChat = state.conversations.find(c => c.id === state.currentChatId);
    if (!activeChat || activeChat.messages.length === 0) {
        showToast("No messages to export.");
        return;
    }
    
    const botName = personalities[activeChat.personality].name;
    let mdContent = `# Aether Chat Session\n`;
    mdContent += `**Assistant Personality**: ${botName} (${personalities[activeChat.personality].status})\n`;
    mdContent += `**Date**: ${new Date().toLocaleDateString()}\n\n`;
    mdContent += `---\n\n`;
    
    activeChat.messages.forEach(msg => {
        const sender = msg.role === 'user' ? state.settings.username : botName;
        mdContent += `### 👤 ${sender}\n\n${msg.content}\n\n`;
    });
    
    // Create download element
    const element = document.createElement('a');
    const file = new Blob([mdContent], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    
    const formattedTitle = activeChat.title
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase()
        .slice(0, 30);
    element.download = `aether_chat_${formattedTitle}.md`;
    
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    showToast("Chat exported successfully.");
}

// Delete a conversation from history
function deleteConversation(id, event) {
    event.stopPropagation(); // Stop click propagating to selecting row
    
    const index = state.conversations.findIndex(c => c.id === id);
    if (index === -1) return;
    
    state.conversations.splice(index, 1);
    
    if (state.currentChatId === id) {
        // If we deleted the active chat, select another one or create new
        if (state.conversations.length > 0) {
            state.currentChatId = state.conversations[0].id;
        } else {
            state.currentChatId = null;
        }
    }
    
    saveAppData();
    
    if (state.currentChatId) {
        selectConversation(state.currentChatId);
    } else {
        createNewConversation(state.currentPersonality);
    }
    
    showToast("Chat deleted.");
}

// Render the suggestions chips grid
function renderSuggestionChips(personalityName) {
    suggestionsGrid.innerHTML = '';
    const suggestions = personalities[personalityName].suggestions;
    
    suggestions.forEach(s => {
        const card = document.createElement('button');
        card.className = 'suggestion-card';
        card.innerHTML = `
            <div class="suggestion-header">${s.label}</div>
            <div class="suggestion-desc">${s.text}</div>
        `;
        card.addEventListener('click', () => {
            playSound('click');
            chatInput.value = s.text;
            chatInput.dispatchEvent(new Event('input'));
            handleUserMessageSend();
        });
        suggestionsGrid.appendChild(card);
    });
}

// Render message bubbles in chat list
function renderMessages(messages) {
    messagesList.innerHTML = '';
    
    if (messages.length === 0) {
        welcomeContainer.style.display = 'flex';
        messagesList.style.display = 'none';
        return;
    }
    
    welcomeContainer.style.display = 'none';
    messagesList.style.display = 'flex';
    
    messages.forEach(msg => {
        const bubble = document.createElement('div');
        bubble.className = `message-bubble ${msg.role === 'user' ? 'user-msg' : 'bot-msg'}`;
        
        const avatarLetter = msg.role === 'user' ? state.settings.username.charAt(0).toUpperCase() : personalities[state.currentPersonality].name.charAt(0);
        const avatarClass = msg.role === 'user' ? 'user-avatar' : 'bot-avatar-main';
        
        // Convert mock markdown references to HTML tags
        const formattedText = parseMarkdownToHTML(msg.content);
        
        bubble.innerHTML = `
            <div class="avatar ${avatarClass}">${avatarLetter}</div>
            <div class="message-content">${formattedText}</div>
        `;
        messagesList.appendChild(bubble);
    });
    
    scrollToBottom();
}

// Render Sidebar History elements
function renderSidebarHistory() {
    historyList.innerHTML = '';
    
    state.conversations.forEach(chat => {
        const item = document.createElement('div');
        item.className = `history-item ${chat.id === state.currentChatId ? 'active' : ''}`;
        item.setAttribute('data-id', chat.id);
        
        // Find avatar letter to draw beside history titles
        const botLetter = personalities[chat.personality].name.charAt(0);
        
        item.innerHTML = `
            <div class="history-item-left">
                <div class="avatar history-icon" style="width:24px; height:24px; font-size:10px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-light); color: var(--text-secondary);">${botLetter}</div>
                <div class="history-title">${chat.title}</div>
            </div>
            <button class="delete-history-btn" title="Delete conversation">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        `;
        
        // Listeners for item select and delete
        item.addEventListener('click', () => {
            playSound('click');
            selectConversation(chat.id);
        });
        
        const delBtn = item.querySelector('.delete-history-btn');
        delBtn.addEventListener('click', (e) => {
            playSound('click');
            deleteConversation(chat.id, e);
        });
        
        historyList.appendChild(item);
    });
}

// Scroll chat container to bottom
function scrollToBottom() {
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

// Handle sending message from Text Input
function handleUserMessageSend() {
    if (state.isTyping) return; // Block input if bot is currently generating
    
    const content = chatInput.value.trim();
    if (!content) return;
    
    playSound('send');
    
    // Add user message to active conversation
    const activeChat = state.conversations.find(c => c.id === state.currentChatId);
    if (!activeChat) return;
    
    const userMsg = {
        id: 'msg_' + Date.now(),
        role: 'user',
        content: content,
        timestamp: new Date().toISOString()
    };
    
    activeChat.messages.push(userMsg);
    
    // Update conversation title based on first query if title was default
    if (activeChat.title === 'New Conversation' || activeChat.title.startsWith('Chat with')) {
        activeChat.title = content.length > 28 ? content.slice(0, 25) + '...' : content;
    }
    
    // Clear input box
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    // Save state and re-render
    saveAppData();
    renderMessages(activeChat.messages);
    renderSidebarHistory();
    
    // Trigger Simulated bot reply
    simulateBotResponse(content);
}

// Simulation of AI Response Generation
function simulateBotResponse(userPrompt) {
    state.isTyping = true;
    
    // Append Typing Indicator Bubble
    const typingBubble = document.createElement('div');
    typingBubble.className = 'message-bubble bot-msg typing-bubble-temp';
    
    const botLetter = personalities[state.currentPersonality].name.charAt(0);
    typingBubble.innerHTML = `
        <div class="avatar bot-avatar-main">${botLetter}</div>
        <div class="message-content">
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
    messagesList.appendChild(typingBubble);
    scrollToBottom();
    
    // Determine response delay based on text length (simulating thinking/typing time)
    const activeChat = state.conversations.find(c => c.id === state.currentChatId);
    const delay = Math.max(1500, Math.min(3500, userPrompt.length * 15));
    
    setTimeout(() => {
        // Remove typing bubble
        const tempBubble = document.querySelector('.typing-bubble-temp');
        if (tempBubble) tempBubble.remove();
        
        // Synthesize response based on user input triggers
        const botReply = generateSmartReply(userPrompt, state.currentPersonality);
        
        const botMsg = {
            id: 'msg_' + Date.now(),
            role: 'bot',
            content: botReply,
            timestamp: new Date().toISOString()
        };
        
        if (activeChat) {
            activeChat.messages.push(botMsg);
            saveAppData();
            renderMessages(activeChat.messages);
            playSound('receive');
        }
        
        state.isTyping = false;
    }, delay);
}

// Rule-based Mock AI response parser
function generateSmartReply(prompt, personality) {
    const cleanPrompt = prompt.toLowerCase();
    const responses = personalities[personality].responses;
    
    // Universal triggers
    if (cleanPrompt.includes('hello') || cleanPrompt.includes('hi ') || cleanPrompt.includes('hey')) {
        return responses.hello;
    }
    if (cleanPrompt.includes('joke')) {
        return responses.joke;
    }
    
    // Personality-specific query structures
    if (personality === 'nova') {
        if (cleanPrompt.includes('story') || cleanPrompt.includes('write a')) {
            return "Sure! Here is a micro-story for you:\n\n*The antique clock on the mantelpiece hadn't run in sixty years, yet tonight it chimed thirteen times. Alistair sat up in bed, frozen. A cool draft filled the locked room, carrying the unmistakable scent of sea salt and damp sand. From the hallway came the slow, rhythmic sound of heavy boots, dripping water onto the floorboards... and stopping right outside his door. Then, a low voice whispered: 'The lighthouse fires are out.'*";
        }
        if (cleanPrompt.includes('explain') || cleanPrompt.includes('quantum')) {
            return "Imagine you have a coin. In our normal world, a coin is either heads or tails. That's classical computing (0 or 1). Now imagine you spin that coin. While it's spinning, it is a blur of *both* heads and tails at the same time. That state of being both at once is called **superposition** in quantum mechanics. A quantum computer uses these 'spinning coins' (qubits) to test thousands of possibilities simultaneously, speeding up calculations that would take normal computers centuries!";
        }
        if (cleanPrompt.includes('future') || cleanPrompt.includes('technology')) {
            return responses.future;
        }
    }
    
    if (personality === 'syntact') {
        if (cleanPrompt.includes('code') || cleanPrompt.includes('function') || cleanPrompt.includes('javascript') || cleanPrompt.includes('js')) {
            return responses.code;
        }
        if (cleanPrompt.includes('python') || cleanPrompt.includes('list')) {
            return responses.python;
        }
        if (cleanPrompt.includes('database') || cleanPrompt.includes('sql') || cleanPrompt.includes('nosql')) {
            return responses.db;
        }
        if (cleanPrompt.includes('explain') || cleanPrompt.includes('how does')) {
            return "When a client requests a resource via a standard REST API, it sends an HTTP request, receives an individual payload response, and closes the connection. It's a pull model. With WebSockets, the client initiates a handshake that upgrades the HTTP connection to a persistent, bi-directional TCP socket connection. This allows the server to push real-time updates directly to the client (like a live chat or stock ticker) without client polling overhead.";
        }
    }
    
    if (personality === 'aura') {
        if (cleanPrompt.includes('breathing') || cleanPrompt.includes('meditation') || cleanPrompt.includes('exercise')) {
            return responses.meditation;
        }
        if (cleanPrompt.includes('stress') || cleanPrompt.includes('anxious') || cleanPrompt.includes('work') || cleanPrompt.includes('overwhelm')) {
            return "I hear you, and it's completely natural to feel overwhelmed. When everything piles up, try to zoom in. Don't look at the entire mountain of work; just look at the next single step. Take one task, set a timer for 20 minutes, close all other tabs, and work gently. When the timer rings, stretch and drink some water. Rest is not a reward for work; it is a prerequisite. You are doing enough.";
        }
        if (cleanPrompt.includes('philosophy') || cleanPrompt.includes('quote') || cleanPrompt.includes('zen')) {
            return responses.mindfulness;
        }
    }
    
    // General fallbacks (select random personality response)
    const defaults = responses.default;
    return defaults[Math.floor(Math.random() * defaults.length)];
}

// Convert mock Markdown to styled HTML tags
function parseMarkdownToHTML(text) {
    let html = text;
    
    // Escape standard HTML tags in text to prevent XSS issues
    html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    
    // Code blocks: ```language ... ```
    html = html.replace(/```([a-zA-Z]*)\n([\s\S]*?)\n```/g, function(match, lang, code) {
        return `<pre><code class="language-${lang}">${code}</code></pre>`;
    });
    
    // Inline code: `code`
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Bold: **text**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Italic: *text*
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Bullet lists: * item
    html = html.replace(/^\* (.*)$/gm, '<li>$1</li>');
    // Wrap consecutive list items in <ul>
    html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
    // Fix double nested <ul>s that could occur from the simple regex
    html = html.replace(/<\/ul>\s*<ul>/g, '');
    
    // Numbered lists: 1. item
    html = html.replace(/^\d+\. (.*)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/g, '<ol>$1</ol>');
    html = html.replace(/<\/ol>\s*<ol>/g, '');
    
    // Line breaks
    html = html.replace(/\n/g, '<br>');
    
    // Cleanup double tags on lists
    html = html.replace(/<br>(<ul>|ol>)/g, '$1');
    html = html.replace(/(<\/ul>|<\/ol>)<br>/g, '$1');
    
    return html;
}

// Helper to show visual toast alert messages
function showToast(message) {
    toastMessage.textContent = message;
    toastMessage.classList.add('show');
    
    setTimeout(() => {
        toastMessage.classList.remove('show');
    }, 3000);
}

// Load App on load
window.addEventListener('DOMContentLoaded', initApp);
