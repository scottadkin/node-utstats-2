import styles from './CookieBanner.module.css';
import React from 'react';



class CookieBanner extends React.Component{

    constructor(props){

        super(props);

        this.state = {"bShow": true, "session": JSON.parse(this.props.session)};

        this.hide = this.hide.bind(this);
    }

    componentDidMount(){

    
        if(this.state.session.hideCookieBanner !== undefined){
            if(this.state.session.hideCookieBanner) this.setState({"bShow": false});
        }

    }

    hide(){

        this.setState({"bShow": false});

        const year = ((60 * 60) * 24) * 365;

        if(process.browser){
            document.cookie = `hideCookieBanner=true; max-age=${year}`;
        }
    }

    render(){

        return <div className={`${styles.wrapper} ${(this.state.bShow) ? "" : "hidden"}`}>
            <div className={styles.header}>Cookies</div>

            <div className={styles.info}>
                This site uses cookies to enhance your user experience, by using this site you are agreeing to their use.
            </div>

            <div className={styles.hide} onClick={this.hide}>
                Got it!
            </div>
        </div>
    }
}



export default CookieBanner;