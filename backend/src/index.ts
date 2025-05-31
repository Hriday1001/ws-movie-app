import express, { Request, Response } from "express";
import http from "http";
import cors from "cors";
import { WebSocketServer , WebSocket } from "ws";
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors({
    origin: '*'
}));

app.get('/', (req : Request, res : Response) => {
    res.send('Real-time movie matcher backend is running');
});
  
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

type Movie = {
    id : string,
    title : string,
    poster_path : string,
  } | null

type Session = { 
    users: WebSocket[];
    swipes: Map<WebSocket, Set<string>>; 
    movieIdToUsers: Map<string, Set<WebSocket>>;
    movies : Movie[];
};

type Message = { 
    type: 'joinSession' | 'swipeRight';
    sessionId: string;
    movie?: Movie; 
};

interface sessionSocket extends WebSocket {
    sessionId?: string;
}

const sessions: Record<string, Session> = {};

async function fetchMoviesForSession(): Promise<Movie[]> {
    const API_KEY = process.env.TMDB_API_KEY;
    const totalReqPages = 2; 
    const allMovies: Movie[] = [];

    console.log(API_KEY)

    const res = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_original_language=hi&sort_by=popularity.desc&with_watch_providers=8|2336|119&watch_region=IN&primary_release_date.gte=2020-01-01`);
    const data = await res.json();
    const totalPages = data.total_pages
    console.log(totalPages)

    for (let page = 0; page < totalReqPages; page++) {
        const pageNo = Math.floor(Math.random() * totalPages) + 1
        const res = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_original_language=hi&sort_by=popularity.desc&with_watch_providers=8|2336|119&watch_region=IN&primary_release_date.gte=2020-01-01&page=${pageNo}`);
        const data = await res.json();
        if (data?.results) {
            allMovies.push(...data.results);
        }
    }

    return allMovies.slice(0, 40);
}

wss.on('connection', (ws:sessionSocket) => { 
    ws.on('message', async (message: string) => { 
        try { 
            const data: Message = JSON.parse(message);
            console.log(data)
            const { type, sessionId, movie } = data;

            if (type === 'joinSession') {
                const movieBatch = await fetchMoviesForSession()
                if (!sessions[sessionId]) {
                    sessions[sessionId] = { 
                        users: [], 
                        swipes: new Map(),
                        movieIdToUsers: new Map(),
                        movies : movieBatch
                    };
                }
                sessions[sessionId].users.push(ws);
                sessions[sessionId].swipes.set(ws, new Set());
                ws.sessionId = sessionId;
                ws.send(JSON.stringify({
                    type: 'sessionMovies',
                    movies: sessions[sessionId].movies,
                }));
            }

            if (type === 'swipeRight' && movie) {
                const session = sessions[sessionId];
                if (!session) return;

                session.swipes.get(ws)?.add(movie.id);

                if (!session.movieIdToUsers.has(movie.id)) {
                    session.movieIdToUsers.set(movie.id, new Set());
                }

                const swipedOnMovie = session.movieIdToUsers.get(movie.id)
                swipedOnMovie?.add(ws)

                if(swipedOnMovie && swipedOnMovie.size >= 2){
                    const matchMessage = JSON.stringify({ 
                        type: 'matchFound',
                        movie
                    });
                    session.users.forEach(u => u.send(matchMessage));
                }
            }

                // if ((swipedOnMovie).size >= 2) {
                //     const matchMessage = JSON.stringify({ 
                //         type: 'matchFound',
                //         movieId 
                //     });
                //     session.users.forEach(u => u.send(matchMessage));
                // }
        }
        catch (err) {
            console.error('Failed to process message:', err);
        }

    });

    ws.on('close', () => {
        const sessionId = ws.sessionId;
        if (sessionId && sessions[sessionId]) { 
            const session = sessions[sessionId]; 
            session.users = session.users.filter(user => user !== ws); 
            session.swipes.delete(ws); 
            if (session.users.length === 0) { 
                delete sessions[sessionId]; 
            } 
        }
    });
});

const PORT = parseInt(process.env.PORT || "8080", 10);
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
