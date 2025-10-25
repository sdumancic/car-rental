import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService, ChatMessage } from '../services/chat.service';
import { AppStore } from '../services/app.store';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  messages: ChatMessage[] = [];
  newMessage = '';
  connectionStatus: 'connected' | 'disconnected' | 'connecting' = 'disconnected';

  private messagesSubscription?: Subscription;
  private connectionSubscription?: Subscription;
  private shouldScrollToBottom = false;

  constructor(
    private chatService: ChatService,
    private store: AppStore,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userId = this.store.userId();

    if (!userId) {
      console.error('User ID not found');
      this.router.navigate(['/welcome']);
      return;
    }

    // Subscribe to connection status FIRST
    this.connectionSubscription = this.chatService.connectionStatus$.subscribe(status => {
      console.log('Connection status changed to:', status);
      this.connectionStatus = status;
      this.cdr.detectChanges();
      console.log('Change detection triggered, current status:', this.connectionStatus);
    });

    // Subscribe to messages
    this.messagesSubscription = this.chatService.messages$.subscribe(message => {
      console.log('New message received:', message);
      this.messages.push(message);
      this.shouldScrollToBottom = true;
      this.cdr.detectChanges();
    });

    // Connect to WebSocket
    console.log('Connecting to WebSocket with userId:', userId);
    this.chatService.connect(userId);
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    this.messagesSubscription?.unsubscribe();
    this.connectionSubscription?.unsubscribe();
    this.chatService.disconnect();
  }

  sendMessage(): void {
    if (this.newMessage.trim() && this.connectionStatus === 'connected') {
      this.chatService.sendMessage(this.newMessage.trim());
      this.newMessage = '';
      this.shouldScrollToBottom = true;
    } else {
      console.log('Cannot send message. Status:', this.connectionStatus, 'Message:', this.newMessage.trim());
      this.debugConnection();
    }
  }

  debugConnection(): void {
    console.log('=== DEBUG CONNECTION ===');
    console.log('Component connectionStatus:', this.connectionStatus);
    console.log('Service getCurrentStatus():', this.chatService.getCurrentStatus());
    console.log('Service getReadyState():', this.chatService.getReadyState());
    console.log('Service isConnected():', this.chatService.isConnected());
    console.log('========================');
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Scroll to bottom failed:', err);
    }
  }

  goBack(): void {
    this.router.navigate(['/search']);
  }

  getConnectionStatusText(): string {
    switch (this.connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  }

  getConnectionStatusClass(): string {
    switch (this.connectionStatus) {
      case 'connected':
        return 'text-green-500';
      case 'connecting':
        return 'text-yellow-500';
      case 'disconnected':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  }
}

