// JavaScript Document
/*jslint devel: true */
/////////////////////////////////////////////////////////////////////
// Property Initialization
/////////////////////////////////////////////////////////////////////
// Object Constructors //
function Room(roomName, roomDescription, roomExits, roomItems, roomImage) {
    this.name = roomName; // Defines the name of the room- the quick identifier of what room it is.
    this.description = roomDescription; // A long description for the room, read to the player when it's entered.
    this.exits = roomExits; // An array listing the room's exits as directions.
    this.items = roomItems; // An array listing the items in the room.
    this.image = roomImage;
}

// End Object Constructors //

// Player Qualities //
var player = {
        locX: 0,
        locY: 0,
        backpack: []
    };
// End Player Qualities //

// Progress Trackers //
var gameStarted = false;
var goblinDefeated = false;
var drowPacified = false;
var doorUnlocked = false;
var gameWon = false;
// Progress Trackers //

// Game Files //
var gameMap = [[], [], []];
gameMap[0][0] = new Room("Rock Bottom", "You are in a dark cave, lit only barely by phosphorent fungi lining the walls. High above you can see a distant ring of white indicating the hole you must have fallen through to reach this abyssal cavern. The floor is a vast mat of soft green fungal flesh- it must have broken your fall. A tunnel hewn into the rock wall to the East leads deeper into the caves.", ["east"], ["sword"], "img/DarkCave.jpg");
gameMap[1][0] = new Room("Goblin Tunnel", "Travelling deeper into the subterranean tunnels, you come to a crossroads. Standing guard here is a goblin: a pest from the surface world, resembling a man but tiny of stature, hunched, and filled with a shrieking hatred for order and justice. It waves a jagged knife menacingly and shouts at your approach, preventing you from advancing further. You'll have to fight it if you want to get anywhere down here.", ["west"], [], "img/Goblin.jpg");
gameMap[2][0] = new Room("Drow Enclave", "A group of dark elves sit around a fire in this barricaded circular chamber, talking in their strange tongue. They're all heavily armed, bearing both sword and bow, and you feel it would be unwise to attack them. A pair of them move to man the barricade as you approach, barring you from entering. Perhaps a symbol of allegiance would help here.", ["west"], [], "img/Drow.jpg");
gameMap[0][1] = new Room("Locked Door", "The passage leads to a sheer stone wall with a door set into it. Attempting to open it reveals that it's locked- you'll need a key.", ["east"], [], "img/Door.jpg");
gameMap[1][1] = new Room("Crossroads", "The tunnel branches here, with one passage heading East and another heading West.", ["east", "south", "west"], [], "img/CrossroadPath.jpg");
gameMap[2][1] = new Room("Altar", "There is a bizarre altar in this square room. It's engraved with images of an elven woman and a spider with a skull for its body and adorned with candles that glow with an eerie purple flame. At the base of the altar is a heavy looking iron idol shaped like a spider with an elven woman's upper body where its head should be.", ["west"], ["idol"], "img/AltarToLolth.jpg");
gameMap[0][2] = new Room("The Brink", "After navigating a long and twisted series of tunnels, you come to an open pit. The yawning abyss is impenetrably dark, and the fungus coating the cave walls does very little to illuminate it. Fortunately the tunnel you were following continues to the East- it seems much safer, and better lit.", ["east", "south"], []);
gameMap[1][2] = new Room("Button Room", "In the middle of this room is dominated by a large floor plate. When it's held down a door on the far Eastern wall slides open, but it closes as soon as you step away. If you had something heavy to weigh it down, you could keep the door open.", ["west"], []);
gameMap[2][2] = new Room("Escape!", "A staircase leads up into the light- and freedom! You can't leave without your sword, though- it's a family heirloom, after all.", ["west"], [], "img/Escape.jpg");

var knownActions = ["get", "take", "use", "drop", "inventory"];
var knownMovement = ["north", "east", "south", "west"];

// End Game Files //

// General //
var gameRunning = true;
var playerInput = "";
var playerAction = "";
var inputResponse = "";
// End General //

// Document Queries //
var showHelp = document.querySelector("#helpButton"); // Hook for help button
var saveButton = document.querySelector("#saveButton"); // Hook for save button
var saveButton = document.querySelector("#loadButton"); // Hook for load button
var helpArea = document.querySelector("#help"); // Hook for help screen
var textInput = document.querySelector("#textInput"); // Hook for text input box
var textOutput = document.querySelector("#textOutput"); // Hook for text output span
var adventureImage = document.querySelector("#adventureImage"); // Hook for display image
// End Document Queries //
// End Property Initialization

/////////////////////////////////////////////////////////////////////
// Function Declarations
/////////////////////////////////////////////////////////////////////
// Checks if the referenced array of strings contains an appropriate movement or action at index 0.
function validateInput(playerInput) {
    if (knownActions.indexOf(playerInput[0]) >= 0) {
        return 0; // Return 0 if the first string is an action.
    } else if (knownMovement.indexOf(playerInput[0]) >= 0) {
        return 1; // Otherwise, return 1 if the first string is a direction.
    } else {
        inputResponse = "What do you want to do? (Try clicking 'show help'!)"; // If it's neither, alert and return negative.
        return -1;
    }
}

// Take an array of strings and return a string that lists them in proper format.
function listArrayContents(stringArray) {
    // Check if the stringArray has any contents- if it does, go onto listing methods.
    // Otherwise, return -1 to indicate failure.
    if (stringArray.length !== 0) {
        var i,
            returnString = "";
        
        // Detect if the string array is only 1 or 2 elements long- they have their own listing methods.
        // Otherwise, procedurally list them by default.
        switch (stringArray.length) {
        case 1:
            return stringArray[0];
        case 2:
            return stringArray[0] + " and " + stringArray[1] + ".";
        default:
            for (i = 0; i < stringArray.length; i += 1) {
                if (i === (stringArray.length - 1)) {
                    returnString += "and " + stringArray[i] + ".";
                } else {
                    returnString += stringArray[i] + ", ";
                }
            }
            return returnString;
        }
    } else {
        return -1;
    }
}

// Build the game's output text
// Start with the room description, then list any exits from the current room. If there are any items in 
// the room, list them. At the end, add the input response, if any. The input response indicates
// successful or failed actions, so the player has proper feedback on what their actions are doing.
function updateText() {
    textOutput.innerHTML = "<b>" + gameMap[player.locX][player.locY].name + "</b>";
    textOutput.innerHTML += "<br>" + gameMap[player.locX][player.locY].description;
    textOutput.innerHTML += "<br><br>There are exits: " + listArrayContents(gameMap[player.locX][player.locY].exits);
    if (gameMap[player.locX][player.locY].items.length > 0) {
        textOutput.innerHTML += "<br>Items on the ground: " + listArrayContents(gameMap[player.locX][player.locY].items);
    }
    textOutput.innerHTML += "<br><br>" + inputResponse;
    
    // If the current location has a defined image, display it.
    if (gameMap[player.locX][player.locY].image) {
        adventureImage.src = gameMap[player.locX][player.locY].image;
        adventureImage.style.display = "block";
    } else {
        // If it doesn't, don't display any image.
        adventureImage.style.display = "none";
    }
    
}

// Game state alteration functions
function usedSword() {
    
}

// End Function Declarations

/////////////////////////////////////////////////////////////////////
// Main Game Logic
/////////////////////////////////////////////////////////////////////
function updateGame() {
    // Split the player's input into an array with up to two elements; the first word and the second word
    // Further words are discarded.
    playerInput = textInput.value.toLowerCase().split(" ", 2);
    
    // Reset the text input field and the input response.
    textInput.value = "";
    inputResponse = "";
    
    // Log input for testing purposes.
    console.log("Input: " + playerInput);
    
    // Variable definitions
    var itemLocation; // Used to store the index of items being manipulated by the player.
    // End variable definitions
    
    switch (validateInput(playerInput)) {
    case 0:
        switch (playerInput[0]) {
        case "get":
        case "take":
            // Check if the player provided a target item.
            if (playerInput.length > 1) {
                // Store the index of the item the player's trying to take in itemLocation, if it exists.
                // Otherwise, store -1.
                itemLocation = gameMap[player.locX][player.locY].items.indexOf(playerInput[1]);
                
                // If the player isn't picking up the idol and doesn't have the idol in their inventory, execute as normal.
                if (playerInput[1] !== "idol" && player.backpack.indexOf("idol") === -1) {
                    // Log player inventory and room item state for testing, pre-manipulation.
                    console.log("Inventory Before: " + player.backpack + "; Ground Before: " + gameMap[player.locX][player.locY].items);

                    if (itemLocation >= 0) {
                        // If the item was found, add it to the player's inventory and remove it from the room.
                        player.backpack.push(gameMap[player.locX][player.locY].items[itemLocation]);
                        gameMap[player.locX][player.locY].items.splice(itemLocation, 1);

                        // Tell the player their action was successful.
                        inputResponse = "You pick up the " + playerInput[1] + ".";
                    } else {
                        // If the item wasn't found, tell the player the action failed.
                        inputResponse = "There is no " + playerInput[1] + " here to pick up.";
                    }
                    // Log player inventory post-manipulation.
                    console.log("Inventory After: " + player.backpack + "; Ground After: " + gameMap[player.locX][player.locY].items);
                } else if (playerInput[1] === "idol") {
                    // If the player's trying to pick up the idol, check if the idol's there
                    if (itemLocation === -1) {
                        // If it isn't, report that there's no idol there.
                        inputResponse = "There is no " + playerInput[1] + " here to pick up.";
                    } else if (player.backpack.length > 0) {
                        // If the player has items in their inventory, report that they can't pick up the idol with all that weight.
                        inputResponse = "The idol is too heavy to carry with your other gear!";
                    } else {
                        // If other checks pass, pick up the idol.
                        player.backpack.push(gameMap[player.locX][player.locY].items[itemLocation]);
                        gameMap[player.locX][player.locY].items.splice(itemLocation, 1);

                        // Tell the player their action was successful.
                        inputResponse = "You pick up the " + playerInput[1] + ".";
                        
                        // Change the room description for the altar, and the exits of the button room.
                        gameMap[2][1].description = "There is a bizarre altar in this square room. It's engraved with images of an elven woman and a spider with a skull for its body and adorned with candles that glow with an eerie purple flame.";
                        gameMap[1][2].exits = ["west"];
                        
                        // If the player is in the buttom room, tell them the door closes.
                        if (player.locX === 1 && player.locY === 2) {
                            inputResponse += " The door to your East slides shut!";
                        }
                    }
                } else if (player.backpack.indexOf("idol") >= 0) {
                    // The player is carrying the idol and trying to pick up something, so report failure.
                    inputResponse = "You can't pick up something else while carrying the idol!";
                }
            } else {
                // If the player didn't provide a target item, ask them for one next time.
                inputResponse = "Pickup what?";
            }
            break;
        case "drop":
            // Check if the player provided a target item.
            if (playerInput.length > 1) {
                // Store the index of the item the player's trying to drop in itemLocation, if it exists.
                // Otherwise, store -1.
                itemLocation = player.backpack.indexOf(playerInput[1]);
                
                if (itemLocation >= 0) {
                    // If the item was found, put it in the room and remove it from the inventory.
                    gameMap[player.locX][player.locY].items.push(player.backpack[itemLocation]);
                    player.backpack.splice(itemLocation, 1);
                    
                    // Tell the player their action was successful.
                    inputResponse = "You drop the " + playerInput[1] + ".";
                    
                    if (player.locX === 2 && player.locY === 1 && playerInput[1] === "idol") {
                        // If the idol was the item they dropped, and the player is in the altar room change the altar's room description.
                        gameMap[2][1].description = "There is a bizarre altar in this square room. It's engraved with images of an elven woman and a spider with a skull for its body and adorned with candles that glow with an eerie purple flame. At the base of the altar is a heavy looking iron idol shaped like a spider with an elven woman's upper body where its head should be.";
                    } else if (player.locX === 1 && player.locY === 2 && playerInput[1] === "idol") {
                        inputResponse = "You drop the idol onto the button. The door to your East slides open!";
                        gameMap[1][2].exits = ["east", "west"];
                    }
                } else {
                    // If the item wasn't found, tell the player the action failed.
                    inputResponse = "You don't have a " + playerInput[1] + ".";
                }
            } else {
                // If the player didn't provide a target item, ask them for one next time.
                inputResponse = "Drop what?";
            }
            break;
        case "inventory":
            // Check if the player's backpack has contents.
            if (listArrayContents(player.backpack) !== -1) {
                // If it does, use listArrayContents to list them.
                console.log("Backpack length: " + player.backpack.length);
                inputResponse = "Your backpack contains: " + listArrayContents(player.backpack);
            } else {
                // If it doesn't, tell the player.
                inputResponse = "Your backpack is empty.";
            }
            break;
        case "use":
            // Check if the player provided a target item.
            if (playerInput.length > 1) {
                // Check what item the player's trying
                switch (playerInput[1]) {
                case "sword":
                    // Store the index of the sword, if it exists. Otherwise store -1.
                    itemLocation = player.backpack.indexOf("sword");
                    
                    if (itemLocation >= 0) {
                        // If the item was found, check if the player is in the right room and the goblin is still alive.
                        if (player.locX === 1 && player.locY === 0 && goblinDefeated === false) {
                            // Set the goblin to defeated, add the extra exits to the room, add the medallion to the room, and change the room's description.
                            goblinDefeated = true;
                            gameMap[1][0].exits = ["north", "east", "west"];
                            gameMap[1][0].items.push("medallion");
                            gameMap[1][0].description = "The goblin lies face down against the Southern wall of the tunnel. With it out of the way, you can now pass to the North and East.";
                            
                            // Report the successful use of the sword.
                            inputResponse = "Charging forward with a shout, you easily run the goblin through. It drops a medallion with a spider insignia carved into it.";
                        } else if (player.locX !== 1 || player.locY !== 0) {
                            // If the player is in the wrong place, tell them.
                            inputResponse = "This isn't the time or place for a sword!";
                        } else if (goblinDefeated === true) {
                            // If the player is in the right place AND the goblin has been defeated, tell them.
                            inputResponse = "The goblin has already been defeated.";
                        }
                    } else {
                        // If the player doesn't have the sword, tell them.
                        inputResponse = "You don't have a sword.";
                    }
                    break;
                case "medallion":
                    // Store the index of the medallion, if it exists. Otherwise store -1.
                    itemLocation = player.backpack.indexOf("medallion");
                    
                    if (itemLocation >= 0) {
                        // If the item was found, check if the player is in the right room and the drow are not pacified.
                        if (player.locX === 2 && player.locY === 0 && drowPacified === false) {
                            // Set the drow to pacified, add the key to the room, and change the room's description.
                            drowPacified = true;
                            gameMap[2][0].items.push("key");
                            gameMap[2][0].description = "The drow in this chamber wave you towards their camp and offer you spider bread and fungus wine to join and rest with them. You feel vaguely menaced, but you can't tell why.";
                            
                            // Report the successful use of the medallion.
                            inputResponse = "As you display the spider medallion, the drow at the barricade visibly relax and usher you towards the camp. One of them offers you a key and points you Northwest.";
                        } else if (player.locX !== 2 || player.locY !== 0) {
                            // If the player is in the wrong place, tell them.
                            inputResponse = "You display the medallion. Nothing happens.";
                        } else if (drowPacified === true) {
                            // I the player is in the right plce and the drow are pacified, tell them.
                            inputResponse = "The drow give you a strange look as you display the medallion again.";
                        }
                    } else {
                        // If the player doesn't have the medallion, tell them.
                        inputResponse = "You don't have a medallion.";
                    }
                    break;
                case "key":
                    // Store the index of the key, if it exists. Otherwise store -1.
                    itemLocation = player.backpack.indexOf("key");
                        
                    if (itemLocation >= 0) {
                        // If the item was found, check if the player is in the right room and the door is locked.
                        if (player.locX === 0 && player.locY === 1 && doorUnlocked === false) {
                            // Set the drow to pacified, add the key to the room, and change the room's description.
                            doorUnlocked = true;
                            gameMap[0][1].name = "Unlocked Door";
                            gameMap[0][1].exits = ["north", "east"];
                            gameMap[0][1].description = "There is a sheer stone wall here, with a door hanging ajar at its center.";
                            
                            // Report the successful use of the medallion.
                            inputResponse = "You use your key to unlock the door.";
                        } else if (player.locX !== 0 || player.locY !== 1) {
                            // If the player is in the wrong place, tell them.
                            inputResponse = "There's nothing to unlock here.";
                        } else if (doorUnlocked === true) {
                            // I the player is in the right place and the door is already unlocked, tell them.
                            inputResponse = "The door is already unlocked.";
                        }
                    } else {
                        // If the player doesn't have the key, tell them.
                        inputResponse = "You don't have a key.";
                    }
                    break;
                default:
                    inputResponse = "I don't understand what you're trying to use.";
                    break;
                }
            } else {
                // If the player types "use" without a target object, ask them what they want to use.
                inputResponse = "Use what?";
            }
            break;
        }
        break;
    case 1:
        // Check if the room at the player's current location has an exit in that direction.
        if (gameMap[player.locX][player.locY].exits.indexOf(playerInput[0]) >= 0) {
            // If it does, move in the appropriate direction!
            switch (playerInput[0]) {
            case "north":
                player.locY += 1;
                break;
            case "east":
                player.locX += 1;
                break;
            case "south":
                player.locY -= 1;
                break;
            case "west":
                player.locX -= 1;
                break;
            }
        } else {
            // If it doesn't, tell the player the way is blocked.
            inputResponse = "You can't go that way.";
        }
        break;
    default:
        break;
    }
    
    // If the player is at the exit and are carrying the sword...
    if (player.locX === 2 && player.locY === 2 && player.backpack.indexOf("sword") >= 0) {
        // They win! Set gameWon to true so input stops being accepted, and display victory text.
        gameWon = true;
        textOutput.innerHTML = "You escape from the underground labyrinth and back to the surface world, alive and intact! You have an exciting new story to tell your drinking buddies back at the adventurer's guild.<br><br><b>Congratulations, you win!</b>";
        // If the current location has a defined image, display it.
        if (gameMap[player.locX][player.locY].image) {
            adventureImage.src = gameMap[player.locX][player.locY].image;
            adventureImage.style.display = "block";
        } else {
            // If it doesn't, don't display any image.
            adventureImage.style.display = "none";
        }
    } else {
        // Update the output text area and image.
        updateText();
    }
}


/////////////////////////////////////////////////////////////////////
// Event Handlers/Listeners
/////////////////////////////////////////////////////////////////////
// Toggle the help area when the button is pressed.
function toggleHelp() {
    // Check if the display property actually exists, or if it's "none"
    if (!helpArea.style.display || helpArea.style.display === "none") {
        helpArea.style.display = "inline-block"; // Make the help area visible
    } else {
        helpArea.style.display = "none"; // Otherwise, hide the help area
    }
}

/*
Saves the current game state to local storage. The following details are stored:
The current location of the player (by room).
The status of Progress Tracker variables, and the alterations they make to rooms.

The following details are not stored (yet):
The player's inventory.
The locations of items in the game world.

Known issue: If the game is saved after using the sword on the goblin, but before showing its
medallion to the drow, loading the game will place it in an un-winnable state. This could be
rectified by saving the status of items, but I'm keeping things simple and everything else
works.
*/
function saveGame() {
    
}

/* 
Loads the saved game state from local storage, if it exists. See above notes on saveGame()
for details about the functionality of saving.
*/
function loadGame() {
    
}

// Detect keypresses, then check if they were "Enter"
function keydownHandler() {
    if (event.keyCode === 13) {
        if (gameStarted === true && gameWon === false) {
            updateGame();
        } else {
            gameStarted = true;
            updateGame();
        }
    }
}

// Hook up event handlers to function as described
showHelp.addEventListener("click", toggleHelp);
window.addEventListener("keydown", keydownHandler, false);