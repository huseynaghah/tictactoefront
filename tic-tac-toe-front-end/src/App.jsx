import './App.css'
import { useState, useEffect } from "react";
import io from "socket.io-client";

// Socket server-ə qoşulma
const socket = io("http://localhost:3000");

function App() {
    const [gameId, setGameId] = useState("");               // Game ID
    const [currentPlayer, setCurrentPlayer] = useState("");  // Cari oyunçu
    const [gameStatus, setGameStatus] = useState("");       // Oyun statusu
    const [board, setBoard] = useState(Array(9).fill(""));  // 3x3 board
    const [isGameOver, setIsGameOver] = useState(false);    // Oyun bitibmi
    const [inputGameId, setInputGameId] = useState("");     // İstifadəçinin daxil etdiyi game ID

    // Game yaratmaq
    const createGame = () => {
        socket.emit("create_game");
    };

    // Oyuna qoşulmaq
    const joinGame = () => {
        if (inputGameId) {
            socket.emit("join_game", inputGameId);
            setGameId(inputGameId);  // Game ID state-nu yeniləyirik
        }
    };

    // Gediş etmək
    const makeMove = (index) => {
        if (!board[index] && !isGameOver) {
            socket.emit("make_move", gameId, index);
        }
    };

    // Socket event listener'ları
    useEffect(() => {
        socket.on("game_created", (id) => {
            setGameId(id);
            setCurrentPlayer("X");
            setGameStatus("Waiting for second player...");
        });

        socket.on("game_started", (id) => {
            setGameId(id);
            if (currentPlayer != "X"){
                setCurrentPlayer("O");
            }
            setGameStatus("Game started!");
        });

        socket.on("game_full", () => {
            setGameStatus("Game is full!");
        });

        socket.on("update_board", (updatedBoard) => {
            setBoard(updatedBoard);
        });

        socket.on("game_over", (message) => {
            setIsGameOver(true);
            alert(message); // Display winner or draw
        });

        return () => {
            socket.off("game_created");
            socket.off("game_started");
            socket.off("game_full");
            socket.off("update_board");
            socket.off("game_over");
        };
    }, [gameId, board, isGameOver]);

    return (
        <div className="App">
            <h1>Tic Tac Toe</h1>

            {/* Game yaratmaq */}
            {!gameId && !currentPlayer && (
                <div>
                    <button onClick={createGame}>Create Game</button>
                </div>
            )}

            {/* Oyuna qoşulmaq */}
            {!gameId && !currentPlayer && (
                <div>
                    <input
                        type="text"
                        placeholder="Enter Game ID"
                        value={inputGameId} // Bu input-un dəyəri state ilə idarə olunur
                        onChange={(e) => setInputGameId(e.target.value)} // input dəyərini state ilə yeniləyirik
                    />
                    <button onClick={joinGame}>Join Game</button>
                </div>
            )}

            {/* Game status və current player */}
            {gameId && currentPlayer && !isGameOver && (
                <div>
                    <h3>Game ID: {gameId}</h3>
                    <h4>Current Player: {currentPlayer}</h4>
                    <h5>{gameStatus}</h5>
                </div>
            )}

            {/* Game board */}

            { gameId && currentPlayer && (
            <div id="boardContainer">
            <div className="board">
                {board.map((mark, index) => {
                    console.log(mark);
                    return (
                    <div
                        key={index}
                        className="cell"
                        onClick={() => makeMove(index)}
                        data-cell-index={index}
                    >
                       <h1 style={mark == "X" ? {color: "red"} : {color: "blue"}}>{mark}</h1>
                    </div>
                )})}
            </div>
            </div>)}
        </div>
    );
}

export default App;
