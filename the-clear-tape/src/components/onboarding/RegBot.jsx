import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Mic, MicOff, Send, HelpCircle } from "lucide-react";
import { InvokeLLM } from "@/api/integrations";

export default function RegBot({ currentStep, onSuggestion, formData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-AU';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Add welcome message when dialog opens
    if (isOpen && messages.length === 0) {
      const welcomeMessage = getWelcomeMessage(currentStep);
      setMessages([{ type: 'bot', text: welcomeMessage }]);
      setShowSuggestions(true);
    }
  }, [isOpen, currentStep, messages.length]);

  const getWelcomeMessage = (step) => {
    switch (step) {
      case 'business':
        return "👋 Hi! I'm RegBot. I can help you describe your business or choose the right industry.";
      case 'location':
        return "📍 Need help with your location? I can help you find your postcode, state, or local council.";
      case 'structure':
        return "🏢 Confused about business structures? I'll explain in simple terms!";
      case 'financials':
        return "💰 Not sure about your business size? I can help you estimate employee counts or annual turnover.";
      case 'activities':
        return "✅ Need help identifying your business activities? Describe what you do and I'll suggest which areas might apply.";
      default:
        return "👋 Hi! I'm RegBot, your business setup assistant. How can I help you today?";
    }
  };

  const getSamplePrompts = () => {
    const stepPrompts = {
      business: [
        "I am running an auto repair shop, what industry am I?",
        "What's a good business name for my cafe?",
        "I fix cars and sell parts, what category?"
      ],
      location: [
        "What's the postcode for Sydney CBD?",
        "Which local council covers Melbourne?",
        "What state regulations apply in Brisbane?"
      ],
      structure: [
        "What's a sole trader?",
        "Should I be a company or sole trader?",
        "What's the difference between company and partnership?"
      ],
      financials: [
        "I'm just starting, what's my turnover?",
        "How many employees is 'small business'?",
        "What size category for 5 staff?"
      ],
      activities: [
        "I handle food, what activities apply?",
        "I collect customer emails, what do I need?",
        "I work with cars, what regulations?"
      ]
    };

    return stepPrompts[currentStep] || stepPrompts.business;
  };

  const handleSuggestionClick = (prompt) => {
    setInput(prompt);
    setShowSuggestions(false);
    setTimeout(() => {
      handleSendMessage(prompt);
    }, 100);
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const getContextualPrompt = () => {
    const basePrompt = `You are RegBot, a helpful AI assistant for Australian business registration. 
    Be conversational, friendly, and use simple language. Keep responses concise but helpful.
    Current user context: ${JSON.stringify(formData)}
    Current step: ${currentStep}
    
    Guidelines:
    - For business descriptions: Help classify to ANZSIC codes and suggest industry sectors
    - For business types: Explain in plain language with pros/cons
    - For locations: Help with postcodes, states, councils
    - Always ask if they want you to fill in the form for them
    - Use Australian terminology and examples
    - If unsure, ask clarifying questions`;

    return basePrompt;
  };

  const handleSendMessage = async (messageText = null) => {
    const userMessage = messageText || input.trim();
    if (!userMessage || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const response = await InvokeLLM({
        prompt: `${getContextualPrompt()}
        
        User question: "${userMessage}"
        
        If you can suggest specific values for their form (like industry sector, business structure, etc.), 
        end your response with: SUGGESTION: field_name="value"
        
        For example: SUGGESTION: industry_sector="retail" or SUGGESTION: business_structure="sole_trader"`,
      });

      const botResponse = response;
      setMessages(prev => [...prev, { type: 'bot', text: botResponse }]);

      // Check for suggestions in the response
      const suggestionMatch = botResponse.match(/SUGGESTION:\s*(\w+)="([^"]+)"/);
      if (suggestionMatch && onSuggestion) {
        const [, field, value] = suggestionMatch;
        setTimeout(() => {
          if (window.confirm(`Would you like me to fill in "${field}" with "${value}"?`)) {
            onSuggestion(field, value);
          }
        }, 1000);
      }

    } catch (error) {
      console.error('RegBot error:', error);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: "Sorry, I'm having trouble right now. Please try again or continue with the form manually." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="text-sm text-blue-600 hover:underline flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4" />
          Ask me anything
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            RegBot Assistant
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col h-96">
          <ScrollArea className="flex-1 p-4 border rounded-lg bg-slate-50">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs rounded-lg px-3 py-2 text-sm ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-900'
                    }`}
                  >
                    {message.type === 'bot' && (
                      <div className="flex items-center gap-1 mb-1">
                        <Bot className="w-3 h-3" />
                        <span className="text-xs font-medium">RegBot</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{message.text.replace(/SUGGESTION:.*$/, '').trim()}</p>
                  </div>
                </div>
              ))}

              {showSuggestions && messages.length === 1 && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 text-center">Try asking:</p>
                  <div className="space-y-1">
                    {getSamplePrompts().map((prompt, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="w-full text-left justify-start text-xs h-auto py-2 px-3 bg-blue-50 border-blue-200 hover:bg-blue-100"
                        onClick={() => handleSuggestionClick(prompt)}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Bot className="w-3 h-3" />
                      <span className="text-xs font-medium">RegBot</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="flex items-center gap-2 mt-4">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your business setup..."
                className="pr-12"
                onFocus={() => setShowSuggestions(false)}
              />
              {recognitionRef.current && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="absolute right-1 top-1 h-6 w-6 p-0"
                  onClick={isListening ? stopListening : startListening}
                >
                  {isListening ? (
                    <MicOff className="w-3 h-3 text-red-500" />
                  ) : (
                    <Mic className="w-3 h-3 text-slate-500" />
                  )}
                </Button>
              )}
            </div>
            <Button 
              onClick={() => handleSendMessage()} 
              disabled={!input.trim() || isLoading}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {isListening && (
            <div className="text-center text-sm text-blue-600 mt-2">
              🎤 Listening... speak now
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}