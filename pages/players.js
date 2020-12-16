import Link from 'next/link';
import DefaultHead from '../components/defaulthead'
import Nav from '../components/Nav/'
import Footer from '../components/Footer/'
import PlayersList from '../components/PlayerList/'
import PlayerManager from '../api/players'

function Players(props){

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
                <PlayersList players={props.players}/>
                </div>
            </div>
            <Footer />
            </main>   
        </div>
    );
}


export async function getServerSideProps(){

    const Manager = new PlayerManager();

    let players = await Manager.debugGetAll();

    players = JSON.stringify(players);

    return {
        props: {
            players
        }
    }
}


export default Players;