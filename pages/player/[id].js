import DefaultHead from '../../components/defaulthead'
import Nav from '../../components/Nav/'
import Footer from '../../components/Footer/';
import PlayerSummary from '../../components/PlayerSummary/'
import Player from '../../api/player'
import Link from 'next/link'
import Countires from '../../api/countries'



function Home({summary, gametypeStats}) {

  //console.log(`servers`);

    //console.log(summary);
    summary = JSON.parse(summary);

    const flag = summary.country;

    const name = summary.name;
    summary = JSON.stringify(summary);

    const country = Countires(flag);

    return (
        <div>
            <DefaultHead />
        
            <main>
                <Nav />
                <div id="content">
                <div className="default">
                    <div className="default-header">
                      <img className="title-flag" src={`../images/flags/${country.code.toLowerCase()}.svg`} alt="flag"/> {name} Career Profile
                    </div>

                    <PlayerSummary summary={summary} flag={country.code.toLowerCase()} country={country.country} gametypeStats={gametypeStats}/>

                </div>
                </div>
                <Footer />
            </main>   
        </div>
  )
}

// This gets called on every request
export async function getServerSideProps({query}) {
  // Fetch data from external API

    console.log(query);
   // const router = useRouter();
    
    const playerManager = new Player();
    
    let summary = await playerManager.getPlayerById(query.id);

    let gametypeStats = await playerManager.getPlayerGametypeWinStats(summary.name);

    summary = JSON.stringify(summary);
    gametypeStats = JSON.stringify(gametypeStats);

  // Pass data to the page via props
    return { props: {  
        summary,
        gametypeStats
    } }
}

export default Home;

