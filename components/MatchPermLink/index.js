import styles from "./MatchPermLink.module.css";

const copyToClipboard = async ( url) =>{

    try{
        await navigator.clipboard.writeText(url);
    }catch(err){
        console.trace(err);
    }
}

const MatchPermLink = ({url}) =>{

    return <div className={styles.wrapper} onClick={() => copyToClipboard( url)}>
        <div className={`${styles.button} team-red`}>Copy Match Permalink To Clipboard</div>
        
    </div>
}

export default MatchPermLink;