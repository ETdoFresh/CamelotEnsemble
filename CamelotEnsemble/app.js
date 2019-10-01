'use strict';

//Init ensemble
const ensemble = require('./Ensemble/ensemblejs/js/ensemble/ensemble');
var loadResult = ensemble.init();

//Load in our schema, cast, triggerRules and volitionRules, and actions.
var rawSchema = ensemble.loadFile('./Ensemble/ensemblejs/sampleGame/data/schema.json');
var schema = ensemble.loadSocialStructure(rawSchema);

var rawCast = ensemble.loadFile('./Ensemble/ensemblejs/sampleGame/data/cast.json');
var cast = ensemble.addCharacters(rawCast);

//console.log("Here is our cast! ", cast);

var rawTriggerRules = ensemble.loadFile('./Ensemble/ensemblejs/sampleGame/data/triggerRules.json');
var triggerRules = ensemble.addRules(rawTriggerRules);

var rawVolitionRules = ensemble.loadFile('./Ensemble/ensemblejs/sampleGame/data/volitionRules.json');
var volitionRules = ensemble.addRules(rawVolitionRules);

var rawActions = ensemble.loadFile('./Ensemble/ensemblejs/sampleGame/data/actions.json');
var actions = ensemble.addActions(rawActions);

var rawHistory = ensemble.loadFile('./Ensemble/ensemblejs/sampleGame/data/history.json');
var history = ensemble.addHistory(rawHistory);

//ensemble.dumpSocialRecord();

//Set up our initial state
const loversAndRivals = require('./LoversAndRivals');
loversAndRivals.setUpLoversAndRivalsInitialState();
//loversAndRivals.setupCharacterPositions(500);

// Camelot Initial State:
console.log('start CreatePlace(YeOldeTavern, Tavern)');
console.log('start CreateCharacter(You, M, 25)');
console.log('start ChangeClothing(You, Peasant)');
console.log('start SetPosition(You, YeOldeTavern.Bar.Behind)');

console.log('start CreateCharacter(Love, F, 25)');
console.log('start SetPosition(Love, YeOldeTavern.StoolFrontRight)');
console.log('start ChangeClothing(Love, Noble)');
console.log('start SetHairStyle(Love, Ponytail)');

console.log('start CreateCharacter(Rival, M, 25)');
console.log('start SetPosition(Rival, YeOldeTavern.Chair)');
console.log('start ChangeClothing(Rival, Noble)');
console.log('start SetHairStyle(Rival, Short)');

console.log('start Game');

// Camelot States and such....
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.on('line', (input) => {
    if (input === 'input Selected Start') {
        console.log('start SetCameraFocus(You)');
        //console.log('start SetCameraMode(follow)');
        //console.log('start EnableInput()');
    }
    else if (input === 'exit') {
        process.exit();
    }
});