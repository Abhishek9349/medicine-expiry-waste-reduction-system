import { useMemo, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";

function ConsumptionTracking({
  currentPage,
  setCurrentPage,
  medicines,
  setMedicines
}) {

  const [selectedMedicineId, setSelectedMedicineId] = useState("");
  const [consumeQuantity, setConsumeQuantity] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

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

  // =========================
  // FEFO MEDICINES
  // =========================

  const fefoMedicines = useMemo(() => {

    return [...medicines]
      .filter(
        (medicine) =>
          Number(medicine.quantity) > 0 &&
          medicine.status !== "Expired"
      )
      .sort(
        (a, b) =>
          new Date(a.expiryDate) -
          new Date(b.expiryDate)
      );

  }, [medicines]);

  // =========================
  // FEFO RECOMMENDATION
  // =========================

  const recommendedMedicine =
    fefoMedicines.length > 0
      ? fefoMedicines[0]
      : null;

  // =========================
  // SELECTED MEDICINE
  // =========================

  const selectedMedicine =
    medicines.find(
      (medicine) =>
        String(medicine.id) ===
        String(selectedMedicineId)
    );

  // =========================
  // RECORD CONSUMPTION
  // =========================

  const handleConsume = async (e) => {

    e.preventDefault();

    setMessage("");

    if (saving) {
      return;
    }

    // =========================
    // VALIDATE MEDICINE
    // =========================

    if (!selectedMedicine) {

      setMessage(
        "Please select a medicine batch."
      );

      return;
    }

    // =========================
    // VALIDATE QUANTITY
    // =========================

    const quantity =
      Number(consumeQuantity);

    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {

      setMessage(
        "Enter a valid consumption quantity."
      );

      return;
    }

    if (
      quantity >
      Number(selectedMedicine.quantity)
    ) {

      setMessage(
        `Only ${selectedMedicine.quantity} units are available.`
      );

      return;
    }

    // =========================
    // CALCULATE REMAINING
    // =========================

    const remainingQuantity =
      Number(selectedMedicine.quantity) -
      quantity;

    // =========================
    // UPDATED MEDICINE
    // =========================

    const updatedMedicine = {

      name:
        selectedMedicine.name,

      genericName:
        selectedMedicine.genericName || null,

      batchNumber:
        selectedMedicine.batchNumber,

      barcode:
        selectedMedicine.barcode || null,

      manufacturer:
        selectedMedicine.manufacturer || null,

      category:
        selectedMedicine.category || null,

      supplier:
        selectedMedicine.supplier || null,

      storageLocation:
        selectedMedicine.storageLocation || null,

      quantity:
        remainingQuantity,

      purchaseDate:
        selectedMedicine.purchaseDate,

      expiryDate:
        selectedMedicine.expiryDate,

      price:
        Number(selectedMedicine.price) || 0,

      status:
        selectedMedicine.status

    };

    console.log(
      "Updated medicine:",
      updatedMedicine
    );

    setSaving(true);

    try {

      // =========================
      // STEP 1
      // UPDATE MEDICINE QUANTITY
      // =========================

      const medicineResponse =
        await axios.put(
          `http://localhost:8080/api/medicines/${selectedMedicine.id}`,
          updatedMedicine,
          getAuthConfig()
        );

      console.log(
        "Medicine updated:",
        medicineResponse.data
      );

      // =========================
      // STEP 2
      // SAVE CONSUMPTION HISTORY
      // =========================

      const historyResponse =
        await axios.post(
          "http://localhost:8080/api/consumption-history",
          {
            medicineId:
              selectedMedicine.id,

            medicineName:
              selectedMedicine.name,

            batchNumber:
              selectedMedicine.batchNumber,

            consumedQuantity:
              quantity,

            remainingQuantity:
              remainingQuantity
          },
          getAuthConfig()
        );

      console.log(
        "Consumption history saved:",
        historyResponse.data
      );

      // =========================
      // STEP 3
      // UPDATE FRONTEND STATE
      // =========================

      const updatedMedicines =
        medicines.map(
          (medicine) =>
            medicine.id ===
            selectedMedicine.id
              ? medicineResponse.data
              : medicine
        );

      setMedicines(
        updatedMedicines
      );

      // =========================
      // RESET FORM
      // =========================

      setConsumeQuantity("");

      setSelectedMedicineId("");

      // =========================
      // SUCCESS MESSAGE
      // =========================

      setMessage(
        `Successfully consumed ${quantity} units of ${selectedMedicine.name}. Remaining quantity: ${remainingQuantity}`
      );

    } catch (error) {

      console.error(
        "Consumption save error:",
        error.response?.data ||
        error
      );

      // =========================
      // REAL BACKEND ERROR
      // =========================

      const status =
        error.response?.status;

      const backendMessage =
        error.response?.data?.message;

      if (status === 401) {

        setMessage(
          "Session expired. Please login again."
        );

      } else if (status === 403) {

        setMessage(
          "You do not have permission to record consumption."
        );

      } else {

        setMessage(
          backendMessage ||
          `Consumption save failed. Status: ${
            status || "Unknown"
          }`
        );

      }

    } finally {

      setSaving(false);

    }

  };

  // =========================
  // UI
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
          Consumption Tracking
        </h1>

        <p>
          Track medicine consumption and use the
          FEFO method to reduce expiry waste.
        </p>

        {/* =========================
            FEFO RECOMMENDATION
        ========================= */}

        <div className="dashboard-card">

          <h2>
            🔄 FEFO Recommendation
          </h2>

          {recommendedMedicine ? (

            <>

              <h3>
                Use This Batch First
              </h3>

              <p>

                <strong>
                  Medicine:
                </strong>{" "}

                {recommendedMedicine.name}

              </p>

              <p>

                <strong>
                  Batch:
                </strong>{" "}

                {recommendedMedicine.batchNumber}

              </p>

              <p>

                <strong>
                  Available Quantity:
                </strong>{" "}

                {recommendedMedicine.quantity}

              </p>

              <p>

                <strong>
                  Expiry Date:
                </strong>{" "}

                {recommendedMedicine.expiryDate}

              </p>

              <p>

                ℹ️ Reason: This available batch
                has the earliest expiry date.

              </p>

            </>

          ) : (

            <p>

              No available non-expired medicine
              batches for FEFO recommendation.

            </p>

          )}

        </div>

        {/* =========================
            CONSUMPTION FORM
        ========================= */}

        <div className="medicine-form-box">

          <h2>
            📦 Record Consumption
          </h2>

          <form
            onSubmit={handleConsume}
          >

            <label>
              Select Medicine Batch
            </label>

            <select
              value={selectedMedicineId}
              onChange={(e) =>
                setSelectedMedicineId(
                  e.target.value
                )
              }
              disabled={saving}
            >

              <option value="">
                Select batch
              </option>

              {fefoMedicines.map(
                (medicine) => (

                  <option
                    key={medicine.id}
                    value={medicine.id}
                  >

                    {medicine.name}

                    {" | Batch: "}

                    {medicine.batchNumber}

                    {" | Qty: "}

                    {medicine.quantity}

                    {" | Expiry: "}

                    {medicine.expiryDate}

                  </option>

                )
              )}

            </select>

            {selectedMedicine && (

              <div>

                <p>

                  Available:
                  {" "}

                  <strong>
                    {selectedMedicine.quantity}
                  </strong>

                  {" units"}

                </p>

                <p>

                  Expiry:
                  {" "}

                  <strong>
                    {selectedMedicine.expiryDate}
                  </strong>

                </p>

              </div>

            )}

            <label>
              Consumed Quantity
            </label>

            <input
              type="number"
              min="1"
              max={
                selectedMedicine
                  ? selectedMedicine.quantity
                  : undefined
              }
              value={consumeQuantity}
              onChange={(e) =>
                setConsumeQuantity(
                  e.target.value
                )
              }
              placeholder="Enter consumed quantity"
              disabled={saving}
            />

            <div className="form-buttons">

              <button
                type="submit"
                className="save-button"
                disabled={saving}
              >

                {saving
                  ? "Saving..."
                  : "Record Consumption"}

              </button>

            </div>

          </form>

          {message && (

            <p
              style={{
                marginTop: "15px"
              }}
            >

              {message}

            </p>

          )}

        </div>

        {/* =========================
            ALL BATCHES
        ========================= */}

        <div className="inventory-table-box">

          <h2>
            Medicine Batches
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
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {medicines.length === 0 ? (

                <tr>

                  <td colSpan="5">

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
                        {medicine.status}
                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );
}

export default ConsumptionTracking;