import Link from 'next/link';
import DefaultHead from '../components/defaulthead'
import Nav from '../components/Nav/'
import Footer from '../components/Footer/'
import PlayersList from '../components/PlayerList/'
import PlayerManager from '../api/players';
import Faces from '../api/faces';
import Pagination from '../components/Pagination/';


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
    }

    handleSortChange(event){

        //event.preventDefault;
        this.setState({"value": event.target.value});
    }

    handleOrderChange(event){
        this.setState({"order": event.target.value});
    }

    handleNameChange(event){
        this.setState({"name": event.target.value});    
    }

    handlePerPageChange(event){
        
        this.setState({"perPage": parseInt(event.target.value)});
    }

    handleDisplayTypeChange(event){
        this.setState({"displayType": parseInt(event.target.value)});
    }

    render(){

        const pages = Math.ceil(this.props.totalPlayers / this.props.perPage);

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
                        searchTerms={JSON.stringify(this.state)}/>
            paginationElem = <Pagination url={url}  currentPage={this.props.page} pages={pages} perPage={this.props.perPage} results={this.props.totalPlayers}/>;
        }else{

            pList = <div className="not-found">There are no matches for your search terms.</div>
            paginationElem = '';
        }


        return (
            <div>
                <DefaultHead />
                
                <main>
                <Nav />
                <div id="content">
                    <div className="default">
                    <div className="default-header">
                        Players
                    </div>
                    
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
                        <select id="order-type" className="default-select"  value={this.state.order} name="order-type" onChange={this.handleOrderChange}>
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
                        <div className="default-radios" id="displayType">
                            
                            <div id="d-type" onChange={this.handleDisplayTypeChange}
                            value={this.state.displayType}>
                                Default
                                {radio1}
                                Table
                                {radio2}
                            </div>
                        </div>
                    </div>
                    <input type="range" min="1" max="2" value="1"/>
                    <Link href={`${url}${this.props.page}`}><a className="search-button">Search</a></Link>
                    
                    {paginationElem}
                    {pList}
                    </div>
                </div>
                <Footer />
                </main>   
            </div>
        );
    }
}

export async function getServerSideProps({query}){

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

    let records = await Manager.getMaxValues(['matches','efficiency','score','kills','deaths','winrate','accuracy','first','last']);

    players = JSON.stringify(players);
   // console.log(players);
    faces = JSON.stringify(faces);

    records = JSON.stringify(records);

    //console.log(faces);

    return {
        props: {
            page,
            players,
            totalPlayers,
            faces,
            records,
            sortType,
            order, 
            name,
            perPage,
            displayType
        }
    }
}


export default Players;