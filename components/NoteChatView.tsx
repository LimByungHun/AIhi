"use client";

import { useState, useRef, useEffect } from "react";

interface NoteChatViewProps {
  noteId: number;
  onBack: () => void;
}

// 💡 [임시 데이터]
const MOCK_NOTE_DATA: Record<number, any> = {
  101: {
    title: "데이터베이스 정규화 핵심 요약",
    tag: "데이터베이스",
    date: "2026-04-12",
    summary: "제1정규형(1NF)부터 BCNF까지, 데이터 중복을 최소화하기 위한 함수 종속성 제거 과정 완벽 정리.",
    history: [
      { role: "user", content: "데이터베이스 정규화에 대해 학습할래.", time: "오전 10:00", attachedFiles: ["5주차_정규화.pdf"] },
      { role: "ai", content: "네, 정규화 문서를 확인했습니다. 어떤 부분부터 살펴볼까요?", time: "오전 10:01" },
    ]
  }
};

export default function NoteChatView({ noteId, onBack }: NoteChatViewProps) {
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [noteInfo, setNoteInfo] = useState(MOCK_NOTE_DATA[noteId] || MOCK_NOTE_DATA[101]);
  const [messages, setMessages] = useState<any[]>(noteInfo.history);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, attachedFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setAttachedFiles((prev) => [...prev, ...selectedFiles]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachedFile = (fileName: string) => {
    setAttachedFiles(attachedFiles.filter(f => f.name !== fileName));
  };

  const handleSendMessage = async () => {
    if (!input.trim() && attachedFiles.length === 0) return;

    const userText = input;
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const fileNames = attachedFiles.map(f => f.name);

    const newMsg = { role: "user", content: userText, time: currentTime, attachedFiles: fileNames };
    setMessages(prev => [...prev, newMsg]);
    
    setInput("");
    setAttachedFiles([]);

    setTimeout(() => {
      const aiMsg = { 
        role: "ai", 
        content: `요약본과 첨부하신 파일을 바탕으로 분석해 드릴게요. 질문하신 '${userText}' 관련 내용은 분석 결과 리포트에 추가되었습니다.`, 
        time: "방금" 
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative overflow-hidden">
      
      {/* 1. 상단 헤더 */}
      <header className="h-14 flex items-center px-6 border-b border-slate-200 shrink-0 bg-white shadow-sm z-20">
        <button onClick={onBack} className="p-2 mr-3 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <h1 className="font-bold text-lg text-slate-800 tracking-tight">요약노트</h1>
      </header>

      {/* 2. 스크롤 가능한 컨텐츠 영역 */}
      <div className="flex-1 overflow-y-auto">
        {/* 🚀 pb-40을 제거하여 아래 여백을 자연스럽게 조정했습니다 */}
        <div className="max-w-4xl mx-auto p-6 md:p-8 flex flex-col gap-8">
          
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-indigo-100 relative overflow-hidden shrink-0">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full blur-2xl opacity-60"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest">{noteInfo.tag}</span>
                <span className="text-xs font-bold text-slate-400">{noteInfo.date}</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-4">{noteInfo.title}</h2>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 shadow-inner">
                <p className="text-[15px] leading-relaxed text-slate-700 font-medium italic">"{noteInfo.summary}"</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-3 mb-2 px-2">
              <span className="text-[11px] font-black text-slate-400 tracking-widest uppercase">학습 대화 기록</span>
              <span className="flex-1 h-[1px] bg-slate-200"></span>
            </div>

            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                {msg.role === "ai" && <span className="text-[11px] font-bold text-indigo-500 ml-1 mb-1.5">✨ AI 튜터</span>}
                
                <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`flex flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    {msg.attachedFiles?.map((fileName: string, fidx: number) => (
                      <div key={fidx} className="bg-white border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 shadow-sm flex items-center gap-2">
                        <span className="text-lg">📄</span> {fileName}
                      </div>
                    ))}

                    {msg.content && (
                      <div className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                        msg.role === "user" ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                      }`}>
                        {msg.content}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 mb-1 shrink-0">{msg.time}</span>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} className="h-4" />
          </div>
        </div>
      </div>

      {/* 🚀 3. 하단 입력바 (absolute를 빼고 flex-shrink-0으로 고정) */}
      <div className="bg-slate-50 pt-4 pb-6 px-6 shrink-0 border-t border-slate-200/60 z-10">
        <div className="max-w-3xl mx-auto flex flex-col gap-2">
          
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 px-2 animate-in slide-in-from-bottom-2">
              {attachedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm rounded-xl py-1.5 px-3">
                  <span className="text-xs">📄</span>
                  <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{file.name}</span>
                  <button onClick={() => removeAttachedFile(file.name)} className="text-slate-400 hover:text-red-500 transition-colors">✕</button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2 bg-white border border-slate-200 rounded-[28px] p-2.5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition-all">
            <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileSelect} />
            
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="flex items-center justify-center w-11 h-11 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all shrink-0"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            </button>

            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
              placeholder="추가 질문을 입력하거나 관련 파일을 업로드하세요..."
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 px-2 text-[15px] text-slate-800 outline-none placeholder-slate-400" 
              rows={1}
            />

            <button 
              onClick={handleSendMessage}
              disabled={!input.trim() && attachedFiles.length === 0}
              className={`h-11 w-11 flex items-center justify-center rounded-full shrink-0 transition-all ${input.trim() || attachedFiles.length > 0 ? "bg-indigo-600 text-white shadow-md active:scale-95" : "bg-slate-100 text-slate-300"}`}
            >
              <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}