// AI-Powered Catron Chatbot
class CatronAIChatbot {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.isOpen = false;
        this.isMinimized = false;
        this.conversationHistory = [];

        // Show welcome notification
        setTimeout(() => {
            if (!this.isOpen) this.showNotification();
        }, 3000);
    }

    initializeElements() {
        this.container = document.getElementById('chatbot-container');
        this.toggle = document.getElementById('chatbot-toggle');
        this.closeBtn = document.getElementById('close-btn');
        this.minimizeBtn = document.getElementById('minimize-btn');
        this.sendBtn = document.getElementById('send-btn');
        this.input = document.getElementById('chat-input');
        this.messagesContainer = document.getElementById('chatbot-messages');
        this.typingIndicator = document.getElementById('typing-indicator');
        this.notificationBadge = document.getElementById('notification-badge');
    }

    attachEventListeners() {
        this.toggle.addEventListener('click', () => this.toggleChat());
        this.closeBtn.addEventListener('click', () => this.closeChat());
        this.minimizeBtn.addEventListener('click', () => this.minimizeChat());
        this.sendBtn.addEventListener('click', () => this.sendMessage());

        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Quick replies
        document.querySelectorAll('.quick-reply').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const message = e.currentTarget.dataset.message;
                this.sendQuickReply(message);
            });
        });

        // Input validation
        this.input.addEventListener('input', () => {
            this.sendBtn.disabled = !this.input.value.trim();
        });
    }

    toggleChat() {
        this.isOpen ? this.closeChat() : this.openChat();
    }

    openChat() {
        this.container.classList.add('active');
        this.container.classList.remove('minimized');
        this.isOpen = true;
        this.isMinimized = false;
        this.hideNotification();
        this.input.focus();
    }

    closeChat() {
        this.container.classList.remove('active');
        this.isOpen = false;
    }

    minimizeChat() {
        this.container.classList.toggle('minimized');
        this.isMinimized = !this.isMinimized;
    }

    showNotification() {
        this.notificationBadge.classList.remove('hidden');
    }

    hideNotification() {
        this.notificationBadge.classList.add('hidden');
    }

    sendMessage() {
        const message = this.input.value.trim();
        if (!message) return;

        this.addMessage(message, 'user');
        this.input.value = '';
        this.sendBtn.disabled = true;

        this.showTyping();
        this.sendToAI(message);
    }

    sendQuickReply(message) {
        this.addMessage(message, 'user');
        this.showTyping();
        this.sendToAI(message);
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;

        const time = this.formatTime(new Date());
        const avatarIcon = sender === 'user' ? 'fa-user' : 'fa-robot';
        const bubbleClass = sender === 'user' ? 'user-bubble' : 'bot-bubble';
        const avatarClass = sender === 'user' ? 'user-avatar-msg' : 'bot-avatar-msg';

        messageDiv.innerHTML = `
            <div class="${avatarClass}">
                <i class="fas ${avatarIcon}"></i>
            </div>
            <div class="message-bubble ${bubbleClass}">
                <p>${this.escapeHtml(text)}</p>
                <span class="message-time">${time}</span>
            </div>
        `;

        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();

        // Store in conversation history
        this.conversationHistory.push({ role: sender, content: text, timestamp: new Date() });
    }

    async sendToAI(message) {
        try {
            const response = await fetch('/Chatbot/SendMessage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'RequestVerificationToken': document.querySelector('input[name="__RequestVerificationToken"]')?.value
                },
                body: JSON.stringify({ message: message })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Realistic typing delay based on response length
            const typingDelay = Math.min(3000, 1000 + (data.message.length * 20));

            setTimeout(() => {
                this.hideTyping();

                if (data.success) {
                    this.addMessage(data.message, 'bot');
                } else {
                    this.addMessage('Sorry, I encountered an error. Please try again. 😔', 'bot');
                }
            }, typingDelay);

        } catch (error) {
            console.error('Chatbot error:', error);
            this.hideTyping();
            this.addMessage('Oops! I\'m having connection issues. Please try again. 🔌', 'bot');
        }
    }

    showTyping() {
        this.typingIndicator.style.display = 'flex';
        this.scrollToBottom();
    }

    hideTyping() {
        this.typingIndicator.style.display = 'none';
    }

    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    }

    formatTime(date) {
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;

        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new CatronAIChatbot();
});