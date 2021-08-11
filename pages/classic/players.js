import Head from '../../components/classic/Head';
import Nav from '../../components/classic/Nav';
import Footer from '../../components/Footer';
import Session from '../../api/session';
import Players from '../../api/classic/players';
import CountryFlag from '../../components/CountryFlag';
import Link from 'next/link';

const PlayersPage = ({host, session, data}) =>{

    data = JSON.parse(data);

    const rows = [];

    let d = 0;

    for(let i = 0; i < data.length; i++){

        d = data[i];

        rows.push(<tr key={i} >
            <td><Link href={`/classic/player/${d.pid}`}><a><CountryFlag country={d.country}/>{d.name}</a></Link></td>
            <td>{d.total_matches}</td>
            <td>{d.gamescore}</td>
            <td>{d.frags}</td>
            <td>{d.kills}</td>
            <td>{d.deaths}</td>
            <td>{d.eff}%</td>
            <td>{(d.gametime / (60 * 60)).toFixed(2)}</td>
        </tr>);
    }
    
    return <div>
        <Head host={host} title={`players`} 
        description={`players`} 
        keywords={`players,classic,match`}/>
        <main>
            <Nav />
            <div id="content">

                <div className="default">
                    <div className="default-header">Players</div>
                    <table className="t-width-1 td-1-left tf-1-150">
                        <tbody>
                            <tr>
                                <th>Player</th>
                                <th>Matches</th>
                                <th>Score</th>
                                <th>Frags</th>
                                <th>Kills</th>
                                <th>Deaths</th>
                                <th>Efficiency</th>
                                <th>Hours</th>
                            </tr>
                            {rows}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <Footer session={session}/>
        </main>
    </div>
}



export async function getServerSideProps({req, query}) {

    const session = new Session(req);

    await session.load();

    const defaultPerPage = 25;


    const playerManager = new Players();

    const data = await playerManager.getDefaultPlayers(1,25);
    

    return {
        "props": {
            "host": req.headers.host,
            "session": JSON.stringify(session.settings),
            "data": JSON.stringify(data)
        }
    };
}


export default PlayersPage;