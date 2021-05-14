import React from 'react';
import styles from './AdminMatchControl.module.css';


class AdminMatchControl extends React.Component{

    constructor(props){

        super(props);

        this.deleteMatch = this.deleteMatch.bind(this);

        this.state = {"matchDeleteMessage": ""};
    }

    async deleteMatch(){

        try{

            const req = await fetch("/api/matchadmin", {
                "headers": {"Content-Type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"type": "deleteMatch", "matchId": this.props.matchId})
            });

            const result = await req.json();

            console.log(result);

            
            this.setState({"matchDeleteMessage": result.message});

            setTimeout(() =>{
                window.location = "/";
            }, 2000);
            

        }catch(err){
            console.trace(err);
        }   

    }

    displayMatchDeletedMessage(){

        if(this.state.matchDeleteMessage === "") return null;

        let string = this.state.matchDeleteMessage;

        if(string === "passed"){
            string = "Match Deleted successfully. Redirecting in 2 seconds.";
        }

        return <div className={`team-green ${styles.box} center m-bottom-25`}>
            {string}
        </div>
    }

    render(){

        return <div>
            <div className="default-header">Admin Options</div>

                <div className="form">
                    <div className="form-info">Actions are irreversible!</div>
                    {this.displayMatchDeletedMessage()}
                    <div className={`${styles.button} team-red`} onClick={this.deleteMatch}>Delete Match</div>
                </div>
               
        </div>
    }
}

export default AdminMatchControl;