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
    }

    return state;
}

const InteractivePlayerSearchBox = ({data, maxDisplay, searchValue, selectedPlayers, togglePlayer, setSearchValue, bAutoSet}) =>{

    if(maxDisplay === undefined) maxDisplay = 100;

    if(setSearchValue === undefined){

        setSearchValue = () =>{};
    }

    const [state, dispatch] = useReducer(reducer, {
        "bDisplay": false
    });

    if(searchValue !== ""){

        let currentIndex = 0;

        data = data.filter((d) =>{
            
            if(currentIndex > maxDisplay) return false;

            const name = d.name.toLowerCase();

            const index = name.indexOf(searchValue.toLowerCase());

            if(index !== -1){
                currentIndex++;
            }

            return index !== -1;       
        });
    }

    let elems = [];

    if(searchValue !== "" && state.bDisplay){

        elems = data.map((d) =>{

            const index = selectedPlayers.indexOf(d.id);

            return <div className={`${styles.player} ${(index !== -1) ? styles.selected : ""}`} key={d.id} onClick={() =>{
                togglePlayer(d.id);
                if(bAutoSet){
                    setSearchValue(d.name);
                }
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
        <input type="text" className={styles.textbox} value={searchValue} onChange={(e) =>{
            setSearchValue(e.target.value);
            dispatch({"type": "setDisplay", "value": true});
        }}  placeholder="player name..."/>
   
        <div className={styles.players} >{elems}</div>   
    </div>
}

export default InteractivePlayerSearchBox;