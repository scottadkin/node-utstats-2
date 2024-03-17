"use server"

import { logout } from "../lib/authentication"

export default async function Logouttest(){

    await logout();
}