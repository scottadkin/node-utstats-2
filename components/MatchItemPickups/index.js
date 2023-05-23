import styles from './MatchItemPickups.module.css';
import Functions from '../../api/functions';
import React from 'react';
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';
import Table2 from '../Table2';

class MatchItemPickups extends React.Component{

    constructor(props){

        super(props);

        this.state = {"offset": 0, "maxDisplay": 7, "ignoredPlayers": []};


        this.changePage = this.changePage.bind(this);
    }

    componentDidMount(){

        for(let i = 0; i < this.props.players.length; i++){

            const p = this.props.players[i];

            this.bPlayerUseAnything(p.id);
        }
    }

    changePage(type){

        if(type === 0){

            if(this.state.offset > 0){
                this.setState({"offset": this.state.offset - 1});
            }
        }else{

            if(this.state.offset < Math.ceil(this.props.names.length / this.state.maxDisplay) - 1){
                this.setState({"offset": this.state.offset + 1});
            }
        }

    }

    getPlayerItemUses(player, item){

        let d = 0;

        for(let i = 0; i < this.props.data.length; i++){

            d = this.props.data[i];

            if(d.player_id === player && d.item === item){
                return Functions.ignore0(d.uses);
            }
        }

        return "";
    }

    bPlayerUseAnything(player){

        const ignoredPlayers = this.state.ignoredPlayers;


        if(ignoredPlayers.indexOf(player) !== -1) return false;

        for(let i = 0; i < this.props.data.length; i++){

            const d = this.props.data[i];

            if(d.player_id === player){
                return true;
            }

        }

        
        ignoredPlayers.push(player);

        this.setState({"ignoredPlayers": ignoredPlayers});

        return false;
    }

    createElems(){

        const elems = [];

        let n = 0;
        let subElems = [];

        let max = this.state.maxDisplay * (this.state.offset + 1);

        if(max > this.props.names.length){
            max = this.props.names.length;
        }

        let totalUses = 0;

        const offset = this.state.offset * this.state.maxDisplay;

        let currentTeam = 0;

        subElems.push(<th key={-1}>Player</th>);

        for(let i = offset; i < max; i++){

            subElems.push(<th key={i}>{this.props.names[i].name}</th>);
        }

        elems.push(<tr key={`top`}>{subElems}</tr>);

        let teamColor = "";
        let currentPlayerUses = 0;

        for(let i = 0; i < this.props.players.length; i++){

            const p = this.props.players[i];

            if(this.state.ignoredPlayers.indexOf(p.id) !== -1) continue;

            subElems = [];

            if(this.props.totalTeams > 0){
                teamColor = Functions.getTeamColor(p.team);
            }else{
                teamColor = "team-none";
            }

            subElems.push(<td key={`player-${i}`} className={teamColor}><Link href={`/pmatch/${this.props.matchId}?player=${p.id}`}>
                <CountryFlag host={this.props.host} country={p.country}/>{p.name}
                </Link></td>);

            
            for(let x = offset; x < max; x++){
                currentPlayerUses = this.getPlayerItemUses(p.id, this.props.names[x].id);
                totalUses += currentPlayerUses;

                subElems.push(<td key={x}>{currentPlayerUses}</td>);
            }
    
            

            elems.push(<tr key={i}>
                {subElems}
            </tr>);
        }


        if(elems.length > 0 && totalUses > 0){

            return <Table2 width={1} players={true}>
                {elems}
            </Table2>
        }

        return null;

    }

    render(){

        const tableElems = this.createElems();

        if(tableElems === null) return null;

        return <div className="m-bottom-10">
            <div className="default-header">Pickup Summary</div>
            <div className={`${styles.buttons} center`}>
                <div className={styles.previous} onClick={(() =>{
                    this.changePage(0);
                })}>
                    Previous
                </div>
                <div className={styles.info}>
                    Displaying {this.state.offset + 1} of {Math.ceil(this.props.names.length / this.state.maxDisplay)}
                </div>
                <div className={styles.next} onClick={(() =>{
                    this.changePage(1);
                })}>
                    Next
                </div>
            </div>
            {tableElems}
        </div>
    }
}

export default MatchItemPickups;