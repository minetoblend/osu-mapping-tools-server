import { Module } from '@nestjs/common';
import { PatternService } from './pattern.service';
import { PatternController } from './pattern.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Pattern, PatternSchema } from './pattern.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Pattern.name, schema: PatternSchema }]),
  ],
  providers: [PatternService],
  controllers: [PatternController],
})
export class BeatmapModule {}
