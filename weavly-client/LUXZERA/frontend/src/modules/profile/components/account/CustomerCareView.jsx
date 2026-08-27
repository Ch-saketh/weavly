import React, { useState, useEffect, useRef } from "react";
import { Send, LifeBuoy, Sparkles } from "lucide-react";

const CustomerCareView = ({ userId }) => {
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [typing, setTyping] = useState(false);
  const chatContainerRef = useRef(null);

  const faqSuggestions = [
    { label: "Return Policy", text: "What is your return and exchange policy?" },
    { label: "Track Shipment", text: "When will my order LZ-84729 arrive?" },
    { label: "Custom Fitting", text: "How do I request a custom size adjustment?" }
  ];

  // Load chat history from localStorage
  useEffect(() => {
    const storageKey = `Weavly_chat_${userId || "guest"}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      const initialMessages = [
        {
          id: "msg-1",
          sender: "agent",
          text: "Welcome to Weavly Concierge Support. I am your personal shopping assistant. How may I assist you today?",
          time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
        }
      ];
      localStorage.setItem(storageKey, JSON.stringify(initialMessages));
      setMessages(initialMessages);
    }
  }, [userId]);

  // Scroll to bottom of chat internally (avoids scrolling the entire browser window/page)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const saveChat = (updated) => {
    const storageKey = `Weavly_chat_${userId || "guest"}`;
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setMessages(updated);
  };

  const getAutoReply = (userQuery) => {
    const query = userQuery.toLowerCase();
    if (query.includes("return") || query.includes("exchange")) {
      return "Weavly offers free returns and exchanges on all clothing within 14 days of delivery. Items must be unworn with all original tags attached.";
    }
    if (query.includes("order") || query.includes("shipment") || query.includes("arrive") || query.includes("lz-")) {
      return "Your order LZ-84729 has been shipped! It is currently in transit. You can review the step-by-step progress directly in your 'My Orders' history page.";
    }
    if (query.includes("fitting") || query.includes("adjust") || query.includes("custom") || query.includes("tailor")) {
      return "For bespoke customizations, our design team will verify the measurements in your Sizing Profile. We will contact you at your registered email within 2 hours.";
    }
    return `Thank you for your message. I have opened a concierge support ticket (ID: TKT-${Math.floor(1000 + Math.random() * 9000)}) for your inquiry. A specialist will review details and reply shortly.`;
  };

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;

    const userMsg = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    };

    const nextMessages = [...messages, userMsg];
    saveChat(nextMessages);
    setInputMsg("");

    // Simulate concierge typing status
    setTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 1400));
    setTyping(false);

    const agentMsg = {
      id: `msg-agent-${Date.now()}`,
      sender: "agent",
      text: getAutoReply(textToSend),
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    };

    saveChat([...nextMessages, agentMsg]);
  };

  return (
    <div className="h-[420px] flex flex-col justify-between overflow-hidden relative font-['Plus_Jakarta_Sans',sans-serif]">
      <style>{`
        @keyframes cc-msg-in {
          from { transform: translateY(6px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .cc-msg-animate {
          animation: cc-msg-in 0.25s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `}</style>

      {/* Header */}
      <div className="pb-4 mb-1 border-b border-[#EDEBE8] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#F5EDE4] flex items-center justify-center">
            <LifeBuoy size={15} className="text-[#C8702A]" />
          </div>
          <div>
            <h2 className="text-[13px] font-bold text-[#1A1A1A] tracking-tight">Concierge Assistant</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-medium text-[#ABABAB]">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-semibold text-[#ABABAB] tracking-[0.1em] uppercase bg-[#F5F4F2] border border-[#E8E5E0] px-2.5 py-1 rounded-lg select-none">
          <Sparkles size={9} className="text-[#C8702A]" />
          <span>Zyra AI</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto space-y-3 my-2 pr-1 py-1" 
        style={{ maxHeight: "240px" }}
      >
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"} cc-msg-animate`}
            >
              <div
                className={`text-[12px] p-3.5 rounded-2xl max-w-[82%] leading-relaxed ${
                  isUser
                    ? "bg-[#F5EDE4] text-[#1A1A1A] border border-[#E8DFD4] rounded-tr-md"
                    : "bg-[#F5F4F2] border border-[#E8E5E0] text-[#4A4A4A] rounded-tl-md"
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[8px] text-[#BFBFBF] mt-1 px-1 font-medium">{msg.time}</span>
            </div>
          );
        })}

        {/* Typing indicator */}
        {typing && (
          <div className="flex flex-col items-start cc-msg-animate">
            <div className="bg-[#F5F4F2] border border-[#E8E5E0] p-3 rounded-2xl rounded-tl-md flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#C8702A] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-[#C8702A] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-[#C8702A] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </div>

      {/* Suggestion Chips */}
      <div className="shrink-0 flex gap-2 flex-wrap pb-2 border-t border-[#EDEBE8] pt-3">
        {faqSuggestions.map((faq) => (
          <button
            key={faq.label}
            onClick={() => handleSendMessage(faq.text)}
            className="px-3 py-1.5 bg-[#FAFAF9] hover:bg-[#F5EDE4] border border-[#E8E5E0] hover:border-[#D8CEBF] rounded-lg text-[10px] font-semibold text-[#6B6B6B] hover:text-[#1A1A1A] transition-all duration-200"
          >
            {faq.label}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputMsg);
        }}
        className="shrink-0 flex gap-2 p-1.5 bg-[#F5F4F2] border border-[#E8E5E0] rounded-xl"
      >
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder="Ask concierge support..."
          className="flex-1 bg-transparent border-none outline-none focus:ring-0 px-2.5 py-1 text-[12px] text-[#1A1A1A] placeholder-[#BFBFBF] font-medium"
          required
        />
        <button
          type="submit"
          className="p-2.5 bg-[#1A1A1A] hover:bg-[#000000] text-white rounded-lg transition-all duration-200 shadow-sm"
        >
          <Send size={12} />
        </button>
      </form>
    </div>
  );
};

export default CustomerCareView;
