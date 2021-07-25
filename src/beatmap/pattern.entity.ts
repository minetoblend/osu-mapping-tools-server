import { Beatmap } from './beatmap';
import { HitObject } from './hitobject';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PatternDocument = Pattern & Document;

@Schema({ collection: 'pattern' })
export class Pattern {
  @Prop()
  startTime: number;

  @Prop()
  endTime: number;

  @Prop()
  duration: number;

  @Prop(Beatmap)
  beatmap: Beatmap;

  @Prop([HitObject])
  hitObjects: HitObject[];

  @Prop()
  rhythm: string;

  @Prop()
  random: number;

  @Prop()
  bpm: number;

  calculateRhythm(): string {
    let rhythmString = '';

    let lastHitObject: HitObject | null = null;
    for (let i = 0; i < this.hitObjects.length; i++) {
      const hitObject = this.hitObjects[i];

      if (lastHitObject) {
        const breakTime = Math.round(
          (hitObject.startBeat - lastHitObject.endBeat) * 48,
        );

        rhythmString += '_' + breakTime + '_';
      }

      if (hitObject.type === 'slider') {
        rhythmString += 'S' + Math.round(hitObject.beatDuration * 48);
        if (hitObject.repeatCount > 0) {
          rhythmString += `:${hitObject.repeatCount}`;
        }
      } else if (hitObject.type === 'circle') {
        rhythmString += 'C';
      }

      lastHitObject = hitObject;
    }

    this.rhythm = rhythmString;
    return rhythmString;
  }
}

export const PatternSchema = SchemaFactory.createForClass(Pattern);
