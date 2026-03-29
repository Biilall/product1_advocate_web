import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Mic, MicOff, Paperclip, RotateCcw, ChevronDown } from "lucide-react";
import salmanAvatar from "@/assets/salman-avatar.png";

interface Message {
  role: "user" | "assistant";
  text: string;
  type?: "text" | "voice";
}

interface ChatHistory {
  id: number;
  user_id: number;
  message: string;
  response: string;
  message_type: string;
  created_at: string;
}

const ChatBox = () => {
  const [open, setOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showTopicsDropdown, setShowTopicsDropdown] = useState(false);
  const [chatTopics, setChatTopics] = useState<any[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showTopicsDropdown && !(event.target as Element).closest('.chat-topics-dropdown')) {
        setShowTopicsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTopicsDropdown]);

  // Initialize user
  useEffect(() => {
    const initSession = async () => {
      let threadId = localStorage.getItem('chatThreadId');
      if (!threadId) {
        try {
          const response = await fetch('/api/chat/start', {
            method: 'POST',
          });
          const data = await response.json();
          threadId = data.threadId;
          localStorage.setItem('chatThreadId', threadId);
          setThreadId(threadId);
          // Start with welcome message
          setMessages([{ role: "assistant", text: "Assalam-o-Alaikum! I am M Salman Tahir, a legal expert. To better assist you, could you please share your name, phone number, and email address?" }]);
        } catch (error) {
          console.error('Failed to create session:', error);
          setMessages([{ role: "assistant", text: "Assalam-o-Alaikum. I am M Salman Tahir. How may I assist you today?" }]);
        }
      } else {
        setThreadId(threadId);
        loadHistory(threadId);
      }
    };

    initSession();
  }, []);

  const loadHistory = async (threadId: string) => {
    try {
      const response = await fetch(`/api/chat/history/${threadId}`);
      const history: ChatHistory[] = await response.json();
      const loadedMessages: Message[] = [];
      history.forEach(h => {
        loadedMessages.push({ role: 'user', text: h.message, type: h.message_type as 'text' | 'voice' });
        loadedMessages.push({ role: 'assistant', text: h.response || ''});
      });
      if (loadedMessages.length === 0) {
        loadedMessages.push({ role: "assistant", text: "Assalam-o-Alaikum! I am M Salman Tahir, a legal expert. To better assist you, could you please share your name, phone number, and email address?" });
      }
      setMessages(loadedMessages);
    } catch (error) {
      console.error('Failed to load history:', error);
      setMessages([{ role: "assistant", text: "Assalam-o-Alaikum. I am M Salman Tahir. How may I assist you today?" }]);
    }
  };

  const getSpecialResponse = (text: string): string | null => {
    const normalized = text.trim().toLowerCase();

    const paymentMethodsTrigger = /payment methods?|how.*pay|pay.*method|mobile.*payment|jazzcash/i;
    const bankTransferTrigger = /bank transfer|bank details|bank account|ifsc|swift|account number/i;

    if (paymentMethodsTrigger.test(normalized)) {
      return "JazzCash Number: 0306-5234137";
    }

    if (bankTransferTrigger.test(normalized)) {
      return "Please use this link: https://msalmantahir.com/bank-transfer-qr";
    }

    return null;
  };

  const sendTextMessage = async (text: string) => {
    if (!text.trim() && !selectedFile) return;

    const userMsg: Message = { role: "user", text: selectedFile ? `File: ${selectedFile.name}` : text };
    setMessages((prev) => [...prev, userMsg]);

    const special = getSpecialResponse(text);
    if (special && !selectedFile) {
      const assistantMsg: Message = { role: "assistant", text: special };
      setMessages((prev) => [...prev, assistantMsg]);
      setInput("");
      setSelectedFile(null);
      return;
    }

    setInput("");
    setIsLoading(true);

    try {
      let response;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('threadId', threadId || '');
        formData.append('message', text);
        formData.append('file', selectedFile);

        response = await fetch('/api/chat/file', {
          method: 'POST',
          body: formData,
        });
      } else {
        response = await fetch('/api/chat/text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ threadId, message: text }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        const errorMsg: Message = { role: "assistant", text: data.error || 'Failed...' };
        setMessages((prev) => [...prev, errorMsg]);
        setIsLoading(false);
        setSelectedFile(null);
        return;
      }

      // ✅ SAVE THREAD ID
      if (data.threadId) {
        setThreadId(data.threadId);
      }

      const reply: Message = { role: "assistant", text: data.response };
      setMessages((prev) => [...prev, reply]);

      if (!open) {
        setUnreadCount((c) => c + 1);
      }

      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMsg: Message = { role: "assistant", text: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}` };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setSelectedFile(null);
    }
  };

  const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

      console.log('Audio blob size:', audioBlob.size, 'type:', audioBlob.type);

      // Reject very small files
      if (audioBlob.size < 1000) {
        alert('Recording too short. Please speak longer.');
        return;
      }

      await sendVoiceMessage(audioBlob, 'webm');

      stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.start();
    setIsRecording(true);
  } catch (error) {
    console.error('Failed to start recording:', error);
    alert('Could not access microphone. Please check permissions.');
  }
};
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

const sendVoiceMessage = async (audioBlob: Blob, fileExtension: string = 'webm') => {
  if (!threadId) return;
  setIsLoading(true);

  try {
    const formData = new FormData();
    formData.append('threadId', threadId);
    formData.append('audio', audioBlob, `voice.${fileExtension}`);

    const response = await fetch('/api/chat/voice', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err?.error || 'Voice API failed');
    }

    const data = await response.json();

    // Append user transcription
    // const userMsg: Message = { role: 'user', text: `Voice: ${data.transcription}`, type: 'voice' };

    // // Append assistant text reply
    // const reply: Message = { role: 'assistant', text: data.responseText };
    const userMsg: Message = { 
      role: 'user', 
      text: `Voice: ${data.transcription || ''}`, 
      type: 'voice' 
    };

    const reply: Message = { 
      role: 'assistant', 
      text: data.responseText || 'No response' 
    };
    setMessages(prev => [...prev, userMsg, reply]);

    // Play assistant voice if available
    if (data.responseAudio) {
      const audio = new Audio(`data:audio/mp3;base64,${data.responseAudio}`);
      audio.play().catch(err => console.error('Audio play failed:', err));
    }

  } catch (err) {
    console.error(err);
    const msg = err instanceof Error ? err.message : 'Unknown voice error';
    setMessages(prev => [...prev, { role: 'assistant', text: msg }]);
  } finally {
    setIsLoading(false);
  }
};
const send = () => {
    sendTextMessage(input);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setUnreadCount(0);
  };

  const startNewChat = async () => {
    // Clear current chat
    setMessages([]);
    setInput("");
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Remove current thread from localStorage
    localStorage.removeItem('chatThreadId');
    
    // Start new session
    try {
      const response = await fetch('/api/chat/start', {
        method: 'POST',
      });
      const data = await response.json();
      const newThreadId = data.threadId;
      localStorage.setItem('chatThreadId', newThreadId);
      setThreadId(newThreadId);
      
      // Start with welcome message
      setMessages([{ role: "assistant", text: "Assalam-o-Alaikum! I am M Salman Tahir, a legal expert. To better assist you, could you please share your name, phone number, and email address?" }]);
    } catch (error) {
      console.error('Failed to create new session:', error);
      setMessages([{ role: "assistant", text: "Assalam-o-Alaikum. I am M Salman Tahir. How may I assist you today?" }]);
    }
  };

  const fetchChatTopics = async () => {
    try {
      const response = await fetch('/api/chat/topics');
      const topics = await response.json();
      setChatTopics(topics);
    } catch (error) {
      console.error('Failed to fetch chat topics:', error);
    }
  };

  const loadChatTopic = async (topicThreadId: string) => {
    try {
      // Load history for this thread
      const response = await fetch(`/api/chat/history/${topicThreadId}`);
      const history: ChatHistory[] = await response.json();
      
      const loadedMessages: Message[] = [];
      history.forEach(h => {
        loadedMessages.push({ role: 'user', text: h.message, type: h.message_type as 'text' | 'voice' });
        loadedMessages.push({ role: 'assistant', text: h.response || '' });
      });
      
      if (loadedMessages.length === 0) {
        loadedMessages.push({ role: "assistant", text: "Assalam-o-Alaikum! I am M Salman Tahir, a legal expert. To better assist you, could you please share your name, phone number, and email address?" });
      }
      
      setMessages(loadedMessages);
      setThreadId(topicThreadId);
      localStorage.setItem('chatThreadId', topicThreadId);
      setShowTopicsDropdown(false);
    } catch (error) {
      console.error('Failed to load chat topic:', error);
    }
  };

  const toggleTopicsDropdown = () => {
    setShowTopicsDropdown(!showTopicsDropdown);
    if (!showTopicsDropdown) {
      fetchChatTopics();
    }
  };

  const renderMessageText = (text?: string) => {
  if (!text) return <span></span>; // ✅ prevent crash

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, i) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={`${part}-${i}`}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800"
        >
          {part}
        </a>
      );
    }
    return <span key={`${part}-${i}`}>{part}</span>;
  });
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

          {/* New Chat Option */}
          <div className="px-4 py-2 border-b border-border bg-muted/50 relative chat-topics-dropdown">
            <div className="flex items-center justify-between">
              <button
                onClick={startNewChat}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Start new chat"
              >
                <RotateCcw size={14} />
                New Chat
              </button>
              <button
                onClick={toggleTopicsDropdown}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Show chat history"
              >
                <ChevronDown size={14} className={`transform transition-transform ${showTopicsDropdown ? 'rotate-180' : ''}`} />
              </button>
            </div>
            
            {/* Chat Topics Dropdown */}
            {showTopicsDropdown && (
              <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-b-md shadow-lg z-10 max-h-48 overflow-y-auto">
                {chatTopics.length > 0 ? (
                  chatTopics.map((topic) => (
                    <button
                      key={topic.thread_id}
                      onClick={() => loadChatTopic(topic.thread_id)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors border-b border-border/50 last:border-b-0"
                    >
                      <div className="truncate text-muted-foreground">
                        {topic.first_message?.substring(0, 50) || 'New conversation'}...
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(topic.created_at).toLocaleDateString()} • {topic.message_count} messages
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-muted-foreground">
                    No previous conversations
                  </div>
                )}
              </div>
            )}
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
                {renderMessageText(msg.text || '')}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border flex flex-col">
            {selectedFile && (
              <div className="px-4 py-2 flex items-center gap-2 bg-muted">
                <Paperclip size={14} />
                <span className="font-sans text-sm flex-1 truncate">{selectedFile.name}</span>
                <button
                  onClick={removeFile}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Remove file"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            <div className="flex items-center">
              {!isRecording && !isLoading && (
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !isLoading && send()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 bg-transparent font-sans text-sm outline-none placeholder:text-muted-foreground"
                  disabled={isLoading}
                />
              )}
              {isRecording && (
                <div className="flex-1 px-4 py-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="font-sans text-sm text-muted-foreground">Recording...</span>
                </div>
              )}
              {isLoading && !isRecording && (
                <div className="flex-1 px-4 py-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="font-sans text-sm text-muted-foreground">Thinking...</span>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="*/*"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isRecording}
                className={`px-2 transition-colors ${
                  isLoading || isRecording ? "text-muted-foreground opacity-50 cursor-not-allowed" : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="Attach file"
              >
                <Paperclip size={16} />
              </button>
              <button
                onClick={toggleRecording}
                disabled={isLoading}
                className={`px-2 transition-colors ${
                  isRecording ? "text-red-500" : "text-muted-foreground hover:text-foreground"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                aria-label={isRecording ? "Stop recording" : "Voice input"}
              >
                {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
              <button
                onClick={send}
                disabled={isLoading || (!input.trim() && !selectedFile)}
                className={`px-4 transition-colors ${
                  isLoading || (!input.trim() && !selectedFile) ? "text-muted-foreground opacity-50 cursor-not-allowed" : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="Send"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBox;
