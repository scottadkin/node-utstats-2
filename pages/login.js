import DefaultHead from '../components/defaulthead';
import Nav from '../components/Nav/';
import Footer from '../components/Footer/';
import React from 'react';
import styles from '../styles/Login.module.css';

class Login extends React.Component{

    constructor(props){

        super(props);

        this.state = {"errors": [], "mode": 0};

        this.login = this.login.bind(this);
        this.changeMode = this.changeMode.bind(this);
    }

    changeMode(id){
        this.setState({"mode": id});
    }

    async login(e){

        e.preventDefault();

        const username = e.target.username.value;
        const password = e.target.password.value;
        const mode = parseInt(e.target.mode.value);

        let password2 = "";

        if(mode === 1){
            password2 = e.target.password2.value;
        }

        console.log(e)
        
        console.log(username, password);

        const res = await fetch(`/api/login`, {

            body: JSON.stringify({
                "username": username,
                "password": password,
                "password2": password2,
                "mode": mode
            }),
            headers: {
                "Content-Type": "application/json"
            },
            method: "POST"
        });

        const result = await res.json();

        console.log(result);

        const errors = [];

        if(result.errors.length > 0){

            for(let i = 0; i < result.errors.length; i++){

                errors.push(result.errors[i]);
            }
        }

       

        if(mode === 0){
            if(!result.userExists){
                errors.push(`There are no members with that username.`);
            }
        }

        this.setState({"errors": errors});
    }


    renderErrors(){

        if(this.state.errors.length > 0){

            const elems = [];


            let e = 0;

            for(let i = 0; i < this.state.errors.length; i++){

                e = this.state.errors[i];

                elems.push(<li key={i}>
                    {e}
                </li>);
            }


            return <div className={styles.errors}>
                <div className="default-header">Error</div>
                <ul className={styles.errorlist}>
                    {elems}
                </ul>
            </div>
        }

        return null;
    }


    renderLoginForm(){

        if(this.state.mode !== 0) return null;

        return <div className={styles.form}>
            <form onSubmit={this.login}>
                <div className="select-row">
                    <div className="select-label">Username</div>
                    <input type="text" className="default-textbox" id="username" name="username" placeholder="Username..."/>
                </div>
                <div className="select-row">
                    <div className="select-label">Password</div>
                    <input type="password" className="default-textbox" id="password" name="password" placeholder="Password..."/>
                </div>
                <input type="hidden" className="default-textbox" id="mode" name="mode" value="0"/>
                <input className="search-button" type="submit" id="submit" name="submit" value="Login"/>
            </form>
        </div>
    }

    renderRegisterForm(){

        if(this.state.mode !== 1) return null;

        return <div className={styles.form}>
            <form onSubmit={this.login}>
                <div className="select-row">
                    <div className="select-label">Username</div>
                    <input type="text" className="default-textbox" id="username" name="username" placeholder="Username..."/>
                </div>
                <div className="select-row">
                    <div className="select-label">Password</div>
                    <input type="password" className="default-textbox" id="password" name="password" placeholder="Password..."/>
                </div>
                <div className="select-row">
                    <div className="select-label">Confirm Password</div>
                    <input type="password" className="default-textbox" id="password2" name="password2" placeholder="Password..."/>
                </div>
                <input type="hidden" id="mode" name="mode" value="1"/>
                <input type="submit" className="search-button" id="submit" name="submit" value="Register"/>
            </form>
        </div>
    }

    renderNotMember(){

        if(this.state.mode === 0){

            return <div onClick={(() =>{ this.changeMode(1)})} className={styles.not}>
                Not a member? Register now!
            </div>

        }else{
            return <div onClick={(() =>{ this.changeMode(0)})} className={styles.not}>
                Already a member? Login.
            </div>
        }
    }

    render(){

        return <div>
            <DefaultHead title={"Login/Register"}/>
            
            <main>
            <Nav />
            <div id="content">
                <div className="default">
                <div className="default-header">
                    {(this.state.mode === 0) ? "Login" : "Register"}
                </div>

                {this.renderErrors()}

                {this.renderLoginForm()}
                {this.renderRegisterForm()}

                {this.renderNotMember()}
                </div>
            </div>
            <Footer />
            </main>   
        </div>
    }
}


export async function getServerSideProps({query, req}){


    return {
        props: {
            "method": req.method
        }
    }
}


export default Login;