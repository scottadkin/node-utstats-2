import styles from './BasicUIBox.module.css';
import Image from 'next/image';

const BasicUIBox = ({title, value, image}) =>{

    const valueColor = (value !== "") ? {} : {"color":"rgba(0,0,0,0)"}

    return <div className={styles.wrapper}>

        <div className={styles.title}>{title}</div>
        <Image src={image} width={80} height={80} alt="icon"/>
        <div className={styles.value} style={valueColor}>
            {(value !== "") ? value : `_`}
        </div>
    </div>
}

export default BasicUIBox;