import styles from './MatchResult.module.css';

const MatchResult = ({dmWinner, dmScore, totalTeams, redScore, blueScore, greenScore, yellowScore, bMonsterHunt, endReason}) =>{

    const elems = [];

    const teamScores = [redScore, blueScore, greenScore, yellowScore];

    let className = "solo";

    if(!bMonsterHunt){

        switch(totalTeams){
            case 2: { className = "duo"; } break;
            case 3: { className = "trio"; } break;
            case 4: { className = "quad"; } break;
            default: { className = "solo"; } break;
        }


        if(totalTeams < 2){

            if(dmScore === null){

                elems.push(<div key="dm">
                    <span className="yellow">{dmWinner}</span> Won the Match
                </div>);
            }else{
                elems.push(<div key="dm">
                    <span className="yellow">{dmWinner}</span> won with <span className="yellow">{dmScore}</span> Points
                </div>);
            }

            
        }else{

            for(let i = 0; i < totalTeams; i++){

                elems.push(
                    <div key={`match_result_${i}`}>
                        {teamScores[i]}
                    </div>
                );
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