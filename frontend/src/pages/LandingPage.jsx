import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Shield,
  PieChart,
  ChevronRight,
  BarChart3,
  Globe,
  Star,
  Users,
  CheckCircle,
  Smartphone,
  ChevronDown,
  Bot,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(0);

  const tickerVariants = {
    animate: {
      x: [0, -1035],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 15,
          ease: "linear",
        },
      },
    },
  };

  const featureVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const faqs = [
    {
      q: "Is InvestIQ really free to use?",
      a: "Yes! Creating an account and using our core portfolio tracking and analytics tools is completely free. We believe financial clarity should be accessible to everyone.",
    },
    {
      q: "Are the stock market prices real-time?",
      a: "Absolutely. We pull live market data directly from Wall Street and the NSE/BSE. When the markets are open, your dashboard reflects real-time price movements.",
    },
    {
      q: "Is my payment information secure?",
      a: "We never store your credit card details. All transactions are securely encrypted and processed directly through the Stripe Payment Gateway, the industry standard for online security.",
    },
    {
      q: "Can I use this to practice trading?",
      a: "Yes! InvestIQ is the perfect sandbox. You can simulate buying assets with our Stripe integration (using test cards) and watch how your theoretical portfolio would perform in the real market.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans overflow-hidden text-slate-800">
      {/* 🌟 PUBLIC NAVBAR */}
      <nav className="fixed top-0 w-full bg-white/70 backdrop-blur-xl border-b border-slate-200/50 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-2xl font-extrabold text-blue-600 tracking-tight">
            <TrendingUp className="w-7 h-7" /> InvestIQ
          </div>
          <div className="flex gap-4 items-center">
            <Link
              to="/login"
              className="text-slate-600 hover:text-blue-600 font-bold px-4 py-2 transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ✨ HERO SECTION */}
      <div className="pt-36 pb-20 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="md:w-1/2"
        >
          <div className="inline-block bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-sm font-bold mb-6 border border-blue-100 shadow-sm">
            ✨ The Calm Way to Invest
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-800 leading-tight mb-6 tracking-tight">
            Build wealth, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
              without the stress.
            </span>
          </h1>
          <p className="text-xl text-slate-500 mb-8 font-medium max-w-lg leading-relaxed">
            Invest in top NSE/BSE stocks, track your portfolio with beautiful
            analytics, and secure your financial future in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center mb-8">
            <Link
              to="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white font-bold text-lg px-8 py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
            >
              Start Investing <ChevronRight className="w-5 h-5" />
            </Link>
            <span className="text-sm text-slate-400 font-medium flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-teal-500" /> No hidden fees
            </span>
          </div>
        </motion.div>

        {/* Hero Infographic Graphic */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="md:w-1/2 relative w-full mt-10 md:mt-0"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-200 to-teal-100 rounded-[3rem] transform rotate-3 scale-105 -z-10 blur-xl opacity-60"></div>

          <div className="relative w-full aspect-[4/3] bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] border-4 border-white overflow-hidden flex flex-col justify-end">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-blue-50/40"></div>
            <div className="absolute inset-0 flex flex-col justify-between py-8 opacity-20">
              <div className="w-full h-px bg-slate-300"></div>
              <div className="w-full h-px bg-slate-300"></div>
              <div className="w-full h-px bg-slate-300"></div>
              <div className="w-full h-px bg-slate-300"></div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-full flex items-end justify-between px-8 md:px-12 pb-8 opacity-60 z-10">
              <div className="w-3 h-[30%] bg-rose-300 rounded-full relative">
                <div className="absolute top-[-10px] bottom-[-10px] left-[5px] w-[2px] bg-rose-300"></div>
              </div>
              <div className="w-3 h-[25%] bg-rose-300 rounded-full relative">
                <div className="absolute top-[-15px] bottom-[-5px] left-[5px] w-[2px] bg-rose-300"></div>
              </div>
              <div className="w-3 h-[40%] bg-teal-300 rounded-full relative">
                <div className="absolute top-[-20px] bottom-[-10px] left-[5px] w-[2px] bg-teal-300"></div>
              </div>
              <div className="w-3 h-[35%] bg-rose-300 rounded-full relative">
                <div className="absolute top-[-10px] bottom-[-20px] left-[5px] w-[2px] bg-rose-300"></div>
              </div>
              <div className="w-3 h-[50%] bg-teal-300 rounded-full relative">
                <div className="absolute top-[-15px] bottom-[-15px] left-[5px] w-[2px] bg-teal-300"></div>
              </div>
              <div className="w-3 h-[65%] bg-teal-300 rounded-full relative">
                <div className="absolute top-[-10px] bottom-[-25px] left-[5px] w-[2px] bg-teal-300"></div>
              </div>
              <div className="w-3 h-[60%] bg-rose-300 rounded-full relative">
                <div className="absolute top-[-20px] bottom-[-10px] left-[5px] w-[2px] bg-rose-300"></div>
              </div>
              <div className="w-3 h-[80%] bg-teal-300 rounded-full relative">
                <div className="absolute top-[-15px] bottom-[-15px] left-[5px] w-[2px] bg-teal-300"></div>
              </div>
            </div>
            <svg
              className="absolute bottom-0 w-full h-[80%] z-20"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,100 L0,70 Q15,80 30,50 T60,60 T100,20 L100,100 Z"
                fill="url(#chartGradient)"
              />
              <path
                d="M0,70 Q15,80 30,50 T60,60 T100,20"
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="2.5"
              />
              <path
                d="M0,85 Q25,90 50,70 T100,40"
                fill="none"
                stroke="#14b8a6"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.6"
              />
            </svg>
          </div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute -left-6 top-10 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white flex items-center gap-4 z-30"
          >
            <div className="bg-teal-50 p-3 rounded-2xl text-teal-600">
              <TrendingUp size={22} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                NIFTY 50
              </p>
              <p className="text-lg font-black text-slate-800">+2.45%</p>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            className="absolute -right-6 bottom-10 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white flex items-center gap-4 z-30"
          >
            <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
              <PieChart size={22} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Portfolio Health
              </p>
              <p className="text-lg font-black text-slate-800">Excellent</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* 🌊 INFINITE SLIDING TICKER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 overflow-hidden shadow-inner relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-blue-600 to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-indigo-600 to-transparent z-10"></div>
        <motion.div
          className="flex whitespace-nowrap"
          variants={tickerVariants}
          animate="animate"
        >
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-14 px-6">
              {[
                { sym: "RELIANCE", p: "₹2,950.20", c: "+1.2%" },
                { sym: "TCS", p: "₹4,120.50", c: "+0.8%" },
                { sym: "HDFCBANK", p: "₹1,430.10", c: "-0.3%" },
                { sym: "INFY", p: "₹1,680.00", c: "+2.1%" },
                { sym: "ZOMATO", p: "₹165.40", c: "+5.4%" },
                { sym: "TATAMOTORS", p: "₹980.75", c: "+1.9%" },
                { sym: "ITC", p: "₹410.25", c: "-0.5%" },
              ].map((stock, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="font-bold text-white tracking-wider">
                    {stock.sym}
                  </span>
                  <span className="text-blue-200 font-medium">{stock.p}</span>
                  <span
                    className={
                      stock.c.startsWith("+")
                        ? "text-teal-300 font-bold"
                        : "text-rose-300 font-bold"
                    }
                  >
                    {stock.c}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      {/* TRUST BANNER */}
      <div className="bg-white border-b border-slate-100 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-12 opacity-80">
          <div className="flex items-center gap-2">
            <div className="flex text-amber-400">
              <Star size={20} fill="currentColor" />
              <Star size={20} fill="currentColor" />
              <Star size={20} fill="currentColor" />
              <Star size={20} fill="currentColor" />
              <Star size={20} fill="currentColor" />
            </div>
            <span className="font-bold text-slate-700">
              4.9/5 Average Rating
            </span>
          </div>
          <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-slate-300"></div>
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <Users size={20} className="text-blue-500" /> Trusted by 10,000+
            Investors
          </div>
          <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-slate-300"></div>
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <Shield size={20} className="text-teal-500" /> Bank-grade Security
          </div>
        </div>
      </div>

      {/* 🚀 HOW IT WORKS SECTION */}
      <div className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">
            Investing made beautifully simple
          </h2>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
            Skip the complicated jargon. Get your portfolio up and running in
            three effortless steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blue-100 via-teal-100 to-blue-100 -z-10 transform -translate-y-1/2"></div>

          {[
            {
              step: "01",
              title: "Create an Account",
              desc: "Sign up in seconds. No lengthy paperwork, just a secure and seamless onboarding.",
              icon: <Smartphone size={28} />,
            },
            {
              step: "02",
              title: "Explore the Market",
              desc: "Search through live NSE/BSE data. Find the companies you believe in effortlessly.",
              icon: <Globe size={28} />,
            },
            {
              step: "03",
              title: "Invest & Track",
              desc: "Use dummy funds to buy assets securely via Stripe. Watch your wealth grow visually.",
              icon: <BarChart3 size={28} />,
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              variants={featureVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.2 }}
              className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 text-center relative hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-white px-4 py-1 rounded-full text-sm font-black text-blue-600 border border-slate-100 shadow-sm">
                {item.step}
              </div>
              <div className="w-16 h-16 mx-auto bg-slate-50 text-slate-700 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                {item.title}
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 💎 FEATURES SECTION */}
      <div className="py-24 px-6 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div
            variants={featureVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-[#f8fafc] p-6 rounded-3xl border border-slate-100">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <Globe size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  Live Data
                </h3>
                <p className="text-slate-500 text-sm font-medium">
                  Real-time Wall Street quotes streamed directly to your screen.
                </p>
              </div>
              <div className="bg-[#f8fafc] p-6 rounded-3xl border border-slate-100 mt-0 sm:mt-8">
                <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center mb-4">
                  <PieChart size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  Visual Analytics
                </h3>
                <p className="text-slate-500 text-sm font-medium">
                  Understand your wealth with gorgeous, exportable charts.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={featureVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-black text-slate-800 mb-6 leading-tight">
              Professional tools,
              <br />
              calm experience.
            </h2>
            <p className="text-lg text-slate-500 font-medium mb-8 leading-relaxed">
              We stripped away the confusing charts and aggressive
              notifications. InvestIQ is designed to give you clarity and peace
              of mind while managing your portfolio.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                "Smart Asset Allocation",
                "Bank-Grade Stripe Security",
                "One-Click PDF Reports",
              ].map((feature, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-slate-700 font-bold"
                >
                  <CheckCircle className="w-5 h-5 text-teal-500" /> {feature}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>

      {/* ❓ FAQ SECTION */}
      <div className="py-24 px-6 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">
            Got Questions?
          </h2>
          <p className="text-lg text-slate-500 font-medium">
            Everything you need to know about getting started.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={false}
              className={`bg-white border ${openFaq === index ? "border-blue-200 shadow-md" : "border-slate-200 shadow-sm hover:border-blue-100"} rounded-2xl overflow-hidden transition-all duration-300`}
            >
              <button
                className="w-full flex items-center justify-between p-6 text-left"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <span className="font-bold text-lg text-slate-800">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-blue-500 transition-transform duration-300 ${openFaq === index ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="p-6 pt-0 text-slate-500 font-medium leading-relaxed border-t border-slate-50 mt-2">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 🌊 BOTTOM CTA */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600 py-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Ready to find your financial peace?
          </h2>
          <p className="text-xl text-blue-100 mb-10 font-medium">
            Join InvestIQ today and experience the calmest way to manage your
            portfolio.
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-blue-600 font-bold text-xl px-10 py-4 rounded-2xl hover:scale-105 transition-transform duration-300 shadow-[0_20px_40px_rgba(0,0,0,0.1)]"
          >
            Create Free Account
          </Link>
          <p className="mt-6 text-blue-200 text-sm font-medium">
            Takes less than 60 seconds.
          </p>
        </div>
      </div>
    </div>
  );
}
