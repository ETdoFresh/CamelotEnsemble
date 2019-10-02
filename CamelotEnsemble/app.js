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
var actions = loversAndRivals.populateActionLists(storedVolitions, cast);

// Handle Camelot/Ensemble Actions
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

var actionResult = "";
var showedDragNotification = false;
rl.on('line', (input) => {
    if (input === 'input Selected Start') {
        startAction('SetCameraFocus(You)');
        setTimeout(function () {
            startAction('SetLeft(You)');
            startAction('ShowDialog()');
            startAction('SetDialog(Welcome to Lovers and Rivals!)');
            startAction('SetDialog(Select actions to win the heart of your love![SOCIAL_STATE|Lets get started!])');
        }, 1000);
    }
    else if (input === 'input Selected SOCIAL_STATE') {
        startAction('HideDialog()');

        startAction('SetLeft(You)');
        startAction('SetRight(Lover)');
        startAction('ShowDialog()');

        if (actionResult !== "")
            startAction('SetDialog(' + actionResult + ')');

        startAction('SetDialog(Social State)');

        if (!showedDragNotification) {
            startAction('SetDialog(Note: Drag to scroll this dialog box)');
            showedDragNotification = true;
        }

        startAction('SetDialog(Closeness)');
        startAction('SetDialog( * Hero to Lover: ' + loversAndRivals.stateInformation.heroToLoveCloseness + ')');
        startAction('SetDialog( * Lover to Hero: ' + loversAndRivals.stateInformation.loveToHeroCloseness + ')');
        startAction('SetDialog( * Lover to Rival: ' + loversAndRivals.stateInformation.loveToRivalCloseness + ')');
        startAction('SetDialog(Attraction)');
        startAction('SetDialog( * Hero to Lover: ' + loversAndRivals.stateInformation.heroToLoveAttraction + ')');
        startAction('SetDialog( * Lover to Hero: ' + loversAndRivals.stateInformation.loveToHeroAttraction + ')');
        startAction('SetDialog( * Lover to Rival: ' + loversAndRivals.stateInformation.loveToRivalAttraction + ')');
        startAction('SetDialog(Hero Attribute)s');
        startAction('SetDialog( * Strength: ' + loversAndRivals.stateInformation.heroStrength + ')');
        startAction('SetDialog( * Intelligence: ' + loversAndRivals.stateInformation.heroIntelligence + ')');

        startAction('SetDialog([ACTION_SELECTION|Got it!])');
    }
    else if (input === 'input Selected ACTION_SELECTION') {
        startAction('HideDialog()');
        setTimeout(function () {
            startAction('SetLeft(Lover)');
            startAction('SetRight(Rival)');
            startAction('ShowDialog()');
            startAction('SetDialog(Turn -- ' + loversAndRivals.gameVariables.turnNumber + ' --)');

            var actionCategories = ['Towards Love', 'Towards Hero']
            for (var i = 0; i < actionCategories.length; i++) {
                var label = actionCategories[i].replace('Hero', 'Yourself');
                var actionTags = '';
                for (var j = 0; j < actions[actionCategories[i]].length; j++) {
                    actionTags += ' [PERFORM_ACTION_' + actionCategories[i] + '_' + j + '|' + actions[actionCategories[i]][j].displayName +']';
                }
                startAction('SetDialog(' + label + ':' + actionTags + ')');
            }
        }, 1000);
    }
    else if (input.startsWith('input Selected PERFORM_ACTION_')) {
        var actionCategory = input.split('_')[2];
        var actionIndex = input.split('_')[3];
        var action = actions[actionCategory][actionIndex];

        //CHANGE THE SOCIAL STATE -- social physics baby!!!
        var effects = action.effects;
        for (var i = 0; i < effects.length; i += 1) {
            ensemble.set(effects[i]);
        }

        //RUN SOME TRIGGER RULES based on the new state!
        ensemble.runTriggerRules(cast);

        //Print out if the action was 'accepted' or rejected!
        var acceptMessage = action.displayName + " successful!";
        if (action.isAccept !== undefined && action.isAccept === false) {
            acceptMessage = action.displayName + " failed!";
        }

        //Re-draw the people (maybe even by having them MOVE to their new positions...)
        //Also re-draw any debug/state informaton we want.
        loversAndRivals.updateLocalStateInformation();
        //loversAndRivals.displayStateInformation();
        //loversAndRivals.moveAllCharacters();

        //set up next turn.
        //var event = document.createEvent('Event');
        //event.initEvent('nextTurn', true, true);
        //document.dispatchEvent(event);

        startAction('HideDialog()');

        startAction('SetLeft(You)');
        startAction('SetRight(Lover)');
        startAction('ShowDialog()');

        if (actionResult !== "")
            startAction('SetDialog(' + actionResult + ')');

        startAction('SetDialog(Social State)');

        if (!showedDragNotification) {
            startAction('SetDialog(Note: Drag to scroll this dialog box)');
            showedDragNotification = true;
        }

        startAction('SetDialog(Closeness)');
        startAction('SetDialog( * Hero to Lover: ' + loversAndRivals.stateInformation.heroToLoveCloseness + ')');
        startAction('SetDialog( * Lover to Hero: ' + loversAndRivals.stateInformation.loveToHeroCloseness + ')');
        startAction('SetDialog( * Lover to Rival: ' + loversAndRivals.stateInformation.loveToRivalCloseness + ')');
        startAction('SetDialog(Attraction)');
        startAction('SetDialog( * Hero to Lover: ' + loversAndRivals.stateInformation.heroToLoveAttraction + ')');
        startAction('SetDialog( * Lover to Hero: ' + loversAndRivals.stateInformation.loveToHeroAttraction + ')');
        startAction('SetDialog( * Lover to Rival: ' + loversAndRivals.stateInformation.loveToRivalAttraction + ')');
        startAction('SetDialog(Hero Attribute)s');
        startAction('SetDialog( * Strength: ' + loversAndRivals.stateInformation.heroStrength + ')');
        startAction('SetDialog( * Intelligence: ' + loversAndRivals.stateInformation.heroIntelligence + ')');

        startAction('SetDialog([ACTION_SELECTION|Got it!])');
    }
    else if (input === 'input Selected EXIT') {
        startAction('Quit()');
        process.exit();
    }
    else if (input === 'exit') {
        process.exit();
    }
});