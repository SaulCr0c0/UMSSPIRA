import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/infrastructure/database/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { OptionalAuthenticationGuard } from '../../shared/http/auth/guards/optional-authentication.guard';
import { eventsProviders } from './infrastructure/providers/events.providers';
import { GetEventCatalogController } from './http/controllers/get-event-catalog.controller';
import { GetPublishedEventController } from './http/controllers/get-published-event.controller';
import { ListOwnedEventsController } from './http/controllers/list-owned-events.controller';
import { GetOwnedEventController } from './http/controllers/get-owned-event.controller';
import { GetEventDraftController } from './http/controllers/get-event-draft.controller';
import { CreateEventController } from './http/controllers/create-event.controller';
import { UpdateEventDraftController } from './http/controllers/update-event-draft.controller';
import { PublishEventDraftController } from './http/controllers/publish-event-draft.controller';
import { DeleteEventCoverController } from './http/controllers/delete-event-cover.controller';
import { ReadEventCoverController } from './http/controllers/read-event-cover.controller';
import { UploadEventCoverController } from './http/controllers/upload-event-cover.controller';
import { GenerateEventPassService } from './application/generate-event-pass.service';
import { EventPassesController } from './http/event-passes.controller';
@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [
    GetEventCatalogController,
    ListOwnedEventsController,
    GetOwnedEventController,
    GetEventDraftController,
    CreateEventController,
    UpdateEventDraftController,
    PublishEventDraftController,
    DeleteEventCoverController,
    ReadEventCoverController,
    UploadEventCoverController,
    GetPublishedEventController,
    EventPassesController,
  ],
  providers: [...eventsProviders, OptionalAuthenticationGuard , GenerateEventPassService],
})
export class EventsModule {}
