"use client"
import { logout } from "../lib/authentication";
import { useRouter } from "next/navigation";



export default function LogoutPage(){
    

    const router = useRouter();
    return <div>
        <span onClick={async () =>{
            const a = await logout();

            
            console.log(a);

            
            router.push("/");
            router.refresh();
        }}>test click here</span>
    </div>
}
