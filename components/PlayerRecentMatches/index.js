import Link from 'next/link';
import TimeStamp from '../TimeStamp/';
import styles from './PlayerRecentMatches.module.css';
import Pagination from '../Pagination/';
import Functions from '../../api/functions';
import Image from 'next/image';
import MMSS from '../MMSS/';
import MatchResult from '../MatchResult/';
import Graph from '../Graph/';
import React from 'react';
import MatchResultSmall from '../MatchResultSmall';

const getMatchScores = (scores, id) =>{
    

    for(let i = 0; i < scores.length; i++){

        if(scores[i].id === id){
            return scores[i];
        }
    }

    return null;
}

function getMapImage(maps, name){

    name = Functions.removeMapGametypePrefix(name.toLowerCase());

    const index = maps.indexOf(name);

    if(index !== -1){
        return `/images/maps/${maps[index]}.jpg`;
    }

    return '/images/defaultmap.jpg';
}

function getServerName(servers, id){

    if(servers[id] !== undefined){
        return servers[id];
    }
    return 'Not Found';
}

function createFinalDatesData(data, gametypeNames, total){

    const finalData = [];

    for(const [key, value] of Object.entries(data)){

        finalData.push({
            "name": gametypeNames[key],
            "data": (total > 0) ? value : []
        });
    }

    if(finalData.length === 0){

        finalData.push({
            "name": "all",
            "data": []
        });
    }

    return finalData;
}

function createDatesData(dates, gametypeNames){

    const uniqueGametypes = [];

    let d = 0;

    let totalHours = 0;
    let totalDays = 0;
    let totalMonth = 0;

    for(let i = 0; i < dates.length; i++){

        d = dates[i];


        if(uniqueGametypes.indexOf(d.gametype) === -1){
            uniqueGametypes.push(d.gametype);
        }
    }

    const now = Math.floor(new Date() * 0.001);

    const hours = {};
    const hoursText = [];

    for(let i = 0; i < uniqueGametypes.length; i++){

        hours[uniqueGametypes[i]] = [];
       // hoursText[uniqueGametypes[i]] = [];

        for(let x = 0; x < 24; x++){

            hours[uniqueGametypes[i]].push(0);

            hoursText.push(
                `Hour ${x} - ${x + 1}`
            );
        }
    }


    const days = {};
    const daysText = [];

    for(let i = 0; i < uniqueGametypes.length; i++){

        days[uniqueGametypes[i]] = [];

        for(let x = 0; x < 7; x++){

            days[uniqueGametypes[i]].push(0);

            daysText.push(
                `Day ${x} - ${x + 1}`
            );
        }
    }

    const month = {};
    const monthText = [];

    for(let i = 0; i < uniqueGametypes.length; i++){

        month[uniqueGametypes[i]] = [];

        for(let x = 0; x < 28; x++){

           month[uniqueGametypes[i]].push(0);
           monthText.push(
               `Day ${x} - ${x + 1}`
           );
        }
    }


    const hour = 60 * 60;
    const day = ((60 * 60) * 24);

    let diff = 0;
    let currentHour = 0;
    let currentDay = 0;

    let currentGametype = 0;

    for(let i = 0; i < dates.length ;i++){

        d = dates[i];

        currentGametype = d.gametype;

        diff = now - d.date;
        
        currentHour = Math.floor(diff / hour);
        currentDay = Math.floor(diff / day);

        if(currentHour < 24){
            hours[currentGametype][currentHour]++;
            totalHours++;
        }
        
        if(currentDay < 7){
            days[currentGametype][currentDay]++;
            totalDays++;
        }

        month[currentGametype][currentDay]++;
        totalMonth++;

    }


    const finalHours = createFinalDatesData(hours, gametypeNames, totalHours);
    const finalDays = createFinalDatesData(days, gametypeNames, totalDays);
    const finalMonth = createFinalDatesData(month, gametypeNames, totalMonth);

    return {
        "data": {
            "hours": finalHours,
            "days": finalDays,
            "month": finalMonth
        },
        "text": 
            [
                hoursText,
                daysText,
                monthText
            ]
        
    };
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
        const matchDates = JSON.parse(this.props.matchDates);

        let elems = [];

        let m = 0;

        let currentScore = "";
        let currentWinnerClass = "";
        let currentGametype = 0;
        let mapImage = 0;
        let currentServerName = "";

        let currentResultString = "";

        for(let i = 0; i < matches.length; i++){

            m = matches[i];

            currentScore = getMatchScores(scores, m.match_id);

            if(currentScore === null) continue;

            //(m.winner) ? "Won the Match" : (m.draw) ? "Drew the Match" : "Lost the Match"

            //currentWinnerClass = (m.winner) ? "green" : (m.draw) ? "draw" : "red";

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


            currentGametype = gametypes[currentScore.gametype];

            if(currentGametype === undefined){
                currentGametype = 'Not Found';
            }else if(currentGametype === null){
                currentGametype = 'Not Found';
            }

            if(this.state.mode === 0){

                mapImage = getMapImage(mapImages, m.mapName);

                elems.push(<Link key={i} href={`/match/${m.match_id}`} key={m.id}><a>
                    <div className={styles.wrapper}>
                        <div className={`${styles.title} ${currentWinnerClass}`}> 
                            { currentResultString}
                        </div>
                        <div className={styles.image}>
                            <Image width={384} height={216} src={mapImage} />
                        </div>
                        <div className={styles.info}>
                            <span className="yellow">{getServerName(serverNames, m.server)}</span><br/>
                            <span className="yellow">{currentGametype}</span> on <span className="yellow">{m.mapName}</span><br/>
                            <TimeStamp timestamp={m.match_date} /><br/>
                            Playtime <span className="yellow"><MMSS timestamp={m.playtime}/></span><br/>
                            Players <span className="yellow">{m.players}</span>
                        </div>
                        <MatchResult dmWinner={currentScore.dm_winner} dmScore={currentScore.dm_score} totalTeams={currentScore.total_teams} 
                        redScore={currentScore.team_score_0} blueScore={currentScore.team_score_1} greenScore={currentScore.team_score_2} yellowScore={currentScore.team_score_3} 
                        bMonsterHunt={currentScore.mh} endReason={currentScore.end_type}
                        />
                    </div>
                </a></Link>);

            }else{

                elems.push(<tr key={i}>
                    <td><Link href={`/match/${m.match_id}`}><a><TimeStamp timestamp={m.match_date} noDayName={true}/></a></Link></td>   
                    <td><Link href={`/match/${m.match_id}`}><a>{currentGametype}</a></Link></td>
                    <td><Link href={`/match/${m.match_id}`}><a>{m.mapName}</a></Link></td>
                    <td><Link href={`/match/${m.match_id}`}><a>{m.players}</a></Link></td>
                    <td><Link href={`/match/${m.match_id}`}><a><MMSS timestamp={m.playtime}/></a></Link></td>
                    <td className={"padding-0 relative"}><Link href={`/match/${m.match_id}`}><a>
                        <MatchResultSmall dmWinner={currentScore.dm_winner} dmScore={currentScore.dm_score} totalTeams={currentScore.total_teams} 
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

            elems = <table className="t-width-1">
                <tbody>
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
                </tbody>
            </table>
        }


        const datesData = createDatesData(matchDates, gametypes);
        
        return (
            <div  id="recent-matches">
            
            {(this.props.pageSettings["Display Recent Activity Graph"] !== "true") ? null :
            <div>
                <div className="default-header" >
                    Recent Activity
                </div>
                <Graph title={["Past 24 Hours", "Past 7 Days", "Past 28 Days"]} data={
                    JSON.stringify(
                        [
                            datesData.data.hours,
                            datesData.data.days,
                            datesData.data.month,
                        ]
                    )
                    }

                    text={JSON.stringify(datesData.text)}

            /></div>}

            
            
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
            
                {elems}   
            </div>} 
            </div>
        );
    }
}


export default PlayerRecentMatches;