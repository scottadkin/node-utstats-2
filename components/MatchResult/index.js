import styles from './MatchResult.module.css';

const MatchResult = ({teamGame, dmWinner, dmScore, totalTeams, redScore, blueScore, greenScore, yellowScore}) =>{

    const elems = [];

    const teamScores = [redScore, blueScore, greenScore, yellowScore];

    let className = "solo";

    switch(totalTeams){
        case 2: { className = "duo"; } break;
        case 3: { className = "trio"; } break;
        case 4: { className = "quad"; } break;
    }


    if(totalTeams < 2){
        elems.push(
            <div>
                <span className="yellow">{dmWinner}</span> wins with <span className="yellow">{dmScore}</span>
            </div>
        );
    }else{


        for(let i = 0; i < totalTeams; i++){

            elems.push(
                <div>
                    {teamScores[i]}
                </div>
            );
        }

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