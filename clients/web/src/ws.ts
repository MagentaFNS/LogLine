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
    console.log('🔧 [WSClient] создан с токеном', token.slice(0, 20) + '...');
  }

  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('🔧 [WSClient] уже открыт, пропускаю');
      return;
    }

    const url = `${SOCKET_URL}/api/ws?token=${this.token}`;
    console.log('🔌 [WSClient] connect →', url);

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('✅ [WSClient] connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      console.log('📨 [WSClient.onmessage] raw:', event.data);
      try {
        const msg = JSON.parse(event.data);
        console.log('📨 [WSClient.onmessage] parsed:', msg);
        const { type, data } = msg;
        console.log('📨 [WSClient] emit event:', type);
        this.emit(type, data);
      } catch (e) {
        console.error('❌ [WSClient] parse error:', e);
      }
    };

    this.ws.onclose = (ev) => {
      console.log('🔴 [WSClient] disconnected. code:', ev.code, 'reason:', ev.reason);
      if (this.shouldReconnect) this.scheduleReconnect();
    };

    this.ws.onerror = (err) => {
      console.error('❌ [WSClient] error:', err);
    };
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('❌ [WSClient] max reconnect attempts');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    console.log(`🔄 [WSClient] reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  on(event: string, handler: Handler) {
    console.log('🎧 [WSClient] on:', event);
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
  }

  off(event: string, handler: Handler) {
    const handlers = this.handlers.get(event);
    if (!handlers) return;
    const idx = handlers.indexOf(handler);
    if (idx >= 0) handlers.splice(idx, 1);
  }

  send(type: string, data: any) {
    console.log('📤 [WSClient.send] type:', type, 'data:', data);
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('❌ [WSClient.send] WS не открыт, readyState:', this.ws?.readyState);
      return;
    }
    const payload = JSON.stringify({ type, ...data });
    console.log('📤 [WSClient.send] payload:', payload);
    this.ws.send(payload);
  }

  private emit(event: string, data: any) {
    const handlers = this.handlers.get(event);
    console.log('🎯 [WSClient.emit] event:', event, 'handlers:', handlers?.length || 0);
    if (!handlers) return;
    handlers.forEach((h) => {
      try {
        h(data);
      } catch (e) {
        console.error('❌ [WSClient.emit] handler error:', e);
      }
    });
  }

  disconnect() {
    console.log('🔴 [WSClient] disconnect вызван');
    this.shouldReconnect = false;
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.ws) this.ws.close();
  }
}
