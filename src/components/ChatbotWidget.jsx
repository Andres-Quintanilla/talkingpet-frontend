import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, ThumbsUp, ThumbsDown } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import '../styles/chatbot.css';

export default function ChatbotWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const storedSessionId = localStorage.getItem('tp_chat_session');
    if (storedSessionId) {
      setSessionId(storedSessionId);
      loadHistory(storedSessionId);
    }
  }, []);

  const loadHistory = async (sid) => {
    try {
      const { data } = await api.get(`/api/chat/history/${sid}`);
      if (data.messages && data.messages.length > 0) {
        setMessages(
          data.messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
            messageId: msg.messageId,
          }))
        );
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const { data } = await api.post('/api/chat', {
        message: userMessage,
        sessionId: sessionId,
        userId: user?.id, 
      });

      if (!sessionId && data.sessionId) {
        setSessionId(data.sessionId);
        localStorage.setItem('tp_chat_session', data.sessionId);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply,
          messageId: data.messageId,
        },
      ]);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Lo siento, hubo un error. Intenta nuevamente.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sendFeedback = async (messageId, isUseful) => {
    try {
      await api.post('/api/chat/feedback', {
        messageId,
        isUseful,
      });
    } catch (error) {
      console.error('Error enviando feedback:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    if (messages.length > 0) return;

    const welcomeMsg = user
      ? `¡Hola ${user.nombre}! 👋 Soy el asistente virtual de TalkingPet.

¿En qué puedo ayudarte hoy?

• Ver tu carrito 🛒
• Estado de tus pedidos 📦
• Productos y servicios 🛍️
• Tus cursos inscritos 📚
• Agendar citas 📅
• Horarios y ubicación 📍`
      : `¡Hola! 👋 Soy el asistente virtual de TalkingPet.

¿En qué puedo ayudarte hoy?

• Productos y servicios 🛍️
• Cursos disponibles 📚
• Agendar citas 📅
• Horarios y ubicación 📍
• Métodos de pago 💳

💡 Inicia sesión para ver tu carrito y pedidos personalizados.`;

    setMessages([
      {
        role: 'assistant',
        content: welcomeMsg,
      },
    ]);
  }, [isOpen, user, messages.length]);

  return (
    <>
      <button
        className={`chatbot-toggle ${isOpen ? 'chatbot-toggle--active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir chat"
        title="Chat de ayuda"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header__title">
              <MessageCircle size={20} />
              <span>TalkingPet Asistente</span>
            </div>
            <button
              className="chatbot-header__close"
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar chat"
            >
              <X size={20} />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chatbot-message chatbot-message--${msg.role}`}
              >
                <div className="chatbot-message__content">{msg.content}</div>

                {msg.role === 'assistant' && msg.messageId && (
                  <div className="chatbot-message__feedback">
                    <button
                      onClick={() => sendFeedback(msg.messageId, true)}
                      aria-label="Respuesta útil"
                      title="Útil"
                    >
                      <ThumbsUp size={14} />
                    </button>
                    <button
                      onClick={() => sendFeedback(msg.messageId, false)}
                      aria-label="Respuesta no útil"
                      title="No útil"
                    >
                      <ThumbsDown size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="chatbot-message chatbot-message--assistant">
                <div className="chatbot-message__content chatbot-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje..."
              disabled={loading}
              aria-label="Mensaje del chat"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              aria-label="Enviar mensaje"
              title="Enviar"
            >
              <Send size={20} />
            </button>
          </div>

          <div className="chatbot-footer">Powered by TalkingPet AI 🐾</div>
        </div>
      )}
    </>
  );
}
