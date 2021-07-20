import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Pattern } from './pattern.entity';
import { HitObject } from './hitobject.entity';

@Entity()
export class Beatmap {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  artist: string;

  @Column()
  creator: string;

  @Column()
  difficulty: string;

  @OneToMany(() => Pattern, (pattern) => pattern.beatmap)
  patterns: Pattern[];

  @OneToMany(() => HitObject, (hitObject) => hitObject.beatmap)
  hitObjects: HitObject[];
}
