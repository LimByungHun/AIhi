"use client";

import { useState, useEffect } from "react";

interface QuizReport {
  id: number;
  title: string;
  total_questions: number;
  solved_questions: number;
  score: number;
  last_played: string;
}

 const MOCK_COURSES = [
   {
     id: 1,
     title: "데이터베이스 정규화",    
     total_questions: 55,
     solved_questions: 20,
     score: 72,
     last_played: "2024-06-15",
     progress: 36,
      stats: [
        { label: "정규화 단계별 문제", current: 12, total: 30 },
        { label: "ER 다이어그램 문제", current: 5, total: 15 },
        { label: "SQL 쿼리 문제", current: 3, total: 10 },
      ]
   }
 ];

export default function Dashboard() {
  const [quizzes, setQuizzes] = useState<QuizReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuizData = async () => {
      const userId = localStorage.getItem("user_id") || "1";
      const token = localStorage.getItem("access_token");
      //const API_BASE_URL = "https://localhost:8000";
      const API_BASE_URL = "https://furry-cacciatore-daleyza.ngrok-free.dev";


      try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/quizzes`, {
          method: "GET",
          headers: {
            "ngrok-skip-browser-warning": "69420",
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setQuizzes(data);
        }
      } catch (error) {
        console.error("대시보드 데이터 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizData();
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50">
      <header className="h-14 flex items-center px-6 border-b border-slate-200 shrink-0 bg-white">
        <h1 className="font-bold text-lg text-slate-800">성취도 대시보드</h1>
      </header>
      
      <div className="flex-1 overflow-y-auto p-6 md:p-8">        

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {MOCK_COURSES.map((course) => (
            <div key={course.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col transition-all hover:shadow-md hover:-translate-y-1">
              <div className="mb-6">
                <h3 className="font-extrabold text-lg text-slate-900 truncate">{course.title}</h3>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="relative w-28 h-28 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#e2e8f0" strokeWidth="6" />
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#3b82f6" strokeWidth="6" strokeDasharray={`${course.progress} ${100 - course.progress}`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-xl font-black text-slate-800">{course.progress}%</span>
                  </div>
                </div>

                <div className="flex-1 ml-6 bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <ul className="space-y-2 text-sm">
                    {course.stats.map((stat, idx) => (
                      <li key={idx} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          <span className="text-slate-600">{stat.label}</span>
                        </div>
                        <span className="font-bold text-slate-800 text-right w-12">
                          <span className="text-blue-600">{stat.current}</span>
                          <span className="text-slate-300 mx-1">/</span>
                          {stat.total}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-auto">
                <div className="flex items-center justify-center gap-4 text-xs text-slate-500 font-medium mb-4">
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span>학습전</div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>학습완료</div>
                </div>
                <div className="flex gap-2.5">
                <button className="w-full py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors">
                  이어서 풀기
                </button>
                <button className="w-full mt-3 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                  오답노트 보기
                </button>
              </div>
            </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  // return (
  //   <div className="flex-1 flex flex-col h-full bg-slate-50 relative overflow-hidden">
      
  //     <header className="h-14 flex items-center px-6 border-b border-slate-200 shrink-0 bg-white">
  //       <h1 className="font-bold text-lg text-slate-800">학습 성취도</h1>
  //     </header>

  //     <div className="flex-1 overflow-y-auto p-6 md:p-8">
  //       {isLoading ? (
  //         <div className="flex items-center justify-center h-64 text-slate-400 font-medium">
  //           성취도 데이터를 불러오는 중...
  //         </div>
  //       ) : quizzes.length === 0 ? (
  //         <div className="flex flex-col items-center justify-center h-64 text-center opacity-40">
  //           <span className="text-5xl mb-4">🎯</span>
  //           <p className="font-medium text-slate-600">아직 완료된 퀴즈가 없습니다.</p>
  //         </div>
  //       ) : (
  //         <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
  //           {quizzes.map((quiz) => {
  //             // 1. 진행률 계산 (0으로 나누는 에러 방지)
  //             const progress = quiz.total_questions > 0 
  //               ? Math.round((quiz.solved_questions / quiz.total_questions) * 100) 
  //               : 0;

  //             return (
  //               <div key={quiz.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col transition-all hover:shadow-md hover:-translate-y-1">
                  
  //                 {/* 상단: 제목과 최근 풀이 날짜 */}
  //                 <div className="mb-6">
  //                   <h3 className="font-extrabold text-lg text-slate-900 truncate">{quiz.title}</h3>
  //                   <p className="text-xs text-slate-400 mt-1">최근 풀이: {quiz.last_played}</p>
  //                 </div>

  //                 <div className="flex items-center justify-between mb-6">
  //                   {/* 왼쪽: 원형 프로그레스 바 */}
  //                   <div className="relative w-28 h-28 flex-shrink-0">
  //                     <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
  //                       <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#e2e8f0" strokeWidth="6" />
  //                       <circle 
  //                         cx="18" cy="18" r="15.915" fill="transparent" stroke="#3b82f6" strokeWidth="6" 
  //                         strokeDasharray={`${progress} ${100 - progress}`} 
  //                         strokeLinecap="round" 
  //                       />
  //                     </svg>
  //                     <div className="absolute inset-0 flex items-center justify-center flex-col">
  //                       <span className="text-xl font-black text-slate-800">{progress}%</span>
  //                     </div>
  //                   </div>

  //                   {/* 오른쪽: 세부 스탯 리스트*/}
  //                   <div className="flex-1 ml-6 bg-slate-50 rounded-xl p-4 border border-slate-100">
  //                     <ul className="space-y-2 text-sm">
                        
  //                       <li className="flex justify-between items-center">
  //                         <div className="flex items-center gap-2">
  //                           <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
  //                           <span className="text-slate-600 font-medium">진행 문항</span>
  //                         </div>
  //                         <span className="font-bold text-slate-800 text-right w-14">
  //                           <span className="text-blue-600">{quiz.solved_questions}</span>
  //                           <span className="text-slate-300 mx-1">/</span>
  //                           {quiz.total_questions}
  //                         </span>
  //                       </li>

  //                       <li className="flex justify-between items-center">
  //                         <div className="flex items-center gap-2">
  //                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
  //                           <span className="text-slate-600 font-medium">현재 점수</span>
  //                         </div>
  //                         <span className="font-bold text-slate-800 text-right w-14">
  //                           <span className="text-emerald-600">{quiz.score}</span>
  //                           <span className="text-slate-300 mx-1">/</span>
  //                           100
  //                         </span>
  //                       </li>

  //                     </ul>
  //                   </div>
  //                 </div>

  //                 {/* 하단: 범례 및 버튼 영역 */}
  //                 <div className="mt-auto">
  //                   <div className="flex items-center justify-center gap-4 text-xs text-slate-500 font-medium mb-4">
  //                     <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span>학습전</div>
  //                     <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>학습완료</div>
  //                   </div>                    

  //                   <div className="flex flex-col gap-2.5">
  //                     <button className="w-full py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm">
  //                       이어서 풀기
  //                     </button>
  //                     <button className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
  //                       오답노트 보기
  //                     </button>
  //                   </div>
  //                 </div>
  //               </div>
  //             );
  //           })}
  //         </div>
  //       )}
  //     </div>
  //   </div>
  // );
}