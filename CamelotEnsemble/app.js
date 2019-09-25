'use strict';

console.log('CreatePlace(BobsHouse, Coottage)');
console.log('CreateCharacter(Bob, M, 25)');
console.log('CreateClothing(Bob, Peasant)');
console.log('SetPosition(Bob, BobsHouse.Door)');
console.log('start Game');

console.log('Press any key to exit');
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', process.exit.bind(process, 0));