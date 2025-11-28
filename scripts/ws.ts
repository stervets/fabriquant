import {genId, timeout} from "./utils";

class WS {
    private ws: WebSocket;
    private requests: Record<string, (...args: any[]) => void> = {};

    public readonly id: string = process.env.FABRIQUANT_BOT_ID!;

    constructor(private readonly addr: string) {
    }

    async connect() {
        let resolve: (value: unknown) => void;
        this.ws = new WebSocket(this.addr);

        this.ws.onopen = async () => {
            await this.request('registerClient', 'bot');
            resolve(true);
        };

        this.ws.onclose = async () => {
            console.log('WebSocket disconnected');
            await timeout(1000);
            this.connect();
        };

        this.ws.onmessage = async (msg) => {
            let com: string;
            let args: any;
            let requestId: string;
            let senderId: string;

            try {
                [com, args, requestId, senderId] = JSON.parse(msg.data);
            } catch {
                console.warn('WS invalid JSON', msg.data);
                return;
            }

            if (com === '[res]') {
                if (!this.requests[requestId]) {
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
                    await this.handlers[com].apply(this, [...args]) :
                    this.error(`Handler not found: "${com}"`),
                requestId
            );
        };

        return new Promise((_resolve) => {
            resolve = _resolve;
        });
    }

    registerHandlers(handlers: [string, (...args: any[]) => any][], ctx: any) {
        handlers.forEach(([name, handler]) => this.registerHandler(name, handler, ctx));
    }

    registerHandler(name: string, handler: (...args: any[]) => any, ctx: any) {
        if (this.handlers[name]) {
            console.warn(`registerHandler(): handler ${name} registered already`);
        }
        this.handlers[name] = handler.bind(ctx);
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
        },

        async botTest(a: number, b: number, senderId: string) {
            console.log(998, 'RES FROM FRONT', await ws.requestFrom(senderId, 'frontTest'));
            return a + b;
        }
    }
}

//@ts-ignore
export const ws = new WS(process.env.FABRIQUANT_WS_URL);