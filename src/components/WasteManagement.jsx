import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";

function WasteManagement({
  currentPage,
  setCurrentPage,
  medicines
}) {

  const [wasteRecords, setWasteRecords] = useState([]);

  const [selectedMedicine, setSelectedMedicine] = useState(null);

  const [wasteForm, setWasteForm] = useState({
    reason: "",
    disposalDate: "",
    responsiblePerson: ""
  });

  // =========================
  // JWT AUTH CONFIG
  // =========================

  const getAuthConfig = () => {

    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

  };

  const [loadingWaste, setLoadingWaste] = useState(true);

  // =========================
  // LOAD WASTE RECORDS
  // =========================

  useEffect(() => {
    fetchWasteRecords();
  }, []);

  const fetchWasteRecords = async () => {

    try {

      const response = await axios.get(
        "http://localhost:8080/api/waste",
        getAuthConfig()
      );

      setWasteRecords(response.data);

    } catch (error) {

      console.error(
        "Error fetching waste records:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
        `Waste records load failed. Status: ${
          error.response?.status || "Unknown"
        }`
      );

    } finally {

      setLoadingWaste(false);

    }

  };

  // =========================
  // EXPIRY STATUS
  // =========================

  const getExpiryStatus = (expiryDate) => {

    if (!expiryDate) {
      return "Safe";
    }

    const today = new Date();

    const expiry = new Date(expiryDate);

    const difference =
      expiry.getTime() - today.getTime();

    const daysRemaining = Math.ceil(
      difference /
      (1000 * 60 * 60 * 24)
    );

    if (daysRemaining < 0) {
      return "Expired";
    }

    if (daysRemaining <= 30) {
      return "Urgent";
    }

    if (daysRemaining <= 180) {
      return "Warning";
    }

    return "Safe";
  };

  // =========================
  // EXPIRED MEDICINES
  // =========================

  const expiredMedicines = (medicines || []).filter(
    (medicine) => {

      const status =
        getExpiryStatus(
          medicine.expiryDate
        );

      return (
        medicine.status === "Expired" ||
        status === "Expired"
      );

    }
  );

  // =========================
  // SUMMARY
  // =========================

  const totalWasteQuantity =
    expiredMedicines.reduce(
      (total, medicine) =>
        total +
        (Number(medicine.quantity) || 0),
      0
    );

  const totalFinancialLoss =
    expiredMedicines.reduce(
      (total, medicine) =>
        total +
        (
          (Number(medicine.quantity) || 0) *
          (Number(medicine.price) || 0)
        ),
      0
    );

  // =========================
  // FORM CHANGE
  // =========================

  const handleChange = (e) => {

    setWasteForm({
      ...wasteForm,
      [e.target.name]: e.target.value
    });

  };

  // =========================
  // SELECT MEDICINE
  // =========================

  const handleRecordWaste = (medicine) => {

    setSelectedMedicine(medicine);

    setWasteForm({
      reason: "",
      disposalDate: "",
      responsiblePerson: ""
    });

  };

  // =========================
  // SAVE WASTE RECORD
  // =========================

  const handleSaveWaste = async (e) => {

    e.preventDefault();

    if (!selectedMedicine) {

      alert("Please select a medicine!");

      return;

    }

    if (
      !wasteForm.reason ||
      !wasteForm.disposalDate ||
      !wasteForm.responsiblePerson
    ) {

      alert(
        "Please fill all waste details!"
      );

      return;

    }

    const quantity =
      Number(selectedMedicine.quantity) || 0;

    const price =
      Number(selectedMedicine.price) || 0;

    const lossAmount =
      quantity * price;

    // =========================
    // WASTE RECORD DATA
    // =========================

    const wasteRecord = {

      medicineId:
        selectedMedicine.id,

      medicineName:
        selectedMedicine.name,

      batchNumber:
        selectedMedicine.batchNumber,

      quantity:
        quantity,

      lossAmount:
        lossAmount,

      reason:
        wasteForm.reason,

      disposalDate:
        wasteForm.disposalDate,

      responsiblePerson:
        wasteForm.responsiblePerson,

      disposalStatus:
        "Disposed"

    };

    console.log(
      "Sending waste record:",
      wasteRecord
    );

    try {

      const response = await axios.post(
        "http://localhost:8080/api/waste",
        wasteRecord,
        getAuthConfig()
      );

      console.log(
        "Waste record saved:",
        response.data
      );

      // =========================
      // UPDATE UI
      // =========================

      setWasteRecords([
        ...wasteRecords,
        response.data
      ]);

      // =========================
      // CLOSE FORM
      // =========================

      setSelectedMedicine(null);

      // =========================
      // RESET FORM
      // =========================

      setWasteForm({
        reason: "",
        disposalDate: "",
        responsiblePerson: ""
      });

      alert(
        "Waste record saved successfully!"
      );

    } catch (error) {

      console.error(
        "Error saving waste record:",
        error.response?.data || error
      );

      // =========================
      // SHOW REAL BACKEND ERROR
      // =========================

      alert(
        error.response?.data?.message ||
        `Waste save failed. Status: ${
          error.response?.status || "Unknown"
        }`
      );

    }

  };

  // =========================
  // DELETE WASTE RECORD
  // =========================

  const handleDeleteWaste = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this waste record?"
    );

    if (!confirmDelete) {
      return;
    }

    try {

      await axios.delete(
        `http://localhost:8080/api/waste/${id}`,
        getAuthConfig()
      );

      setWasteRecords(
        wasteRecords.filter(
          (record) =>
            record.id !== id
        )
      );

      alert(
        "Waste record deleted successfully!"
      );

    } catch (error) {

      console.error(
        "Error deleting waste record:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
        `Waste record delete failed. Status: ${
          error.response?.status || "Unknown"
        }`
      );

    }

  };

  // =========================
  // RENDER
  // =========================

  return (

    <div className="dashboard-layout">

      {/* SIDEBAR */}

      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      {/* MAIN CONTENT */}

      <div className="dashboard-content">

        <h1>
          Waste Management
        </h1>

        <p>
          Manage expired medicines and track
          medicine disposal and financial loss.
        </p>

        {/* =========================
            SUMMARY CARDS
        ========================= */}

        <div className="dashboard-cards">

          <div className="dashboard-card">

            <h3>
              🗑️ Expired Medicines
            </h3>

            <h2>
              {expiredMedicines.length}
            </h2>

            <p>
              Medicines requiring disposal
            </p>

          </div>

          <div className="dashboard-card">

            <h3>
              📦 Waste Quantity
            </h3>

            <h2>
              {totalWasteQuantity}
            </h2>

            <p>
              Total expired units
            </p>

          </div>

          <div className="dashboard-card">

            <h3>
              💰 Financial Loss
            </h3>

            <h2>
              ₹{totalFinancialLoss.toFixed(2)}
            </h2>

            <p>
              Estimated medicine loss
            </p>

          </div>

          <div className="dashboard-card">

            <h3>
              ♻️ Disposal Records
            </h3>

            <h2>
              {wasteRecords.length}
            </h2>

            <p>
              Completed disposal records
            </p>

          </div>

        </div>

        {/* =========================
            EXPIRED MEDICINE TABLE
        ========================= */}

        <div className="inventory-table-box">

          <h2>
            Expired Medicine
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
                  Financial Loss
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {expiredMedicines.length === 0 ? (

                <tr>

                  <td colSpan="6">

                    No expired medicines found.

                  </td>

                </tr>

              ) : (

                expiredMedicines.map(
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
                        {(
                          Number(
                            medicine.quantity || 0
                          ) *
                          Number(
                            medicine.price || 0
                          )
                        ).toFixed(2)}

                      </td>

                      <td>

                        <button
                          className="edit-button"
                          onClick={() =>
                            handleRecordWaste(
                              medicine
                            )
                          }
                        >
                          ♻️ Record Waste
                        </button>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

        {/* =========================
            WASTE FORM
        ========================= */}

        {selectedMedicine && (

          <div className="medicine-form-box">

            <h2>
              Record Waste —{" "}
              {selectedMedicine.name}
            </h2>

            <p>

              Batch:{" "}
              {selectedMedicine.batchNumber}

              {" | "}

              Quantity:{" "}
              {selectedMedicine.quantity}

            </p>

            <form
              onSubmit={handleSaveWaste}
            >

              {/* REASON */}

              <label>
                Waste Reason
              </label>

              <select
                name="reason"
                value={wasteForm.reason}
                onChange={handleChange}
              >

                <option value="">
                  Select Reason
                </option>

                <option value="Medicine Expired">
                  Medicine Expired
                </option>

                <option value="Damaged">
                  Damaged
                </option>

                <option value="Storage Issue">
                  Storage Issue
                </option>

                <option value="Overstock">
                  Overstock
                </option>

              </select>

              {/* DISPOSAL DATE */}

              <label>
                Disposal Date
              </label>

              <input
                type="date"
                name="disposalDate"
                value={
                  wasteForm.disposalDate
                }
                onChange={handleChange}
              />

              {/* RESPONSIBLE PERSON */}

              <label>
                Responsible Person
              </label>

              <input
                type="text"
                name="responsiblePerson"
                placeholder="Enter responsible person"
                value={
                  wasteForm.responsiblePerson
                }
                onChange={handleChange}
              />

              {/* BUTTONS */}

              <div className="form-buttons">

                <button
                  type="submit"
                  className="save-button"
                >
                  Save Waste Record
                </button>

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() =>
                    setSelectedMedicine(null)
                  }
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>

        )}

        {/* =========================
            WASTE RECORDS
        ========================= */}

        <div className="inventory-table-box">

          <h2>
            Waste Records
          </h2>

          {loadingWaste ? (

            <p>
              Loading waste records...
            </p>

          ) : wasteRecords.length === 0 ? (

            <p>
              No waste records available.
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

                  <th>
                    Action
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

                        <span className="status-safe">
                          {record.disposalStatus}
                        </span>

                      </td>

                      <td>

                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDeleteWaste(
                              record.id
                            )
                          }
                        >
                          🗑️ Delete
                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          )}

        </div>

      </div>

    </div>

  );

}

export default WasteManagement;