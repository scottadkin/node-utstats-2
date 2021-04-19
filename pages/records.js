import DefaultHead from '../components/defaulthead';
import Nav from '../components/Nav/';
import Footer from '../components/Footer/';
import Players from '../api/players';
import Functions from '../api/functions';
import RecordsList from '../components/RecordsList/';
import Pagination from '../components/Pagination/';
import React from 'react';
import Link from 'next/link';
import styles from '../styles/Records.module.css';
import Maps from '../api/maps';

const validTypes = [
    "matches",
    "wins",
    "losses",
    "draws",
    "winrate",
    "playtime",
    "first_bloods",
    "frags",
    "score",
    "kills",
    "deaths",
    "suicides",
    "team_kills",
    "spawn_kills",
    "efficiency",
    "multi_best",
    "spree_best",
    "best_spawn_kill_spree",
    "accuracy",
    "headshots",
    "flag_assist",
    "flag_return",
    "flag_taken",
    "flag_dropped",
    "flag_capture",
    "flag_pickup",
    "flag_cover",
    "flag_cover_pass",
    "flag_cover_fail",
    "flag_self_cover",
    "flag_self_cover_pass",
    "flag_self_cover_fail",
    "flag_multi_cover",
    "flag_spree_cover",
    "flag_cover_best",
    "flag_self_cover_best",
    "flag_kill",
    "flag_save",
    "flag_carry_time",
    "assault_objectives",
    "dom_caps",
    "dom_caps_best_life",
    "k_distance_normal",
    "k_distance_long",
    "k_distance_uber",
];

const typeTitles = [
    "Total Matches",
    "Wins",
    "Losses",
    "Draws",
    "WinRate",
    "Playtime",
    "First Bloods",
    "Frags",
    "Score",
    "Kills",
    "Deaths",
    "Suicides",
    "Team Kills",
    "Spawn Kills",
    "Efficiency",
    "Best Multi Kill",
    "Longest Killing Spree",
    "Longest Spawn Killing Spree",
    "Accuracy",
    "Headshots",
    "Flag Assists",
    "Flag Returns",
    "Flags Taken",
    "Flag Dropped",
    "Flag Capture",
    "Flag Pickup",
    "Flag Cover",
    "Flag Successful Cover",
    "Flag Failed Cover",
    "Flag Self Cover",
    "Flag Self Successful Cover",
    "Flag Self Cover Fail",
    "Flag Multi Cover",
    "Flag Cover Spree",
    "Flag Cover Best",
    "Flag Self Cover Best",
    "Flag Kill",
    "Flag Close Return",
    "Flag Carry Time",
    "Assault Objectives",
    "Domination Control Point Caps",
    "Domination Control Point Caps (Single Life)", 
    "Short Distance Kills",
    "Long Distance Kills",
    "Uber Long Distance Kills"
];


const validTypesMatch = [
    "playtime",
    "frags",
    "score",
    "kills",
    "deaths",
    "suicides",
    "team_kills",
    "spawn_kills",
    "efficiency",
    "multi_best",
    "spree_best",
    "best_spawn_kill_spree",
    "accuracy",
    "headshots",
    "flag_assist",
    "flag_return",
    "flag_taken",
    "flag_dropped",
    "flag_capture",
    "flag_pickup",
    "flag_cover",
    "flag_cover_pass",
    "flag_cover_fail",
    "flag_self_cover",
    "flag_self_cover_pass",
    "flag_self_cover_fail",
    "flag_multi_cover",
    "flag_spree_cover",
    "flag_cover_best",
    "flag_self_cover_best",
    "flag_kill",
    "flag_save",
    "flag_carry_time",
    "assault_objectives",
    "dom_caps",
    "dom_caps_best_life",
    "k_distance_normal",
    "k_distance_long",
    "k_distance_uber",
];

const typeTitlesMatch = [
    "Playtime",
    "Frags",
    "Score",
    "Kills",
    "Deaths",
    "Suicides",
    "Team Kills",
    "Spawn Kills",
    "Efficiency",
    "Best Multi Kill",
    "Longest Killing Spree",
    "Longest Spawn Killing Spree",
    "Accuracy",
    "Headshots",
    "Flag Assists",
    "Flag Returns",
    "Flags Taken",
    "Flag Dropped",
    "Flag Capture",
    "Flag Pickup",
    "Flag Cover",
    "Flag Successful Cover",
    "Flag Failed Cover",
    "Flag Self Cover",
    "Flag Self Successful Cover",
    "Flag Self Cover Fail",
    "Flag Multi Cover",
    "Flag Cover Spree",
    "Flag Cover Best",
    "Flag Self Cover Best",
    "Flag Kill",
    "Flag Close Return",
    "Flag Carry Time",
    "Assault Objectives",
    "Domination Control Point Caps",
    "Domination Control Point Caps (Single Life)",
    "Short Distance Kills",
    "Long Distance Kills",
    "Uber Long Distance Kills",
];


class SelectionBox extends React.Component{

    constructor(props){

        super(props);

        this.changeEvent = this.changeEvent.bind(this);

        
    }

    changeEvent(event){

        this.props.changeEvent(event.target.value);
    }

    render(){
        const options = [];

        const types = (this.props.mode === 0) ? validTypes : validTypesMatch;
        const titles = (this.props.mode === 0) ? typeTitles : typeTitlesMatch;

        for(let i = 0; i < types.length; i++){
            options.push(<option key={i} value={types[i]}>{titles[i]}</option>);
        }

        return <div className="text-center m-bottom-10"><select id="type" value={this.props.currentValue} onChange={this.changeEvent} className="default-select">
            {options}
        </select></div>
    }
}

class Records extends React.Component{//= ({type, results, perPage, title, page, pages, record, currentRecords}) =>{


    constructor(props){

        
        super(props);

        this.state = {"type": this.props.type, "mode": this.props.mode};

        this.changeSelectedType = this.changeSelectedType.bind(this);
        this.changeMode = this.changeMode.bind(this);
    }

    changeSelectedType(type){

        this.setState({"type": type});
    }

    changeMode(mode){

        this.setState({"mode": mode});
    }

    render(){

        const mode = this.props.mode;
        const type = this.state.type;
        const results = this.props.results;
        const perPage = this.props.perPage;
        const title = this.props.title;
        const page = this.props.page;
        const pages = this.props.pages;
        const record = this.props.record;
        const currentRecords = this.props.currentRecords;

        const url = `/records?mode=${mode}&type=${type}&page=`;

        const start = (page - 1 < 1) ? 1 : (page - 1) * perPage;
        const end = (page * perPage < results) ? page * perPage : results;

        return <div>
            <DefaultHead 
            title={`${title} - ${(mode === 0) ? "Player" : "Match" } Records Page ${page} of ${pages}`} 
            description={`View the top ${title} ${(mode === 0) ? "Player" : "Match" } Records, displaying page ${page} of ${pages} records ${start} to ${end}, out of a possible ${results} records.`} 
            host={this.props.host}
            keywords={`records,record,${title},${(mode === 0) ? "Player" : "Match" }`}/>
            <main>
                <Nav />
                <div id="content">
                    <div className="default">
                        <div className="default-header">Records</div>
                    

                        <div className="big-tabs">
                            <Link href={`/records?mode=0&type=${type}&page=`}><a><div className={`big-tab ${(this.props.mode === 0) ? "tab-selected" : ""}`}>
                                Player Records
                            </div></a></Link>

                            <Link href={`/records?mode=1&type=${type}&page=`}><a><div className={`big-tab ${(this.props.mode === 1) ? "tab-selected" : ""}`}>
                                Match Records
                            </div></a></Link>
                        </div>
                        <SelectionBox mode={mode} currentValue={type} changeEvent={this.changeSelectedType}/>
                        <Link href={`${url}1`}><a className="search-button text-center">Search</a></Link>
                        <div className={styles.info}>Displaying {(mode === 0) ? "Player" : "Match"} {title} records</div>
                        <RecordsList mode={mode} type={this.state.type} title={title} data={currentRecords} page={page} perPage={perPage} record={record}/>
                        <div className="text-center">
                            <Pagination currentPage={page} results={results} pages={pages} perPage={perPage} url={url}/>
                        </div>
                    </div>
                </div>
                <Footer />
            </main>
        </div>
    }
}

export async function getServerSideProps({req, query}){

    let type = "kills";
    let page = 1;
    let perPage = 50;
    let mode = 0;
    let title = "Kills";

    let typeIndex = 0;

    if(query.mode !== undefined){

        mode = parseInt(query.mode);

        if(page !== page){
            mode = 0;
        }else{

            if(mode !== 0 && mode !== 1){
                mode = 0;
            }
        }
    }

    if(query.type !== undefined){

        if(mode === 0){
            typeIndex = validTypes.indexOf(query.type.toLowerCase());
        }else{
            typeIndex = validTypesMatch.indexOf(query.type.toLowerCase());
        }


        if(typeIndex === -1) typeIndex = 0;

        if(mode === 0){
            type = validTypes[typeIndex];
            title = typeTitles[typeIndex];
        }else{
            type = validTypesMatch[typeIndex];
            title= typeTitlesMatch[typeIndex];
        }
            
      
    }

    if(query.page !== undefined){

        page = parseInt(query.page);

        if(page !== page){
            page = 1;
        }else{
            if(page < 1) page = 1;
        }
    }

    const playerManager = new Players();

    let currentRecords = [];
    let highestValue = [{"value": 0}];
    let totalResults = 0;

    if(mode === 0){

        currentRecords = await playerManager.getBestOfTypeTotal(validTypes, type, 0, perPage, page);
        highestValue = await playerManager.getBestOfTypeTotal(validTypes, type, 0, 1, 1);
        totalResults = await playerManager.getTotalResults(0);

    }else{

        currentRecords = await playerManager.getBestMatchValues(validTypesMatch, type, page, perPage);
        highestValue = await playerManager.getBestMatchRecord(validTypesMatch, type);
        totalResults = await playerManager.getTotalMatchResults();

        const playerIds = Functions.getUniqueValues(currentRecords, 'player_id');
        const playerNames = await playerManager.getJustNamesByIds(playerIds);

        const mapIds = Functions.getUniqueValues(currentRecords, 'map_id');

        const mapManager = new Maps();

        const mapNames = await mapManager.getNames(mapIds);

        Functions.setIdNames(currentRecords, playerNames, 'player_id', 'name');
        Functions.setIdNames(currentRecords, mapNames, 'map_id', 'map');


    }

    let pages = Math.ceil(totalResults / perPage);

    if(pages !== pages) pages = 1;

    return {
        "props": {
            "host": req.headers.host,
            "mode": mode,
            "type": type,
            "results": totalResults,
            "page": page,
            "pages": pages,
            "perPage": perPage,
            "record": JSON.stringify(highestValue),
            "currentRecords": JSON.stringify(currentRecords),
            "title": title
        }
    }
}

export default Records;