import Link from 'next/link';
import Head from 'next/head'
import Nav from '../components/nav'
import Footer from '../components/footer'
import styles from '../styles/Home.module.css'
import PlayersList from '../components/playerslist'
import PlayerManager from '../api/players'

function Players(props){

    return (
        <div>
            <Head>
            <title>Node UTStats</title>
            <link rel="icon" href="/favicon.ico" />
            </Head>
            
            <main>
            <Nav />
            <div id={styles.content}>
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


export async function getStaticProps(){

    const manager = new PlayerManager();

    let players = await manager.debugGetAll();

    players = JSON.stringify(players);

    return {
        props: {
            players
        }
    }
}


export default Players;