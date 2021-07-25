import { Column } from 'typeorm';

export class HitObject {
  @Column({ type: 'integer' })
  x: number;
  @Column({ type: 'integer' })
  y: number;
  @Column({ type: 'integer' })
  startTime: number;
  @Column({ type: 'integer' })
  endTime: number;
  @Column({ type: 'integer' })
  duration: number;

  @Column({ type: 'float' })
  startBeat: number;
  @Column({ type: 'float' })
  endBeat: number;
  @Column({ type: 'float' })
  beatDuration: number;
  @Column({ type: 'text' })
  type: 'circle' | 'slider';
  @Column({ type: 'json', nullable: true })
  points: number[][];
  @Column({ nullable: true })
  curveType: string;
  @Column({ type: 'float', nullable: true })
  pixelLength?: number;
  @Column({ type: 'integer', nullable: true })
  repeatCount?: number;
  
  endPosition?: { x: number; y: number };
}
