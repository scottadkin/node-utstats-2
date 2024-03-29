import React from 'react';
import Functions from '../../api/functions';
import Table2 from '../Table2';

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

        return <Table2 width={1}>
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
                <td>{Functions.ignore0(this.props.score)}</td>
                <td>{Functions.ignore0(this.props.frags)}</td>
                <td>{Functions.ignore0(this.props.suicides)}</td>
                <td>{Functions.ignore0(this.props.teamKills)}</td>
                <td>{Functions.ignore0(this.props.kills)}</td>
                <td>{Functions.ignore0(this.props.deaths)}</td>  
                <td>{this.props.efficiency.toFixed(2)}%</td>
                <td>{this.props.accuracy.toFixed(2)}%</td>
            </tr>
        </Table2>      
    }

    displayExtended(){

        let spawnKillSpreeString = "";

        if(this.props.spawnKillSpree !== 0){

            const killText = Functions.plural(this.props.spawnKillSpree,"Kill");

            spawnKillSpreeString = `${Functions.ignore0(this.props.spawnKillSpree)} ${killText}`;
        }

        return <Table2 width={1}>
            <tr>
                <th>Headshots</th>
                <th>Spawn Kills</th>
                <th>Best Spawn Kill Spree</th>
                <th>Close Range Kills</th>
                <th>Long Range Kills</th>
                <th>Uber Long Range kills</th>
            </tr>
            <tr>
                <td>{Functions.ignore0(this.props.headshots)}</td>
                <td>{Functions.ignore0(this.props.spawnKills)}</td>
                <td>{spawnKillSpreeString}</td>
                <td>{Functions.ignore0(this.props.close)}</td>
                <td>{Functions.ignore0(this.props.long)}</td>
                <td>{Functions.ignore0(this.props.uber)}</td>
            </tr>
        </Table2>
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