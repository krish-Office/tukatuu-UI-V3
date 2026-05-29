"use client";

import { useState } from "react";
import { Mail, Phone, MessageSquare, CheckCircle, HelpCircle, Send } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileNav } from "@/components/MobileNav";
import toast from "react-hot-toast";

export default function SupportPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState("Order Tracking");
  const [description, setDescription] = useState("");
  
  const [phoneError, setPhoneError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");

  const topics = [
    "Order Tracking",
    "Returns & Refunds",
    "Product Inquiry",
    "Payment Issues",
    "Account Access",
    "Other"
  ];

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ""); // Keep only digits
    setPhone(val);
    
    // Nepal mobile numbers start with 97 or 98 and have 10 digits
    if (val.length > 0 && !/^9[78]\d{8}$/.test(val)) {
      setPhoneError("Nepal mobile numbers must be 10 digits starting with 97 or 98.");
    } else {
      setPhoneError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !description.trim()) {
      toast.error("Please fill out all inquiry fields.");
      return;
    }

    if (!/^9[78]\d{8}$/.test(phone)) {
      setPhoneError("Please enter a valid Nepali mobile number starting with 97 or 98.");
      toast.error("Invalid phone number.");
      return;
    }

    // Generate a random ticket code
    const generatedId = "TCK-" + Math.floor(100000 + Math.random() * 900000);
    setTicketId(generatedId);
    setSubmitted(true);
    toast.success("Support ticket created!");
  };

  const faqs = [
    { 
      q: "How long does delivery take?", 
      a: "Standard delivery takes 3-5 business days. Express delivery is available for next-day delivery on selected items in major cities." 
    },
    { 
      q: "What is your return policy?", 
      a: "We offer a 30-day hassle-free return policy. If you are not satisfied with your organic purchases, you can return them within 30 days for a full refund." 
    },
    { 
      q: "How can I track my order?", 
      a: "Once your order ships, you will receive a tracking link via email and SMS. You can also view active tracking directly from your account orders dashboard." 
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow bg-mint-50/30 py-10 md:py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          
          {/* Submission Modal */}
          {submitted && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-mint-950/60 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center flex flex-col items-center shadow-2xl border border-mint-100 animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-extrabold text-mint-900 mb-2">Ticket Dispatched!</h2>
                <p className="text-mint-700 text-sm mb-4">
                  Support ticket <strong className="text-mint-900">{ticketId}</strong> has been logged. Our customer success team will reach out shortly regarding your <strong className="text-mint-900">{topic}</strong> inquiry.
                </p>
                <div className="w-full bg-mint-50/50 border border-mint-150 rounded-xl p-3 mb-6 text-xs text-mint-800 text-left space-y-1">
                  <div><strong>Ticket ID:</strong> {ticketId}</div>
                  <div><strong>Client:</strong> {name}</div>
                  <div><strong>Topic:</strong> {topic}</div>
                </div>
                <button 
                  onClick={() => {
                    setSubmitted(false);
                    setName("");
                    setPhone("");
                    setDescription("");
                  }}
                  className="w-full bg-mint-700 hover:bg-mint-800 text-white py-3.5 rounded-xl font-bold transition-all shadow-md"
                >
                  Return to Support
                </button>
              </div>
            </div>
          )}

          {/* Premium Hero Banner Section */}
          <div className="bg-gradient-to-r from-mint-850 via-mint-750 to-mint-600 rounded-3xl p-8 md:p-12 text-center text-white mb-12 shadow-lg shadow-mint-900/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-mint-500 rounded-full opacity-10 blur-3xl -mr-20 -mt-20"></div>
            <div className="relative z-10 max-w-2xl mx-auto">
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
                How can we help you today?
              </h1>
              <p className="text-mint-100/90 font-medium text-base md:text-lg">
                Our premium GreenMart support team is standing by to assist you with order delivery, organic qualities, refunds, or account settings.
              </p>
            </div>
          </div>
          
          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            
            {/* Live Chat */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-mint-200 text-center flex flex-col items-center group cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all shadow-sm">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-5 group-hover:scale-105 transition-transform border border-blue-100">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-mint-900 text-lg mb-2">Live Instant Chat</h3>
              <p className="text-mint-700 text-sm mb-4">Chat with our support executives in real-time. Available 24/7 for order updates.</p>
              <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                Avg Response: Instant
              </span>
            </div>
            
            {/* Email Us */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-mint-200 text-center flex flex-col items-center group cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all shadow-sm">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-5 group-hover:scale-105 transition-transform border border-indigo-100">
                <Mail className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-mint-900 text-lg mb-2">Send an Email</h3>
              <p className="text-mint-700 text-sm mb-4">Send us your detailed inquiries or complaints. We return answers within 24 hours.</p>
              <a href="mailto:support@tukaatu.com" className="text-indigo-700 font-extrabold text-base hover:underline">
                support@tukaatu.com
              </a>
            </div>

            {/* Call Us */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-mint-200 text-center flex flex-col items-center group cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all shadow-sm">
              <div className="w-16 h-16 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center mb-5 group-hover:scale-105 transition-transform border border-pink-100">
                <Phone className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-mint-900 text-lg mb-2">Phone Hotline</h3>
              <p className="text-mint-700 text-sm mb-4">Call our call center directly for high-priority support. Mon-Sun (9AM - 8PM).</p>
              <a href="tel:980-000-0000" className="text-pink-700 font-extrabold text-base hover:underline">
                980-000-0000
              </a>
            </div>
          </div>
          
          {/* Inquiry Form & FAQs Layout */}
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Form */}
            <div className="flex-1 bg-white rounded-3xl border border-mint-200 p-6 md:p-10 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-mint-100 rounded-full opacity-20 blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
              
              <h2 className="text-xl md:text-2xl font-extrabold text-mint-900 mb-8 relative z-10 border-b border-mint-100 pb-4">
                Submit Customer Inquiry Ticket
              </h2>
              
              <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-bold text-mint-850 mb-2">Client Name</label>
                  <input 
                    required
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 bg-mint-50/30 border border-mint-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mint-500 focus:border-mint-500 transition-all text-mint-900 placeholder:text-mint-400" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-mint-850 mb-2">Phone Number</label>
                  <input 
                    required
                    type="tel" 
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="e.g. 98XXXXXXXX"
                    className={`w-full px-4 py-3 bg-mint-50/30 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all text-mint-900 placeholder:text-mint-400 ${
                      phoneError 
                        ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' 
                        : 'border-mint-200 focus:ring-mint-500 focus:border-mint-500'
                    }`} 
                  />
                  {phoneError ? (
                    <p className="text-red-500 text-xs font-semibold mt-1">{phoneError}</p>
                  ) : (
                    <p className="text-mint-600 text-[11px] mt-1">Nepali mobile number starting with 97 or 98.</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-mint-850 mb-2">Support Topic</label>
                  <select 
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    className="w-full px-4 py-3 bg-mint-50/30 border border-mint-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mint-500 focus:border-mint-500 transition-all text-mint-900"
                  >
                    {topics.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-mint-850 mb-2">Detailed Description</label>
                  <textarea 
                    required
                    rows={4} 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Please specify your order ID and the details of your inquiry..."
                    className="w-full px-4 py-3 bg-mint-50/30 border border-mint-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mint-500 focus:border-mint-500 transition-all text-mint-900 placeholder:text-mint-400 resize-none h-32"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={!!phoneError || !phone || !name || !description}
                  className="w-full bg-mint-750 hover:bg-mint-850 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex justify-center items-center h-12 gap-2 mt-4"
                >
                  <Send size={16} /> Dispatch Ticket
                </button>
              </form>
            </div>
            
            {/* FAQs Accordion */}
            <div className="w-full lg:w-[400px] shrink-0">
              <div className="bg-white rounded-3xl border border-mint-200 p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-extrabold text-mint-900 mb-6 flex items-center gap-2 border-b border-mint-100 pb-3">
                  <HelpCircle className="text-mint-700" size={20} /> Frequently Asked
                </h2>
                
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="bg-mint-50/20 border border-mint-150/60 rounded-2xl p-4 md:p-5">
                      <h4 className="font-bold text-mint-900 text-sm mb-2">{faq.q}</h4>
                      <p className="text-xs text-mint-700 leading-relaxed font-medium">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
