'use strict';

function startAction(message) { console.log('start ' + message); }
function stopAction(message) { console.log('stop ' + message); }

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

//Set up Ensemble initial state
const loversAndRivals = require('./LoversAndRivals');
loversAndRivals.setUpLoversAndRivalsInitialState();

// Camelot Initial State:
startAction('CreatePlace(YeOldeTavern, Tavern)');
startAction('CreateCharacter(You, M, 25)');
startAction('ChangeClothing(You, Peasant)');
startAction('SetPosition(You, YeOldeTavern.Bar.Behind)');

startAction('CreateCharacter(Lover, F, 25)');
startAction('SetPosition(Lover, YeOldeTavern.StoolFrontRight)');
startAction('ChangeClothing(Lover, Noble)');
startAction('SetHairStyle(Lover, Ponytail)');

startAction('CreateCharacter(Rival, M, 25)');
startAction('SetPosition(Rival, YeOldeTavern.Chair)');
startAction('ChangeClothing(Rival, Noble)');
startAction('SetHairStyle(Rival, Short)');

startAction('Game');



// Get next possible actions
var storedVolitions = ensemble.calculateVolition(cast);
loversAndRivals.populateActionLists(storedVolitions, cast);

// Handle Camelot Actions
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.on('line', (input) => {
    if (input === 'input Selected Start') {
        startAction('SetCameraFocus(You)');
        setTimeout(function () {
            startAction('SetLeft(You)');
            startAction('ShowDialog()');
            startAction('SetDialog(Welcome to Lovers and Rivals!)');
            startAction('SetDialog(Select actions to win the heart of your love![D0_START|Lets get started!])');
        }, 1000);
    }
    else if (input === 'input Selected D0_START') {
        startAction('HideDialog()');
        startAction('ShowDialog()');
        startAction('SetDialog(Social State)');
        startAction('SetDialog(Note: Drag to scroll this dialog box)');
        startAction('SetDialog(Closeness)');
        startAction('SetDialog( * Hero to Lover: 0)');
        startAction('SetDialog( * Lover to Hero: 0)');
        startAction('SetDialog( * Lover to Rival: 0)');
        startAction('SetDialog(Attraction)');
        startAction('SetDialog( * Hero to Lover: 0)');
        startAction('SetDialog( * Lover to Hero: 0)');
        startAction('SetDialog( * Lover to Rival: 0)');
        startAction('SetDialog(Hero Attribute)s');
        startAction('SetDialog( * Strength: 0)');
        startAction('SetDialog( * Intelligence: 5)');
        startAction('SetDialog([D0_OK|Got it!])');
    }
    else if (input === 'input Selected D0_OK') {
        startAction('HideDialog()');
        setTimeout(function () {
            startAction('SetLeft(Lover)');
            startAction('SetRight(Rival)');
            startAction('ShowDialog()');
            startAction('SetDialog(Turn -- 0 --)');
            startAction('SetDialog(Towards Lover:[D1_WRITE|Write Love Node <REJECT>] [D1_KISS|Kiss <FAIL>])');
            startAction('SetDialog(Towards Yourself:[D1_STUDY|Study Math] [D1_WEIGHT|Weight Lift <FAIL>] [D1_PUSHUPS|Do Pushups])');
        }, 1000);
    }
    else if (input === 'input Selected D1_WRITE') {
        startAction('HideDialog()');
        startAction('WalkTo(Lover, YeOldeTavern.StoolFrontLeft)');
        setTimeout(function () {
            startAction('ShowDialog()');
            startAction('SetDialog(Write Love Note failed!)');
            startAction('SetDialog(Social State)');
            startAction('SetDialog(Note: Drag to scroll this dialog box)');
            startAction('SetDialog(Closeness)');
            startAction('SetDialog( * Hero to Lover: 10)');
            startAction('SetDialog( * Lover to Hero: 0)');
            startAction('SetDialog( * Lover to Rival: 10)');
            startAction('SetDialog(Attraction)');
            startAction('SetDialog( * Hero to Lover: 0)');
            startAction('SetDialog( * Lover to Hero: 0)');
            startAction('SetDialog( * Lover to Rival: 0)');
            startAction('SetDialog(Hero Attribute)s');
            startAction('SetDialog( * Strength: 0)');
            startAction('SetDialog( * Intelligence: 5)');
            startAction('SetDialog([D1_OK|Got it!])');
        }, 1000);
    }
    else if (input === 'input Selected D1_OK') {
        startAction('HideDialog()');
        setTimeout(function () {
            startAction('SetLeft(Lover)');
            startAction('SetRight(Rival)');
            startAction('ShowDialog()');
            startAction('SetDialog(Turn -- 1 --)');
            startAction('SetDialog(Towards Lover:[D2_WRITE|Write Love Node <REJECT>] [D2_KISS|Kiss <FAIL>])');
            startAction('SetDialog(Towards Yourself:[D2_STUDY|Study Math] [D2_WEIGHT|Weight Lift <FAIL>] [D2_PUSHUPS|Do Pushups])');
        }, 1000);
    }
    else if (input === 'input Selected D2_WRITE') {
        startAction('HideDialog()');
        startAction('WalkTo(Lover, Rival)');
        setTimeout(function () {
            startAction('ShowDialog()');
            startAction('SetDialog(Write Love Note failed!)');
            startAction('SetDialog(Social State)');
            startAction('SetDialog(Note: Drag to scroll this dialog box)');
            startAction('SetDialog(Closeness)');
            startAction('SetDialog( * Hero to Lover: 20)');
            startAction('SetDialog( * Lover to Hero: 0)');
            startAction('SetDialog( * Lover to Rival: 20)');
            startAction('SetDialog(Attraction)');
            startAction('SetDialog( * Hero to Lover: 0)');
            startAction('SetDialog( * Lover to Hero: 0)');
            startAction('SetDialog( * Lover to Rival: 0)');
            startAction('SetDialog(Hero Attribute)s');
            startAction('SetDialog( * Strength: 0)');
            startAction('SetDialog( * Intelligence: 5)');
            startAction('SetDialog([EXIT|Quit Game])');
        }, 3000);
    }
    else if (input === 'input Selected EXIT') {
        startAction('Quit()');
        process.exit();
    }
    else if (input === 'exit') {
        process.exit();
    }
});