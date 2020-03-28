import React from "react";
import styled from "styled-components";
import randomColor from 'randomcolor';
import lodash from 'lodash';

const StyledPositions = styled.div`
  display: grid;
  grid-template-areas:
    "minus6 question6 plus6"
    "minus5 question5 plus5"
    "minus4 question4 plus4"
    "minus3 question3 plus3"
    "minus2 question2 plus2"
    "minus1 question1 plus1";
  grid-auto-rows: 80px;
  grid-auto-columns: 80px;
  grid-gap: 1em;
`;

const StyledBox = styled.div`
  background-color: ${props => `${props.color};`};
  grid-area: ${props => `${props.area};`};
  width: 76px;
  height: 76px;
  padding: 2px;
`;


const StyledBoard = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  justify-content: space-between;
  width: minmax(500px, 80vw);
  font-size: 20px;
`;

const StyledControls = styled.div`
  margin: 10px;
  display: flex;
  flex-direction: column;
  height: 400px;
`;

const StyledPlayer = styled.div`
    display:flex;
    justify-content: flex-start;
    margin: 5px;
`;

const StyledLabel = styled.div`
  background-color: ${props => `${props.color ? props.color : ''};`};
    padding: 15px;
`;

const StyledInput = styled.input`
    padding: 5px;
    font-size: 20px;
`;

const StyledButton = styled.button`
    padding: 5px;
`;

const GameContext = React.createContext({players: []});

function newPointsAndClearTip(player, pointsToAddOrSubstract) {
    return {...newPoints(player, pointsToAddOrSubstract), tipOnPlayer: 0};
}

function newPointsAndClearPosition(player, pointsToAddOrSubstract) {
    return {...newPoints(player, pointsToAddOrSubstract), position: 0};
}

function newPoints(player, pointsToAddOrSubstract) {
    if (player === undefined) {
        return undefined;
    }
    console.log(`Adding or substracting ${pointsToAddOrSubstract} to player ${player.pid} ${player.name}`);
    const points = Math.max(player.points + (pointsToAddOrSubstract), 0);
    return {
        ...player,
        points,
    }
}

function GameContextProvider(props) {
    const [state, setState] = React.useState({
        players: [],
        noOfPlayers: 1
    });

    const [message, setMessage] = React.useState('');

    React.useEffect(() => {
        setState({
            players: [
                // {pid: 1, position: 3, tipOnPlayer: 2, tip: "+", color: "blue", points: 0, name: 'fero'},
                // {pid: 2, position: 1, tipOnPlayer: 3, tip: "-", color: "red", points: 0, name: 'simon'},
                // {pid: 3, position: 2, tipOnPlayer: 1, tip: "+", color: "cyan", points: 0, name: 'leso'}
            ], noOfPlayers: 0, selectedPlayer: 0, typeOfAction: ''
        });
    }, []);

    const selectedPlayer = React.useCallback((pid, action) => {
        console.log(`Action ${action} for player ${pid}`);
        setMessage(`Action ${action} for player ${pid}`);
        setState({...state, selectedPlayer: pid, typeOfAction: action});
    }, [state]);

    const clickedBox = React.useCallback((position) => {
        console.log(`Action for position ${position} for player ${state.selectedPlayer} and typeofaction ${state.typeOfAction}`);
        setMessage(`Action for position ${position} for player ${state.selectedPlayer} and typeofaction ${state.typeOfAction}`);
        // position
        if (position && state.selectedPlayer > 0 && state.typeOfAction === 'select') {
            const [[player], without] = lodash.partition(state.players, pl => pl.pid === state.selectedPlayer);

            const existing = state.players.find(pl => pl.position === position);
            if(existing){
                setMessage(`On ${position} is already ${existing.name}`);
                return;
            }

            const newPlayer = {...player, position};
            console.log(newPlayer);
            setState({...state, players: [...without, newPlayer], selectedPlayer: 0, typeOfAction: ''});
        }
        // tips
        if (position && state.selectedPlayer > 0 && state.typeOfAction && state.typeOfAction.startsWith('tip')) {
            const [[player], without] = lodash.partition(state.players, pl => pl.pid === state.selectedPlayer);
            const tipOn = without.find(pl => pl.position === position);
            if (tipOn) {
                const action = state.typeOfAction.substring(3, 4);

                const existing = state.players.find(pl => pl.tipOnPlayer === tipOn.pid && pl.tip === action);
                if(existing){
                    setMessage(`On tip ${position} is already ${existing.name}`);
                    return;
                }

                const newPlayer = {...player, tipOnPlayer: tipOn.pid, tip: action};
                console.log(newPlayer);
                setState({...state, players: [...without, newPlayer], selectedPlayer: 0, typeOfAction: ''});
                return;
            }
            setMessage(`Player ${player.name} cannot tip on itself`);

        }
    }, [state]);

    const getEmptyPlayers = (no) => {
        console.log('no no ' + no);
        return [...Array(parseInt(no)).keys()].map(k => createEmptyPlayer(k + 1, randomColor({luminosity: 'light'})));
    };
    const setPlayerName = React.useCallback((pid, name) => {
        console.log(`setting player name ${pid} to ${name}`);
        const newp = state.players.map(pl => {
            const newName = pid === pl.pid ? name : pl.name;
            return {...pl, name: newName};
        });
        setState({...state, players: newp});
    }, [state]);

    const setNoOfPlayers = React.useCallback(no => {
        console.log(`setting no of players to ${no}`);
        setState({players: getEmptyPlayers(no), noOfPlayers: no});
    }, [state]);

    const clearPlayerFromBoard = React.useCallback(pid => {
        const [[player], others] = lodash.partition(state.players, pl => pl.pid === pid);
        setState({...state, players: [...others, {...player, position: 0, tipOnPlayer: 0}]})
    }, [state]);


    const playerOKAnswer = React.useCallback(pid => {
        console.log(`Player answered correctly ${pid}`);
        const [[player], without] = lodash.partition(state.players, pl => pl.pid === pid);
        const [playersThatTippedOnThisOne, others] = lodash.partition(without, pl => pl.tipOnPlayer === pid);
        console.log(playersThatTippedOnThisOne);

        const plus = playersThatTippedOnThisOne.filter(pl => pl.tip === '+').map(pl => newPointsAndClearTip(pl, 1));
        const minus = playersThatTippedOnThisOne.filter(pl => pl.tip === '-').map(pl => newPointsAndClearTip(pl, -1));

        const newPlayer = newPointsAndClearPosition(player, Math.ceil(player.position / 2));
        setState({
            ...state,
            players: [...others, ...plus, ...minus, {...newPlayer}]
        });
    }, [state]);

    const playerFailAnswer = React.useCallback(pid => {
        console.log(`Player answered incorrectly ${pid}`);
        const [[player], without] = lodash.partition(state.players, pl => pl.pid === pid);
        const [playersThatTippedOnThisOne, others] = lodash.partition(without, pl => pl.tipOnPlayer === pid);
        console.log(playersThatTippedOnThisOne);

        const plus = playersThatTippedOnThisOne.filter(pl => pl.tip === '+').map(pl => newPointsAndClearTip(pl, -1));
        const minus = playersThatTippedOnThisOne.filter(pl => pl.tip === '-').map(pl => newPointsAndClearTip(pl, 1));

        const newPlayer = newPointsAndClearPosition(player, 0);

        setState({
            ...state,
            players: [...others, ...plus, ...minus, {...newPlayer}]
        });
    }, [state]);


    return (
        <GameContext.Provider
            value={{
                state,
                controls: {setNoOfPlayers, setPlayerName, playerOKAnswer, playerFailAnswer, selectedPlayer, clickedBox},
                message
            }}>{props.children}</GameContext.Provider>
    );
}

function createEmptyPlayer(pid, color) {
    return {pid, position: 0, tipOnPlayer: 0, tip: "+", color, points: 0};
}

function useGameContext() {
    const gc = React.useContext(GameContext);
    return gc;
}

function Box(props) {
    const gc = useGameContext();

    const boxClick = React.useCallback(() => {
        if (props.position.startsWith("question")) {
            gc.controls.clickedBox(parseInt(props.position.substr(8, 9)));
        }
    }, [gc.state, gc.controls, props.position]);

    return (
        <StyledBox color={props.color} area={props.position} onClick={boxClick}>
            {props.label}
        </StyledBox>
    );
}

export function Player(props) {
    const gc = useGameContext();
    const player = gc.state.players.find(pl => pl.pid === props.pid);
    const changeName = React.useCallback(
        event => {
            gc.controls.setPlayerName(player.pid, event.target.value)
        }, [gc.controls, player]);

    const okAnswer = React.useCallback(() => {
        if (player) gc.controls.playerOKAnswer(player.pid)
    }, [gc.controls, player]);

    const badAnswer = React.useCallback(() => {
        if (player) gc.controls.playerFailAnswer(player.pid)
    }, [gc.controls, player]);

    const select = React.useCallback(() => {
        gc.controls.selectedPlayer(player.pid, 'select');
    }, [gc.controls, player]);

    const tipplus = React.useCallback(() => {
        gc.controls.selectedPlayer(player.pid, 'tip+');
    }, [gc.controls, player]);

    const tipminus = React.useCallback(() => {
        gc.controls.selectedPlayer(player.pid, 'tip-');
    }, [gc.controls, player]);

    if (player) {
        return <StyledPlayer>
            <StyledButton onClick={select}>Select</StyledButton>
            <StyledButton onClick={tipminus}>Tip-</StyledButton>
            <StyledButton onClick={tipplus}>Tip+</StyledButton>
            <StyledLabel color={player.color}>{player.pid}</StyledLabel>
            <StyledInput value={player.name} onChange={changeName} />
            <StyledLabel>Points: {player.points}</StyledLabel>
            <StyledButton onClick={okAnswer}>OK</StyledButton>
            <StyledButton onClick={badAnswer}>FAIL</StyledButton>
        </StyledPlayer>
    } else {
        return null;
    }
}

export function Controls() {
    const gc = useGameContext();
    const noOfPlayersInput = React.useRef(null);

    const updateNoOfPlayers = () => {
        console.log(noOfPlayersInput);
        if (noOfPlayersInput.current?.value > 0 && noOfPlayersInput.current?.value <= 6) {
            gc.controls.setNoOfPlayers(noOfPlayersInput.current.value);
        }
    };

    console.log(gc.state.players);
    const players = gc.state.players.sort((a, b) => a.pid - b.pid).map(pl => <Player key={`player${pl.pid}`}
                                                                                     pid={pl.pid}/>);

    return (
        <StyledControls>
            <StyledInput ref={noOfPlayersInput} defaultValue={1}/>
            <StyledButton onClick={updateNoOfPlayers}>Set no of players</StyledButton>
            <StyledLabel>{gc.state.noOfPlayers} people playing this game</StyledLabel>
            {players}

        </StyledControls>
    );
}

export function Board() {
    return (
        <GameContextProvider>
            <Message/>
            <StyledBoard>
                <StyledPositions>
                    <RenderBasedOnPlayers/>
                </StyledPositions>
                <Controls>tu budu hraci</Controls>
            </StyledBoard>
        </GameContextProvider>
    );
}

function Message() {
    const gc = useGameContext();

    return <h2>{gc.message}</h2>;
}

function RenderBasedOnPlayers() {
    const gc = useGameContext();
    let boxes = [];

    React.useEffect(() => {


    }, [gc.state]);
    console.log('renderiiing');
    // positions
    for (let pos = 1; pos <= 6; pos++) {
        const position = `question${pos}`;

        if (gc.state.players.find(pl => pl.position === pos) !== undefined) {
            const pl = gc.state.players.find(pl => pl.position === pos);
            boxes.push(
                <Box key={position} label={`${pl.pid}: ${pl.name}`} color={pl.color} position={position}/>
            );
        } else {
            boxes.push(<Box key={position} label={`${Math.ceil(Math.abs(pos) / 2)}`} color={"grey"}
                            position={position}/>);
        }
    }

    // tips
    gc.state.players.forEach(pl => {
        if (pl.tipOnPlayer > 0) {
            const tippedPl = gc.state.players.find(other => other.pid === pl.tipOnPlayer);
            if (tippedPl !== undefined && tippedPl.position > 0) {
                const position = pl.tip === '+' ? `plus${tippedPl.position}` : `minus${tippedPl.position}`;
                boxes.push(
                    <Box key={position} label={pl.tip} color={pl.color} position={position}/>
                );
            }
        }
    });

    return (
        <>
            {boxes.map(box => {
                return box;
            })}
        </>
    );
}
