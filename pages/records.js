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
    "best_spawn_kill_spree"
];

const typeTitles = [
    "Total Matches",
    "Wins",
    "Losses",
    "Draws",
    "WinRate",
    "Playtime(Hours)",
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
    "Longest Spawn Killing Spree"
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
    "best_spawn_kill_spree"
];

const typeTitlesMatch = [
    "Playtime(Hours)",
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
    "Longest Spawn Killing Spree"
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

        for(let i = 0; i < validTypes.length; i++){
            options.push(<option key={i} value={validTypes[i]}>{typeTitles[i]}</option>);
        }

        return <div className="text-center m-bottom-10"><select id="type" onChange={this.changeEvent} className="default-select">
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

        const mode = this.state.mode;
        const type = this.state.type;
        const results = this.props.results;
        const perPage = this.props.perPage;
        const title = this.props.title;
        const page = this.props.page;
        const pages = this.props.pages;
        const record = this.props.record;
        const currentRecords = this.props.currentRecords;

        const url = `/records?mode=${mode}&type=${type}&page=`;

        return <div>
            <DefaultHead />
            <main>
                <Nav />
                <div id="content">
                    <div className="default">
                        <div className="default-header">Records</div>
                    

                        <div className="big-tabs">
                            <div className={`big-tab ${(this.state.mode === 0) ? "tab-selected" : ""}`} onClick={(() =>{
                                this.changeMode(0);
                            })}>Player Records</div>
                            <div className={`big-tab ${(this.state.mode === 1) ? "tab-selected" : ""}`} onClick={(() =>{
                                this.changeMode(1);
                            })}>Match Records</div>
                        </div>
                        <SelectionBox changeEvent={this.changeSelectedType}/>
                        <Link href={`${url}1`}><a className="search-button text-center">Search</a></Link>
                        <RecordsList data={currentRecords} page={page} perPage={perPage} record={record}/>
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

export async function getServerSideProps({query}){

    let type = "matches";
    let page = 1;
    let perPage = 50;
    let mode = 0;

    console.log(query);

    let typeIndex = 0;

    if(query.type !== undefined){

        typeIndex = validTypes.indexOf(query.type.toLowerCase());

        if(typeIndex !== -1){
            type = validTypes[typeIndex];
        }else{
            typeIndex = 0;
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

        console.log(currentRecords);
    }

    let pages = Math.ceil(totalResults / perPage);

    if(pages !== pages) pages = 1;

    return {
        "props": {
            "mode": mode,
            "type": type,
            "results": totalResults,
            "page": page,
            "pages": pages,
            "perPage": perPage,
            "title": typeTitles[typeIndex],
            "record": JSON.stringify(highestValue),
            "currentRecords": JSON.stringify(currentRecords)
        }
    }
}

export default Records;