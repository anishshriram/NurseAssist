import React from "react"
import Login from "./login"
import Register from "./register"

function App(){
    const [showLogin, setShowLogin] = useState(true); // true -> show login, false -> show register

    function togglePage(){
        setShowLogin(!showLogin); // Switch between pages, this basically switches the state value
    }

    // Shows either the Login or Register page based on the current state
    return React.createElement("div", null, [
        showLogin
        ? React.createElement(Login, { key: "login", togglePage: togglePage }) // Shows login if true
        : React.createElement(Register, { key: "register", togglePage: togglePage }) // Shows register if false
    ]);
}

export default App;