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
var actionResult = "";
var assignedReadMind = false;
var showingStatsAllowed = false;

// Camelot Initial State:
var setupInitialState = function () {
    startAction('CreatePlace(LoversLibrary, Library)');
    startAction('CreateCharacter(You, M, 25)');
    startAction('ChangeClothing(You, Peasant)');
    startAction('SetPosition(You, LoversLibrary.Door)');

    startAction('CreateCharacter(Lover, F, 25)');
    startAction('SetPosition(Lover, LoversLibrary.Bookcase)');
    startAction('ChangeClothing(Lover, Noble)');
    startAction('SetHairStyle(Lover, Ponytail)');

    startAction('CreateCharacter(Rival, M, 25)');
    startAction('SetPosition(Rival, LoversLibrary.Bookcase3)');
    startAction('ChangeClothing(Rival, Noble)');
    startAction('SetHairStyle(Rival, Short)');

    startAction('Game');

    startAction('EnableIcon(SHOW_SECRET, Pen, LoversLibrary.Door, Secret, true)')
}

var showSecret = function () {
    startAction('ShowDialog()');
    startAction('SetDialog(Psst....)');
    startAction('SetDialog(Here is a secret!)');
    startAction('SetDialog(Press the (E) key to see your social stats![HIDE_SECRET|Cool Thanks!])');
}

var hideDialogs = function () {
    showingStatsAllowed = true;
    startAction('HideDialog()');
    startAction('HideNarration()');
}

var reset = function () {
    hideDialogs();
    startAction('DisableIcon(StudyWriting, LoversLibrary.SpellBook)');
    startAction('DisableIcon(StudyLove, LoversLibrary.SpellBook)');
    startAction('DisableIcon(PracticeSpellsSuccess, LoversLibrary.Cauldron)');
    startAction('DisableIcon(PracticeSpellsFail, LoversLibrary.Cauldron)');
    startAction('DisableIcon(StudySpells, LoversLibrary.SpellBook)');
    startAction('DisableIcon(KissSuccess, Lover)');
    startAction('DisableIcon(KissFail, Lover)');
    startAction('DisableIcon(WriteLoveNoteAccept, LoversLibrary.AlchemistTable)');
    startAction('DisableIcon(WriteLoveNoteReject, LoversLibrary.AlchemistTable)');
};

var showIntroduction = function () {
    reset();
    startAction('SetCameraFocus(You)');
    startAction('SetLeft(You)');
    startAction('ShowDialog()');
    startAction('SetDialog(Welcome to Lovers and Rivals!)');
    startAction('SetDialog(Select actions to win the heart of your love![WALK_UP_STAIRS|Lets get started!])');
};

var walkUpStairs = function () {
    reset();
    startAction('WalkTo(You, LoversLibrary.Bookcase5)');
    startAction('DisableInput()');
}

var enableIcons = function () {
    var actionCategories = ['Towards Love', 'Towards Hero']
    for (var i = 0; i < actionCategories.length; i++) {
        for (var j = 0; j < actions[actionCategories[i]].length; j++) {
            var actionCategory = actionCategories[i];
            var actionIndex = j;
            var action = actions[actionCategory][actionIndex];
            var actionId = actionCategory + '_' + actionIndex + '_';

            switch (action.name) {
                case 'studyMath':
                    startAction('EnableIcon(PERFORM_ACTION_' + actionId + ', Pen, LoversLibrary.SpellBook, Study Writing, false)');
                    break;
                case 'studyAnatomy':
                    startAction('EnableIcon(PERFORM_ACTION_' + actionId + ', Pen, LoversLibrary.SpellBook, Study the Secrets of Love, false)');
                    break;
                case 'weightLiftSuccess':
                    startAction('EnableIcon(PERFORM_ACTION_' + actionId + ', Pen, LoversLibrary.Cauldron, Practice Spells, false)');
                    break;
                case 'weightLiftFail':
                    startAction('EnableIcon(PERFORM_ACTION_' + actionId + ', Pen, LoversLibrary.Cauldron, Practice Spells, false)');
                    break;
                case 'pushup1':
                    startAction('EnableIcon(PERFORM_ACTION_' + actionId + ', Pen, LoversLibrary.SpellBook, Study Spells, false)');
                    break;
                case 'kissSuccess':
                    startAction('EnableIcon(PERFORM_ACTION_' + actionId + ', Pen, Lover, Kiss, false)');
                    break;
                case 'kissFail':
                    startAction('EnableIcon(PERFORM_ACTION_' + actionId + ', Pen, Lover, Kiss, false)');
                    break;
                case 'writeLoveNoteAccept':
                    startAction('EnableIcon(PERFORM_ACTION_' + actionId + ', Pen, LoversLibrary.AlchemistTable, Write Love Note, false)');
                    break;
                case 'writeLoveNoteReject':
                    startAction('EnableIcon(PERFORM_ACTION_' + actionId + ', Pen, LoversLibrary.AlchemistTable, Write Love Note, false)');
                    break;
            }
        }
    }
    if (!assignedReadMind) {
        startAction('EnableIcon(READ_MIND, Pen, Lover, Read Mind, false)');
    }
}

var resumeGame = function () {
    reset();
    enableIcons();
    startAction('EnableInput()');
    showingStatsAllowed = true;
}

var showFailEffect = function () {
    //startAction('CreateEffect(You, heartbroken, 3)'); // Not working right now
    startAction('CreateEffect(You, blackflame, 3)');
    resumeGame();
}

var showSucceedEffect = function () {
    //startAction('CreateEffect(You, heart, 3)'); // Not working right now
    startAction('CreateEffect(You, wildfire, 3)');
    resumeGame();
}

var readMind = function () {
    showingStatsAllowed = false;
    startAction('SetLeft(Lover)');
    startAction('ShowDialog()');
    startAction('SetDialog(Closeness)');
    startAction('SetDialog(What Lover thinks about Hero: ' + loversAndRivals.stateInformation.loveToHeroCloseness + ')');
    startAction('SetDialog(What Lover thinks about Rival: ' + loversAndRivals.stateInformation.loveToRivalCloseness + ')');
    startAction('SetDialog([Cancel|Got it!])');
}

var showStats = function () {
    showingStatsAllowed = false;
    startAction('SetLeft(You)');
    startAction('ShowDialog()');
    //startAction('SetDialog(Social State)');
    //startAction('SetDialog(Note: Drag to scroll this dialog box)');
    //startAction('');
    //startAction('SetDialog(Closeness)');
    //startAction('SetDialog( * Hero to Lover: ' + loversAndRivals.stateInformation.heroToLoveCloseness + ')');
    //startAction('SetDialog( * Lover to Hero: ' + loversAndRivals.stateInformation.loveToHeroCloseness + ')');
    //startAction('SetDialog( * Lover to Rival: ' + loversAndRivals.stateInformation.loveToRivalCloseness + ')');
    //startAction('SetDialog(Attraction)');
    //startAction('SetDialog( * Hero to Lover: ' + loversAndRivals.stateInformation.heroToLoveAttraction + ')');
    //startAction('SetDialog( * Lover to Hero: ' + loversAndRivals.stateInformation.loveToHeroAttraction + ')');
    //startAction('SetDialog( * Lover to Rival: ' + loversAndRivals.stateInformation.loveToRivalAttraction + ')');
    startAction('SetDialog( * Strength: ' + loversAndRivals.stateInformation.heroStrength + ')');
    startAction('SetDialog( * Intelligence: ' + loversAndRivals.stateInformation.heroIntelligence + ')');
    startAction('SetDialog(What Hero thinks about Lover: ' + loversAndRivals.stateInformation.heroToLoveCloseness + ')');
    startAction('SetDialog([Cancel|Got it!])');
};

var showActionSelection = function () {
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
                actionTags += ' [PERFORM_ACTION_' + actionCategories[i] + '_' + j + '|' + actions[actionCategories[i]][j].displayName + ']';
            }
            startAction('SetDialog(' + label + ':' + actionTags + ')');
        }
    }, 1000);
};

var showGameWin = function () {
    startAction('WalkTo(You, Lover)')
    startAction('DisableInput()');
}

var winYouAtLover = function () {
    startAction('Kneel(You)');
}

var showGameLose = function () {
    startAction('WalkTo(Lover, Rival)')
}

var loseLoverAtRival = function () {
    startAction('WalkTo(You, LoversLibrary.Chair)')
    startAction('DisableInput()');
}

var loseYouAtChair = function () {
    startAction('Kneel(Lover)');
}

var showEndingText = function () {
    startAction('HideDialog()');
    startAction('ShowNarration()');
    startAction('SetNarration(' + loversAndRivals.gameVariables.endingText + ')');
}

var performAction = function (input) {
    reset();
    startAction('DisableInput()');

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
    if (action.isAccept !== undefined && action.isAccept === false)
        showFailEffect();
    else
        showSucceedEffect();

    //set up next turn.
    loversAndRivals.updateLocalStateInformation();
    loversAndRivals.gameVariables.turnNumber += 1;
    loversAndRivals.checkForEndConditions();

    if (loversAndRivals.gameVariables.gameOver === true) {
        if (loversAndRivals.gameVariables.endingText.includes('Rival'))
            showGameLose();
        else
            showGameWin();
    }
    else {
        ensemble.setupNextTimeStep();
        storedVolitions = ensemble.calculateVolition(cast);
        actions = loversAndRivals.populateActionLists(storedVolitions, cast);
        resumeGame();

        if (action !== '') {
            startAction('ShowNarration()');
            startAction('SetNarration(' + action.displayName + ')');
        }
    }
}

var exit = function () {
    startAction('Quit()');
    process.exit();
}

// Get next possible actions
var storedVolitions = ensemble.calculateVolition(cast);
var actions = loversAndRivals.populateActionLists(storedVolitions, cast);

setupInitialState();

// Handle Camelot/Ensemble Actions
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.on('line', (input) => {
    if (input === 'input Selected Start') showIntroduction();
    else if (input === 'input Selected WALK_UP_STAIRS') walkUpStairs();
    else if (input === 'succeeded WalkTo(You, LoversLibrary.Bookcase5)') resumeGame();

    else if (input.startsWith('input PERFORM_ACTION_')) performAction(input);

    else if (input === 'input Selected SOCIAL_STATE') showSocialState();
    else if (input === 'input Selected ACTION_SELECTION') showActionSelection();
    else if (input.startsWith('input Selected PERFORM_ACTION_')) showPerformAction();

    else if (input === 'input Selected Cancel') hideDialogs();
    else if (input === 'input Key Cancel') hideDialogs();
    else if (input === 'input Key Interact' && showingStatsAllowed) showStats();
    else if (input === 'input Selected DONE_WITH_STATS') doneWithStats();
    else if (input === 'input READ_MIND Lover') readMind();
    else if (input === 'input SHOW_SECRET LoversLibrary.Door') showSecret();
    else if (input === 'input Selected HIDE_SECRET') hideDialogs();

    else if (loversAndRivals.gameVariables.gameOver) {
        if (input === 'succeeded WalkTo(You, Lover)') winYouAtLover();
        else if (input === 'succeeded WalkTo(Lover, Rival)') loseLoverAtRival();
        else if (input === 'succeeded WalkTo(You, LoversLibrary.Chair)') loseYouAtChair();
        else if (input === 'succeeded Kneel(Lover)') showEndingText();
        else if (input === 'succeeded Kneel(You)') showEndingText();
    }

    else if (input === 'input Selected EXIT') exit();
    else if (input === 'exit') exit();
});
