import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Beatmap } from './beatmap.entity';
import { Pattern } from './pattern.entity';

@Entity()
export class HitObject {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Beatmap)
  beatmap: Beatmap;

  @ManyToOne(() => Pattern)
  pattern: Pattern;

  @Column({ type: 'integer' })
  x: number;
  @Column({ type: 'integer' })
  y: number;
  @Column({ type: 'integer' })
  startTime: number;
  @Column({ type: 'integer', nullable: true })
  endTime: number;
  @Column({ type: 'integer', nullable: true })
  duration: number;

  @Column({ type: 'integer' })
  startBeat: number;
  @Column({ type: 'integer', nullable: true })
  endBeat: number;
  @Column({ type: 'integer', nullable: true })
  beatDuration: number;
  @Column({ type: 'text' })
  type: 'circe' | 'slider';
  @Column({ type: 'json' })
  points: number[][];
}
