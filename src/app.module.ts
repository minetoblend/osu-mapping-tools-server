import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BeatmapModule } from './beatmap/beatmap.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forRoot(), BeatmapModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
