import Link from 'next/link';
import DefaultHead from '../components/defaulthead'
import Nav from '../components/Nav/'
import Footer from '../components/Footer/'
import PlayersList from '../components/PlayerList/'
import PlayerManager from '../api/players';
import Faces from '../api/faces';
import Pagination from '../components/Pagination/';
import Option2 from '../components/Option2';
import React from 'react';
import Session from '../api/session';
import SiteSettings from '../api/sitesettings';


class Players extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "value": this.props.sortType, 
            "order": this.props.order, 
            "name": this.props.name, 
            "perPage": this.props.perPage,
            "displayType": this.props.displayType
        }

        this.handleSortChange = this.handleSortChange.bind(this);
        this.handleOrderChange = this.handleOrderChange.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this);
        this.handlePerPageChange = this.handlePerPageChange.bind(this);
        this.handleDisplayTypeChange = this.handleDisplayTypeChange.bind(this);
        this.changeDisplay = this.changeDisplay.bind(this);

        this.changeSortAlt = this.changeSortAlt.bind(this);
    }


    setCookie(key, value){

        const maxAge = ((60 * 60) * 24) * 365;

        document.cookie = `${key}=${value}; max-age=${maxAge}; path=/;`;
    }

    componentDidMount(){

        const settings = JSON.parse(this.props.pageSettings);

        const session = JSON.parse(this.props.session);


        if(settings["Default Display Per Page"] !== undefined){

            if(session["playersPerPage"] === undefined){
                this.setState({"perPage": parseInt(settings["Default Display Per Page"])});
            }else{
                this.setState({"perPage": parseInt(session["playersPerPage"])});
            }
        }

        if(settings["Default Order"] !== undefined){

            if(session["playersOrderBy"] === undefined){
                this.setState({"order": settings["Default Order"]});
            }else{
                this.setState({"order": session["playersOrderBy"]});
            }
        }

        if(settings["Default Display Type"] !== undefined){

            if(session["playersDisplayType"] === undefined){
                this.setState({"displayType": parseInt(settings["Default Display Type"])});
            }else{
                this.setState({"displayType": parseInt(session["playersDisplayType"])});
            }
        }

        if(settings["Default Sort Type"] !== undefined){

            if(session["playersSortBy"] === undefined){
                this.setState({"value": settings["Default Sort Type"]});
            }else{
                this.setState({"value": session["playersSortBy"]});
            }
        }

    }

    handleSortChange(event){

        //event.preventDefault;
        this.setState({"value": event.target.value});

        this.setCookie("playersSortBy", event.target.value);
    }

    changeSortAlt(value){

        this.setState({"value": value});
        this.setCookie("playersSortBy", value);
    }

    handleOrderChange(event){
        this.setState({"order": event.target.value});
        this.setCookie("playersOrderBy", event.target.value);
    }

    handleNameChange(event){
        this.setState({"name": event.target.value});  
        this.setCookie("playersName", event.target.value);  
    }

    handlePerPageChange(event){
        
        this.setState({"perPage": parseInt(event.target.value)});

        let value = parseInt(event.target.value);

        if(value !== value) value = 25;

        this.setCookie("playersPerPage", value);
    }

    handleDisplayTypeChange(event){

        let value = parseInt(event.target.value);
        if(value !== value) value = 0;

        this.setState({"displayType": value});
        this.setCookie("playersDisplayType", value);
    }

    changeDisplay(id){

        id = parseInt(id);

        if(id !== id) id = 0;

        this.setState({"displayType": id});
        this.setCookie("playersDisplayType", id);
    }

    render(){

        let pages = Math.ceil(this.props.totalPlayers / this.props.perPage);
        if(pages === 0) pages = 1;

        let url = `/players?sortType=${this.state.value}&order=${this.state.order}&name=${this.state.name}&perPage=${this.state.perPage}&displayType=${this.state.displayType}&page=`;


        let radio1 = <input type="radio" name="displayType" value="0"/>;

        if(this.state.displayType === 0){
            radio1 = <input type="radio" name="displayType" defaultChecked value="0"/>
        }

        let radio2 = <input type="radio" name="displayType" value="1"/>
        if(this.state.displayType === 1){
            radio2 = <input type="radio" name="displayType" defaultChecked value="0"/>
        }

        let pList = '';
        let paginationElem = '';

        const parsedPlayers = JSON.parse(this.props.players);

        if(parsedPlayers.length > 0){

            pList = <PlayersList players={this.props.players} faces={this.props.faces} records={this.props.records} displayType={this.state.displayType}
                        searchTerms={JSON.stringify(this.state)} changeSort={this.changeSortAlt}/>
            paginationElem = <Pagination url={url}  currentPage={this.props.page} pages={pages} perPage={this.props.perPage} results={this.props.totalPlayers}/>;
        }else{

            pList = <div className="not-found">There are no matches for your search terms.</div>
            paginationElem = '';
        }


        const start = (this.props.page - 1 < 1) ? 1 : (this.props.page - 1) * this.props.perPage;
        const end = (this.props.page * this.props.perPage <= this.props.totalPlayers) ? this.props.page * this.props.perPage : this.props.totalPlayers;

        const nameString = (this.props.name !== "") ? `Search for ${this.props.name} ` : "";

        return (
            <div>
                <DefaultHead host={this.props.host} 
                title={`Players ${nameString} Page ${this.props.page} of ${pages}`} 
                description={`Viewing players ${nameString} page ${this.props.page} of ${pages}, players ${start} to ${end} out of a possible ${this.props.totalPlayers} players.`} 
                keywords={`search,players,player,page ${this.props.page}`}/>
                
                <main>
                <Nav settings={this.props.navSettings} session={this.props.session}/>
                <div id="content">
                    <div className="default">
                    <div className="default-header">
                        Players
                    </div>
                    <form className="form">
                        <input type="text" name="name" id="name" autoComplete="off" className="default-textbox" placeholder="Player Name..." value={this.state.name} 
                        onChange={this.handleNameChange}/>
                        <div className="select-row">
                            <div className="select-label">Sort Type</div>
                            <select id="sortType" className="default-select" name="sortType" value={this.state.value} onChange={this.handleSortChange}>
                                <option value="name">Name</option>
                                <option value="country">Country</option>
                                <option value="matches">Matches</option>
                                <option value="score">Score</option>
                                <option value="kills">Kills</option>
                                <option value="deaths">Deaths</option>
                                <option value="first">First</option>
                                <option value="last">Last</option>
                            </select>
                        </div>
                        <div className="select-row">
                            <div className="select-label">Order</div>
                            <select id="orderType" className="default-select"  value={this.state.order} name="orderType" onChange={this.handleOrderChange}>
                                <option value="ASC">Ascending</option>
                                <option value="DESC">Descending</option>
                            </select>
                        </div>
                        <div className="select-row">
                            <div className="select-label">Display Per Page</div>
                            <select id="perPage" value={this.state.perPage} name="perPage" className="default-select" onChange={this.handlePerPageChange}>
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="75">75</option>
                                <option value="100">100</option>
                            </select>
                        </div>

                        <div className="select-row">
                            <div className="select-label">Display</div>
                            <Option2 title1="Default" title2="Table" value={this.state.displayType} changeEvent={this.changeDisplay}/>
                            <input type="hidden" name="displayType" value={this.state.displayType}/>
                        </div>
                    
                        <Link href={`${url}${this.props.page}`}><a className="search-button">Search</a></Link>
                    </form>
                    
                    {paginationElem}
                    {pList}
                    </div>
                </div>
                <Footer session={this.props.session}/>
                </main>   
            </div>
        );
    }
}

export async function getServerSideProps({req, query}){

    const Manager = new PlayerManager();
    const FaceManager = new Faces();

    let page = 1;

    if(query.page !== undefined){
        page = parseInt(query.page);

        if(page !== page){
            page = 1;
        }
    }

    const defaultPerPage = 25;
    let perPage = defaultPerPage;

    if(query.perPage !== undefined){

        perPage = parseInt(query.perPage);

        if(perPage !== perPage){
            perPage = defaultPerPage;
        }

        if(perPage > 100){
            perPage = defaultPerPage25;
        }else if(perPage < 1){
            perPage = 1;
        }
    }

    let displayType = 0;

    if(query.displayType !== undefined){

        displayType = parseInt(query.displayType);

        if(displayType !== 0 && displayType !== 1){
            displayType = 0;
        }
    }

    let sortType = 'name';

    if(query.sortType !== undefined){

        sortType = query.sortType;
    }

    let order = 'ASC';

    if(query.order !== undefined){
        order = query.order.toUpperCase();
        if(order !== 'ASC' && order !== 'DESC'){
            order = 'ASC';
        }
    }

    let name = '';

    if(query.name !== undefined){
        name = query.name;
    }


    let players = await Manager.getPlayers(page, perPage, sortType, order, name);
    //let players = await Manager.debugGetAll();
    let totalPlayers = await Manager.getTotalPlayers(name);

    const facesToGet = [];

    for(let i = 0; i < players.length; i++){

        if(facesToGet.indexOf(players[i].face) === -1){
            facesToGet.push(players[i].face);
        }
    }

    let faces = await FaceManager.getFacesWithFileStatuses(facesToGet);

    let records = await Manager.getMaxValues(['matches','efficiency','score','kills','deaths','accuracy','first','last','wins','playtime']);

    players = JSON.stringify(players);
   // console.log(players);
    faces = JSON.stringify(faces);

    records = JSON.stringify(records);

    const session = new Session(req.headers.cookie);

	await session.load();

    const settings = new SiteSettings();

    const navSettings = await settings.getCategorySettings("Navigation");
    const pageSettings = await settings.getCategorySettings("Players Page");

    return {
        props: {
            "host": req.headers.host,
            "page": page,
            "players": players,
            "totalPlayers": totalPlayers,
            "faces": faces,
            "records": records,
            "sortType": sortType,
            "order": order, 
            "name": name,
            "perPage": perPage,
            "displayType": displayType,
            "session": JSON.stringify(session.settings),
            "navSettings": JSON.stringify(navSettings),
            "pageSettings": JSON.stringify(pageSettings)
        }
    }
}


export default Players;