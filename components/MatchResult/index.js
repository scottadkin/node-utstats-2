import styles from './MatchResult.module.css';

const MatchResult = ({dmWinner, dmScore, totalTeams, redScore, blueScore, greenScore, yellowScore}) =>{

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
            <div key={`match_result_solo`}>
                <span className="yellow">{dmWinner}</span> won with <span className="yellow">{dmScore}</span> Points
            </div>
        );
    }else{

        for(let i = 0; i < totalTeams; i++){

            elems.push(
                <div key={`match_result_${i}`}>
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