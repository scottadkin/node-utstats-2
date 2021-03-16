import TipHeader from '../TipHeader/';
import CountryFlag from '../CountryFlag/';
import styles from './MatchSpecialEvents.module.css';
import React from 'react';
import Functions from '../../api/functions';
import Link from 'next/link';


class MatchSpecialEvents extends React.Component{

    constructor(props){

        super(props);

        //this.players = JSON.parse(props.players);
        this.bTeamGame = props.bTeamGame;

        this.state = {"mode": 0};

        this.changeMode = this.changeMode.bind(this);

    }


    changeMode(value){

        this.setState({"mode": value});
    }

    bAnyData(player, type){


        for(let i = 1; i < 8; i++){

            if(type === 'multi'){

                if(player[`multi_${i}`] > 0){
                    return true;
                }

            }else if(type === 'spree'){

                if(player[`spree_${i}`] > 0){
                    return true;
                }
            }
        }

        return false;
    }


    displayValue(input){

        if(input > 0) return input;

        return '';
    }

    createMultiElems(){

        let elems = [];

        let bgColor = "team-none";

        let p = 0;

        let countryFlag = 0;
        let playerName = 0;

        for(let i = 0; i < this.props.players.length; i++){

            p = this.props.players[i];      

            if(this.bAnyData(p, 'multi')){

                countryFlag = <CountryFlag country={p.country}/>;
                playerName = <Link href={`/player/${p.player_id}`}><a>{p.name}</a></Link>

                if(this.bTeamGame){
                    bgColor = Functions.getTeamColor(p.team);
                }

                if(this.state.mode === 2){

                    elems.push(<tr key={`multi-2-${i}`} className={bgColor}>
                        <td>{countryFlag}{playerName}</td>
                        <td>{this.displayValue(p.multi_1)}</td>
                        <td>{this.displayValue(p.multi_2)}</td>
                        <td>{this.displayValue(p.multi_3)}</td>
                        <td>{this.displayValue(p.multi_4)}</td>
                        <td>{this.displayValue(p.multi_5)}</td>
                        <td>{this.displayValue(p.multi_6)}</td>
                        <td>{this.displayValue(p.multi_7)}</td>
                        <td>{p.multi_best}</td>
                    </tr>);

                }else if(this.state.mode === 0){

                    elems.push(<tr key={`multi-0-${i}`} className={bgColor}>
                        <td>{countryFlag}{playerName}</td>
                        <td>{this.displayValue(p.multi_1)}</td>
                        <td>{this.displayValue(p.multi_2)}</td>
                        <td>{this.displayValue(p.multi_3)}</td>
                        <td>{this.displayValue(p.multi_4 + p.multi_5 + p.multi_6 + p.multi_7)}</td>
                        <td>{p.multi_best}</td>
                    </tr>);

                }else if(this.state.mode === 3){

                    elems.push(<tr key={`multi-3-${i}`} className={bgColor}>
                        <td>{countryFlag}{playerName}</td>
                        <td>{this.displayValue(p.multi_1)}</td>
                        <td>{this.displayValue(p.multi_2)}</td>
                        <td>{this.displayValue(p.multi_3)}</td>
                        <td>{this.displayValue(p.multi_4) }</td>
                        <td>{this.displayValue(p.multi_5 + p.multi_6 + p.multi_7)}</td>
                        <td>{p.multi_best}</td>
                    </tr>);

                }else if(this.state.mode === 1){

                    elems.push(<tr key={`multi-1-${i}`} className={bgColor}>
                        <td>{countryFlag}{playerName}</td>
                        <td>{this.displayValue(p.multi_1)}</td>
                        <td>{this.displayValue(p.multi_2)}</td>
                        <td>{this.displayValue(p.multi_3)}</td>
                        <td>{this.displayValue(p.multi_4) }</td>
                        <td>{this.displayValue(p.multi_5)}</td>
                        <td>{this.displayValue(p.multi_6 + p.multi_7)}</td>
                        <td>{p.multi_best}</td>
                    </tr>);
                }
            }
        
        }

        if(elems.length > 0){

            if(this.state.mode === 2){

                elems.unshift(<tr key={`multi-2-h`}>
                    <th>Player</th>
                    <TipHeader title={"Double Kill"} content="Player Killed 2 Players in a short amount of time without dying."/>
                    <TipHeader title={"Multi Kill"} content="Player Killed 3 Players in a short amount of time without dying."/>
                    <TipHeader title={"Mega Kill"} content="Player Killed 4 Players in a short amount of time without dying."/>
                    <TipHeader title={"Ultra Kill"} content="Player Killed 5 Players in a short amount of time without dying."/>
                    <TipHeader title={"Monster Kill"} content="Player Killed 6 Players in a short amount of time without dying."/>
                    <TipHeader title={"Ludicrous Kill"} content="Player Killed 7 Players in a short amount of time without dying."/>
                    <TipHeader title={"Holy Shit"} content="Player Killed 8 or more Players in a short amount of time without dying."/>
                    <TipHeader title={"Best"} content="Most players killed in a short amount of time without dying."/>
                </tr>);

            }else if(this.state.mode === 0){

                elems.unshift(<tr key={`multi-0-h`}>
                    <th>Player</th>
                    <TipHeader title={"Double Kill"} content="Player Killed 2 Players in a short amount of time without dying."/>
                    <TipHeader title={"Multi Kill"} content="Player Killed 3 Players in a short amount of time without dying."/>
                    <TipHeader title={"Ultra Kill"} content="Player Killed 4 Players in a short amount of time without dying."/>
                    <TipHeader title={"Monster Kill"} content="Player Killed 5 or more Players in a short amount of time without dying."/>
                    <TipHeader title={"Best"} content="Most players killed in a short amount of time without dying."/>
                </tr>);

            }else if(this.state.mode === 3){

                elems.unshift(<tr key={`multi-3-h`}>
                    <th>Player</th>
                    <TipHeader title={"Double Kill"} content="Player Killed 2 Players in a short amount of time without dying."/>
                    <TipHeader title={"Multi Kill"} content="Player Killed 3 Players in a short amount of time without dying."/>
                    <TipHeader title={"Mega Kill"} content="Player Killed 4 Players in a short amount of time without dying."/>
                    <TipHeader title={"Ultra Kill"} content="Player Killed 5 Players in a short amount of time without dying."/>
                    <TipHeader title={"Monster Kill"} content="Player Killed 6 or more Players in a short amount of time without dying."/>
                    <TipHeader title={"Best"} content="Most players killed in a short amount of time without dying."/>
                </tr>);

            }else if(this.state.mode === 1){

                elems.unshift(<tr key={`multi-1-h`}>
                    <th>Player</th>
                    <TipHeader title={"Double Kill"} content="Player Killed 2 Players in a short amount of time without dying."/>
                    <TipHeader title={"Triple Kill"} content="Player Killed 3 Players in a short amount of time without dying."/>
                    <TipHeader title={"Multi Kill"} content="Player Killed 4 Players in a short amount of time without dying."/>
                    <TipHeader title={"Mega Kill"} content="Player Killed 5 Players in a short amount of time without dying."/>
                    <TipHeader title={"Ultra Kill"} content="Player Killed 6 or more Players in a short amount of time without dying."/>
                    <TipHeader title={"Monster Kill"} content="Player Killed 7 or more Players in a short amount of time without dying."/>
                    <TipHeader title={"Best"} content="Most players killed in a short amount of time without dying."/>
                </tr>);
            }
        }

        if(elems.length > 0){
            return <div>
                
                <table>
                    <tbody>
                        {elems}
                    </tbody>
                </table>
            </div>

        }else{
            return [];
        }
    }


    bAnyTypeData(type){


        let p = 0;

        for(let i = 0; i < this.props.players.length; i++){

            p = this.props.players[i];

            for(let x = 1; x <= 7; x++){

                if(p[`${type}_${x}`] !== 0){
                    return true;
                }
            }

        }

        return false;
    }

    createSpreeElems(){

        const elems = [];

        let p = 0;
        let playerName = 0;
        let flag = 0;
        let color = "team-none";

        for(let i = 0; i < this.props.players.length; i++){

            p = this.props.players[i];

            
            if(this.bAnyData(p, 'spree')){

                playerName = <Link href={`/player/${p.player_id}`}><a>{p.name}</a></Link>
                flag = <CountryFlag country={p.country}/>

                if(this.bTeamGame){
                    color = Functions.getTeamColor(p.team);
                }

                if(this.state.mode === 0){

                    elems.push(<tr key={`spree-0-${i}`} className={color}>
                        <td>{flag}{playerName}</td>
                        <td>{this.displayValue(p.spree_1)}</td>
                        <td>{this.displayValue(p.spree_2)}</td>
                        <td>{this.displayValue(p.spree_3)}</td>
                        <td>{this.displayValue(p.spree_4)}</td>
                        <td>{this.displayValue(p.spree_5 + p.spree_6 + p.spree_7)}</td>
                        <td>{p.spree_best}</td>
                    </tr>);    

                }else if(this.state.mode === 1){

                    elems.push(<tr  key={`spree-1-${i}`} className={color}>
                        <td>{flag}{playerName}</td>
                        <td>{this.displayValue(p.spree_1)}</td>
                        <td>{this.displayValue(p.spree_2)}</td>
                        <td>{this.displayValue(p.spree_3)}</td>
                        <td>{this.displayValue(p.spree_4)}</td>
                        <td>{this.displayValue(p.spree_5)}</td>
                        <td>{this.displayValue(p.spree_6)}</td>
                        <td>{this.displayValue(p.spree_7)}</td>
                        <td>{p.spree_best}</td>
                    </tr>);

                }else if(this.state.mode === 2){

                    elems.push(<tr  key={`spree-2-${i}`} className={color}>
                        <td>{flag}{playerName}</td>
                        <td>{this.displayValue(p.spree_1)}</td>
                        <td>{this.displayValue(p.spree_2)}</td>
                        <td>{this.displayValue(p.spree_3)}</td>
                        <td>{this.displayValue(p.spree_4)}</td>
                        <td>{this.displayValue(p.spree_5)}</td>
                        <td>{this.displayValue(p.spree_6 + p.spree_7)}</td>
                        <td>{p.spree_best}</td>
                    </tr>);

                }else if(this.state.mode === 3){

                    elems.push(<tr  key={`spree-3-${i}`} className={color}>
                        <td>{flag}{playerName}</td>
                        <td>{this.displayValue(p.spree_1)}</td>
                        <td>{this.displayValue(p.spree_2)}</td>
                        <td>{this.displayValue(p.spree_3)}</td>
                        <td>{this.displayValue(p.spree_4)}</td>
                        <td>{this.displayValue(p.spree_5)}</td>
                        <td>{this.displayValue(p.spree_6 + p.spree_7)}</td>
                        <td>{p.spree_best}</td>
                    </tr>);
                }
            }

        }


        if(elems.length > 0){

            if(this.state.mode === 0){

                elems.unshift(
                    <tr key={`spree-0-h`}>
                        <th>Player</th>
                        <TipHeader title="Killing Spree" content="Player killed 5 to 9 players in a life."/>
                        <TipHeader title="Rampage" content="Player killed 10 to 14 players in a life."/>
                        <TipHeader title="Dominating" content="Player killed 15 to 19 players in a life."/>
                        <TipHeader title="Unstoppable" content="Player killed 20 to 24 players in a life."/>
                        <TipHeader title="Godlike" content="Player killed 25 or more players in a life."/>
                        <TipHeader title="Best" content="Most kills player had in a life."/>
                    </tr>
                );

            }else if(this.state.mode === 1){

                elems.unshift(
                    <tr key={`spree-1-h`}>
                        <th>Player</th>
                        <TipHeader title="Killing Spree" content="Player killed 5 to 9 players in a life."/>
                        <TipHeader title="Rampage" content="Player killed 10 to 14 players in a life."/>
                        <TipHeader title="Dominating" content="Player killed 15 to 19 players in a life."/>
                        <TipHeader title="Unstoppable" content="Player killed 20 to 24 players in a life."/>
                        <TipHeader title="Godlike" content="Player killed 25 to 29 players in a life."/>
                        <TipHeader title="Too Easy" content="Player killed 30 to 34 players in a life."/>
                        <TipHeader title="Brutalizing" content="Player killed 35 or more players in a life."/>
                        <TipHeader title="Best" content="Most kills player had in a life."/>
                    </tr>
                );

            }else if(this.state.mode === 2){

                elems.unshift(
                    <tr key={`spree-2-h`}>
                        <th>Player</th>
                        <TipHeader title="Killing Spree" content="Player killed 5 to 9 players in a life."/>
                        <TipHeader title="Rampage" content="Player killed 10 to 14 players in a life."/>
                        <TipHeader title="Dominating" content="Player killed 15 to 19 players in a life."/>
                        <TipHeader title="Unstoppable" content="Player killed 20 to 24 players in a life."/>
                        <TipHeader title="Godlike" content="Player killed 25 to 29 players in a life."/>
                        <TipHeader title="Whicked Sick" content="Player killed 30 or more players in a life."/>
                        <TipHeader title="Best" content="Most kills player had in a life."/>
                    </tr>
                );

            }else if(this.state.mode === 3){

                elems.unshift(
                    <tr key={`spree-3-h`}>
                        <th>Player</th>
                        <TipHeader title="Killing Spree" content="Player killed 5 to 9 players in a life."/>
                        <TipHeader title="Rampage" content="Player killed 10 to 14 players in a life."/>
                        <TipHeader title="Dominating" content="Player killed 15 to 19 players in a life."/>
                        <TipHeader title="Unstoppable" content="Player killed 20 to 24 players in a life."/>
                        <TipHeader title="Godlike" content="Player killed 25 to 29 players in a life."/>
                        <TipHeader title="Massacre" content="Player killed 30 or more players in a life."/>
                        <TipHeader title="Best" content="Most kills player had in a life."/>
                    </tr>
                );
            }

            return <div>
            <table>
                <tbody>
                    {elems}
                </tbody>
            </table>
            </div>
        }

        return elems;
    }


    firetBloodElem(){

        let p = 0;

        let bgColor = "team-none";

        for(let i = 0; i < this.props.players.length; i++){

            p = this.props.players[i];

            if(this.props.bTeamGame){
                bgColor = Functions.getTeamColor(p.team);
            }

            if(p.first_blood){
                return <div className={styles.first}>
                    <div>First Blood</div>
                    <div className={bgColor}><CountryFlag country={p.country}/><Link href={`/player/${p.player_id}`}><a>{p.name}</a></Link></div>
                </div>
            }
        }

        return [];
    }

    render(){


        const multiElems = this.createMultiElems();
        const spreeElems = this.createSpreeElems();

        return (<div><div className={styles.special}>

            <div className="default-header">Special Events</div>

            {
                (this.bAnyTypeData('spree') || this.bAnyTypeData('multi')) ?
                <div className={styles.bwrapper}>
                    <div className={`${styles.button} ${(this.state.mode === 0) ? styles.active : '' }`} onClick={(() =>{
                        this.changeMode(0)
                    })}>Classic</div>
                    <div className={`${styles.button} ${(this.state.mode === 1) ? styles.active : '' }`} onClick={(() =>{
                        this.changeMode(1)
                    })}>SmartCTF/DM</div>
                    <div className={`${styles.button} ${(this.state.mode === 2) ? styles.active : '' }`} onClick={(() =>{
                        this.changeMode(2)
                    })}>UT2K4</div>
                    <div className={`${styles.button} ${(this.state.mode === 3) ? styles.active : '' }`} onClick={(() =>{
                        this.changeMode(3)
                    })}>UT3</div>
                </div>
                :
                null
            }

            {multiElems}

            {spreeElems}

            {this.firetBloodElem()}

        </div></div>);
    }
}

export default MatchSpecialEvents;