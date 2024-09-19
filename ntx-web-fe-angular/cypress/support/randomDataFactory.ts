export const makeRandomMovieTitle = () => 'T' + Math.random().toString(36).substring(2, 15).toUpperCase();
export const makeRandomMovieSummary = () => 'S' + Math.random().toString(36).substring(2, 15).toUpperCase();
export const makeRandomMovieRuntime = () => Math.floor(Math.random() * 1000);

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
