import React from 'react';
import DefaultHead from '../../components/defaulthead';
import Nav from '../../components/Nav/';
import Footer from '../../components/Footer/';
import RankingManager from '../../api/rankings';
import Gametypes from '../../api/gametypes';
import Functions from '../../api/functions';
import RankingTable from '../../components/RankingTable/';
import Players from '../../api/players';


class Rankings extends React.Component{

    constructor(props){

        super(props);

    }

    debugDisplaySettings(){

        const settings = JSON.parse(this.props.settings);

        let s = 0;

        const elems = [];

        for(let i = 0; i < settings.length; i++){

            s = settings[i];

            elems.push(<tr key={i}>
                <td>{s.name}</td>
                <td>{s.value}</td>
            </tr>);
        }


        return <table className="t-width-1">
            <tbody>
                <tr>
                    <th>Name</th>
                    <th>Value</th>
                </tr>
                {elems}
            </tbody>
        </table>
    }

    getGametypeName(names, id){


        for(const [key, value] of Object.entries(names)){

            if(parseInt(key) === id) return value;
        }

        return "Not Found";
    }

    createElems(){

        const data = JSON.parse(this.props.data);
        const gametypeNames = JSON.parse(this.props.gametypeNames);

        const elems = [];

        let d = 0;

        for(let i = 0; i < data.length; i++){

            d = data[i];

            elems.push(<RankingTable key={i} title={this.getGametypeName(gametypeNames, d.id)} data={d.data}/>);
        }

        return elems;
    }

    render(){

        return <div>
					<DefaultHead host={this.props.host} title={`Rankings`} 
						description={`View player rankings for their gametypes played.`} 
						keywords={`ranking,gametype`}
					/>
					<main>
						<Nav />
						<div id="content">
							<div className="default">
								<div className="default-header">
                                    Rankings
								</div>
                                {this.createElems()}
							</div>
						</div>
						<Footer />
					</main>   
				</div>;
    }
}




export async function getServerSideProps({req, query}){


    const rankingManager = new RankingManager();
    const gametypeManager = new Gametypes();
    const playerManager = new Players();

    const settings = await rankingManager.getRankingSettings(true);

    const gametypeNames = await gametypeManager.getAllNames();

    const gametypeIds = [];

    for(const [key, value] of Object.entries(gametypeNames)){

        gametypeIds.push(parseInt(key));
    }

    const data = await rankingManager.getMultipleGametypesData(gametypeIds, 10);


    const playerIds = [];

    let d = 0;

    for(let i = 0; i < data.length; i++){

        for(let x = 0; x < data[i].data.length; x++){

            d = data[i].data[x];

            if(playerIds.indexOf(d.player_id) === -1){
                playerIds.push(d.player_id);
            }
        }
    }
 

    const playerNames = await playerManager.getNamesByIds(playerIds);

    const playerNamesIdNamePairs = {};

    for(let i = 0; i < playerNames.length; i++){

        playerNamesIdNamePairs[playerNames[i].id] = playerNames[i].name;
    }

    for(let i = 0; i < data.length; i++){

        Functions.setIdNames(data[i].data, playerNamesIdNamePairs, 'player_id', 'name');
    }


    return {
        props:{
            "host": req.headers.host,
            "settings": JSON.stringify(settings),
            "data": JSON.stringify(data),
            "gametypeNames": JSON.stringify(gametypeNames)
        }
    }
}





export default Rankings;