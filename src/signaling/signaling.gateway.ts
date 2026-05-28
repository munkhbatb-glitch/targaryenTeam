import { Logger } from '@nestjs/common';
import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { WebSocket } from 'ws';
import { SignalingService } from './signaling.service';

@WebSocketGateway()
export class SignalingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(SignalingGateway.name);
  private readonly clientRooms = new WeakMap<WebSocket, string | null>();

  constructor(private readonly signalingService: SignalingService) {}

  handleConnection(client: WebSocket) {
    this.clientRooms.set(client, null);

    client.on('message', (raw: Buffer) => {
      const roomId = this.clientRooms.get(client) ?? null;
      const nextRoomId = this.signalingService.handleMessage(client, roomId, raw);
      this.clientRooms.set(client, nextRoomId);
    });
  }

  handleDisconnect(client: WebSocket) {
    const roomId = this.clientRooms.get(client) ?? null;
    this.signalingService.disconnect(roomId, client);
    this.clientRooms.delete(client);
    this.logger.debug(`Client disconnected from room: ${roomId ?? 'none'}`);
  }
}
