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
    @Query() query: any,
  ) {
    if (limit > 50) limit = 50;
    if (limit < 1) limit = 1;
    if (offset < 0) offset = 0;

    const options: any = {};
    if (query.minbpm) {
      options.bpm = { $gte: parseInt(query.minbpm) };
    }
    if (query.maxbpm) {
      if (!options.bpm)
        options.bpm = {}
      options.bpm.$lte = parseInt(query.maxbpm)
    }
    if(query.c === 'true') {
      rhythm = new RegExp('^' + rhythm)
    }

    if (query.minsr) {
      options['beatmap.starRating'] = { $gte: parseFloat(query.minsr) };
    }
    if (query.maxsr) {
      if (!options['beatmap.starRating'])
        options['beatmap.starRating'] = {}
      options['beatmap.starRating'].$lte = parseFloat(query.maxsr)
    }

    return await this.patternService.search(rhythm, limit, offset, options)
  }
}
