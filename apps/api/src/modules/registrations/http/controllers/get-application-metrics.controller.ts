import { Controller, Get } from '@nestjs/common';
import { CurrentActor } from '../../../../shared/http/auth/decorators/current-actor.decorator';
import { RequirePermissions } from '../../../../shared/http/auth/decorators/require-permissions.decorator';
import type { ActorContext } from '../../../../shared/security/contexts/actor-context';
import { GetApplicationMetricsUseCase } from '../../application/use-cases/get-application-metrics.use-case';

@Controller('applications')
export class GetApplicationMetricsController {
  constructor(private readonly useCase: GetApplicationMetricsUseCase) {}

  @Get('metrics')
  @RequirePermissions('solicitudes:read')
  async handle(@CurrentActor() actor: ActorContext) {
    return { data: await this.useCase.execute(actor) };
  }
}
