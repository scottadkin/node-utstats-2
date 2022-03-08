import React from 'react';
import styles from './MonsterHuntMonster.module.css';
import Image from 'next/image';

class MonsterHuntMonster extends React.Component{

    constructor(props){

        super(props);
    }

    render(){

        return <div className={styles.wrapper}>
            <div className={styles.name}>{this.props.name}</div>
            <div className={styles.image}>
                <Image src={`/images/monsters/${this.props.image}`} width={200} height={200}/>    
            </div>
        </div>
    }
}

export default MonsterHuntMonster;