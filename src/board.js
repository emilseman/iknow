import React, { useState } from "react";
import styled from "styled-components";
import { steelblue } from "color-name";

const StyledBoard = styled.div`
  display: grid;
  grid-template-areas:
    "minus1 question1 plus1"
    "minus2 question2 plus2"
    "minus3 question3 plus3"
    "minus4 question4 plus4"
    "minus5 question5 plus5"
    "minus6 question6 plus6";
  grid-auto-rows: 50px;
  grid-auto-columns: 50px;
  grid-gap: 1em;
`;

const StyledBox = styled.div`
  background-color: ${props => `${props.color};`};
  grid-area: ${props => `${props.area};`};
  width: 50px;
  height: 50px;
  padding: 2px;
`;

const GameContext = React.createContext({ players: [] });

function GameContextProvider(props) {
  const [state, setState] = React.useState({
    players: []
  });

  React.useEffect(() => {
    setState({
      players: [
        { pid: 1, position: 3, tipOnPlayer: 2, tip: "+", color: "blue" },
        { pid: 2, position: 1, tipOnPlayer: 3, tip: "-", color: "red" },
        { pid: 3, position: 3, tipOnPlayer: 1, tip: "+", color: "grey" }
      ]
    });
  }, [setState]);

  return (
    <GameContext.Provider value={state}>{props.children}</GameContext.Provider>
  );
}

function useGameContext() {
  const gc = React.useContext(GameContext);
  return gc;
}

function Box(props) {
  // const click = React.useCallback(() => {
  //   console.log(props.player);
  // }, []);
  return (
    <StyledBox color={props.color} area={props.position}>
      {props.label}
    </StyledBox>
  );
}

export function Board() {
  const nums = [...Array(6).keys()];
  console.log(nums);
  // const stles = nums.map((elem, key) => {
  //   const area = `plus${key + 1}`;
  //   console.log(area);
  //   return <Box key={area} color="blue" area={area} />;
  // });
  // console.log(stles);

  return (
    <GameContextProvider>
      <StyledBoard>
        <RenderBasedOnPlayers />
      </StyledBoard>
    </GameContextProvider>
  );
}

function RenderBasedOnPlayers() {
  const gc = useGameContext();
  console.log(gc);
  let boxes = [];

  for (let pos = 1; pos <= 6; pos++) {
    if (gc.players.find(pl => pl.position === pos) !== undefined) {
      const pl = gc.players.find(pl => pl.position === pos);
      const pos = `question${pl.position}`;
      boxes.push(
        <Box key={pos} label={pl.pid} color={pl.color} position={pos} />
      );
    }
  }
  console.log("boxes");

  console.log(boxes);
  return (
    <>
      {boxes.map(box => {
        return box;
      })}
    </>
  );
}
