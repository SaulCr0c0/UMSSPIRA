import { Module } from '@nestjs/common';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [ReportsModule], // Aquí irán también CompaniesModule y JobPostingsModule
  controllers: [],
  providers: [],
})
export class AppModule {}
