import Functions from '../../api/functions'
import React from 'react';
import MatchResultDisplay from '../MatchResultDisplay';
import MatchResult from '../MatchResult';

class MatchesDefaultView extends React.Component{

    constructor(props){

        super(props);

        if(this.props.image !== undefined){
            this.state = {"image": this.props.image, "images": null};
        }else{
            this.state = {"images": JSON.parse(this.props.images), "image": null};
        }

        
    }

    componentDidUpdate(prevProps){

        if(prevProps.images !== this.props.images){
            this.setState({"images": JSON.parse(this.props.images)});
        }

        if(prevProps.image !== this.props.image){
            this.setState({"image": this.props.image});
        }
    }


    getMapImage(name){

        name = Functions.cleanMapName(name).toLowerCase();

        const index = this.state.images.indexOf(name);
        
        if(index === -1) return "default";

        return this.state.images[index];
    }

    render(){

        const matches = JSON.parse(this.props.data);

        const elems = [];
        

        for(let i = 0; i < matches.length; i++){

            const m = matches[i];
            
            elems.push(<MatchResultDisplay 
                key={i}
                mode="recent"
                url={`/match/${m.id}`}
                mapImage={`${this.props.host}/images/maps/thumbs/${this.getMapImage(m.mapName)}.jpg`}
                mapName={m.mapName}
                serverName={m.serverName}
                date={Functions.convertTimestamp(m.date)}
                players={m.players}
                playtime={Functions.MMSS(m.playtime)}
                gametypeName={m.gametypeName}
            >
                <MatchResult 
                    dmWinner={m.dm_winner}
                    dmScore={m.dm_score}
                    totalTeams={m.total_teams}
                    redScore={m.team_score_0}
                    blueScore={m.team_score_1}
                    greenScore={m.team_score_2}
                    yellowScore={m.team_score_3}
                    endReason={m.end_type}
                    bMonsterHunt={m.mh}
                />
            </MatchResultDisplay>);

        
        }

        return <div>{elems}</div>
    }
}


export default MatchesDefaultView;