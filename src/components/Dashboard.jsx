import Sidebar from "./Sidebar";

function Dashboard({
  currentPage,
  setCurrentPage,
  handleLogout,
  medicines
}) {

  // =====================================
  // AUTOMATIC EXPIRY STATUS
  // =====================================

  const getExpiryStatus = (expiryDate) => {

    const today = new Date();
    const expiry = new Date(expiryDate);

    const difference = expiry - today;

    const daysRemaining = Math.ceil(
      difference / (1000 * 60 * 60 * 24)
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


  // =====================================
  // REAL DATABASE DATA CALCULATIONS
  // =====================================

  const totalMedicines = medicines.length;


  const nearExpiryMedicines = medicines.filter(
    (medicine) => {

      const status = getExpiryStatus(
        medicine.expiryDate
      );

      return status === "Warning" || status === "Urgent";

    }
  );


  const expiredMedicines = medicines.filter(
    (medicine) =>
      getExpiryStatus(medicine.expiryDate) === "Expired"
  );


  // =====================================
  // REAL FINANCIAL LOSS
  // =====================================

  const financialLoss = expiredMedicines.reduce(
    (total, medicine) => {

      const quantity = Number(medicine.quantity) || 0;

      const price = Number(medicine.price) || 0;

      return total + quantity * price;

    },
    0
  );


  // =====================================
  // TOTAL STOCK QUANTITY
  // =====================================

  const totalQuantity = medicines.reduce(
    (total, medicine) => {

      return total + (Number(medicine.quantity) || 0);

    },
    0
  );


  return (

    <div className="dashboard-layout">

      {/* SIDEBAR */}

      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        handleLogout={handleLogout}
      />


      {/* MAIN CONTENT */}

      <div className="dashboard-content">

        <h1>Medicine Waste Dashboard</h1>

        <p>
          Real-time medicine inventory and expiry monitoring
        </p>


        {/* =====================================
            DASHBOARD CARDS
        ===================================== */}

        <div className="dashboard-cards">


          {/* TOTAL MEDICINES */}

          <div className="dashboard-card">

            <h3>💊 Total Medicines</h3>

            <h2>
              {totalMedicines}
            </h2>

            <p>
              Medicine batches in database
            </p>

          </div>


          {/* NEAR EXPIRY */}

          <div className="dashboard-card">

            <h3>⚠️ Near Expiry</h3>

            <h2>
              {nearExpiryMedicines.length}
            </h2>

            <p>
              Warning + Urgent
            </p>

          </div>


          {/* EXPIRED */}

          <div className="dashboard-card">

            <h3>❌ Expired</h3>

            <h2>
              {expiredMedicines.length}
            </h2>

            <p>
              Expired medicine batches
            </p>

          </div>


          {/* FINANCIAL LOSS */}

          <div className="dashboard-card">

            <h3>💰 Financial Loss</h3>

            <h2>
              ₹{financialLoss.toFixed(2)}
            </h2>

            <p>
              Value of expired stock
            </p>

          </div>

        </div>


        {/* =====================================
            STOCK SUMMARY
        ===================================== */}

        <div className="dashboard-cards">

          <div className="dashboard-card">

            <h3>📦 Total Stock Quantity</h3>

            <h2>
              {totalQuantity}
            </h2>

            <p>
              Units currently recorded
            </p>

          </div>


          <div className="dashboard-card">

            <h3>🟢 Safe Stock</h3>

            <h2>
              {
                medicines.filter(
                  medicine =>
                    getExpiryStatus(
                      medicine.expiryDate
                    ) === "Safe"
                ).length
              }
            </h2>

            <p>
              More than 6 months
            </p>

          </div>


          <div className="dashboard-card">

            <h3>🟡 Warning Stock</h3>

            <h2>
              {
                medicines.filter(
                  medicine =>
                    getExpiryStatus(
                      medicine.expiryDate
                    ) === "Warning"
                ).length
              }
            </h2>

            <p>
              1–6 months remaining
            </p>

          </div>


          <div className="dashboard-card">

            <h3>🔴 Urgent Stock</h3>

            <h2>
              {
                medicines.filter(
                  medicine =>
                    getExpiryStatus(
                      medicine.expiryDate
                    ) === "Urgent"
                ).length
              }
            </h2>

            <p>
              Less than 30 days
            </p>

          </div>

        </div>


        {/* =====================================
            EXPIRING MEDICINES
        ===================================== */}

        <div className="inventory-table-box">

          <h2>
            ⚠️ Medicines Requiring Attention
          </h2>


          <table>

            <thead>

              <tr>

                <th>Medicine</th>

                <th>Batch</th>

                <th>Quantity</th>

                <th>Expiry Date</th>

                <th>Status</th>

              </tr>

            </thead>


            <tbody>

              {nearExpiryMedicines.length === 0 ? (

                <tr>

                  <td colSpan="5">

                    No near-expiry medicines.

                  </td>

                </tr>

              ) : (

                nearExpiryMedicines.map(
                  (medicine) => {

                    const status =
                      getExpiryStatus(
                        medicine.expiryDate
                      );


                    return (

                      <tr key={medicine.id}>

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

                          <span
                            className={
                              status === "Warning"
                                ? "status-warning"
                                : "status-urgent"
                            }
                          >
                            {status}
                          </span>

                        </td>

                      </tr>

                    );

                  }
                )

              )}

            </tbody>

          </table>

        </div>


        {/* =====================================
            EXPIRED MEDICINES
        ===================================== */}

        <div className="inventory-table-box">

          <h2>
            ❌ Expired Medicines
          </h2>


          <table>

            <thead>

              <tr>

                <th>Medicine</th>

                <th>Batch</th>

                <th>Quantity</th>

                <th>Expiry Date</th>

                <th>Loss</th>

              </tr>

            </thead>


            <tbody>

              {expiredMedicines.length === 0 ? (

                <tr>

                  <td colSpan="5">

                    No expired medicines.

                  </td>

                </tr>

              ) : (

                expiredMedicines.map(
                  (medicine) => {

                    const loss =
                      Number(medicine.quantity || 0) *
                      Number(medicine.price || 0);


                    return (

                      <tr key={medicine.id}>

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
                          ₹{loss.toFixed(2)}
                        </td>

                      </tr>

                    );

                  }
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );
}

export default Dashboard;