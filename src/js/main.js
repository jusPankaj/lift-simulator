const submit = document.getElementById('submitForm');

const inTransit = [];
let liftPositions = [];
let floorRequests = [];
let liftStates = [];
let floorsBeingServed = [];


document.querySelector('form').addEventListener("submit", (e)=>{
    e.preventDefault();
    let floors = parseInt(document.getElementById('numOfFloors').value);
    let lifts = parseInt(document.getElementById('numOfLifts').value);

    console.log('you submitted with floors ' + floors + " and lifts: "+ lifts) ;
    generateFloors(floors, lifts);
})



function generateFloors(floorCount, liftCount){

    const floorContainer = document.getElementById('floorContainer');
    floorContainer.innerHTML = " ";
    
    if(liftCount >  floorCount){
        alert("Come on, You should not  have more lifts than floor.")
        return;
    }
    liftPositions = Array(liftCount).fill(0);
    liftStates = Array(liftCount).fill('closed');

    for(let i=0; i<floorCount; i++){
        const floors = document.createElement('div');
        floors.className = 'floors';
        floors.textContent = `${i+1} floor`

        const buttons = document.createElement('div');
        buttons.className = 'buttons';

        const upButton = document.createElement('button');
        upButton.id = `upButton_${i}`;
        upButton.textContent = 'Up';
        upButton.addEventListener('click', ()=> requestLift(i));

        const downButton = document.createElement('button');
        downButton.id = `downButton_${i}`;
        downButton.textContent = 'Down';
        downButton.addEventListener('click', ()=> requestLift(i));

        if(floorCount-1 != i){
            buttons.appendChild(upButton);
        }
        if(i!=0){
            buttons.appendChild(downButton);
        }

        const liftContainer = document.createElement('div');
        liftContainer.className = 'liftContainer';

        if(i==0){
            for(liftIndex = 0; liftIndex < liftCount; liftIndex++){
                const lift = document.createElement('lift');
                lift.className = 'lift';   
                lift.id = `lift_${liftIndex}`
                
                const leftDoor = document.createElement('div');
                leftDoor.className = 'leftDoor'

                const rightDoor = document.createElement('div');
                rightDoor.className = 'rightDoor'

                lift.appendChild(leftDoor);
                lift.appendChild(rightDoor);
                liftContainer.appendChild(lift);
            }    
    }
        floors.appendChild(buttons);
        floors.appendChild(liftContainer)
        floorContainer.appendChild(floors);
    }
}


const requestLift = (requestedFloor) => {
    if (!floorRequests.includes(requestedFloor) && !floorsBeingServed.includes(requestedFloor)) {
        floorRequests.push(requestedFloor);
        processLiftRequests();
    }
};


const processLiftRequests = () => {
    while (floorRequests.length > 0) {
        const requestedFloor = floorRequests[0];
        const availableLift = findAvailableLift(requestedFloor);

        if (availableLift !== null) {
            floorRequests.shift();
            floorsBeingServed.push(requestedFloor); 
            moveLift(availableLift, requestedFloor);
        } else {
            break;
        }
    }
};


const findAvailableLift = (requestedFloor) => {
    let nearestLift = null;
    let minDistance = Infinity;

    for (let i = 0; i < liftPositions.length; i++) {
        if (inTransit.includes(i)) {
            continue;
        }

        const distance = Math.abs(liftPositions[i] - requestedFloor);

        if (distance < minDistance) {
            minDistance = distance;
            nearestLift = i;
        }
    }

    return nearestLift;
};


const moveLift = (liftIndex, targetFloor) =>{

    inTransit.push(liftIndex);


    const floorHeight = 100;
    const gapBetweenFloor = 2;
    const liftElement = document.querySelectorAll('.lift')[liftIndex];

    const moveY = -(targetFloor * (floorHeight + gapBetweenFloor));

    const currentFloor = liftPositions[liftIndex];
    const floorsToMove  = Math.abs(currentFloor - targetFloor);
    const travelTime = floorsToMove * 2;

    var liftLeft = liftElement.querySelector('.leftDoor');
    var liftRight = liftElement.querySelector('.rightDoor');


    const moveLiftToFloor = () => {
            liftElement.style.transition = `transform ${travelTime}s ease`;
            liftElement.style.transform = `translateY(${moveY}px)`;

            setTimeout(() => {
                liftPositions[liftIndex] = targetFloor;
                openDoorsAndProcess(liftIndex, liftLeft, liftRight);
            }, travelTime * 1000);
    };


    if(liftStates[liftIndex] === 'open'){
        closeDoors(liftLeft, liftRight, moveLiftToFloor);
    }else{
        moveLiftToFloor();
    }
    
};  



const openDoorsAndProcess = (liftIndex, liftLeft, liftRight) => {
    openDoors(liftLeft, liftRight, () => {
        liftStates[liftIndex] = 'open';

        setTimeout(() => {
            closeDoors(liftLeft, liftRight, () => {
                liftStates[liftIndex] = 'closed';
                inTransit.splice(inTransit.indexOf(liftIndex), 1);

                floorsBeingServed.splice(floorsBeingServed.indexOf(liftPositions[liftIndex]), 1);
                processLiftRequests();
            });
        }, 2500);
    });
};

const closeDoors = (liftLeft, liftRight, callback) => {
    liftRight.style.transition = 'transform 2s ease';
    liftLeft.style.transition = 'transform 2s ease';
    liftRight.style.transform = 'translateX(0)';
    liftLeft.style.transform = 'translateX(0)';

    setTimeout(() => {
        callback();
    }, 2000);
};


const openDoors = (liftLeft, liftRight, callback) => {
    liftRight.style.transition = 'transform 2s ease';
    liftLeft.style.transition = 'transform 2s ease';
    liftRight.style.transform = 'translateX(100%)';
    liftLeft.style.transform = 'translateX(-100%)';

    setTimeout(() => {
        callback();
    }, 2000);
};

