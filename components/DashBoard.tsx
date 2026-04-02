"use client";

export interface DashboardFile {
  id: string;
  name: string;
  category: string;
  time: string;
  aiQuestions: number;
  score: number;
}

interface DashboardProps {
  files: DashboardFile[];
}

export default function Dashboard({ files }: DashboardProps) {
  return (
    <div className="w-full h-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 flex flex-col overflow-y-auto">
      
      {/* 대시보드 헤더 */}
      <div className="border-b border-slate-100 pb-4 mb-6 flex justify-between items-end shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">나의 학습 리포트</h2>
          <p className="text-sm text-slate-500 mt-1">AI 튜터와의 대화 및 퀴즈 기록 기반 분석</p>
        </div>
        <span className="text-sm font-bold bg-blue-100 text-blue-700 py-1 px-3 rounded-full">
          총 {files.length}개의 교안
        </span>
      </div>
      
      <div className="space-y-8 flex-1">
        {/* 1. 최근 업로드 교안 리스트 */}
        <section>
          <h3 className="text-lg font-bold text-slate-700 mb-3 flex items-center">
            <span className="mr-2">📚</span> 최근 업로드 교안
          </h3>
          
          {files.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
              <span className="text-4xl block mb-3 opacity-50">📊</span>
              <p className="text-slate-500 font-medium">아직 분석된 자료가 없습니다.</p>
              <p className="text-sm text-slate-400 mt-1">왼쪽에서 교안을 업로드해 보세요!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {files.map((file) => (
                <div key={file.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-blue-300 transition-colors cursor-pointer group">
                  <h4 className="font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">{file.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">AI 질문: {file.aiQuestions}회 | 퀴즈 정답률: {file.score}%</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 2. AI 취약점 섹션 (파일이 있을 때만 렌더링) */}
        {files.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-lg font-bold text-slate-700 mb-3 flex items-center">
              <span className="mr-2">🎯</span> AI 진단 취약 부분
            </h3>
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <div>
                <div className="flex justify-between text-sm font-semibold mb-1">
                  <span className="text-slate-700">{files[0].name} 관련 핵심 개념</span>
                  <span className="text-red-500">분석 대기중</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-red-500 h-2.5 rounded-full" style={{ width: "10%" }}></div>
                </div>
                <p className="text-xs text-slate-500 mt-1">💡 교안 텍스트 추출 및 벡터화 진행중...</p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}