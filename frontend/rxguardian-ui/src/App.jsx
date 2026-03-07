import { BrowserRouter,Routes,Route } from "react-router-dom"

import Sidebar from "./components/Sidebar"
import Header from "./components/Header"

import Dashboard from "./pages/Dashboard"
import Scan from "./pages/Scan"
import Extract from "./pages/Extract"
import Verification from "./pages/Verification"
import History from "./pages/History"
import Profile from "./pages/Profile"

export default function App(){

return(

<BrowserRouter>

<div className="layout">

<Sidebar/>

<div className="main">

<Header/>

<Routes>

<Route path="/" element={<Dashboard/>}/>
<Route path="/scan" element={<Scan/>}/>
<Route path="/extract" element={<Extract/>}/>
<Route path="/verification" element={<Verification/>}/>
<Route path="/history" element={<History/>}/>
<Route path="/profile" element={<Profile/>}/>

</Routes>

</div>

</div>

</BrowserRouter>

)

}