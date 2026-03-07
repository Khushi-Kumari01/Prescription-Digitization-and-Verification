import axios from "axios"

const API = axios.create({
 baseURL: "http://localhost:5001"
})

export const analyzePrescription = (file) => {

 const formData = new FormData()
 formData.append("image", file)

 return API.post("/analyze", formData)

}