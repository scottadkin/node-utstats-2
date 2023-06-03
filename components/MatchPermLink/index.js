import styles from "./MatchPermLink.module.css";

const copyToClipboard = async ( url) =>{

    try{
        await navigator.clipboard.writeText(url);
    }catch(err){
        console.trace(err);
    }
}

const MatchPermLink = ({url, hash}) =>{

    if(hash === "") return null;

    return <div className={styles.wrapper} onClick={() => copyToClipboard(`${url}${hash}`)}>
        <div className={`${styles.button} team-red`}>Copy Match Permalink To Clipboard</div>
        
    </div>
}

export default MatchPermLink;