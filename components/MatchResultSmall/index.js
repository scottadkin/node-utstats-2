import styles from "./MatchResultSmall.module.css";
import { getTeamColor } from "../../api/generic.mjs";

const MatchResultSmall = ({totalTeams, dmWinner, dmScore, redScore, blueScore, greenScore, yellowScore, bMonsterHunt, endReason}) =>{

    redScore = Math.floor(redScore);
    blueScore = Math.floor(blueScore);
    greenScore = Math.floor(greenScore);
    yellowScore = Math.floor(yellowScore);
    
    if(!bMonsterHunt){
        if(dmWinner !== undefined && dmWinner !== 0){
            return (<div className={`${styles.wrapper} solo`}><div className="team-none">{dmWinner.name} <span className="yellow">({dmScore})</span></div></div>);
        }

        let wrapperClass = "solo";


        switch(totalTeams){
            case 2: {   wrapperClass = "duo"; } break;
            case 3: {   wrapperClass = "trio"; } break;
            case 4: {   wrapperClass = "quad"; } break;
        }

        const elems = [];

        elems.push(<div key={"red"} className="team-red">{redScore}</div>);
        elems.push(<div key={"blue"} className="team-blue">{blueScore}</div>);

        if(totalTeams > 2){
            elems.push(<div key={"green"} className="team-green">{greenScore}</div>);
            if(totalTeams > 3){
                elems.push(<div key={"yellow"} className="team-yellow">{yellowScore}</div>);
            }
        }
        return (<div className={`${styles.wrapper} ${wrapperClass}`}>{elems}</div>);

    }else{

        if(endReason.toLowerCase() === "hunt successfull!"){
            return <div className={`${styles.wrapper} solo`}><div className="team-none">Hunt Successful</div></div>;
        }else{
            return <div className={`${styles.wrapper} solo`}><div className="team-none">Hunt Failed</div></div>;
        }

    }

   

}

export default MatchResultSmall;