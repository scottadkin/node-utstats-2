import styles from '../PlayerSummary/PlayerSummary.module.css';
import React from 'react';
import Functions from '../../api/functions';

class PlayerFragSummary extends React.Component{

    constructor(props){

        super(props);

        this.state = {"mode": 0};

        this.changeMode = this.changeMode.bind(this);
    }

    componentDidMount(){

        const settings = this.props.session;

        if(settings["playerPageFragMode"] !== undefined){
            this.setState({"mode": parseInt(settings["playerPageFragMode"])});
        }
    }

    changeMode(id){
        this.setState({"mode": id});
        Functions.setCookie("playerPageFragMode", id);
    }


    displayGeneral(){

        return <table className="t-width-1">
            <tbody>
                <tr>
                    <th>Score</th>
                    <th>Frags</th>
                    <th>Suicides</th>
                    <th>Team Kills</th>
                    <th>Kills</th>
                    <th>Deaths</th>  
                    <th>Efficiency</th>
                    <th>Last Accuracy</th>
                </tr>
                <tr>
                    <td>{this.props.score}</td>
                    <td>{this.props.frags}</td>
                    <td>{this.props.suicides}</td>
                    <td>{this.props.teamKills}</td>
                    <td>{this.props.kills}</td>
                    <td>{this.props.deaths}</td>  
                    <td>{this.props.efficiency.toFixed(2)}%</td>
                    <td>{this.props.accuracy.toFixed(2)}%</td>
                </tr>
            </tbody>
        </table>      
    }

    displayExtended(){

        return <table className="t-width-1">
            <tbody>
                <tr>
                    <th>Headshots</th>
                    <th>Spawn Kills</th>
                    <th>Best Spawn Kill Spree</th>
                    <th>Close Range Kills</th>
                    <th>Long Range Kills</th>
                    <th>Uber Long Range kills</th>
                </tr>
                <tr>
                    <td>{this.props.headshots}</td>
                    <td>{this.props.spawnKills}</td>
                    <td>{this.props.spawnKillSpree} Kills</td>
                    <td>{this.props.close}</td>
                    <td>{this.props.long}</td>
                    <td>{this.props.uber}</td>
                </tr>
            </tbody>
        </table>
    }

    render(){
        return <div className="special-table">
            <div className="default-header">Frag Summary</div>
            <div className="tabs">
                <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(0);
                })}>General</div>
                <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : ""}`}  onClick={(() =>{
                    this.changeMode(1);
                })}>Extended</div>
            </div>

            {(this.state.mode === 0) ? this.displayGeneral() : this.displayExtended()}
        </div>
    }
}

export default PlayerFragSummary;