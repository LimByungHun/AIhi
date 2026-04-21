"use client";

import { useState } from "react";

interface GroupChatProps {
  onEnterGroup: (group: any) => void;
}

const INITIAL_GROUPS = [
  { id: 1, title: "AI 소프트웨어 프로젝트 1팀", members: 4, lastMsg: "오늘 회의 오후 3시 맞죠?"},
  { id: 2, title: "데이터베이스 스터디", members: 6, lastMsg: "정규화 파트 정리본 올렸습니다."},
  { id: 3, title: "캡스톤 디자인 - 튜터팀", members: 3, lastMsg: "API 명세서 확인 부탁드려요."},
];

export default function GroupChat({ onEnterGroup }: GroupChatProps) {
  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2>(1); // 1: 개설, 2: 링크 확인
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupTag, setNewGroupTag] = useState("스터디");
  const [inviteCode, setInviteCode] = useState("");

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    const newGroup = {
      id: Date.now(),
      title: newGroupName,
      members: 1,
      lastMsg: "방금 개설되었습니다! 🎉",
      tag: newGroupTag
    };
    setGroups([newGroup, ...groups]);
    setInviteCode(Math.random().toString(36).substring(2, 10).toUpperCase());
    setModalStep(2);
  };

  const openInviteLink = (id: number) => {
    setInviteCode(`RE-${id.toString().slice(-4)}`);
    setModalStep(2);
    setIsModalOpen(true);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://ai-tutor.app/invite/${inviteCode}`);
    alert("초대 링크가 복사되었습니다!");
    setIsModalOpen(false);
    setTimeout(() => { setModalStep(1); setNewGroupName(""); }, 300);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
      <header className="h-14 flex items-center px-6 border-b border-slate-200 bg-white shrink-0">
        <h1 className="font-bold text-lg text-slate-800">그룹 채팅</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div key={group.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col transition-all hover:shadow-md hover:-translate-y-1">
              <div className="flex justify-between items-start mb-4">                
                <span className="text-slate-400 text-sm font-medium">👥 {group.members}명</span>
              </div>
              <h3 className="font-extrabold text-xl text-slate-900 mb-2 truncate">{group.title}</h3>
              <div className="bg-slate-50 rounded-2xl p-4 mt-2 border border-slate-100 flex-1">
                <p className="text-sm text-slate-600 line-clamp-2">"{group.lastMsg}"</p>
              </div>
              <div className="mt-6 flex gap-2">
                <button onClick={() => openInviteLink(group.id)} className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors" title="초대 링크">🔗</button>
                <button onClick={() => onEnterGroup(group)} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">입장하기</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 새 그룹 만들기 FAB */}
      <div className="absolute bottom-8 right-8 z-30">
        <button onClick={() => { setModalStep(1); setIsModalOpen(true); }} className="w-14 h-14 rounded-full flex items-center justify-center bg-blue-600 text-white shadow-xl hover:scale-110 transition-all">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
        </button>
      </div>

      {/* 통합 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 shadow-2xl w-full max-w-sm border border-slate-200">
            {modalStep === 1 ? (
              <div className="flex flex-col gap-5">
                <h2 className="text-2xl font-black text-slate-900 text-center">새 스터디 그룹</h2>                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">그룹 이름</label>
                  <input type="text" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-4 py-3 outline-none" placeholder="그룹 이름 입력" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 bg-slate-100 font-bold rounded-2xl">취소</button>
                  <button onClick={handleCreateGroup} className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-2xl">만들기</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 text-center">
                <span className="text-3xl mb-4">🎉</span>
                <h2 className="text-2xl font-black text-slate-900">개설 완료!</h2>
                <div className="bg-slate-50 p-4 rounded-2xl border my-4 break-all">
                  <code className="text-blue-600 font-bold">https://ai-tutor.app/invite/{inviteCode}</code>
                </div>
                <button onClick={copyLink} className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-md">링크 복사하기</button>
                <button onClick={() => setIsModalOpen(false)} className="mt-2 text-slate-400 font-bold">닫기</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}