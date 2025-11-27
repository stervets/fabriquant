import {WebSocketServer} from 'ws';
import {timeout} from './common/utils';

export interface ExtendedWebSocket extends WebSocket {
    id: string;
    type: 'client' | 'bot'
}

const startupTime = Date.now();

class WS {
    private ws: WebSocketServer;
    private sockets: Record<string, ExtendedWebSocket>;

    init(server: any) {
        this.ws = new WebSocketServer({
            server,
            path: '/ws',
        });
        this.ws.on('connection', this.onSocketConnection.bind(this));
    }

    onSocketConnection(socket: ExtendedWebSocket) {
        console.log('Socket connected');
        console.log('WebSocket connected');

        socket.onclose = () => {
            delete this.sockets[socket.id];
            console.log(' Socket disconnected');
        };

        socket.onmessage = async (msg) => {
            let com: string;
            let args: any[];
            let id: string;

            try {
                [com, args, id] = JSON.parse(msg.data);
            } catch {
                //console.warn('WS invalid JSON', msg.data);
                return;
            }

            if (this.handlers[com]) {
                const result = await this.handlers[com].apply(this, args);
                id && socket.send(JSON.stringify(['[res]', result, id]));
            } else {
                id && socket.send(JSON.stringify(['[res]', {
                    error: `[WS] Backend handler not found: "${com}"`
                }, id]));
                console.warn(`[WS] Backend Handler not found: "${com}"`);
            }
        };

        if (Date.now() - startupTime < 1000) {
            this.send('reloadPage');
        } else {

        }
    }

    private broadcast(json: string) {
        this.ws.clients.forEach((c) => c.readyState === 1 && c.send(json));
    }

    send(com: string, ...args: any[]) {
        this.broadcast(JSON.stringify([com, args]));
    }

    handlers: any = {
        async test(a: number, b: number) {
            await timeout(500);
            return a + b;
        },
    };
}

export const ws = new WS();
