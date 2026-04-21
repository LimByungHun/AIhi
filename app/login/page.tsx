"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  //const API_BASE_URL = "https://localhost:8000";
  const API_BASE_URL = "https://furry-cacciatore-daleyza.ngrok-free.dev";


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      if (isLoginMode) {        
        // 1. 로그인 API 호출
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "69420" },
          body: JSON.stringify({ email, password }),
        });        

        if (!response.ok) {
          if (response.status === 401) throw new Error("이메일이나 비밀번호가 틀렸습니다.");
          throw new Error("로그인 처리 중 오류가 발생했습니다.");
        }

        const data = await response.json();
        
        // 받은 access_token을 브라우저(LocalStorage)에 저장
        localStorage.setItem("access_token", data.access_token);        
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("user_email", data.email);        

        alert("로그인 성공! 대시보드로 이동합니다.");
        router.push("/");

      } else {
        // 2. 회원가입 API 호출
        const response = await fetch(`${API_BASE_URL}/users/`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "69420" },
          
          body: JSON.stringify({ name,email, password }),
        });

        if (!response.ok) {
          if (response.status === 400) throw new Error("이미 등록된 이메일입니다.");
          throw new Error("회원가입 처리 중 오류가 발생했습니다.");          
        }

        const data = await response.json();
        if (data.user_id) {
          localStorage.setItem("user_id", String(data.user_id));
        }

        alert("회원가입이 완료되었습니다! 이제 로그인해주세요.");
        setIsLoginMode(true);
        setPassword(""); 
      }

    } catch (error: any) {
      console.error("API Error:", error);
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="flex justify-center items-center gap-2 font-extrabold text-3xl text-blue-600 tracking-tight mb-2">
          <span className="text-4xl"></span>
            AI 튜터
        </Link>
        <h2 className="mt-4 text-center text-2xl font-bold text-slate-900">
          {isLoginMode ? "AI 튜터와 학습을 시작하세요" : "새로운 계정 만들기"}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-200">
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* 회원가입일때 이름 */}
            {!isLoginMode && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700">이름</label>
                <div className="mt-1">
                  <input 
                    id="name" type="text" required={!isLoginMode}
                    value={name} onChange={(e) => setName(e.target.value)}
                    className="appearance-none block w-full px-3 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                    placeholder="홍길동" 
                  />
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">이메일 주소</label>
              <div className="mt-1">
                <input 
                  id="email" type="email" required 
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                  placeholder="example@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">비밀번호</label>
              <div className="mt-1">
                <input 
                  id="password" type="password" required 
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"                  
                  placeholder="8자 이상 입력해주세요"
                />
              </div>
            </div>

            {/* 에러 메시지 표시 */}
            {errorMsg && (
              <div className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 text-center">
                🚨 {errorMsg}
              </div>
            )}

            <div>
              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white transition-colors ${
                  isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                }`}
              >
                {isLoading ? "처리 중..." : (isLoginMode ? "로그인" : "가입하기")}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-slate-500">
              {isLoginMode ? "아직 계정이 없으신가요?" : "이미 계정이 있으신가요?"}
            </span>
            <button 
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setErrorMsg("");
              }}
              className="ml-2 font-bold text-blue-600 hover:text-blue-500"
            >
              {isLoginMode ? "회원가입하기" : "로그인하기"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}