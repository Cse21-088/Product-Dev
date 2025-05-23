import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';

const AIAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to generate AI responses based on user input
  const generateAIResponse = (userMessage) => {
    // Simple response logic based on keywords
    const lowerCaseMessage = userMessage.toLowerCase();
    
    if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
      return "Hello! How can I help you today?";
    } 
    else if (lowerCaseMessage.includes('help')) {
      return "I can help answer questions about our products, services, or provide general assistance. What would you like to know?";
    }
    else if (lowerCaseMessage.includes('product') || lowerCaseMessage.includes('service')) {
      return "We offer a range of innovative solutions designed to help businesses grow. Our main products include AI-powered analytics, custom software development, and digital transformation consulting.";
    }
    else if (lowerCaseMessage.includes('price') || lowerCaseMessage.includes('cost')) {
      return "Our pricing varies based on your specific needs. We offer flexible plans starting from $99/month for basic services. Would you like to discuss a custom quote?";
    }
    else if (lowerCaseMessage.includes('contact') || lowerCaseMessage.includes('support')) {
      return "You can reach our support team at support@example.com or call us at (555) 123-4567 during business hours.";
    }
    else if (lowerCaseMessage.includes('thank')) {
      return "You're welcome! Is there anything else I can help you with?";
    }
    else if (lowerCaseMessage.includes('bye') || lowerCaseMessage.includes('goodbye')) {
      return "Thank you for chatting with me! Have a great day. Feel free to return if you have more questions.";
    }
    else {
      return "I appreciate your message. For more specific information or assistance, could you please provide more details about what you're looking for?";
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = {
      text: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Simulate processing delay
    setTimeout(() => {
      const aiResponse = {
        text: generateAIResponse(input),
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, aiResponse]);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="fixed bottom-4 right-4 flex h-[600px] w-96 flex-col rounded-xl border border-emerald-500/20 bg-black/95 shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-900/30 to-teal-900/30 p-4">
        <Bot className="text-emerald-400" size={24} />
        <h3 className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-lg font-semibold text-transparent">AI Assistant</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-emerald-300/80">No messages yet. Start the conversation!</div>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                  : 'bg-black/70 border border-emerald-500/10 text-emerald-200'
              }`}
            >
              <div className="mb-1 flex items-center gap-2">
                {message.sender === 'ai' ? (
                  <Bot size={16} className="text-emerald-400" />
                ) : (
                  <User size={16} className="text-white" />
                )}
                <span className="text-xs opacity-70">
                  {message.sender === 'user' ? 'You' : 'AI Assistant'}
                </span>
              </div>
              <p>{message.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-black/70 p-3">
              <div className="flex gap-2">
                <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-400 delay-100" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-400 delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-emerald-500/20 bg-gradient-to-r from-emerald-900/30 to-teal-900/30 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border border-emerald-500/20 bg-black/80 px-4 py-2 text-emerald-100 placeholder-emerald-300/60 transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-white transition-colors hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIAssistant;