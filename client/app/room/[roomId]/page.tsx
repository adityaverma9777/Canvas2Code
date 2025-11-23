'use client'
import { useState, useEffect, use } from 'react'; 
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { auth } from '../../../lib/firebase';


const Board = dynamic(() => import('../../../components/Board'), { ssr: false });
const CodeEditor = dynamic(() => import('../../../components/CodeEditor'), { ssr: false });
const VideoCall = dynamic(() => import('../../../components/VideoCall'), { ssr: false });

export default function Room({ params }: { params: Promise<{ roomId: string }> }) {
  
  const { roomId } = use(params); 
  
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'canvas' | 'code'>('canvas');
  const [projectName, setProjectName] = useState("Untitled Project");
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [codeContent, setCodeContent] = useState("// Start coding...");
  const [codeLanguage, setCodeLanguage] = useState("python");
  const [canvasData, setCanvasData] = useState<any>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
     const unsubscribe = auth.onAuthStateChanged((u) => {
         if (u) setUser(u);
         else router.push('/');
     });
     return () => unsubscribe();
  }, []);

  
  const generateSvgFromData = (lines: any[]) => {
    return `
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg" style="background-color: white;">
        ${lines.map(line => `
        <path 
          d="M ${line.points.map((p:any, i:number) => i % 2 === 0 ? p : p + ' ').join(',')}" 
          stroke="${line.stroke}" 
          stroke-width="${line.strokeWidth}"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />`).join('\n')}
      </svg>
    `;
  };

  
  const saveToDrive = async () => {
    const token = localStorage.getItem("gdrive_token");
    if (!token) return alert("Please login again.");

    let content, mimeType, fileName;

    if (activeTab === 'code') {
        content = codeContent;
        mimeType = 'text/plain';
        fileName = `${projectName}${getExtension(codeLanguage)}`;
    } else {
        
        content = generateSvgFromData(canvasData);
        mimeType = 'image/svg+xml';
        fileName = `${projectName}.svg`;
    }

    const metadata = { name: fileName, mimeType: mimeType };
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([content], { type: mimeType }));

    try {
      const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if(res.ok) alert(`Saved ${fileName} to Drive!`);
      else alert("Save failed.");
    } catch (err) { console.error(err); }
  };

  const getExtension = (lang: string) => {
      const map: Record<string, string> = {
          javascript: '.js', python: '.py', typescript: '.ts', java: '.java', html: '.html', css: '.css', csharp: '.cs', php: '.php'
      };
      return map[lang] || '.txt';
  }

  const copyRoomId = () => {
      navigator.clipboard.writeText(roomId); 
      alert("Room ID Copied!");
  }

  return (
    <main className="h-screen w-screen overflow-hidden flex flex-col bg-[#f0f2f5] font-sans relative">
      {isWebcamActive && user && <VideoCall roomId={roomId} userName={user.displayName || "User"} />}

      {/* HEADER */}
      <header className="absolute top-4 left-4 right-4 h-16 bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg z-50 flex items-center justify-between px-6">
         <div className="flex items-center gap-4">
             <div 
                onClick={copyRoomId}
                className="bg-gray-100 hover:bg-gray-200 cursor-pointer px-3 py-1 rounded-lg border border-gray-200 flex items-center gap-2 transition"
                title="Click to Copy"
             >
                 <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">ID: {roomId}</span>
                 <span className="text-gray-400 text-xs">📋</span>
             </div>
             <input 
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="bg-transparent font-bold text-gray-800 text-lg focus:outline-none focus:bg-white/50 rounded px-2 transition w-48"
             />
         </div>

         <div className="flex bg-gray-100/80 p-1 rounded-xl border border-gray-200">
            <button onClick={() => setActiveTab('canvas')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${activeTab === 'canvas' ? 'bg-white text-black shadow' : 'text-gray-500 hover:text-gray-700'}`}>Canvas</button>
            <button onClick={() => setActiveTab('code')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${activeTab === 'code' ? 'bg-white text-blue-600 shadow' : 'text-gray-500 hover:text-gray-700'}`}>Code IDE</button>
         </div>

         <div className="flex items-center gap-3">
            <button onClick={() => setIsWebcamActive(!isWebcamActive)} className={`p-2 rounded-full transition ${isWebcamActive ? 'bg-green-500 text-white shadow-lg' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>📹</button>
            <button onClick={saveToDrive} className="bg-black hover:bg-gray-800 text-white px-5 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg transition">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4 bg-white rounded-full p-0.5" />
                Save
            </button>
            <div className="h-8 w-px bg-gray-300 mx-1"></div>
            <button onClick={() => { auth.signOut(); router.push('/'); }} className="text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg font-bold text-sm transition">Exit</button>
         </div>
      </header>

      <div className="flex-1 relative pt-0"> 
        <div className={`absolute inset-0 ${activeTab === 'canvas' ? 'z-10 visible' : 'z-0 invisible'}`}>
          {/* FIX 3: Pass User Object to Board for Chat */}
          <Board onCanvasChange={(data) => setCanvasData(data)} user={user} />
        </div>
        
        <div className={`absolute inset-0 pt-24 pb-4 px-4 ${activeTab === 'code' ? 'z-10 visible' : 'z-0 invisible'}`}>
          <div className="h-full w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
              <CodeEditor onCodeChange={(code, lang) => { setCodeContent(code); setCodeLanguage(lang); }} />
          </div>
        </div>
      </div>
    </main>
  );
}