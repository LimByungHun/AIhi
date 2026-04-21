"use client"; 
import { useState, useRef, useEffect } from "react";
import DashBoard from "@/components/DashBoard";
import SummaryNote from "@/components/SummaryNote";
import GroupChat from "@/components/GroupChat"
import ChatView from "@/components/ChatView";
import GroupChatRoom from "@/components/GroupChatRoom";
import { useRouter } from "next/navigation";
import NoteChatView from "@/components/NoteChatView";


// 채팅내역 인터페이스
interface ChatHistory {
  chat_number: number;
  user_id: number;
  chat_name: string;
  created_at: string;
}

export default function ChatPage() {  
  // 상태(State) 관리 영역  
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [currentView, setCurrentView] = useState("chat");
  const [chatKey, setChatKey] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);    

  // 유저 프로필 드롭다운
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [userName, setUserName] = useState(localStorage.getItem("user_name") || "user_name");
  const [userEmail, setUserEmail] = useState(localStorage.getItem("user_email") || "user_email");
  
  const [editName, setEditName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [activeChatName, setActiveChatName] = useState<string>("");

  // AI 패널 열기 여부 (그룹 채팅)
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);

  //const API_BASE_URL = "https://localhost:8000";
  const API_BASE_URL = "https://furry-cacciatore-daleyza.ngrok-free.dev";



  useEffect(() => {
    const fetchData = async () => {
      const userId = localStorage.getItem("user_id");
      const token = localStorage.getItem("access_token");
      const headers = { 
        "ngrok-skip-browser-warning": "69420", 
        "Authorization": `Bearer ${token}` 
      };
      
        // 유저 정보 불러오기 API 호출 (GET)
        const userRes = await fetch(`${API_BASE_URL}/users/${userId}`, { headers });
        if (userRes.ok) {
          const userData = await userRes.json();                    
          setUserEmail(userData.email);
          setUserName(userData.name);
        }        
    };

    fetchData();
  }, []);

  // 로그아웃
  const handleLogout = () => {    
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_id");

    setIsUserMenuOpen(false);
    
    router.push("/login");     
  };

  const openChatSession = (chatId: number) => {
    setActiveChatId(chatId);
    setCurrentView("chat");
    setChatKey(prev => prev + 1);
  };

  // 정보 수정 제출 함수 (서버로 변경된 데이터 전송)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = localStorage.getItem("user_email");
    const token = localStorage.getItem("access_token");

    // 보낼 데이터 묶기 (비밀번호는 입력했을 때만 포함)
    const updatePayload: any = { name: editName };
    if (editPassword.trim() !== "") {
      updatePayload.password = editPassword;
    }

    try {
      // 정보 수정 API 호출 (PUT 또는 PATCH)
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updatePayload)
      });

      if (!response.ok) throw new Error("정보 수정에 실패했습니다.");

      alert("회원 정보가 성공적으로 수정되었습니다! 🎉");
      
      // 화면에 보이는 이름도 즉시 업데이트
      setUserName(editName);
      
      // 모달 닫고 비밀번호 초기화
      setIsEditModalOpen(false);
      setEditPassword("");

    } catch (error: any) {
      alert(error.message);
      console.error(error);
    }
  };

  const openEditModal = () => {
    setEditName(userName);
    setEditPassword("");
    setIsEditModalOpen(true);
    setIsUserMenuOpen(false);
  };
  
  // 채팅로그

  const fetchChatHistories = async () => {    
    const token = localStorage.getItem("access_token");

    if (!token) {
      setIsLoadingHistory(false);
      return;
    }    
    try {
      const response = await fetch(`${API_BASE_URL}/users/chats`, {
        headers: { "ngrok-skip-browser-warning": "69420", "Authorization": `Bearer ${token}` }
      });      
      if (response.ok) setChatHistories(await response.json());
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingHistory(false);
    }    
  };  
  const handleAddNewHistory = (newChatId: number, questionText: string, aiAnswer: string) => {
    setChatHistories(prev => [
      { chat_number: newChatId, user_id: 1, chat_name: questionText, created_at: new Date().toISOString() },
      ...prev
    ]);
  };
      
  useEffect(() => {
    fetchChatHistories();
  }, []);
  
  

  
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
              onClick={() => setCurrentView("group")} 
              className={`flex items-center rounded-xl transition-colors whitespace-nowrap group ${currentView === "group" ? "bg-blue-50 text-blue-700 font-bold" : "hover:bg-slate-200 text-slate-700"} ${isSidebarOpen ? "p-2.5 justify-start gap-3 px-3" : "p-3 justify-center px-0"}`}
            >
              <span className={`text-xl group-hover:scale-110 transition-transform ${currentView === "group" ? "opacity-100" : "opacity-70"}`}>👥</span>
              {isSidebarOpen && <span className="text-[15px]">그룹 채팅</span>}
            </button>

            <button 
              onClick={() => { 
                setCurrentView("chat"); 
                setActiveChatId(null);
                setActiveChatName("");
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
                      openChatSession(chat.chat_number)
                      setActiveChatName(chat.chat_name)
                      setCurrentView("chat");
                    }}
                    className="group flex items-center gap-3 rounded-lg hover:bg-slate-200 p-2.5 px-3 cursor-pointer transition-all"                    
                  >
                    <span className="text-lg opacity-70">
                      {/\.(pdf|pptx|png|jpg|jpeg)$/i.test(chat.chat_name) ? "📄" : "💬"}
                    </span>
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

        <div className="absolute top-[10px] right-6 z-50">
          <div className="relative">
          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className={`flex items-center justify-center w-10 h-10 rounded-full border shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${isUserMenuOpen ? 'bg-slate-100 border-slate-300 scale-105' : 'bg-white border-slate-200 hover:bg-slate-100'}`}
          >
            <span className="text-xl">👤</span>          
          </button>

          {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* 상단: 사용자 정보 */}
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                  <p className="text-[15px] font-extrabold text-slate-800">{userName}님</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{userEmail}</p>
                </div>
                
                {/* 중단: 일반 메뉴 */}
                <div className="p-2 flex flex-col gap-1">
                  <button 
                    onClick={openEditModal}
                    className="flex items-center gap-3 w-full text-left px-3 py-2.5 text-sm font-bold text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <span className="text-lg">✏️</span> 사용자 수정
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full text-left px-3 py-2.5 text-sm font-bold text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <span className="text-lg">🚪</span> 로그아웃
                  </button>                  
                </div>
              </div>
            )}    
            </div>                        
        </div>
        
        {/* [A] 대시보드 뷰 */}
        {currentView === "dashboard" && <DashBoard />}

        {/* [B] 요약노트 뷰 */}
        {currentView === "notes" && (
          <SummaryNote onOpenNote={(noteId) => {
            setActiveChatId(noteId);
            setCurrentView("note-detail");
          }} />
        )}
        {currentView === "note-detail" && activeChatId && (
          <NoteChatView 
          noteId={activeChatId} 
          onBack={() => setCurrentView("notes")}/>
          )}


        {/* [C] 그룹 채팅 뷰 */}
        {currentView === "group" && (
          <GroupChat onEnterGroup={(group) => { setSelectedGroup(group);
            setCurrentView("group-chat-room"); }} />
          )}

          {currentView === "group-chat-room" && (
          <GroupChatRoom 
            group={selectedGroup} 
            onBack={() => setCurrentView("group")} 
            isPanelOpen={isAiPanelOpen} 
            setIsPanelOpen={setIsAiPanelOpen} 
          />
        )}

        {/* [D] 채팅 뷰 */}
        {currentView === "chat" && <ChatView key={activeChatId || chatKey}
        chatNumber={activeChatId} chatName={activeChatName} onAddHistory={handleAddNewHistory} />}
      </main>

      {/* 정보 수정 모달 */}
    {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 shadow-2xl w-full max-w-md border border-slate-200 animate-in zoom-in-95 duration-200 relative">
            
            <button 
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👤</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">사용자 정보 수정</h2>
              <p className="text-sm text-slate-500 mt-2">새롭게 변경할 정보를 입력해 주세요.</p>
            </div>

            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">이름</label>
                <input 
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">이메일</label>
                <input 
                  type="email"
                  value={userEmail}
                  disabled 
                  className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-xl px-4 py-3 outline-none cursor-not-allowed font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">새 비밀번호</label>
                <input 
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="변경할 비밀번호를 입력하세요"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-medium placeholder-slate-400"
                />
              </div>

              <div className="mt-4">
                <button 
                  type="submit"
                  className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-md transition-all active:scale-[0.98]"
                >
                  정보 수정하기
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}