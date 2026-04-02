"use client";

import { useState, useRef } from "react";

// 부모에게 전달할 함수 규격 정의
interface UploadBoxProps {
  onUploadSuccess: (newFiles: any[]) => void;
}

export default function UploadBox({ onUploadSuccess }: UploadBoxProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false); 
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_TYPES = [
    "application/pdf", 
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "image/png", 
    "image/jpeg"
  ];
  const MAX_SIZE_MB = 50;

  const validateAndAddFiles = (selectedFiles: FileList | File[]) => {
    setErrorMsg("");
    const validFiles: File[] = [];

    Array.from(selectedFiles).forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setErrorMsg(`지원하지 않는 파일: ${file.name}`);
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setErrorMsg(`용량 초과: ${file.name}`);
        return;
      }
      if (!files.some(existingFile => existingFile.name === file.name)) {
        validFiles.push(file);
      }
    });
    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (fileNameToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    setFiles(files.filter(file => file.name !== fileNameToRemove));
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setIsLoading(true);
    setErrorMsg("");

    try {
      // 가짜 서버 통신 대기 (2초)
      await new Promise((resolve) => setTimeout(resolve, 2000)); 

      // 업로드 성공 후 대시보드에 넘겨줄 가짜 데이터
      const uploadedData = files.map(file => ({
        id: Math.random().toString(), // 임시 고유 ID
        name: file.name,
        time: '방금 전',
        aiQuestions: 0,
        score: 0
      }));

      // 부모 컴포넌트로 데이터 전송
      onUploadSuccess(uploadedData);
      
      alert(`${files.length}개의 파일이 대시보드에 등록되었습니다!`);
      setFiles([]); 
    } catch (error) {
      setErrorMsg("파일 전송 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full rounded-3xl border border-slate-200 bg-white p-10 shadow-xl relative overflow-hidden flex flex-col">
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/85 backdrop-blur-sm">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 mb-5"></div>
          <p className="text-xl font-bold text-slate-800">AI가 교안을 분석하고 있습니다...</p>
        </div>
      )}

      <div className="mb-6 text-center">
        <h2 className="text-2xl font-extrabold text-slate-900">학습 자료 등록</h2>
        <p className="mt-2 text-sm text-slate-500">PDF, PPT 파일을 드래그하여 업로드하세요.</p>
      </div>

      <div 
        className={`flex-1 group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-all cursor-pointer ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50 hover:border-blue-400"
        }`}
        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
      >
        <input 
          type="file" ref={fileInputRef} className="hidden" multiple accept=".pdf,.pptx,.png,.jpg"
          onChange={(e) => e.target.files && validateAndAddFiles(e.target.files)} disabled={isLoading}
        />
        
        {files.length > 0 ? (
          <div className="w-full space-y-2 pointer-events-auto max-h-[200px] overflow-y-auto pr-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
                <span className="text-sm font-semibold text-slate-700 truncate">{file.name}</span>
                <button onClick={(e) => removeFile(file.name, e)} className="text-slate-400 hover:text-red-500 font-bold">✕</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center pointer-events-none">
            <span className="text-4xl block mb-2">📄</span>
            <p className="text-slate-700 font-bold">클릭하거나 파일 드래그</p>
          </div>
        )}
      </div>

      {errorMsg && <div className="mt-4 p-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg text-center">{errorMsg}</div>}

      <button 
        onClick={handleUpload}
        className={`mt-6 w-full rounded-xl py-4 text-lg font-bold text-white transition-all ${
          files.length > 0 && !isLoading ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-300 cursor-not-allowed"
        }`}
        disabled={files.length === 0 || isLoading}
      >
        {isLoading ? "분석 중..." : `분석 시작하기`}
      </button>
    </div>
  );
}