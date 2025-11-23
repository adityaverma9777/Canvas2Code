'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { signInWithGoogle } from '../lib/firebase';
import GravityBackground from '../components/GravityBackground';
import { 
  Code2, 
  PenTool, 
  Video, 
  Share2, 
  Cpu, 
  FolderGit2, 
  PlayCircle,
  ArrowRight
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [roomId, setRoomId] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const handleLogin = async () => {
    if (isJoining) return;
    setIsJoining(true);
    try {
      const data = await signInWithGoogle();
      if (data) {
        setUser(data.user);
        localStorage.setItem("gdrive_token", data.token || "");
      }
    } catch (error: any) {
      if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
        console.log("Login popup closed by user.");
      } else {
        console.error("Login failed:", error);
      }
    } finally {
      setIsJoining(false);
    }
  };

  const createRoom = () => {
    const newRoomId = Math.floor(100000 + Math.random() * 900000).toString();
    router.push(`/room/${newRoomId}`);
  };

  const joinRoom = () => {
    if (roomId.length === 6) router.push(`/room/${roomId}`);
    else alert("Invalid Room ID");
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 overflow-x-hidden">
      <GravityBackground />

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Cpu className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              Canvas2Code
            </span>
          </div>

          <div className="flex items-center gap-6">
            {!user ? (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogin}
                className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-slate-800 transition shadow-lg shadow-slate-900/20 flex items-center gap-2"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 bg-white rounded-full p-0.5" alt="G" />
                Sign In
              </motion.button>
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600 font-medium">Welcome, {user.displayName}</span>
                <img src={user.photoURL} alt="User" className="w-9 h-9 rounded-full border border-slate-200 shadow-sm" />
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="relative pt-40 pb-20 px-6 z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm font-semibold text-slate-600">V2.0 is now live</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-tight text-slate-900"
          >
            Experience <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 animate-gradient">
              Absolute Sync.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed font-medium"
          >
            The next-generation IDE that bridges design and logic. 
            Draw wireframes that auto-generate code, collaborate with voice & video, 
            and sync directly to Google Drive.
          </motion.p>

          {!user ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <button 
                onClick={handleLogin}
                className="group relative px-8 py-4 bg-blue-600 rounded-full font-bold text-lg text-white overflow-hidden transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative flex items-center gap-3">
                  Get Started Free <ArrowRight className="w-5 h-5" />
                </span>
              </button>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col md:flex-row items-center justify-center gap-4"
            >
              <button 
                onClick={createRoom}
                className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition shadow-xl flex items-center gap-2"
              >
                <PlayCircle className="w-5 h-5" /> Create Room
              </button>
              
              <div className="flex items-center bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
                <input 
                  type="text" 
                  placeholder="Enter Room ID"
                  maxLength={6}
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="bg-transparent px-4 py-3 outline-none text-slate-900 w-40 placeholder-slate-400 text-center font-mono tracking-widest font-bold"
                />
                <button 
                  onClick={joinRoom}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-6 py-3 rounded-lg font-bold transition"
                >
                  Join
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* --- UI SHOWCASE (Now with a subtle Slate Tint) --- */}
      <div className="max-w-7xl mx-auto px-6 pb-32 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Canvas2Code Engine */}
          <motion.div 
            whileHover={{ y: -10, rotateX: 2, rotateY: 2 }}
            // CHANGED: bg-slate-50 (Subtle tint)
            className="group relative bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-lg hover:shadow-2xl transition-all h-96"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-purple-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="p-8 h-full flex flex-col relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm border border-slate-100"><PenTool size={24} /></div>
                <h3 className="text-2xl font-bold text-slate-900">Infinite Canvas</h3>
              </div>
              <p className="text-slate-500 mb-6 font-medium">Draw layouts with a pen, and watch them convert to clean React code instantly.</p>
              
              {/* Mini UI Mockup */}
              <div className="flex-1 bg-white rounded-xl border border-slate-200 p-4 relative overflow-hidden shadow-inner">
                <div className="absolute top-4 left-4 w-12 h-12 border-2 border-blue-500 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xs bg-slate-50">Div</div>
                <div className="absolute top-4 left-20 w-32 h-2 bg-slate-200 rounded-full"></div>
                <div className="absolute top-8 left-20 w-20 h-2 bg-slate-200 rounded-full"></div>
                <div className="absolute bottom-4 right-4 bg-slate-50 px-3 py-1 rounded text-xs text-green-600 font-mono border border-green-200 shadow-sm">
                  &lt;Generated /&gt;
                </div>
                {/* Simulated Cursor */}
                <motion.div 
                  animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-10 left-10 w-4 h-4"
                >
                  <svg viewBox="0 0 24 24" fill="black" className="drop-shadow-lg"><path d="M5.5 3.21l10.8 15.6-5.6 1.4-2.8 5.6-2.8-5.6-5.6-1.4z"/></svg>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Cloud IDE */}
          <motion.div 
            whileHover={{ y: -10, rotateX: 2, rotateY: -2 }}
            // CHANGED: bg-slate-50
            className="group relative bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-lg hover:shadow-2xl transition-all h-96"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-100/50 to-cyan-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="p-8 h-full flex flex-col relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white rounded-lg text-green-600 shadow-sm border border-slate-100"><Code2 size={24} /></div>
                <h3 className="text-2xl font-bold text-slate-900">Collaborative IDE</h3>
              </div>
              <p className="text-slate-500 mb-6 font-medium">Real-time code synchronization with integrated terminal and multi-language support.</p>
              
              {/* Mini IDE Mockup */}
              <div className="flex-1 bg-[#1e1e1e] rounded-xl border border-slate-200 p-4 font-mono text-xs overflow-hidden shadow-xl">
                <div className="flex gap-1.5 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                </div>
                <div className="text-purple-400">import <span className="text-yellow-200">{'{ useState }'}</span> from <span className="text-green-300">'react'</span>;</div>
                <div className="text-blue-400 mt-2">function <span className="text-yellow-200">App</span>() {'{'}</div>
                <div className="pl-4 text-gray-300">
                  const [<span className="text-blue-300">count</span>] = useState(<span className="text-orange-400">0</span>);
                </div>
                <div className="text-blue-400">{'}'}</div> 
                
                <motion.div 
                   animate={{ opacity: [1, 0, 1] }}
                   transition={{ duration: 1, repeat: Infinity }}
                   className="w-1.5 h-4 bg-white mt-1 inline-block"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Feature Strip (Also updated to be more visible) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { icon: Video, title: "Video Calls", desc: "Built-in WebRTC" },
            { icon: Share2, title: "Real-time", desc: "< 30ms latency" },
            { icon: FolderGit2, title: "Google Drive", desc: "Auto-sync saves" },
            { icon: Cpu, title: "AI Powered", desc: "Sketch to Code" },
          ].map((item, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.05 }}
              className="bg-slate-50 border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col items-center text-center gap-2 hover:shadow-md transition cursor-default hover:bg-white"
            >
              <item.icon className="text-slate-600 mb-2" />
              <h4 className="font-bold text-slate-900">{item.title}</h4>
              <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}