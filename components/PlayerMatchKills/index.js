import React from 'react';
import Functions from '../../api/functions';
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';


class PlayerMatchKills extends React.Component{

    constructor(props){

        super(props);
    }


    getKillsDeaths(target){

        let kills = 0;
        let deaths = 0;

        let k = 0;

        for(let i = 0; i < this.props.data.length; i++){

            k = this.props.data[i];

            if(k.killer === target){
     
                if(k.victim !== 0){
                    kills++;
                }
            }

            if(k.victim === target) deaths++;
        }


        return {"kills": kills, "deaths": deaths};
    }

    renderKillsTable(){

        const rows = [];

        let p = 0;

        const players = this.props.players;

        players.sort((a, b) =>{

            a = a.name;
            b = b.name;

            if(a > b){
                return 1;
            }else if(a < b){
                return -1;
            }

            return 0;
        });

        const playerElem = <Link href={`/player/${this.props.player.id}`}>
                <a>
                    <CountryFlag country={this.props.player.country}/>{this.props.player.name}
                </a>
            </Link>
        

        let currentKills = 0;

        for(let i = 0; i < players.length; i++){

            p = players[i];

            if(p.id === this.props.player.id){
                continue;
            }

            currentKills = this.getKillsDeaths(p.id);

            rows.push(<tr key={i}>
                <td>{Functions.ignore0(currentKills.deaths)}</td>
                <td>{playerElem}</td>
                <td>-</td>
                <td>
                    <Link href={`/player/${p.id}`}>
                        <a>
                            <CountryFlag country={p.country}/>{p.name}
                        </a>
                    </Link>
                </td>
                <td>{Functions.ignore0(currentKills.kills)}</td>
            </tr>);

            /*
            rows.push(<tr key={i}>
                <td className="text-left">
                    <Link href={`/player/${p.id}`}>
                        <a>
                            <CountryFlag country={p.country}/>{p.name}
                        </a>
                    </Link>
                </td>
                <td>{Functions.ignore0(currentKills.kills)}</td>
                <td>{Functions.ignore0(currentKills.deaths)}</td>
            </tr>)*/
        }

        const suicides = this.getKillsDeaths(0);

        return <div>
            <table className="t-width-2">
                <tbody>
                    <tr>
                        <th>Kills</th>  
                        <th>Player</th>
                        <th>VS</th>
                        <th>Player</th>
                        <th>Kills</th>
                    </tr>
                    {rows}
                    <tr>
                        <td className="black">
                            Suicides
                        </td>
                        <td className="black" colSpan={4}>
                            {suicides.deaths}
                        </td>
                    </tr>
                </tbody>
            </table>
            
        </div>
    }

    render(){

        //render suicides separately 

        return <div>
            <div className="default-header">Kills Summary</div>

            {this.renderKillsTable()}
        </div>
    }
}

export default PlayerMatchKills;