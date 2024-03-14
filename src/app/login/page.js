
import { login } from "../lib/authentication";

export default function Login(){

    return <div>
        <form action={login}>
            <div className="form-row">
                <label htmlFor="username">UserName</label>
                <input type="text" className="textbox" name="username" placeholder="Username..."/>
            </div>
            <div className="form-row">
                <label htmlFor="password">Password</label>
                <input type="password" className="textbox" name="password" placeholder="Password..."/>
            </div>
            <input type="submit" value="Login"/>
        </form>
    </div>
}