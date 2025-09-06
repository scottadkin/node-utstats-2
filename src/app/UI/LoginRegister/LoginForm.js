"use client";
import styles from "../../../../styles/Login.module.css";
import { useReducer } from "react";
import { loginUser } from "../../actions";
import { useRouter } from "next/navigation";

/*async function login(e, state){

    console.log(e);
    e.preventDefault();

    const username = e.target.username.value;
    const password = e.target.password.value;
    const mode = state.mode;

    let password2 = "";

    if(mode === "register"){
        password2 = e.target.password2.value;
    }

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
    
    const errors = [];

    if(result.errors.length > 0){

        for(let i = 0; i < result.errors.length; i++){

            errors.push(result.errors[i]);
        }
    }

    if(errors.length === 0){

        if(mode !== 1){

            window.location.replace("/?loggedin");
        }else{

            if(result.bAutoLogin){
                window.location.replace("/?loggedin=potato");
            }else{
                window.location.replace("/?registered");
            }
        }
      
    }

    //this.setState({"errors": errors});
}*/

function renderLoginForm(){

    const router = useRouter();

    //const login = loginUser.bind(null, {"test": "a"});

    return <div className={`${styles.form} form`}>
        <form action={async (e) =>{
            
            //console.log(await loginUser(e));
            const result = await loginUser(e);
            console.log(result);
            if(result.errors.length === 0){
                router.push("/#loggedin");
            }
        }}>
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

export default function LoginRegisterForms(){



    return <div className="default">
        <div className="default-header">Login/Register</div>
        {renderLoginForm()}
    </div>
}