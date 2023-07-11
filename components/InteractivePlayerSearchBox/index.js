import CountryFlag from "../CountryFlag";
import styles from "./InteractivePlayerSearchBox.module.css";
import {useState, useReducer} from "react";

const reducer = (state, action) =>{

    switch(action.type){

        case "togglePlayer": {

            //if playerId is not in array add it otherwise remove
            return {
                ...state,
                "selectedPlayers": []
            }
        }
        case "setMasterPlayer": {

            return {
                ...state,
                "masterPlayer": action.masterPlayer
            }
        }
    }

    return state;
}

const InteractivePlayerSearchBox = ({data, maxDisplay}) =>{

    if(maxDisplay === undefined) maxDisplay = 100;

    const [searchValue, setSearchValue] = useState("");
    const [state, dispatch] = useReducer(reducer, {
        "selectedPlayers": [],
        "masterPlayer": null
    });

    if(searchValue !== ""){

        let currentIndex = 0;

        data = data.filter((d) =>{
            
            if(currentIndex > maxDisplay) return false;

            const name = d.name.toLowerCase();

            const index = name.indexOf(searchValue);

            if(index !== -1){
                currentIndex++;
            }

            return index !== -1;       
        });
    }

    let elems = [];

    if(searchValue !== ""){
        elems = data.map((d) =>{
            return <div className={styles.player} key={d.id}>
                <CountryFlag country={d.country} />{d.name}
            </div>;
        });
    }


    return <div>
        <input type="text" className="default-textbox" onChange={(e) =>{
            console.log(e.target.value);
            setSearchValue(e.target.value);
        }} value={searchValue} placeholder="player name..."/>
   
        <div className={styles.players}>{elems}</div>
      
    </div>
}

export default InteractivePlayerSearchBox;