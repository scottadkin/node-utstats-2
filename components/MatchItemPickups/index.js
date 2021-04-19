import styles from './MatchItemPickups.module.css';
import Functions from '../../api/functions';
import React from 'react';
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';

class MatchItemPickups extends React.Component{

    constructor(props){

        super(props);

        this.state = {"offset": 0, "maxDisplay": 6};

        this.changePage = this.changePage.bind(this);
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
                return d.uses;
            }
        }

        return Functions.ignore0(0);
    }

    createElems(){

        const elems = [];

        let n = 0;
        let p = 0;

        let subElems = [];

        let max = this.state.maxDisplay * (this.state.offset + 1);

        if(max > this.props.names.length){
            max = this.props.names.length;
        }

        const offset = this.state.offset * this.state.maxDisplay;

        let currentTeam = 0;

        subElems.push(<th key={-1}>Player</th>);

        for(let i = offset; i < max; i++){

            subElems.push(<th key={i}>{this.props.names[i].name}</th>);
        }

        elems.push(<tr key={`top`}>{subElems}</tr>);

        for(let i = 0; i < this.props.players.length; i++){

            p = this.props.players[i];

            subElems = [];

            subElems.push(<td key={`player-${i}`} className={Functions.getTeamColor(p.team)}><Link href={`/player/${p.id}`}><a><CountryFlag country={p.country}/>{p.name}</a></Link></td>);

            for(let x = offset; x < max; x++){

                subElems.push(<td key={x}>{this.getPlayerItemUses(p.id, this.props.names[x].id)}</td>);
            }
    
            

            elems.push(<tr key={i}>
                {subElems}
            </tr>);
        }


        if(elems.length > 0){

            return <table className={`t-width-1 ${styles.table}`}>
                <tbody>
     
                    {elems}
                </tbody>
            </table>
        }

        return null;

    }

    render(){

        return <div className="special-table m-bottom-10">
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
            {this.createElems()}
        </div>
    }
}

export default MatchItemPickups;