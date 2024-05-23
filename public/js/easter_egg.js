document.addEventListener("DOMContentLoaded", sortingGame);

function sortingGame() {
    const itemsData = [
        { id: "apple", emoji: "🍎", name: "Apple", bin: "compost-bin" },
        { id: "glass-bottle", emoji: "🍾", name: "Glass Bottle", bin: "recycle-bin" },
        { id: "cardboard-box", emoji: "📦", name: "Cardboard Box", bin: "mixed-paper-bin" },
        { id: "grapes", emoji: "🍇", name: "Grapes", bin: "compost-bin" },
        { id: "newspaper", emoji: "📰", name: "Newspaper", bin: "mixed-paper-bin" },
        { id: "razor", emoji: "🪒", name: "Razor", bin: "trash-bin" },
    ];

    const itemsContainer = document.querySelector(".items");
    const bins = document.querySelectorAll(".bin");
    const binContainers = document.querySelectorAll('.bin-container');
    itemsContainer.innerHTML = ""; // Clear previous items
    bins.forEach((bin) => {
        while (bin.firstChild && bin.firstChild.className !== "bin-name") {
            bin.removeChild(bin.firstChild);
        }
    });

    const selectedItems = getRandomItems(itemsData, 3);
    selectedItems.forEach((item) => {
        const itemElement = document.createElement("div");
        itemElement.id = item.id;
        itemElement.className = "item";
        itemElement.draggable = true;
        itemElement.dataset.originalPosition = selectedItems.indexOf(item);
        itemElement.textContent = `${item.emoji}`;
        itemsContainer.appendChild(itemElement);
    });

    const mistakesElement = document.getElementById("mistakes");
    const messageElement = document.getElementById("message");
    let mistakes = 0; // to track the number of mistakes

    const correctSound = new Audio("./public/audio/correct.mp3"); // Add your correct sound file here
    const incorrectSound = new Audio("./public/audio/wrong.mp3"); // Add your incorrect sound file here

    const items = document.querySelectorAll(".item");
    items.forEach((item) => {
        item.addEventListener("dragstart", dragStart);
    });

    bins.forEach((bin) => {
        bin.addEventListener("dragover", dragOver);
        bin.addEventListener("drop", drop);
    });

    binContainers.forEach((container) => {
        container.addEventListener("dragover", () => {
            container.classList.add("dragging-over");
        });
        container.addEventListener("dragleave", () => {
            container.classList.remove("dragging-over");
        });
        container.addEventListener("drop", () => {
            container.classList.remove("dragging-over");
        });
    });

    function getRandomItems(arr, num) {
        const shuffled = arr.slice().sort(() => 0.5 - Math.random());
        return shuffled.slice(0, num);
    }

    function dragStart(event) {
        event.dataTransfer.setData("text", event.target.id);
    }

    function dragOver(event) {
        event.preventDefault();
    }

    function drop(event) {
        event.preventDefault();
        const id = event.dataTransfer.getData("text");
        const draggableElement = document.getElementById(id);
        const dropzone = event.target;

        if (isCorrectBin(id, dropzone.id)) {
            dropzone.appendChild(draggableElement);
            correctSound.play();
            displayMessage("Correct!", "correct");
            checkCompletion();
        } else {
            incorrectSound.play();
            returnItemToOriginalPosition(draggableElement);
            mistakes++;
            displayMistakes();
            displayMessage("Oh no! That's the wrong bin!");
            if (mistakes === 3) {
                gameOver();
            }
        }
    }

    function isCorrectBin(itemId, binId) {
        const correctBins = {
            apple: "compost-bin",
            "glass-bottle": "recycle-bin",
            "cardboard-box": "mixed-paper-bin",
            grapes: "compost-bin",
            newspaper: "mixed-paper-bin",
            razor: "trash-bin",
        };
        return correctBins[itemId] === binId;
    }

    function returnItemToOriginalPosition(item) {
        const originalPosition = item.getAttribute("data-original-position");
        const originalParent = itemsContainer;
        originalParent.insertBefore(item, originalParent.children[originalPosition]);
    }

    function displayMistakes() {
        mistakesElement.innerHTML = "😢".repeat(mistakes);
    }

    function displayMessage(message, type) {
        messageElement.textContent = message;
        messageElement.className = type;
        setTimeout(() => {
            messageElement.textContent = "";
        }, 1500);
    }

    function checkCompletion() {
        const correctPlacements = {
            apple: "compost-bin",
            "glass-bottle": "recycle-bin",
            "cardboard-box": "mixed-paper-bin",
            grapes: "compost-bin",
            newspaper: "mixed-paper-bin",
            razor: "trash-bin",
        };
        let allCorrect = true;

        selectedItems.forEach((item) => {
            const itemElement = document.getElementById(item.id);
            // Ensure the item is placed inside a bin and it's the correct bin
            if (
                !itemElement ||
                itemElement.parentElement.className !== "bin" ||
                itemElement.parentElement.id !== correctPlacements[item.id]
            ) {
                allCorrect = false;
            }
        });

        if (allCorrect) {
            alert(`Congratulations! You have successfully sorted all the items with ${mistakes} mistakes.`);
            resetGame();
        }
    }

    function gameOver() {
        alert("Game over! You got it wrong three times 😢");
        resetGame();
    }

    function resetGame() {
        itemsContainer.innerHTML = ""; // Clear previous items
        messageElement.textContent = "";
        mistakesElement.innerHTML = "";
        bins.forEach((bin) => {
            while (bin.firstChild && bin.firstChild.className !== "bin-name") {
                bin.removeChild(bin.firstChild);
            }
            const binName = bin.querySelector(".bin-name");
            if (binName) {
                bin.appendChild(binName); // Ensure bin names remain
            }
        });
        sortingGame(); // restart the game
    }
}