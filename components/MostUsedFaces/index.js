import { convertTimestamp } from '../../api/generic.mjs';
import styles from './MostUsedFaces.module.css';
import Image from 'next/image';

const MostUsedFaces = ({data, images}) =>{

    const elems = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        let currentImage = images[d.id];

        if(currentImage === undefined) currentImage = {"name": "faceless"};

        elems.push(<div className={`${styles.wrapper} center`} key={i}>
            <div className={styles.face}><Image src={`/images/faces/${currentImage.name}.png`} alt="Image" width={64} height={64} /></div>
            <div className={styles.inner}>
                <div>
                    Used {d.uses} times<br/>
                    First Used {convertTimestamp(d.first, true)}<br/>
                    Last Used {convertTimestamp(d.last, true)}<br/>
                </div>
            </div>
        </div>);
    }

    if(elems.length === 0) return null;

    return <div className="default m-bottom-10">
        <div className="default-header">Most Used Faces</div>
        {elems}
    </div>

}


export default MostUsedFaces;