"use client";
import ErrorMessage from "../../../../components/ErrorMessage";
import { useReducer } from "react";
import Tabs from "../../../../components/Tabs";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

function reducer(state, action){

    switch(action.type){
        case "set-error": {
            return {
                ...state,
                "errorText": action.text,
                "errorTitle": action.title
            }
        }
        case "change-mode": {
            return {
                ...state,
                "mode": action.value
            }
        }
    }

    return state;
}


export default function LoginRegisterForms(){

    const [state, dispatch] = useReducer(reducer, {
        "mode": "login",
        "errorText": null,
        "errorTitle": null
    }); 


    return <div className="default">
        <div className="default-header">Login/Register</div>
        <Tabs selectedValue={state.mode} changeSelected={(value) =>{
            dispatch({"type": "change-mode", "value": value});
        }} options={
            [
                {
                    "name": "Login",
                    "value": "login"
                },
                {
                    "name": "Register",
                    "value": "register"
                }
            ]
        }/>
        <ErrorMessage text={state.errorText} title={state.errorTitle}/>

        {(state.mode === "login") ? <LoginForm /> : <RegisterForm />}
        
        
    </div>
}