import DefaultHead from '../components/defaulthead';
import Nav from '../components/Nav/';
import Footer from '../components/Footer/';
import Players from '../api/players';
import CountryFlag from '../components/CountryFlag/';
import PlayerRecordBox from '../components/PlayerRecordBox/';

const validTypes = [
    "matches",
    "wins",
    "losses",
    "draws",
    "winrate",
    "playtime",
    "first_bloods",
    "frags",
    "score",
    "kills",
    "deaths",
    "suicides",
    "team_kills",
    "spawn_kills",
    "efficiency",
    "multi_best",
    "spree_best",
    "best_spawn_kill_spree"
];

const Records = ({perPage, page, currentRecords}) =>{

    currentRecords = JSON.parse(currentRecords);

    const elems = [];

    let c = 0;

    for(let i = 0; i < currentRecords.length; i++){

        c = currentRecords[i];

        elems.push(<tr key={i}>
            <td>{(perPage * (page - 1)) + i + 1}</td>
            <td><CountryFlag country={c.country}/>{c.name}</td>
            <td>{c.playtime}</td>
            <td>{c.matches}</td>
            <td>{c.value}</td>
        </tr>);
    }

    const table = <table>
        <tbody>
            <tr>
                <th>#</th>
                <th>Name</th>
                <th>Playtime</th>
                <th>Matches</th>
                <th>Value</th>
            </tr>
            {elems}
        </tbody>
    </table>

    return <div>
        <DefaultHead />
        <main>
            <Nav />
            <div id="content">
                <div className="default">
                    <div className="default-header">Records</div>
                </div>
                <div className="special-table">
                    {table}
                </div>

            </div>
            <Footer />
        </main>
    </div>
}

export async function getServerSideProps({query}){

    console.log(query);

    const playerManager = new Players();

    let page = 1;
    let perPage = 50;


    const currentRecords = await playerManager.getBestOfTypeTotal(validTypes, "kills",0, perPage, page);

    return {
        "props": {
            "page": page,
            "perPage": perPage,
            "currentRecords": JSON.stringify(currentRecords)
        }
    }
}

export default Records;