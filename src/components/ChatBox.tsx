import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Mic, MicOff } from "lucide-react";
import salmanAvatar from "@/assets/salman-avatar.png";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const quickReplies: Record<string, string> = {
  "what cases do you handle?":
    "I handle both Criminal and Civil cases including murder defense, anti-terrorism, property disputes, family law, corporate litigation, and constitutional petitions.",
  "what is your success rate?":
    "I have maintained over 85% favorable outcomes across all cases since I began practising in 2016.",
  "how can i contact you?":
    "You can reach me at salman.tahir@law.pk or call +92 51 2876543. My offices are in Islamabad (F-6 Markaz) and Lahore (High Court Bar).",
  "what are your fees?":
    "Fees depend on the nature and complexity of the case. Please contact my office for a consultation and we can discuss the details.",
};

function getReply(input: string): string {
  const lower = input.toLowerCase().trim();
  for (const [key, val] of Object.entries(quickReplies)) {
    if (lower.includes(key.split(" ").slice(0, 3).join(" ")) || key.includes(lower.split(" ").slice(0, 3).join(" "))) {
      return val;
    }
  }
  return "Thank you for reaching out. For detailed inquiries, please email me at salman.tahir@law.pk or call +92 51 2876543. I will respond at the earliest.";
}

function playNotificationSound() {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = 880;
  osc.type = "sine";
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.4);
}

const ChatBox = () => {
  const [open, setOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Assalam-o-Alaikum. I am M Salman Tahir. How may I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    stopListening();

    // Simulate slight delay for assistant reply
    setTimeout(() => {
      const reply: Message = { role: "assistant", text: getReply(text) };
      setMessages((prev) => [...prev, reply]);
      playNotificationSound();

      if (!open) {
        setUnreadCount((c) => c + 1);
      }

      // Flash notification badge on header
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
    }, 600);
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-PK";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setUnreadCount(0);
  };

  return (
    <>
      {/* Toggle button */}
      {!open && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-foreground flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
          aria-label="Chat with Salman"
        >
          <MessageCircle size={20} className="text-primary-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-sans font-medium animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-80 max-h-[90vh] sm:max-h-[44rem] bg-background border border-border shadow-2xl flex flex-col">
          {/* Header with avatar */}
          <div className="px-4 py-3 border-b border-border flex items-center gap-3">
            <div className="relative">
              <img
                src={salmanAvatar}
                alt="M Salman Tahir"
                className="w-9 h-9 rounded-full bg-muted object-cover"
              />
              {showNotification && (
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-background animate-ping" />
              )}
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
            </div>
            <div className="flex-1">
              <p className="font-serif text-sm">M Salman Tahir</p>
              <p className="font-sans text-xs text-muted-foreground">Online</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[14rem]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`font-sans text-sm leading-relaxed max-w-[85%] px-3 py-2 ${
                  msg.role === "assistant"
                    ? "bg-muted text-foreground rounded-br-lg rounded-tr-lg rounded-tl-lg"
                    : "bg-foreground text-primary-foreground rounded-bl-lg rounded-tl-lg rounded-tr-lg ml-auto"
                }`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border flex items-center">
            {!isListening && (
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 bg-transparent font-sans text-sm outline-none placeholder:text-muted-foreground"
              />
            )}
            {isListening && (
              <div className="flex-1 px-4 py-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                <span className="font-sans text-sm text-muted-foreground">Listening...</span>
              </div>
            )}
            <button
              onClick={toggleListening}
              className={`px-2 transition-colors ${
                isListening ? "text-destructive" : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label={isListening ? "Stop listening" : "Voice input"}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            <button
              onClick={send}
              className="px-4 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBox;
