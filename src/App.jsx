import { useEffect, useState } from "react";
import axios from "axios";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import MedicineInventory from "./components/MedicineInventory";
import ExpiryTracking from "./components/ExpiryTracking";
import WasteManagement from "./components/WasteManagement";
import AIAnalytics from "./components/AIAnalytics";
import Reports from "./components/reports";
import ConsumptionTracking from "./components/ConsumptionTracking";
import ConsumptionHistory from "./components/ConsumptionHistory";
import Notifications from "./components/Notifications";
import Settings from "./components/Settings";

function App() {

  // ==========================================
  // LOGIN STATUS
  // ==========================================

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  // Current page
  const [currentPage, setCurrentPage] =
    useState("dashboard");

  // ==========================================
  // MEDICINE DATA
  // ==========================================

  const [medicines, setMedicines] = useState([]);

  // ==========================================
  // NOTIFICATION DATA
  // ==========================================

  const [notifications, setNotifications] = useState([]);

  // ==========================================
  // GET JWT CONFIG
  // ==========================================

  const getAuthConfig = () => {

    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {

    console.log("Logging out...");

    // Remove JWT
    localStorage.removeItem("token");

    // Remove user information
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");

    // Clear application data
    setMedicines([]);
    setNotifications([]);

    // Go to login
    setIsLoggedIn(false);

    // Reset page
    setCurrentPage("dashboard");

    console.log("Logout successful.");
  };

  // ==========================================
  // FETCH MEDICINES
  // ==========================================

  const fetchMedicines = async () => {

    const token = localStorage.getItem("token");

    if (!token) {

      console.log(
        "No JWT token found. Medicines not fetched."
      );

      return;
    }

    try {

      console.log(
        "Fetching medicines from Spring Boot..."
      );

      const response = await axios.get(
        "http://localhost:8080/api/medicines",
        getAuthConfig()
      );

      console.log(
        "Medicines received:",
        response.data
      );

      setMedicines(response.data);

    } catch (error) {

      console.error(
        "Medicine API Error:",
        error
      );

      console.error(
        "Status:",
        error.response?.status
      );

      console.error(
        "Response:",
        error.response?.data
      );

      // JWT invalid / expired
      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {

        console.log(
          "JWT invalid or expired. Logging out."
        );

        handleLogout();
      }

    }
  };

  // ==========================================
  // FETCH NOTIFICATIONS
  // ==========================================

  const fetchNotifications = async () => {

    const token = localStorage.getItem("token");

    if (!token) {

      console.log(
        "No JWT token found. Notifications not fetched."
      );

      return;
    }

    try {

      console.log(
        "Fetching notifications..."
      );

      const response = await axios.get(
        "http://localhost:8080/api/notifications",
        getAuthConfig()
      );

      console.log(
        "Notifications received:",
        response.data
      );

      setNotifications(response.data);

    } catch (error) {

      console.error(
        "Notification API Error:",
        error
      );

      console.error(
        "Status:",
        error.response?.status
      );

      console.error(
        "Response:",
        error.response?.data
      );

      // Don't automatically logout here
      // because medicine API may still work.

    }
  };

  // ==========================================
  // LOAD DATA AFTER LOGIN
  // ==========================================

  useEffect(() => {

    if (!isLoggedIn) {
      return;
    }

    fetchMedicines();
    fetchNotifications();

  }, [isLoggedIn]);

  // ==========================================
  // UNREAD NOTIFICATION COUNT
  // ==========================================

  const unreadNotifications =
    notifications.filter(
      (notification) =>
        notification.read === false
    ).length;

  // Prevent unused-variable warning
  console.log(
    "Unread notifications:",
    unreadNotifications
  );

  // ==========================================
  // PAGE RENDERING
  // ==========================================

  const renderPage = () => {

    // ========================================
    // DASHBOARD
    // ========================================

    if (currentPage === "dashboard") {

      return (
        <Dashboard
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          handleLogout={handleLogout}
          medicines={medicines}
        />
      );
    }

    // ========================================
    // MEDICINE INVENTORY
    // ========================================

    if (currentPage === "inventory") {

      return (
        <MedicineInventory
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          handleLogout={handleLogout}
          medicines={medicines}
          setMedicines={setMedicines}
        />
      );
    }

    // ========================================
    // EXPIRY TRACKING
    // ========================================

    if (currentPage === "expiry") {

      return (
        <ExpiryTracking
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          handleLogout={handleLogout}
          medicines={medicines}
        />
      );
    }

    // ========================================
    // WASTE MANAGEMENT
    // ========================================

    if (currentPage === "waste") {

      return (
        <WasteManagement
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          handleLogout={handleLogout}
          medicines={medicines}
        />
      );
    }

    // ========================================
    // CONSUMPTION TRACKING
    // ========================================

    if (currentPage === "consumption") {

      return (
        <ConsumptionTracking
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          handleLogout={handleLogout}
          medicines={medicines}
          setMedicines={setMedicines}
        />
      );
    }

    // ========================================
    // CONSUMPTION HISTORY
    // ========================================

    if (currentPage === "consumption-history") {

      return (
        <ConsumptionHistory
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          handleLogout={handleLogout}
        />
      );
    }

    // ========================================
    // NOTIFICATIONS
    // ========================================

    if (currentPage === "notifications") {

      return (
        <Notifications
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          handleLogout={handleLogout}
        />
      );
    }

    // ========================================
    // AI ANALYTICS
    // ========================================

    if (currentPage === "ai") {

      return (
        <AIAnalytics
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          handleLogout={handleLogout}
          medicines={medicines}
        />
      );
    }

    // ========================================
    // REPORTS
    // ========================================

    if (currentPage === "reports") {

      return (
        <Reports
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          handleLogout={handleLogout}
          medicines={medicines}
        />
      );
    }

    // ========================================
    // SETTINGS
    // ========================================

    if (currentPage === "settings") {

      return (
        <Settings
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          handleLogout={handleLogout}
        />
      );
    }

    // ========================================
    // DEFAULT DASHBOARD
    // ========================================

    return (
      <Dashboard
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        handleLogout={handleLogout}
        medicines={medicines}
      />
    );
  };

  // ==========================================
  // MAIN APPLICATION
  // ==========================================

  return (
    <>
      {!isLoggedIn ? (

        <Login
          setIsLoggedIn={setIsLoggedIn}
        />

      ) : (

        renderPage()

      )}
    </>
  );
}

export default App;