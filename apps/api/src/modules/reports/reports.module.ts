import { Module } from '@nestjs/common';
import { GraduateCsvModule } from './graduates/csv/graduate-csv.module';
import { GraduatesReportModule } from './graduates/pdf/graduates-report.module';

// Módulo padre de los reportes: agrupa el módulo de cada reporte y es el único que se registra en AppModule
@Module({
  imports: [GraduatesReportModule, GraduateCsvModule],
})
export class ReportsModule {}
