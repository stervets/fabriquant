import {emit} from '../event-bus';

const WS_ADDRESS = 'ws://127.0.0.1:7015/ws';

class WS {
    private ws: WebSocket;
    private resolvers: Record<string, ()=>void> = {};

    constructor(private readonly addr: string) {
        this.connect();
    }

    private connect() {
        this.ws = new WebSocket(this.addr);

        this.ws.onopen = () => {
            emit('ws:connected');
            this.ws.send(JSON.stringify({event: 'ping', data: null}));
        };

        this.ws.onclose = async () => {
            console.log('WebSocket disconnected');
            emit('ws:disconnected');
            await timeout(1000);
            this.connect();
        };

        this.ws.onmessage = (msg) => {
            let com: string;
            let args: any[];
            let id: string;

            try {
                [com, args, id] = JSON.parse(msg.data);
            } catch {
                console.warn('WS invalid JSON', msg.data);
                return;
            }

            if (com === '[res]'){
                if (!this.resolvers[id])return;
                this.resolvers[id](args);
                delete this.resolvers[id];
                return;
            }

            if (this.handlers[com]) {
                this.handlers[com].apply(this, args);
            } else {
                emit(com, ...args);
                //console.warn(`[WS] Handler not found: "${com}"`)
            }
        };
    }

    send(com: string, ...args: any[]) {
        this.ws.send(JSON.stringify([com, args]));
    }

    request(com: string, ...args: any[]) {
        return new Promise((resolve)=>{
            const id = genId();
            this.resolvers[id] = resolve;
            this.ws.send(JSON.stringify([com, args, id]));
        });
    }

    handlers: any = {
        async reloadPage() {
            await timeout(1000);
            window.location.reload();
        },

        updateEnvironment(env){
            console.log(111, env);
        }
    }
}

export const ws = new WS(WS_ADDRESS);