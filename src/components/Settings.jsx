import { useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";

function Settings({
  currentPage,
  setCurrentPage,
  handleLogout
}) {

  // ==========================================
  // SETTINGS STATES
  // ==========================================

  const [notificationsEnabled, setNotificationsEnabled] =
    useState(true);

  const [emailAlerts, setEmailAlerts] =
    useState(false);

  const [autoRefresh, setAutoRefresh] =
    useState(true);

  // ==========================================
  // PASSWORD STATES
  // ==========================================

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [passwordMessage, setPasswordMessage] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");

  // ==========================================
  // USER INFORMATION
  // ==========================================

  const userName =
    localStorage.getItem("userName") ||
    "System Admin";

  const userEmail =
    localStorage.getItem("userEmail") ||
    "admin@medicine.com";

  const userRole =
    localStorage.getItem("userRole") ||
    "ADMIN";

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================

  const handleChangePassword = async (e) => {

    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    // Empty fields
    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {

      setPasswordError(
        "Please fill all password fields."
      );

      return;
    }

    // Minimum password length
    if (newPassword.length < 6) {

      setPasswordError(
        "New password must contain at least 6 characters."
      );

      return;
    }

    // Confirm password
    if (newPassword !== confirmPassword) {

      setPasswordError(
        "New password and confirm password do not match."
      );

      return;
    }

    // Current and new password same
    if (currentPassword === newPassword) {

      setPasswordError(
        "New password must be different from current password."
      );

      return;
    }

    const token =
      localStorage.getItem("token");

    if (!token) {

      setPasswordError(
        "Session expired. Please login again."
      );

      return;
    }

    try {

      setChangingPassword(true);

      const response =
        await axios.post(
          "http://localhost:8080/api/auth/change-password",
          {
            currentPassword: currentPassword,
            newPassword: newPassword
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      if (response.data.success) {

        setPasswordMessage(
          "Password changed successfully. Please login again with your new password."
        );

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

      } else {

        setPasswordError(
          response.data.message ||
          "Password change failed."
        );
      }

    } catch (error) {

      console.error(
        "Change password error:",
        error
      );

      setPasswordError(
        error.response?.data?.message ||
        "Unable to change password. Please try again."
      );

    } finally {

      setChangingPassword(false);
    }
  };


  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f5f7fb"
      }}
    >

      {/* ========================================
          SIDEBAR
      ======================================== */}

      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        handleLogout={handleLogout}
      />


      {/* ========================================
          MAIN CONTENT
      ======================================== */}

      <div
        style={{
          flex: 1,
          padding: "30px",
          overflowY: "auto"
        }}
      >

        {/* ======================================
            HEADER
        ====================================== */}

        <div
          style={{
            marginBottom: "25px"
          }}
        >

          <h1
            style={{
              margin: 0,
              fontSize: "30px"
            }}
          >
            ⚙️ Settings
          </h1>

          <p
            style={{
              color: "#666",
              marginTop: "8px"
            }}
          >
            Manage your MedWaste AI account and
            system preferences.
          </p>

        </div>


        {/* ======================================
            PROFILE
        ====================================== */}

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "12px",
            marginBottom: "20px",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.08)"
          }}
        >

          <h2>
            👤 Profile
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
              marginTop: "20px"
            }}
          >

            {/* Name */}
            <div>

              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginBottom: "8px"
                }}
              >
                Name
              </label>

              <input
                type="text"
                value={userName}
                readOnly
                style={{
                  width: "100%",
                  padding: "12px",
                  border:
                    "1px solid #ddd",
                  borderRadius: "8px",
                  boxSizing:
                    "border-box",
                  background:
                    "#f5f5f5"
                }}
              />

            </div>


            {/* Email */}
            <div>

              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginBottom: "8px"
                }}
              >
                Email
              </label>

              <input
                type="email"
                value={userEmail}
                readOnly
                style={{
                  width: "100%",
                  padding: "12px",
                  border:
                    "1px solid #ddd",
                  borderRadius: "8px",
                  boxSizing:
                    "border-box",
                  background:
                    "#f5f5f5"
                }}
              />

            </div>


            {/* Role */}
            <div>

              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginBottom: "8px"
                }}
              >
                Role
              </label>

              <input
                type="text"
                value={userRole}
                readOnly
                style={{
                  width: "100%",
                  padding: "12px",
                  border:
                    "1px solid #ddd",
                  borderRadius: "8px",
                  boxSizing:
                    "border-box",
                  background:
                    "#f5f5f5"
                }}
              />

            </div>

          </div>

        </div>


        {/* ======================================
            NOTIFICATION SETTINGS
        ====================================== */}

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "12px",
            marginBottom: "20px",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.08)"
          }}
        >

          <h2>
            🔔 Notification Settings
          </h2>


          {/* Enable Notifications */}
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              padding: "15px 0",
              borderBottom:
                "1px solid #eee"
            }}
          >

            <div>

              <strong>
                Enable Notifications
              </strong>

              <p
                style={{
                  margin:
                    "5px 0 0",
                  color: "#777"
                }}
              >
                Receive medicine expiry
                and stock alerts.
              </p>

            </div>

            <input
              type="checkbox"
              checked={
                notificationsEnabled
              }
              onChange={(e) =>
                setNotificationsEnabled(
                  e.target.checked
                )
              }
              style={{
                width: "20px",
                height: "20px"
              }}
            />

          </div>


          {/* Email Alerts */}
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              padding: "15px 0"
            }}
          >

            <div>

              <strong>
                Email Alerts
              </strong>

              <p
                style={{
                  margin:
                    "5px 0 0",
                  color: "#777"
                }}
              >
                Receive important
                alerts through email.
              </p>

            </div>

            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) =>
                setEmailAlerts(
                  e.target.checked
                )
              }
              style={{
                width: "20px",
                height: "20px"
              }}
            />

          </div>

        </div>


        {/* ======================================
            SYSTEM SETTINGS
        ====================================== */}

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "12px",
            marginBottom: "20px",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.08)"
          }}
        >

          <h2>
            ⚙️ System Settings
          </h2>


          {/* Auto Refresh */}
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              padding: "15px 0",
              borderBottom:
                "1px solid #eee"
            }}
          >

            <div>

              <strong>
                Auto Refresh
              </strong>

              <p
                style={{
                  margin:
                    "5px 0 0",
                  color: "#777"
                }}
              >
                Automatically refresh
                dashboard data.
              </p>

            </div>

            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) =>
                setAutoRefresh(
                  e.target.checked
                )
              }
              style={{
                width: "20px",
                height: "20px"
              }}
            />

          </div>


          {/* Backend */}
          <div
            style={{
              paddingTop: "20px"
            }}
          >

            <strong>
              Backend API
            </strong>

            <p
              style={{
                color: "#555"
              }}
            >
              http://localhost:8080
            </p>

          </div>


          {/* AI */}
          <div>

            <strong>
              AI Service
            </strong>

            <p
              style={{
                color: "#555"
              }}
            >
              http://127.0.0.1:8001
            </p>

          </div>


          {/* Database */}
          <div>

            <strong>
              Database
            </strong>

            <p
              style={{
                color: "#555"
              }}
            >
              MySQL — medicine_waste
            </p>

          </div>

        </div>


        {/* ======================================
            SECURITY / CHANGE PASSWORD
        ====================================== */}

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "12px",
            marginBottom: "20px",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.08)"
          }}
        >

          <h2>
            🔐 Security
          </h2>

          <p
            style={{
              color: "#666"
            }}
          >
            Change your account password
            securely using BCrypt encryption.
          </p>


          <form
            onSubmit={
              handleChangePassword
            }
            style={{
              maxWidth: "600px",
              marginTop: "20px"
            }}
          >

            {/* Current Password */}
            <div
              style={{
                marginBottom: "15px"
              }}
            >

              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginBottom: "8px"
                }}
              >
                Current Password
              </label>

              <div
                style={{
                  display: "flex",
                  gap: "10px"
                }}
              >

                <input
                  type={
                    showCurrentPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    currentPassword
                  }
                  onChange={(e) =>
                    setCurrentPassword(
                      e.target.value
                    )
                  }
                  placeholder="Enter current password"
                  style={{
                    flex: 1,
                    padding: "12px",
                    border:
                      "1px solid #ddd",
                    borderRadius: "8px"
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowCurrentPassword(
                      !showCurrentPassword
                    )
                  }
                  style={{
                    padding:
                      "10px 18px",
                    border: "none",
                    borderRadius:
                      "8px",
                    cursor: "pointer"
                  }}
                >
                  {showCurrentPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>

            </div>


            {/* New Password */}
            <div
              style={{
                marginBottom: "15px"
              }}
            >

              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginBottom: "8px"
                }}
              >
                New Password
              </label>

              <div
                style={{
                  display: "flex",
                  gap: "10px"
                }}
              >

                <input
                  type={
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(
                      e.target.value
                    )
                  }
                  placeholder="Enter new password"
                  style={{
                    flex: 1,
                    padding: "12px",
                    border:
                      "1px solid #ddd",
                    borderRadius: "8px"
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNewPassword(
                      !showNewPassword
                    )
                  }
                  style={{
                    padding:
                      "10px 18px",
                    border: "none",
                    borderRadius:
                      "8px",
                    cursor: "pointer"
                  }}
                >
                  {showNewPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>

            </div>


            {/* Confirm Password */}
            <div
              style={{
                marginBottom: "15px"
              }}
            >

              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginBottom: "8px"
                }}
              >
                Confirm New Password
              </label>

              <div
                style={{
                  display: "flex",
                  gap: "10px"
                }}
              >

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    confirmPassword
                  }
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="Confirm new password"
                  style={{
                    flex: 1,
                    padding: "12px",
                    border:
                      "1px solid #ddd",
                    borderRadius: "8px"
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  style={{
                    padding:
                      "10px 18px",
                    border: "none",
                    borderRadius:
                      "8px",
                    cursor: "pointer"
                  }}
                >
                  {showConfirmPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>

            </div>


            {/* Error */}
            {passwordError && (
              <div
                style={{
                  background: "#ffe5e5",
                  color: "#b00020",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "15px"
                }}
              >
                ❌ {passwordError}
              </div>
            )}


            {/* Success */}
            {passwordMessage && (
              <div
                style={{
                  background: "#e7f7ed",
                  color: "#187a3d",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "15px"
                }}
              >
                ✅ {passwordMessage}
              </div>
            )}


            {/* Change Password Button */}
            <button
              type="submit"
              disabled={
                changingPassword
              }
              style={{
                background:
                  changingPassword
                    ? "#999"
                    : "#2563eb",
                color: "white",
                border: "none",
                padding:
                  "12px 25px",
                borderRadius: "8px",
                cursor:
                  changingPassword
                    ? "not-allowed"
                    : "pointer",
                fontSize: "15px"
              }}
            >
              {changingPassword
                ? "Changing Password..."
                : "🔐 Change Password"}
            </button>

          </form>

        </div>


        {/* ======================================
            AI CONFIGURATION
        ====================================== */}

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "12px",
            marginBottom: "20px",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.08)"
          }}
        >

          <h2>
            🤖 AI Configuration
          </h2>

          <p>
            AI Algorithm:{" "}
            <strong>
              Logistic Regression
            </strong>
          </p>

          <p>
            Purpose:{" "}
            <strong>
              Medicine Waste Risk Prediction
            </strong>
          </p>

          <p>
            Features used:
            <br />
            Quantity, Price, Days to Expiry,
            Consumed Quantity and Medicine Status
          </p>

        </div>


        {/* ======================================
            ACCOUNT
        ====================================== */}

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "12px",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.08)"
          }}
        >

          <h2>
            🚪 Account
          </h2>

          <button
            onClick={handleLogout}
            style={{
              background:
                "#dc3545",
              color: "white",
              border: "none",
              padding:
                "12px 25px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "15px"
            }}
          >
            Logout
          </button>

        </div>

      </div>

    </div>
  );
}

export default Settings;