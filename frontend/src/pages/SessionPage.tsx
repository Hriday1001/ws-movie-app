import { useEffect, useRef, useState } from 'react'
import ReactTinderCard from '../components/ReactTinderCard/ReactTinderCard'
import { useParams } from 'react-router-dom'
// import "./App.css"

type Movie = {
  id : string,
  title : string,
  poster_path : string,
} | null

function SessionPage() {
  const wsRef = useRef<WebSocket | null>(null)
  const [sessionId , setSessionId] = useState("")
  const [movies, setMovies] = useState<Movie[]>([])
  const sessId = useParams()
  const [matchedMovie , setMatchedMovie] = useState<Movie>(null)

  const swipeRight = (sessionId : string , movie : Movie) => {
    wsRef.current?.send(JSON.stringify({
      type : "swipeRight",
      sessionId : sessionId,
      movie : movie
    }))
  }

  const shuffle = (array: Movie[]) => {
    let currentIndex = array.length, randomIndex

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex--
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
    }

    return array
  }

  useEffect(()=>{
    const ws = new WebSocket("wss://ws-movie-app.onrender.com");
    setSessionId(sessId.sessionId as string)

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type : "joinSession",
        sessionId : sessionId
      }))
    }

    ws.onmessage = (msg)=>{
      const data = JSON.parse(msg.data)
      if(data.type == "matchFound"){
        console.log('matchFound')
        console.log(data.movie )
        setMatchedMovie(data.movie)
      }

      if (data.type === "sessionMovies") {
        const shuffled = shuffle(data.movies);
        setMovies(shuffled);
        console.log(shuffled)
        // setCurrentIndex(0);
      }
    }

    wsRef.current = ws

    return ()=>{
      ws.close()
    }

  } , [sessionId])

  return (
    <>
      <div className='flex flex-col items-center'>
        <div>
          {sessionId}
        </div>

      <div className='mt-20'>
        <ReactTinderCard characters={movies} onSwipeRight = {(movie : Movie) => {
          swipeRight(sessionId , movie)
        }}/>
      </div>
      </div>

      {matchedMovie && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg w-96 shadow-lg text-center space-y-4"> Match found : {matchedMovie.title}
                    <div style={{ backgroundImage: 'url(' + `https://image.tmdb.org/t/p/w500${matchedMovie.poster_path}` + ')' }} className='card mx-4'></div>
                    <button onClick={() => {
                      setMatchedMovie(null)
                    }}> Cancel </button>
                    </div>
                    
          </div>
      )}

     
    </>
  )
}

export default SessionPage