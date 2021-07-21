import Image from 'next/image';
import styles from './HomeLastMatch.module.css';

const HomeLastMatch = ({data}) =>{

    console.log(data);

    return <div>
        <div className="default-header">Latest Match</div>

        <div className={`${styles.wrapper} center`}>
            <div className={styles.image}>
                <Image src={`/images/maps/deck16.jpg`} width={480} height={270}/>
            </div>
        </div>
    </div>
}


export default HomeLastMatch;