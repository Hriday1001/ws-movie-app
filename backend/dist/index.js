"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const ws_1 = require("ws");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: '*'
}));
app.get('/', (req, res) => {
    res.send('Real-time movie matcher backend is running');
});
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ server });
const sessions = {};
function fetchMoviesForSession() {
    return __awaiter(this, void 0, void 0, function* () {
        const API_KEY = process.env.TMDB_API_KEY;
        const totalReqPages = 2;
        const allMovies = [];
        console.log(API_KEY);
        const res = yield fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_original_language=hi&sort_by=popularity.desc&with_watch_providers=8|2336|119&watch_region=IN&primary_release_date.gte=2010-01-01`);
        const data = yield res.json();
        const totalPages = data.total_pages;
        console.log(totalPages);
        for (let page = 0; page < totalReqPages; page++) {
            const pageNo = Math.floor(Math.random() * totalPages) + 1;
            const res = yield fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_original_language=hi&sort_by=popularity.desc&with_watch_providers=8|2336|119&watch_region=IN&primary_release_date.gte=2010-01-01&page=${pageNo}`);
            const data = yield res.json();
            if (data === null || data === void 0 ? void 0 : data.results) {
                allMovies.push(...data.results);
            }
        }
        return allMovies.slice(0, 40);
    });
}
wss.on('connection', (ws) => {
    ws.on('message', (message) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const data = JSON.parse(message);
            console.log(data);
            const { type, sessionId, movie } = data;
            if (type === 'joinSession') {
                const movieBatch = yield fetchMoviesForSession();
                if (!sessions[sessionId]) {
                    sessions[sessionId] = {
                        users: [],
                        swipes: new Map(),
                        movieIdToUsers: new Map(),
                        movies: movieBatch
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
    }));
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
