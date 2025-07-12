import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = '/api/ai';

const AIChat = () => {
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rating, setRating] = useState({}); // { [messageId]: rating }
  const [feedback, setFeedback] = useState({}); // { [messageId]: feedback }
  const [showSupport, setShowSupport] = useState({}); // { [messageId]: true/false }
  const [supportMsg, setSupportMsg] = useState({}); // { [messageId]: text }
  const [supportSent, setSupportSent] = useState({}); // { [messageId]: true/false }

  // Získání historie po načtení komponenty
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/history`);
      setHistory(res.data);
    } catch (err) {
      setError('Chyba při načítání historie.');
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/chat`, { message });
      setHistory([res.data, ...history]);
      setMessage('');
    } catch (err) {
      setError('Chyba při odesílání zprávy.');
    }
    setLoading(false);
  };

  const handleRate = async (messageId, value) => {
    try {
      await axios.post(`${API_URL}/rate`, { messageId, rating: value, feedback: feedback[messageId] || '' });
      setRating({ ...rating, [messageId]: value });
      // Po negativním hodnocení zobrazit formulář pro podporu
      if (value <= 2) {
        setShowSupport({ ...showSupport, [messageId]: true });
      }
    } catch (err) {
      setError('Chyba při hodnocení.');
    }
  };

  const handleSupportSend = async (messageId) => {
    try {
      await axios.post('/api/support/ticket', {
        message: supportMsg[messageId] || '',
        aiMessageId: messageId
      });
      setSupportSent({ ...supportSent, [messageId]: true });
    } catch (err) {
      setError('Chyba při odesílání požadavku na podporu.');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-2">AI Chat</h2>
      <div className="mb-4">
        <input
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          className="border p-2 w-3/4"
          placeholder="Zadejte zprávu..."
          disabled={loading}
        />
        <button onClick={handleSend} className="ml-2 px-4 py-2 bg-blue-500 text-white rounded" disabled={loading}>
          Odeslat
        </button>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="space-y-4">
        {history.map((item) => (
          <div key={item._id} className="border p-2 rounded bg-gray-50">
            <div><b>Vy:</b> {item.message}</div>
            <div><b>AI:</b> {
              // Detekce FAQ odkazu v odpovědi
              (() => {
                const faqMatch = item.reply.match(/Doporučený článek: (.+?) – (https?:\/\/\S+)/);
                if (faqMatch) {
                  const [_, faqText, faqUrl] = faqMatch;
                  const mainReply = item.reply.replace(faqMatch[0], '').trim();
                  return <>
                    <span>{mainReply}</span>
                    <div className="mt-2">
                      <a href={faqUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{faqText}</a>
                    </div>
                  </>;
                }
                return item.reply;
              })()
            }</div>
            <div className="flex items-center mt-2">
              <span className="mr-2">Hodnocení:</span>
              {[1,2,3,4,5].map(val => (
                <button
                  key={val}
                  className={`mx-1 px-2 py-1 rounded ${rating[item._id] === val ? 'bg-green-400' : 'bg-gray-200'}`}
                  onClick={() => handleRate(item._id, val)}
                  disabled={!!rating[item._id]}
                >
                  {val}
                </button>
              ))}
              <input
                type="text"
                placeholder="Zpětná vazba"
                className="ml-2 border p-1"
                value={feedback[item._id] || ''}
                onChange={e => setFeedback({ ...feedback, [item._id]: e.target.value })}
                disabled={!!rating[item._id]}
              />
              {/* Formulář pro podporu po negativním hodnocení */}
              {rating[item._id] && rating[item._id] <= 2 && (
                <div className="ml-4 flex flex-col gap-2">
                  {supportSent[item._id] ? (
                    <span className="text-green-600">Požadavek na podporu byl odeslán.</span>
                  ) : showSupport[item._id] ? (
                    <>
                      <textarea
                        className="border p-1 w-full mt-2"
                        rows={2}
                        placeholder="Popište svůj problém..."
                        value={supportMsg[item._id] || ''}
                        onChange={e => setSupportMsg({ ...supportMsg, [item._id]: e.target.value })}
                      />
                      <button
                        className="px-3 py-1 bg-red-500 text-white rounded"
                        onClick={() => handleSupportSend(item._id)}
                        disabled={!supportMsg[item._id]}
                      >
                        Odeslat požadavek na podporu
                      </button>
                    </>
                  ) : (
                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded"
                      onClick={() => setShowSupport({ ...showSupport, [item._id]: true })}
                    >
                      Kontaktovat podporu
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIChat;
