import * as fs from 'fs';
import { createConnection, MongoRepository } from 'typeorm';

import * as parser from 'osu-parser';

import { promisify } from 'util';
import { Beatmap } from '../beatmap/beatmap';
import { HitObject } from '../beatmap/hitobject';
import { Pattern } from '../beatmap/pattern.entity';

const parseFile = promisify(parser.parseFile);

let patternRepository!: MongoRepository<Pattern>;

async function importBeatmaps() {
  const connection = await createConnection({
    type: 'mongodb',
    host: 'localhost',
    port: 27017,
    database: 'osu',
    synchronize: true,
    entities: [Pattern],
  });

  patternRepository = connection.getMongoRepository(Pattern);

  if (!fs.existsSync('beatmaps')) {
    console.error(
      'realtive path ./beatmaps does not exist. Create folder and place beatmaps there.',
    );
    return;
  }
  fs.readdir('beatmaps', async (err, files) => {
    for (let i = 0; i < files.length; i++) {
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
        importBeatmap(parsedBeatmap).then();
      } catch (e) {
        console.error(e);
      }
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
    const endBeat =
      Math.round(
        ((patternOffset + (parsedHitObject.duration || 0)) /
          timingPoint.beatLength) *
          48,
      ) / 48;

    hitObject.x = parsedHitObject.position[0];
    hitObject.y = parsedHitObject.position[0];
    hitObject.type = parsedHitObject.objectName;

    hitObject.startTime = parsedHitObject.startTime - combo[0].startTime;
    hitObject.endTime =
      (parsedHitObject.endTime || parsedHitObject.startTime) -
      combo[0].startTime;
    hitObject.startBeat = startBeat;
    hitObject.endBeat = endBeat;
    hitObject.duration = parsedHitObject.duration || 0;
    hitObject.beatDuration = endBeat - startBeat;

    if (parsedHitObject.objectName === 'slider') {
      hitObject.points = parsedHitObject.points;
      hitObject.curveType = parsedHitObject.curveType;
      hitObject.pixelLength = parsedHitObject.pixelLength;
      hitObject.repeatCount = parsedHitObject.repeatCount;
    }

    return hitObject;
  });

  pattern.startTime = combo[0].startTime;
  pattern.duration = pattern.hitObjects[pattern.hitObjects.length - 1].endTime;
  pattern.endTime = pattern.startTime + pattern.duration;

  pattern.calculateRhythm();

  return pattern;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
async function importBeatmap(parsedBeatmap) {
  const beatmap = new Beatmap();

  beatmap.title = parsedBeatmap.Title;
  beatmap.artist = parsedBeatmap.Artist;
  beatmap.creator = parsedBeatmap.Creator;
  beatmap.difficulty = parsedBeatmap.Version;

  //await beatmapRepository.insert(beatmap);

  let patterns = createCombos(parsedBeatmap.hitObjects).map((combo) => {
    const pattern = createPattern(combo, parsedBeatmap);

    if (pattern) {
      //pattern.beatmap = beatmap;
      return pattern;
    }
    return null;
  });

  patterns = patterns.filter((it) => it !== null);

  if (patterns.length > 0) await patternRepository.insertMany(patterns);
  else console.error('no patterns found for map ' + beatmap.title);
}

importBeatmaps().then(() => {
  /* do nothing */
});
