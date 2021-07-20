import { Controller, Get } from '@nestjs/common';
import { BeatmapService } from './beatmap.service';
import { Beatmap } from './beatmap.entity';

@Controller('/beatmap')
export class BeatmapController {
  constructor(private readonly beatmapService: BeatmapService) {}

  @Get()
  async getAll(): Promise<Beatmap[]> {
    return await this.beatmapService.findAll();
  }
}
