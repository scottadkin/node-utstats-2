import styles from '../../MatchSummary/MatchSummary.module.css';
import Functions from '../../../api/functions';
import MatchResult from '../MatchResult';
import Playtime from '../../Playtime';

function createMOTDElem(data){

    const motdReg = /<u>MOTD<\/u>(.+)$/i;

    const motdResult = motdReg.exec(data);

    let motdElem = null;

    if(motdResult !== null){

        const motdStrings = motdResult[1].split("<br>");

        const motdElems = [];

        for(let i = 0; i < motdStrings.length; i++){

            if(motdStrings[i] !== ""){
                motdElems.push(<div key={i} className={styles.motd}>&quot;{motdStrings[i]}&quot;</div>);
            }
        }

        if(motdElems.length > 0){

            motdElem = <div className={styles.motdw}>
                <span className="yellow">MOTD</span>
                {motdElems}
            </div>
        }
    }

    return motdElem;
}

function createTimeLimitElem(gameinfo){

    let infoResult = "";

    for(let i = 0; i < gameinfo.length; i++){

        if(/time limit/i.test(gameinfo[i])){

            infoResult = /time limit:(.+)/i.exec(gameinfo[i])
            
            if(infoResult !== null){

                if(parseInt(infoResult[1]) > 0){
                    return <div><span className="yellow">Time Limit</span> {parseInt(infoResult[1])}</div>;
                }
            }
        }
    }

    return null;
}

function createTargetScoreElem(gameinfo){

    const teamReg = /goal team score:(.+)/i;

    let g = 0;
    let result = 0;
    let target = 0;

    for(let i = 0; i < gameinfo.length; i++){

        g = gameinfo[i];

        if(teamReg.test(g)){

            result = teamReg.exec(g);
          
            target = parseInt(result[1]);

            if(target > 0){

                return <div><span className="yellow">Target Score</span> {target}</div>;

            }else{
                break;
            }
        }
    }

    return null;
}


function createSpectatorsElem(data){

    const reg = /ignored players:(.+)/i;

    for(let i = 0; i < data.length; i++){

        if(reg.test(data[i])){

            return <div><span className="yellow">Spectators</span>{reg.exec(data[i])[1]}.</div>
        }
    }

    return <div><span className="yellow">Spectators</span> There were no spectators this match.</div>
}

const MatchSummary = ({data}) =>{

    let result = data.result;

    if(!Array.isArray(result)){
        result = `${result} won the match`;
    }

    const motdElem = createMOTDElem(data.serverinfo);

    const gameinfo = data.gameinfo.split("<br>");

    const timeLimitElem = createTimeLimitElem(gameinfo);

    const targetScoreElem = createTargetScoreElem(gameinfo);

    const mutatorsElem = <div>
        <span className="yellow">Mutators: </span>
        {data.mutators}
    </div>;


    const spectatorsElem = createSpectatorsElem(gameinfo);

    return <div className={`${styles.wrapper} center`}>
    <div className={styles.map}>
        <MatchResult data={result}/>
        {Functions.convertTimestamp(Functions.utDate(data.time))}<br/>
        <span className="yellow">{data.servername}</span><br/>
        <span className="yellow">{data.gamename}</span> on <span className="yellow">{Functions.removeUnr(data.mapfile)}</span><br/>
        {targetScoreElem}
        {timeLimitElem}

        <span className="yellow">Match Length</span> <Playtime seconds={data.gametime}/><br/>
        <span className="yellow">Players</span> {data.players}<br/>

        {mutatorsElem}

        {spectatorsElem}

        {motdElem}

    </div>
</div>
}

export default MatchSummary;