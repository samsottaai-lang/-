import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, 
  Send, 
  Copy, 
  Check, 
  Info, 
  ArrowRightLeft, 
  History,
  Trash2,
  ChevronDown,
  Smartphone,
  BookOpen
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { convertToOfficialDoc } from "./services/geminiService";
import { cn } from "./lib/utils";

interface HistoryItem {
  id: string;
  original: string;
  converted: string;
  timestamp: number;
}

export default function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showGuide, setShowGuide] = useState(false);
  const [activeTab, setActiveTab] = useState<"convert" | "history">("convert");
  
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem("doc_history");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleConvert = async () => {
    if (!input.trim() || isLoading) return;
    
    setIsLoading(true);
    const result = await convertToOfficialDoc(input);
    setOutput(result);
    setIsLoading(false);

    if (result && !result.includes("오류")) {
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        original: input,
        converted: result,
        timestamp: Date.now(),
      };
      const updatedHistory = [newItem, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem("doc_history", JSON.stringify(updatedHistory));
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("doc_history");
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-blue-100 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-gray-900">공문서 도우미</h1>
        </div>
        <button 
          onClick={() => setShowGuide(!showGuide)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <BookOpen className="w-5 h-5 text-gray-600" />
        </button>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        {/* Navigation Tabs */}
        <div className="flex bg-gray-200/50 p-1 rounded-xl mb-6">
          <button
            onClick={() => setActiveTab("convert")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all",
              activeTab === "convert" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <ArrowRightLeft className="w-4 h-4" />
            변환하기
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all",
              activeTab === "history" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <History className="w-4 h-4" />
            최근 기록
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "convert" ? (
            <motion.div
              key="convert"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Input Section */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">내용 입력</label>
                <div className="relative group">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="공문서로 바꾸고 싶은 내용을 자유롭게 적어주세요. (예: 이번에 사무실 에어컨 청소 업체 부르려고 하는데 결재 좀 해주세요.)"
                    className="w-full min-h-[160px] p-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none text-[15px] leading-relaxed"
                  />
                  <div className="absolute bottom-3 right-3 text-[10px] text-gray-400 font-mono">
                    {input.length} 자
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleConvert}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "w-full py-4 rounded-2xl font-bold text-white shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]",
                  input.trim() && !isLoading ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>변환 중...</span>
                  </div>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>표준 공문서로 변환</span>
                  </>
                )}
              </button>

              {/* Output Section */}
              {output && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between px-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">변환 결과</label>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {isCopied ? "복사됨" : "결과 복사"}
                    </button>
                  </div>
                  <div 
                    ref={outputRef}
                    className="w-full p-5 bg-white border border-gray-200 rounded-2xl shadow-sm prose prose-sm max-w-none prose-blue"
                  >
                    <ReactMarkdown>{output}</ReactMarkdown>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-bold text-gray-500">최근 10개의 변환 기록</h2>
                {history.length > 0 && (
                  <button 
                    onClick={clearHistory}
                    className="text-xs font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    전체 삭제
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                    <History className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-400 font-medium">변환 기록이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-gray-400">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                        <button 
                          onClick={() => {
                            setInput(item.original);
                            setOutput(item.converted);
                            setActiveTab("convert");
                          }}
                          className="text-xs font-bold text-blue-600"
                        >
                          불러오기
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 bg-gray-50 p-2 rounded-lg italic">
                        "{item.original}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Guide Overlay */}
        <AnimatePresence>
          {showGuide && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
              onClick={() => setShowGuide(false)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[80vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-bold">공문서 작성 가이드</h3>
                  </div>
                  <button 
                    onClick={() => setShowGuide(false)}
                    className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 text-sm leading-relaxed text-gray-600">
                  <section className="space-y-2">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                      문장 종결 어미
                    </h4>
                    <p>공문서는 '함', '임', '음' 등 명사형으로 끝맺는 것이 원칙입니다. 불필요한 존칭이나 감탄사는 생략합니다.</p>
                  </section>
                  
                  <section className="space-y-2">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                      날짜 및 시간 표기
                    </h4>
                    <p>연, 월, 일 다음에 반드시 마침표(.)를 찍고 한 칸 띄웁니다. 시간은 24시간제를 사용합니다.</p>
                    <div className="bg-gray-50 p-2 rounded-lg font-mono text-xs text-blue-700">
                      예: 2024. 3. 25. 14:00
                    </div>
                  </section>

                  <section className="space-y-2">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                      항목 구분 체계
                    </h4>
                    <p>1. → 가. → 1) → 가) → (1) → (가) 순서로 번호를 부여합니다.</p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                      어려운 용어 순화
                    </h4>
                    <ul className="grid grid-cols-2 gap-2">
                      <li className="bg-gray-50 p-2 rounded-lg">익일 → 다음 날</li>
                      <li className="bg-gray-50 p-2 rounded-lg">금번 → 이번</li>
                      <li className="bg-gray-50 p-2 rounded-lg">필히 → 반드시</li>
                      <li className="bg-gray-50 p-2 rounded-lg">통보 → 알림</li>
                    </ul>
                  </section>
                </div>

                <button 
                  onClick={() => setShowGuide(false)}
                  className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold"
                >
                  확인했습니다
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 px-6 py-3 flex items-center justify-around sm:hidden">
        <button 
          onClick={() => setActiveTab("convert")}
          className={cn(
            "flex flex-col items-center gap-1",
            activeTab === "convert" ? "text-blue-600" : "text-gray-400"
          )}
        >
          <Smartphone className="w-5 h-5" />
          <span className="text-[10px] font-bold">변환</span>
        </button>
        <button 
          onClick={() => setActiveTab("history")}
          className={cn(
            "flex flex-col items-center gap-1",
            activeTab === "history" ? "text-blue-600" : "text-gray-400"
          )}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] font-bold">기록</span>
        </button>
      </nav>
    </div>
  );
}
