import Sidebar from "./Sidebar";

function ExpiryTracking({
  currentPage,
  setCurrentPage,
  medicines
}) {
  const getExpiryStatus = (expiryDate) => {

    const today = new Date();
    const expiry = new Date(expiryDate);

    const difference = expiry - today;

    const daysRemaining =
      Math.ceil(difference / (1000 * 60 * 60 * 24));


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
  const safeMedicines = medicines.filter(
  (medicine) => getExpiryStatus(medicine.expiryDate) === "Safe"
);

  const warningMedicines = medicines.filter(
  (medicine) => getExpiryStatus(medicine.expiryDate) === "Warning"
);

const urgentMedicines = medicines.filter(
  (medicine) => getExpiryStatus(medicine.expiryDate) === "Urgent"
);

const expiredMedicines = medicines.filter(
  (medicine) => getExpiryStatus(medicine.expiryDate) === "Expired"
);

  return (
    <div className="dashboard-layout">

      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <div className="dashboard-content">

        <h1>Expiry Tracking</h1>

        <p>
          Track medicine expiry dates and identify medicines
          that need immediate attention.
        </p>

        {/* Status Cards */}
        <div className="dashboard-cards">

          <div className="dashboard-card">
            <h3>🟢 Safe</h3>
            <h2>{safeMedicines.length}</h2>
            <p>More than 6 months</p>
          </div>

          <div className="dashboard-card">
            <h3>🟡 Warning</h3>
            <h2>{warningMedicines.length}</h2>
            <p>1–6 months remaining</p>
          </div>

          <div className="dashboard-card">
            <h3>🔴 Urgent</h3>
            <h2>{urgentMedicines.length}</h2>
            <p>Less than 30 days</p>
          </div>

          <div className="dashboard-card">
            <h3>⚫ Expired</h3>
            <h2>{expiredMedicines.length}</h2>
            <p>Expiry date crossed</p>
          </div>

        </div>


        {/* Medicine Expiry Table */}
        <div className="inventory-table-box">

          <h2>Medicine Expiry Details</h2>

          <table>

            <thead>
              <tr>
                <th>Medicine</th>
                <th>Batch No.</th>
                <th>Quantity</th>
                <th>Expiry Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {medicines.map((medicine, index) => (

                <tr key={index}>

                  <td>{medicine.name}</td>

                  <td>{medicine.batchNumber}</td>

                  <td>{medicine.quantity}</td>

                  <td>{medicine.expiryDate}</td>

                  <td>

                    <span
                      className={
                        medicine.status === "Safe"
                          ? "status-safe"
                          : medicine.status === "Warning"
                          ? "status-warning"
                          : medicine.status === "Urgent"
                          ? "status-urgent"
                          : "status-expired"
                      }
                    >
                      {getExpiryStatus(medicine.expiryDate)}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default ExpiryTracking;