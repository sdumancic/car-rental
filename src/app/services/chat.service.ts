import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { AppStore } from './app.store';

export interface ChatMessage {
  id?: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private ws: WebSocket | null = null;
  private messagesSubject = new Subject<ChatMessage>();
  private connectionStatusSubject = new BehaviorSubject<'connected' | 'disconnected' | 'connecting'>('disconnected');

  public messages$ = this.messagesSubject.asObservable();
  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  constructor(private store: AppStore, private ngZone: NgZone) {}

  connect(userId: number): void {
    if (this.ws) {
      console.log('Disconnecting existing WebSocket...');
      this.disconnect();
    }

    console.log('Setting connection status to connecting...');
    this.connectionStatusSubject.next('connecting');
    const wsUrl = `ws://localhost:9000/customer-support-agent/${userId}`;
    console.log('Connecting to WebSocket URL:', wsUrl);

    try {
      this.ws = new WebSocket(wsUrl);
      console.log('WebSocket object created, readyState:', this.ws.readyState);

      this.ws.onopen = () => {
        console.log('WebSocket ONOPEN event fired! readyState:', this.ws?.readyState);
        this.ngZone.run(() => {
          this.connectionStatusSubject.next('connected');
          console.log('Connection status set to connected inside NgZone');
        });
      };

      this.ws.onmessage = (event) => {
        console.log('WebSocket message received:', event.data);
        this.ngZone.run(() => {
          try {
            const data = JSON.parse(event.data);
            const message: ChatMessage = {
              id: data.id || Date.now().toString(),
              content: data.content || data.message || event.data,
              sender: 'agent',
              timestamp: new Date(data.timestamp || Date.now())
            };
            this.messagesSubject.next(message);
          } catch (e) {
            // If not JSON, treat as plain text message
            const message: ChatMessage = {
              id: Date.now().toString(),
              content: event.data,
              sender: 'agent',
              timestamp: new Date()
            };
            this.messagesSubject.next(message);
          }
        });
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket ERROR event:', error);
        this.ngZone.run(() => {
          this.connectionStatusSubject.next('disconnected');
        });
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket CLOSE event:', event.code, event.reason);
        this.ngZone.run(() => {
          this.connectionStatusSubject.next('disconnected');
          this.ws = null;
        });
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.connectionStatusSubject.next('disconnected');
    }
  }

  sendMessage(content: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        content,
        timestamp: new Date().toISOString()
      };
      this.ws.send(JSON.stringify(message));

      // Add user message to the stream
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content,
        sender: 'user',
        timestamp: new Date()
      };
      this.messagesSubject.next(userMessage);
    } else {
      console.error('WebSocket is not connected');
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connectionStatusSubject.next('disconnected');
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  getReadyState(): number | null {
    return this.ws?.readyState ?? null;
  }

  getCurrentStatus(): 'connected' | 'disconnected' | 'connecting' {
    return this.connectionStatusSubject.value;
  }
}

