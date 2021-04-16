import DefaultHead from '../components/defaulthead';
import Nav from '../components/Nav/';
import Footer from '../components/Footer/';
import Players from '../api/players';
import Functions from '../api/functions';
import RecordsList from '../components/RecordsList/';
import Pagination from '../components/Pagination/';
import React from 'react';
import Link from 'next/link';

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
    "Matches",
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

        this.state = {"type": this.props.type};

        this.changeSelectedType = this.changeSelectedType.bind(this);
    }

    changeSelectedType(type){

        this.setState({"type": type});
    }

    render(){

        const type = this.state.type;
        const results = this.props.results;
        const perPage = this.props.perPage;
        const title = this.props.title;
        const page = this.props.page;
        const pages = this.props.pages;
        const record = this.props.record;
        const currentRecords = this.props.currentRecords;

        const url = `/records?type=${type}&page=`;

        return <div>
            <DefaultHead />
            <main>
                <Nav />
                <div id="content">
                    <div className="default">
                        <div className="default-header">{title} Records</div>
                    </div>

                    <SelectionBox changeEvent={this.changeSelectedType}/>
                    <Link href={url}><a className="search-button text-center">Search</a></Link>
                    <RecordsList data={currentRecords} page={page} perPage={perPage} record={record}/>
                    <div className="text-center">
                        <Pagination currentPage={page} results={results} pages={pages} perPage={perPage} url={url}/>
                    </div>
                </div>
                <Footer />
            </main>
        </div>
    }
}

export async function getServerSideProps({query}){

    let type = "kills";
    let page = 1;
    let perPage = 50;

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

    const playerManager = new Players();


    const currentRecords = await playerManager.getBestOfTypeTotal(validTypes, type, 0, perPage, page);
    const highestValue = await playerManager.getBestOfTypeTotal(validTypes, type, 0, 1, 1);
    const totalResults = await playerManager.getTotalResults(0);

    let pages = Math.ceil(totalResults / perPage);

    if(pages !== pages) pages = 1;

    return {
        "props": {
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