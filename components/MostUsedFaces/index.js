import Functions from '../../api/functions';
import styles from './MostUsedFaces.module.css';
import Image from 'next/image';

const MostUsedFaces = ({data, images, host}) =>{


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
            <div className={styles.face}><Image src={`/images/faces/${currentImage.name}.png`} alt="Image" width={64} height={64} /></div>
            <div className={styles.inner}>
                <div>
                    Used {d.uses} times<br/>
                    First Used {Functions.convertTimestamp(d.first, true)}<br/>
                    Last Used {Functions.convertTimestamp(d.last, true)}<br/>
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