import React from 'react';
import DefaultHead from '../../components/defaulthead';
import Nav from '../../components/Nav/';
import Footer from '../../components/Footer/';
import RankingManager from '../../api/rankings';


class Rankings extends React.Component{

    constructor(props){

        super(props);

    }

    debugDisplaySettings(){

        const settings = JSON.parse(this.props.settings);

        let s = 0;

        console.log(settings);

        const elems = [];

        for(let i = 0; i < settings.length; i++){

            s = settings[i];

            elems.push(<tr key={i}>
                <td>{s.name}</td>
                <td>{s.value}</td>
            </tr>);
        }


        return <table className="t-width-1">
            <tbody>
                <tr>
                    <th>Name</th>
                    <th>Value</th>
                </tr>
                {elems}
            </tbody>
        </table>

    }

    render(){

        return <div>
					<DefaultHead host={this.props.host} title={`Rankings`} 
						description={`View player rankings for their gametypes played.`} 
						keywords={`ranking,gametype`}
					/>
					<main>
						<Nav />
						<div id="content">
							<div className="default">
								<div className="default-header">
                                    Rankings
								</div>


                                {this.debugDisplaySettings()}
							</div>
						</div>
						<Footer />
					</main>   
				</div>;
    }
}




export async function getServerSideProps({req, query}){


    const rankingManager = new RankingManager();

    const settings = await rankingManager.getRankingSettings(true);
      

    return {
        props:{
            "host": req.headers.host,
            "settings": JSON.stringify(settings),
        }
    }
}





export default Rankings;