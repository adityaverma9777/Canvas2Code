"use client";
import { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import Draggable from 'react-draggable';
import io from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001");

export default function VideoCall({ roomId, userName }: { roomId: string, userName: string }) {
    const [peers, setPeers] = useState<any[]>([]); 
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null); // New Error State
    
    
    const myVideoRef = useRef<HTMLVideoElement>(null);
    const peerInstance = useRef<Peer | null>(null);
    const draggableRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (peerInstance.current) return; 

        const peer = new Peer(undefined as any);
        peerInstance.current = peer;

        peer.on('open', async (id) => {
            try {
                
                let stream: MediaStream;
                try {
                    
                    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                } catch (err) {
                    console.warn("Failed to get Camera + Mic, trying Video only...");
                    try {
                        
                        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                    } catch (err2) {
                        console.warn("Failed to get Video, trying Audio only...");
                        
                        stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
                    }
                }

                if (!stream!) {
                    throw new Error("No devices found");
                }

                
                if (myVideoRef.current) myVideoRef.current.srcObject = stream;
                setErrorMsg(null);

                socket.emit('join-room', roomId, id);

                peer.on('call', (call) => {
                    call.answer(stream);
                    call.on('stream', (remoteStream) => {
                        addPeerStream(call.peer, remoteStream);
                    });
                });

                socket.on('user-connected', (userId) => {
                    connectToNewUser(userId, stream, peer);
                });

            } catch (err) {
                console.error("Critical Media Error:", err);
                setErrorMsg("No Camera/Mic found. Check permissions.");
            }
        });

        return () => { socket.off('user-connected'); };
    }, [roomId]);

    
    const addPeerStream = (peerId: string, stream: MediaStream) => {
        setPeers(prev => {
            if (prev.some(p => p.id === peerId)) return prev;
            return [...prev, { id: peerId, stream }];
        });
    };

    const connectToNewUser = (userId: string, stream: MediaStream, peer: Peer) => {
        const call = peer.call(userId, stream);
        call.on('stream', (remoteStream) => addPeerStream(userId, remoteStream));
    };

    const toggleAudio = () => {
        const stream = myVideoRef.current?.srcObject as MediaStream;
        if(stream && stream.getAudioTracks().length > 0) {
            stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled;
            setIsMuted(!stream.getAudioTracks()[0].enabled);
        }
    };

    const toggleVideo = () => {
        const stream = myVideoRef.current?.srcObject as MediaStream;
        if(stream && stream.getVideoTracks().length > 0) {
            stream.getVideoTracks()[0].enabled = !stream.getVideoTracks()[0].enabled;
            setIsVideoOff(!stream.getVideoTracks()[0].enabled);
        }
    };

    return (
        <Draggable bounds="parent" handle=".drag-handle" nodeRef={draggableRef}>
            <div ref={draggableRef} className="absolute bottom-10 right-10 z-50 bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col w-72">
                
                {/* Header */}
                <div className="drag-handle bg-gradient-to-r from-gray-800 to-gray-900 p-3 flex justify-between items-center cursor-move border-b border-gray-700">
                    <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${errorMsg ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></div>
                        <span className="text-xs text-gray-200 font-bold">Team Call</span>
                    </div>
                </div>

                {/* Content */}
                <div className={`grid gap-0.5 bg-black ${peers.length > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    
                    {/* My Video */}
                    <div className="relative aspect-video bg-gray-800 group flex items-center justify-center">
                        {errorMsg ? (
                            <div className="text-red-400 text-xs text-center px-4 font-bold">
                                ⚠️ {errorMsg}
                            </div>
                        ) : (
                            <>
                                <video ref={myVideoRef} muted autoPlay playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                                <div className="absolute bottom-1 left-2 text-[10px] font-bold text-white bg-black/50 px-1.5 rounded">You</div>
                                
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={toggleAudio} className={`p-2 rounded-full ${isMuted ? 'bg-red-500 text-white' : 'bg-white text-black'}`}>
                                        {isMuted ? '🔇' : '🎙️'}
                                    </button>
                                    <button onClick={toggleVideo} className={`p-2 rounded-full ${isVideoOff ? 'bg-red-500 text-white' : 'bg-white text-black'}`}>
                                        {isVideoOff ? '🚫' : '📷'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Peers */}
                    {peers.map((peer) => (
                         <VideoPlayer key={peer.id} stream={peer.stream} />
                    ))}
                </div>
            </div>
        </Draggable>
    );
}

const VideoPlayer = ({ stream }: { stream: MediaStream }) => {
    const ref = useRef<HTMLVideoElement>(null);
    useEffect(() => { if (ref.current) ref.current.srcObject = stream; }, [stream]);
    return (
        <div className="relative aspect-video bg-gray-800">
            <video ref={ref} autoPlay playsInline className="w-full h-full object-cover" />
        </div>
    );
};