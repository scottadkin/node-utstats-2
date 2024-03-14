"use client"

import { register } from "../lib/authentication"

export default function RegisterPage(){

    return <div>
        <form action={register}>
            <div className="form-row">
                <label htmlFor="username">UserName</label>
                <input type="text" className="textbox" name="username" placeholder="Username..."/>
            </div>
            <div className="form-row">
                <label htmlFor="password">Password</label>
                <input type="password" className="textbox" name="password" placeholder="Password..."/>
            </div>
            <div className="form-row">
                <label htmlFor="password">Password Again</label>
                <input type="password" className="textbox" name="password2" placeholder="Password again..."/>
            </div>
            <input type="submit" value="Register"/>
        </form>
    </div>
}