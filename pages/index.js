import DefaultHead from '../components/defaulthead'
import Nav from '../components/Nav/'
import Footer from '../components/Footer/';
import Matches from '../api/matches';
import MatchesDefaultView from '../components/MatchesDefaultView/';
import Functions from '../api/functions';
import Maps from '../api/maps';



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
				<div className="default-header">Recent Matches</div>
				<MatchesDefaultView images={"[]"} data={matchesData}/>
			</div>
			<Footer />
		</main>   
		</div>
	)
}


export async function getServerSideProps() {

	const matchManager = new Matches();
	const mapManager = new Maps();

	let matchesData = await matchManager.getRecent(1,5);

	const mapIds = Functions.getUniqueValues(matchesData, 'map');

	const mapNames = await mapManager.getNames(mapIds);

	Functions.setIdNames(matchesData, mapNames, 'map', 'mapName');

	console.log(mapNames);
	console.log(matchesData[0]);

	return { props: { 
			"matchesData": JSON.stringify(matchesData)
	 	} 
	}
}

export default Home;

