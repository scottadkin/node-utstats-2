import styles from './MatchesDefaultView.module.css';
import MMSS from '../MMSS/';
import TimeStamp from '../TimeStamp/';
import MatchResult from '../MatchResult/';
import Link from 'next/link';

class MatchesDefaultView extends React.Component{

    constructor(props){
        super(props);
    }

    createBox(match){

       console.log(match);
       console.log(match.dm_score);

        return (<Link href={`/match/${match.id}`}>
            <a>
                <div className={styles.wrapper}>
                    <div className={styles.content}>
                        <div className={styles.gametype}>{match.gametypeName} on {match.mapName}</div>
                        <img src="/images/temp.jpg" alt="image"/>
                        <div className={styles.server}>{match.serverName}</div>
                        <div className={styles.info}>
                            <TimeStamp timestamp={match.date}/><br/>
                            Players {match.players}<br/>
                            Playtime <MMSS timestamp={match.playtime}/>
                        </div>
                        <MatchResult 
                            dmWinner={match.dm_winner} 
                            dmScore={match.dm_score} 
                            totalTeams={match.total_teams}
                            redScore={match.team_score_0}
                            blueScore={match.team_score_1}
                            greenScore={match.team_score_2}
                            yellowScore={match.team_score_3}
                            matchId={match.id}
                            />
                    </div>
                </div>
            </a>
        </Link>);
    }

    render(){

        const matches = JSON.parse(this.props.data);

        const elems = [];

        for(let i = 0; i < matches.length; i++){
            elems.push(this.createBox(matches[i]));
        }

        return <div>{elems}</div>
    }
}


export default MatchesDefaultView;