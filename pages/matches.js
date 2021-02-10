
import DefaultHead from '../components/defaulthead';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import Match from '../api/match';
import Link from 'next/link';

const Matches = ({matches}) =>{


    matches = JSON.parse(matches);

    const elems = [];

    elems.push(<tr>
        <th>id</th>
        <th>date</th>
        <th>playtime</th>
        <th>dm</th>
        <th>1</th>
        <th>2</th>
        <th>3</th>
        <th>4</th>
    </tr>);

    let m = 0;

    for(let i = 0; i < matches.length; i++){

        m = matches[i];

        elems.push(<tr>
            <td><Link href={`/match/${m.id}`}><a>Go To Match {m.id}</a></Link></td>
            <td>{new Date(m.date * 1000).toString()}</td>
            <td>{m.playtime}</td>
            <td>{m.dm_winner} ({m.dm_score})</td>
            <td>{m.team_score_0}</td>
            <td>{m.team_score_1}</td>
            <td>{m.team_score_2}</td>
            <td>{m.team_score_3}</td>
     
        </tr>);
    }

    return (<div>
        <DefaultHead />
        <main>
            <Nav />
            <div id="content">

                <div className="default">
                    <div className="default-header">
                        Recent Matches
                    </div>
                    <div className="special-table">
                        <table>
                            <tbody>
                            {elems}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    </div>);
}


export async function getServerSideProps({query}){

    const matchManager = new Match();

    let matches = await matchManager.debugGetAll();

    console.log(matches[0]);

    return {
        "props": {
            "matches": JSON.stringify(matches)
        }
    };
}


export default Matches;