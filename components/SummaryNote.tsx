"use client";

import { useState, useEffect } from "react";

// page.tsx에서 넘겨줄 props 타입 정의 (노트 펴기 함수)
interface SummaryNoteProps {
  onOpenNote: (noteId: number) => void;
}

// 요약노트 데이터 구조
interface Note {
  id: number;
  title: string;
  summary: string;
  date: string;
  tag: string;
}

// 💡 [임시 데이터] 서버 연결 전 UI를 확인하기 위한 가짜 데이터입니다.
const MOCK_NOTES: Note[] = [
  { 
    id: 101, // 이 ID가 나중에 채팅방(세션) ID와 연결됩니다.
    title: "데이터베이스 정규화 핵심 요약", 
    summary: "제1정규형(1NF)부터 BCNF까지, 데이터 중복을 최소화하기 위한 함수 종속성 제거 과정 완벽 정리.", 
    date: "2026-04-12", 
    tag: "데이터베이스" 
  },
  { 
    id: 102, 
    title: "운영체제 스케줄링 알고리즘", 
    summary: "FCFS, SJF, Round Robin 등 CPU 스케줄링 기법의 장단점과 문맥 교환(Context Switching)의 오버헤드 분석.", 
    date: "2026-04-14", 
    tag: "운영체제" 
  },
  { 
    id: 103, 
    title: "React Lifecycle 및 Hooks", 
    summary: "컴포넌트의 마운트, 업데이트, 언마운트 과정과 useEffect의 의존성 배열(Dependency Array) 동작 원리.", 
    date: "방금 전", 
    tag: "프론트엔드" 
  },
];

export default function SummaryNote({ onOpenNote }: SummaryNoteProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    //실제 데이터 로직
    const fetchRealNotes = async () => {
      /*
      const userId = localStorage.getItem("user_id") || "1";
      const token = localStorage.getItem("access_token");
      const API_BASE_URL = "https://furry-cacciatore-daleyza.ngrok-free.dev";

      try {
        // 서버의 요약노트 목록 API 호출 (엔드포인트는 실제 서버에 맞게 수정)
        const response = await fetch(`${API_BASE_URL}/users/${userId}/notes`, {
          method: "GET",
          headers: {
            "ngrok-skip-browser-warning": "69420",
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setNotes(data);
        }
      } catch (error) {
        console.error("요약노트 불러오기 실패:", error);
      } finally {
        setIsLoading(false);
      }
      */
    };

    // 임시 데이터 적용
    // 실제 서버가 준비되면 아래 두 줄을 지우고 위 fetchRealNotes() 함수를 실행하면 됩니다.
    setNotes(MOCK_NOTES);
    setIsLoading(false);

  }, []);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative overflow-hidden">
      
      {/* 상단 헤더 */}
      <header className="h-14 flex items-center px-6 border-b border-slate-200 shrink-0 bg-white">
        <h1 className="font-bold text-lg text-slate-800 flex items-center gap-2">
          <span className="text-xl">📝</span> 요약노트
        </h1>
      </header>

      {/* 요약노트 리스트 영역 */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-slate-400 font-medium">
            요약노트를 불러오는 중...
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center opacity-40">
            <span className="text-5xl mb-4">📭</span>
            <p className="font-medium text-slate-600">아직 작성된 요약노트가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {notes.map((note) => (
              <div 
                key={note.id} 
                className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col transition-all hover:shadow-md hover:-translate-y-1 group"
              >
                
                {/* 노트 태그 및 날짜 */}
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-indigo-50 text-indigo-600 text-[11px] font-black px-2.5 py-1 rounded-lg">
                    {note.tag}
                  </span>
                  <span className="text-xs font-medium text-slate-400">{note.date}</span>
                </div>

                {/* 노트 제목 */}
                <h3 className="font-extrabold text-xl text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {note.title}
                </h3>
                
                {/* 노트 내용 미리보기 (최대 3줄 표시) */}
                <div className="flex-1 mb-6">
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
                    {note.summary}
                  </p>
                </div>

                {/* 🚀 요약노트 펴기 버튼 (클릭 시 ChatView로 이동) */}
                <button 
                  onClick={() => onOpenNote(note.id)}
                  className="w-full py-3.5 bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm active:scale-[0.98]"
                >
                  요약노트 펴기
                </button>
                
              </div>
            ))}
          </div>
        )}
      </div>
      
    </div>
  );
}