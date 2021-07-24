import { Column } from 'typeorm';

export class Beatmap {
  @Column()
  title: string;

  @Column()
  artist: string;

  @Column()
  creator: string;

  @Column()
  difficulty: string;

  @Column()
  hp: number;

  @Column()
  cs: number;

  @Column()
  ar: number;

  @Column()
  od: number;
}
