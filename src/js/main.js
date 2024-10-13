const submit = document.getElementById('submitForm');

const inTransit = [];

document.querySelector('form').addEventListener("submit", (e)=>{
    e.preventDefault();
    let floors = parseInt(document.getElementById('numOfFloors').value);
    let lifts = parseInt(document.getElementById('numOfLifts').value);

    console.log('you submitted with floors ' + floors + " and lifts: "+ lifts) ;
    generateFloors(floors, lifts);
})

let liftPositions = [];

function generateFloors(floorCount, liftCount){

    const floorContainer = document.getElementById('floorContainer');
    floorContainer.innerHTML = " ";
    
    if(liftCount >  floorCount){
        alert("Come on, You should not  have more lifts than floor.")
        liftCount.textContent = "";
        floorCount.textContent= "";
        return;
    }
    liftPositions = Array(liftCount).fill(0);

    for(let i=0; i<floorCount; i++){
        const floors = document.createElement('div');
        floors.className = 'floors';
        floors.textContent = `${i+1} floor`

        const buttons = document.createElement('div');
        buttons.className = 'buttons';

        const upButton = document.createElement('button');
        upButton.id = 'upButton';
        upButton.textContent = 'Up';
        upButton.addEventListener('click', ()=> requestLift(i));

        const downButton = document.createElement('button');
        downButton.id = 'downButton';
        downButton.textContent = 'Down';
        downButton.addEventListener('click', ()=> requestLift(i));

        if(floorCount-1!=i){
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


const requestLift = ( requestedFloor )=> {
    const nearestLift = findNearestLift(requestedFloor);
    moveLift(nearestLift, requestedFloor);
};

const findNearestLift =(requestedFloor) => {
    let nearestLift = 0;
    let minDistance = Math.abs(liftPositions[0] - requestedFloor);

    for(let i=0; i<liftPositions.length; i++){
        if(inTransit.includes(i)){
            continue;
        }
        const distance = Math.abs(liftPositions[i] - requestedFloor);
        if(distance < minDistance){
            minDistance = distance;
            nearestLift = i;
        }
    }
    inTransit.push(nearestLift);
    return nearestLift;
};

const moveLift = (liftIndex, targetFloor) =>{

    
    const floorHeight = 100;
    const gapBetweenFloor = 2;
    const liftElement = document.querySelectorAll('.lift')[liftIndex];

    const moveY = -(targetFloor * (floorHeight + gapBetweenFloor));

    const currentFloor = liftPositions[liftIndex];
    const floorsToMove  = Math.abs(currentFloor - targetFloor);

    const travelTime = floorsToMove * 3;

    liftElement.style.transition = `transform ${travelTime}s ease`;
    liftElement.style.transform = `translateY(${moveY}px)`;

    var liftLeft = liftElement.querySelector('.leftDoor');
    var liftRight = liftElement.querySelector('.rightDoor');
    
    liftPositions[liftIndex] = targetFloor;
    liftRight.classList.remove('openRight');
    liftLeft.classList.remove('openLeft');

    liftRight.classList.remove('closeRight');
    liftLeft.classList.remove('closeLeft');

    setTimeout(()=>{
        console.log(liftElement);
        liftRight.classList.add('openRight');
        liftLeft.classList.add('openLeft');
        setTimeout(()=>{
            console.log(liftElement);
            liftRight.classList.add('closeRight');
            liftLeft.classList.add('closeLeft');
        }, 2500);
    }, travelTime * 1000);
    
    inTransit.pop(liftIndex);
};  


const openDoors = (liftElement) => {
    liftElement.classList.add('open');
    setTimeout(()=>{
        closeDoors(liftElement);
    }, 2000);
};

const closeDoors = (liftElement) => {
    liftElement.classList.remove('open');
    liftElement.classList.add('close');
}

const updateLiftDisplay = () => {
    const liftContainers = document.querySelectorAll('.liftContainer');

    liftContainers.forEach((container, floorIndex) => {

        container.innerHTML = '';

        liftPositions.forEach((position, liftIndex) => {

            if (position === floorIndex) {
                const lift = document.createElement('div');
                lift.className = 'lift';
                container.appendChild(lift);
            }
        });
    });
}
