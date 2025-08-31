
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area"; // This import is not used after the change, but kept as it was in original. If not needed elsewhere, it can be removed.
import { Bot, Send, User as UserIcon, BrainCircuit, X } from "lucide-react";
import { InvokeLLM } from "@/api/integrations";

export default function DashboardRegBot({ businessProfile, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null); // Changed from scrollAreaRef

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ 
        type: 'bot', 
        text: "Hi! I'm RegBot. Ask me anything about your compliance tasks, legal updates, or general business regulations in Australia."
      }]);
    }
  }, [messages.length]);

  useEffect(() => {
    // Auto-scroll to bottom
    scrollToBottom(); // Using the new scrollToBottom function and ref
  }, [messages, isLoading]);

  const getSamplePrompts = () => {
    const industry = businessProfile?.industry_sector;
    const state = businessProfile?.location?.state || 'NSW';
    const businessName = businessProfile?.business_name || 'my business';

    const basePrompts = [
      `I am running ${businessName}, what compliance do I need?`,
      `What are my main risks in ${state}?`,
      "What's an ABN and do I need one?",
      "Explain GST registration in simple terms"
    ];

    const industryPrompts = {
      retail: [
        "What permits do I need for selling products?",
        "Do I need consumer law compliance?",
        "What are my product safety requirements?"
      ],
      hospitality: [
        "What food safety licenses do I need?",
        "Do I need liquor licensing?",
        "What are my workplace safety requirements?"
      ],
      construction: [
        "What building licenses do I need?",
        "Do I need WorkCover insurance?",
        "What safety certifications are required?"
      ],
      automotive: [
        "What permits do I need for auto repairs?",
        "Do I need environmental waste permits?",
        "What workplace safety rules apply to mechanics?"
      ],
      healthcare: [
        "What health practitioner licenses do I need?",
        "Do I need privacy compliance for patient data?",
        "What are my professional indemnity requirements?"
      ],
      technology: [
        "Do I need privacy compliance for customer data?",
        "What are my cybersecurity obligations?",
        "Do I need software licensing compliance?"
      ]
    };

    return [...basePrompts, ...(industryPrompts[industry] || industryPrompts.retail)].slice(0, 6);
  };

  const handleSuggestionClick = (prompt) => {
    setInput(prompt);
    setShowSuggestions(false);
    // Auto-send the suggestion
    setTimeout(() => {
      handleSendMessage(prompt);
    }, 100);
  };

  const getContextualPrompt = () => {
    return `You are RegBot, a helpful AI assistant for Australian business compliance. 
    You are in a chat on the main dashboard. Be conversational, friendly, and use simple language. Keep responses concise but helpful.
    
    The user's business profile is: ${JSON.stringify(businessProfile)}.
    Use this profile to provide personalized and contextual advice.
    
    Guidelines:
    - Explain compliance terms (like ABN, GST, TFN) in plain language.
    - Suggest actions based on the user's profile (industry, location, structure).
    - Highlight potential regulatory conflicts or overlaps (e.g., federal vs. state).
    - Use Australian terminology and examples.
    - If you provide a link, make sure it is a valid, real government URL.
    - If unsure, ask clarifying questions.`;
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
        prompt: `${getContextualPrompt()}\n\nUser question: "${userMessage}"`,
      });

      setMessages(prev => [...prev, { type: 'bot', text: response }]);
    } catch (error) {
      console.error('RegBot error:', error);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: "Sorry, I'm having trouble connecting right now. Please try again in a moment." 
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
    <div className="bg-white shadow-xl border-slate-200 h-full flex flex-col rounded-xl">
      <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between py-4">
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <BrainCircuit className="w-5 h-5 text-blue-600" />
          Ask RegBot
        </CardTitle>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="w-8 h-8">
            <X className="w-5 h-5" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col min-h-0"> {/* Added min-h-0 */}
        <div className="flex-1 p-4 overflow-y-auto"> {/* Changed from ScrollArea component */}
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex items-start gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.type === 'bot' && <Bot className="w-5 h-5 text-blue-600 flex-shrink-0" />}
                <div
                  className={`max-w-md rounded-lg px-3 py-2 text-sm ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                </div>
                {message.type === 'user' && <UserIcon className="w-5 h-5 text-slate-500 flex-shrink-0" />}
              </div>
            ))}

            {showSuggestions && messages.length === 1 && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 text-center">Try asking:</p>
                <div className="grid grid-cols-1 gap-2">
                  {getSamplePrompts().map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-left justify-start text-xs h-auto py-2 px-3 bg-blue-50 border-blue-200 hover:bg-blue-100 text-slate-700"
                      onClick={() => handleSuggestionClick(prompt)}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex items-start gap-3 justify-start">
                <Bot className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="bg-slate-100 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} /> {/* Reference for auto-scrolling */}
          </div>
        </div>
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about compliance..."
              className="flex-1"
              disabled={isLoading}
              onFocus={() => setShowSuggestions(false)}
            />
            <Button 
              onClick={() => handleSendMessage()} 
              disabled={!input.trim() || isLoading}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </div>
  );
}
