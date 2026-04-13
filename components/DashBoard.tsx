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
    progress: 55,
    stats: [      
      { label: "퀴즈", current: 11, total: 30 },
    ],
  }
];

export default function Dashboard() {
  const [quizzes, setQuizzes] = useState<QuizReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchQuizData = async () => {
      const userId = localStorage.getItem("user_id") || "1";
      const token = localStorage.getItem("access_token");
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
        <h1 className="font-bold text-lg text-slate-800">학습 성취도</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-slate-400 font-medium">
            성취도 데이터를 불러오는 중...
          </div>
        ) : quizzes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center opacity-40">
            <span className="text-5xl mb-4">🎯</span>
            <p className="font-medium text-slate-600">아직 완료된 퀴즈가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {quizzes.map((quiz) => {
              const progress = (quiz.solved_questions / quiz.total_questions) * 100;
              
              return (
                <div key={quiz.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col transition-all hover:shadow-md">
                  {/* 상단: 제목과 최근 풀이일 */}
                  <div className="mb-6">
                    <h3 className="font-extrabold text-lg text-slate-900 truncate">{quiz.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">최근 풀이: {quiz.last_played}</p>
                  </div>

                  {/* 중단: 점수 및 진행도 시각화 */}
                  <div className="flex-1 mb-8">
                    <div className="flex items-end justify-between mb-2">
                      <span className="text-sm font-bold text-slate-500">퀴즈 진행도</span>
                      <span className="text-2xl font-black text-blue-600">{quiz.score}<span className="text-sm text-slate-400 ml-1">점</span></span>
                    </div>
                    
                    {/* 진행바 */}
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-2">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-400 text-right font-medium">
                      {quiz.solved_questions} / {quiz.total_questions} 문제 완료
                    </p>
                  </div>

                  {/* 하단: 버튼 영역 */}
                  <div className="flex gap-2.5">
                    <button className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors">
                      오답노트
                    </button>
                    <button className="flex-1 py-3 bg-blue-600 border border-transparent text-white font-bold rounded-xl hover:bg-blue-700 shadow-sm transition-colors">
                      이어서 풀기
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
//   return (
//     <div className="flex-1 flex flex-col h-full bg-slate-50">
//       <header className="h-14 flex items-center px-6 border-b border-slate-200 shrink-0 bg-white">
//         <h1 className="font-bold text-lg text-slate-800">성취도 대시보드</h1>
//       </header>
      
//       <div className="flex-1 overflow-y-auto p-6 md:p-8">        

//         <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
//           {MOCK_COURSES.map((course) => (
//             <div key={course.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col transition-all hover:shadow-md hover:-translate-y-1">
//               <div className="mb-6">
//                 <h3 className="font-extrabold text-lg text-slate-900 truncate">{course.title}</h3>
//               </div>

//               <div className="flex items-center justify-between mb-6">
//                 <div className="relative w-28 h-28 flex-shrink-0">
//                   <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
//                     <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#e2e8f0" strokeWidth="6" />
//                     <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#3b82f6" strokeWidth="6" strokeDasharray={`${course.progress} ${100 - course.progress}`} strokeLinecap="round" />
//                   </svg>
//                   <div className="absolute inset-0 flex items-center justify-center flex-col">
//                     <span className="text-xl font-black text-slate-800">{course.progress}%</span>
//                   </div>
//                 </div>

//                 <div className="flex-1 ml-6 bg-slate-50 rounded-xl p-4 border border-slate-100">
//                   <ul className="space-y-2 text-sm">
//                     {course.stats.map((stat, idx) => (
//                       <li key={idx} className="flex justify-between items-center">
//                         <div className="flex items-center gap-2">
//                           <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
//                           <span className="text-slate-600">{stat.label}</span>
//                         </div>
//                         <span className="font-bold text-slate-800 text-right w-12">
//                           <span className="text-blue-600">{stat.current}</span>
//                           <span className="text-slate-300 mx-1">/</span>
//                           {stat.total}
//                         </span>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               </div>

//               <div className="mt-auto">
//                 <div className="flex items-center justify-center gap-4 text-xs text-slate-500 font-medium mb-4">
//                   <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span>학습전</div>
//                   <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>학습완료</div>
//                 </div>
//                 <div className="flex gap-2.5">
//                 <button className="w-full py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors">
//                   이어서 풀기
//                 </button>
//                 <button className="w-full mt-3 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
//                   오답노트 보기
//                 </button>
//               </div>
//             </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }