import { Link } from "react-router-dom"
import { Home, ScanLine, Pill, ShieldCheck, History, User } from "lucide-react"

export default function Sidebar(){

return(

<div className="sidebar">

<h2>RxGuardian AI</h2>

<Link to="/"><Home size={18}/> Dashboard</Link>
<Link to="/scan"><ScanLine size={18}/> Scan</Link>
<Link to="/extract"><Pill size={18}/> Extract</Link>
<Link to="/verification"><ShieldCheck size={18}/> Verification</Link>
<Link to="/history"><History size={18}/> History</Link>
<Link to="/profile"><User size={18}/> Profile</Link>

</div>

)

}