import * as fs from 'fs';

import * as parser from 'osu-parser';

import { promisify } from 'util';
import { Beatmap } from '../beatmap/beatmap';
import { HitObject } from '../beatmap/hitobject';
import { Pattern, PatternSchema } from '../beatmap/pattern.entity';

const parseFile = promisify(parser.parseFile);

import * as mongoose from 'mongoose';
import { calculateStarRating } from "osu-sr-calculator";

let patternModel!: mongoose.Model<Pattern>;

async function importBeatmaps() {
  await mongoose.connect('mongodb://localhost/osu');

  patternModel = mongoose.model(Pattern.name, PatternSchema);

  if (!fs.existsSync('beatmaps')) {
    console.error(
      'realtive path ./beatmaps does not exist. Create folder and place beatmaps there.',
    );
    return;
  }
  fs.readdir('beatmaps', async (err, files) => {

    const N = 5;

    for (let k = 0; k < files.length; k+=N) {

      await Promise.all([...new Array(N).keys()].map(async (_, j) => {
        const i = k + j;

        if(!files[i])
          return;

        if (files[i].startsWith('imported_')) {
          await promisify(fs.rename)(
            `beatmaps/${files[i]}`,
            `beatmaps/${files[i].substr(9)}`,
          );
          files[i] = files[i].substr(9);
        }

        console.log(`Processing beatmap: ${files[i]}`);

        try {
          const parsedBeatmap = await parseFile(`beatmaps/${files[i]}`);
          console.log(
            `${parsedBeatmap.Title}[${parsedBeatmap.Version}] by ${parsedBeatmap.Creator}`,
          );
          importBeatmap(parsedBeatmap, files[i]).then();
        } catch (e) {
          console.error(e);
        }

      }))


    }
  });
}

function createCombos(hitObjects: any[]): any[][] {
  hitObjects = hitObjects.filter(
    (hitObject) =>
      hitObject.objectName === 'circle' || hitObject.objectName === 'slider',
  );
  const combos = [];
  let currentCombo = [];
  for (let i = 0; i < hitObjects.length; i++) {
    const hitObject = hitObjects[i];
    if (hitObject.newCombo && i > 0) {
      combos.push(currentCombo);
      currentCombo = [];
    }
    currentCombo.push(hitObject);
  }
  return combos;
}

function getTimingPointAt(time, beatmap) {
  let maxTime = Number.NEGATIVE_INFINITY;
  let maxTimingPoint = null;

  beatmap.timingPoints.forEach((timingPoint) => {
    if (timingPoint.offset <= time && timingPoint.offset > maxTime) {
      maxTime = timingPoint.offset;
      maxTimingPoint = timingPoint;
    }
  });

  return maxTimingPoint;
}

function getTimingPointsInRange(
  start: number,
  end: number,
  parsedBeatmap,
): any[] {
  return parsedBeatmap.timingPoints.filter(
    (timingPoint) => timingPoint.offset >= start && timingPoint.offset <= end,
  );
}

function createPattern(combo: any[], parsedBeatmap): Pattern | null {
  const timingPoint = getTimingPointAt(combo[0].startTime, parsedBeatmap);

  if (timingPoint == null || timingPoint.bpm === undefined) return null;

  const allTimingPoints = getTimingPointsInRange(
    combo[0].startTime,
    combo[combo.length - 1].startTime,
    parsedBeatmap,
  );

  //ignoring all patterns with variable bpm
  if (allTimingPoints.some((t) => t.bpm !== timingPoint.bpm)) {
    return null;
  }

  const pattern = new Pattern();

  pattern.hitObjects = combo.map((parsedHitObject) => {
    const hitObject = new HitObject();

    const patternOffset = parsedHitObject.startTime - combo[0].startTime;
    const startBeat =
      Math.round((patternOffset / timingPoint.beatLength) * 48) / 48;
    const durationBeat =
      Math.round(
        (((parsedHitObject.duration || 0)) /
          timingPoint.beatLength) *
          48,
      ) / 48;



    hitObject.x = parsedHitObject.position[0];
    hitObject.y = parsedHitObject.position[1];
    hitObject.type = parsedHitObject.objectName;

    hitObject.startTime = parsedHitObject.startTime - combo[0].startTime;
    hitObject.endTime =
      (parsedHitObject.endTime || parsedHitObject.startTime) -
      combo[0].startTime;
    hitObject.startBeat = startBeat;
    hitObject.endBeat = startBeat + durationBeat;
    hitObject.duration = parsedHitObject.duration || 0;
    hitObject.beatDuration = durationBeat;

    if (parsedHitObject.objectName === 'slider') {
      hitObject.points = parsedHitObject.points;
      hitObject.curveType = parsedHitObject.curveType;
      hitObject.pixelLength = parsedHitObject.pixelLength;
      hitObject.repeatCount = parsedHitObject.repeatCount;
      hitObject.endPosition = {
        x: parsedHitObject.endPosition[0] as number,
        y: parsedHitObject.endPosition[1] as number
      };
    }

    return hitObject;
  });

  pattern.startTime = combo[0].startTime;
  pattern.duration = pattern.hitObjects[pattern.hitObjects.length - 1].endTime;
  pattern.endTime = pattern.startTime + pattern.duration;
  pattern.bpm = timingPoint.bpm;
  pattern.random = Math.floor(Math.random() * 1000_000)
  pattern.calculateRhythm();

  return pattern;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
async function importBeatmap(parsedBeatmap, filename: string) {
  if (parsedBeatmap.Mode !== '0')
    //not an osu std map
    return;

  const beatmap = new Beatmap();

  beatmap.title = parsedBeatmap.Title;
  beatmap.artist = parsedBeatmap.Artist;
  beatmap.creator = parsedBeatmap.Creator;
  beatmap.difficulty = parsedBeatmap.Version;
  beatmap.filename = filename;

  beatmap.hp = parseFloat(parsedBeatmap.HPDrainRate);
  beatmap.cs = parseFloat(parsedBeatmap.CircleSize);
  beatmap.ar = parseFloat(parsedBeatmap.ApproachRate);
  beatmap.od = parseFloat(parsedBeatmap.OverallDifficulty);


  try {
    // @ts-ignore
    const { nomod } = await calculateStarRating('beatmaps/' + filename)
    beatmap.starRating = nomod
  } catch (e) {
    console.error(`Couldn't calculate star rating for ${beatmap.title} [${beatmap.difficulty}]`)
  }

  beatmap.stackLeniency = parseFloat(parsedBeatmap.StackLeniency)

  let patterns = createCombos(parsedBeatmap.hitObjects).map((combo) => {
    const pattern = createPattern(combo, parsedBeatmap);

    if (pattern) {
      pattern.beatmap = beatmap;
      return pattern;
    }
    return null;
  });

  patterns = patterns.filter((it) => it !== null);

    if (patterns.length > 0) await patternModel.insertMany(patterns);
  else console.error('no patterns found for map ' + beatmap.title);
}

importBeatmaps().then(() => {
  /* do nothing */
});
