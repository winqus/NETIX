import { faker } from '@faker-js/faker';

export const makeRandomMovieTitle = () => 'T_' + faker.number.int();
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

// example
// export const randomBuildingCode = () => 'b' + Math.random().toString(36).substring(2, 6).toUpperCase();
// export const randomFloorNumber = () => Math.floor(Math.random() * 1000);
// export const randomRoomName = () => 'room' + Math.random().toString(36).substring(2, 6).toUpperCase();
// export const randomName = () => 'name' + Math.random().toString(36).substring(2, 15).toUpperCase();
// export const randomSerialNumber = () => 'serial' + Math.random().toString(36).substring(2, 20).toUpperCase();
// export const randomEmail = () => 'email' + Math.random().toString(36).substring(2, 20) + '@isep.ipp.pt';
// export const randomRobotTypeName = () => 'type' + Math.random().toString(36).substring(2, 6).toUpperCase();
// export const randomRobotTypeBrand = () => 'brand' + Math.random().toString(36).substring(2, 6).toUpperCase();
// export const randomRobotTypeModel = () => 'model' + Math.random().toString(36).substring(2, 6).toUpperCase();
// export const randomRobotCode = () => 'c' + Math.random().toString(36).substring(2, 6).toUpperCase();
// export const randomRobotNickname = () => 'r' + Math.random().toString(36).substring(2, 6).toUpperCase();
// export const randomRobotSerialNumber = () => 's' + Math.random().toString(36).substring(2, 10).toUpperCase();
