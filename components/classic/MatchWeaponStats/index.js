import React from 'react';
import CountryFlag from '../../CountryFlag';
import Functions from '../../../api/functions';
import Link from 'next/link';

class MatchWeaponStats extends React.Component{

    constructor(props){

        super(props);
        this.state = {"index": 0, "weapon": 0};

        this.changeWeapon = this.changeWeapon.bind(this);

     

    }

    componentDidMount(){

        for(const [key] of Object.entries(this.props.names)){

            this.setState({"weapon": parseInt(key)});
            break;
        }
    }

    changeWeapon(index, id){

        this.setState({"index": index, "weapon": parseInt(id)});
    }

    createTab(id, key, value){
        
        return <div key={key} className={`tab ${(this.state.index === id) ? "tab-selected" : ""}`} onClick={(() =>{
                this.changeWeapon(id, key);
        })}>
            {value}
        </div>
    }

    renderTabs(){

        if(this.props.names.length < 2) return null;

        const tabs = [];

        let i = 0;

        for(const [key, value] of Object.entries(this.props.names)){

            tabs.push(this.createTab(i, key, value));

            i++;
        }

        if(tabs.length < 2) return null;

        return <div className="tabs">
            {tabs}
        </div>
    }

    renderWeapon(){

        const weapon = this.props.names[this.state.weapon];

        const rows = [];
        let d = 0;

        let currentPlayer = "";
        
        let colorClass = "team-none";

        for(let i = 0; i < this.props.data.length; i++){

            d = this.props.data[i];

            if(d.weapon === this.state.weapon){

                currentPlayer = this.props.players[d.pid];

                if(currentPlayer === undefined){

                    currentPlayer = {
                        "team": 255,
                        "country": "xx",
                        "id": -1,
                        "name": "Not Found"
                    };
                }

                if(this.props.teams >= 2){
                    colorClass = Functions.getTeamColor(currentPlayer.team);
                }

                rows.push(<tr key={i}>
                    <td className={colorClass}>
                        <Link href={`/classic/pmatch/${this.props.matchId}?p=${currentPlayer.id}`}>
                            <a>
                                <CountryFlag country={currentPlayer.country}/>{currentPlayer.name}
                            </a>
                        </Link>
                    </td>
                    <td>{Functions.ignore0(d.kills)}</td>
                    <td>{Functions.ignore0(d.shots)}</td>
                    <td>{Functions.ignore0(d.hits)}</td>
                    <td>{d.acc.toFixed(2)}%</td>
                    <td>{Functions.cleanDamage(d.damage)}</td>
 
                </tr>);
            }
        }

        if(rows.length === 0) return null;

        return <div>
            <div className="default-sub-header">{weapon}</div>
            <table className="t-width-1 td-1-left td-1-150 m-bottom-25">
                <tbody>
                    <tr>
                        <th>Player</th>
                        <th>Kills</th>
                        <th>Shots</th>
                        <th>Hits</th>
                        <th>Accuracy</th>
                        <th>Damage</th>
                    </tr>
                    {rows}
                </tbody>
            </table>
        </div>
    }

    render(){

        return <div>
            <div className="default-header">Weapon Stats</div>
            {this.renderTabs()}

            {this.renderWeapon()}
        </div>
    }
}

export default MatchWeaponStats;