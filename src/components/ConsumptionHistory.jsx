import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";

function ConsumptionHistory({
  currentPage,
  setCurrentPage
}) {

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // JWT token configuration
  const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {

    try {

      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      // Login token check
      if (!token) {
        setError(
          "Authentication token not found. Please login again."
        );
        return;
      }

      const response = await axios.get(
        "http://localhost:8080/api/consumption-history",
        getAuthConfig()
      );

      console.log(
        "Consumption History:",
        response.data
      );

      setHistory(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (error) {

      console.error(
        "Error fetching consumption history:",
        error
      );

      if (error.response) {

        console.error(
          "Backend Status:",
          error.response.status
        );

        console.error(
          "Backend Response:",
          error.response.data
        );

        if (error.response.status === 401) {
          setError(
            "Session expired. Please login again."
          );
        } else if (error.response.status === 403) {
          setError(
            "You are not authorized to view consumption history."
          );
        } else {
          setError(
            error.response.data?.message ||
            "Failed to load consumption history."
          );
        }

      } else {

        setError(
          "Cannot connect to backend server."
        );

      }

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="dashboard-layout">

      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <div className="dashboard-content">

        <h1>📜 Consumption History</h1>

        <p>
          View the complete history of medicine consumption
          recorded in the system.
        </p>

        <div className="inventory-table-box">

          <h2>
            💊 Medicine Consumption Records
          </h2>

          {loading ? (

            <p>
              Loading consumption history...
            </p>

          ) : error ? (

            <div
              style={{
                padding: "15px",
                color: "red",
                background: "#ffeaea",
                borderRadius: "8px",
                marginTop: "15px"
              }}
            >
              ❌ {error}

              <br />

              <button
                onClick={fetchHistory}
                style={{
                  marginTop: "10px",
                  padding: "8px 15px",
                  cursor: "pointer"
                }}
              >
                🔄 Retry
              </button>
            </div>

          ) : history.length === 0 ? (

            <p>
              No consumption records available.
            </p>

          ) : (

            <table>

              <thead>

                <tr>
                  <th>Medicine</th>
                  <th>Batch</th>
                  <th>Consumed</th>
                  <th>Remaining</th>
                  <th>Date & Time</th>
                </tr>

              </thead>

              <tbody>

                {history.map((record) => (

                  <tr key={record.id}>

                    <td>
                      {record.medicineName || "-"}
                    </td>

                    <td>
                      {record.batchNumber || "-"}
                    </td>

                    <td>
                      {record.consumedQuantity ?? 0}
                    </td>

                    <td>
                      {record.remainingQuantity ?? 0}
                    </td>

                    <td>
                      {record.consumedAt
                        ? new Date(
                            record.consumedAt
                          ).toLocaleString()
                        : "-"}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          )}

        </div>

      </div>

    </div>
  );
}

export default ConsumptionHistory;