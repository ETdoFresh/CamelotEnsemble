'use strict';

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

console.log('start CreatePlace(BobsHouse, Cottage)');
console.log('start CreateCharacter(Bob, M, 25)');
console.log('start ChangeClothing(Bob, Peasant)');
console.log('start SetPosition(Bob, BobsHouse.Door)');
console.log('start Game');

rl.on('line', (input) => {
    if (input == 'input Selected Start') {
        console.log('start SetCameraFocus(Bob)');
        console.log('start EnableInput()');
    }
    else if (input == 'exit') {
        process.exit();
    }
});