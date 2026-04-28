import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="w-full pt-12">
          <Outlet />
        </div>
      </div>
    </>
  );
}
