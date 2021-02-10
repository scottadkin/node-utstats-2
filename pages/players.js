import Link from 'next/link';
import DefaultHead from '../components/defaulthead'
import Nav from '../components/Nav/'
import Footer from '../components/Footer/'
import PlayersList from '../components/PlayerList/'
import PlayerManager from '../api/players';
import Faces from '../api/faces'
import Player from '../api/player';

function Players({players, faces, records}){

    return (
        <div>
            <DefaultHead />
            
            <main>
            <Nav />
            <div id="content">
                <div className="default">
                <div className="default-header">
                    Players
                </div>
                <PlayersList players={players} faces={faces} records={records}/>
                </div>
            </div>
            <Footer />
            </main>   
        </div>
    );
}



export async function getServerSideProps(){

    const Manager = new PlayerManager();
    const FaceManager = new Faces();

    let players = await Manager.debugGetAll();

    const facesToGet = [];

    for(let i = 0; i < players.length; i++){

        if(facesToGet.indexOf(players[i].face) === -1){
            facesToGet.push(players[i].face);
        }
    }

    let faces = await FaceManager.getFacesWithFileStatuses(facesToGet);


    let records = await Manager.getMaxValues(['matches','efficiency','score','kills','deaths']);

    players = JSON.stringify(players);
   // console.log(players);
    faces = JSON.stringify(faces);

    console.log(records);
    records = JSON.stringify(records);

    //console.log(faces);

    return {
        props: {
            players,
            faces,
            records
        }
    }
}


export default Players;