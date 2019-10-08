'use strict';

//Init ensemble
const ensemble = require('./Ensemble/ensemblejs/js/ensemble/ensemble');
var loadResult = ensemble.init();

//Load in our schema, cast, triggerRules and volitionRules, and actions.
var rawSchema = ensemble.loadFile('./Ensemble/ensemblejs/sampleGame/data/schema.json');
var schema = ensemble.loadSocialStructure(rawSchema);

var rawCast = ensemble.loadFile('./Ensemble/ensemblejs/sampleGame/data/cast.json');
var cast = ensemble.addCharacters(rawCast);

var rawTriggerRules = ensemble.loadFile('./Ensemble/ensemblejs/sampleGame/data/triggerRules.json');
var triggerRules = ensemble.addRules(rawTriggerRules);

var rawVolitionRules = ensemble.loadFile('./Ensemble/ensemblejs/sampleGame/data/volitionRules.json');
var volitionRules = ensemble.addRules(rawVolitionRules);

var rawActions = ensemble.loadFile('./Ensemble/ensemblejs/sampleGame/data/actions.json');
var actions = ensemble.addActions(rawActions);

var rawHistory = ensemble.loadFile('./Ensemble/ensemblejs/sampleGame/data/history.json');
var history = ensemble.addHistory(rawHistory);

//Set up Ensemble initial state
const loversAndRivals = require('./LoversAndRivals');
loversAndRivals.setUpLoversAndRivalsInitialState();

const CamelotActionMap = require('./CamelotActionMap');
CamelotActionMap.createWorld();

// Handle Camelot/Ensemble Actions
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.on('line', (input) => {
    CamelotActionMap.processInput(input);
});
