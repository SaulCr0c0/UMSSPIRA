// apps/api/src/modules/chat/chat.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat/conversations')
@UseGuards()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('direct')
  async createDirectChat(@Body() body: { targetUserId: string; senderId?: string }) {
    try {
      const actorId = body.senderId || '';
      
      const conversation = await this.chatService.findOrCreateDirectConversation(
        actorId,
        body.targetUserId,
      );
      return { conversationId: conversation.id };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al iniciar el chat';
      throw new BadRequestException(message);
    }
  }

  @Get()
  async getMyConversations() {
    return this.chatService.getUserConversations();
  }

  @Get('users')
  async getUsersToChat() {
    return this.chatService.getAvailableUsersToChat();
  }
}