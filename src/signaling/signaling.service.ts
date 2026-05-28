import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';
import { ChatMessage } from '../chat/chat.types';
import { ChatService } from '../chat/chat.service';

type SignalMessage = {
  type: string;
  roomId?: string;
  offer?: unknown;
  answer?: unknown;
  candidate?: unknown;
  peers?: number;
  text?: string;
  sender?: string;
  at?: number;
  messages?: ChatMessage[];
};

@Injectable()
export class SignalingService {
  private readonly rooms = new Map<string, Set<WebSocket>>();

  constructor(private readonly chatService: ChatService) {}

  private getRoom(roomId: string): Set<WebSocket> {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    return this.rooms.get(roomId)!;
  }

  private broadcast(roomId: string, message: SignalMessage, exclude?: WebSocket) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const payload = JSON.stringify(message);
    for (const client of room) {
      if (client !== exclude && client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }

  private sendChatHistory(roomId: string, client: WebSocket) {
    const history = this.chatService.getHistory(roomId);
    if (!history.length) return;

    client.send(
      JSON.stringify({
        type: 'chat-history',
        messages: history,
      }),
    );
  }

  join(roomId: string, client: WebSocket) {
    const room = this.getRoom(roomId);
    const peers = room.size;
    room.add(client);

    client.send(
      JSON.stringify({
        type: 'joined',
        roomId,
        peers,
      }),
    );

    this.sendChatHistory(roomId, client);

    if (peers >= 1) {
      this.broadcast(roomId, { type: 'peer-joined' }, client);
    }
  }

  relay(roomId: string, message: SignalMessage, sender: WebSocket) {
    if (!roomId) return;
    this.broadcast(roomId, message, sender);
  }

  leave(roomId: string, client: WebSocket) {
    if (!roomId) return;

    this.broadcast(roomId, { type: 'peer-left' }, client);
    this.rooms.get(roomId)?.delete(client);

    if (this.rooms.get(roomId)?.size === 0) {
      this.rooms.delete(roomId);
    }
  }

  handleMessage(client: WebSocket, roomId: string | null, raw: Buffer) {
    let data: SignalMessage;
    try {
      data = JSON.parse(raw.toString());
    } catch {
      return roomId;
    }

    switch (data.type) {
      case 'join':
        if (data.roomId) {
          this.join(data.roomId, client);
          return data.roomId;
        }
        break;

      case 'offer':
      case 'answer':
      case 'ice-candidate':
        if (roomId) {
          this.relay(roomId, data, client);
        }
        break;

      case 'chat':
        if (roomId && data.text?.trim()) {
          const chatMessage = this.chatService.saveMessage(
            roomId,
            data.sender || 'Guest',
            data.text,
          );

          this.broadcast(
            roomId,
            {
              type: 'chat',
              ...chatMessage,
            },
            client,
          );
        }
        break;

      case 'leave':
        if (roomId) {
          this.leave(roomId, client);
          return null;
        }
        break;
    }

    return roomId;
  }

  disconnect(roomId: string | null, client: WebSocket) {
    if (roomId) {
      this.leave(roomId, client);
    }
  }
}
