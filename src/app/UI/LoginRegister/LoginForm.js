"use client"
import styles from "../../../../styles/Login.module.css";
import { loginUser } from "../../actions";
import { useActionState } from "react";
import ErrorMessage from "../../../../components/ErrorMessage";


export default function LoginForm(){

    const [state, formAction] = useActionState(loginUser, {
        "errors": []
    });

    let errorElems = null;

    if(state.errors.length > 0){
        errorElems = state.errors.map((e,i) =>{
             return <div key={`error-${i}`}>{e}</div>
        });
    }

    return <div className={`${styles.form} form`}>
        <ErrorMessage title="Failed To Login" text={errorElems}/>
        <form action={formAction}>
            <div className="select-row">
                <div className="select-label">Username</div>
                <input type="text" defaultValue={state?.username} className="default-textbox" id="username" name="username" placeholder="Username..."/>
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