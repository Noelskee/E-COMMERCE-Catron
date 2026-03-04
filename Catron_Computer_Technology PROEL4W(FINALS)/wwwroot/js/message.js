// message.js
document.addEventListener("DOMContentLoaded", function () {
  const techbotContainer = document.getElementById("techbot-container");
  const closeBtn = document.getElementById("close-btn");
  const sendBtn = document.getElementById("send-btn");
  const techbotInput = document.getElementById("techbot-input");
  const techbotMessages = document.getElementById("techbot-messages");
  const techbotIcon = document.getElementById("techbot-icon");

  // Check if required elements exist to avoid errors
  if (!techbotContainer || !closeBtn || !sendBtn || !techbotInput || !techbotMessages || !techbotIcon) {
    console.error("Missing required HTML elements for chatbot.");
    return;
  }

  // Toggle chatbot visibility
  techbotIcon.addEventListener("click", function () {
    techbotContainer.classList.replace("chat-hidden", "chat-shown");
    techbotIcon.style.display = "none"; // Hide icon
  });

  closeBtn.addEventListener("click", function () {
    techbotContainer.classList.replace("chat-shown", "chat-hidden");
    techbotIcon.style.display = "flex"; // Show icon again
  });

  sendBtn.addEventListener("click", sendMessage);
  techbotInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") sendMessage();
  });

  function sendMessage() {
    const userMessage = techbotInput.value.trim();
    if (userMessage) {
      appendMessage("user", userMessage);
      techbotInput.value = "";
      getBotResponse(userMessage);
    }
  }

  function appendMessage(sender, message) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", sender);
    messageElement.textContent = message;
    techbotMessages.appendChild(messageElement);
    techbotMessages.scrollTop = techbotMessages.scrollHeight;
  }

  async function getBotResponse(userMessage) {
    // Replace with your actual OpenAI API key (get from https://platform.openai.com/)
    const apiKey = "";  // IMPORTANT: Replace this!
    const apiUrl = "https://api.openai.com/v1/chat/completions";

    if (!apiKey || apiKey === "your-openai-api-key-here") {
      appendMessage("bot", "⚠️ API key not set. Please add your OpenAI API key to the code.");
      return;
    }

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",  // Using GPT-4o-mini as requested
          messages: [{ role: "user", content: userMessage }],
          max_tokens: 500,  // Increased for longer responses
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      const botMessage = data.choices[0]?.message?.content || "No response generated.";
      appendMessage("bot", botMessage);
    } catch (error) {
      console.error("Error fetching bot response:", error);
      if (error.message.includes("CORS")) {
        appendMessage("bot", "⚠️ CORS error: OpenAI API can't be called directly from the browser. Use a server-side proxy (e.g., Node.js or Vercel Functions).");
      } else {
        appendMessage("bot", "⚠️ Sorry, something went wrong. Please check your API key and try again.");
      }
    }
  }
});