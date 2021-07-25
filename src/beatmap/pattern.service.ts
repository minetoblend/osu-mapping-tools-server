import { Injectable } from '@nestjs/common';
import { Pattern } from './pattern.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from "mongodb";

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
      .skip(offset)
      .limit(limit)
      .exec();
  }
}
