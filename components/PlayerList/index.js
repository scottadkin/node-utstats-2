import PlayerListBox from '../PlayerListBox/'
import styles from './PlayerList.module.css';
import CountryFlag from '../CountryFlag/';
import TimeStamp from '../TimeStamp/';
import Link from 'next/link';

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
    }

    changeOrder(){


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

        for(let i = 0; i < players.length; i++){

            p = players[i];

            if(displayType === 1 && i === 0){
                elems.push(<tr key={-1}>
                    <th><Link href={createOrderLink(searchTerms, "name", this.state.order)}><a onClick={this.changeOrder}>Name</a></Link></th>
                    <th><Link href={createOrderLink(searchTerms, "first", this.state.order)}><a onClick={this.changeOrder}>First</a></Link></th>
                    <th><Link href={createOrderLink(searchTerms, "last", this.state.order)}><a onClick={this.changeOrder}>Last</a></Link></th>
                    <th><Link href={createOrderLink(searchTerms, "score", this.state.order)}><a onClick={this.changeOrder}>Score</a></Link></th>
                    <th><Link href={createOrderLink(searchTerms, "kills", this.state.order)}><a onClick={this.changeOrder}>Kills</a></Link></th>
                    <th><Link href={createOrderLink(searchTerms, "deaths", this.state.order)}><a onClick={this.changeOrder}>Deaths</a></Link></th>
                    <th><Link href={createOrderLink(searchTerms, "efficiency", this.state.order)}><a onClick={this.changeOrder}>Efficiency</a></Link></th>
                    <th><Link href={createOrderLink(searchTerms, "accuracy", this.state.order)}><a onClick={this.changeOrder}>Accuracy</a></Link></th>
                    <th><Link href={createOrderLink(searchTerms, "playtime", this.state.order)}><a onClick={this.changeOrder}>Playtime (Hours)</a></Link></th>
                    <th><Link href={createOrderLink(searchTerms, "matches", this.state.order)}><a onClick={this.changeOrder}>Matches</a></Link></th>
                </tr>);
            }

            currentFace = faces[p.face];


            if(!currentFace.imageExists){
                currentFace = {"name": "faceless"};
            }

            if(displayType === 0){
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
                    records={this.props.records}
                    accuracy={parseInt(p.accuracy)}
                    displayType={displayType}
                />);

            }else{
                elems.push(<tr key={i}>
                    <td><CountryFlag country={p.country}/> <Link href={`/player/${p.id}`}><a>{p.name}</a></Link></td>
                    <td><TimeStamp timestamp={p.first} noTime="1" noDayName="1"/></td>
                    <td><TimeStamp timestamp={p.last}  noTime="1" noDayName="1"/></td>
                    <td>{p.score}</td>
                    <td>{p.kills}</td>
                    <td>{p.deaths}</td>
                    <td>{p.efficiency.toFixed(2)}%</td>
                    <td>{p.accuracy.toFixed(2)}%</td>
                    <td>{(p.playtime / (60 * 60)).toFixed(2)}</td>
                    <td>{p.matches}</td>
            
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

            return (<div className={`special-table`}>
            <table >
                <tbody className={styles.table}>
                    {elems}
                </tbody>
            </table>
            </div>);
        }
    }
    
}


export default PlayersList;