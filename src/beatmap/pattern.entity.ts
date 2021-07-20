import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Beatmap } from './beatmap.entity';
import { HitObject } from './hitobject.entity';

@Entity()
export class Pattern {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'integer' })
  startTime: number;
  @Column()
  rhythm: string;

  @ManyToOne(() => Beatmap)
  beatmap: Beatmap;

  @OneToMany(() => HitObject, (hitObject) => hitObject.pattern)
  hitObjects: HitObject[];
}
