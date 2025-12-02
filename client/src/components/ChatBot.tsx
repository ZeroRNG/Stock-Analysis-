import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { ChatMessage } from "@shared/schema";

const SUGGESTED_PROMPTS = [
  "Compare Tesla vs Apple over the last 6 months",
  "Give me technical + fundamental analysis for NVDA",
  "Summarize today's market sentiment",
  "What sectors performed the best this week?",
  "Is Amazon undervalued right now?",
  "Explain the current Fed interest rate outlook",
];

interface ChatBotProps {
  onAskQuestion: (question: string, response: string) => void;
}

export function ChatBot({ onAskQuestion }: ChatBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  const chatMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await apiRequest("POST", "/api/chat", { question });
      return response.json();
    },
    onSuccess: (data, question) => {
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.response || data.text || data.answer || "I couldn't generate a response.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
      onAskQuestion(question, assistantMessage.content);
    },
    onError: (error) => {
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    chatMutation.mutate(input);
    setInput("");
  };

  const handlePromptClick = (prompt: string) => {
    if (chatMutation.isPending) return;
    const userMessage: ChatMessage = { role: "user", content: prompt };
    setMessages((prev) => [...prev, userMessage]);
    chatMutation.mutate(prompt);
  };

  return (
    <section className="mb-12" data-testid="chatbot-section">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-primary" />
        StockSense AI Chatbot
      </h2>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Try asking:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <Card
              key={idx}
              className="p-3 cursor-pointer hover-elevate active-elevate-2 transition-all"
              onClick={() => handlePromptClick(prompt)}
              data-testid={`prompt-${idx}`}
            >
              <p className="text-sm">{prompt}</p>
            </Card>
          ))}
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <ScrollArea className="h-80 p-4" data-testid="chat-messages">
          <div className="flex flex-col gap-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-50" />
                <p>Ask me anything about stocks, trends, or market analysis!</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "mr-auto bg-muted text-foreground"
                }`}
                data-testid={`chat-message-${idx}`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="mr-auto bg-muted text-foreground rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Analyzing with AI...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="border-t border-border p-4">
          <div className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about any stock, trend, or comparison..."
              className="resize-none min-h-[60px]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              data-testid="chat-input"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={chatMutation.isPending || !input.trim()}
              data-testid="chat-submit"
            >
              {chatMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
      </Card>
    </section>
  );
}
