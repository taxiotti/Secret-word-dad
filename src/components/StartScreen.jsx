import "./StartScreen.css";

const StartScreen = ({ startGame, difficulty, setDifficulty }) => {
  return (
    <div className="start">
      <h1>Escolha o nível de dificuldade</h1>

      <div className="difficulty-buttons">
        <button
          className={difficulty === "easy" ? "selected" : ""}
          onClick={() => setDifficulty("easy")}
        >
          Fácil (5 vidas)
        </button>

        <button
          className={difficulty === "hard" ? "selected" : ""}
          onClick={() => setDifficulty("hard")}>Difícil (2 vidas)</button>
      </div>

      <button className="start-btn" onClick={startGame}>Começar jogo</button>
    </div>
  );
};

export default StartScreen;
