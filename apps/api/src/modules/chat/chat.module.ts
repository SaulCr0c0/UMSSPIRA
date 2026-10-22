import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ChatGateway } from './chat.gateway';
import { PrismaService } from './prisma.service';

@Module({
  imports: [AuthModule],
  providers: [PrismaService, ChatGateway],
})
export class ChatModule {}