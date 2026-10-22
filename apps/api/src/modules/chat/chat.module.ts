import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { PrismaService } from './prisma.service';

@Module({
  imports: [AuthModule],
  providers: [ChatService, PrismaService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}