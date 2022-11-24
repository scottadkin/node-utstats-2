import TipHeader from '../TipHeader';
import React from 'react';
import Functions from '../../api/functions';
import Table2 from '../Table2';
import Playtime from "../Playtime";


class PlayerCTFSummary extends React.Component{

    constructor(props){

        super(props);
        this.state = {"mode": 0};
        this.changeMode = this.changeMode.bind(this);
    }

    componentDidMount(){

        const settings = this.props.session;

        if(settings["playerPageCtfMode"] !== undefined){
            this.setState({"mode": parseInt(settings["playerPageCtfMode"])});
        }
    }

    changeMode(id){

        this.setState({"mode": id});
        Functions.setCookie("playerPageCtfMode", id);
    }

    displayGeneral(){

        if(this.state.mode !== 0) return null;

        const data = JSON.parse(this.props.data);

        return <Table2 width={1}>
            <tr>
                <TipHeader title="Flag Grab" content="Player grabbed the enemy flag from the enemy base."/>
                <TipHeader title="Flag Pickup" content="Player picked up the enemy flag that was dropped by a team mate."/>
                <TipHeader title="Flag Dropped" content="Player dropped the enemy flag."/>
                <TipHeader title="Flag Capture" content="Player captured the enemy flag and scored a point for their team."/>
                <TipHeader title="Flag Assist" content="Player had contact with a flag that was later captured without being returned."/>
                <TipHeader title="Flag Cover" content="Player killed an enemy that was close to their team mate that had the enemy flag."/>
                <TipHeader title="Flag Seal" content="Player sealed off the base while the flag was taken."/>
                <TipHeader title="Flag Kill" content="Player killed the enemy flag carrier."/>
                <TipHeader title="Flag Return" content="Player returned their flag that was dropped by an enemy."/>
                <TipHeader title="Flag Close Save" content="Player return their flag that was close to the enemy flag base."/>
            </tr>
            <tr>
                <td>{Functions.ignore0(data.flag_taken)}</td>
                <td>{Functions.ignore0(data.flag_pickup)}</td>
                <td>{Functions.ignore0(data.flag_dropped)}</td>
                <td>{Functions.ignore0(data.flag_capture)}</td>
                <td>{Functions.ignore0(data.flag_assist)}</td>
                <td>{Functions.ignore0(data.flag_cover)}</td>
                <td>{Functions.ignore0(data.flag_seal)}</td>
                <td>{Functions.ignore0(data.flag_kill)}</td>
                <td>{Functions.ignore0(data.flag_return)}</td>
                <td>{Functions.ignore0(data.flag_save)}</td>

        
            </tr>
        </Table2>
    }

    displayCovers(){

        if(this.state.mode !== 1) return null;

        let eff = 0;

        const data = JSON.parse(this.props.data);

        if(data.flag_cover > 0){

            if(data.flag_cover_pass > 0){

                if(data.flag_cover_fail > 0){
                    eff = (data.flag_cover_pass / data.flag_cover) * 100;
                }else{
                    eff = 100;
                }
            }
        }

        return <Table2 width={1}>
            <tr>
                <TipHeader title="Covers" content="Player killed enemy close to their teams flag carrier."/>
                <TipHeader title="Multi Covers" content="Player got 3 covers during the enemy flag was taken."/>
                <TipHeader title="Cover Sprees" content="Player got 4 or more covers during the enemy flag was taken."/>
                <TipHeader title="Most Covers" content="Most covers the player got during the enemy flag was taken."/>
                <TipHeader title="Successful Covers" content="Covers where the flag was captured."/>
                <TipHeader title="Failed Covers" content="Covers where the flag was returned."/>       
                <TipHeader title="Cover Efficiency" content="How successful the players covers are in regards of flags being capped."/>       
            </tr>
            <tr>
                <td>{data.flag_cover}</td>
                <td>{data.flag_multi_cover}</td>
                <td>{data.flag_spree_cover}</td>
                <td>{data.flag_cover_best}</td>
                <td>{data.flag_cover_pass}</td>
                <td>{data.flag_cover_fail}</td>
                <td>{eff.toFixed(2)}%</td>
            </tr>
        </Table2>
    }


    displayCarrying(){

        if(this.state.mode !== 2) return null;

        let eff = 0;

        const data = JSON.parse(this.props.data);

        if(data.flag_self_cover > 0){

            if(data.flag_self_cover_pass > 0){

                if(data.flag_self_cover_fail === 0){
                    eff = 100;
                }else{

                    eff = (data.flag_self_cover_pass / data.flag_self_cover) * 100;
                }
            }
        }

        return <Table2 width={1}>
            <tr>
                <TipHeader title="Flag Carry Time" content="Total time the player has spent with the flag."/>
                <TipHeader title="Kills With Flag" content="How many kills the player has gotten while carrying the flag."/>
                <TipHeader title="Most Kills With Flag" content="The most amount of kills the player has gotten while carrying the flag."/>
                <TipHeader title="Successful Kills With Flag" content="How many kills the player has gotten while carrying the flag, where the flag was capped."/>
                <TipHeader title="Failed Kills With Flag" content="How many kills the player has gotten while carrying the flag, where the flag was returned."/>
                <TipHeader title="Kills With Flag Efficiency" content="How successful the player's kills are in regard to capping the flag."/>
            </tr>
            <tr>
                <td className="playtime"><Playtime timestamp={data.flag_carry_time}/></td>
                <td>{data.flag_self_cover}</td>
                <td>{data.flag_self_cover_best}</td>
                <td>{data.flag_self_cover_pass}</td>
                <td>{data.flag_self_cover_fail}</td>
                <td>{eff.toFixed(2)}%</td>
            </tr>
        </Table2>
    }


    render(){

        return <div className="special-table">
            <div className="default-header">Capture The Flag Summary</div>
            <div className="tabs">
                <div className={`tab ${(this.state.mode === 0) ?  "tab-selected" :  "" }`} onClick={(() =>{
                    this.changeMode(0);
                })}>General</div>
                <div className={`tab ${(this.state.mode === 1) ?  "tab-selected" :  "" }`} onClick={(() =>{
                    this.changeMode(1);
                })}>Covers</div>
                <div className={`tab ${(this.state.mode === 2) ?  "tab-selected" :  "" }`} onClick={(() =>{
                    this.changeMode(2);
                })}>Carrying</div>
            </div>
            {this.displayGeneral()}
            {this.displayCovers()}
            {this.displayCarrying()}
        </div>
    }
}

export default PlayerCTFSummary;