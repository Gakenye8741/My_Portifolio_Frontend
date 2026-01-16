import { Navbar } from "../Components/Navbar"
import { AdminLayout } from "../DashBoard/DashBoards/dashboardDesign/AdminLayout"


export const AdminDashBoard = () => {
  return (
    <div className="h-screen mt-20">
      <Navbar/>
      <AdminLayout/>        
    </div>
  )
}