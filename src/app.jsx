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

const getTopAndBottomElemInGroup = async (elemArr, log = false) => {
  if(elemArr.length <= 1) return {top: null, bottom: null, second: null}
  console.log("begin")
  let bottom, top, lowest, highest, second, secHighest
  for(let elem of elemArr){
    if(log) console.log("elem", elem)
    const index = await elem.getLayerIndex()
    if(log) console.log("index", index)
    if(!lowest) {lowest = index; bottom = elem}
    else if(index < lowest) {lowest = index; bottom = elem}

    if(!highest) {highest = index; top = elem}
    else if(index > highest)  {highest = index; top = elem}

    if(!secHighest) {secHighest = index; second = elem}
    else if(index > secHighest && index < highest)  {secHighest = index; second = elem}
  }
  if(log) console.log("top", top)
  return {top, bottom, second}
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
  let selection = await miro.board.getSelection()
  if(selection.length === 0) return
  selection = selection.filter(g => g.type !== "group")

  const times = Math.floor(Math.random() * 6) + 5; // Random number between 5 and 10
  for (let i = 0; i < times; i++) {
    await delay(100); // Wait 
    const randomIndex = Math.floor(Math.random() * selection.length); // Generate random index
    const picked = selection[randomIndex]
    await picked.bringToFront() 
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

async function unFlipAll(){
  const selectedGroup = await miro.board.getSelection()
  const groups = selectedGroup.filter(g => g.type === "group")
  for(let group of groups){
    const toInvert = selectedGroup.filter(elem => group.itemsIds.includes(elem.id))
    unflipSingleGroup(toInvert)
  }
}

const getCenterCoordOfElements = (elems) => {
  let minX, maxX, minY, maxY

  //get center of all elements
  for(let elem of elems){
    if(!minX || elem.x < minX) minX = elem.x 
    if(!maxX || elem.x > maxX) maxX = elem.x 
    if(!minY || elem.y < minY) minY = elem.y 
    if(!maxY || elem.y > maxY) maxY = elem.y
  }
  return [(minX + maxX) / 2,  (minY + maxY) / 2]
}

const stack = async () => {
  const selected = await miro.board.getSelection()
  const elems = selected.filter(e => e.x)
  const [centerX, centerY] = getCenterCoordOfElements(elems)

  //Now, we should move elements. If in group, we should move them using relative movement
  let moved = [] //saves Ids of moved elements
  for(let elem of elems){
    if(moved.includes(elem.id)) continue //avoid moving an element of already moved
    if (elem.groupId){
      //get relative positions of elements to center coordinates of move with offset
      const group = await miro.board.getById(elem.groupId)
      const groupElems = await miro.board.get({id: group.itemsIds})
      const [gCenterX, gCenterY] = getCenterCoordOfElements(groupElems)
      for(let elem of groupElems){
        //get the offset, the move to center with offset
        const xOffset = gCenterX - elem.x
        const yOffset = gCenterY - elem.y
        elem.x = centerX - xOffset
        elem.y = centerY - yOffset
        elem.sync()
        moved.push(elem.id)
      }
    } else {
      //move element to center coordinates
      elem.x = centerX; elem.y = centerY
      elem.sync()
    }
  }
}


//Particular logic
const shuffleElements = async (elemArr) => {
  if(elemArr.length === 0) return
  const shuffledElems = shuffleArray(elemArr)
  let lastElement = shuffledElems.at(-1)
  for(let i = 0; i < shuffledElems.length; i++){
    let current = shuffledElems[i]
    //We should send all elements in the group to the front
    const grouped = await getElemArrayOrSingle(current)
    await miro.board.bringInFrontOf(grouped, lastElement)
    lastElement = current
  }
}

const getElemArrayOrSingle = async (elem) => {
  if(!elem.groupId) return elem
  const group = await miro.board.getById(elem.groupId)
  const groupElems = await miro.board.get({id: group.itemsIds})
  return groupElems
}



const flipSingleGroup = async (toInvert) => {
  const {top, bottom, _} = await getTopAndBottomElemInGroup(toInvert)
  if(!top || !bottom) return 
  await top.sendBehindOf(bottom)
}

const unflipSingleGroup = async (toInvert) => {
  const {top, bottom, _} = await getTopAndBottomElemInGroup(toInvert)
  if(!top || !bottom) return 
  await bottom.bringInFrontOf(top)
}


const pickFromArr = async(arr ) => {
  const randomIndex = Math.floor(Math.random() * arr.length); // Generate random index
  let picked = arr[randomIndex]

  let ids = picked.id
  if(picked.groupId){
    const group = await miro.board.getById(picked.groupId)
    picked = await miro.board.get({id: group.itemsIds})
    for(let el of picked){el.x += 50; el.y += 50; el.sync()}
    ids = picked.map(e => e.id)
  } else {
    picked.x += 50; picked.y += 50
    picked.sync()
  }

  await miro.board.bringToFront(picked)
  await miro.board.deselect()
  await miro.board.select({id: ids})
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
        <button className="button button-primary"  onClick={()=>unFlipAll()}>
          Unflip
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
