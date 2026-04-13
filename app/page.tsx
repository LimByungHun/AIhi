"use client"; 
import { useState, useRef, useEffect } from "react";
import DashBoard from "@/components/DashBoard";
import SummaryNote from "@/components/SummaryNote";

// 채팅내역 인터페이스
interface ChatHistory {
  chat_number: number;
  chat_name: string;
}

export default function ChatPage() {  
  // 상태(State) 관리 영역  
  const [input, setInput] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadComplete, setIsUploadComplete] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);  

  // 채팅로그
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // 현재 화면 상태 ('chat', 'dashboard', 'notes')
  const [currentView, setCurrentView] = useState("chat");
  
  // 대화 내용을 담을 바구니 (user: 나, ai: 튜터)
  const [messages, setMessages] = useState<{role: string, content: string, attachedFiles?: string[]}[]>([]);
  // 채팅로그
  useEffect(() => {
    const fetchChatHistories = async () => {
      const userId = localStorage.getItem("user_id") || "1";
      const token = localStorage.getItem("access_token");
      const API_BASE_URL = "https://furry-cacciatore-daleyza.ngrok-free.dev";

      try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/histories`, {
          method: "GET",
          headers: {
            "ngrok-skip-browser-warning": "69420",
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setChatHistories(data); 
        }
      } catch (error) {
        console.error("최근 기록 로드 실패:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchChatHistories();
  }, []);
  const fileNames = attachedFiles.map(f => f.name);
  
  // 기능(Function) 영역  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setAttachedFiles((prev) => [...prev, ...selectedFiles]);
      setIsUploadComplete(true); 
    }
  };
  
  const removeAttachedFile = (fileNameToRemove: string) => {
    setAttachedFiles(attachedFiles.filter(f => f.name !== fileNameToRemove));
    if (attachedFiles.length === 1) {
      setIsUploadComplete(false);
    }
  };  

  const handleSendMessage = async () => {
    if (!input.trim() && attachedFiles.length === 0) return; 
    const API_BASE_URL = "https://furry-cacciatore-daleyza.ngrok-free.dev"; 
    const questionText = input.trim();

    // 파일 이름만 따로 추출해서 메시지에 포함시키기
    const fileNames = attachedFiles.map(f => f.name);

    // 1. 내 질문을 화면(오른쪽 말풍선)에 즉시 띄우기
    setMessages((prev) => [...prev, { role: "user", content: questionText, attachedFiles: fileNames }]);
    setInput("");
    
    const filesToSend = [...attachedFiles];
    setAttachedFiles([]);

    try {
      let parsedData;
      //  2. 파일이 있다면 서버로 전송 (파싱 API)
      if (filesToSend.length > 0) {
        const formData = new FormData();
        filesToSend.forEach((file) => formData.append("file", file));

        const token = localStorage.getItem("access_token");

        const uploadResponse = await fetch(`${API_BASE_URL}/upload-parse/`, {
          method: "POST", headers: { "ngrok-skip-browser-warning": "69420", "Authorization": `Bearer ${token}` }, body: formData,
        });

        if (!uploadResponse.ok) {
          if (uploadResponse.status === 413) throw new Error("파일 용량이 10MB를 초과했습니다.");
          throw new Error("파일 업로드 중 오류가 발생했습니다.");
        }
        parsedData = await uploadResponse.json();        
        const serverAnswer = parsedData.message;
        setMessages((prev) => [
          ...prev, 
          { role: "ai", content: serverAnswer }
        ]);
      }
      
      // 3. AI 답변 수신
      if (filesToSend.length > 0) {
        const serverAnswer =  parsedData.message;
        setMessages((prev) => [
          ...prev, 
          { role: "ai", content: serverAnswer }
        ]);
      } else {
        const token = localStorage.getItem("access_token");
        
        const response = await fetch(`${API_BASE_URL}/chat/`, { 
          method: "POST",
          headers: { 
            "Content-Type": "application/json", 
            "ngrok-skip-browser-warning": "69420", 
            "Authorization": `Bearer ${token}` 
          },
          body: JSON.stringify({ question: questionText }), 
        });

        if (!response.ok) {
          throw new Error("질문 처리 중 오류가 발생했습니다.");
        }

        const data = await response.json();
        const serverAnswer = data.answer;
        
        setMessages((prev) => [
          ...prev, 
          { role: "ai", content: serverAnswer }
        ]);
      }
    } catch (error: any) {
      console.error("API 통신 에러:", error);
      alert(error.message);
    }
  };
  
  // 화면(UI) 렌더링 영역  
  return (
    <div className="flex h-[calc(100vh-64px)] bg-white overflow-hidden">
      
      {/* [1] 왼쪽 사이드바 영역 */}
      <aside className={`bg-slate-50 border-r border-slate-200 hidden md:flex flex-col shrink-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? "w-64" : "w-20"}`}>
        {/* 사이드바 접기/펴기 버튼 */}
        <div className="h-14 flex items-center border-b border-slate-100 px-4 shrink-0">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-2 rounded-xl text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors focus:outline-none ${!isSidebarOpen && "mx-auto"}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
        
        {/* 사이드바 메뉴들 */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-4 p-3">
          <div className="flex flex-col gap-1 pb-4 border-b border-slate-200/60 mb-2">
            
            <button 
              onClick={() => setCurrentView("dashboard")}
              className={`flex items-center rounded-xl transition-colors whitespace-nowrap group ${currentView === "dashboard" ? "bg-blue-50 text-blue-700 font-bold" : "hover:bg-slate-200 text-slate-700"} ${isSidebarOpen ? "p-2.5 justify-start gap-3 px-3" : "p-3 justify-center px-0"}`}
            >
              <span className={`text-xl group-hover:scale-110 transition-transform ${currentView === "dashboard" ? "opacity-100" : "opacity-70"}`}>📊</span>
              {isSidebarOpen && <span className="text-[15px]">성취도 대시보드</span>}
            </button>
            
            <button 
              onClick={() => setCurrentView("notes")}
              className={`flex items-center rounded-xl transition-colors whitespace-nowrap group ${currentView === "notes" ? "bg-blue-50 text-blue-700 font-bold" : "hover:bg-slate-200 text-slate-700"} ${isSidebarOpen ? "p-2.5 justify-start gap-3 px-3" : "p-3 justify-center px-0"}`}
            >
              <span className={`text-xl group-hover:scale-110 transition-transform ${currentView === "notes" ? "opacity-100" : "opacity-70"}`}>📝</span>
              {isSidebarOpen && <span className="text-[15px]">요약노트</span>}
            </button>       

            <button 
              onClick={() => { 
                setCurrentView("chat"); 
                setAttachedFiles([]); 
                setIsUploadComplete(false); 
                setMessages([]); // 새 채팅을 누르면 대화 내용도 비워줍니다!
              }}
              className={`flex items-center bg-white border border-slate-200 rounded-xl p-3 hover:bg-slate-100 hover:border-blue-300 transition-all shadow-sm group whitespace-nowrap ${currentView === "chat" ? "ring-2 ring-blue-500 border-transparent" : ""} ${isSidebarOpen ? "justify-start gap-3 px-4" : "justify-center px-0"}`}
            >
              <span className="text-xl group-hover:scale-110 transition-transform">➕</span>
              {isSidebarOpen && <span className="font-bold text-slate-700 group-hover:text-blue-600">새 채팅</span>}
            </button>
          </div>                  
            <div className="flex flex-col gap-1 mt-2">
            {isSidebarOpen && <p className="text-xs font-bold text-slate-400 mb-2 px-2">최근 학습 기록</p>}          
            
            <ul className="space-y-1">
              {isLoadingHistory ? (
                <li className="px-4 py-2 text-xs text-slate-400">불러오는 중...</li>
              ) : chatHistories.length === 0 ? (
                <li className="px-4 py-2 text-xs text-slate-400">기록이 없습니다.</li>
              ) : (
                chatHistories.map((chat) => (
                  <li 
                    key={chat.chat_number}
                    onClick={() => {
                      setCurrentView("chat");
                      console.log(`${chat.chat_number}번 채팅 로드 시도`);
                    }}
                    className={`group flex items-center gap-3 rounded-lg hover:bg-slate-200 cursor-pointer transition-colors ${
                      isSidebarOpen ? "p-2.5 px-3" : "p-3 justify-center"
                    }`}
                    title={chat.chat_name}
                  >
                    <span className="text-lg opacity-60 group-hover:opacity-100">💬</span>
                    {isSidebarOpen && (
                      <span className="text-sm font-medium text-slate-700 truncate w-full">
                        {chat.chat_name}
                      </span>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>          
        </div>        
      </aside>

      {/* [2] 우측 메인 화면 영역 (조건부 렌더링) */}
      <main className="flex-1 flex flex-col relative w-full min-w-0 bg-slate-50">
        
        {/* [A] 대시보드 뷰 */}
        {currentView === "dashboard" && <DashBoard />}

        {/* [B] 요약노트 뷰 */}
        {currentView === "notes" && <SummaryNote />}

        {/* [C] 채팅 뷰 */}
        {currentView === "chat" && (
          <div className="flex-1 flex flex-col relative h-full bg-white">
            
            {/* 파일 업로드 전 인트로 화면 */}
            {!isUploadComplete ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-inner"><span className="text-4xl">🎓</span></div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">무엇을 학습할까요?</h2>
                <p className="text-lg text-slate-500 max-w-lg mb-10">학습할 <span className="font-bold text-blue-600">파일 교안</span>을 먼저 업로드해 주세요. <br className="hidden sm:block"/>AI 튜터가 문서를 분석한 뒤 질문에 답변해 드립니다.</p>
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 px-8 py-4 bg-white border-2 border-dashed border-blue-300 rounded-2xl shadow-sm hover:border-blue-500 hover:bg-blue-50 transition-all group">
                  <svg className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                  <span className="font-bold text-blue-700 text-lg">학습 자료 선택하기</span>
                </button>
              </div>
            ) : (
              
              /* 파일 업로드 후 채팅 화면 */
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <header className="h-14 flex items-center justify-between px-6 border-b border-slate-100 shrink-0 bg-white/80 backdrop-blur-sm z-10">
                  <h1 className="font-bold text-lg text-slate-800 truncate">새 튜터링 세션</h1>
                </header>
                
                {/* 말풍선이 쌓이는 영역 */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-40 flex flex-col gap-6">
                  {messages.length === 0 ? (
                    <div className="max-w-3xl mx-auto flex flex-col items-center justify-center h-full text-center opacity-50 pt-10">
                      <span className="text-5xl mb-4">💬</span>                
                      <p className="text-lg font-medium text-slate-600">자료 분석이 완료되었습니다!</p>
                      <p className="text-sm text-slate-400 mt-1">아래 입력창에 교안과 관련된 질문을 입력해 보세요.</p>
                    </div>
                  ) : (
                  <div className="max-w-3xl mx-auto w-full flex flex-col gap-6">
                      {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                          
                          {/* AI 프로필 아이콘 */}
                          {msg.role === "ai" && (
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 shrink-0 shadow-sm">
                              <span className="text-sm">🎓</span>
                            </div>
                          )}
                          
                          <div className={`flex flex-col gap-1.5 max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                            
                            {msg.attachedFiles && msg.attachedFiles.length > 0 && (
                              <div className="flex flex-wrap gap-2 justify-end mb-1">
                                {msg.attachedFiles.map((fileName, fIdx) => (
                                  <div key={fIdx} className="flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-700 px-3.5 py-2.5 rounded-2xl shadow-sm">
                                    <span className="text-lg">📄</span>
                                    <span className="text-[13px] font-bold truncate max-w-[150px]">{fileName}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* 텍스트 말풍선 본체 */}
                            <div className={`rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed ${
                              msg.role === "user" 
                                ? "bg-blue-600 text-white rounded-br-none shadow-sm" 
                                : "bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200"
                            }`}>
                              {msg.content}
                            </div>

                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* [3] 하단 채팅 입력바 영역*/}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/90 to-transparent pt-6 pb-6 px-4 sm:px-6">
              <div className="max-w-3xl mx-auto flex flex-col gap-2">
                
                {/* 첨부파일 칩 미리보기 */}
                {attachedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 px-1 mb-1 animate-in slide-in-from-bottom-2">
                    {attachedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm rounded-xl py-1.5 px-3">
                        <span className="text-xs">📄</span>
                        <span className="text-xs font-bold text-slate-700 max-w-[120px] truncate">{file.name}</span>
                        <button onClick={() => removeAttachedFile(file.name)} className="text-slate-400 hover:text-red-500 transition-colors">✕</button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* 실제 입력창 박스 */}
                <div className={`relative flex items-end gap-2 border rounded-3xl p-2.5 transition-all shadow-sm bg-white ${!isUploadComplete ? "border-slate-200 bg-slate-50 opacity-60" : "border-slate-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"}`}>
                  <input type="file" ref={fileInputRef} className="hidden" multiple accept=".pdf,.pptx,.png,.jpg" onChange={handleFileSelect} />
                  <button onClick={() => fileInputRef.current?.click()} className={`p-2.5 rounded-full shrink-0 transition-colors ${!isUploadComplete ? "text-blue-500 hover:bg-blue-100 animate-pulse" : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                  </button>
                  <textarea 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    onKeyDown={(e) => { 
                      if (e.key === 'Enter' && !e.shiftKey) { 
                        e.preventDefault(); 
                        if (input.trim() || attachedFiles.length > 0) handleSendMessage(); 
                      } 
                    }} 
                    disabled={!isUploadComplete} 
                    placeholder={isUploadComplete ? "AI 튜터에게 질문을 입력하세요..." : "질문하려면 먼저 학습 자료를 첨부해주세요 (왼쪽 + 버튼)"} 
                    className="w-full max-h-32 bg-transparent border-none focus:ring-0 resize-none py-2.5 px-2 text-slate-800 placeholder-slate-400 outline-none text-[15px] disabled:cursor-not-allowed" 
                    rows={1} 
                  />
                  <button onClick={handleSendMessage} disabled={attachedFiles.length === 0} className={`p-2.5 rounded-full shrink-0 transition-all ${input.trim() || attachedFiles.length > 0 ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}>
                    <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}