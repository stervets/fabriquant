import {emit} from '../event-bus';

const WS_ADDRESS = 'ws://127.0.0.1:7015/ws';

class WS {
    private ws: WebSocket;
    private requests: Record<string, () => void> = {};

    public readonly id: string = genId();

    constructor(private readonly addr: string) {
        this.connect();
    }

    private connect() {
        this.ws = new WebSocket(this.addr);

        this.ws.onopen = async () => {
            await this.request('registerClient', 'front');
            emit('ws:connected');
        };

        this.ws.onclose = async () => {
            console.log('WebSocket disconnected');
            emit('ws:disconnected');
            await timeout(1000);
            this.connect();
        };

        this.ws.onmessage = async (msg) => {
            let com: string;
            let args: any[];
            let requestId: string;
            let senderId: string;

            try {
                [com, args, requestId, senderId] = JSON.parse(msg.data);
            } catch {
                console.warn('WS invalid JSON', msg.data);
                return;
            }

            if (com === '[res]') {
                if (!this.requests[requestId]){
                    console.log(`Request id not found: "${requestId}"`);
                    return;
                }
                if (args && args.error) {
                    console.warn(args.error);
                    args = null;
                }
                this.requests[requestId](args);
                delete this.requests[requestId];
                return;
            }

            this.response(
                this.handlers[com] ?
                    await this.handlers[com].apply(this, [...args, senderId]) :
                    this.error(`Handler not found: "${com}"`),
                requestId
            );
        };
    }

    registerHandlers(handlers: [string, (...args: any[]) => any][], ctx: any) {
        handlers.forEach(([name, handler]) => this.registerHandler(name, handler, ctx));
    }

    registerHandler(name: string, handler: (...args: any[]) => any, ctx: any) {
        if (this.handlers[name]) {
            console.warn(`registerHandler(): handler ${name} registered already`);
        }
        this.handlers[name] = handler;
    }

    error(message: string) {
        return {error: message};
    }

    response(value: any, requestId: string) {
        this.ws.send(JSON.stringify(['[res]', value, requestId]));
    }

    requestFrom(receiverId: string, com: string, ...args: any[]) {
        return new Promise((requestResolve) => {
            const requestId = genId();
            this.requests[requestId] = requestResolve;
            this.ws.send(JSON.stringify([com, args, requestId, this.id, receiverId]));
        });
    }

    request(com: string, ...args: any[]) {
        return this.requestFrom('', com, ...args);
    }

    handlers: any = {
        async reloadPage() {
            console.log('Reloading page...');
            await timeout(1000);
            window.location.reload();
        },

        'db:update:start'(a){
            console.log('db:update:start', a);
        },

        'db:update:donedb:update:error'(a){
            console.log('db:update:done', a);
        },

        'db:update:error'(a){
            console.log('db:update:error', a);
        },

        'db:update:progress'(a){
            console.log('db:update:progress', a);
        }
    }
}

export const ws = new WS(WS_ADDRESS);