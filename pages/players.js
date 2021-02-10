import Link from 'next/link';
import DefaultHead from '../components/defaulthead'
import Nav from '../components/Nav/'
import Footer from '../components/Footer/'
import PlayersList from '../components/PlayerList/'
import PlayerManager from '../api/players';
import Faces from '../api/faces'
import Player from '../api/player';
import Pagination from '../components/Pagination/';
import {useEffect, useRef} from 'react'; 

class Players extends React.Component{

    constructor(props){
        super(props);
        this.state = {"value": this.props.sortType, "order": this.props.order}
        this.handleSortChange = this.handleSortChange.bind(this);
        this.handleOrderChange = this.handleOrderChange.bind(this);
    }

    handleSortChange(event){

        //event.preventDefault;
        this.setState({"value": event.target.value});
    }

    handleOrderChange(event){
        this.setState({"order": event.target.value});
    }

    render(){

        const perPage = 5;
        const pages = Math.ceil(this.props.totalPlayers / perPage);

        let url = `/players?sortType=${this.state.value}&order=${this.state.order}&page=`;


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
                    <label for="sort-type">Sort Type</label>
                    <select id="sort-type" name="sort-type" value={this.state.value} onChange={this.handleSortChange}>
                        <option value="name">Name</option>
                        <option value="country">Country</option>
                        <option value="matches">Matches</option>
                        <option value="score">Score</option>
                        <option value="kills">Kills</option>
                        <option value="deaths">Deaths</option>
                    </select>
                    <label for="order-type">Order</label>
                    <select id="order-type" value={this.state.order} name="order-type" onChange={this.handleOrderChange}>
                        <option value="ASC">Ascending</option>
                        <option value="DESC">Descending</option>
                    </select>
                    <Pagination url={url}  currentPage={this.props.page} pages={pages} perPage={perPage} results={this.props.totalPlayers}/>
                    <PlayersList players={this.props.players} faces={this.props.faces} records={this.props.records}/>
                    </div>
                </div>
                <Footer />
                </main>   
            </div>
        );
    }
}

/*
function Players({page, players, totalPlayers, faces, records}){

    const perPage = 5;
    const pages = Math.ceil(totalPlayers / perPage);

    let url = "/players?sort=name&page=";

    const options = JSON.stringify(['test','test2','fart']);
    
    const option = useRef(null);


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
                <select id="sort-type" ref={option}>
                    <option value="name">Name</option>
                    <option value="country">Country</option>
                    <option value="matches">Matches</option>
                    <option value="score">Score</option>
                    <option value="kills">Kills</option>
                    <option value="deaths">Deaths</option>
                </select>
                <Pagination url={url} options={options} currentPage={page} pages={pages} perPage={perPage} results={totalPlayers}/>
                <PlayersList players={players} faces={faces} records={records}/>
                </div>
            </div>
            <Footer />
            </main>   
        </div>
    );
}*/

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

    

    console.log(`sortType = ${sortType}`);
    let players = await Manager.getPlayers(page, 5, sortType, order);
    //let players = await Manager.debugGetAll();
    let totalPlayers = await Manager.getTotalPlayers();

    const facesToGet = [];

    for(let i = 0; i < players.length; i++){

        if(facesToGet.indexOf(players[i].face) === -1){
            facesToGet.push(players[i].face);
        }
    }

    let faces = await FaceManager.getFacesWithFileStatuses(facesToGet);

    let records = await Manager.getMaxValues(['matches','efficiency','score','kills','deaths','winrate','accuracy']);

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
            order
        }
    }
}


export default Players;