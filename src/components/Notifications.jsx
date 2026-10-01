import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";

function Notifications({
  currentPage,
  setCurrentPage
}) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==============================
  // JWT AUTH CONFIG
  // ==============================
  const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  // ==============================
  // FETCH NOTIFICATIONS
  // ==============================
  const fetchNotifications = async () => {
    try {
      setLoading(true);

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
        "Error fetching notifications:",
        error
      );

      if (error.response) {
        console.error(
          "Backend status:",
          error.response.status
        );

        console.error(
          "Backend response:",
          error.response.data
        );
      }

      setNotifications([]);

    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // LOAD NOTIFICATIONS
  // ==============================
  useEffect(() => {
    fetchNotifications();
  }, []);

  // ==============================
  // MARK NOTIFICATION AS READ
  // ==============================
  const markAsRead = async (id) => {
    try {
      await axios.put(
        `http://localhost:8080/api/notifications/${id}/read`,
        {},
        getAuthConfig()
      );

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                read: true
              }
            : notification
        )
      );

    } catch (error) {
      console.error(
        "Error marking notification as read:",
        error
      );

      if (error.response) {
        console.error(
          "Backend status:",
          error.response.status
        );

        console.error(
          "Backend response:",
          error.response.data
        );
      }
    }
  };

  // ==============================
  // NOTIFICATION ICON
  // ==============================
  const getNotificationIcon = (type) => {

    if (type === "URGENT") {
      return "🔴";
    }

    if (type === "EXPIRED") {
      return "⚫";
    }

    if (type === "WARNING") {
      return "🟡";
    }

    if (type === "LOW_STOCK") {
      return "📦";
    }

    return "🔔";
  };

  // ==============================
  // UNREAD COUNT
  // ==============================
  const unreadCount = notifications.filter(
    (notification) =>
      notification.read === false
  ).length;

  // ==============================
  // READ COUNT
  // ==============================
  const readCount =
    notifications.length - unreadCount;

  return (
    <div className="dashboard-layout">

      {/* =========================
          SIDEBAR
      ========================= */}

      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      {/* =========================
          MAIN CONTENT
      ========================= */}

      <div className="dashboard-content">

        <h1>🔔 Notifications</h1>

        <p>
          Medicine expiry, stock and system notifications.
        </p>

        {/* =========================
            NOTIFICATION SUMMARY
        ========================= */}

        <div className="dashboard-cards">

          {/* TOTAL */}

          <div className="dashboard-card">

            <h3>
              🔔 Total Notifications
            </h3>

            <h2>
              {notifications.length}
            </h2>

            <p>
              All system notifications
            </p>

          </div>

          {/* UNREAD */}

          <div className="dashboard-card">

            <h3>
              🔴 Unread
            </h3>

            <h2>
              {unreadCount}
            </h2>

            <p>
              Notifications requiring attention
            </p>

          </div>

          {/* READ */}

          <div className="dashboard-card">

            <h3>
              ✅ Read
            </h3>

            <h2>
              {readCount}
            </h2>

            <p>
              Notifications already reviewed
            </p>

          </div>

        </div>

        {/* =========================
            NOTIFICATION CENTER
        ========================= */}

        <div className="inventory-table-box">

          <h2>
            Notification Center
          </h2>

          {/* LOADING */}

          {loading ? (

            <p>
              Loading notifications...
            </p>

          ) : notifications.length === 0 ? (

            <p>
              No notifications available.
            </p>

          ) : (

            notifications.map(
              (notification) => (

                <div
                  key={notification.id}
                  className="dashboard-card"
                  style={{
                    marginBottom: "15px",
                    opacity:
                      notification.read
                        ? 0.65
                        : 1
                  }}
                >

                  {/* TYPE */}

                  <h3>

                    {getNotificationIcon(
                      notification.type
                    )}

                    {" "}

                    {notification.type}

                    {notification.read && (
                      <span
                        style={{
                          marginLeft: "10px",
                          fontSize: "12px"
                        }}
                      >
                        ✓ Read
                      </span>
                    )}

                  </h3>

                  {/* MESSAGE */}

                  <p>
                    {notification.message}
                  </p>

                  {/* MEDICINE */}

                  {notification.medicineName && (

                    <p>

                      💊 Medicine:{" "}

                      <strong>
                        {notification.medicineName}
                      </strong>

                    </p>

                  )}

                  {/* DATE */}

                  <small>

                    {notification.createdAt
                      ? new Date(
                          notification.createdAt
                        ).toLocaleString()
                      : ""}

                  </small>

                  {/* MARK AS READ */}

                  {!notification.read && (

                    <div
                      style={{
                        marginTop: "10px"
                      }}
                    >

                      <button
                        className="save-button"
                        onClick={() =>
                          markAsRead(
                            notification.id
                          )
                        }
                      >
                        ✓ Mark as Read
                      </button>

                    </div>

                  )}

                </div>

              )
            )

          )}

        </div>

      </div>

    </div>
  );
}

export default Notifications;