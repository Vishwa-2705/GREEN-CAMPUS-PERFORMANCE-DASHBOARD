import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DashboardProvider } from "./context/DashboardContext";
import { MessagesProvider } from "./context/MessagesContext";
import Login from "./pages/Login";
import AdminLayout from "./adminDashboard/AdminLayout";
import UserLayout from "./userDashboard/UserLayout";
import OverallDashboard from "./adminDashboard/OverallDashboard";
import Energy from "./adminDashboard/Energy";
import Water from "./adminDashboard/Water";
import Waste from "./adminDashboard/Waste";
import Carbon from "./adminDashboard/Carbon";
import GreenScore from "./adminDashboard/GreenScore";
import ContactUs from "./adminDashboard/ContactUs";
import UserOverallDashboard from "./userDashboard/UserOverallDashboard";
import UserEnergy from "./userDashboard/UserEnergy";
import UserWater from "./userDashboard/UserWater";
import UserWaste from "./userDashboard/UserWaste";
import UserCarbon from "./userDashboard/UserCarbon";
import UserGreenScore from "./userDashboard/UserGreenScore";
import UserContactUs from "./userDashboard/UserContactUs";

function App() {
  return (
    <DashboardProvider>
      <MessagesProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            
            {/* Admin dashboard routes */}
            <Route path="/admin" element={<AdminLayout><OverallDashboard /></AdminLayout>} />
            <Route path="/admin/overall" element={<AdminLayout><OverallDashboard /></AdminLayout>} />
            <Route path="/admin/energy" element={<AdminLayout><Energy /></AdminLayout>} />
            <Route path="/admin/water" element={<AdminLayout><Water /></AdminLayout>} />
            <Route path="/admin/waste" element={<AdminLayout><Waste /></AdminLayout>} />
            <Route path="/admin/carbon" element={<AdminLayout><Carbon /></AdminLayout>} />
            <Route path="/admin/greenscore" element={<AdminLayout><GreenScore /></AdminLayout>} />
            <Route path="/admin/contact" element={<AdminLayout><ContactUs /></AdminLayout>} />

            {/* User dashboard routes */}
            <Route path="/user" element={<UserLayout><UserOverallDashboard /></UserLayout>} />
            <Route path="/user/overall" element={<UserLayout><UserOverallDashboard /></UserLayout>} />
            <Route path="/user/energy" element={<UserLayout><UserEnergy /></UserLayout>} />
            <Route path="/user/water" element={<UserLayout><UserWater /></UserLayout>} />
            <Route path="/user/waste" element={<UserLayout><UserWaste /></UserLayout>} />
            <Route path="/user/carbon" element={<UserLayout><UserCarbon /></UserLayout>} />
            <Route path="/user/greenscore" element={<UserLayout><UserGreenScore /></UserLayout>} />
            <Route path="/user/contact" element={<UserLayout><UserContactUs /></UserLayout>} />
          </Routes>
        </Router>
      </MessagesProvider>
    </DashboardProvider>
  );
}

export default App;
