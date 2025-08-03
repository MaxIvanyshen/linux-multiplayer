import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { spawn, IPty } from 'node-pty';

@Injectable()
export class LinuxService implements OnModuleDestroy {
    private readonly logger = new Logger(LinuxService.name);
    private connections: Set<string> = new Set<string>();
    private session: IPty | null = null;
    private isConnected = false;
    private reconnectAttempts = 0;
    private readonly maxReconnectAttempts = 3;

    constructor() {
        this.initializeSession();
    }

    private initializeSession() {
        try {
            this.session = spawn('ssh', [
                '-tt',
                '-o', 'StrictHostKeyChecking=no',
                '-o', 'UserKnownHostsFile=/dev/null',
                '-i', process.env.HOME + '/.ssh/tiny_linux_key',
                'root@localhost',
                '-p', '2222'
            ], {
                name: 'xterm-color',
                cols: 80,
                rows: 35,
                cwd: process.env.HOME,
                env: process.env as any,
            });

            this.setupSessionHandlers();
            this.logger.log('SSH session initialized');
        } catch (error) {
            this.logger.error('Failed to initialize SSH session:', error);
            this.handleReconnect();
        }
    }

    private setupSessionHandlers() {
        if (!this.session) return;

        this.session.onData((data) => {
            // Check for connection success indicators
            if (data.includes('sandbox') || data.includes('$')) {
                this.isConnected = true;
                this.reconnectAttempts = 0;
            }
        });

        this.session.onExit((exitCode) => {
            this.logger.warn(`SSH session exited with code: ${exitCode}`);
            this.isConnected = false;
            this.handleReconnect();
        });
    }

    private handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            this.logger.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

            setTimeout(() => {
                this.initializeSession();
            }, 2000 * this.reconnectAttempts); // Exponential backoff
        } else {
            this.logger.error('Max reconnection attempts reached');
        }
    }

    write(data: string) {
        if (!this.session || !this.isConnected) {
            this.logger.warn('Attempted to write to disconnected session');
            return false;
        }

        try {
            this.session.write(data);
            return true;
        } catch (error) {
            this.logger.error('Failed to write to session:', error);
            return false;
        }
    }

    checkConnections(clientId: string) {
        if (!this.connections.has(clientId)) {
            this.connections.add(clientId);
            this.logger.log(`New connection added: ${clientId} (Total: ${this.connections.size})`);

            // Send initial setup for new connections
            if (this.isConnected) {
                setTimeout(() => {
                    this.write('\r');
                }, 100);
            }
        }
    }

    deleteConnection(clientId: string) {
        if (this.connections.has(clientId)) {
            this.connections.delete(clientId);
            this.logger.log(`Connection deleted: ${clientId} (Remaining: ${this.connections.size})`);

            // If no more connections, you might want to keep session alive or handle cleanup
            if (this.connections.size === 0) {
                this.logger.log('No active connections remaining');
            }
        }
    }

    onData(cb: (chunk: string) => void) {
        if (!this.session) {
            this.logger.warn('Attempted to attach data handler to null session');
            return;
        }

        this.session.onData(cb);
    }

    resize(cols: number, rows: number) {
        if (!this.session) {
            this.logger.warn('Attempted to resize null session');
            return false;
        }

        try {
            this.session.resize(cols, rows);
            this.logger.debug(`Terminal resized to ${cols}x${rows}`);
            return true;
        } catch (error) {
            this.logger.error('Failed to resize terminal:', error);
            return false;
        }
    }

    // Health check method
    isSessionHealthy(): boolean {
        return this.session !== null && this.isConnected;
    }

    // Get connection count
    getConnectionCount(): number {
        return this.connections.size;
    }

    // Cleanup on module destroy
    onModuleDestroy() {
        this.logger.log('Cleaning up LinuxService...');

        if (this.session) {
            try {
                this.session.kill();
                this.logger.log('SSH session terminated');
            } catch (error) {
                this.logger.error('Error terminating SSH session:', error);
            }
        }

        this.connections.clear();
    }
}
