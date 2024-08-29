import axios from "axios";
import { configDotenv } from "dotenv";


function onLoginSubmitted() {
    let nameText = document.getElementById("emailTextInput") ;
    let passText = document.getElementById("passwordTextInput") ;
    if (!checkUserName(nameText.innerHTML)) return;
    if (!checkPassword(passText.innerHTML)) return; //TODO Error handling
    doLogin(nameText.innerHTML, passText.innerHTML)
}

function isUserNameValid(userName) {
    if (userName === "") {
        return false
    }
    return true
}

function isPasswordValid(userName) {
    if (userName === "") {
        return false
    }
    return true
}

function doLogin(userName, password) {
    let dotEnv = configDotenv({
        path:'../config/.env' 
    });

    axios.post(`${dotEnv.BASE_URL}wordly/user/login`, {
        userName: userName,
        password: password
    }).then((result) => {
        console.log(`${result}`)
    }).catch((error) => {

    })
}

