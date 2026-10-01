import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";

function Reports({
  currentPage,
  setCurrentPage,
  medicines
}) {

  const [wasteRecords, setWasteRecords] = useState([]);
  const [loadingWaste, setLoadingWaste] = useState(true);
  const [wasteError, setWasteError] = useState("");

  // =========================
  // JWT AUTH CONFIG
  // =========================

  const getAuthConfig = () => {

    const token =
      localStorage.getItem("token");

    return {
      headers: {
        Authorization:
          `Bearer ${token}`
      }
    };

  };


  // =========================
  // LOAD WASTE RECORDS
  // =========================

  useEffect(() => {

    const fetchWasteRecords = async () => {

      try {

        setLoadingWaste(true);
        setWasteError("");

        const token =
          localStorage.getItem("token");

        if (!token) {

          setWasteError(
            "Authentication token not found. Please login again."
          );

          return;
        }

        const response =
          await axios.get(
            "http://localhost:8080/api/waste",
            getAuthConfig()
          );

        console.log(
          "Reports Waste Records:",
          response.data
        );

        setWasteRecords(
          Array.isArray(response.data)
            ? response.data
            : []
        );

      } catch (error) {

        console.error(
          "Error fetching waste records:",
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

          if (
            error.response.status === 401
          ) {

            setWasteError(
              "Session expired. Please login again."
            );

          } else if (
            error.response.status === 403
          ) {

            setWasteError(
              "You are not authorized to view waste reports."
            );

          } else {

            setWasteError(
              error.response.data?.message ||
              "Failed to load waste records."
            );

          }

        } else {

          setWasteError(
            "Cannot connect to backend server."
          );

        }

      } finally {

        setLoadingWaste(false);

      }

    };

    fetchWasteRecords();

  }, []);


  // =========================
  // TOTAL MEDICINE BATCHES
  // =========================

  const totalMedicines =
    medicines.length;


  // =========================
  // TOTAL MEDICINE QUANTITY
  // =========================

  const totalQuantity =
    medicines.reduce(
      (total, medicine) => {

        return (
          total +
          Number(
            medicine.quantity || 0
          )
        );

      },
      0
    );


  // =========================
  // EXPIRED MEDICINES
  // =========================

  const expiredMedicines =
    medicines.filter(
      (medicine) =>
        medicine.status === "Expired"
    );


  // =========================
  // NEAR EXPIRY MEDICINES
  // =========================

  const nearExpiryMedicines =
    medicines.filter(
      (medicine) =>
        medicine.status === "Warning" ||
        medicine.status === "Urgent"
    );


  // =========================
  // SAFE MEDICINES
  // =========================

  const safeMedicines =
    medicines.filter(
      (medicine) =>
        medicine.status === "Safe"
    );


  // =========================
  // TOTAL WASTE QUANTITY
  // =========================

  const totalWasteQuantity =
    wasteRecords.reduce(
      (total, record) => {

        return (
          total +
          Number(
            record.quantity || 0
          )
        );

      },
      0
    );


  // =========================
  // TOTAL FINANCIAL LOSS
  // =========================

  const totalWasteLoss =
    wasteRecords.reduce(
      (total, record) => {

        return (
          total +
          Number(
            record.lossAmount || 0
          )
        );

      },
      0
    );


  return (

    <div className="dashboard-layout">

      {/* =========================
          SIDEBAR
      ========================== */}

      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />


      {/* =========================
          MAIN CONTENT
      ========================== */}

      <div className="dashboard-content">

        <h1>
          📊 Medicine Reports
        </h1>

        <p>
          View real-time medicine inventory,
          expiry and waste management reports.
        </p>


        {/* =========================
            SUMMARY CARDS
        ========================== */}

        <div className="dashboard-cards">


          {/* TOTAL MEDICINES */}

          <div className="dashboard-card">

            <h3>
              💊 Total Medicines
            </h3>

            <h2>
              {totalMedicines}
            </h2>

            <p>
              Medicine batches in inventory
            </p>

          </div>


          {/* TOTAL QUANTITY */}

          <div className="dashboard-card">

            <h3>
              📦 Total Quantity
            </h3>

            <h2>
              {totalQuantity}
            </h2>

            <p>
              Current medicine units
            </p>

          </div>


          {/* NEAR EXPIRY */}

          <div className="dashboard-card">

            <h3>
              ⚠️ Near Expiry
            </h3>

            <h2>
              {nearExpiryMedicines.length}
            </h2>

            <p>
              Warning + Urgent medicines
            </p>

          </div>


          {/* WASTE LOSS */}

          <div className="dashboard-card">

            <h3>
              💰 Waste Loss
            </h3>

            <h2>
              ₹{totalWasteLoss.toFixed(2)}
            </h2>

            <p>
              Recorded financial loss
            </p>

          </div>

        </div>


        {/* =========================
            WASTE SUMMARY
        ========================== */}

        <div className="dashboard-cards">


          {/* WASTE RECORDS */}

          <div className="dashboard-card">

            <h3>
              🗑️ Waste Records
            </h3>

            <h2>
              {wasteRecords.length}
            </h2>

            <p>
              Records stored in database
            </p>

          </div>


          {/* WASTE QUANTITY */}

          <div className="dashboard-card">

            <h3>
              ♻️ Waste Quantity
            </h3>

            <h2>
              {totalWasteQuantity}
            </h2>

            <p>
              Units recorded as waste
            </p>

          </div>


          {/* SAFE MEDICINES */}

          <div className="dashboard-card">

            <h3>
              🟢 Safe Medicines
            </h3>

            <h2>
              {safeMedicines.length}
            </h2>

            <p>
              More than 6 months remaining
            </p>

          </div>


          {/* EXPIRED MEDICINES */}

          <div className="dashboard-card">

            <h3>
              ❌ Expired Medicines
            </h3>

            <h2>
              {expiredMedicines.length}
            </h2>

            <p>
              Expired inventory batches
            </p>

          </div>

        </div>


        {/* =========================
            INVENTORY REPORT
        ========================== */}

        <div className="inventory-table-box">

          <h2>
            📋 Inventory Report
          </h2>

          <table>

            <thead>

              <tr>

                <th>
                  Medicine
                </th>

                <th>
                  Batch
                </th>

                <th>
                  Quantity
                </th>

                <th>
                  Expiry Date
                </th>

                <th>
                  Price
                </th>

                <th>
                  Status
                </th>

              </tr>

            </thead>


            <tbody>

              {medicines.length === 0 ? (

                <tr>

                  <td colSpan="6">
                    No medicines available.
                  </td>

                </tr>

              ) : (

                medicines.map(
                  (medicine) => (

                    <tr
                      key={medicine.id}
                    >

                      <td>
                        {medicine.name}
                      </td>

                      <td>
                        {medicine.batchNumber}
                      </td>

                      <td>
                        {medicine.quantity}
                      </td>

                      <td>
                        {medicine.expiryDate}
                      </td>

                      <td>
                        ₹
                        {Number(
                          medicine.price || 0
                        ).toFixed(2)}
                      </td>

                      <td>

                        <span
                          className={
                            medicine.status ===
                            "Safe"
                              ? "status-safe"
                              : medicine.status ===
                                "Warning"
                              ? "status-warning"
                              : medicine.status ===
                                "Urgent"
                              ? "status-urgent"
                              : "status-expired"
                          }
                        >

                          {medicine.status}

                        </span>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>


        {/* =========================
            WASTE REPORT
        ========================== */}

        <div className="inventory-table-box">

          <h2>
            🗑️ Actual Waste Report
          </h2>


          {loadingWaste ? (

            <p>
              Loading waste records...
            </p>

          ) : wasteError ? (

            <div
              style={{
                padding: "15px",
                color: "red",
                background: "#ffeaea",
                borderRadius: "8px"
              }}
            >

              ❌ {wasteError}

            </div>

          ) : wasteRecords.length === 0 ? (

            <p>
              No waste records available
              in database.
            </p>

          ) : (

            <table>

              <thead>

                <tr>

                  <th>
                    Medicine
                  </th>

                  <th>
                    Batch
                  </th>

                  <th>
                    Quantity
                  </th>

                  <th>
                    Loss
                  </th>

                  <th>
                    Reason
                  </th>

                  <th>
                    Disposal Date
                  </th>

                  <th>
                    Responsible Person
                  </th>

                  <th>
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {wasteRecords.map(
                  (record) => (

                    <tr
                      key={record.id}
                    >

                      <td>
                        {record.medicineName}
                      </td>

                      <td>
                        {record.batchNumber}
                      </td>

                      <td>
                        {record.quantity}
                      </td>

                      <td>
                        ₹
                        {Number(
                          record.lossAmount || 0
                        ).toFixed(2)}
                      </td>

                      <td>
                        {record.reason}
                      </td>

                      <td>
                        {record.disposalDate}
                      </td>

                      <td>
                        {record.responsiblePerson}
                      </td>

                      <td>
                        {record.disposalStatus}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          )}

        </div>


        {/* =========================
            REPORT SUMMARY
        ========================== */}

        <div className="medicine-form-box">

          <h2>
            📈 Report Summary
          </h2>


          <p>
            🟢 Safe Medicines:{" "}
            <strong>
              {safeMedicines.length}
            </strong>
          </p>


          <p>
            🟡 Near Expiry Medicines:{" "}
            <strong>
              {nearExpiryMedicines.length}
            </strong>
          </p>


          <p>
            🔴 Expired Medicines:{" "}
            <strong>
              {expiredMedicines.length}
            </strong>
          </p>


          <p>
            🗑️ Total Waste Quantity:{" "}
            <strong>
              {totalWasteQuantity}
            </strong>
          </p>


          <p>
            💰 Actual Financial Loss:{" "}
            <strong>
              ₹{totalWasteLoss.toFixed(2)}
            </strong>
          </p>


          <p>
            📋 Total Waste Records:{" "}
            <strong>
              {wasteRecords.length}
            </strong>
          </p>

        </div>

      </div>

    </div>

  );

}

export default Reports;