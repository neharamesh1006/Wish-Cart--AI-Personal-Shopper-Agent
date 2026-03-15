import { useState, useRef, useEffect } from 'react';
import { Send, ShoppingBag, Sparkles, Loader2, ShoppingCart, X } from 'lucide-react';
import './index.css';

function App() {
  const [messages, setMessages] = 
    useState([
    { role: 'assistant', text: "Hello! I'm Wish, your AI personal shopper. What are you looking to buy today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
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
        text: "I'm sorry, I'm having trouble connecting to the database. Please make sure the backend server is running."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const addToCart = (product) => {
    setCartItems(prev => {
      // Check if already in cart
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    
    // Auto-open the cart briefly so the user sees it added, or just pop a toast (we'll just open the drawer for simplicity)
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="app-container">
      <header>
        <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
          <ShoppingBag color="#ec4899" size={28} />
          <h1>Wish-Cart</h1>
        </div>
        
        <div style={{ marginLeft: 'auto', position: 'relative' }}>
          <button className="cart-toggle-btn" onClick={() => setIsCartOpen(!isCartOpen)}>
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
          </button>
        </div>
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
                          <div className="product-price">${product.price.toFixed(2)}</div>
                          <button 
                            className="add-to-cart-btn"
                            onClick={() => addToCart(product)}
                          >
                            Add to Cart
                          </button>
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
              <span style={{marginLeft: "8px", color: "var(--text-secondary)"}}>Wish is searching the database...</span>
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
              placeholder="E.g., I need a gift for my sister who likes coffee..."
            />
            <button type="submit" className="send-button" disabled={!input.trim() || isTyping}>
              <Send size={18} />
            </button>
          </div>
        </form>
      </main>

      {/* Cart Drawer */}
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button onClick={() => setIsCartOpen(false)} className="close-cart-btn"><X size={24} /></button>
        </div>
        
        <div className="cart-body">
          {cartItems.length === 0 ? (
            <div className="empty-cart">Your cart is feeling a bit empty. Ask Wish for some recommendations!</div>
          ) : (
            <div className="cart-items">
              {cartItems.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-image" style={{ background: item.image }}></div>
                  <div className="cart-item-details">
                    <h4>{item.name}</h4>
                    <div className="cart-item-bottom">
                      <span className="cart-item-price">${item.price.toFixed(2)}</span>
                      <span className="cart-item-qty">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="remove-item-btn"><X size={16} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total:</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <button className="checkout-btn">Proceed to Checkout</button>
          </div>
        )}
      </div>

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
