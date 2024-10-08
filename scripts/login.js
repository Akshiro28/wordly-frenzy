import axios from "https://cdn.skypack.dev/axios";
import { config } from "../config.js";
import { showError } from "../util/utils.js";

function main() {
    document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });

    document.getElementById("buttonPlayNow").onclick = () => {
        redirectToHomePage() 
    } ;
    document.getElementById("buttonLogin").onclick = () => {
        onLoginSubmitted()
    } ;
}

function onLoginSubmitted() {
    let nameText = document.getElementById("nameTextInput").value ;
    let passText = document.getElementById("passwordTextInput").value ;
    if (!checkUserName(nameText)) return;
    if (!checkPassword(passText)) return; //TODO Error handling
    doLogin(nameText, passText)
}

function checkUserName(userName) {
    if (userName === "") {
        return false
    }
    return true
}

function checkPassword(userName) {
    if (userName === "") {
        return false
    }
    return true
}

function doLogin(userName, password) {
    axios.post(`${config.BASE_URL}wordly/user/login`, {
        userName: userName,
        password: password
    }, {
       headers: {
        "Content-Type": "application/json"
       } 
    }).then((result) => {
        let token = result.data["authToken"] || ""
        if (token !== "") {
            document.cookie=`accessToken=${token}`
            redirectToHomePage()
        }
    }).catch((error) => {
        showError(
            "Terjadi kesalahan",
            "Mohon coba lagi",
            "Ok"
        )
    })
}

function redirectToHomePage() {
    window.location.href = 'home/index.html';
}

main()