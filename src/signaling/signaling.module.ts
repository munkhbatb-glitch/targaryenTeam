import { Module } from '@nestjs/common';
import { ChatModule } from '../chat/chat.module';
import { SignalingGateway } from './signaling.gateway';
import { SignalingService } from './signaling.service';

@Module({
  imports: [ChatModule],
  providers: [SignalingGateway, SignalingService],
})
export class SignalingModule {}
