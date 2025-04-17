"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
// const app = express(); app.use(cors());
// app.get('/', (_req, res) => { res.send('Real-time movie matcher backend is running'); });
// const server = http.createServer(app); const wss = new WebSocketServer({ server });
const sessions = {};
wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        var _a;
        try {
            const data = JSON.parse(message);
            console.log(data);
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
                console.log(sessions);
            }
            if (type === 'swipeRight' && movie) {
                const session = sessions[sessionId];
                if (!session)
                    return;
                (_a = session.swipes.get(ws)) === null || _a === void 0 ? void 0 : _a.add(movie.id);
                if (!session.movieIdToUsers.has(movie.id)) {
                    session.movieIdToUsers.set(movie.id, new Set());
                }
                const swipedOnMovie = session.movieIdToUsers.get(movie.id);
                swipedOnMovie === null || swipedOnMovie === void 0 ? void 0 : swipedOnMovie.add(ws);
                if (swipedOnMovie && swipedOnMovie.size >= 2) {
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
