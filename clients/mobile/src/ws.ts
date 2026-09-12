import { SOCKET_URL } from './config';

type Handler = (data: any) => void;

export class WSClient {
  private ws: WebSocket | null = null;
  private token: string;
  private handlers: Map<string, Handler[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectTimeout: any = null;
  private shouldReconnect = true;

  constructor(token: string) {
    this.token = token;
  }

  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    const url = `${SOCKET_URL}/api/ws?token=${this.token}`;
    console.log('🔌 [WS] connect');

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('✅ [WS] connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event: any) => {
      try {
        const msg = JSON.parse(event.data);
        const { type, data } = msg;
        this.emit(type, data);
      } catch (e) {
        console.warn('⚠️ [WS] parse error');
      }
    };

    this.ws.onclose = () => {
      console.log('🔴 [WS] disconnected');
      if (this.shouldReconnect) this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      console.warn('⚠️ [WS] Не удалось подключиться. Проверь Wi-Fi.');
    };
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;
    this.reconnectTimeout = setTimeout(() => this.connect(), delay);
  }

  on(event: string, handler: Handler) {
    if (!this.handlers.has(event)) this.handlers.set(event, []);
    this.handlers.get(event)!.push(handler);
  }

  off(event: string, handler: Handler) {
    const handlers = this.handlers.get(event);
    if (!handlers) return;
    const idx = handlers.indexOf(handler);
    if (idx >= 0) handlers.splice(idx, 1);
  }

  send(type: string, data: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('⚠️ [WS] не открыт');
      return;
    }
    this.ws.send(JSON.stringify({ type, ...data }));
  }

  private emit(event: string, data: any) {
    const handlers = this.handlers.get(event);
    if (!handlers) return;
    handlers.forEach((h) => {
      try { h(data); } catch {}
    });
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.ws) this.ws.close();
  }
}
