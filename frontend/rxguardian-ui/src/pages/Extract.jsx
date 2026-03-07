import MedicineTable from "../components/MedicineTable"

export default function Extract(){

const medicines = [
  { name:"Amoxicillin", dosage:"500mg", frequency:"Twice daily" }
]

return(

<div>

<h1>Extract Medicines</h1>

<MedicineTable medicines={medicines}/>

</div>

)

}