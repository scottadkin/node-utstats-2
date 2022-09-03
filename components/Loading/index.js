import styles from './Loading.module.css';
import Image from 'next/image';
import React from 'react';


class Loading extends React.Component{

    constructor(props){

        super(props);
    }

    render(){
        return <div className={styles.wrapper}>
        <Image src={`/images/loading.png`} width={32} height={32} alt="Image"/>
        <div className={styles.text}>
            {(this.props.children !== undefined) ? this.props.children : "Loading Please wait..."}
        </div>
    </div>
    }
}


export default Loading;