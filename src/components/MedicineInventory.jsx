import Sidebar from "./Sidebar";
import { useEffect, useState } from "react";
import axios from "axios";
import BarcodeScanner from "./BarcodeScanner";

// ==========================================
// EXPIRY STATUS
// ==========================================

const getMedicineStatus = (expiryDate) => {
  const today = new Date();
  const expiry = new Date(expiryDate);

  if (expiry < today) {
    return "Expired";
  }

  const difference = expiry - today;

  const daysLeft = Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );

  if (daysLeft <= 30) {
    return "Urgent";
  }

  if (daysLeft <= 180) {
    return "Warning";
  }

  return "Safe";
};

// ==========================================
// MEDICINE INVENTORY COMPONENT
// ==========================================

function MedicineInventory({
  currentPage,
  setCurrentPage,
  medicines,
  setMedicines
}) {

  // ========================================
  // STATES
  // ========================================

  const [showForm, setShowForm] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [showScanner, setShowScanner] = useState(false);

  const [statusFilter, setStatusFilter] = useState("All");

  const [editingIndex, setEditingIndex] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    genericName: "",
    batch: "",
    barcode: "",
    manufacturer: "",
    category: "",
    supplier: "",
    storageLocation: "",
    quantity: "",
    purchaseDate: "",
    expiryDate: "",
    price: ""
  });
const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};
  // ========================================
  // LOAD MEDICINES
  // ========================================

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/medicines"
      );

      setMedicines(response.data);
    } catch (error) {
      console.error(
        "Error fetching medicines:",
        error
      );

      alert(
        "Backend se medicines load nahi ho paayi."
      );
    }
  };

  // ========================================
  // INPUT CHANGE
  // ========================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ========================================
  // BARCODE / QR SCAN
  // ========================================

  const handleBarcodeScan = (scannedCode) => {

    const code = String(scannedCode)
      .trim()
      .toLowerCase();

    console.log(
      "Scanned Barcode / QR:",
      scannedCode
    );

    // Search medicine by:
    // 1. Medicine Name
    // 2. Generic Name
    // 3. Batch Number
    // 4. Barcode / QR Code

    const foundMedicine = medicines.find(
      (medicine) => {

        const medicineName =
          String(medicine.name || "")
            .toLowerCase();

        const genericName =
          String(medicine.genericName || "")
            .toLowerCase();

        const batchNumber =
          String(medicine.batchNumber || "")
            .toLowerCase();

        const barcode =
          String(medicine.barcode || "")
            .toLowerCase();

        return (
          medicineName.includes(code) ||
          genericName.includes(code) ||
          batchNumber.includes(code) ||
          barcode === code
        );
      }
    );

    // Close scanner
    setShowScanner(false);

    if (foundMedicine) {

      // Search box me medicine ka naam
      setSearchTerm(
        foundMedicine.name
      );

      // Status filter reset
      setStatusFilter("All");

      alert(
        "Medicine Found!\n\n" +
        "Name: " +
        foundMedicine.name +
        "\n" +
        "Batch: " +
        foundMedicine.batchNumber +
        "\n" +
        "Barcode: " +
        (foundMedicine.barcode || "Not available") +
        "\n" +
        "Quantity: " +
        foundMedicine.quantity +
        "\n" +
        "Expiry: " +
        foundMedicine.expiryDate
      );

    } else {

      // Agar medicine nahi mili
      setSearchTerm(scannedCode);

      setStatusFilter("All");

      alert(
        "No medicine found for scanned code:\n" +
        scannedCode
      );
    }
  };

  // ========================================
  // EDIT MEDICINE
  // ========================================

  const handleEdit = (index) => {

    const medicine = medicines[index];

    setFormData({
      name: medicine.name || "",

      genericName:
        medicine.genericName || "",

      batch:
        medicine.batchNumber || "",

      barcode:
        medicine.barcode || "",

      manufacturer:
        medicine.manufacturer || "",

      category:
        medicine.category || "",

      supplier:
        medicine.supplier || "",

      storageLocation:
        medicine.storageLocation || "",

      quantity:
        medicine.quantity || "",

      purchaseDate:
        medicine.purchaseDate || "",

      expiryDate:
        medicine.expiryDate || "",

      price:
        medicine.price || ""
    });

    setEditingIndex(index);

    setShowForm(true);
  };

  // ========================================
  // DELETE MEDICINE
  // ========================================

  const handleDelete = async (index) => {

    const medicine = medicines[index];

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${medicine.name}?`
    );

    if (!confirmDelete) {
      return;
    }

    try {

      const medicineId = medicine.id;

      await axios.delete(
  `http://localhost:8080/api/medicines/${medicineId}`,
  getAuthConfig()
);

      const updatedMedicines =
        medicines.filter(
          (_, medicineIndex) =>
            medicineIndex !== index
        );

      setMedicines(updatedMedicines);

      alert(
        "Medicine deleted successfully!"
      );

    } catch (error) {

      console.error(
        "Error deleting medicine:",
        error
      );

      alert(
        "Medicine delete nahi ho paayi!"
      );
    }
  };

  // ========================================
  // RESET FORM
  // ========================================

  const resetForm = () => {

    setFormData({
      name: "",
      genericName: "",
      batch: "",
      barcode: "",
      manufacturer: "",
      category: "",
      supplier: "",
      storageLocation: "",
      quantity: "",
      purchaseDate: "",
      expiryDate: "",
      price: ""
    });

    setEditingIndex(null);
  };

  // ========================================
  // ADD / UPDATE MEDICINE
  // ========================================

  const handleSave = async (e) => {

    e.preventDefault();

    // Required fields
    if (
      !formData.name ||
      !formData.batch ||
      !formData.quantity ||
      !formData.purchaseDate ||
      !formData.expiryDate ||
      !formData.price
    ) {

      alert(
        "Please fill all required fields!"
      );

      return;
    }

    // ======================================
    // UPDATE EXISTING MEDICINE
    // ======================================

    if (editingIndex !== null) {

      const medicineId =
        medicines[editingIndex].id;

      const updatedMedicine = {

        name: formData.name,

        genericName:
          formData.genericName,

        batchNumber:
          formData.batch,

        barcode:
          formData.barcode,

        manufacturer:
          formData.manufacturer,

        category:
          formData.category,

        supplier:
          formData.supplier,

        storageLocation:
          formData.storageLocation,

        quantity:
          Number(formData.quantity),

        purchaseDate:
          formData.purchaseDate,

        expiryDate:
          formData.expiryDate,

        price:
          Number(formData.price),

        status:
          getMedicineStatus(
            formData.expiryDate
          )
      };

      try {

        const response =
  await axios.put(
    `http://localhost:8080/api/medicines/${medicineId}`,
    updatedMedicine,
    getAuthConfig()
  );

        const updatedMedicines =
          [...medicines];

        updatedMedicines[editingIndex] =
          response.data;

        setMedicines(
          updatedMedicines
        );

        resetForm();

        setShowForm(false);

        alert(
          "Medicine updated successfully!"
        );

      } catch (error) {

        console.error(
          "Error updating medicine:",
          error
        );

        alert(
          "Medicine update nahi ho paayi!"
        );
      }

      return;
    }

    // ======================================
    // ADD NEW MEDICINE
    // ======================================

    const newMedicine = {

      name: formData.name,

      genericName:
        formData.genericName,

      batchNumber:
        formData.batch,

      barcode:
        formData.barcode,

      manufacturer:
        formData.manufacturer,

      category:
        formData.category,

      supplier:
        formData.supplier,

      storageLocation:
        formData.storageLocation,

      quantity:
        Number(formData.quantity),

      purchaseDate:
        formData.purchaseDate,

      expiryDate:
        formData.expiryDate,

      price:
        Number(formData.price),

      status:
        getMedicineStatus(
          formData.expiryDate
        )
    };

    try {

      const response =
  await axios.post(
    "http://localhost:8080/api/medicines",
    newMedicine,
    getAuthConfig()
  );

      setMedicines([
        ...medicines,
        response.data
      ]);

      resetForm();

      setShowForm(false);

      alert(
        "Medicine added successfully!"
      );

    } catch (error) {

      console.error(
        "Error adding medicine:",
        error
      );

      alert(
        "Medicine database me save nahi ho paayi!"
      );
    }
  };

  // ========================================
  // SEARCH + FILTER
  // ========================================

  const filteredMedicines =
    medicines.filter((medicine) => {

      const search =
        searchTerm
          .toLowerCase()
          .trim();

      const medicineName =
        String(medicine.name || "")
          .toLowerCase();

      const genericName =
        String(
          medicine.genericName || ""
        ).toLowerCase();

      const batchNumber =
        String(
          medicine.batchNumber || ""
        ).toLowerCase();

      const barcode =
        String(
          medicine.barcode || ""
        ).toLowerCase();

      const matchesSearch =
        medicineName.includes(search) ||
        genericName.includes(search) ||
        batchNumber.includes(search) ||
        barcode.includes(search);

      const matchesStatus =
        statusFilter === "All" ||
        medicine.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  // ========================================
  // UI
  // ========================================

  return (

    <div className="dashboard-layout">

      {/* SIDEBAR */}

      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      {/* MAIN PAGE */}

      <div className="inventory-page">

        {/* =================================
            HEADER
        ================================= */}

        <div className="inventory-header">

          <div>

            <h1>
              Medicine Inventory
            </h1>

            <p>
              Manage all medicines and
              their expiry information
            </p>

          </div>

          {/* HEADER BUTTONS */}

          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              flexWrap: "wrap"
            }}
          >

            {/* =================================
                BARCODE / QR BUTTON
            ================================= */}

            <button
              type="button"
              onClick={() => {

                console.log(
                  "Opening Barcode Scanner..."
                );

                setShowScanner(true);
              }}
              style={{
                padding: "10px 16px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                background: "#0d6efd",
                color: "white",
                fontWeight: "600",
                fontSize: "14px"
              }}
            >
              📷 Scan Barcode / QR
            </button>

            {/* =================================
                ADD MEDICINE BUTTON
            ================================= */}

            <button
              type="button"
              className="add-medicine-button"
              onClick={() => {

                resetForm();

                setShowForm(true);
              }}
            >
              + Add Medicine
            </button>

          </div>

        </div>

        {/* =================================
            BARCODE / QR SCANNER
        ================================= */}

        {showScanner && (

          <div
            style={{
              width: "100%",
              marginTop: "20px",
              marginBottom: "20px"
            }}
          >

            <BarcodeScanner
              onScanSuccess={
                handleBarcodeScan
              }
              onClose={() =>
                setShowScanner(false)
              }
            />

          </div>

        )}

        {/* =================================
            ADD / EDIT FORM
        ================================= */}

        {showForm && (

          <div
            className="medicine-form-box"
          >

            <h2>

              {editingIndex !== null
                ? "Edit Medicine"
                : "Add New Medicine"}

            </h2>

            <form
              onSubmit={handleSave}
            >

              {/* MEDICINE NAME */}

              <input
                type="text"
                name="name"
                placeholder="Medicine Name"
                value={formData.name}
                onChange={handleChange}
              />

              {/* GENERIC NAME */}

              <input
                type="text"
                name="genericName"
                placeholder="Generic Name"
                value={
                  formData.genericName
                }
                onChange={handleChange}
              />

              {/* MANUFACTURER */}

              <input
                type="text"
                name="manufacturer"
                placeholder="Manufacturer"
                value={
                  formData.manufacturer
                }
                onChange={handleChange}
              />

              {/* CATEGORY */}

              <input
                type="text"
                name="category"
                placeholder="Category"
                value={
                  formData.category
                }
                onChange={handleChange}
              />

              {/* SUPPLIER */}

              <input
                type="text"
                name="supplier"
                placeholder="Supplier"
                value={
                  formData.supplier
                }
                onChange={handleChange}
              />

              {/* STORAGE LOCATION */}

              <input
                type="text"
                name="storageLocation"
                placeholder="Storage Location"
                value={
                  formData.storageLocation
                }
                onChange={handleChange}
              />

              {/* BATCH NUMBER */}

              <input
                type="text"
                name="batch"
                placeholder="Batch Number"
                value={formData.batch}
                onChange={handleChange}
              />

              {/* BARCODE / QR CODE */}

              <input
                type="text"
                name="barcode"
                placeholder="Barcode / QR Code"
                value={formData.barcode}
                onChange={handleChange}
              />

              {/* QUANTITY */}

              <input
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={
                  formData.quantity
                }
                onChange={handleChange}
              />

              {/* PURCHASE DATE */}

              <input
                type="date"
                name="purchaseDate"
                value={
                  formData.purchaseDate
                }
                onChange={handleChange}
              />

              {/* EXPIRY DATE */}

              <input
                type="date"
                name="expiryDate"
                value={
                  formData.expiryDate
                }
                onChange={handleChange}
              />

              {/* PRICE */}

              <input
                type="number"
                name="price"
                placeholder="Price"
                value={formData.price}
                onChange={handleChange}
              />

              {/* FORM BUTTONS */}

              <div
                className="form-buttons"
              >

                <button
                  type="submit"
                  className="save-button"
                >
                  {editingIndex !== null
                    ? "Update Medicine"
                    : "Save Medicine"}
                </button>

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {

                    setShowForm(false);

                    resetForm();
                  }}
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>

        )}

        {/* =================================
            SEARCH + FILTER
        ================================= */}

        <div
          className="inventory-filters"
        >

          <input
            type="text"
            placeholder="🔍 Search name, generic name, batch or barcode..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
          >

            <option value="All">
              All Status
            </option>

            <option value="Safe">
              Safe
            </option>

            <option value="Warning">
              Warning
            </option>

            <option value="Urgent">
              Urgent
            </option>

            <option value="Expired">
              Expired
            </option>

          </select>

        </div>

        {/* =================================
            INVENTORY TABLE
        ================================= */}

        <div
          className="inventory-table-box"
        >

          <table>

            <thead>

              <tr>

                <th>
                  Medicine
                </th>

                <th>
                  Batch No.
                </th>

                <th>
                  Barcode
                </th>

                <th>
                  Quantity
                </th>

                <th>
                  Purchase Date
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

                <th>
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredMedicines.length ===
              0 ? (

                <tr>

                  <td
                    colSpan="9"
                    style={{
                      textAlign: "center",
                      padding: "20px"
                    }}
                  >
                    No medicines found.
                  </td>

                </tr>

              ) : (

                filteredMedicines.map(
                  (medicine, index) => (

                    <tr
                      key={
                        medicine.id ||
                        index
                      }
                    >

                      {/* NAME */}

                      <td>
                        {medicine.name}
                      </td>

                      {/* BATCH */}

                      <td>
                        {
                          medicine.batchNumber
                        }
                      </td>

                      {/* BARCODE */}

                      <td>
                        {medicine.barcode || "-"}
                      </td>

                      {/* QUANTITY */}

                      <td>
                        {
                          medicine.quantity
                        }
                      </td>

                      {/* PURCHASE DATE */}

                      <td>
                        {
                          medicine.purchaseDate
                        }
                      </td>

                      {/* EXPIRY DATE */}

                      <td>
                        {
                          medicine.expiryDate
                        }
                      </td>

                      {/* PRICE */}

                      <td>
                        ₹
                        {
                          medicine.price
                        }
                      </td>

                      {/* STATUS */}

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
                          {
                            medicine.status
                          }
                        </span>

                      </td>

                      {/* ACTIONS */}

                      <td>

                        <button
                          type="button"
                          className="edit-button"
                          onClick={() =>
                            handleEdit(
                              index
                            )
                          }
                        >
                          ✏️ Edit
                        </button>

                        <button
                          type="button"
                          className="delete-button"
                          onClick={() =>
                            handleDelete(
                              index
                            )
                          }
                        >
                          🗑️ Delete
                        </button>

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

export default MedicineInventory;