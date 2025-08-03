import React, { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Terminal } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import 'xterm/css/xterm.css';

function App() {
    const socketRef = useRef(null);
    const terminalRef = useRef(null);
    const xtermRef = useRef(null);
    const fitAddonRef = useRef(null);

    useEffect(() => {
        // Add custom styles to hide scrollbar
        const style = document.createElement('style');
        style.textContent = `
            .xterm .xterm-viewport::-webkit-scrollbar {
                display: none;
            }
            .xterm .xterm-viewport {
                scrollbar-width: none;
                -ms-overflow-style: none;
            }
        `;
        document.head.appendChild(style);

        const terminal = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: 'Monaco, Menlo, Ubuntu Mono, Consolas, monospace',
            theme: {
                background: '#1a1b26',
                foreground: '#c0caf5',
                cursor: '#f7768e',
                cursorAccent: '#1a1b26',
                selection: '#283457',
                selectionForeground: '#c0caf5',
                black: '#15161e',
                red: '#f7768e',
                green: '#9ece6a',
                yellow: '#e0af68',
                blue: '#7aa2f7',
                magenta: '#bb9af7',
                cyan: '#7dcfff',
                white: '#a9b1d6',
                brightBlack: '#414868',
                brightRed: '#ff7a93',
                brightGreen: '#b9f27c',
                brightYellow: '#ff9e64',
                brightBlue: '#7da6ff',
                brightMagenta: '#c0a5f9',
                brightCyan: '#b4f9f8',
                brightWhite: '#c0caf5',
            },
            cols: 80,
            rows: 35,
        });

        const fitAddon = new FitAddon();
        const webLinksAddon = new WebLinksAddon();

        terminal.loadAddon(fitAddon);
        terminal.loadAddon(webLinksAddon);

        terminal.open(terminalRef.current);
        fitAddon.fit();

        xtermRef.current = terminal;
        fitAddonRef.current = fitAddon;

        socketRef.current = io('http://localhost:8000/linux', {
            transports: ['websocket', 'polling'],
            cors: { origin: '*' }
        });

        socketRef.current.on('connect', () => {
            console.log('Connected to server');
        });

        socketRef.current.on('output', (data) => {
            terminal.write(data);
        });

        terminal.onData((data) => {
            socketRef.current.emit('key', data);
        });

        terminal.onResize(({ cols, rows }) => {
            socketRef.current.emit('resize', { cols, rows });
        });

        // Handle window resize
        const handleResize = () => {
            fitAddon.fit();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            terminal.dispose();
            socketRef.current?.disconnect();
            window.removeEventListener('resize', handleResize);
            document.head.removeChild(style);
        };
    }, []);

    return (
        <div className="w-screen h-screen bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center p-10">
            <div className="w-[800px] h-[600px] bg-[#1a1b26] rounded-lg shadow-2xl border border-slate-600 flex flex-col overflow-hidden">
                <div className="bg-slate-700 h-10 flex items-center px-4 border-b border-slate-600 flex-shrink-0 relative">
                    <div className="flex gap-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full" />
                        <span className="w-3 h-3 bg-yellow-500 rounded-full" />
                        <span className="w-3 h-3 bg-green-500 rounded-full" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-slate-300 text-sm font-medium">Terminal</span>
                    </div>
                </div>
                <div className="flex-1 overflow-hidden">
                    <div ref={terminalRef} className="w-full h-full p-2" />
                </div>
            </div>
        </div>
    );
}

export default App;
