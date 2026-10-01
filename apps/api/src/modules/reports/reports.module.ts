import { Module } from '@nestjs/common';
import { GraduatesReportModule } from './graduates/pdf/graduates-report.module';

// Módulo padre de los reportes: agrupa el módulo de cada reporte y es el único que se registra en AppModule
@Module({
  imports: [GraduatesReportModule],
})
export class ReportsModule {}
