import styles from './MapsDefaultView.module.css';
import Functions from '../../../api/functions';
import Link from 'next/link';
import Image from 'next/image';

function createLink(display, mode, name, displayType, currentMode, order){

    let selectedClassName = null;

    if(currentMode === mode){
        order = (order === "a") ? "d" : "a";
        selectedClassName = "tab-selected";
    }

    return <Link href={`/classic/maps/${mode}?name=${name}&display=${displayType}&order=${order}`}>
        <a>
            <div className={`tab ${selectedClassName}`}>
                {display}
            </div>
            </a>
    </Link>
}


const MapsDefaultView = ({data, mode, order, display, images, name}) =>{


    const getImage = (name) =>{

        name = Functions.cleanMapName(name).toLowerCase();

        if(images.indexOf(name) !== -1){
            return name;
        }else{
            return "default";
        }
    }

    const elems = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        elems.push(<Link key={i} href={`/classic/map/${encodeURIComponent(Functions.removeUnr(d.mapfile))}`}>
                <a>
                    <div key={i} className={styles.wrapper}>
                        <div className={styles.title}>{Functions.removeUnr(d.mapfile)}</div>
                        <Image src={`/images/maps/${getImage(d.mapfile)}.jpg`} width={384} height={216} alt="image"/>
                        <div className={styles.info}>
                            <span className="yellow">Matches</span> {d.total_matches}<br/>
                            <span className="yellow">Playtime</span> {Functions.toHours(d.gametime).toFixed(2)} Hours<br/>
                            <span className="yellow">Average Match Length</span> {Functions.MMSS(d.average_gametime)}<br/>
                            <span className="yellow">First</span> {Functions.convertTimestamp(Functions.utDate(d.first_match))}<br/>
                            <span className="yellow">Last</span> {Functions.convertTimestamp(Functions.utDate(d.last_match))}<br/>
                        </div>
                    </div>
                </a>
            </Link>
        );
    }

    const orderByElem = <div className="m-bottom-25">
        <div className="big-tabs">
            {createLink("Name", "name", name, display, mode, order)}
            {createLink("Matches", "matches", name, display, mode, order)}
            {createLink("Playtime", "playtime", name, display, mode, order)}
            {createLink("First Match", "first", name, display, mode, order)}
            {createLink("Last Match", "last", name, display, mode, order)}
            {createLink("Average Match Length", "avglength", name, display, mode, order)}

        </div>
    </div>;

    return  <div >
        {orderByElem}  
        {elems}
    </div>;
}

export default MapsDefaultView;