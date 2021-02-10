import Link from 'next/link';
import DefaultHead from '../components/defaulthead'
import Nav from '../components/Nav/'
import Footer from '../components/Footer/'
import PlayersList from '../components/PlayerList/'
import PlayerManager from '../api/players';
import Faces from '../api/faces'
import Player from '../api/player';
import Pagination from '../components/Pagination/';

function Players({page, players, faces, records}){

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
                <Pagination url="/players?sort=name&page=" currentPage={page} pages="100" perPage="20" results="999999"/>
                <PlayersList players={players} faces={faces} records={records}/>
                </div>
            </div>
            <Footer />
            </main>   
        </div>
    );
}



export async function getServerSideProps({query}){

    const Manager = new PlayerManager();
    const FaceManager = new Faces();

    let page = 1;

    if(query.page !== undefined){
        page = parseInt(query.page);

        if(page !== page){
            page = 1;
        }
    }

    let players = await Manager.debugGetAll();

    const facesToGet = [];

    for(let i = 0; i < players.length; i++){

        if(facesToGet.indexOf(players[i].face) === -1){
            facesToGet.push(players[i].face);
        }
    }

    let faces = await FaceManager.getFacesWithFileStatuses(facesToGet);


    let records = await Manager.getMaxValues(['matches','efficiency','score','kills','deaths','winrate','accuracy']);

    players = JSON.stringify(players);
   // console.log(players);
    faces = JSON.stringify(faces);

    console.log(records);
    records = JSON.stringify(records);

    //console.log(faces);

    return {
        props: {
            page,
            players,
            faces,
            records
        }
    }
}


export default Players;