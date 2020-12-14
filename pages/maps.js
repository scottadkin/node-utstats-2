import Link from 'next/link';
import Head from 'next/head'
import Nav from '../components/nav'
import Footer from '../components/footer'
import styles from '../styles/Home.module.css'
import MapManager from '../api/maps'
import MapList from '../components/maplist'

function Maps(props){

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
                    Maps
                </div>
                <MapList data={props.maps}/>
                </div>
            </div>
            <Footer />
            </main>   
        </div>
    );
}


export async function getStaticProps(){

    const Manager = new MapManager();

    const maps = JSON.stringify(await Manager.getAll());

    //console.log(await Manager.getAll());

    return {
        props: {
            maps
        }
    };
}


export default Maps;