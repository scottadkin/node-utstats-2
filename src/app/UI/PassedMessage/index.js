import styles from './PassedMessage.module.css';


export default function PassedMessage({text, title, children}){

    if(text !== undefined && text == null) return null;

    let elems = null;
 
    if(text === undefined && children === undefined){

        elems = <>
            No text or children components provided.
        </>
        
    }else if(children !== undefined){

        elems = children;

    }else if(text !== undefined){
        elems = text;
    }

    return <div className={styles.wrapper}>
        <div className={styles.title}>
            <b>{title ?? "Success"}</b>
        </div>
        <div className={styles.text}>
            {elems}
        </div>
    </div>
}
