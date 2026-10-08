import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { JobPostingsModule } from './modules/job-postings/job-postings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    AuthModule,
    CompaniesModule,
    JobPostingsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}