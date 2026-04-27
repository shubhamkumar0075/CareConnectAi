import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

interface Message {
  text: string;
  isBot: boolean;
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! I'm the CareConnect Assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { text: userMsg, isBot: false }]);
    setInput('');

    // Simulate AI response based on keywords
    setTimeout(() => {
      let botReply = "I'm sorry, I didn't understand that. You can ask me about 'booking', 'doctors', or 'status'.";
      const lowerInput = userMsg.toLowerCase();

      if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
        botReply = "Hi there! Need help with an appointment?";
      } else if (lowerInput.includes('book') || lowerInput.includes('appointment')) {
        botReply = "To book an appointment, go to your Dashboard, select a doctor from the list, pick a date, and click 'Book Now'.";
      } else if (lowerInput.includes('doctor') || lowerInput.includes('specialist')) {
        botReply = "We have various specialists available. You can view them all in the 'Select Doctor' dropdown on your dashboard.";
      } else if (lowerInput.includes('status') || lowerInput.includes('cancel')) {
        botReply = "You can view the status of your appointments on the Dashboard. If you need to cancel, please contact the clinic or the doctor.";
      }

      setMessages(prev => [...prev, { text: botReply, isBot: true }]);
    }, 1000);
  };

  return (
    <div className="chatbot-container">
      {!isOpen && (
        <button className="chatbot-toggle glass-panel" onClick={() => setIsOpen(true)}>
          <MessageSquare size={24} color="var(--accent-color)" />
        </button>
      )}

      {isOpen && (
        <div className="chatbot-window glass-panel">
          <div className="chatbot-header">
            <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={18} /> CareConnect AI
            </h4>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message-wrapper ${msg.isBot ? 'bot' : 'user'}`}>
                <div className={`message-bubble ${msg.isBot ? 'bot-bubble' : 'user-bubble'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
