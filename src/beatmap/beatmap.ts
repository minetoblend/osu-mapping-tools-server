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
}
