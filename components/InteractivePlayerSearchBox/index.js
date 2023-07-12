import CountryFlag from "../CountryFlag";
import styles from "./InteractivePlayerSearchBox.module.css";
import {useState, useReducer} from "react";

const reducer = (state, action) =>{

    switch(action.type){

        case "setDisplay": {

            return {
                ...state,
                "bDisplay": action.value
            }
        }
        case "updateSearch": {
            return {
                ...state,
                "searchValue": action.searchValue,
                "bDisplay": true
            }
        }
    }

    return state;
}

const InteractivePlayerSearchBox = ({data, maxDisplay, selectedPlayers, togglePlayer}) =>{

    if(maxDisplay === undefined) maxDisplay = 100;

    const [state, dispatch] = useReducer(reducer, {
        "bDisplay": false,
        "searchValue": ""
    });

    if(state.searchValue !== ""){

        let currentIndex = 0;

        data = data.filter((d) =>{
            
            if(currentIndex > maxDisplay) return false;

            const name = d.name.toLowerCase();

            const index = name.indexOf(state.searchValue);

            if(index !== -1){
                currentIndex++;
            }

            return index !== -1;       
        });
    }

    let elems = [];

    if(state.searchValue !== "" && state.bDisplay){

        elems = data.map((d) =>{

            const index = selectedPlayers.indexOf(d.id);

            return <div className={`${styles.player} ${(index !== -1) ? styles.selected : ""}`} key={d.id} onClick={() =>{
                togglePlayer(d.id);
            }}>
                <CountryFlag country={d.country} />{d.name}
            </div>;
        });
    }


    return <div className={styles.wrapper} onMouseLeave={() =>{
        dispatch({"type": "setDisplay", "value": false});
    }} onMouseEnter={() =>{
        dispatch({"type": "setDisplay", "value": true});
    }}>
        <input type="text" onChange={(e) =>{
      
            dispatch({"type": "updateSearch", "searchValue": e.target.value});
        }} value={state.searchValue} placeholder="player name..."/>
   
        <div className={styles.players} >{elems}</div>   
    </div>
}

export default InteractivePlayerSearchBox;