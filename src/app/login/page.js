
"use client"
import { login } from "../lib/authentication";
import Header from "../UI/Header";
import {useFormState} from "react-dom";
import ErrorBox from "../UI/ErrorBox";
import MessageBox from "../UI/MessageBox";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Login(){

    const [state, formAction] = useFormState(login, {
        "message": null,
        "error": null
    });

    const router = useRouter();

    useEffect(() =>{
     
        if(state.message === "ok"){
            router.push("/");
        }
        
    },[state.message, router]);

    return <div>
        <Header>Login</Header>
        <form action={formAction}>
            <div className="form-row">
                <label htmlFor="username">Username</label>
                <input type="text" className="textbox" name="username" placeholder="Username..."/>
            </div>
            <div className="form-row">
                <label htmlFor="password">Password</label>
                <input type="password" className="textbox" name="password" placeholder="Password..."/>
            </div>
            <input type="submit" className="submit-button" value="Login"/>
        </form>
        {(state.message !== null) ? <MessageBox title="Test">{state.message}</MessageBox> : null}
        {(state.error !== null) ? <ErrorBox title="Failed to Login">{state.error}</ErrorBox> : null}
    </div>
}