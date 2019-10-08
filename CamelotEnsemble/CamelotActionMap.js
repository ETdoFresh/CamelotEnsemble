const ensemble = require('./Ensemble/ensemblejs/js/ensemble/ensemble');
const loversAndRivals = require('./LoversAndRivals');

var currentActions = {};
var cast;
var storedVolitions;
var actions;
var actionTime = 5 * 1000; // milliseconds before AI performs actions.
var actionTimer = undefined;
var assignedReadMind = false;
var actionResult = "";
var showingStatsAllowed = false;
var lastNpcCastIndex = 0;

var start = function (command) {
    console.log('start ' + command);
};

var waitFor = function (initiator, actionList) {
    if (currentActions[initiator] === undefined)
        currentActions[initiator] = actionList;
    else
        for (var i in actionList)
            currentActions[initiator].push(actionList[i]);
}

var processInput = function (input) {
    for (var character in currentActions) {
        if (currentActions[character] !== undefined)
            if (currentActions[character][0][0] === input) {
                var callback = currentActions[character][0][1];
                currentActions[character].shift();
                if (currentActions[character].length == 0)
                    currentActions[character] = undefined;
                callback();
            }
    }

    if (currentActions['hero'] !== undefined)
        return;

    if (input.startsWith('input PERFORM_ACTION_'))
        playerTakeAction(getAction(input));
    else if (input === 'input Key Interact') {
        showStats();
        waitFor('hero', [['input Selected Cancel', hideDialogs],]);
    }
    else if (input === 'input READ_MIND Lover') {
        readMind();
        waitFor('hero', [['input Selected Cancel', hideDialogs],]);
    }
    else if (input === 'input SHOW_SECRET LoversLibrary.Door') {
        showSecret();
        waitFor('hero', [['input Selected Cancel', hideDialogs],]);
    }

    else if (loversAndRivals.gameVariables.gameOver) {
        if (input === 'succeeded WalkTo(You, Lover)') {
            start('Kneel(You)');
            waitFor('hero', [
                ['succeeded Kneel(You)', showEndingText],
                ['input Key Cancel', exit]
            ]);
        }
        else if (input === 'succeeded WalkTo(Lover, Rival)') {
            start('WalkTo(You, LoversLibrary.Chair)')
            start('DisableInput()');
            waitFor('hero', [
                ['succeeded WalkTo(You, LoversLibrary.Chair)', function () { start('Kneel(Lover)'); }],
                ['succeeded Kneel(Lover)', showEndingText],
                ['input Key Cancel', exit]
            ]);
        }
    }
}

var createWorld = function () {
    start('CreatePlace(LoversLibrary, Library)');
    start('CreateCharacter(You, M, 25)');
    start('ChangeClothing(You, Peasant)');
    start('SetPosition(You, LoversLibrary.Door)');

    start('CreateCharacter(Lover, F, 25)');
    start('SetPosition(Lover, LoversLibrary.Bookcase)');
    start('ChangeClothing(Lover, Noble)');
    start('SetHairStyle(Lover, Ponytail)');

    start('CreateCharacter(Rival, M, 25)');
    start('SetPosition(Rival, LoversLibrary.Bookcase3)');
    start('ChangeClothing(Rival, Noble)');
    start('SetHairStyle(Rival, Short)');

    start('EnableIcon(SHOW_SECRET, Pen, LoversLibrary.Door, Secret, true)');

    start('Game');

    waitFor('hero',
        [
            ['input Selected Start', showIntroduction],
            ['input Selected WALK_UP_STAIRS', walkUpStairs],
            ['succeeded WalkTo(You, LoversLibrary.Bookcase5)', startGame],
        ]
    );
}

var startGame = function () {
    cast = ensemble.getCharacters();
    storedVolitions = ensemble.calculateVolition(cast);
    actions = loversAndRivals.populateActionLists(storedVolitions, cast);

    reset();
    enableIcons();
    start('EnableInput()');
    startNpcActionTimer();
}

var resumeGame = function () {
    reset();
    enableIcons();
    start('EnableInput()');
    showingStatsAllowed = true;
}

var getAction = function (input) {
    var actionCategory = input.split('_')[3];
    var actionIndex = input.split('_')[4];
    return actions[actionCategory][actionIndex];
}

var getInitiator = function (input) {
    var initiator = input.split('_')[3];
    return initiator;
}

var enableIcons = function () {
    var actionCategories = ['Towards Love', 'Towards Hero']
    for (var i = 0; i < actionCategories.length; i++) {
        for (var j = 0; j < actions[actionCategories[i]].length; j++) {
            var initiator = 'You';
            var actionCategory = actionCategories[i];
            var actionIndex = j;
            var action = actions[actionCategory][actionIndex];
            var actionId = initiator + '_' + actionCategory + '_' + actionIndex + '_';

            switch (action.name) {
                case 'studyMath':
                    start('EnableIcon(PERFORM_ACTION_' + actionId + ', Pen, LoversLibrary.SpellBook, Study Writing, false)');
                    break;
                case 'studyAnatomy':
                    start('EnableIcon(PERFORM_ACTION_' + actionId + ', Pen, LoversLibrary.SpellBook, Study the Secrets of Love, false)');
                    break;
                case 'weightLiftSuccess':
                    start('EnableIcon(PERFORM_ACTION_' + actionId + ', Pen, LoversLibrary.Cauldron, Practice Spells, false)');
                    break;
                case 'weightLiftFail':
                    start('EnableIcon(PERFORM_ACTION_' + actionId + ', Pen, LoversLibrary.Cauldron, Practice Spells, false)');
                    break;
                case 'pushup1':
                    start('EnableIcon(PERFORM_ACTION_' + actionId + ', Pen, LoversLibrary.SpellBook, Study Spells, false)');
                    break;
                case 'kissSuccess':
                    start('EnableIcon(PERFORM_ACTION_' + actionId + ', Pen, Lover, Kiss, false)');
                    break;
                case 'kissFail':
                    start('EnableIcon(PERFORM_ACTION_' + actionId + ', Pen, Lover, Kiss, false)');
                    break;
                case 'writeLoveNoteAccept':
                    start('EnableIcon(PERFORM_ACTION_' + actionId + ', Pen, LoversLibrary.AlchemistTable, Write Love Note, false)');
                    break;
                case 'writeLoveNoteReject':
                    start('EnableIcon(PERFORM_ACTION_' + actionId + ', Pen, LoversLibrary.AlchemistTable, Write Love Note, false)');
                    break;
            }
        }
    }
    if (!assignedReadMind) {
        start('EnableIcon(READ_MIND, Pen, Lover, Read Mind, false)');
        assignedReadMind = true;
    }
}

var showFailEffect = function (initiator) {
    initiator = initiator === undefined ? 'You' : initiator;
    initiator = initiator === 'love' ? 'Lover' : initiator;
    initiator = initiator === 'rival' ? 'Rival' : initiator;
    //start('CreateEffect(You, heartbroken, 3)'); // Not working right now
    start('CreateEffect(' + initiator + ', blackflame, 3)');
}

var showSucceedEffect = function (initiator) {
    initiator = initiator === undefined ? 'You' : initiator;
    initiator = initiator === 'love' ? 'Lover' : initiator;
    initiator = initiator === 'rival' ? 'Rival' : initiator;
    //start('CreateEffect(You, heart, 3)'); // Not working right now
    start('CreateEffect(' + initiator + ', wildfire, 3)');
}

var takeAction = function (initiator, action) {
    //CHANGE THE SOCIAL STATE -- social physics baby!!!
    var effects = action.effects;
    for (var i = 0; i < effects.length; i += 1) {
        ensemble.set(effects[i]);
    }

    //RUN SOME TRIGGER RULES based on the new state!
    ensemble.runTriggerRules(cast);

    //Print out if the action was 'accepted' or rejected!
    actionResult = action.displayName + " successful!";
    if (action.isAccept !== undefined && action.isAccept === false) {
        actionResult = action.displayName + " failed!";
    }

    if (actionResult.includes("successful!")) showSucceedEffect(initiator);
    else showFailEffect(initiator);

    //set up next turn.
    loversAndRivals.updateLocalStateInformation();
    loversAndRivals.gameVariables.turnNumber += 1;
    loversAndRivals.checkForEndConditions();

    ensemble.setupNextTimeStep();
    storedVolitions = ensemble.calculateVolition(cast);
    actions = loversAndRivals.populateActionLists(storedVolitions, cast);

    if (loversAndRivals.gameVariables.gameOver) {
        stopNpcActionTimer();
        if (loversAndRivals.gameVariables.endingText.includes('Rival'))
            showGameLose();
        else
            showGameWin();
    }
}

var hideDialogs = function () {
    showingStatsAllowed = true;
    start('HideDialog()');
    start('HideNarration()');
}

var reset = function () {
    hideDialogs();
    start('DisableIcon(StudyWriting, LoversLibrary.SpellBook)');
    start('DisableIcon(StudyLove, LoversLibrary.SpellBook)');
    start('DisableIcon(PracticeSpellsSuccess, LoversLibrary.Cauldron)');
    start('DisableIcon(PracticeSpellsFail, LoversLibrary.Cauldron)');
    start('DisableIcon(StudySpells, LoversLibrary.SpellBook)');
    start('DisableIcon(KissSuccess, Lover)');
    start('DisableIcon(KissFail, Lover)');
    start('DisableIcon(WriteLoveNoteAccept, LoversLibrary.AlchemistTable)');
    start('DisableIcon(WriteLoveNoteReject, LoversLibrary.AlchemistTable)');
};

var showIntroduction = function () {
    reset();
    start('SetCameraFocus(You)');
    start('SetLeft(You)');
    start('ShowDialog()');
    start('SetDialog(Welcome to Lovers and Rivals!)');
    start('SetDialog(Select actions to win the heart of your love![WALK_UP_STAIRS|Lets get started!])');
}

var walkUpStairs = function () {
    reset();
    start('WalkTo(You, LoversLibrary.Bookcase5)');
    start('DisableInput()');
}

var startNpcActionTimer = function () {
    clearTimeout(actionTimer);
    actionTimer = setTimeout(function () {
        for (var i = lastNpcCastIndex; i < cast.length; i++) {
            if (loversAndRivals.gameVariables.gameOver) // If gameover, no more actions...
                break;

            if (cast[i] === "hero") // If player, ignore...
                continue;

            var initiator = cast[i];
            var npcAction = undefined;
            for (var j = 0; j < cast.length; j++) {
                var responder = cast[j];
                var currentAction = ensemble.getAction(initiator, responder, storedVolitions, cast);
                if (currentAction !== undefined)
                    if (npcAction === undefined || npcAction.weight < currentAction.weight)
                        npcAction = currentAction;
            }

            initiator = initiator === 'love' ? 'Lover' : initiator;
            initiator = initiator === 'rival' ? 'Rival' : initiator;
            var returnLocation = cast[i] === 'love' ? 'LoversLibrary.Bookcase' : 'LoversLibrary.Bookcase3';
            if (npcAction !== undefined) {
                currentActions[cast[i]] = undefined;
                if (npcAction.name === 'studyMath') {
                    start('WalkTo(' + initiator + ', LoversLibrary.SpellBook)');
                    waitFor(cast[i], [
                        ['succeeded WalkTo(' + initiator + ', LoversLibrary.SpellBook)', function () { takeAction(cast[i], npcAction); start('WalkTo(' + initiator + ', ' + returnLocation + ')'); }],
                    ]);
                }
                else if (npcAction.name === 'studyAnatomy') {
                    start('WalkTo(' + initiator + ', LoversLibrary.SpellBook)');
                    waitFor(cast[i], [
                        ['succeeded WalkTo(' + initiator + ', LoversLibrary.SpellBook)', function () { takeAction(cast[i], npcAction); start('WalkTo(' + initiator + ', ' + returnLocation + ')'); }],
                    ]);
                }
                else if (npcAction.name === 'weightLiftSuccess') {
                    start('WalkTo(' + initiator + ', LoversLibrary.Cauldron)');
                    waitFor(cast[i], [
                        ['succeeded WalkTo(' + initiator + ', LoversLibrary.Cauldron)', function () { takeAction(cast[i], npcAction); start('WalkTo(' + initiator + ', ' + returnLocation + ')'); }],
                    ]);
                }
                else if (npcAction.name === 'weightLiftFail') {
                    start('WalkTo(' + initiator + ', LoversLibrary.Cauldron)');
                    waitFor(cast[i], [
                        ['succeeded WalkTo(' + initiator + ', LoversLibrary.Cauldron)', function () { takeAction(cast[i], npcAction); start('WalkTo(' + initiator + ', ' + returnLocation + ')'); }],
                    ]);
                }
                else if (npcAction.name === 'pushup1') {
                    start('WalkTo(' + initiator + ', LoversLibrary.SpellBook)');
                    waitFor(cast[i], [
                        ['succeeded WalkTo(' + initiator + ', LoversLibrary.SpellBook)', function () { takeAction(cast[i], npcAction); start('WalkTo(' + initiator + ', ' + returnLocation + ')'); }],
                    ]);
                }
                else if (npcAction.name === 'kissSuccess') {
                    start('WalkTo(' + initiator + ', Lover)');
                    waitFor(cast[i], [
                        ['succeeded WalkTo(' + initiator + ', Lover)', function () { takeAction(cast[i], npcAction); start('WalkTo(' + initiator + ', ' + returnLocation + ')'); }],
                    ]);
                }
                else if (npcAction.name === 'kissFail') {
                    start('WalkTo(' + initiator + ', Lover)');
                    waitFor(cast[i], [
                        ['succeeded WalkTo(' + initiator + ', Lover)', function () { takeAction(cast[i], npcAction); start('WalkTo(' + initiator + ', ' + returnLocation + ')'); }],
                    ]);
                }
                else if (npcAction.name === 'writeLoveNoteAccept') {
                    start('WalkTo(' + initiator + ', LoversLibrary.AlchemistTable)');
                    waitFor(cast[i], [
                        ['succeeded WalkTo(' + initiator + ', LoversLibrary.AlchemistTable)', function () { takeAction(cast[i], npcAction); start('WalkTo(' + initiator + ', ' + returnLocation + ')'); }],
                    ]);
                }
                else if (npcAction.name === 'writeLoveNoteReject') {
                    start('WalkTo(' + initiator + ', LoversLibrary.AlchemistTable)');
                    waitFor(cast[i], [
                        ['succeeded WalkTo(' + initiator + ', LoversLibrary.AlchemistTable)', function () { takeAction(cast[i], npcAction); start('WalkTo(' + initiator + ', ' + returnLocation + ')'); }],
                    ]);
                }
                else {
                    takeAction(cast[i], npcAction);
                }
            }
            lastNpcCastIndex = (i + 1) % cast.length;
            break;
        }
        startNpcActionTimer();
    }, actionTime);
}

var stopNpcActionTimer = function () {
    clearTimeout(actionTimer);
}

var showSecret = function () {
    start('ShowDialog()');
    start('SetDialog(Psst....)');
    start('SetDialog(Here is a secret!)');
    start('SetDialog(Press the (E) key to see your social stats![Cancel|Cool Thanks!])');
}

var readMind = function () {
    showingStatsAllowed = false;
    start('SetLeft(Lover)');
    start('ShowDialog()');
    start('SetDialog(Closeness)');
    start('SetDialog(What Lover thinks about Hero: ' + loversAndRivals.stateInformation.loveToHeroCloseness + ')');
    start('SetDialog(What Lover thinks about Rival: ' + loversAndRivals.stateInformation.loveToRivalCloseness + ')');
    start('SetDialog([Cancel|Got it!])');
}

var showStats = function () {
    showingStatsAllowed = false;
    start('SetLeft(You)');
    start('ShowDialog()');
    start('SetDialog( * Strength: ' + loversAndRivals.stateInformation.heroStrength + ')');
    start('SetDialog( * Intelligence: ' + loversAndRivals.stateInformation.heroIntelligence + ')');
    start('SetDialog(What Hero thinks about Lover: ' + loversAndRivals.stateInformation.heroToLoveCloseness + ')');
    start('SetDialog([Cancel|Got it!])');
};

var showGameWin = function () {
    hideDialogs();
    currentActions['hero'] = undefined;
    start('WalkTo(You, Lover)')
    start('DisableInput()');
}

var showGameLose = function () {
    hideDialogs();
    currentActions['hero'] = undefined;
    start('WalkTo(Lover, Rival)')
}

var showEndingText = function () {
    start('HideDialog()');
    start('ShowNarration()');
    start('SetNarration(' + loversAndRivals.gameVariables.endingText + ')');
}

var playerTakeAction = function (action) {
    reset();
    start('DisableInput()');

    if (action !== undefined && action !== '') {
        if (action.name === 'studyMath') {
            start('WalkTo(You, LoversLibrary.SpellBook)');
            waitFor('hero', [
                ['succeeded WalkTo(You, LoversLibrary.SpellBook)', function () { start('ShowNarration()'); start('SetNarration(' + action.displayName + ')'); takeAction("You", action); }],
                ['input Key Cancel', function () { hideDialogs(); }]
            ]);
        }
        else if (action.name === 'studyAnatomy') {
            start('WalkTo(You, LoversLibrary.SpellBook)');
            waitFor('hero', [
                ['succeeded WalkTo(You, LoversLibrary.SpellBook)', function () { start('ShowNarration()'); start('SetNarration(' + action.displayName + ')'); takeAction("You", action); }],
                ['input Key Cancel', function () { hideDialogs(); }]
            ]);
        }
        else if (action.name === 'weightLiftSuccess') {
            start('WalkTo(You, LoversLibrary.Cauldron)');
            waitFor('hero', [
                ['succeeded WalkTo(You, LoversLibrary.Cauldron)', function () { start('ShowNarration()'); start('SetNarration(' + action.displayName + ')'); takeAction("You", action); }],
                ['input Key Cancel', function () { hideDialogs(); }]
            ]);
        }
        else if (action.name === 'weightLiftFail') {
            start('WalkTo(You, LoversLibrary.Cauldron)');
            waitFor('hero', [
                ['succeeded WalkTo(You, LoversLibrary.Cauldron)', function () { start('ShowNarration()'); start('SetNarration(' + action.displayName + ')'); takeAction("You", action); }],
                ['input Key Cancel', function () { hideDialogs(); }]
            ]);
        }
        else if (action.name === 'pushup1') {
            start('WalkTo(You, LoversLibrary.SpellBook)');
            waitFor('hero', [
                ['succeeded WalkTo(You, LoversLibrary.SpellBook)', function () { start('ShowNarration()'); start('SetNarration(' + action.displayName + ')'); takeAction("You", action); }],
                ['input Key Cancel', function () { hideDialogs(); }]
            ]);
        }
        else if (action.name === 'kissSuccess') {
            start('WalkTo(You, Lover)');
            waitFor('hero', [
                ['succeeded WalkTo(You, Lover)', function () { start('ShowNarration()'); start('SetNarration(' + action.displayName + ')'); takeAction("You", action); }],
                ['input Key Cancel', function () { hideDialogs(); }]
            ]);
        }
        else if (action.name === 'kissFail') {
            start('WalkTo(You, Lover)');
            waitFor('hero', [
                ['succeeded WalkTo(You, Lover)', function () { start('ShowNarration()'); start('SetNarration(' + action.displayName + ')'); takeAction("You", action); }],
                ['input Key Cancel', function () { hideDialogs(); }]
            ]);
        }
        else if (action.name === 'writeLoveNoteAccept') {
            start('WalkTo(You, LoversLibrary.AlchemistTable)');
            waitFor('hero', [
                ['succeeded WalkTo(You, LoversLibrary.AlchemistTable)', function () { start('ShowNarration()'); start('SetNarration(' + action.displayName + ')'); takeAction("You", action); }],
                ['input Key Cancel', function () { hideDialogs(); }]
            ]);
        }
        else if (action.name === 'writeLoveNoteReject') {
            start('WalkTo(You, LoversLibrary.AlchemistTable)');
            waitFor('hero', [
                ['succeeded WalkTo(You, LoversLibrary.AlchemistTable)', function () { start('ShowNarration()'); start('SetNarration(' + action.displayName + ')'); takeAction("You", action); }],
                ['input Key Cancel', function () { hideDialogs(); }]
            ]);
        }
        else {
            start('ShowNarration()');
            start('SetNarration(' + action.displayName + ')');
            waitFor('hero', [['input Key Cancel', hideDialogs]]);
            takeAction("You", action);
        }
    }

    if (!loversAndRivals.gameVariables.gameOver) {
        resumeGame();
    }
}

var exit = function () {
    start('Quit()');
    process.exit();
}

module.exports = {
    createWorld: createWorld,
    processInput: processInput,
};