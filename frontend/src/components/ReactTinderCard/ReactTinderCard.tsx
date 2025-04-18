import TinderCard from 'react-tinder-card'
import { useState, useEffect } from 'react'
import './TinderCards.css'

//@ts-ignore
function ReactTinderCard({characters , onSwipeRight}){
  const [lastDirection, setLastDirection] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  const swiped = (direction : string, nameToDelete : string , index : number) => {
    console.log('removing: ' + nameToDelete)
    setLastDirection(direction)
    setCurrentIndex(index - 1)
    if (direction == "right"){
      const movie = characters[index]
      console.log(movie.id)
      onSwipeRight({
        id : movie.id,
        title : movie.title,
        poster_path : movie.poster_path
      })
    }
  }

  useEffect(() => {
    if (characters?.length > 0) {
      setCurrentIndex(characters.length - 1)
    }
  }, [characters])

  const outOfFrame = (name : string) => {
    console.log(name + ' left the screen!')
  }

  return (
    <div className='flex flex-col items-center space-y-4'>
      <link href='https://fonts.googleapis.com/css?family=Damion&display=swap' rel='stylesheet' />
      <link href='https://fonts.googleapis.com/css?family=Alatsi&display=swap' rel='stylesheet' />
      <div className='cardContainer'>
        {//@ts-ignore
        characters.map((character, index : number) =>
          <TinderCard className='swipe' key={character.name} onSwipe={(dir) => swiped(dir, character.name , index)} onCardLeftScreen={() => outOfFrame(character.name)}>
            <div style={{ backgroundImage: 'url(' + `https://image.tmdb.org/t/p/w500${character.poster_path}` + ')' }} className='card'>
            </div>
          </TinderCard>
          
        )}
      
      </div>

      {currentIndex >= 0 && (
        <div className="text-center mt-20 max-w-200 ml-15">
          <h2 className="text-xl font-semibold">{characters[currentIndex]?.title}</h2>
          <h3 className="mt-2 text-md font-normal max-h-32 overflow-hidden text-ellipsis line-clamp-3">{characters[currentIndex]?.overview}</h3>
        </div>
      )}
      
      {lastDirection ? <h2 className='infoText'>You swiped {lastDirection}</h2> : <h2 className='infoText' />}
    </div>
  )
}

export default ReactTinderCard

