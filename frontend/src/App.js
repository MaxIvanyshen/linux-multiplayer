import React, { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Terminal } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import 'xterm/css/xterm.css';
import './terminal.css';

function App() {
    const socketRef = useRef(null);
    const terminalRef = useRef(null);
    const xtermRef = useRef(null);
    const fitAddonRef = useRef(null);

    useEffect(() => {
        // Initialize xterm.js
        const terminal = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: 'Monaco, Menlo, Ubuntu Mono, Consolas, monospace',
            theme: {
                background: '#1a1b26',          // Tokyo Night background
                foreground: '#c0caf5',          // Tokyo Night foreground (brighter)
                cursor: '#f7768e',              // Tokyo Night red
                cursorAccent: '#1a1b26',        // Cursor text color
                selection: '#283457',           // Tokyo Night selection (darker)
                selectionForeground: '#c0caf5', // Selection text
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

        // Socket.IO connection
        socketRef.current = io('http://localhost:8000/linux', {
            transports: ['websocket', 'polling'],
            cors: { origin: '*' }
        });

        // Handle socket events
        socketRef.current.on('connect', () => {
            console.log('Connected to server');
        });

        socketRef.current.on('output', (data) => {
            terminal.write(data);
        });

        // Handle terminal input
        terminal.onData((data) => {
            socketRef.current.emit('key', data);
        });

        // Handle terminal resize
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
        };
    }, []);

    return (
        <div className="desktop">
        <div className="terminal-window">
        <div className="terminal-header">
        <div className="terminal-buttons">
        <span className="btn close"></span>
        <span className="btn minimize"></span>
        <span className="btn maximize"></span>
        </div>
        <div className="terminal-title">Terminal</div>
        </div>
        <div className="terminal-body">
        <div ref={terminalRef} className="xterm-container" />
        </div>
        </div>
        </div>
    );
}

export default App;
