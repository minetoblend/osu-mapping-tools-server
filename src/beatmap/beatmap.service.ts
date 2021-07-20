import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Beatmap } from './beatmap.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BeatmapService {
  constructor(
    @InjectRepository(Beatmap)
    private beatmapRepository: Repository<Beatmap>,
  ) {}

  async findAll(): Promise<Beatmap[]> {
    return this.beatmapRepository.find();
  }
}
