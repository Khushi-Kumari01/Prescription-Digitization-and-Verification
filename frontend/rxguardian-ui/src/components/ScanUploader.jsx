import { useState } from "react"
import { analyzePrescription } from "../services/api"

export default function ScanUploader(){

const [result,setResult] = useState(null)

const handleUpload = async (e)=>{

const file = e.target.files[0]

const res = await analyzePrescription(file)

setResult(res.data)

}

return(

<div>

<input type="file" onChange={handleUpload}/>

{result && (

<div className="panel">

<h3>Extracted Text</h3>
<p>{result.extracted_text}</p>

<h3>Medicines</h3>
<p>{result.medicines.join(", ")}</p>

<h3>Risk</h3>
<p>{result.risk_analysis}</p>

<h3>Summary</h3>
<p>{result.ai_summary}</p>

</div>

)}

</div>

)

}