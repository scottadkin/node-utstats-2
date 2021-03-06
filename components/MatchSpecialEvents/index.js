import TipHeader from '../TipHeader/';
import CountryFlag from '../CountryFlag/';
import styles from './MatchSpecialEvents.module.css';
import React from 'react';
import Functions from '../../api/functions';
import Link from 'next/link';


class MatchSpecialEvents extends React.Component{

    constructor(props){

        super(props);

        this.players = JSON.parse(props.players);
        this.bTeamGame = props.bTeamGame;

        this.state = {"mode": 2};

        console.log(this.players);

        this.changeMode = this.changeMode.bind(this);

    }


    changeMode(value){

        this.setState({"mode": value});
    }

    bAnyMultis(player){


        for(let i = 1; i < 8; i++){

            if(player[`multi_${i}`] > 0){
                return true;
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

        for(let i = 0; i < this.players.length; i++){

            p = this.players[i];      

            if(this.bAnyMultis(p)){

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
                <div className="default-header">Multi Kills</div>
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

    render(){


        const multiElems = this.createMultiElems();
        const spreeElems = [];

        return (<div className={styles.special}>

            <div className="default-header">Special Events</div>

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

            {multiElems}


            {spreeElems}

        </div>);
    }
}

export default MatchSpecialEvents;