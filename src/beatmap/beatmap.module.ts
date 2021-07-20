import { Module } from '@nestjs/common';
import { Beatmap } from './beatmap.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BeatmapService } from './beatmap.service';
import { BeatmapController } from './beatmap.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Beatmap])],
  providers: [BeatmapService],
  controllers: [BeatmapController],
})
export class BeatmapModule {}
