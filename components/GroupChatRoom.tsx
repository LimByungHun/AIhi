"use client";

import { useState, useRef, useEffect } from "react";

interface GroupChatRoomProps {
  group: any;
  onBack: () => void;
  isPanelOpen: boolean;
  setIsPanelOpen: (open: boolean) => void;
}

interface AiAnalysis {
  id: number;
  sender: string;
  isMe: boolean;
  question: string;
  answer: string;
  timestamp: string;
  isLoading: boolean;
  attachedFiles?: string[]; // 🚀 파일 첨부 데이터 추가
}

interface ChatMessage {
  id: number;
  sender: string;
  content: string;
  time: string;
  isMe: boolean;
  attachedFiles?: string[]; // 🚀 파일 첨부 데이터 추가
}

export default function GroupChatRoom({ group, onBack, isPanelOpen, setIsPanelOpen }: GroupChatRoomProps) {
  const [input, setInput] = useState("");
  const [isAIMode, setIsAIMode] = useState(false);
  
  // 🚀 파일 첨부 관련 상태 및 Ref 추가
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [aiHistory, setAiHistory] = useState<AiAnalysis[]>([
    {
      id: 999,
      sender: "김학생",
      isMe: false,
      question: "데이터베이스 제1정규형(1NF)이 뭐야?",
      answer: "제1정규형(1NF)은 릴레이션에 속한 모든 속성의 도메인이 원자값(Atomic Value)으로만 구성되어야 한다는 정규형입니다.",
      timestamp: "오전 02:38",
      isLoading: false,
    }
  ]);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, sender: "김학생", content: "안녕하세요! 오늘 프로젝트 회의 몇 시인가요?", time: "오후 2:30", isMe: false },
    { id: 2, sender: "이튜터", content: "저번 주 발표 자료 공유해 드립니다.", time: "오후 2:32", isMe: false, attachedFiles: ["3주차_발표자료.pptx"] }, // 🚀 예시 첨부파일
  ]);

  const mainChatEndRef = useRef<HTMLDivElement>(null);
  const aiChatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mainChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, attachedFiles]);

  useEffect(() => {
    if (isPanelOpen) {
      aiChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [aiHistory, isPanelOpen]);

  // 🚀 파일 선택 처리 함수
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setAttachedFiles((prev) => [...prev, ...selectedFiles]);
    }
    // 동일한 파일을 다시 선택할 수 있도록 input 초기화
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 🚀 첨부된 파일 지우기 함수
  const removeAttachedFile = (fileNameToRemove: string) => {
    setAttachedFiles(attachedFiles.filter(f => f.name !== fileNameToRemove));
  };

  const sendMessage = () => {
    // 내용도 없고 첨부파일도 없으면 전송 불가
    if (!input.trim() && attachedFiles.length === 0) return;
    
    const userText = input;
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const fileNames = attachedFiles.map(f => f.name); // 첨부파일 이름만 추출하여 저장

    if (isAIMode) {
      setIsPanelOpen(true);
      const newAnalysisId = Date.now();
      
      setAiHistory(prev => [...prev, {
        id: newAnalysisId, sender: "나", isMe: true, question: userText, answer: "AI 튜터가 문서를 분석 중입니다...", timestamp: currentTime, isLoading: true, attachedFiles: fileNames
      }]);

      setTimeout(() => {
        setAiHistory(prev => prev.map(item => 
          item.id === newAnalysisId 
          ? { ...item, isLoading: false, answer: `질문하신 내용에 대해 교안 및 첨부 문서를 바탕으로 분석한 결과입니다.\n\n해당 주제는 '데이터베이스 정규화' 세션에 해당합니다. 자세한 내용은 아래 참고 문서를 확인해 주세요.` } 
          : item
        ));
      }, 1500);

    } else {
      setMessages(prev => [...prev, { 
        id: Date.now(), sender: "나", content: userText, time: currentTime, isMe: true, attachedFiles: fileNames 
      }]);
    }
    
    // 🚀 전송 후 초기화
    setInput("");
    setAttachedFiles([]);
  };

  return (
    <div className="flex h-full w-full bg-slate-50 overflow-hidden relative">
      
      {/* 🔴 [왼쪽] 메인 채팅 영역 */}
      <div className={`flex flex-col h-full bg-white transition-all duration-500 ease-in-out ${isPanelOpen ? "w-1/2 md:w-7/12 border-r border-slate-200" : "w-full"}`}>
        
        <header className="h-14 flex items-center px-6 border-b border-slate-100 bg-white/80 shrink-0">
          <button onClick={onBack} className="p-2 mr-3 hover:bg-slate-100 rounded-full text-slate-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div>
            <h1 className="font-bold text-slate-800">{group?.title || "데이터베이스 스터디"}</h1>
            <p className="text-[11px] text-slate-400 font-medium">멤버 {group?.members || 6}명 참여 중</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-8">
          <div className="max-w-3xl mx-auto flex flex-col gap-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.isMe ? "items-end" : "items-start"}`}>
                {!msg.isMe && <span className="text-xs font-bold text-slate-500 ml-1 mb-1.5">{msg.sender}</span>}
                
                <div className={`flex items-end gap-2 max-w-[85%] ${msg.isMe ? "flex-row-reverse" : "flex-row"}`}>
                  
                  {/* 🚀 채팅 말풍선 영역 (파일과 텍스트 분리) */}
                  <div className={`flex flex-col gap-1.5 ${msg.isMe ? "items-end" : "items-start"}`}>
                    
                    {/* 첨부파일이 있으면 렌더링 */}
                    {msg.attachedFiles && msg.attachedFiles.length > 0 && msg.attachedFiles.map((fileName, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 shadow-sm flex items-center gap-2">
                        <span className="text-lg">📄</span> {fileName}
                      </div>
                    ))}
                    
                    {/* 텍스트 내용이 있으면 렌더링 */}
                    {msg.content && (
                      <div className={`px-5 py-3 rounded-2xl text-[15px] shadow-sm ${msg.isMe ? "bg-blue-600 text-white rounded-tr-none" : "bg-slate-100 text-slate-800 rounded-tl-none"}`}>
                        {msg.content}
                      </div>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400 mb-1 shrink-0">{msg.time}</span>
                </div>
              </div>
            ))}
            <div ref={mainChatEndRef} />
          </div>
        </div>

        {/* 🚀 하단 입력바 */}
        <div className="p-4 sm:p-8 bg-gradient-to-t from-white via-white/95 to-transparent pr-20">
          <div className="max-w-3xl mx-auto flex flex-col gap-2">
            
            {/* 🚀 첨부파일 미리보기 영역 (파일을 올렸을 때만 보임) */}
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 px-2 animate-in slide-in-from-bottom-2">
                {attachedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm rounded-xl py-1.5 px-3">
                    <span className="text-xs">📄</span>
                    <span className="text-xs font-bold text-slate-700 max-w-[120px] truncate">{file.name}</span>
                    <button onClick={() => removeAttachedFile(file.name)} className="text-slate-400 hover:text-red-500">✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* 실제 입력 컨트롤 영역 */}
            <div className={`flex items-end gap-2 bg-white border rounded-[28px] p-2.5 shadow-sm transition-all ${isAIMode ? "border-indigo-400 ring-2 ring-indigo-500/10" : "border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/10"}`}>
              
              {/* 숨겨진 실제 파일 인풋 */}
              <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileSelect} />
              
              {/* 🚀 파일 첨부 (+) 버튼 */}
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="flex items-center justify-center w-11 h-11 rounded-full text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-all shrink-0"
                title="파일 첨부"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              </button>

              <button 
                onClick={() => setIsAIMode(!isAIMode)}
                className={`flex items-center justify-center h-11 px-4 rounded-2xl font-bold text-xs transition-all gap-1.5 shrink-0 ${isAIMode ? "bg-indigo-600 text-white shadow-md" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}
              >
                <span className={isAIMode ? "animate-pulse" : ""}>✨</span>
                <span className="hidden sm:inline">AI {isAIMode ? "ON" : "OFF"}</span>
              </button>

              <textarea 
                value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder={isAIMode ? "AI 튜터에게 분석할 내용을 입력하세요..." : "메시지나 파일을 입력하세요..."}
                className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 px-2 text-[15px] text-slate-800 outline-none placeholder-slate-400" rows={1}
              />

              <button 
                onClick={sendMessage} 
                disabled={!input.trim() && attachedFiles.length === 0}
                className={`h-11 w-11 flex items-center justify-center rounded-full shrink-0 ${input.trim() || attachedFiles.length > 0 ? (isAIMode ? "bg-indigo-600 text-white" : "bg-blue-600 text-white") : "bg-slate-100 text-slate-300"}`}
              >
                <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>

              <button 
                onClick={() => setIsPanelOpen(!isPanelOpen)}
                className={`h-11 px-4 flex items-center justify-center rounded-full font-bold text-xs transition-all shrink-0 ${isPanelOpen ? "bg-indigo-100 text-indigo-700" : "bg-slate-50 text-slate-500 hover:bg-slate-200"}`}
                title="분석 히스토리 열기/닫기"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                <span className="hidden sm:inline">이력</span>
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* 🔵 [오른쪽] 공유형 AI 분석 패널 */}
      {isPanelOpen && (
        <div className="w-1/2 md:w-5/12 h-full bg-indigo-50/30 flex flex-col animate-in slide-in-from-right-20 duration-300 border-l border-indigo-100 relative">
          
          <header className="h-14 flex items-center justify-between px-6 border-b border-indigo-100 bg-white/60 shrink-0">
            <h2 className="font-extrabold text-indigo-700 flex items-center gap-2">
              <span className="text-xl">🤖</span> AI 튜터 분석
            </h2>
            <button onClick={() => setIsPanelOpen(false)} className="text-slate-400 hover:text-indigo-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-10">
            {aiHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-3xl">💡</div>
                <p className="font-bold">공유된 분석 히스토리가 없습니다.</p>
                <p className="text-xs mt-1">AI 모드를 켜고 질문을 입력해 보세요.</p>
              </div>
            ) : (
              aiHistory.map((item) => (
                <div key={item.id} className="flex flex-col gap-4 animate-in fade-in duration-300">
                  <div className={`flex flex-col ${item.isMe ? "items-end" : "items-start"}`}>
                    <span className="text-[11px] font-black text-slate-400 mb-1.5 uppercase tracking-widest mx-1">
                      {item.isMe ? "My Question" : `${item.sender}'s Question`}
                    </span>
                    
                    {/* 🚀 AI 질문 시 첨부했던 파일도 표시 */}
                    <div className="flex flex-col gap-1.5 items-end max-w-[90%]">
                      {item.attachedFiles && item.attachedFiles.map((fileName, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 shadow-sm flex items-center gap-2">
                          <span className="text-lg">📄</span> {fileName}
                        </div>
                      ))}
                      {item.question && (
                        <div className={`px-5 py-3 rounded-2xl shadow-md text-[14.5px] ${item.isMe ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"}`}>
                          {item.question}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-start">
                    <span className="text-[11px] font-black text-indigo-500 mb-1.5 ml-1 uppercase tracking-widest">✨ AI Tutor Analysis</span>
                    <div className={`w-full bg-white border border-indigo-100 rounded-2xl rounded-tl-none p-5 shadow-sm ${item.isLoading ? "animate-pulse" : ""}`}>
                      <p className="text-[15px] leading-relaxed text-slate-700 whitespace-pre-wrap">{item.answer}</p>
                      {!item.isLoading && (
                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-xs text-slate-400">
                          <span className="text-lg">📄</span><span className="font-bold text-slate-600 truncate">데이터베이스_5주차_정규화.pdf</span><span className="ml-auto opacity-50">{item.timestamp}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={aiChatEndRef} className="h-4" />
          </div>
        </div>
      )}
    </div>
  );
}