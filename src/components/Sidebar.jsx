import { useEffect, useState } from "react";
import axios from "axios";

function Sidebar({
  currentPage,
  setCurrentPage,
  handleLogout
}) {

  // =========================
  // UNREAD NOTIFICATION COUNT
  // =========================

  const [unreadNotifications, setUnreadNotifications] =
    useState(0);


  // =========================
  // FETCH UNREAD NOTIFICATIONS
  // =========================

  const fetchUnreadNotifications = async () => {

    try {

      const token =
        localStorage.getItem("token");

      if (!token) {
        return;
      }

      const response =
        await axios.get(
          "http://localhost:8080/api/notifications",
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      const unreadCount =
        response.data.filter(
          (notification) =>
            notification.read === false
        ).length;

      setUnreadNotifications(
        unreadCount
      );

    } catch (error) {

      console.error(
        "Error fetching notification count:",
        error
      );

    }

  };


  // =========================
  // FETCH WHEN SIDEBAR LOADS
  // =========================

  useEffect(() => {

    fetchUnreadNotifications();

  }, []);


  // =========================
  // SAFE LOGOUT FUNCTION
  // =========================

  const handleLogoutClick = () => {

    console.log(
      "Logout button clicked"
    );

    // If App.jsx has handleLogout,
    // use that function.
    if (
      typeof handleLogout ===
      "function"
    ) {

      handleLogout();

      return;

    }

    // Fallback logout
    // in case handleLogout
    // was not passed from App.jsx.

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "userId"
    );

    localStorage.removeItem(
      "userName"
    );

    localStorage.removeItem(
      "userEmail"
    );

    localStorage.removeItem(
      "userRole"
    );

    window.location.reload();

  };


  return (

    <div className="sidebar">

      {/* =========================
          LOGO
      ========================= */}

      <div className="sidebar-logo">

        <h2>
          💊 MedWaste AI
        </h2>

        <p>
          Medicine Management
        </p>

      </div>


      {/* =========================
          MENU
      ========================= */}

      <div className="sidebar-menu">


        {/* =========================
            DASHBOARD
        ========================= */}

        <button
          className={
            currentPage ===
            "dashboard"
              ? "active"
              : ""
          }
          onClick={() =>
            setCurrentPage(
              "dashboard"
            )
          }
        >
          🏠 Dashboard
        </button>


        {/* =========================
            MEDICINE INVENTORY
        ========================= */}

        <button
          className={
            currentPage ===
            "inventory"
              ? "active"
              : ""
          }
          onClick={() =>
            setCurrentPage(
              "inventory"
            )
          }
        >
          💊 Medicine Inventory
        </button>


        {/* =========================
            EXPIRY TRACKING
        ========================= */}

        <button
          className={
            currentPage ===
            "expiry"
              ? "active"
              : ""
          }
          onClick={() =>
            setCurrentPage(
              "expiry"
            )
          }
        >
          ⏰ Expiry Tracking
        </button>


        {/* =========================
            WASTE MANAGEMENT
        ========================= */}

        <button
          className={
            currentPage ===
            "waste"
              ? "active"
              : ""
          }
          onClick={() =>
            setCurrentPage(
              "waste"
            )
          }
        >
          🗑️ Waste Management
        </button>


        {/* =========================
            CONSUMPTION TRACKING
        ========================= */}

        <button
          className={
            currentPage ===
            "consumption"
              ? "active"
              : ""
          }
          onClick={() =>
            setCurrentPage(
              "consumption"
            )
          }
        >
          📦 Consumption Tracking
        </button>


        {/* =========================
            CONSUMPTION HISTORY
        ========================= */}

        <button
          className={
            currentPage ===
            "consumption-history"
              ? "active"
              : ""
          }
          onClick={() =>
            setCurrentPage(
              "consumption-history"
            )
          }
        >
          📜 Consumption History
        </button>


        {/* =========================
            NOTIFICATIONS
        ========================= */}

        <button
          className={
            currentPage ===
            "notifications"
              ? "active"
              : ""
          }
          onClick={() =>
            setCurrentPage(
              "notifications"
            )
          }
        >

          🔔 Notifications

          {unreadNotifications >
            0 && (

            <span
              style={{
                marginLeft: "8px",
                background: "red",
                color: "white",
                borderRadius: "50%",
                minWidth: "22px",
                height: "22px",
                display:
                  "inline-flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                fontSize: "12px",
                fontWeight:
                  "bold"
              }}
            >

              {
                unreadNotifications
              }

            </span>

          )}

        </button>


        {/* =========================
            AI ANALYTICS
        ========================= */}

        <button
          className={
            currentPage ===
            "ai"
              ? "active"
              : ""
          }
          onClick={() =>
            setCurrentPage(
              "ai"
            )
          }
        >
          🤖 AI Analytics
        </button>


        {/* =========================
            REPORTS
        ========================= */}

        <button
          className={
            currentPage ===
            "reports"
              ? "active"
              : ""
          }
          onClick={() =>
            setCurrentPage(
              "reports"
            )
          }
        >
          📊 Reports
        </button>


        {/* =========================
            SETTINGS
        ========================= */}

        <button
          className={
            currentPage ===
            "settings"
              ? "active"
              : ""
          }
          onClick={() =>
            setCurrentPage(
              "settings"
            )
          }
        >
          ⚙️ Settings
        </button>

      </div>


      {/* =========================
          LOGOUT
      ========================= */}

      <button
        type="button"
        className="logout-button"
        onClick={
          handleLogoutClick
        }
      >
        🚪 Logout
      </button>

    </div>

  );

}

export default Sidebar;