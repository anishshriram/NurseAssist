import React, {useState}  from "react"
import Login from "./pages/login"
import Register from "./pages/register"
import NurseDashboard from "./pages/NurseDashboard";
//import DoctorDashboard from "./pages/DoctorDashboard";
//import AdminDashboard from "./pages/AdminDashboard";


function App(){
    const [showLogin, setShowLogin] = useState(false); // true -> show login, false -> show register
    const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));

    function togglePage(){
        setShowLogin(!showLogin); // Switch between pages, this basically switches the state value
    }

    function handleLogout(){
        localStorage.removeItem("userRole");
        setUserRole(null);
    }

    // If user is logged in, show the correct dashboard
    if (userRole === "Nurse") {
        return React.createElement(NurseDashboard, {handleLogout});
    //} else if (userRole === "Doctor") {
        //return React.createElement(DoctorDashboard);
    //} else if (userRole === "Admin") {
        //return React.createElement(AdminDashboard);
    }
    // If not logged in, show login or register
    return React.createElement("div", null, [
        showLogin
            ? React.createElement(Login, { key: "login", togglePage, setUserRole })
            : React.createElement(Register, { key: "register", togglePage, setUserRole })
    ]);

   
}

export default App;