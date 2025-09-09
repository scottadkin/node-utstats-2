import styles from './MatchResult.module.css';
import { getTeamColor } from '../../../api/generic.mjs';

const MatchResult = ({dmWinner, dmScore, totalTeams, redScore, blueScore, greenScore, yellowScore, bMonsterHunt, endReason, bIncludeImages}) =>{

    if(bIncludeImages === undefined) bIncludeImages = true;
    const elems = [];

    const teamScores = [redScore, blueScore, greenScore, yellowScore];

    const defaultImage = "controlpoint.png";
    const images = ["red.png","blue.png","green.png","yellow.png"];

    let className = "solo";

    if(!bMonsterHunt){

        switch(totalTeams){
            case 2: { className = "duo"; } break;
            case 3: { className = "trio"; } break;
            case 4: { className = "quad"; } break;
            default: { className = "solo"; } break;
        }


        if(totalTeams < 2 && dmWinner !== undefined){
            
            if(dmScore === null){

                elems.push(<div key="dm" className={`${styles.wrapper} ${styles.dm}`}>
                    <img src={`/images/${defaultImage}`} alt="image"/><br/>
                    {dmWinner.name} Won the Match
                </div>);
            }else{
                elems.push(<div key="dm" className={`${styles.wrapper} ${styles.dm}`}>
                    <img src={`/images/${defaultImage}`} alt="image"/><br/>
                    {dmWinner.name} won with <span className="yellow">{dmScore}</span> Points
                </div>);
            }

            
        }else{

            for(let i = 0; i < totalTeams; i++){

                if(bIncludeImages){

                    elems.push(
                        <div key={`match_result_${i}`} className={getTeamColor(i)}>
                            <img src={`/images/${images[i]}`} alt="image"/>
                            <div className={styles.score}>{teamScores[i]}</div>
                        </div>
                    );

                }else{

                    elems.push(
                        <div key={`match_result_${i}`} className={getTeamColor(i)}>
                            <div className={styles.score}>{teamScores[i]}</div>
                        </div>
                    );
                }
            }
        }

    }else{
        elems.push(<div key={"mh"}>
            {(endReason.toLowerCase() === "hunt successfull!") ? "Hunt Succesfull" : "Hunt Failed"}
        </div>);
    }

    
    return (
        <div className={styles.wrapper}>
            <div className={className}>
                {elems}
            </div>
        </div>
    );
    
}


export default MatchResult;