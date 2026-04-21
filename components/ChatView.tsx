"use client";

import { useEffect, useState, useRef } from "react";

interface ChatViewProps {
  chatNumber?: number | null;
  chatName?: string;
  onAddHistory?: (chatId: number, chatName: string, answer: string) => void;
}

export default function ChatView({ chatNumber, chatName, onAddHistory }: ChatViewProps) {

  const [input, setInput] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadComplete, setIsUploadComplete] = useState(false);
  const [messages, setMessages] = useState<{role: string, content: string, attachedFiles?: string[]}[]>([]);

  // 메세지 전송 로직 상태값
  const [currentFileId, setCurrentFileId] = useState<string>("");
  const [currentChatId, setCurrentChatId] = useState<number>(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const API_BASE_URL = "https://furry-cacciatore-daleyza.ngrok-free.dev";
  //const API_BASE_URL = "https://localhost:8000";

  useEffect(() => {
    const loadHistoryDetail = async () => {
      if (!chatNumber) {
        setMessages([]);             
        setIsUploadComplete(false);  
        setCurrentChatId(0);         
        setCurrentFileId("");       
        setAttachedFiles([]);        
        setInput("");              
        return; 
      }
      
      const token = localStorage.getItem("access_token");
      const headers = { 
        "ngrok-skip-browser-warning": "69420", 
        "Authorization": `Bearer ${token}` 
      };

      try {
        // 전체 히스토리 목록에서 해당 ID의 데이터를 찾거나, 상세 API를 호출합니다.
        const response = await fetch(`${API_BASE_URL}/users/chats/${chatNumber}/memories`, {
          headers: { "ngrok-skip-browser-warning": "69420", "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
          const memories = await response.json();
          setIsUploadComplete(true);
          
        const loadedMessages: any[] = [];
        let lastFileId = "";
        let finalFileName = "";
        memories.forEach((mem: any) => {             
             if (mem.file_id) lastFileId = mem.file_id;             
             if (!finalFileName && (mem.filename || mem.file_name)) {
               finalFileName = mem.filename || mem.file_name;
             }
          });

          if (!finalFileName && chatName) {
             finalFileName = chatName;
          }

          memories.forEach((mem: any, index: number) => {            
            if (mem.file_id) {lastFileId = mem.file_id;}            
            if (mem.question)
            { const shouldAttachFile = (index === 0 && finalFileName !== "");
              loadedMessages.push({ role: "user", content: mem.question, attachedFiles: shouldAttachFile ? [finalFileName] : undefined });
            }
            if (mem.ai_answer) loadedMessages.push({ role: "ai", content: mem.ai_answer });
          });
          
          setMessages(loadedMessages);
          setCurrentChatId(chatNumber);
          if (lastFileId) {
            setCurrentFileId(lastFileId);          
          }
        }
        const fileResponse = await fetch(`${API_BASE_URL}/last-file/${chatNumber}`, { headers });

        if (fileResponse.ok) {
          const fileData = await fileResponse.json();
                    
          setCurrentFileId(fileData.job_id);                    
          
        } else if (fileResponse.status === 404) {
          setCurrentFileId("");
          setAttachedFiles([]);
        }
      } catch (error) {
        console.error("과거 내역 로드 실패:", error);
      }
    };
    loadHistoryDetail();
  }, [chatNumber]);


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
    
    const questionText = input.trim();
    const fileNames = attachedFiles.map(f => f.name);

    // 화면(UI)에 내 메시지와 파일 말풍선 추가
    setMessages((prev) => [...prev, { role: "user", content: questionText, attachedFiles: fileNames }]);
    setInput("");

    const filesToSend = [...attachedFiles];
    setAttachedFiles([]);

    try {
      const token = localStorage.getItem("access_token");      
      
      // 변수 담아둘 곳
      let finalFileId = currentFileId;
      let finalChatId = currentChatId;
      
      // 채팅방 생성
      if (!finalChatId) {
        
        const newChatName = fileNames.length > 0 
          ? (fileNames.length > 1 ? `${fileNames[0]} 외 ${fileNames.length - 1}개` : fileNames[0])
          : (questionText.substring(0, 15) + (questionText.length > 15 ? "..." : ""));

        const createChatRes = await fetch(`${API_BASE_URL}/users/chats`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "69420", 
            "Authorization": `Bearer ${token}` 
          },
          body: JSON.stringify({ chat_name: newChatName }) 
        });

        if (!createChatRes.ok) throw new Error("채팅 생성 중 오류가 발생했습니다.");
        const parsedData = await createChatRes.json();
        
        finalChatId = parsedData.chat_number;
        setCurrentChatId(finalChatId);

        if (onAddHistory) {
          onAddHistory(finalChatId, newChatName, "");
        }    
        
        
        // 파일업로드
        if (filesToSend.length > 0) {
        const formData = new FormData();
        filesToSend.forEach((file) => formData.append("file", file));
        
        const uploadResponse = await fetch(`${API_BASE_URL}/upload-parse/?chat_number=${finalChatId}`, {
          method: "POST",
          headers: { 
            "ngrok-skip-browser-warning": "69420", 
            "Authorization": `Bearer ${token}` 
          },
          body: formData,
        });

        if (!uploadResponse.ok) throw new Error("파일 업로드 중 오류가 발생했습니다.");
        const parsedData = await uploadResponse.json();
                
        finalFileId = parsedData.job_id || parsedData.id || parsedData.file_id; 
        setCurrentFileId(finalFileId);       

        if (!questionText) {
           const aiMsg = parsedData.message;
           setMessages((prev) => [...prev, { role: "ai", content: aiMsg }]);
        }
      }
    } 
      
      // 텍스트 질문이 있다면
      if (questionText) {
        if (!finalFileId) {
          alert("학습 자료가 정상적으로 업로드되지 않았습니다.");
          setIsUploadComplete(false); 
          return; 
        }
        const response = await fetch(`${API_BASE_URL}/rag/qa`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json", 
            "ngrok-skip-browser-warning": "69420", 
            "Authorization": `Bearer ${token}` 
          },          
          body: JSON.stringify({ 
            chat_number: finalChatId || 0,
            file_id: finalFileId,
            question: questionText,
          }),
        });

        if (!response.ok) throw new Error("질문 처리 중 오류가 발생했습니다.");
        const data = await response.json();
        setMessages((prev) => [...prev, { role: "ai", content: data.answer }]);                        
      }        
    } catch (error: any) {
      alert(error.message);
      console.error(error);
    }
  };  

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      {!isUploadComplete ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-inner"><span className="text-4xl">🎓</span></div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">무엇을 학습할까요?</h2>
          <p className="text-lg text-slate-500 max-w-lg mb-10">학습할 <span className="font-bold text-blue-600">파일 교안</span>을 먼저 업로드해 주세요.</p>
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 px-8 py-4 bg-white border-2 border-dashed border-blue-300 rounded-2xl shadow-sm hover:border-blue-500 hover:bg-blue-50 transition-all group">
            <span className="font-bold text-blue-700 text-lg">학습 자료 선택하기</span>
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <header className="h-14 flex items-center px-6 border-b border-slate-100 shrink-0 bg-white/80 backdrop-blur-sm">
            <h1 className="font-bold text-lg text-slate-800">{chatName || "새 튜터링 세션"}</h1>
          </header>
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="max-w-3xl mx-auto flex flex-col gap-6">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex flex-col gap-1.5 max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  {msg.attachedFiles && msg.attachedFiles.map((fn, fidx) => (
                    <div key={fidx} className="bg-slate-100 px-3 py-2 rounded-xl text-xs mb-1">📄 {fn}</div>
                  ))}                  
                    {msg.content && (
                  <div className={`rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed ${
                    msg.role === "user" 
                      ? "bg-blue-600 text-white rounded-br-none shadow-sm" 
                      : "bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200"
                  }`}>
                    {msg.content}
                  </div>
                )}
                  </div>
                </div>
            ))}
          <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
      )}

      {/* 하단 입력바 */}
      <div className="bg-white p-4 sm:p-6 border-t border-slate-100 shrink-0 z-10 relative">
        <div className="max-w-3xl mx-auto">
          {attachedFiles.length > 0 && (
            <div className="flex gap-2 mb-2">

              {attachedFiles.map((f, i) => (
                <div key={i} className="bg-slate-50 border px-3 py-1.5 rounded-xl text-xs flex items-center gap-2">
                  <span>📄 {f.name}</span>
                  <button onClick={() => removeAttachedFile(f.name)}>✕</button>
                </div>
              ))}
            </div>
          )}

          <div className="relative flex items-end gap-2 border border-slate-300 rounded-3xl p-2.5 bg-white focus-within:ring-2 focus-within:ring-blue-500">
            <input type="file" ref={fileInputRef} className="hidden" multiple accept=".pdf,.pptx,.png,.jpg" onChange={handleFileSelect} />
            <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-slate-400 hover:text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth={2.5}/></svg>
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
              placeholder={isUploadComplete ? "AI 튜터에게 질문을 입력하세요..." : "질문하려면 먼저 학습 자료를 첨부해주세요"}              
              className="w-full bg-transparent border-none focus:ring-0 resize-none py-2.5 outline-none"
              rows={1}
            />
            <button onClick={handleSendMessage} 
              disabled={attachedFiles.length === 0 && !input.trim()} 
              className={`p-2.5 rounded-full shrink-0 transition-all ${
                input.trim() || attachedFiles.length > 0 
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md" 
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeWidth={2.5}/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}