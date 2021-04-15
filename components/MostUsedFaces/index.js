import TimeStamp from '../TimeStamp/';
import styles from './MostUsedFaces.module.css';

const MostUsedFaces = ({data, images}) =>{


    data = JSON.parse(data);
    images = JSON.parse(images);

    const elems = [];

    let currentImage = 0;
    let d = 0;

    for(let i = 0; i < data.length; i++){

        d = data[i];

        currentImage = images[d.id];

        if(currentImage === undefined) currentImage = {"name": "faceless"};

        elems.push(<div className={`${styles.wrapper} center`} key={i}>
            <div className={styles.inner}>
                <div className={styles.face}><img src={`/images/faces/${currentImage.name}.png`} alt="Image" /></div>
                <div>
                    <span className="yellow">Used</span> {d.uses} times<br/>
                    <span className="yellow">First</span> <TimeStamp timestamp={d.first} noDayName={true}/><br/>
                    <span className="yellow">Last</span> <TimeStamp timestamp={d.last} noDayName={true}/><br/>
                </div>
            </div>
        </div>);
    }

    if(elems.length === 0) return null;

    return <div className="m-bottom-10">
        <div className="default-header">Most Used Faces</div>
        {elems}
    </div>

}


export default MostUsedFaces;