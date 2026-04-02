"use client";

import { useState, useRef } from "react";

export default function ChatPage() {
  const [input, setInput] = useState("");
  // 파일을 담을 상태 (파일이 없으면 첫 화면, 있으면 채팅 화면)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 업로드 완료 상태
  const [isUploadComplete, setIsUploadComplete] = useState(false);

  // 사이드바 열림 상태
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 파일 선택 처리 함수 
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setAttachedFiles((prev) => [...prev, ...selectedFiles]);
      setIsUploadComplete(true); 
    }
  };

  // 첨부된 파일 지우기
  const removeAttachedFile = (fileNameToRemove: string) => {
    setAttachedFiles(attachedFiles.filter(f => f.name !== fileNameToRemove));
    if (attachedFiles.length === 1) {
      setIsUploadComplete(false); // 마지막 파일 지우면 다시 초기 상태로
    }
  };

  // 질문 전송 처리
  const handleSendMessage = async () => {
    if (!input.trim() && attachedFiles.length === 0) return; 

    const API_BASE_URL = "http://localhost:8000"; 
    const questionText = input.trim() ? input : "이 문서를 분석해 주세요.";

    try {
      // 1. 파일 업로드 및 파싱 API 호출
      if (attachedFiles.length > 0) {
        const formData = new FormData();
        
        attachedFiles.forEach((file) => {
          formData.append("file", file); 
        });

        const uploadResponse = await fetch(`${API_BASE_URL}/upload-parse/`, {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          if (uploadResponse.status === 413) throw new Error("파일 용량이 10MB를 초과했습니다.");
          throw new Error("파일 업로드 중 오류가 발생했습니다.");
        }

        const parsedData = await uploadResponse.json();
        console.log("🎉 파일 파싱 성공:", parsedData);
        
        // TODO: 여기서 받아온 요약(summary)이나 키워드(keywords)를 채팅 화면에 AI의 첫 답변으로 띄워주면 됩니다!
      }

      // 2. 학습 이력(채팅) 생성 API 호출 (POST /users/{user_id}/histories)
      // const chatResponse = await fetch(`${API_BASE_URL}/users/1/histories`, { ... })
      // ... (채팅 전송 로직은 이어서 작성할 예정) ...

      setInput(""); 
      
      // 파일을 보낸 후 칩(미리보기)을 지울지 유지할지 결정
      // setAttachedFiles([]); 

    } catch (error: any) {
      console.error("API 통신 에러:", error);
      alert(error.message);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white overflow-hidden">
      
      {/* 1. 사이드바 */}
      <aside className={`bg-slate-50 border-r border-slate-200 hidden md:flex flex-col shrink-0 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="h-14 flex items-center border-b border-slate-100 px-4 shrink-0">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-xl text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors focus:outline-none ${
              !isSidebarOpen && "mx-auto"
            }`}
            title="메뉴 열기/닫기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-4 p-3">
            <button 
            onClick={() => { setAttachedFiles([]); setIsUploadComplete(false); }}
            className={`flex items-center bg-white border border-slate-200 rounded-xl p-3 hover:bg-slate-100 hover:border-blue-300 transition-all shadow-sm group whitespace-nowrap ${
              isSidebarOpen ? "justify-start gap-3 px-4" : "justify-center px-0"
            }`}
            title="새로운 튜터링">
              <span className="text-xl group-hover:scale-110 transition-transform">➕</span>
            {isSidebarOpen && <span className="font-bold text-slate-700 group-hover:text-blue-600">새 채팅</span>}
          </button>
        </div>
        <div className="flex flex-col gap-1 mt-2">
          {isSidebarOpen && <p className="text-xs font-bold text-slate-400 mb-2 px-2">최근 학습 기록</p>}          
          <ul className="space-y-1">            
          </ul>
          </div>        
      </aside>

      {/* 2. 메인 화면 */}
      <main className="flex-1 flex flex-col relative w-full">
        
        {/* [A] 파일이 없을 때 보여줄 '초기 인트로 화면'  */}
        {!isUploadComplete ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <span className="text-4xl">🎓</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
              무엇을 학습할까요?
            </h2>
            <p className="text-lg text-slate-500 max-w-lg mb-10">
              학습할 <span className="font-bold text-blue-600">파일 교안</span>을 먼저 업로드해 주세요. <br className="hidden sm:block"/>
              AI 튜터가 문서를 분석한 뒤 질문에 답변해 드립니다.
            </p>

            {/* 화면 중앙의 큰 업로드 버튼 */}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3 px-8 py-4 bg-white border-2 border-dashed border-blue-300 rounded-2xl shadow-sm hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <svg className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-bold text-blue-700 text-lg">학습 자료 선택하기</span>
            </button>
          </div>
        ) : (
          
        /* [B] 파일이 업로드된 후 보여줄 '채팅 화면'*/
          <div className="flex-1 flex flex-col">
            <header className="h-14 flex items-center justify-between px-6 border-b border-slate-100 shrink-0 bg-white/80 backdrop-blur-sm z-10">
              <h1 className="font-bold text-lg text-slate-800 truncate">새 튜터링 세션</h1>
            </header>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-32">
              <div className="max-w-3xl mx-auto flex flex-col items-center justify-center h-full text-center opacity-50 pt-20">
                <span className="text-5xl mb-4">💬</span>                
                <p className="text-sm text-slate-400 mt-1">아래 입력창에 교안과 관련된 질문을 입력해 보세요.</p>
              </div>
            </div>
          </div>
        )}

        {/* 3. 하단 입력바 */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-6 pb-6 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto flex flex-col gap-2">
            
            {/* 첨부된 파일 미리보기 칩 */}
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 px-1 mb-1 animate-in slide-in-from-bottom-2">
                {attachedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm rounded-xl py-1.5 px-3">
                    <span className="text-xs">📄</span>
                    <span className="text-xs font-bold text-slate-700 max-w-[120px] truncate">{file.name}</span>
                    <button onClick={() => removeAttachedFile(file.name)} className="text-slate-400 hover:text-red-500">✕</button>
                  </div>
                ))}
              </div>
            )}

            <div className={`relative flex items-end gap-2 border rounded-3xl p-2.5 transition-all shadow-sm bg-white ${
              !isUploadComplete ? "border-slate-200 bg-slate-50 opacity-60" : "border-slate-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
            }`}>
              
              {/* 파일 첨부 버튼 */}
              <input 
                type="file" ref={fileInputRef} className="hidden" multiple accept=".pdf,.pptx,.png,.jpg"
                onChange={handleFileSelect} 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className={`p-2.5 rounded-full shrink-0 transition-colors ${
                  !isUploadComplete ? "text-blue-500 hover:bg-blue-100 animate-pulse" : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              </button>

              {/* 텍스트 입력창 (파일 올리기 전에는 비활성화) */}
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (input.trim() || attachedFiles.length > 0) {
                      handleSendMessage();
                    }
                  }
                }}
                disabled={!isUploadComplete}
                placeholder={isUploadComplete ? "AI 튜터에게 질문을 입력하세요..." : "질문하려면 먼저 학습 자료를 첨부해주세요 (왼쪽 + 버튼)"}
                className="w-full max-h-32 bg-transparent border-none focus:ring-0 resize-none py-2.5 px-2 text-slate-800 placeholder-slate-400 outline-none text-[15px] disabled:cursor-not-allowed"
                rows={1}
              />

              {/* 전송 버튼 */}
              <button 
                onClick={handleSendMessage}
                disabled={!input.trim() || attachedFiles.length === 0}
                className={`p-2.5 rounded-full shrink-0 transition-all ${
                  input.trim() || attachedFiles.length > 0 ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}