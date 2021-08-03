import { Injectable } from '@nestjs/common';
import { Pattern } from './pattern.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PatternService {
  constructor(
    @InjectModel(Pattern.name) private patternModel: Model<Pattern>,
  ) {}

  async search(
    rhythm: string,
    limit: number,
    offset: number,
    options: { [key: string]: any } = {},
  ): Promise<Pattern[]> {
    return this.patternModel
      .find({
        rhythm,
        ...options,
      })
      .collation({locale: 'en', strength: 1})
      .skip(offset)
      .limit(limit)
      .sort({
        random: 1
      })
      .exec();
  }
}
