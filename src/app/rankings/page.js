import { redirect, RedirectType } from "next/navigation";

export default function Page(){
    redirect('/rankings/0', RedirectType.replace);
}
 