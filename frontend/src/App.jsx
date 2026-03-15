import { useState, useRef, useEffect } from 'react';
import { Send, ShoppingBag, Sparkles, Loader2 } from 'lucide-react';
import './index.css';

function App() {
  const [messages, setMessages] = 
    useState([
    { role: 'assistant', text: "Hello! I'm Wish, your AI personal shopper. What are you looking to buy today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: userMessage.text })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: data.response,
        products: data.products
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: "I'm sorry, I'm having trouble connecting to my service right now. Please make sure the backend server is running."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="app-container">
      <header>
        <ShoppingBag color="#ec4899" size={28} />
        <h1>Wish-Cart</h1>
      </header>

      <main className="main-content">
        <div className="message-list">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <div className="message-content">
                {msg.role === 'assistant' && <Sparkles size={16} color="#6366f1" style={{ marginBottom: '8px' }} />}
                <p>{msg.text}</p>
                
                {msg.products && msg.products.length > 0 && (
                  <div className="products-wrapper">
                    {msg.products.map(product => (
                      <div key={product.id} className="product-card">
                        <div className="product-image" style={{ background: product.image }}></div>
                        <div className="product-info">
                          <h3 className="product-title">{product.name}</h3>
                          <div className="product-price">{product.price}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="typing-indicator">
              <Loader2 size={24} className="spin-animation text-primary" style={{ animation: "spin 1s linear infinite", color: "var(--primary)" }} />
              <span style={{marginLeft: "8px", color: "var(--text-secondary)"}}>Wish is thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="input-area">
          <div className="input-container">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="E.g., I'm looking for a gift for a coffee lover..."
            />
            <button type="submit" className="send-button" disabled={!input.trim() || isTyping}>
              <Send size={18} />
            </button>
          </div>
        </form>
      </main>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App;
