import styles from '../../styles/Map.module.css';
import DefaultHead from '../../components/defaulthead';
import Nav from '../../components/Nav/';
import Footer from '../../components/Footer/';
import Maps from '../../api/maps';
import Functions from '../../api/functions';

const Map = ({basic, image}) =>{

    basic = JSON.parse(basic);

    return <div>
        <DefaultHead />
        <main>
            <Nav />
            <div id="content">

                <div className="default">
                    <div className="default-header">
                        {Functions.removeUnr(basic.name)}
                    </div>
    
                    
                    <div className={styles.top}>
                        <img className={styles.mimage} src={image} alt="image" />
                        <table className={styles.ttop}>
                            <tbody>
                                <tr>
                                    <td>File</td>
                                    <td>{basic.name}</td>
                                </tr>
                                <tr>
                                    <td>Title</td>
                                    <td>{basic.title}</td>
                                </tr>
                                <tr>
                                    <td>Author</td>
                                    <td>{basic.author}</td>
                                </tr>
                                <tr>
                                    <td>Ideal Player Count</td>
                                    <td>{basic.ideal_player_count}</td>
                                </tr>
                                <tr>
                                    <td>Level Enter Text</td>
                                    <td>{basic.level_enter_text}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                </div>
            </div>
            <Footer />
        </main>
    </div>
}



export async function getServerSideProps({query}){


    let mapId = 0;

    if(query.id !== undefined){

        mapId = parseInt(query.id);

        if(mapId !== mapId){
            mapid = 0;
        }
    }

    const mapManager = new Maps();

    let basicData = await mapManager.getSingle(mapId);

    let image = null;

    if(basicData[0] !== undefined){
        console.log(basicData);
        image = await mapManager.getImage(mapManager.removeUnr(mapManager.removePrefix(basicData[0].name)));
    }else{
        basicData = [{"name": "Not Found"}];
        image = "/images/temp.jpg";
    }



    return {
        props: {
            "basic": JSON.stringify(basicData[0]),
            "image": image
        }
    };
}

export default Map;