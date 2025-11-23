"use client";

import { useEffect, useState, useRef } from "react";
import { Stage, Layer, Line } from "react-konva";
import io from "socket.io-client";
import { v4 as uuidv4 } from 'uuid';

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001"); 

interface BoardProps {
    onCanvasChange?: (data: any) => void;
    user?: any; 
}

export default function Board({ onCanvasChange, user }: BoardProps) {
  const [lines, setLines] = useState<any[]>([]);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState<'pen' | 'eraser' | 'hand'>('pen');
  
  // Chat States
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const [generatedCode, setGeneratedCode] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isDrawing = useRef(false);
  const stageRef = useRef<any>(null);

  useEffect(() => {
    socket.on("canvas-data", (data: any) => {
      setLines((prev) => {
        const newLines = [...prev, data];
        if(onCanvasChange) onCanvasChange(newLines);
        return newLines;
      });
    });

    socket.on("clear", () => { setLines([]); if(onCanvasChange) onCanvasChange([]); });
    
    socket.on("receive-message", (msg: any) => { setMessages((prev) => [...prev, msg]); });

    return () => {
      socket.off("canvas-data");
      socket.off("clear");
      socket.off("receive-message");
    };
  }, [onCanvasChange]);

  const handleWheel = (e: any) => { /* ... (Keep existing zoom logic) ... */ 
    e.evt.preventDefault();
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    const mousePointTo = { x: (pointer.x - stage.x()) / oldScale, y: (pointer.y - stage.y()) / oldScale };
    const newScale = e.evt.deltaY > 0 ? oldScale * 0.9 : oldScale * 1.1;
    setScale(newScale);
    setPosition({ x: pointer.x - mousePointTo.x * newScale, y: pointer.y - mousePointTo.y * newScale });
  };

  const handleMouseDown = (e: any) => { /* ... (Keep existing logic) ... */ 
    if (tool === 'hand') return; 
    isDrawing.current = true;
    const stage = e.target.getStage();
    const point = stage.getRelativePointerPosition();
    const newLine = { id: uuidv4(), tool: tool, points: [point.x, point.y], stroke: tool === 'eraser' ? '#ffffff' : '#df4b26', strokeWidth: tool === 'eraser' ? 20 : 5 };
    const newLines = [...lines, newLine];
    setLines(newLines);
    if(onCanvasChange) onCanvasChange(newLines);
  };

  const handleMouseMove = (e: any) => { /* ... (Keep existing logic) ... */ 
    if (!isDrawing.current || tool === 'hand') return;
    const stage = e.target.getStage();
    const point = stage.getRelativePointerPosition();
    let lastLine = lines[lines.length - 1];
    if (!lastLine) return;
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    lines.splice(lines.length - 1, 1, lastLine);
    const updatedLines = lines.concat();
    setLines(updatedLines);
    if(onCanvasChange) onCanvasChange(updatedLines);
    socket.emit("canvas-data", lastLine);
  };

  const handleMouseUp = () => { isDrawing.current = false; };

  // --- UPDATED CHAT LOGIC ---
  const sendChat = () => {
    if (!chatInput.trim()) return;
    // FIX: Use Real Name and Email
    const msg = { 
        text: chatInput, 
        sender: user?.displayName || "Guest", 
        email: user?.email || "No Email",
        time: new Date().toLocaleTimeString() 
    };
    socket.emit("send-message", msg);
    setMessages([...messages, msg]);
    setChatInput("");
  };

  const generateCode = () => { /* ... (Keep existing logic) ... */ 
     const code = `<svg width="100%" height="100%">${lines.map(line => `<path d="M ${line.points.join(',')}" stroke="${line.stroke}" />`)}</svg>`;
     setGeneratedCode(code); setIsModalOpen(true);
  };

  return (
    <div className="w-full h-full bg-gray-50 overflow-hidden relative font-sans">
      
      {/* TOOLBAR */}
      <div className="absolute top-24 left-4 flex flex-col gap-3 z-30">
         <div className="bg-white/80 backdrop-blur-xl shadow-xl border border-white/20 rounded-2xl p-2 flex flex-col gap-2">
            <button onClick={() => setTool('pen')} className={`p-3 rounded-xl transition text-xl ${tool === 'pen' ? 'bg-blue-500 text-white shadow-lg' : 'hover:bg-gray-200 text-gray-600'}`}>🖊️</button>
            <button onClick={() => setTool('eraser')} className={`p-3 rounded-xl transition text-xl ${tool === 'eraser' ? 'bg-blue-500 text-white shadow-lg' : 'hover:bg-gray-200 text-gray-600'}`}>🧼</button>
            <button onClick={() => setTool('hand')} className={`p-3 rounded-xl transition text-xl ${tool === 'hand' ? 'bg-blue-500 text-white shadow-lg' : 'hover:bg-gray-200 text-gray-600'}`}>✋</button>
         </div>
         <div className="bg-white/80 backdrop-blur-xl shadow-xl border border-white/20 rounded-2xl p-2 flex flex-col gap-2">
             <button onClick={generateCode} className="p-3 hover:bg-blue-50 text-blue-600 rounded-xl transition font-bold text-lg">&lt;/&gt;</button>
             <button onClick={() => socket.emit('clear')} className="p-3 hover:bg-red-100 text-red-500 rounded-xl transition text-xl">🗑️</button>
         </div>
      </div>

      {/* --- IMPROVED CHAT WIDGET --- */}
      <div className={`absolute bottom-4 right-4 bg-white shadow-2xl rounded-2xl z-20 border border-gray-200 overflow-hidden transition-all duration-300 ${isChatOpen ? 'w-80 h-96' : 'w-16 h-16 rounded-full'}`}>
        {isChatOpen ? (
            <div className="flex flex-col h-full">
                <div className="bg-blue-600 p-4 text-white flex justify-between items-center shadow-md">
                    <span className="font-bold">Team Chat</span>
                    <button onClick={() => setIsChatOpen(false)} className="hover:text-red-200 font-bold">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
                    {messages.map((m, i) => (
                        <div key={i} className="text-sm flex flex-col items-start">
                            {/* FIX: Name & Email Tooltip */}
                            <span 
                                title={m.email} 
                                className="font-bold text-gray-500 text-xs mb-1 cursor-help hover:text-blue-600 transition"
                            >
                                {m.sender}
                            </span>
                            {/* FIX: Text Color Black */}
                            <span className="bg-white px-3 py-2 rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-sm border border-gray-100 text-gray-800">
                                {m.text}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="p-3 border-t bg-white flex gap-2">
                    <input 
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 text-gray-800"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendChat()}
                        placeholder="Type a message..."
                    />
                    <button onClick={sendChat} className="bg-blue-600 text-white px-4 rounded-lg text-sm font-bold hover:bg-blue-700 transition">Send</button>
                </div>
            </div>
        ) : (
            // FIX: Bigger Chat Button
            <button 
                onClick={() => setIsChatOpen(true)} 
                className="w-full h-full flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30 rounded-full transition-transform transform hover:scale-110"
            >
                <span className="text-2xl">💬</span>
            </button>
        )}
      </div>

      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-bold text-gray-600 border border-gray-200 shadow-lg select-none">
        {Math.round(scale * 100)}%
      </div>

      {/* MODAL (Keep same) */}
      {isModalOpen && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl w-2/3 h-2/3 flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-xl text-gray-800">Generated SVG</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 text-2xl">&times;</button>
            </div>
            <textarea readOnly value={generatedCode} className="flex-1 bg-gray-900 text-green-400 font-mono p-4 rounded-xl resize-none shadow-inner text-sm" />
            <div className="mt-4 flex justify-end">
                <button onClick={() => { navigator.clipboard.writeText(generatedCode); alert("Copied!"); }} className="bg-gray-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-700">Copy Code</button>
            </div>
          </div>
        </div>
      )}

      <Stage
        width={typeof window !== 'undefined' ? window.innerWidth : 1000}
        height={typeof window !== 'undefined' ? window.innerHeight : 1000}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        onWheel={handleWheel}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        draggable={tool === 'hand'}
        onDragEnd={(e) => setPosition({ x: e.target.x(), y: e.target.y() })}
        ref={stageRef}
        className={tool === 'hand' ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'}
      >
        <Layer>
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.stroke}
              strokeWidth={line.strokeWidth}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}