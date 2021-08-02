import styles from './MatchesDefaultView.module.css';
import MMSS from '../MMSS/';
import TimeStamp from '../TimeStamp/';
import MatchResult from '../MatchResult/';
import Link from 'next/link';
import Image from 'next/image';
import Functions from '../../api/functions'
import React from 'react';

import MatchResultBox from '../MatchResultBox';

class MatchesDefaultView extends React.Component{

    constructor(props){

        super(props);

        if(this.props.image !== undefined){
            this.state = {"image": this.props.image};
        }else{
            this.state = {"images": JSON.parse(this.props.images)};
        }

        
    }


    render(){

        const matches = JSON.parse(this.props.data);

        const elems = [];

        let m = 0;
        let image = "";
        let imageIndex = 0;
        let result = 0;
        let dmScore = 0;

        for(let i = 0; i < matches.length; i++){

            m = matches[i];

            if(i < 5){
                console.log(m);
            }

            if(m.total_teams < 2){

                result = m.dm_winner;
                dmScore = m.dm_score;
            }else{

                result = [];
                dmScore = null;

                for(let x = 0; x < m.total_teams; x++){
                    result.push(m[`team_score_${x}`]);
                }
            }

            imageIndex = this.state.images.indexOf(Functions.cleanMapName(m.mapName).toLowerCase());

            if(imageIndex === -1){
                image = "default";
            }else{
                image = this.state.images[imageIndex];
            }

            elems.push(
                <Link key={i} href={`/match/${m.id}`}>
                    <a>
                        <MatchResultBox serverName={m.serverName} gametypeName={m.gametypeName} mapName={m.mapName}
                        mapImage={image} date={Functions.convertTimestamp(m.date)} players={m.players} playtime={Functions.MMSS(m.playtime)}
                        result={result} dmScore={dmScore} totalTeams={m.total_teams} monsterHunt={m.mh} endReason={m.end_type}
                        />
                    </a>
                </Link>
            );
        }

        return <div>{elems}</div>
    }
}


export default MatchesDefaultView;