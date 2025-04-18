import { useEffect, useRef, useState } from 'react'
import ReactTinderCard from '../components/ReactTinderCard/ReactTinderCard'
import axios from 'axios'
import { useParams } from 'react-router-dom'
// import "./App.css"

type Movie = {
  id : string,
  title : string,
  poster_path : string,
} | null

function SessionPage() {
  const wsRef = useRef<WebSocket>(null)
  const [sessionId , setSessionId] = useState("")
  const [movies, setMovies] = useState([])
  const sessId = useParams()
  const [matchedMovie , setMatchedMovie] = useState<Movie>(null)

  const swipeRight = (sessionId : string , movie : Movie) => {
    wsRef.current?.send(JSON.stringify({
      type : "swipeRight",
      sessionId : sessionId,
      movie : movie
    }))
  }

  useEffect(()=>{
    const ws = new WebSocket("ws://localhost:8080")
    // const sessionId = generateToken()
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
    }

    wsRef.current = ws

    const fetchMovies = async () => {
      try {
        console.log(import.meta.env.VITE_TMDB_API_KEY)
        const res = await axios.get(
          'https://api.themoviedb.org/3/discover/movie',
          {
            params: {
              api_key: import.meta.env.VITE_TMDB_API_KEY,
              with_original_language: 'hi',
              sort_by: 'popularity.desc',
              with_watch_providers: '8|2336|119',
              watch_region: 'IN',
            },
          }
        )
        setMovies(res.data.results)
      } catch (err) {
        console.error('Error fetching movies:', err)
      }
    }

    fetchMovies()

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