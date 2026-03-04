import EventSource from 'eventsource';

export interface OpenCodeMessage {
  type: 'text' | 'tool_call' | 'tool_result' | 'error' | 'done';
  content?: string;
  tool?: string;
  toolInput?: string;
  toolOutput?: string;
}

export interface OpenCodeConfig {
  url: string;
  sessionId?: string;
  model?: string;
  provider?: string;
}

export type MessageHandler = (message: OpenCodeMessage) => void;

export class OpenCodeClient {
  private url: string;
  private sessionId: string | null = null;
  private eventSource: EventSource | null = null;
  private messageHandlers: MessageHandler[] = [];
  private connected: boolean = false;

  constructor(config: OpenCodeConfig) {
    this.url = config.url.replace(/\/$/, '');
    if (config.sessionId) {
      this.sessionId = config.sessionId;
    }
  }

  async createSession(): Promise<string> {
    const response = await fetch(`${this.url}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        provider: 'anthropic',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.statusText}`);
    }

    const data = await response.json() as { sessionId: string };
    this.sessionId = data.sessionId;
    return this.sessionId;
  }

  async sendMessage(content: string): Promise<void> {
    if (!this.sessionId) {
      await this.createSession();
    }

    this.connect();

    const response = await fetch(
      `${this.url}/api/sessions/${this.sessionId!}/messages`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content }],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }
  }

  private connect(): void {
    if (!this.sessionId) return;

    const endpoint = `${this.url}/api/sessions/${this.sessionId}/events`;
    this.eventSource = new EventSource(endpoint);

    this.eventSource.onopen = () => {
      this.connected = true;
      console.log('[OpenCode] Connected to session');
    };

    this.eventSource.onmessage = (event: { data: string }) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (e) {
        console.error('[OpenCode] Failed to parse message:', e);
      }
    };

    this.eventSource.onerror = (error: unknown) => {
      console.error('[OpenCode] Connection error:', error);
      this.connected = false;
    };
  }

  private handleMessage(data: any): void {
    const message: OpenCodeMessage = {
      type: data.type || 'text',
      content: data.content || data.text,
      tool: data.tool,
      toolInput: data.toolInput,
      toolOutput: data.toolOutput,
    };

    for (const handler of this.messageHandlers) {
      handler(message);
    }
  }

  onMessage(handler: MessageHandler): void {
    this.messageHandlers.push(handler);
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  getSessionId(): string | null {
    return this.sessionId;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.url}/global/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
