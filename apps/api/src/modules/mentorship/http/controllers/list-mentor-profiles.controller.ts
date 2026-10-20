import { Controller, Get } from '@nestjs/common';
import { Public } from '../../../../shared/http/auth/decorators/public.decorator';
import { ListMentorProfilesUseCase } from '../../application/use-cases/list-mentor-profiles.use-case';
import { presentDirectory } from '../presenters/mentor.presenter';

@Controller('mentorship')
export class ListMentorProfilesController {
  constructor(private readonly useCase: ListMentorProfilesUseCase) {}
  @Get('profiles')
  @Public()
  async handle() {
    return { data: (await this.useCase.execute()).map(presentDirectory) };
  }
}
