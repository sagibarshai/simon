import { useEffect, useRef, useState } from "react";
import styled, { css } from "styled-components";
import axios from "axios";
import Button, { SoundsId, Props } from "./Button";

type Player = "computer" | "user";

interface StyledPlayerStatus {
  current: Player | null;
  id: Player;
}

interface ScoreServerResponse {
  highestScore: number;
}

const randomOneToFour = (): SoundsId =>
  String(Math.floor(Math.random() * 4) + 1) as SoundsId;

const Game: React.FC = () => {
  const [computerMoves, setComputerMoves] = useState<SoundsId[]>([]);
  const [userMoves, setUserMoves] = useState<SoundsId[]>([]);
  const [active, setActive] = useState<null | SoundsId>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [highestScore, setHighestScore] = useState<number>(0);

  const audioRefs = Array(4).fill(useRef<HTMLAudioElement>(null));
  useEffect(() => {
    const fetchScore = async () => {
      try {
        const res = await getScore();
        const { highestScore } = res.data;
        setHighestScore(highestScore);
      } catch (e) {
        throw new Error("fetch error");
      }
    };
    fetchScore();
  }, []);

  useEffect(() => {
    checkUserMoves();
  }, [userMoves]);

  const getScore = async () => {
    return await axios.get<ScoreServerResponse>(
      "http://localhost:4000/api/score"
    );
  };

  const updateScore = async () => {
    const score = { score: currentScore };
    return await axios.post<ScoreServerResponse>(
      "http://localhost:4000/api/score",
      score
    );
  };

  const start = () => {
    setCurrentScore(0);
    setGameOver(false);
    if (computerMoves.length === 0) {
      setTimeout(() => {
        setCurrentPlayer("user");
      }, 1000);
      const randomChoice = randomOneToFour();
      setComputerMoves([randomChoice]);
      soundHandler(randomChoice);
      setActive(randomChoice);
      setTimeout(() => {
        setActive(null);
        if (gameOver) return;
        setCurrentPlayer("user");
      }, 1000);
    }
  };

  const end = async () => {
    setGameOver(true);
    setUserMoves([]);
    setComputerMoves([]);
    setCurrentPlayer(null);
    setActive(null);
    try {
      const res = await updateScore();
      const { highestScore } = res.data;
      setHighestScore(highestScore);
    } catch (err) {
      throw new Error("fetch error");
    }
  };

  const userHandler = (id: SoundsId) => {
    if (currentPlayer !== "user") return;
    if (gameOver) return;
    soundHandler(id);
    setActive(id);
    const updatedUserMoves = [...userMoves, id];
    setUserMoves(updatedUserMoves);
    if (userMoves.length === computerMoves.length - 1) {
      setTimeout(() => {
        setCurrentPlayer("computer");
        computerHandler();
        setCurrentScore(currentScore + 1);
      }, 1000);
    }
  };

  const computerHandler = async () => {
    if (gameOver) return;
    setUserMoves([]);
    const updatedComputerMoves = [...computerMoves, randomOneToFour()];
    setComputerMoves(updatedComputerMoves);
    let i = 0;
    while (i < updatedComputerMoves.length) {
      soundHandler(updatedComputerMoves[i]);
      setActive(updatedComputerMoves[i]);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setActive(null);
      i++;
    }
    setCurrentPlayer("user");
  };

  const checkUserMoves = (): boolean => {
    if (userMoves.length) {
      for (let i = 0; i < userMoves.length; i++) {
        if (userMoves[i] !== computerMoves[i]) {
          end();
          return false;
        }
      }
      return true;
    }
    return false;
  };

  const soundHandler = (sound: SoundsId) => {
    const audioRef = audioRefs[Number(sound) - 1];
    if (audioRef && audioRef.current) {
      const audio = new Audio(audioRef.current?.src);
      if (!audio.ended) {
        audio.pause();
        audio.currentTime = 0;
        audio.play();
      }
    }
  };

  const buttons: Props[] = [
    {
      active,
      backgroundColor: "red",
      id: "1",
      left: "50%",
      onClick: userHandler,
      top: "15%",
    },
    {
      active,
      backgroundColor: "blue",
      id: "2",
      left: "85%",
      onClick: userHandler,
      top: "50%",
    },
    {
      active,
      backgroundColor: "blueviolet",
      id: "3",
      left: "50%",
      onClick: userHandler,
      top: "85%",
    },
    {
      active,
      backgroundColor: "green",
      id: "4",
      left: "15%",
      onClick: userHandler,
      top: "50%",
    },
  ];

  return (
    <StyledPageContainer>
      <StyledButtonsContainer>
        <StyledPlayers>
          <StyledPlayer id="user" current={currentPlayer}>
            User
          </StyledPlayer>
          <StyledPlayer id="computer" current={currentPlayer}>
            computer
          </StyledPlayer>
        </StyledPlayers>

        <StyledScore>
          Current Score : {currentScore}
          <br></br> Your Highest Score : {highestScore}
        </StyledScore>

        <StyledStartButton onClick={start}>
          {gameOver ? "Try again" : "Start"}
        </StyledStartButton>
      </StyledButtonsContainer>

      <StyledEllipse>
        {buttons.map(({ active, backgroundColor, id, left, onClick, top }) => (
          <Button
            active={active}
            id={id}
            left={left}
            top={top}
            onClick={onClick}
            backgroundColor={backgroundColor}
            key={crypto.randomUUID()}
          />
        ))}
        {audioRefs.map((audio, index) => (
          <audio
            key={crypto.randomUUID()}
            ref={audio}
            src={`https://s3.amazonaws.com/freecodecamp/simonSound${
              index + 1
            }.mp3`}
          />
        ))}
        {gameOver && <StyledMessage>You Lost!!</StyledMessage>}
      </StyledEllipse>
    </StyledPageContainer>
  );
};
export default Game;

const StyledPageContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: black;
`;

const StyledEllipse = styled.div`
  position: relative;
  width: 40%;
  height: 60%;
  border-radius: 50%;
  background-color: silver;
  box-shadow: 0 0 10px 20px cadetblue;
`;

const StyledStartButton = styled.button`
  width: 300px;
  height: 100px;
  background-color: white;
  color: black;
  font-size: 30px;
  box-shadow: 0px 0px 5px 5px white;
  cursor: pointer;
`;

const StyledPlayers = styled.div`
  display: flex;
  justify-content: space-between;
  width: 300px;
  height: 80px;
  color: white;
  border: 2px solid white;
  font-size: 20px;
  align-items: center;
  box-shadow: 0px 0px 5px 5px white;
`;
const StyledPlayer = styled.p<StyledPlayerStatus>`
  margin: 0 20px;
  ${({ current, id }) =>
    current === id
      ? css`
          border-bottom: 2px white solid;
        `
      : ""};
`;

const StyledMessage = styled.h1`
  position: absolute;
  font-size: 35px;
  box-shadow: 0px 0px 10px 10px white;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
`;
const StyledScore = styled.h3`
  color: white;
  font-size: 25px;
  top: 85%;
  left: 20px;
  border-bottom: 2px white solid;
`;

const StyledButtonsContainer = styled.div`
  position: absolute;
  width: 90vw;
  top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
