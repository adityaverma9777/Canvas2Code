"use client";

import { useEffect, useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import io from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001");

const LANGUAGE_VERSIONS: Record<string, string> = {
  javascript: "18.15.0",
  python: "3.10.0",
  typescript: "5.0.3",
  java: "15.0.2",
  csharp: "6.12.0",
  php: "8.2.3",
  html: "5"
};

interface CodeEditorProps {
  initialCode?: string;
 
  onCodeChange?: (code: string, language: string) => void; 
}

export default function CodeEditor({ initialCode, onCodeChange }: CodeEditorProps) {
  const [code, setCode] = useState("// Select a language...");
  const [language, setLanguage] = useState("python");
  const [output, setOutput] = useState<string[]>(["// Output will appear here..."]);
  const [isRunning, setIsRunning] = useState(false);
  const isTyping = useRef(false);

  
  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      if(onCodeChange) onCodeChange(initialCode, language);
      socket.emit("code-change", { code: initialCode, language });
    }
  }, [initialCode]);

  
  useEffect(() => {
    socket.on("code-update", (data: any) => {
      if (!isTyping.current) {
        setCode(data.code);
        if(onCodeChange) onCodeChange(data.code, language);
      }
    });
    return () => { socket.off("code-update"); };
  }, [onCodeChange, language]);

  const handleEditorChange = (value: string | undefined) => {
    isTyping.current = true;
    const newCode = value || "";
    setCode(newCode);
    
    
    if(onCodeChange) onCodeChange(newCode, language);

    
    socket.emit("code-change", { code: newCode, language });

    setTimeout(() => { isTyping.current = false; }, 1000);
  };

  const handleLanguageChange = (e: any) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    
    if(onCodeChange) onCodeChange(code, newLang);
  }

  const runCode = async () => {
    setIsRunning(true);
    setOutput(["Running..."]);
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_PISTON_API || "https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: language,
          version: LANGUAGE_VERSIONS[language],
          files: [{ content: code }],
        }),
      });
      const data = await response.json();
      if (data.run) {
        const result = (data.run.stdout || data.run.stderr || "No Output").split("\n");
        setOutput(result);
      } else {
        setOutput(["Error: Execution failed."]);
      }
    } catch (error) {
      setOutput(["Error: Compiler API unavailable."]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-white font-sans">
      {/* Internal Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#3e3e42]">
        <div className="flex items-center gap-4">
           <select 
                value={language} 
                onChange={handleLanguageChange}
                className="bg-[#3c3c3c] text-gray-200 text-xs rounded px-2 py-1 border border-transparent focus:border-blue-500"
            >
                {Object.keys(LANGUAGE_VERSIONS).map((lang) => (
                    <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                ))}
            </select>
        </div>
        <button 
            onClick={runCode}
            disabled={isRunning}
            className={`px-4 py-1 rounded text-xs font-bold uppercase tracking-wider transition-all
            ${isRunning ? "bg-gray-600" : "bg-green-600 hover:bg-green-500"}`}
        >
            {isRunning ? "..." : "Run ▶"}
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 lg:w-3/4 border-r border-[#3e3e42] relative">
            <Editor
                height="100%"
                language={language}
                value={code}
                theme="vs-dark"
                onChange={handleEditorChange}
                options={{ fontSize: 14, minimap: { enabled: false }, automaticLayout: true }}
            />
        </div>
        <div className="h-1/3 lg:h-full lg:w-1/4 bg-[#1e1e1e] flex flex-col">
            <div className="px-4 py-2 bg-[#252526] text-[10px] font-bold text-gray-500 uppercase flex justify-between">
                <span>Terminal</span>
                <button onClick={() => setOutput([])} className="hover:text-white">Clear</button>
            </div>
            <div className="flex-1 p-4 font-mono text-sm overflow-auto text-green-400">
                {output.map((line, i) => <div key={i}>{line}</div>)}
            </div>
        </div>
      </div>
    </div>
  );
}