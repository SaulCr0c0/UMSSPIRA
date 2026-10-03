import { Module } from '@nestjs/common';
import { MentorshipModule } from './modules/mentorship/mentorship.module';
import { BackendConsoleController } from './backend-console.controller';

@Module({
  imports: [MentorshipModule], // Aquí irán CompaniesModule y JobPostingsModule
  controllers: [BackendConsoleController],
  providers: [],
})
export class AppModule {}
