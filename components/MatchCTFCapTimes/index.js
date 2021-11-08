import React from 'react';
import Table2 from '../Table2';

class MatchCTFCapTimes extends React.Component{

    constructor(props){

        super(props);

        this.state = {"data": null}
    }

    async loadData(){

        try{

            const req = await fetch("/api/match", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "fastestcaps", "matchId": this.props.matchId, "mapId": this.props.mapId})

            });

            const res = await req.json();

            if(res.error === undefined){
                this.setState({"data": res.data});
            }

            console.log(res);

        }catch(err){
            console.trace(err);
        }
    }

    async componentDidMount(){

        await this.loadData();
    }


    renderRecordTimes(){

        if(this.state.data === null) return null;


        
        return <>
            <Table2 width={2}>
                <tr>
                    <th colSpan={3}>Fastest Solo Cap</th>
                </tr>
                <tr>
                    <td>Solo Cap</td>
                    <td>fas</td>
                    <td>fas</td>
                </tr>
                <tr>
                    <th colSpan={3}>Fastest Assisted Cap</th>
                </tr>
            </Table2>
        </>
    }

    render(){

        return <>
            <div className="default-header">Fastest Flag Captures</div>
            {this.renderRecordTimes()}
        </>
    }
}

export default MatchCTFCapTimes;