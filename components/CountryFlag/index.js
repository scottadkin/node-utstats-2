import Countries from '../../api/countries';
import React from 'react';
import styles from './CountryFlag.module.css';
import Image from 'next/image';

class CountryFlag extends React.Component{

    constructor(props){

        super(props);
        this.state = {"show": false};

        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
    }

    show(){

        if(this.props.bNoHover !== undefined && this.props.bNoHover) return;

        this.setState({"show": true});
    }

    hide(){

        this.setState({"show": false});
    }
    

    render(){

        const flag = Countries(this.props.country);

        const hiddenClass = (this.state.show) ? "" : "hidden";

        const url = `/images/flags/${flag.code.toLowerCase()}.svg`;

        const hoverElem = (this.state.show) ? <div className={`${styles.mouse} ${hiddenClass}`} onMouseOver={this.hide}>
            <div className={styles["country-name"]} >{flag.country}</div>
            <Image src={url} width={100} height={60} alt="image"/>
        </div> : null;

        let width = 16;
        let height = 10;

        const small = (this.props.small === undefined) ? false : this.props.small;

        if(small){
            width = 12;
            height = 8;
        }

        return <div className={styles.wrapper} onMouseOver={this.show} onMouseLeave={this.hide}>
            {hoverElem}
            <Image className="country-flag" width={width} height={height} src={url} alt="flag"/>
        </div>;

    }
}

export default CountryFlag;