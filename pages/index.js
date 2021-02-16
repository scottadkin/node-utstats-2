import DefaultHead from '../components/defaulthead'
import Nav from '../components/Nav/'
import Footer from '../components/Footer/';
import Matches from '../api/matches';
import MatchesDefaultView from '../components/MatchesDefaultView/';
import Functions from '../api/functions';
import Maps from '../api/maps';
import Gametypes from '../api/gametypes';
import Servers from '../api/servers';



function Home({matchesData}) {

  //console.log(`servers`);
	const elems = [];
	const matchElems = [];


	return (
		<div>
		<DefaultHead />
		
		<main>
			<Nav />
			<div id="content">
				<div className="default">
					<div className="default-header">
						Welcome to Node UTStats 2
					</div>
				{elems}
				</div>
				<div className="default">
					<div className="default-header">Recent Matches</div>
					<MatchesDefaultView images={"[]"} data={matchesData}/>
				</div>
			</div>
			<Footer />
		</main>   
		</div>
	)
}


export async function getServerSideProps() {

	const matchManager = new Matches();
	const mapManager = new Maps();
	const gametypeManager = new Gametypes();
	const serverManager = new Servers();

	//get gametype mapNames
	//get server names
	let matchesData = await matchManager.getRecent(0,4);

	const mapIds = Functions.getUniqueValues(matchesData, 'map');
	const gametypeIds = Functions.getUniqueValues(matchesData, 'gametype');
	const serverIds = Functions.getUniqueValues(matchesData, 'server');

	const mapNames = await mapManager.getNames(mapIds);
	const gametypeNames = await gametypeManager.getNames(gametypeIds);
	const serverNames = await serverManager.getNames(serverIds);

	Functions.setIdNames(matchesData, mapNames, 'map', 'mapName');
	Functions.setIdNames(matchesData, gametypeNames, 'gametype', 'gametypeName');
	Functions.setIdNames(matchesData, serverNames, 'server', 'serverName');

	console.log(mapNames);
	console.log(matchesData[0]);

	return { props: { 
			"matchesData": JSON.stringify(matchesData)
	 	} 
	}
}

export default Home;

