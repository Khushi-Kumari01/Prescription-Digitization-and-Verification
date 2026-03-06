export default function MedicineTable({medicines}){

return(

<table>

<thead>
<tr>
<th>Medicine</th>
<th>Dosage</th>
<th>Frequency</th>
</tr>
</thead>

<tbody>

{medicines.map((m,i)=>(

<tr key={i}>
<td>{m.name}</td>
<td>{m.dosage}</td>
<td>{m.frequency}</td>
</tr>

))}

</tbody>

</table>

)

}