import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Modal from '../ui/Modal';
import api from '../../services/api';

const AssistantContext = createContext(null);
export const useAssistant = () => useContext(AssistantContext);

export default function AIAssistantChat({ children }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const transcript = useRef(null);
  const opener = useRef(null);
  const request = useRef(null);
  useEffect(() => {
    setMessages([]); setMessage(''); setOpen(false); setSending(false);
    return () => request.current?.abort();
  }, [user?._id]);
  useEffect(() => {
    if (transcript.current) transcript.current.scrollTop = transcript.current.scrollHeight;
  }, [open, messages, sending]);

  function close() {
    setOpen(false);
    requestAnimationFrame(() => opener.current?.focus());
  }

  async function send(event) {
    event.preventDefault();
    const text = message.trim();
    if (!text || sending) return;
    setMessages(previous => [...previous, { sender: 'You', text }]);
    setMessage('');
    setSending(true);
    const controller = new AbortController();
    request.current = controller;
    try {
      const result = await api.post('/ai/chat', { message: text }, { signal: controller.signal });
      if (controller.signal.aborted) return;
      const reply = result.data?.response;
      if (typeof reply !== 'string' || !reply.trim()) throw new Error('Empty reply');
      setMessages(previous => [...previous, { sender: 'Assistant', text: reply }]);
    } catch {
      if (!controller.signal.aborted) setMessages(previous => [...previous, { sender: 'Assistant', text: 'Chat is unavailable. Please try again later.' }]);
    } finally {
      if (!controller.signal.aborted) setSending(false);
    }
  }

  return (
    <AssistantContext.Provider value={trigger => { opener.current = trigger; setOpen(true); }}>
      {children}
      <Modal isOpen={open} onClose={close} title="QuickMeds assistant" size="sm">
        <p className="qm-chat-note">For general questions. A pharmacist or doctor can advise you about your treatment.</p>
        <div ref={transcript} role="log" aria-label="Chat messages" className="qm-chat-log">
          {messages.map((entry, index) => <div key={index}><strong>{entry.sender}</strong><p>{entry.text}</p></div>)}
        </div>
        {sending && <p role="status" className="qm-chat-note">Waiting for a reply…</p>}
        {isAuthenticated ? <form className="qm-chat-form" onSubmit={send}>
          <input aria-label="Message" placeholder="Type your question" value={message} onChange={event => setMessage(event.target.value)} />
          <button type="submit" aria-label="Send message" disabled={sending || !message.trim()}><Send size={18} /></button>
        </form> : <Link to="/login" state={{ from: location }} onClick={close}>Sign in to chat</Link>}
      </Modal>
    </AssistantContext.Provider>
  );
}
