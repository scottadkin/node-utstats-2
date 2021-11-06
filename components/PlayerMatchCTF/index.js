import React from 'react';
import Functions from '../../api/functions';
import TipHeader from '../TipHeader';
import Table2 from '../Table2';


class PlayerMatchCTF extends React.Component{

    constructor(props){

        super(props);

    }


    renderGeneral(){

        const p = this.props.player;

        const cols = [];

        const types = [
            "taken",
            "pickup",
            "dropped",
            "assist",
            "cover",
            "seal",
            "capture",
            "kill",
            "return",
            "save"
        ];

        for(let i = 0; i < types.length; i++){

            cols.push(<td key={i}>{Functions.ignore0(p[`flag_${types[i]}`])}</td>);
        }

        return <div className="m-bottom-25">
            <Table2 width={1}>
                <tr>
                    <th>Taken</th>
                    <th>Pickup</th>
                    <th>Dropped</th>
                    <th>Assist</th>
                    <th>Cover</th>
                    <th>Seal</th>
                    <th>Capture</th>
                    <th>Kill</th>
                    <th>Return</th>
                    <th>Close Return</th>
                </tr>
                <tr>
                    {cols}
                </tr>
            </Table2>
        </div>
    }

    renderCovers(){

        const p = this.props.player;

        let efficiency = 0;

        if(p.flag_cover > 0){

            if(p.flag_cover_pass > 0){
                efficiency = (p.flag_cover_pass / p.flag_cover) * 100;
            }
        }

        const types = [
            "cover",
            "cover_pass",
            "cover_fail",
            "multi_cover",
            "spree_cover",
            "cover_best",
            "self_cover",
            "self_cover_pass",
            "self_cover_fail"
        ];

        const cols = [];

        for(let i = 0; i < types.length; i++){

            if(i === 3){
                cols.push(<td key={"i"}>{efficiency.toFixed(2)}%</td>);
            }

            cols.push(<td key={i}>{Functions.ignore0(p[`flag_${types[i]}`])}</td>);
        }

        return <div className="m-bottom-25">
            <Table2 width={1} players={1}>
                    <tr>
                        <TipHeader title="Cover" content="Covered the Flag Carrier"/>
                        <TipHeader title="Cover Pass" content="Covered the flag carrier with the flag later being capped."/>
                        <TipHeader title="Cover Fail" content="Covered the flag carrier, but the flag was returned."/>
                        <TipHeader title="Cover Efficiency" content="Percentage of covers where the flag was capped."/>
                        <TipHeader title="Multi Cover" content="Player got 3 covers while the flag was taken one time."/>
                        <TipHeader title="Cover Spree" content="Player got 4 or more covers while the flag was taken one time."/>
                        <TipHeader title="Best Covers" content="The most covers the player got while the flag was taken one time."/>
                        <TipHeader title="Self Covers" content="Kills the player got while carrying the enemy flag."/>
                        <TipHeader title="Self Covers Pass" content="Kills the player got while carrying the enemy flag, which was later was capped."/>
                        <TipHeader title="Self Covers Fail" content="Kills the player got while carrying the enemy flag, which was returned by the enemy team."/>
                    </tr>
                    <tr>
                        {cols}
                    </tr>
            </Table2>
        </div>
    }

    renderCaps(){
        return <div>
            fart
        </div>
    }

    render(){
        //players={playerData} caps={ctfCaps} matchStart={parsedInfo.start} matchId={parsedInfo.id}
        return <div>
            <div className="default-header">Capture The Flag Summary</div>
            {this.renderGeneral()}
            {this.renderCovers()}
        </div>
    }
}

export default PlayerMatchCTF;