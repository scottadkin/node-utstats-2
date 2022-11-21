import PlayerListBox from '../PlayerListBox/'
import styles from './PlayerList.module.css';
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';
import React from 'react';
import Functions from '../../api/functions';
import Table2 from '../Table2';
import Playtime from '../Playtime';

function createOrderLink(terms, type, value){

    const urlStart = "/players?";

    const currentName = terms.name;
    let currentOrderType = terms.order.toUpperCase();

    //if(currentSortType === type){
        if(value === 'ASC'){
            currentOrderType = "DESC";
        }else{
            currentOrderType = "ASC";
        }
    //}

    let currentNameString = "";

    if(currentName !== ""){
        currentNameString = `&name=${currentName}`;
    }

    return `${urlStart}sortType=${type}${currentNameString}&order=${currentOrderType}&displayType=${terms.displayType}&perPage=${terms.perPage}`;
}


class PlayersList extends React.Component{

    constructor(props){

        super(props);
        this.state = {"order": "ASC"};

        this.changeOrder = this.changeOrder.bind(this);
       // this.changeSort = this.props.changeSort.bind(this);
    }

    getRecordPercent(type, value){

        if(value === 0) return 0;

        type = type.toLowerCase();

        const records = JSON.parse(this.props.records);
        

        if(records[type] !== undefined){

            if(records[type] === 0) return 100;
       
            let percent = 100 / records[type];
      
            if(type === 'accuracy') return (value !== 0) ? value : 1 / 100;

            return percent * value;
        }

        return 0;
    }

    changeOrder(type){

        this.props.changeSort(type);

        if(this.state.order === "ASC"){
            this.setState({"order": "DESC"});
        }else{
            this.setState({"order": "ASC"});
        }
        
    }

    render(){

        const elems = [];

        let players = JSON.parse(this.props.players);

        let faces = JSON.parse(this.props.faces);

        let currentFace = 0;

        let displayType = parseInt(this.props.displayType);

        let searchTerms = JSON.parse(this.props.searchTerms);

        let p = 0;

        let currentBarPercentages = {};

        for(let i = 0; i < players.length; i++){

            p = players[i];

            currentBarPercentages = {};

            if(displayType === 1 && i === 0){
                elems.push(<tr key={-1}>
                    <th><Link href={createOrderLink(searchTerms, "name", this.state.order)}><a onClick={(() =>{
                        this.changeOrder("name");
                    })}>Name</a></Link></th>
                    <th><Link href={createOrderLink(searchTerms, "last", this.state.order)}><a onClick={(() =>{
                        this.changeOrder("last");
                    })}>Last</a></Link></th>
                    <th><Link href={createOrderLink(searchTerms, "score", this.state.order)}><a onClick={(() =>{
                        this.changeOrder("score");
                    })}>Score</a></Link></th>
                    <th><Link href={createOrderLink(searchTerms, "kills", this.state.order)}><a onClick={(() =>{
                        this.changeOrder("kills");
                    })}>Kills</a></Link></th>
                    <th><Link href={createOrderLink(searchTerms, "deaths", this.state.order)}><a onClick={(() =>{
                        this.changeOrder("deaths");
                    })}>Deaths</a></Link></th>
                    <th><Link href={createOrderLink(searchTerms, "efficiency", this.state.order)}><a onClick={(() =>{
                        this.changeOrder("efficiency");
                    })}>Efficiency</a></Link></th>
                    <th><Link href={createOrderLink(searchTerms, "accuracy", this.state.order)}><a onClick={(() =>{
                        this.changeOrder("accuracy");
                    })}>Accuracy</a></Link></th>
                    <th><Link href={createOrderLink(searchTerms, "playtime", this.state.order)}><a onClick={(() =>{
                        this.changeOrder("playtime");
                    })}>Playtime</a></Link></th>
                </tr>);
            }

            if(faces[p.face] != undefined){
                currentFace = faces[p.face];
            }else{
                currentFace = {"name": "faceless"};
            }

            if(displayType === 0){

                currentBarPercentages["playtime"] = this.getRecordPercent("playtime", p.playtime);
                currentBarPercentages["wins"] = this.getRecordPercent("wins", p.wins);
                currentBarPercentages["matches"] = this.getRecordPercent("matches", p.matches);
                currentBarPercentages["score"] = this.getRecordPercent("score", p.score);
                currentBarPercentages["kills"] = this.getRecordPercent("kills", p.kills);
                currentBarPercentages["deaths"] = this.getRecordPercent("deaths", p.deaths);
                currentBarPercentages["accuracy"] = this.getRecordPercent("accuracy", p.accuracy);
                currentBarPercentages["wins"] = this.getRecordPercent("wins", p.wins);
                currentBarPercentages["efficiency"] = this.getRecordPercent("efficiency", p.efficiency);

                elems.push(<PlayerListBox key={i} 

                    playerId={p.id} 
                    name={p.name} 
                    country={p.country}
                    playtime={p.playtime}
                    wins={p.wins}
                    matches={p.matches}
                    score={p.score}
                    kills={p.kills}
                    deaths={p.deaths}
                    face={currentFace.name}
                    first={p.first}
                    last={p.last}
                    accuracy={parseInt(p.accuracy)}
                    displayType={displayType}
                    recordsPercent={currentBarPercentages}
                    host={this.props.host}
                />);

            }else{
                elems.push(<tr key={i}>
                    <td><CountryFlag country={p.country} host={this.props.host}/> <Link href={`/player/${p.id}`}><a>{p.name}</a></Link></td>
                    <td>{Functions.convertTimestamp(p.last, true)}</td>
                    <td>{p.score}</td>
                    <td>{p.kills}</td>
                    <td>{p.deaths}</td>
                    <td>{p.efficiency.toFixed(2)}%</td>
                    <td>{p.accuracy.toFixed(2)}%</td>
                    <td><Playtime timestamp={p.playtime}/></td>
            
                </tr>);
            }
        }

        if(displayType === 0){
            return (
                <div className={styles.box}>
                    {elems}
                </div>
            );
        }else{

            return <div className={styles.table}>
                <Table2 width={1}>   
                    {elems}      
                </Table2>
            </div>;
        }
    }
    
}


export default PlayersList;