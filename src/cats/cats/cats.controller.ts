import { Body, Controller, Inject, Post } from '@nestjs/common';
import { CatsService } from './cats.service';

@Controller('cats')
export class CatsController {
  constructor(
    @Inject(CatsService)
    private readonly catService: CatsService,
  ) {}

  @Post()
  createCat(@Body() body: any) {
    this.catService.create(body);
  }
}
