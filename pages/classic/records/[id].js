import Head from '../../../components/classic/Head';
import Nav from '../../../components/classic/Nav';
import Footer from '../../../components/Footer';
import Session from '../../../api/session';
import Records from '../../../api/classic/records';
import Functions from '../../../api/functions';
import CountryFlag from '../../../components/CountryFlag';

const RecordMatch = ({host, session, data}) =>{

    data = JSON.parse(data);

    const tables = [];
    let rows = [];

    
    let d = 0;
    let currentType = "";

    for(let i = 0; i < data.length; i++){

        d = data[i];
        

        //console.log(value);
        rows = [];

        currentType = d.name;


        for(let x = 0; x < d.data.length; x++){

            rows.push(<tr key={x}>
                <td>{x + 1}{Functions.getOrdinal(x + 1)}</td>
                <td className="text-left"><CountryFlag country={d.data[x].country}/>{d.data[x].name}</td>
                <td>{Functions.MMSS(d.data[x].gametime)}</td>
                <td>{d.data[x].value}</td>
            </tr>);

        }

        tables.push(
            <div className="m-bottom-25">
                <div className="default-sub-header">{currentType} Records</div>
                <table key={i} className="t-width-2">
                    <tbody>
                        <tr>
                            <th>Place</th>
                            <th>Player</th>
                            <th>Playtime</th>         
                            <th>{currentType}</th>
                        </tr>
                        {rows}
                    </tbody>
                </table>
            </div>
        );
    }

    
    return <div>
        <Head host={host} title={`records`} 
        description={`records.`} 
        keywords={`record,classic,records`}/>
        <main>
            <Nav />
            <div id="content">

                <div className="default">
                    <div className="default-header">Records</div>
                    {tables}
                </div>
            </div>

            <Footer session={session}/>
        </main>
    </div>
}



export async function getServerSideProps({req, query}) {

    let id = (query.id !== undefined) ? query.id : 0;

    if(id !== id) id = 0;

    const session = new Session(req);
    await session.load();

    const recordsManager = new Records();

    const data = await recordsManager.getDefault();

    return {
        "props": {
            "host": req.headers.host,
            "session": JSON.stringify(session.settings),
            "data": JSON.stringify(data)
        }
    };
}


export default RecordMatch;