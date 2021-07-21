import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { PatternService } from './pattern.service';

@Controller('/pattern')
export class PatternController {
  constructor(private readonly patternService: PatternService) {}

  @Get('/search')
  async getAll(
    @Query('rhythm') rhythm,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    if (limit > 50) limit = 50;
    if (limit < 1) limit = 1;
    if (offset < 0) offset = 0;
    return await this.patternService.search(rhythm, limit, offset);
  }
}
