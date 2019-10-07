const ensemble = require('./Ensemble/ensemblejs/js/ensemble/ensemble');
const loversAndRivals = require('./LoversAndRivals');

var currentActions = {};
var cast;
var storedVolitions;
var actions;

var start = function (command) {
    console.log('start ' + command);
};

var resumeGame = function () {
    reset();
    enableIcons();
    start('EnableInput()');
    showingStatsAllowed = true;
}

var showFailEffect = function (initiator) {
    initiator = initiator === undefined ? 'You' : initiator;
    initiator = initiator === 'love' ? 'Lover' : initiator;
    initiator = initiator === 'rival' ? 'Rival' : initiator;
    //start('CreateEffect(You, heartbroken, 3)'); // Not working right now
    start('CreateEffect(' + initiator + ', blackflame, 3)');
    resumeGame();
}

var showSucceedEffect = function (initiator) {
    initiator = initiator === undefined ? 'You' : initiator;
    initiator = initiator === 'love' ? 'Lover' : initiator;
    initiator = initiator === 'rival' ? 'Rival' : initiator;
    //start('CreateEffect(You, heart, 3)'); // Not working right now
    start('CreateEffect(' + initiator + ', wildfire, 3)');
    resumeGame();
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
}

var studyMath = function (initiator, action) {
    if (currentActions[initiator] !== undefined) {
        showNarration('Study Math could not be perform by ' + initiator + '. Busy with: ' + currentActions[initiator].name);
        return;
    }

    start('WalkTo(' + initiator + ', LoversLibrary.Bookcase5)');
    waitFor(initiator,
        [
            ['succeeded WalkTo(' + initiator + ', LoversLibrary.Bookcase5)', function () {
                takeAction(initiator, action);
            }],
        ]
    );
};

var studyAnatomy = function (initiator, action) { }
var weightLiftSuccess = function (initiator, action) { }
var weightLiftFail = function (initiator, action) { }
var pushup1 = function (initiator, action) { }
var writeLoveNoteAccept = function (initiator, action) { }
var writeLoveNoteReject = function (initiator, action) { }
var kissSuccess = function (initiator, action) { }
var kissFail = function (initiator, action) { }

var waitFor = function (initiator, actionList) {
    if (currentActions[initiator] === undefined)
        currentActions[initiator] = actionList;
    else
        console.log("Character already is working on actions " + initiator + " " + actionList[0][0]);
}

var processWaitFor = function (input) {
    for (var character in currentActions) {
        if (currentActions[character][0][0] === input) {
            var callback = currentActions[character][0][1];
            currentActions[character].shift();
            if (currentActions[character].length == 0)
                currentActions[character] = undefined;
            callback();
        }
    }
}

var hideDialogs = function () {
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

var actionTime = 5 * 1000; // milliseconds before AI performs actions.
var actionTimer = undefined;

var startNpcActionTimer = function () {
    clearTimeout(actionTimer);
    actionTimer = setTimeout(function () {
        for (var i = 0; i < cast.length; i++) {
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
            if (npcAction !== undefined) {
                takeAction(cast[i], npcAction);
                console.log("NPC " + cast[i] + " took action: " + npcAction.displayName);
            }
        }

        //console.dir(loversAndRivals.stateInformation);
        startNpcActionTimer();
    }, actionTime);
}

var stopNpcActionTimer = function () {
    clearTimeout(actionTimer);
}

var assignedReadMind = false;
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
    startNpcActionTimer();
    if (!assignedReadMind) {
        start('EnableIcon(READ_MIND, Pen, Lover, Read Mind, false)');
        assignedReadMind = true;
    }
}

var startGame = function () {
    cast = ensemble.getCharacters();
    storedVolitions = ensemble.calculateVolition(cast);
    actions = loversAndRivals.populateActionLists(storedVolitions, cast);

    reset();
    enableIcons();
    start('EnableInput()');
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

module.exports = {
    createWorld: createWorld,
    processWaitFor: processWaitFor,
};