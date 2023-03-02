import styles from './CookieBanner.module.css';
import {React, useState, useEffect} from 'react';


const CookieBanner = ({session}) =>{

    const [bShow, setbShow] = useState(false);

    useEffect(() =>{

        if(session.hideCookieBanner === undefined){
            setbShow(true);
        }

    }, [session]);

    if(!bShow) return null;

    return <div className={styles.wrapper}>
        <div className={styles.header}>Cookies</div>

        <div className={styles.info}>
            This site uses cookies to enhance your user experience, by using this site you are agreeing to their use.
        </div>

        <div className={styles.hide} onClick={() => {
            const year = ((60 * 60) * 24) * 365;
      
            document.cookie = `hideCookieBanner=true; max-age=${year}`;
            setbShow(false)
        }}>
            Got it!
        </div>
    </div>
}

export default CookieBanner;
