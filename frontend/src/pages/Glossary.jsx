import { useState, useEffect } from "react";
import {
  Search,
  BookOpen,
  ArrowLeft,
  Tag,
  Globe,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Glossary() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Web Search States
  const [webResult, setWebResult] = useState(null);
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);
  const [webError, setWebError] = useState("");
  const [isExpanded, setIsExpanded] = useState(false); // Controls the "Read More"

  // 1. Local Database
  const localDictionary = [
    {
      term: "RSI (Relative Strength Index)",
      category: "Technical",
      definition:
        "A momentum indicator measuring the speed and magnitude of recent price changes. Over 70 is 'Overbought', under 30 is 'Oversold'.",
    },
    {
      term: "SMA (Simple Moving Average)",
      category: "Technical",
      definition:
        "The average price of a stock over a specific number of days. It smooths out daily price fluctuations to show the overall trend.",
    },
    {
      term: "P/E Ratio (Price-to-Earnings)",
      category: "Fundamental",
      definition:
        "Measures a company's current share price relative to its per-share earnings.",
    },
    {
      term: "LTP (Last Traded Price)",
      category: "General",
      definition:
        "The exact price at which the most recent transaction of a stock occurred in the live market.",
    },
    {
      term: "NAV (Net Asset Value)",
      category: "General",
      definition: "The per-share value of a mutual fund or ETF.",
    },
    {
      term: "Bull Market",
      category: "General",
      definition:
        "A financial market condition where prices are rising persistently.",
    },
    {
      term: "Bear Market",
      category: "General",
      definition:
        "A financial market condition in which prices are falling, typically by 20% or more.",
    },
  ];

  const categories = [
    "All",
    "General",
    "Technical",
    "Fundamental",
    "Web Results",
  ];

  const filteredLocalTerms = localDictionary.filter((item) => {
    const matchesSearch = item.term
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || item.category === activeCategory;
    return matchesSearch && matchesCategory && activeCategory !== "Web Results";
  });

  // 2. Upgraded "Google-Like" Web Fetcher using Wikipedia Search Engine
  const handleWebSearch = async (e) => {
    e?.preventDefault();
    if (!searchTerm.trim()) return;

    setActiveCategory("Web Results");
    setIsSearchingWeb(true);
    setWebError("");
    setWebResult(null);
    setIsExpanded(false); // Reset expansion on new search

    try {
      // Instead of guessing the exact title, we use Wikipedia's search engine (generator=search)
      // and append "finance" to the query to force context.
      const searchQuery = encodeURIComponent(searchTerm + " finance");
      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrsearch=${searchQuery}&gsrlimit=1&prop=extracts&exintro=true&explaintext=true`,
      );
      const data = await response.json();

      if (!data.query || !data.query.pages) {
        setWebError(
          `We couldn't find a standard financial definition for "${searchTerm}".`,
        );
      } else {
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        const page = pages[pageId];

        setWebResult({
          term: page.title,
          definition: page.extract, // Store the entire text
          category: "Web Result",
        });
      }
    } catch (err) {
      setWebError(
        "Make sure you are connected to the internet to fetch live definitions.",
      );
    } finally {
      setIsSearchingWeb(false);
    }
  };

  // If user clears search bar, reset web results
  useEffect(() => {
    if (searchTerm === "") {
      setWebResult(null);
      setWebError("");
      setIsExpanded(false);
      if (activeCategory === "Web Results") setActiveCategory("All");
    }
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-600 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2">
              <Globe className="text-blue-600" size={28} /> Global Market
              Dictionary
            </h1>
            <p className="text-gray-500 font-medium">
              Search our local database or fetch live definitions from the web.
            </p>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 space-y-6">
          <form onSubmit={handleWebSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-3.5 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search any term (e.g., Stock, Dividend, RSI)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-700 transition"
              />
            </div>
            <button
              type="submit"
              className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition flex items-center gap-2 whitespace-nowrap"
            >
              <Globe size={18} /> Deep Web Search
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-1
                  ${
                    activeCategory === category
                      ? category === "Web Results"
                        ? "bg-gray-900 text-white"
                        : "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {category === "Web Results" ? (
                  <Globe size={14} />
                ) : (
                  category !== "All" && <Tag size={14} />
                )}
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Results Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {/* Show Local Terms */}
            {activeCategory !== "Web Results" &&
              filteredLocalTerms.map((item, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={`local-${index}`}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900">
                      {item.term}
                    </h3>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider
                    ${
                      item.category === "Technical"
                        ? "bg-purple-100 text-purple-700"
                        : item.category === "Fundamental"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-blue-100 text-blue-700"
                    }`}
                    >
                      {item.category}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {item.definition}
                  </p>
                </motion.div>
              ))}

            {/* Show Web Search State */}
            {activeCategory === "Web Results" && isSearchingWeb && (
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500"
              >
                <Loader2
                  className="animate-spin text-blue-600 mb-4"
                  size={32}
                />
                <p className="font-bold">
                  Scouring the web for "{searchTerm}"...
                </p>
              </motion.div>
            )}

            {/* Show Web Error */}
            {activeCategory === "Web Results" &&
              webError &&
              !isSearchingWeb && (
                <motion.div
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full bg-red-50 border border-red-100 text-red-600 p-6 rounded-2xl flex items-center gap-3"
                >
                  <AlertCircle size={24} />
                  <div>
                    <h4 className="font-bold">No exact match found</h4>
                    <p className="text-sm">
                      {webError} Try a more common financial term.
                    </p>
                  </div>
                </motion.div>
              )}

            {/* Show Web Result */}
            {activeCategory === "Web Results" &&
              webResult &&
              !isSearchingWeb && (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="col-span-full bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 rounded-2xl shadow-lg border border-gray-700"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-black">{webResult.term}</h3>
                    <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider h-fit">
                      <Globe size={12} /> Live Web Result
                    </span>
                  </div>

                  {/* whitespace-pre-wrap fixes the Markdown/paragraph formatting issue */}
                  <div className="text-gray-300 leading-relaxed font-medium whitespace-pre-wrap text-sm md:text-base">
                    {isExpanded
                      ? webResult.definition
                      : webResult.definition.length > 350
                        ? webResult.definition.substring(0, 350) + "..."
                        : webResult.definition}
                  </div>

                  {/* Smooth Read More / Read Less Toggle */}
                  {webResult.definition.length > 350 && (
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="mt-4 text-blue-400 hover:text-blue-300 font-bold text-sm flex items-center gap-1 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp size={16} /> Read Less
                        </>
                      ) : (
                        <>
                          <ChevronDown size={16} /> Read More
                        </>
                      )}
                    </button>
                  )}

                  <div className="mt-6 pt-4 border-t border-gray-700 text-xs text-gray-500 font-bold flex items-center gap-2">
                    <BookOpen size={14} /> Sourced dynamically from Wikipedia
                    API
                  </div>
                </motion.div>
              )}

            {/* Empty Local State */}
            {activeCategory !== "Web Results" &&
              filteredLocalTerms.length === 0 &&
              searchTerm && (
                <motion.div
                  layout
                  className="col-span-full text-center py-12 text-gray-500"
                >
                  <Globe size={32} className="mx-auto mb-3 text-gray-300" />
                  <p className="font-bold text-lg text-gray-700">
                    "{searchTerm}" isn't in our local quick-cache.
                  </p>
                  <p className="text-sm mt-1">
                    Press <b>Enter</b> or click <b>Deep Web Search</b> to find
                    it online!
                  </p>
                </motion.div>
              )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
