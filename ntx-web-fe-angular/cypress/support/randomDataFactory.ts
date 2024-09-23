import { faker } from '@faker-js/faker';

export const makeRandomMovieTitle = () => faker.commerce.productDescription();
export const makeLongRandomMovieTitle = () => 'T_' + faker.string.alpha({ length: 200 });
export const makeRandomMovieSummary = () => faker.lorem.sentences(2);
export const makeRandomMovieReleaseDate = () => {
  const date = faker.date.anytime();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
export const makeRandomMovieRuntime = () => faker.number.int({ min: 1, max: 12000 });
