import { calculateStarRating } from 'osu-sr-calculator';

async function main() {
  // @ts-ignorec
  const { nomod } = await calculateStarRating('beatmaps/1919312.osu')
}

main().then()