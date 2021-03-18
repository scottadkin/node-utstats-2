import styles from './MatchesDefaultView.module.css';
import MMSS from '../MMSS/';
import TimeStamp from '../TimeStamp/';
import MatchResult from '../MatchResult/';
import Link from 'next/link';
import Image from 'next/image';
import Functions from '../../api/functions'

class MatchesDefaultView extends React.Component{

    constructor(props){
        super(props);

        let images = [];

        if(this.props.image !== undefined){
            this.state = {"image": this.props.image};
        }else{
            this.state = {"images": JSON.parse(this.props.images)};
        }

        
    }


    getImage(name){

        if(this.state.image !== undefined) return this.state.image;

        name = Functions.removeMapGametypePrefix(name).toLowerCase();

        const index = this.state.images.indexOf(name)
        
        if(index !== -1){
            return `/images/maps/${this.state.images[index]}.jpg`;
        }else{
            return "/images/defaultmap.jpg";
        }
    }

    createBox(match){

        const imageURL = this.getImage(match.mapName);

        return (<Link key={`match_${match.id}`} href={`/match/${match.id}`}>
            <a>
                <div className={styles.wrapper}>
                    <div className={styles.content}>
                        <div className={styles.gametype}><span className="yellow">{match.gametypeName}</span> on <span className="yellow">{match.mapName}</span></div>
                        <Image src={imageURL} alt="map image" width={480} height={270}/>
                        <div className={styles.server}>{match.serverName}</div>
                        <div className={styles.info}>
                            <TimeStamp timestamp={match.date}/><br/>
                            Players <span className="yellow">{match.players}</span><br/>
                            Playtime <span className="yellow"><MMSS timestamp={match.playtime}/></span>
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