// apps/api/src/modules/chat/chat.controller.ts
import { Controller, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat/conversations')
@UseGuards()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
}