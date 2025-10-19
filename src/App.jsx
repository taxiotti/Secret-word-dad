import { useCallback, useEffect, useState } from "react";

// components
import StartScreen from "./components/StartScreen";
import Game from "./components/Game";
import GameOver from "./components/GameOver";

// styles
import "./App.css";

// data
import { wordsList } from "./data/words";

const stages = [
  { id: 1, name: "start" },
  { id: 2, name: "game" },
  { id: 3, name: "end" },
];

function App() {
  const [difficulty, setDifficulty] = useState("easy");
  const [gameStage, setGameStage] = useState(stages[0].name);
  const [words] = useState(wordsList);

  const [pickedWord, setPickedWord] = useState("");
  const [pickedCategory, setPickedCategory] = useState("");
  const [letters, setLetters] = useState([]);

  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongLetters, setWrongLetters] = useState([]);
  const [guesses, setGuesses] = useState(3);
  const [score, setScore] = useState(0);

  const pickWordAndCategory = useCallback(async () => {
    try {
      const response = await fetch("https://random-word-api.herokuapp.com/word?lang=pt-br&number=1");  
      const data = await response.json();
      const word = data[0];

      const category = "Aleatória";

      return { category, word };
    } catch (error) {
      console.error("Erro ao buscar palavra da API, usando fallback:", error);
      const categories = Object.keys(words);
      const categoryFallback =
        categories[Math.floor(Math.random() * categories.length)];
      const wordFallback =
        words[categoryFallback][
          Math.floor(Math.random() * words[categoryFallback].length)
        ];
      return { category: categoryFallback, word: wordFallback };
    }
  }, [words]);

  const startGame = useCallback(async () => {
    setGuessedLetters([]);
    setWrongLetters([]);

    const { category, word } = await pickWordAndCategory();

    let wordLetters = word.split("");
    wordLetters = wordLetters.map((l) => l.toLowerCase());

    setPickedCategory(category);
    setPickedWord(word);
    setLetters(wordLetters);

    if (difficulty === "easy") {
      setGuesses(5);
    } else if (difficulty === "hard") {
      setGuesses(2);
    } else {
      setGuesses(3);
    }

    setGameStage(stages[1].name);
  }, [pickWordAndCategory, difficulty]);

  const verifyLetter = (letter) => {
    const normalizedLetter = letter.toLowerCase();

    if (
      guessedLetters.includes(normalizedLetter) ||
      wrongLetters.includes(normalizedLetter)
    ) {
      return;
    }

    if (letters.includes(normalizedLetter)) {
      setGuessedLetters((actualGuessedLetters) => [
        ...actualGuessedLetters,
        normalizedLetter,
      ]);
    } else {
      setWrongLetters((actualWrongLetters) => [
        ...actualWrongLetters,
        normalizedLetter,
      ]);

      setGuesses((actualGuesses) => actualGuesses - 1);
    }
  };

  const retry = () => {
    setScore(0);
    setGuesses(3);
    setGameStage(stages[0].name);
  };

  useEffect(() => {
    if (guesses === 0) {
      const currentHighScore = parseInt(localStorage.getItem("highscore")) || 0;

      if (score > currentHighScore) {
        localStorage.setItem("highscore", score);
      }

      setGuessedLetters([]);
      setWrongLetters([]);
      setGameStage(stages[2].name);
    }
  }, [guesses, score]);

  useEffect(() => {
    const uniqueLetters = [...new Set(letters)];

    if (letters.length > 0 && guessedLetters.length === uniqueLetters.length) {
      setScore((actualScore) => actualScore + 100);
      startGame();
    }
  }, [guessedLetters, letters, startGame]);

  return (
    <div className="App">
      {gameStage === "start" && (
        <StartScreen
          startGame={startGame}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
        />
      )}
      {gameStage === "game" && (
        <Game
          verifyLetter={verifyLetter}
          pickedWord={pickedWord}
          pickedCategory={pickedCategory}
          letters={letters}
          guessedLetters={guessedLetters}
          wrongLetters={wrongLetters}
          guesses={guesses}
          score={score}
        />
      )}
      {gameStage === "end" && <GameOver retry={retry} score={score} />}
    </div>
  );
}

export default App;
