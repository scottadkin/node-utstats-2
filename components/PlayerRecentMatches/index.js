import Link from 'next/link';
import styles from './PlayerRecentMatches.module.css';
import Pagination from '../Pagination/';
import Functions from '../../api/functions';
import MatchResult from '../MatchResult/';
import React from 'react';
import MatchResultSmall from '../MatchResultSmall';
import Table2 from '../Table2';
import MatchResultDisplay from '../MatchResultDisplay';
import Playtime from '../Playtime';

const getMatchScores = (scores, id) =>{
    

    for(let i = 0; i < scores.length; i++){

        if(scores[i].id === id){
            return scores[i];
        }
    }

    return null;
}

function getMapImage(maps, name){

    const cleanName = Functions.cleanMapName(name).toLowerCase();

    if(maps[cleanName] !== undefined){
        return `/images/maps/thumbs/${maps[cleanName]}.jpg`;
    }
    
    return '/images/maps/thumbs/default.jpg';
}

function getServerName(servers, id){

    if(servers[id] !== undefined){

        const originalString = servers[id];
        let shortenedString = originalString.slice(0,65);

        if(originalString === shortenedString){
            return originalString;
        }else{

            return `${shortenedString}...`;
        }
        

    }
    return 'Not Found';
}


class PlayerRecentMatches extends React.Component{

    constructor(props){

        super(props);

        this.state = {"mode": parseInt(this.props.pageSettings["Default Recent Matches Display"])};

        this.changeMode = this.changeMode.bind(this);
    }

    componentDidMount(){

        const settings = this.props.session;

        if(settings["playerPageMatchesMode"] !== undefined){
            this.setState({"mode": parseInt(settings["playerPageMatchesMode"])});
        }
    }

    changeMode(id){
        this.setState({"mode": id});
        Functions.setCookie("playerPageMatchesMode", id);
    }

    render(){

        const matches = JSON.parse(this.props.matches);
        const scores = JSON.parse(this.props.scores);

        const gametypes = JSON.parse(this.props.gametypes);
        const mapImages = JSON.parse(this.props.mapImages);

        const serverNames = JSON.parse(this.props.serverNames);

        let elems = [];

        for(let i = 0; i < matches.length; i++){

            const m = matches[i];

            const currentScore = getMatchScores(scores, m.match_id);
            let currentWinnerClass = "";
            let currentResultString = "";

            if(currentScore === null) continue;

            if(m.winner){

                currentWinnerClass = "green";
                currentResultString = "Won the Match";

            }else{

                if(m.draw){
                    currentWinnerClass = "yellow";
                    currentResultString = "Drew the Match";
                }else{
                    currentWinnerClass = "red";
                    currentResultString = "Lost the Match";
                }
            }


            if(currentScore.mh){

                if(currentScore.end_type.toLowerCase() === "hunt successfull!"){
                 
                    currentWinnerClass = "green";
                    currentResultString = "Won the Match";
                }else{
                    currentWinnerClass = "red";
                    currentResultString = "Lost the Match";
                }
            }


            let currentGametype = gametypes[currentScore.gametype];

            if(currentGametype === undefined){
                currentGametype = 'Not Found';
            }else if(currentGametype === null){
                currentGametype = 'Not Found';
            }

            if(this.state.mode === 0){

                const mapImage = getMapImage(mapImages, m.mapName);

                elems.push(<MatchResultDisplay 
                    key={`${m.id}b`}
                    url={`/match/${m.match_id}`}
                    mode="player"
                    playerResult={currentResultString}
                    mapImage={mapImage}
                    mapName={m.mapName}
                    serverName={getServerName(serverNames, m.server)}
                    gametypeName={currentGametype}
                    date={Functions.convertTimestamp(m.match_date)}
                    playtime={m.playtime}
                    players={m.players}>

                    <MatchResult dmWinner={m.dmWinner} dmScore={currentScore.dm_score} totalTeams={currentScore.total_teams} 
                        redScore={currentScore.team_score_0} blueScore={currentScore.team_score_1} greenScore={currentScore.team_score_2} 
                        yellowScore={currentScore.team_score_3} 
                        bMonsterHunt={currentScore.mh} endReason={currentScore.end_type}
                    />
                </MatchResultDisplay>);

            }else{

                elems.push(<tr key={i}>
                    <td><Link href={`/match/${m.match_id}`}><a>{Functions.convertTimestamp(m.match_date, true)}</a></Link></td>   
                    <td><Link href={`/match/${m.match_id}`}><a>{currentGametype}</a></Link></td>
                    <td><Link href={`/match/${m.match_id}`}><a>{m.mapName}</a></Link></td>
                    <td><Link href={`/match/${m.match_id}`}><a>{m.players}</a></Link></td>
                    <td className="playtime"><Link href={`/match/${m.match_id}`}><a><Playtime timestamp={m.playtime}/></a></Link></td>
                    <td className={"padding-0 relative"}><Link href={`/match/${m.match_id}`}><a>
                        <MatchResultSmall dmWinner={m.dmWinner} dmScore={currentScore.dm_score} totalTeams={currentScore.total_teams} 
                        redScore={currentScore.team_score_0} blueScore={currentScore.team_score_1} greenScore={currentScore.team_score_2} yellowScore={currentScore.team_score_3}
                        bMonsterHunt={currentScore.mh} endReason={currentScore.end_type}/>
                    </a></Link></td>
                    <td className={`${styles.title} ${currentWinnerClass}`}>
                        <Link href={`/match/${m.match_id}`}><a> {currentResultString}</a></Link>
                    </td>
                    
                    
                </tr>);
            }
        }

        if(this.state.mode === 1){

            elems = <Table2 width={1}>
                <tr>
                    <th>Date</th>
                    <th>Gametype</th>
                    <th>Map</th>
                    <th>Players</th>
                    <th>Playtime</th>
                    <th>Match Result</th>
                    <th>Result</th>
                </tr>
                {elems}
            </Table2>
        }
        
        return (
            <div  id="recent-matches">
            

            
            
            {(this.props.pageSettings["Display Recent Matches"] !== "true") ? null :
            <div><div className="default-header">
                Recent Matches
            </div>
            
            <div className="tabs">
                <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(0);
                })}>Default View</div>
                <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : ""}`}
                 onClick={(() =>{
                    this.changeMode(1);
                })}>Table View</div>
            </div>
            
            
            <Pagination 
                    currentPage={this.props.currentMatchPage}
                    results={this.props.totalMatches}
                    pages={this.props.matchPages}
                    perPage={this.props.matchesPerPage}
                    url={`/player/${this.props.playerId}?matchpage=`}
                    anchor={'#recent-matches'}
                    
                />
            
                <div className={`${styles.main} center`}>
                    {elems}   
                </div>
            </div>} 
            </div>
        );
    }
}


export default PlayerRecentMatches;