//using Microsoft.AspNetCore.Mvc;
//using Microsoft.Extensions.Options;
//using Catron_Computer_Technology_PROEL4W_FINALS_.Models;
//using System.Text;
//using System.Text.Json;

//namespace Catron_Computer_Technology_PROEL4W_FINALS_.Controllers
//{
//    public class ChatbotController : Controller
//    {
//        private readonly ILogger<ChatbotController> _logger;
//        private readonly IHttpClientFactory _httpClientFactory;
//        private readonly ChatbotSettings _chatbotSettings;

//        public ChatbotController(
//            ILogger<ChatbotController> logger,
//            IHttpClientFactory httpClientFactory,
//            IOptions<ChatbotSettings> chatbotSettings)
//        {
//            _logger = logger;
//            _httpClientFactory = httpClientFactory;
//            _chatbotSettings = chatbotSettings.Value;
//        }

//        // PUBLIC METHOD - Called from JavaScript
//        [HttpPost]
//        public async Task<IActionResult> SendMessage([FromBody] ChatMessageRequest request)
//        {
//            try
//            {
//                if (string.IsNullOrWhiteSpace(request.Message))
//                {
//                    return Json(new ChatMessageResponse
//                    {
//                        Success = false,
//                        Message = "Please enter a message.",
//                        Timestamp = DateTime.Now
//                    });
//                }

//                // Calls the private method below
//                var aiResponse = await GetAIResponse(request.Message);

//                return Json(new ChatMessageResponse
//                {
//                    Success = true,
//                    Message = aiResponse,
//                    Timestamp = DateTime.Now
//                });
//            }
//            catch (Exception ex)
//            {
//                _logger.LogError(ex, "Error processing chat message");
//                return Json(new ChatMessageResponse
//                {
//                    Success = false,
//                    Message = "Sorry, I encountered an error. Please try again.",
//                    Timestamp = DateTime.Now
//                });
//            }
//        }

//        // THIS IS YOUR CODE - PRIVATE HELPER METHOD
//        private async Task<string> GetAIResponse(string userMessage)
//        {
//            try
//            {
//                var systemPrompt = @"You are an intelligent AI assistant for Catron Computer Technology, 
//                a computer and technology store in Cebu City, Philippines.

//                **IMPORTANT INSTRUCTIONS:**
//                1. You can answer BOTH store-related questions AND general questions
//                2. For store-related questions, use the information below
//                3. For general knowledge questions, provide accurate, helpful answers
//                4. Be friendly, conversational, and helpful
//                5. Keep responses concise but informative

//                **Store Information:**
//                - Name: Catron Computer Technology
//                - Location: KimRose Residences VRama Ave. Guadalupe, Cebu City, Philippines
//                - Phone: +63 908 515 4932
//                - Email: cathy.catron18@gmail.com
//                - Products: Laptops, Desktops, Mobile Devices, Printers, Software, Hardware";

//                // Gemini API format
//                var geminiRequest = new
//                {
//                    contents = new[]
//                    {
//                        new
//                        {
//                            parts = new[]
//                            {
//                                new { text = systemPrompt + "\n\nUser: " + userMessage }
//                            }
//                        }
//                    }
//                };

//                var httpClient = _httpClientFactory.CreateClient();
//                var url = $"{_chatbotSettings.ApiUrl}?key={_chatbotSettings.ApiKey}";

//                var jsonContent = JsonSerializer.Serialize(geminiRequest);
//                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

//                var response = await httpClient.PostAsync(url, content);

//                if (!response.IsSuccessStatusCode)
//                {
//                    var errorContent = await response.Content.ReadAsStringAsync();
//                    _logger.LogError($"Gemini API error: {response.StatusCode} - {errorContent}");
//                    return GetFallbackResponse(userMessage);
//                }

//                var responseContent = await response.Content.ReadAsStringAsync();

//                // Parse Gemini response
//                var geminiResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);
//                var text = geminiResponse
//                    .GetProperty("candidates")[0]
//                    .GetProperty("content")
//                    .GetProperty("parts")[0]
//                    .GetProperty("text")
//                    .GetString();

//                return text?.Trim() ?? GetFallbackResponse(userMessage);
//            }
//            catch (Exception ex)
//            {
//                _logger.LogError(ex, "Error calling AI API");
//                return GetFallbackResponse(userMessage);
//            }
//        }

//        // ANOTHER PRIVATE HELPER METHOD - Fallback when API fails
//        private string GetFallbackResponse(string userMessage)
//        {
//            var msg = userMessage.ToLower().Trim();

//            if (msg.Contains("hello") || msg.Contains("hi") || msg.Contains("hey"))
//                return "Hello! 👋 I'm Catron AI Assistant. How can I help you today?";

//            if (msg.Contains("laptop"))
//                return "We have an amazing selection of laptops! 💻 Check our Products section or call +63 908 515 4932.";

//            if (msg.Contains("price") || msg.Contains("cost"))
//                return "Our prices are very competitive! 💰 Visit our Products page or call +63 908 515 4932.";

//            return "I'm here to help! 🙂 Ask me about our products or call us at +63 908 515 4932.";
//        }
//    }
//}