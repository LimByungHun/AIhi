const MOCK_NOTES = [
  {
    id: 1,
    title: "데이터베이스 정규화", 
    preview: "데이터베이스 정규화는 데이터베이스 설계에서 중복을 최소화하고 데이터 무결성을 유지하기 위한 과정입니다. 정규화는 여러 단계로 나뉘며, 각 단계에서는 특정한 규칙을 적용하여 테이블을 분리하고 관계를 정의합니다. 이를 통해 데이터의 일관성과 효율성을 높일 수 있습니다.",
    tags: ["데이터베이스", "정규화", "설계"],   
  },
];

export default function Notes() {
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50">
      <header className="h-14 flex items-center px-6 border-b border-slate-200 shrink-0 bg-white">
        <h1 className="font-bold text-lg text-slate-800">요약 노트</h1>
      </header>
      
      <div className="flex-1 overflow-y-auto p-6 md:p-8">        

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {MOCK_NOTES.map((note) => (
            <div key={note.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col transition-all hover:shadow-md hover:-translate-y-1">
              <div className="mb-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 text-[11px] font-extrabold rounded-md mb-3">
                  <span className="text-xs">✨</span> AI 핵심 요약
                </span>
                <h3 className="font-extrabold text-lg text-slate-900 truncate">{note.title}</h3>                
              </div>

              <div className="flex-1 mb-5">                
                <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                  {note.preview}
                </p>
              </div>

              <div className="mt-auto">
                {/* 태그 리스트 */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {note.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded-md font-medium">
                      {tag}
                    </span>
                  ))}
                </div>

                <button className="w-full py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors">
                  요약노트 펴기
                </button>              
            </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}