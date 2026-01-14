import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ClipboardCheck,
  UserCircle,
  FileText,
  Settings,
} from "lucide-react";
import api from "../utils/api";
import { useAuthStore } from "../store/authStore";

export default function Sidebar() {
  const [trainerCount, setTrainerCount] = useState(0);
  const [memberCount, setMemberCount] = useState(0);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch trainer count
        const trainerRes = await api.get('/trainers');
        if (trainerRes.data.success) {
          setTrainerCount(trainerRes.data.count || 0);
        }

        // Fetch member count
        const memberRes = await api.get('/members');
        if (memberRes.data.success) {
          setMemberCount(memberRes.data.count || 0);
        }
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };

    fetchCounts();
  }, []);

  // Get user initials from name
  const getInitials = (name) => {
    if (!name) return "AD";
    const names = name.split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const menuSections = [
    {
      title: "CORE",
      items: [
        { icon: LayoutDashboard, label: "Dashboard", path: "/" },
        { icon: Users, label: "Members", path: "/members", badge: memberCount },
        { icon: ClipboardCheck, label: "Attendance", path: "/attendance" },
      ],
    },
    {
      title: "MANAGEMENT",
      items: [
        { icon: CreditCard, label: "Plans", path: "/plans" },
        { icon: UserCircle, label: "Trainers", path: "/trainers", badge: trainerCount },  
      ],
    },
    {
      title: "INSIGHTS",
      items: [{ icon: FileText, label: "Reports", path: "/reports" }],
    },
    {
      title: "SYSTEM",
      items: [{ icon: Settings, label: "Settings", path: "/settings" }],
    },
  ];
  return (
    <aside className="w-[254px] h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[10px] bg-[#4F39F6] flex items-center justify-center">
            <span className="text-white font-semibold">G</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-gray-900">GMS</h1>
            <p className="text-xs text-gray-500">Gym Management</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 pt-4 space-y-6 overflow-y-auto">
        {menuSections.map((section) => (
          <div key={section.title}>
            <p className="text-[10px] font-semibold text-gray-400 mb-2">
              {section.title}
            </p>

            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-lg transition ${
                      isActive
                        ? "bg-primary-50 text-primary-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {item.label}
                    </span>
                  </div>

                  {item.badge && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-900 text-white">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-gray-200 p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          System Online
        </div>

        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-semibold bg-gradient-to-b from-[#4F46E5] to-[#10B981]">
              {getInitials(user?.fullName || user?.username || user?.name)}
            </div>
            <div>
             <p className="text-sm font-medium text-gray-900">{user?.fullName || user?.username || "Admin"}</p>
              <p className="text-xs text-gray-500">{user?.role || "Admin"}</p>
            </div>
          </div>
          <Settings className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </aside>
  );
}
