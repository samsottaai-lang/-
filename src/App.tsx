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
    <div className="min-h-screen bg-[#F0F4F8] text-[#1A1A1A] font-sans selection:bg-blue-100 pb-20 relative overflow-x-hidden">
      {/* Dynamic Background Elements for Glassmorphism */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200/40 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] rounded-full bg-indigo-200/40 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/40 backdrop-blur-xl border-b border-white/20 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600/90 p-1.5 rounded-xl shadow-lg ring-1 ring-white/30">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-gray-900 drop-shadow-sm">공문서 도우미</h1>
        </div>
        <button 
          onClick={() => setShowGuide(!showGuide)}
          className="p-2 hover:bg-white/40 rounded-full transition-all active:scale-95 border border-transparent hover:border-white/30"
        >
          <BookOpen className="w-5 h-5 text-gray-700" />
        </button>
      </header>

      <main className="max-w-2xl mx-auto p-4 relative z-10">
        {/* Navigation Tabs */}
        <div className="flex bg-white/30 backdrop-blur-md p-1.5 rounded-2xl mb-6 border border-white/40 shadow-sm ring-1 ring-black/[0.03]">
          <button
            onClick={() => setActiveTab("convert")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
              activeTab === "convert" 
                ? "bg-white/80 shadow-md text-blue-600 border border-white/50" 
                : "text-gray-500 hover:text-gray-800 hover:bg-white/20"
            )}
          >
            <ArrowRightLeft className="w-4 h-4" />
            변환하기
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
              activeTab === "history" 
                ? "bg-white/80 shadow-md text-blue-600 border border-white/50" 
                : "text-gray-500 hover:text-gray-800 hover:bg-white/20"
            )}
          >
            <History className="w-4 h-4" />
            기록
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "convert" ? (
            <motion.div
              key="convert"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Input Section */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2">내용 입력</label>
                <div className="relative group">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="공문서로 바꾸고 싶은 내용을 자유롭게 입력하세요."
                    className="w-full min-h-[180px] p-5 bg-white/50 backdrop-blur-xl border border-white/60 rounded-[28px] shadow-lg shadow-black/[0.02] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400/50 transition-all resize-none text-[16px] leading-relaxed placeholder:text-gray-400"
                  />
                  <div className="absolute bottom-4 right-5 text-[10px] text-gray-400 font-bold bg-white/40 px-2 py-1 rounded-full border border-white/50">
                    {input.length} 자
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleConvert}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "w-full py-4.5 rounded-[24px] font-black text-white shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.97] ring-1 ring-white/20",
                  input.trim() && !isLoading 
                    ? "bg-gradient-to-br from-blue-600 to-indigo-700 hover:shadow-blue-500/30 hover:translate-y-[-2px]" 
                    : "bg-gray-300 text-gray-100 grayscale cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="tracking-tight">연속 변환 중...</span>
                  </div>
                ) : (
                  <>
                    <Send className="w-5 h-5 drop-shadow-sm" />
                    <span className="text-lg">변환 완료하기</span>
                  </>
                )}
              </button>

              {/* Output Section */}
              {output && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between px-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">변환 본문</label>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-1.5 text-xs font-black text-blue-600 bg-white/60 backdrop-blur-md border border-white/80 hover:bg-blue-50 px-3 py-1.5 rounded-full transition-all active:scale-95 shadow-sm"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {isCopied ? "복사 성공" : "결과 복사"}
                    </button>
                  </div>
                  <div 
                    ref={outputRef}
                    className="w-full p-6 bg-white/70 backdrop-blur-2xl border border-white/80 rounded-[32px] shadow-xl prose prose-sm max-w-none prose-blue ring-1 ring-black/[0.01]"
                  >
                    <div className="bg-white/30 p-1 rounded-xl mb-4 border border-white/20 inline-block text-[10px] font-bold text-blue-600 uppercase tracking-tighter px-2">
                      Official Draft
                    </div>
                    <ReactMarkdown>{output}</ReactMarkdown>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between px-2">
                <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">변환 히스토리 (최근 10개)</h2>
                {history.length > 0 && (
                  <button 
                    onClick={clearHistory}
                    className="text-xs font-bold text-red-500 bg-white/40 hover:bg-red-50/50 px-3 py-1.5 rounded-full transition-all border border-white/50 flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    기록 비우기
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="py-24 text-center space-y-4 bg-white/30 backdrop-blur-md rounded-[32px] border border-white/40">
                  <div className="bg-white/50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-white/50">
                    <History className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-400 font-bold">아직 변환된 문서가 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((item) => (
                    <motion.div 
                      key={item.id} 
                      whileHover={{ y: -2 }}
                      className="bg-white/50 backdrop-blur-md p-5 rounded-[28px] border border-white/60 shadow-lg shadow-black/[0.01] space-y-4 group transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-400 bg-white/40 px-2.5 py-1 rounded-full border border-white/50">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                        <button 
                          onClick={() => {
                            setInput(item.original);
                            setOutput(item.converted);
                            setActiveTab("convert");
                          }}
                          className="text-xs font-black text-blue-600 hover:underline px-2 py-1 rounded-lg"
                        >
                          기록 불러오기
                        </button>
                      </div>
                      <p className="text-[13px] text-gray-600 line-clamp-2 bg-white/30 p-3 rounded-2xl border border-white/40 italic leading-relaxed">
                        "{item.original}"
                      </p>
                    </motion.div>
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
              className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
              onClick={() => setShowGuide(false)}
            >
              <motion.div
                initial={{ y: "100%", scale: 0.95 }}
                animate={{ y: 0, scale: 1 }}
                exit={{ y: "100%", scale: 0.95 }}
                className="bg-white/80 backdrop-blur-3xl w-full max-w-lg rounded-[40px] sm:rounded-[40px] p-8 space-y-8 shadow-2xl overflow-y-auto max-h-[85vh] border border-white/40 ring-1 ring-black/[0.05]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center border border-blue-200">
                      <Info className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black tracking-tight">작성 가이드</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Official Principles</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowGuide(false)}
                    className="w-10 h-10 flex items-center justify-center bg-white/60 hover:bg-white rounded-full border border-white/50 transition-all shadow-sm"
                  >
                    <ChevronDown className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6 text-[15px] leading-relaxed text-gray-700">
                  <section className="space-y-3">
                    <h4 className="font-black text-gray-900 flex items-center gap-2.5">
                      <div className="w-2 h-2 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
                      표준 문장 종결
                    </h4>
                    <p className="pl-4.5 border-l-2 border-blue-100">공문서는 '함', '임', '음' 등 명사형 종결이 기본입니다. 군더더기 없는 담백한 표현을 지향합니다.</p>
                  </section>
                  
                  <section className="space-y-3">
                    <h4 className="font-black text-gray-900 flex items-center gap-2.5">
                      <div className="w-2 h-2 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
                      시기 및 시각 엄수
                    </h4>
                    <p className="pl-4.5 border-l-2 border-blue-100">모든 날짜 뒤에는 마침표(.)를 찍고 반드시 한 칸 띄웁니다. 시간은 24시 형식을 준수합니다.</p>
                    <div className="bg-white/40 border border-white/60 p-3 rounded-2xl font-mono text-xs text-blue-700 shadow-inner flex items-center justify-between">
                      <span className="opacity-50">Example</span>
                      <span className="font-bold">2024. 5. 14. 10:48</span>
                    </div>
                  </section>

                  <section className="space-y-3">
                    <h4 className="font-black text-gray-900 flex items-center gap-2.5">
                      <div className="w-2 h-2 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
                      항목 구분 번호
                    </h4>
                    <div className="pl-4.5 border-l-2 border-blue-100 grid grid-cols-2 gap-x-4 gap-y-1 text-xs opacity-80">
                      <span>1단계: 1.</span>
                      <span>2단계: 가.</span>
                      <span>3단계: 1)</span>
                      <span>4단계: 가)</span>
                    </div>
                  </section>

                  <section className="space-y-3">
                    <h4 className="font-black text-gray-900 flex items-center gap-2.5">
                      <div className="w-2 h-2 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
                      올바른 용어 치환
                    </h4>
                    <div className="grid grid-cols-2 gap-3 pl-4.5 border-l-2 border-blue-100">
                      <div className="bg-white/40 p-2.5 rounded-xl border border-white/60 text-xs shadow-sm">
                        <span className="text-red-400 line-through mr-2">익일</span>
                        <span className="font-black">다음 날</span>
                      </div>
                      <div className="bg-white/40 p-2.5 rounded-xl border border-white/60 text-xs shadow-sm">
                        <span className="text-red-400 line-through mr-2">금번</span>
                        <span className="font-black">이번</span>
                      </div>
                    </div>
                  </section>
                </div>

                <button 
                  onClick={() => setShowGuide(false)}
                  className="w-full py-4.5 bg-gray-900 text-white rounded-[24px] font-black text-lg shadow-2xl hover:shadow-gray-900/20 active:scale-[0.98] transition-all"
                >
                  가이드 숙지 완료
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation (Mobile Glass) */}
      <nav className="fixed bottom-4 left-4 right-4 z-50 bg-white/40 backdrop-blur-2xl border border-white/50 px-8 py-3.5 flex items-center justify-around sm:hidden rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.02]">
        <button 
          onClick={() => setActiveTab("convert")}
          className={cn(
            "flex flex-col items-center gap-1.5 transition-all relative",
            activeTab === "convert" ? "text-blue-600 scale-110" : "text-gray-400"
          )}
        >
          <Smartphone className="w-5.5 h-5.5" />
          <span className="text-[10px] font-black uppercase tracking-tighter">Editor</span>
          {activeTab === "convert" && <motion.div layoutId="nav-dot" className="absolute -bottom-1 w-1 h-1 bg-blue-600 rounded-full" />}
        </button>
        <button 
          onClick={() => setActiveTab("history")}
          className={cn(
            "flex flex-col items-center gap-1.5 transition-all relative",
            activeTab === "history" ? "text-blue-600 scale-110" : "text-gray-400"
          )}
        >
          <History className="w-5.5 h-5.5" />
          <span className="text-[10px] font-black uppercase tracking-tighter">History</span>
          {activeTab === "history" && <motion.div layoutId="nav-dot" className="absolute -bottom-1 w-1 h-1 bg-blue-600 rounded-full" />}
        </button>
      </nav>
    </div>
  );
}
