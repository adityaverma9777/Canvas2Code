Canvas2Code

<div align="center">
<h3>Experience Absolute Sync.</h3>
<p>The next-generation collaborative workspace that bridges design and logic.</p>
<p><strong>Created by Aditya Verma</strong></p>
</div>

🚀 Overview
Canvas2Code is a high-performance, real-time collaborative platform designed for modern engineering teams. It seamlessly integrates an Infinite Whiteboard that auto-generates React code with a Cloud-based IDE, allowing designers and developers to work in the same environment simultaneously.
It features particle physics backgrounds, glassmorphism UI, and ultra-smooth animations.

✨ Key Features:

🎨 Infinite Canvas Engine
Draw-to-Code: Sketch wireframes using the Pen tool, and the engine auto-generates clean SVG/React code.
Infinite Workspace: Pan and zoom infinitely without losing resolution.
Real-time Sync: See teammates' cursors and drawings update instantly (< 30ms latency).

💻 Collaborative Cloud IDE
VS Code Experience: Powered by Monaco Editor with syntax highlighting for Python, JS, TS, Java, C#, and PHP.
Integrated Terminal: Real-time command execution using a custom shell parser and Piston API.
Live Coding: Type together with teammates with conflict-free synchronization.

📹 Native Video & Voice
Built-in WebRTC: Crystal clear video and audio calls floating directly over the workspace.
Drag & Drop UI: Move the video window anywhere on the screen.
Smart Fallback: Automatically detects available media devices or switches to audio-only.

☁️ Cloud Persistence
Google Drive Sync: Your projects, folders, and files are saved directly to your Google Drive.
File Explorer: Create files and folders in the UI that mirror your Drive structure.

🛠️ Tech Stack
Frontend (Client):
Framework: Next.js 16 (App Router)
Language: TypeScript
Styling: Tailwind CSS, Framer Motion
Canvas: Konva.js / React-Konva
Editor: Monaco Editor
Video: PeerJS (WebRTC)
Backend (Server):
Runtime: Node.js
Framework: Express
Real-time: Socket.io
Compiler: Piston API (Dockerized Execution)
Infrastructure:
Auth: Firebase Authentication (Google)
Storage: Google Drive API v3
Deployment: Vercel (Client) + Render (Server)

⚡ Getting Started
Prerequisites
Node.js (v18+)
A Firebase Project (with Google Auth enabled)
A Google Cloud Project (with Drive API enabled)

1. Environment Setup
Create a .env.local file in the client/ folder:

NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_PISTON_API=[https://emkc.org/api/v2/piston/execute](https://emkc.org/api/v2/piston/execute)


2. Installation
This project is set up as a Monorepo. You can install dependencies for both Client and Server with one command:
npm run setup

3. Run Development Server
Start both the Backend and Frontend simultaneously:
npm run dev
Frontend: http://localhost:3000
Backend: http://localhost:3001

🤝 Contributing
Fork the repository.
Create a new branch (git checkout -b feature/amazing-feature).
Comit your changes (git commit -m 'Add some amazing feature').
Push to the branch (git push origin feature/amazing-feature).
Open a Pull Request.

📄 License
Distributed under the MIT License.
<div align="center">
<p>Built with ❤️ by <strong>Aditya Verma</strong> </p>
</div>
