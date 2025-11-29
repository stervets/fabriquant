import {WebSocketServer} from 'ws';
import {genId} from "./common/utils";
import {HOST, PORT, server} from "./main";

export type ClientType = 'front' | 'bot';

export interface ExtendedWebSocket extends WebSocket {
  id: string;
  type: ClientType
}

const startupTime = Date.now();
const registerClientFunction = 'registerClient';

class WS {
  private ws: WebSocketServer;
  private sockets: Record<string, ExtendedWebSocket> = {};
  private requests: Record<string, (value: any) => void> = {};

  startServer() {
    if (!server) {
      console.warn(`HTTP Server not initialized`);
      return;
    }
    this.ws = new WebSocketServer({
      server,
      path: '/ws',
    });
    this.ws.on('connection', this.onSocketConnection.bind(this));
    console.log(`  Listen WS:   ws://${HOST}:${PORT}/ws`);
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
      let args: any;
      let requestId: string;
      let receiverId: string;
      let senderId: string;

      try {
        [com, args, requestId, senderId, receiverId] = JSON.parse(msg.data);
      } catch {
        console.warn('WS invalid JSON:', msg.data);
        return;
      }

      if (receiverId) {
        let result: any;
        if (this.sockets[receiverId]) {
          result = await this.request(this.sockets[receiverId], senderId, com, ...args);
        } else {
          result = this.error(`Can't find receiver socket: "${receiverId}"`);
          console.warn(result.error);
        }
        this.response(socket, result, requestId);
        return;
      }


      if (com === '[res]') {
        if (!this.requests[requestId]) {
          console.log(`11Request id not found: "${requestId}"`);
          console.log(JSON.parse(msg.data));
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

      if (this.handlers[com] && (socket.id || com === registerClientFunction)) {
        args = [...args, socket];
        com === registerClientFunction && args.push(senderId);
        const value = await this.handlers[com].apply(this, args);
        requestId && this.response(socket, value, requestId);
      } else {
        if (requestId) {
          const e = this.error(`[WS] Backend handler not found: "${com}"`);
          socket.send(JSON.stringify(['[res]', e, requestId]));
          console.warn(e.error);
        }
      }
    };

    if (Date.now() - startupTime < 1000) {
      return this.request(socket, '', 'reloadPage');
    }
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

  response(socket: ExtendedWebSocket, value: any, requestId: string) {
    console.log();
    socket.send(JSON.stringify(['[res]', value, requestId]));
  }

  request(socket: ExtendedWebSocket, senderId: string, com: string, ...args: any[]) {
    return new Promise((requestResolve) => {
      const requestId = genId();
      this.requests[requestId] = requestResolve;
      socket.send(JSON.stringify([com, [...args, senderId], requestId, '']));
    });
  }

  broadcastToType(type: string, com: string, ...args: any[]) {
    Object.values(this.sockets).forEach((socket) => {
      if (!type || socket.type === type) {
        return this.request(socket, '', com, ...args);
      }
    });
  }

  broadcastFront(com: string, ...args: any[]) {
    this.broadcastToType('front', com, ...args);
  }

  broadcastBots(com: string, ...args: any[]) {
    this.broadcastToType('bot', com, ...args);
  }

  broadcast(com: string, ...args: any[]) {
    this.broadcastToType('', com, ...args);
  }

  /* HANDLERS */

  handlers: any = {
    [registerClientFunction](this: WS, type: ClientType, socket: ExtendedWebSocket, senderId: string) {
      Object.assign(socket, {id: senderId, type});
      this.sockets[senderId] = socket;
    }
  };
}

export const ws = new WS();
