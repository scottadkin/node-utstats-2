import React from 'react';
import styles from './MatchMonsterHuntMonsterKills.module.css';
import CountryFlag from '../CountryFlag';
import Link from 'next/link';
import Functions from '../../api/functions';
import Image from 'next/image';
import Loading from '../Loading';
import Notifcation from '../Notification';

class MatchMonsterHuntMonsterKills extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "bLoading": true, 
            "error": null, 
            "displayErrorUntil": 0,
            "monsterNames": {}, 
            "monsterTotals": [],
            "playerKills": []
        };


    }

    async loadData(){

        try{

            const req = await fetch("/api/monsterhunt", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "fullmatch", "matchId": this.props.matchId})
            });

            const res = await req.json();

            if(res.error === undefined){

                this.setState({
                    "bLoading": false,
                    "monsterNames": res.monsterNames,
                    "monstersTotals": res.monsterTotals,
                    "playerKills": res.playerKills
                });

            }else{

                this.setState({"error": res.error, "displayErrorUntil": Math.floor(Date.now() * 0.001) + 5});
            }

        }catch(err){
            console.trace(err);
        }

    }

    async componentDidMount(){


        await this.loadData();
        
    }

    render(){

        let elems = <Loading />;

        if(!this.state.bLoading) elems = [];

        let notification = (this.state.error !== null) ? 
        <Notifcation type="error" displayUntil={this.state.displayErrorUntil}>{this.state.error}</Notifcation> 
        : 
        null;




        return <>
            <div className="default-header">Monster Stats</div>
            {elems}
            {notification}
        </>
    }
}


export default MatchMonsterHuntMonsterKills;