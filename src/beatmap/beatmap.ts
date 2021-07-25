import { Column } from 'typeorm';
import { Prop } from "@nestjs/mongoose";

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
  filename: string;

  @Column()
  hp: number;

  @Column()
  cs: number;

  @Column()
  ar: number;

  @Column()
  od: number;

  @Column()
  stackLeniency: number;

  @Prop()
  starRating: number;
}
