import DefaultHead from '../components/defaulthead';
import Nav from '../components/Nav/';
import Footer from '../components/Footer/';

import React from 'react';

class Login extends React.Component{

    constructor(props){

        super(props);
    }

    async login(e){

        e.preventDefault();

        const username = e.target.username.value;
        const password = e.target.password.value;
        console.log(e)
        
        console.log(username, password);

        const res = await fetch(`/api/login`, {
            body: JSON.stringify({
                "username": username,
                "password": password
            }),
            headers: {
                "Content-Type": "application/json"
            },
            method: "POST"
        });

        console.log(await res.json());
    }


    render(){

        return <div>
            <DefaultHead title={"Login/Register"}/>
            
            <main>
            <Nav />
            <div id="content">
                <div className="default">
                <div className="default-header">
                    Login method ={this.props.method}
                </div>


                <form onSubmit={this.login}>
                    <input type="text" id="username" name="username" placeholder="Username..."/>
                    <input type="password" id="password" name="password" placeholder="Password..."/>
                    <input type="submit" id="submit" name="submit" value="Login"/>
                </form>

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