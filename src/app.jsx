import * as React from 'react'; 
import { createRoot } from 'react-dom/client'; 

import '../src/assets/style.css'; 


//General use functions
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // Generate a random index
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const moveElem = (elem, x, y) => {
  if(!elem.x) return
  elem.x = elem.x + x
  elem.y = elem.y + y
  elem.sync()
}

const getTopAndBottomElemInGroup = async (elemArr) => {
  if(elemArr.length <= 1) return {top: null, bottom: null}
  let bottom, top, lowest, highest
  for(let elem of elemArr){
    const index = await elem.getLayerIndex()
    if(!lowest) {lowest = index; bottom = elem}
    else if(index < lowest) {lowest = index; bottom = elem}

    if(!highest) {highest = index; top = elem}
    else if(index > highest)  {highest = index; top = elem}
  }
  return {top, bottom}
}

const processGroups = async (fn = ()=>{}, type = "top") => {
  //If no groups or just one, return non group elements
  //If mre groups, return groups
  const deck = await miro.board.getSelection()
  if(deck.length === 0) return

  const isGroup = deck.filter(g => g.type === "group").length
  if(isGroup <= 1) return fn(deck.filter(g => g.type !== "group"))
  const groups = deck.filter(g => g.type === "group")
  let toSort = []
  for(let group of groups){
    const grouping = deck.filter(elem => group.itemsIds.includes(elem.id))
    if(type === "top"){
      const {top, _} = await getTopAndBottomElemInGroup(grouping)
      toSort.push(top)
    } else if (type === "groups"){
      toSort.push(grouping)
    }
  }
  fn(toSort)
}

const delay = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
}


//Actions
const roll = async () => {
  const times = Math.floor(Math.random() * 6) + 5; // Random number between 5 and 10
  for (let i = 0; i < times; i++) {
    await delay(100); // Wait 
    shuffle(); // Shuffle the array
  } 
}

const shuffle = async () => await processGroups(shuffleElements)
const pick = async () => await processGroups(pickFromArr)


async function flipAll(){
  const selectedGroup = await miro.board.getSelection()
  const groups = selectedGroup.filter(g => g.type === "group")
  for(let group of groups){
    const toInvert = selectedGroup.filter(elem => group.itemsIds.includes(elem.id))
    flipSingleGroup(toInvert)
  }
}

const stack = async () => {
  const selected = await miro.board.getSelection()
  const elems = selected.filter(e => e.x)
  let minX, maxX, minY, maxY
  for(let elem of elems){
    if(!minX || elem.x < minX) minX = elem.x 
    if(!maxX || elem.x > maxX) maxX = elem.x 
    if(!minY || elem.y < minY) minY = elem.y 
    if(!maxY || elem.y > maxY) maxY = elem.y
  }
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2

  for(let elem of elems){
    elem.x = centerX; elem.y = centerY
    elem.sync()
  }
}


//Particular logic
const shuffleElements = async (elemArr) => {
  if(elemArr.length === 0) return
  const shuffledElems = shuffleArray(elemArr)
  let lastElement = shuffledElems.at(-1)
  for(let i = 0; i < shuffledElems.length; i++){
    let current = shuffledElems[i]
    current.bringInFrontOf(lastElement)
    lastElement = current
  }
}

const flipSingleGroup = async (toInvert) => {
  const {top, bottom} = await getTopAndBottomElemInGroup(toInvert)
  if(!top || !bottom) return 
  await bottom.bringInFrontOf(top)
}


const pickFromArr = async(arr ) => {
  const randomIndex = Math.floor(Math.random() * arr.length); // Generate random index
  const picked = arr[randomIndex]
  await picked.bringToFront()
  await miro.board.deselect()
  await miro.board.select({id: picked.id})
}

const App = () => { 
    const [rad, setRad] = React.useState([10, 300])

    const spread = async () => {
      const process = (groupings) => {
        for(let elems of groupings){
          const x = getRandomNumber(parseInt(rad[0]), parseInt(rad[1])) * (Math.random() < 0.5 ? 1 : -1)
          const y = getRandomNumber(parseInt(rad[0]), parseInt(rad[1])) * (Math.random() < 0.5 ? 1 : -1)
          if(elems instanceof Array){
            for(let elem of elems) moveElem(elem, x, y)
          } else moveElem(elems, x, y)
        }
      }

      await processGroups(process, "groups")
    }
  
    return ( <div className="grid wrapper"> 
      <div className="cs1 ce12"> 
        <p>This app was developed by Azahar Games in Colombia. It allows you to design and test board ganes, but you can also find other creative uses</p>
        <button className="button button-primary"  onClick={()=>shuffle()}>
          Shuffle
        </button>
        <button className="button button-primary"  onClick={()=>roll()}>
          Roll
        </button>
        <button className="button button-primary"  onClick={()=>flipAll()}>
          Flip
        </button>
        <button className="button button-primary"  onClick={()=>stack()}>
          Stack
        </button>
        <button className="button button-primary"  onClick={()=>pick()}>
          Random Pick
        </button>

      </div> 
      <hr></hr>
      <div className="cs1 ce12"> 
        <button className="button button-primary"  onClick={()=>spread()}>
          Spread
        </button>
        <label>Range min-max (px):</label>
        <input type="number" min="0" value={rad[0]} onChange={(e)=>setRad([e.target.value, rad[1]])}></input>
        <input type="number" min="0" value={rad[1]} onChange={(e)=>setRad([rad[0], e.target.value])}></input>
      </div>
    </div> ); 
}; 

const container = document.getElementById('root'); 
const root = createRoot(container); 
root.render(<App />); 
