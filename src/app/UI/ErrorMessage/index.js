import styles from './ErrorMessage.module.css';


export default function ErrorMessage({text, title, children}){

    console.warn(`use MessageBox component instead.`);
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
            <b>{title ?? "Error"}</b>
        </div>
        <div className={styles.text}>
            {elems}
        </div>
    </div>
}
