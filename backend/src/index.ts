import { WebSocketServer , WebSocket } from "ws";
const wss = new WebSocketServer({port : 8080});

type Movie = {
    id : string,
    title : string,
    poster_path : string,
  } | null

type Session = { 
    users: WebSocket[];
    swipes: Map<WebSocket, Set<string>>; 
    movieIdToUsers: Map<string, Set<WebSocket>>;
};

type Message = { 
    type: 'joinSession' | 'swipeRight';
    sessionId: string;
    movie?: Movie; 
};

interface sessionSocket extends WebSocket {
    sessionId?: string;
}



// const app = express(); app.use(cors());

// app.get('/', (_req, res) => { res.send('Real-time movie matcher backend is running'); });

// const server = http.createServer(app); const wss = new WebSocketServer({ server });

const sessions: Record<string, Session> = {};

wss.on('connection', (ws:sessionSocket) => { 
    ws.on('message', (message: string) => { 
        try { 
            const data: Message = JSON.parse(message);
            console.log(data)
            const { type, sessionId, movie } = data;

            if (type === 'joinSession') {
                if (!sessions[sessionId]) {
                    sessions[sessionId] = { 
                        users: [], 
                        swipes: new Map(),
                        movieIdToUsers: new Map()
                    };
                }
                sessions[sessionId].users.push(ws);
                sessions[sessionId].swipes.set(ws, new Set());
                ws.sessionId = sessionId;
                console.log(sessions)
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

// const PORT = process.env.PORT || 5000; server.listen(PORT, () => { console.log(Server is running on port ${PORT}); });