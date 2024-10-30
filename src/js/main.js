const submit = document.getElementById('submitForm');

const inTransit = [];
let liftPositions = [];
let floorRequests = [];
let liftStates = [];
let floorsBeingServed = [];
let upRequests = new Set();    
let downRequests = new Set();  

let pendingRequests = new Map(); 

document.querySelector('form').addEventListener("submit", (e)=>{
    e.preventDefault();
    let floors = parseInt(document.getElementById('numOfFloors').value);
    let lifts = parseInt(document.getElementById('numOfLifts').value);

    if (isNaN(floors) || isNaN(lifts) || floors <= 0 || lifts <= 0) {
        alert("Please enter positive numbers for both floors and lifts.");
        return;
    }

    console.log('you submitted with floors ' + floors + " and lifts: "+ lifts);
    generateFloors(floors, lifts);

    document.getElementById('numOfFloors').value = '';
    document.getElementById('numOfLifts').value = '';
    document.getElementById('numOfFloors').focus();
});

function generateFloors(floorCount, liftCount){
    const floorContainer = document.getElementById('floorContainer');
    floorContainer.innerHTML = " ";
    
    if(liftCount > floorCount){
        alert("Come on, You should not have more lifts than floor.")
        return;
    }
    
    liftPositions = Array(liftCount).fill(0);
    liftStates = Array(liftCount).fill('closed');
    floorRequests = [];
    upRequests.clear();
    downRequests.clear();
    floorsBeingServed = [];
    pendingRequests.clear();

    for(let i=floorCount-1; i>=0; i--){
        const floors = document.createElement('div');
        floors.className = 'floors';
        floors.textContent = `${i+1} floor`

        const buttons = document.createElement('div');
        buttons.className = 'buttons';

        const upButton = document.createElement('button');
        upButton.id = `upButton_${i}`;
        upButton.textContent = 'Up';
        upButton.dataset.floor = i;
        upButton.dataset.direction = 'up';
        upButton.addEventListener('click', (e) => {
            handleLiftRequest(i, 'up');
            e.target.disabled = true;
            updatePendingRequests(i, 'up', true);
        });

        const downButton = document.createElement('button');
        downButton.id = `downButton_${i}`;
        downButton.textContent = 'Down';
        downButton.dataset.floor = i;
        downButton.dataset.direction = 'down';
        downButton.addEventListener('click', (e) => {
            handleLiftRequest(i, 'down');
            e.target.disabled = true;
            updatePendingRequests(i, 'down', true);
        });

        if(i < floorCount-1){
            buttons.appendChild(upButton);
        }else if (floorCount === 1) {  
            buttons.appendChild(upButton);
        }
        if(i > 0){
            buttons.appendChild(downButton);
        }

        const liftContainer = document.createElement('div');
        liftContainer.className = 'liftContainer';

        if(i === 0){
            for(let liftIndex = 0; liftIndex < liftCount; liftIndex++){
                const lift = document.createElement('div');
                lift.className = 'lift';   
                lift.id = `lift_${liftIndex}`;
                
                const leftDoor = document.createElement('div');
                leftDoor.className = 'leftDoor';

                const rightDoor = document.createElement('div');
                rightDoor.className = 'rightDoor';

                lift.appendChild(leftDoor);
                lift.appendChild(rightDoor);
                liftContainer.appendChild(lift);
            }    
        }
        
        floors.appendChild(buttons);
        floors.appendChild(liftContainer);
        floorContainer.appendChild(floors);
    }
}

function updatePendingRequests(floor, direction, isPending) {
    if (!pendingRequests.has(floor)) {
        pendingRequests.set(floor, { up: false, down: false });
    }
    const floorRequests = pendingRequests.get(floor);
    floorRequests[direction] = isPending;
    
    if (!floorRequests.up && !floorRequests.down) {
        pendingRequests.delete(floor);
    }
}

function handleLiftRequest(requestedFloor, direction) {
    if (direction === 'up') {
        upRequests.add(requestedFloor);
    } else {
        downRequests.add(requestedFloor);
    }
    
    floorRequests.push({
        floor: requestedFloor,
        direction: direction
    });
    
    processLiftRequests();
}

function findAvailableLift(requestedFloor) {
    let nearestLift = null;
    let minDistance = Infinity;

    for (let i = 0; i < liftPositions.length; i++) {
        if (inTransit.includes(i)) continue;

        const distance = Math.abs(liftPositions[i] - requestedFloor);
        if (distance < minDistance) {
            minDistance = distance;
            nearestLift = i;
        }
    }

    return nearestLift;
}

function processLiftRequests() {
    if (floorRequests.length === 0) return;

    const request = floorRequests[0];
    const availableLift = findAvailableLift(request.floor);

    if (availableLift !== null) {
        const request = floorRequests.shift();
        moveLift(availableLift, request.floor, request.direction);
    }
}

function moveLift(liftIndex, targetFloor, direction) {
    inTransit.push(liftIndex);

    const floorHeight = 80;
    const gapBetweenFloor = 3;
    const liftElement = document.getElementById(`lift_${liftIndex}`);

    const moveY = -(targetFloor * (floorHeight + gapBetweenFloor));
    const currentFloor = liftPositions[liftIndex];
    const floorsToMove = Math.abs(currentFloor - targetFloor);
    const secondsPerFloor = 2;
    const travelTime = floorsToMove * secondsPerFloor;

    const liftLeft = liftElement.querySelector('.leftDoor');
    const liftRight = liftElement.querySelector('.rightDoor');

    function moveLiftToFloor() {
        liftElement.style.transition = `transform ${travelTime}s linear`;
        liftElement.style.transform = `translateY(${moveY}px)`;

        setTimeout(() => {
            liftPositions[liftIndex] = targetFloor;
            openDoorsAndProcess(liftIndex, liftLeft, liftRight, direction);
        }, travelTime * 1000);
    }

    if (liftStates[liftIndex] === 'open') {
        closeDoors(liftLeft, liftRight, moveLiftToFloor);
    } else {
        moveLiftToFloor();
    }
}

function openDoorsAndProcess(liftIndex, liftLeft, liftRight, direction) {
    openDoors(liftLeft, liftRight, () => {
        liftStates[liftIndex] = 'open';

        setTimeout(() => {
            closeDoors(liftLeft, liftRight, () => {
                liftStates[liftIndex] = 'closed';
                inTransit.splice(inTransit.indexOf(liftIndex), 1);
                
                const floor = liftPositions[liftIndex];
                
                updatePendingRequests(floor, direction, false);
                const button = document.getElementById(`${direction}Button_${floor}`);
                if (button) button.disabled = false;

                if (direction === 'up') {
                    upRequests.delete(floor);
                } else {
                    downRequests.delete(floor);
                }

                processLiftRequests();
            });
        }, 2500);
    });
}

function closeDoors(liftLeft, liftRight, callback) {
    liftLeft.style.transition = 'transform 2s ease';
    liftRight.style.transition = 'transform 2s ease';
    liftLeft.style.transform = 'translateX(0)';
    liftRight.style.transform = 'translateX(0)';

    setTimeout(callback, 2000);
}

function openDoors(liftLeft, liftRight, callback) {
    liftLeft.style.transition = 'transform 2s ease';
    liftRight.style.transition = 'transform 2s ease';
    liftLeft.style.transform = 'translateX(-100%)';
    liftRight.style.transform = 'translateX(100%)';

    setTimeout(callback, 2000);
}