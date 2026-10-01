import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";

function AIAnalytics({
  currentPage,
  setCurrentPage,
  medicines
}) {

  const [aiStatus, setAiStatus] = useState(null);
  const [predictions, setPredictions] = useState({});
  const [loadingId, setLoadingId] = useState(null);
  const [training, setTraining] = useState(false);

  // Demand forecasting state
  const [demandForecasts, setDemandForecasts] = useState({});
  const [demandLoadingId, setDemandLoadingId] = useState(null);


  // ------------------------------------------------
  // RISKY MEDICINES
  // ------------------------------------------------

  const riskyMedicines = medicines.filter(
    (medicine) =>
      medicine.status === "Urgent" ||
      medicine.status === "Warning"
  );


  // ------------------------------------------------
  // EXPIRED MEDICINES
  // ------------------------------------------------

  const expiredMedicines = medicines.filter(
    (medicine) =>
      medicine.status === "Expired"
  );


  // ------------------------------------------------
  // CURRENT WASTE
  // ------------------------------------------------

  const currentWaste = expiredMedicines.reduce(
    (total, medicine) =>
      total +
      Number(medicine.quantity || 0) *
      Number(medicine.price || 0),
    0
  );


  // ------------------------------------------------
  // AI EXPECTED WASTE QUANTITY
  // ------------------------------------------------

  const expectedWasteQuantity = medicines.reduce(
    (total, medicine) => {

      const prediction =
        predictions[medicine.id];

      if (!prediction?.success) {
        return total;
      }

      const quantity =
        Number(medicine.quantity || 0);

      const probability =
        Number(
          prediction.waste_probability || 0
        );

      const expectedWaste =
        quantity * probability / 100;

      return total + expectedWaste;

    },
    0
  );


  // ------------------------------------------------
  // AI EXPECTED FINANCIAL LOSS
  // ------------------------------------------------

  const expectedFinancialLoss = medicines.reduce(
    (total, medicine) => {

      const prediction =
        predictions[medicine.id];

      if (!prediction?.success) {
        return total;
      }

      const quantity =
        Number(medicine.quantity || 0);

      const price =
        Number(medicine.price || 0);

      const probability =
        Number(
          prediction.waste_probability || 0
        );

      const expectedWaste =
        quantity * probability / 100;

      const expectedLoss =
        expectedWaste * price;

      return total + expectedLoss;

    },
    0
  );


  // ------------------------------------------------
  // DEMAND FORECAST SUMMARY
  // ------------------------------------------------

  const totalExpectedDemand =
    medicines.reduce(
      (total, medicine) => {

        const forecast =
          demandForecasts[medicine.id];

        if (!forecast?.success) {
          return total;
        }

        return total +
          Number(
            forecast.expected_demand || 0
          );

      },
      0
    );


  // ------------------------------------------------
  // TOTAL PURCHASE RECOMMENDATION
  // ------------------------------------------------

  const totalRecommendedPurchase =
    medicines.reduce(
      (total, medicine) => {

        const forecast =
          demandForecasts[medicine.id];

        if (!forecast?.success) {
          return total;
        }

        return total +
          Number(
            forecast.recommended_purchase_quantity || 0
          );

      },
      0
    );


  // ------------------------------------------------
  // LOW STOCK FORECASTS
  // ------------------------------------------------

  const lowStockForecasts =
    medicines.filter((medicine) => {

      const forecast =
        demandForecasts[medicine.id];

      return (
        forecast?.success &&
        forecast.stock_status === "Low Stock"
      );

    }).length;


  // ------------------------------------------------
  // OVERSTOCK FORECASTS
  // ------------------------------------------------

  const overstockForecasts =
    medicines.filter((medicine) => {

      const forecast =
        demandForecasts[medicine.id];

      return (
        forecast?.success &&
        forecast.stock_status === "Overstock"
      );

    }).length;


  // ------------------------------------------------
  // JWT TOKEN
  // ------------------------------------------------

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


  // ------------------------------------------------
  // TRAIN AI MODEL
  // ------------------------------------------------

  const trainAIModel = async () => {

    setTraining(true);

    try {

      const response =
        await axios.post(
          "http://localhost:8080/api/ai/train",
          {},
          getAuthConfig()
        );

      console.log(
        "AI training result:",
        response.data
      );

      setAiStatus({
        ...response.data,
        trained: true
      });

      alert(
        response.data.message ||
        "AI model trained successfully."
      );

    } catch (error) {

      console.error(
        "AI training error:",
        error
      );

      alert(
        error.response?.data?.message ||
        "AI training failed. Please check backend and AI service."
      );

    } finally {

      setTraining(false);

    }

  };


  // ------------------------------------------------
  // AI MODEL STATUS
  // ------------------------------------------------

  useEffect(() => {

    const checkAIStatus = async () => {

      try {

        const response =
          await axios.get(
            "http://localhost:8080/api/ai/status",
            getAuthConfig()
          );

        setAiStatus(response.data);

      } catch (error) {

        console.error(
          "AI status error:",
          error
        );

        setAiStatus({
          trained: false,
          error: true
        });

      }

    };

    checkAIStatus();

  }, []);


  // ------------------------------------------------
  // ACTUAL AI WASTE PREDICTION
  // ------------------------------------------------

  const getAIPrediction =
    async (medicine) => {

      setLoadingId(medicine.id);

      try {

        const response =
          await axios.post(
            `http://localhost:8080/api/ai/predict/${medicine.id}`,
            {},
            getAuthConfig()
          );

        setPredictions(
          (previous) => ({
            ...previous,
            [medicine.id]:
              response.data
          })
        );

      } catch (error) {

        console.error(
          "AI prediction error:",
          error
        );

        setPredictions(
          (previous) => ({
            ...previous,
            [medicine.id]: {
              success: false,
              message:
                error.response?.data?.message ||
                "AI prediction failed. Please check AI service."
            }
          })
        );

      } finally {

        setLoadingId(null);

      }

    };


  // ------------------------------------------------
  // DEMAND FORECAST
  // ------------------------------------------------

  const getDemandForecast =
    async (medicine) => {

      setDemandLoadingId(
        medicine.id
      );

      try {

        const response =
          await axios.post(
            `http://localhost:8080/api/ai/demand-forecast/${medicine.id}`,
            {},
            getAuthConfig()
          );

        setDemandForecasts(
          (previous) => ({
            ...previous,
            [medicine.id]:
              response.data
          })
        );

      } catch (error) {

        console.error(
          "Demand forecast error:",
          error
        );

        setDemandForecasts(
          (previous) => ({
            ...previous,
            [medicine.id]: {
              success: false,
              message:
                error.response?.data?.message ||
                "Demand forecast failed. Please check backend and AI service."
            }
          })
        );

      } finally {

        setDemandLoadingId(
          null
        );

      }

    };


  // ------------------------------------------------
  // RETURN
  // ------------------------------------------------

  return (

    <div className="dashboard-layout">


      {/* ==========================================
          SIDEBAR
      ========================================== */}

      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />


      {/* ==========================================
          MAIN CONTENT
      ========================================== */}

      <div className="dashboard-content">


        <h1>
          🤖 AI Analytics
        </h1>

        <p>
          Analyze medicine expiry risk and forecast
          future demand using the trained AI service
          and actual consumption history.
        </p>


        {/* ==========================================
            AI MODEL STATUS
        ========================================== */}

        <div className="dashboard-card">

          <h2>
            🧠 AI Model Status
          </h2>

          {aiStatus === null ? (

            <p>
              Checking AI model...
            </p>

          ) : aiStatus.error ? (

            <p>
              ❌ AI service is not available.
            </p>

          ) : aiStatus.trained ? (

            <p>
              ✅ AI model is trained and ready
              for prediction.
            </p>

          ) : (

            <p>
              ⚠️ AI model is not trained yet.
            </p>

          )}

          <br />

          <button
            className="save-button"
            onClick={trainAIModel}
            disabled={training}
          >
            {training
              ? "Training AI..."
              : "🧠 Train AI Model"}
          </button>

        </div>


        {/* ==========================================
            AI SUMMARY CARDS
        ========================================== */}

        <div className="dashboard-cards">


          {/* AT RISK */}

          <div className="dashboard-card">

            <h3>
              ⚠️ At Risk
            </h3>

            <h2>
              {riskyMedicines.length}
            </h2>

            <p>
              Medicines needing attention
            </p>

          </div>


          {/* CURRENT WASTE */}

          <div className="dashboard-card">

            <h3>
              🗑️ Current Waste
            </h3>

            <h2>
              ₹{currentWaste.toFixed(2)}
            </h2>

            <p>
              Expired medicine loss
            </p>

          </div>


          {/* EXPECTED WASTE */}

          <div className="dashboard-card">

            <h3>
              📦 Expected Waste
            </h3>

            <h2>
              {expectedWasteQuantity.toFixed(1)}
            </h2>

            <p>
              Units based on AI predictions
            </p>

          </div>


          {/* EXPECTED FINANCIAL LOSS */}

          <div className="dashboard-card">

            <h3>
              💰 Expected Loss
            </h3>

            <h2>
              ₹{expectedFinancialLoss.toFixed(2)}
            </h2>

            <p>
              Estimated future waste loss
            </p>

          </div>


        </div>


        {/* ==========================================
            DEMAND FORECAST SUMMARY
        ========================================== */}

        <div className="dashboard-cards">


          {/* EXPECTED DEMAND */}

          <div className="dashboard-card">

            <h3>
              📊 Expected Demand
            </h3>

            <h2>
              {totalExpectedDemand.toFixed(1)}
            </h2>

            <p>
              Forecast demand for next 30 days
            </p>

          </div>


          {/* PURCHASE RECOMMENDATION */}

          <div className="dashboard-card">

            <h3>
              🛒 Purchase Recommendation
            </h3>

            <h2>
              {totalRecommendedPurchase.toFixed(1)}
            </h2>

            <p>
              Additional units recommended
            </p>

          </div>


          {/* LOW STOCK */}

          <div className="dashboard-card">

            <h3>
              ⚠️ Forecast Low Stock
            </h3>

            <h2>
              {lowStockForecasts}
            </h2>

            <p>
              Medicines needing stock planning
            </p>

          </div>


          {/* OVERSTOCK */}

          <div className="dashboard-card">

            <h3>
              📦 Forecast Overstock
            </h3>

            <h2>
              {overstockForecasts}
            </h2>

            <p>
              Medicines with excess projected stock
            </p>

          </div>


        </div>


        {/* ==========================================
            INVENTORY RISK + FEFO
        ========================================== */}

        <div className="dashboard-cards">


          <div className="dashboard-card">

            <h3>
              📈 Inventory Risk
            </h3>

            <h2>
              {riskyMedicines.length > 0
                ? "Medium"
                : "Low"}
            </h2>

            <p>
              Based on current expiry status
            </p>

          </div>


          <div className="dashboard-card">

            <h3>
              💡 Strategy
            </h3>

            <h2>
              FEFO
            </h2>

            <p>
              Use earliest-expiry batch first
            </p>

          </div>


        </div>


        {/* ==========================================
            AI PREDICTION TABLE
        ========================================== */}

        <div className="inventory-table-box">

          <h2>
            🤖 AI Medicine Waste Prediction
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
                  Expiry
                </th>

                <th>
                  Current Status
                </th>

                <th>
                  AI Prediction
                </th>

                <th>
                  Probability
                </th>

                <th>
                  Expected Waste
                </th>

                <th>
                  Expected Loss
                </th>

                <th>
                  Risk
                </th>

                <th>
                  Days to Expiry
                </th>

                <th>
                  Consumed
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {medicines.length === 0 ? (

                <tr>

                  <td colSpan="13">

                    No medicines available.

                  </td>

                </tr>

              ) : (

                medicines.map(
                  (medicine) => {

                    const prediction =
                      predictions[
                        medicine.id
                      ];


                    // --------------------------------
                    // MEDICINE QUANTITY
                    // --------------------------------

                    const medicineQuantity =
                      Number(
                        medicine.quantity || 0
                      );


                    // --------------------------------
                    // MEDICINE PRICE
                    // --------------------------------

                    const medicinePrice =
                      Number(
                        medicine.price || 0
                      );


                    // --------------------------------
                    // AI PROBABILITY
                    // --------------------------------

                    const probability =
                      Number(
                        prediction?.waste_probability ||
                        0
                      );


                    // --------------------------------
                    // EXPECTED WASTE
                    // --------------------------------

                    const medicineExpectedWaste =
                      prediction?.success
                        ? medicineQuantity *
                          probability /
                          100
                        : 0;


                    // --------------------------------
                    // EXPECTED FINANCIAL LOSS
                    // --------------------------------

                    const medicineExpectedLoss =
                      medicineExpectedWaste *
                      medicinePrice;


                    return (

                      <tr
                        key={medicine.id}
                      >


                        {/* MEDICINE */}

                        <td>
                          {medicine.name}
                        </td>


                        {/* BATCH */}

                        <td>
                          {medicine.batchNumber}
                        </td>


                        {/* QUANTITY */}

                        <td>
                          {medicine.quantity}
                        </td>


                        {/* EXPIRY */}

                        <td>
                          {medicine.expiryDate}
                        </td>


                        {/* CURRENT STATUS */}

                        <td>
                          {medicine.status}
                        </td>


                        {/* AI PREDICTION */}

                        <td>

                          {prediction ? (

                            prediction.success ? (

                              <span>
                                {
                                  prediction.waste_prediction
                                }
                              </span>

                            ) : (

                              <span>
                                {
                                  prediction.message
                                }
                              </span>

                            )

                          ) : (

                            "Not predicted"

                          )}

                        </td>


                        {/* PROBABILITY */}

                        <td>

                          {prediction?.success

                            ? `${prediction.waste_probability}%`

                            : "-"}

                        </td>


                        {/* EXPECTED WASTE */}

                        <td>

                          {prediction?.success

                            ? medicineExpectedWaste.toFixed(1)

                            : "-"}

                        </td>


                        {/* EXPECTED LOSS */}

                        <td>

                          {prediction?.success

                            ? `₹${medicineExpectedLoss.toFixed(2)}`

                            : "-"}

                        </td>


                        {/* RISK */}

                        <td>

                          {prediction?.success ? (

                            <span
                              className={
                                prediction.risk ===
                                "High"
                                  ? "status-expired"
                                  : prediction.risk ===
                                    "Medium"
                                  ? "status-warning"
                                  : "status-safe"
                              }
                            >

                              {
                                prediction.risk
                              }

                            </span>

                          ) : (

                            "-"

                          )}

                        </td>


                        {/* DAYS TO EXPIRY */}

                        <td>

                          {prediction?.success

                            ? prediction.days_to_expiry

                            : "-"}

                        </td>


                        {/* CONSUMED */}

                        <td>

                          {prediction?.success

                            ? prediction.consumed_quantity

                            : "-"}

                        </td>


                        {/* ACTION */}

                        <td>

                          <button
                            className="save-button"
                            onClick={() =>
                              getAIPrediction(
                                medicine
                              )
                            }
                            disabled={
                              loadingId ===
                              medicine.id
                            }
                          >

                            {loadingId ===
                            medicine.id

                              ? "Predicting..."

                              : "🤖 Predict"}

                          </button>


                          <button
                            className="save-button"
                            onClick={() =>
                              getDemandForecast(
                                medicine
                              )
                            }
                            disabled={
                              demandLoadingId ===
                              medicine.id
                            }
                          >

                            {demandLoadingId ===
                            medicine.id

                              ? "Forecasting..."

                              : "📊 Forecast"}

                          </button>

                        </td>


                      </tr>

                    );

                  }

                )

              )}

            </tbody>

          </table>

        </div>


        {/* ==========================================
            DEMAND FORECAST TABLE
        ========================================== */}

        <div className="inventory-table-box">

          <h2>
            📊 AI Demand Forecast & Procurement
            Recommendation
          </h2>

          <p>
            Forecast is calculated from the actual
            consumption history stored in the system
            and is generated for the next 30 days.
          </p>


          <table>

            <thead>

              <tr>

                <th>
                  Medicine
                </th>

                <th>
                  Current Stock
                </th>

                <th>
                  Total Consumed
                </th>

                <th>
                  Avg Consumption
                </th>

                <th>
                  Daily Consumption
                </th>

                <th>
                  Expected Demand
                </th>

                <th>
                  Projected Stock
                </th>

                <th>
                  Stock Status
                </th>

                <th>
                  Purchase Recommendation
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {medicines.length === 0 ? (

                <tr>

                  <td colSpan="10">

                    No medicines available.

                  </td>

                </tr>

              ) : (

                medicines.map(
                  (medicine) => {

                    const forecast =
                      demandForecasts[
                        medicine.id
                      ];


                    return (

                      <tr
                        key={`forecast-${medicine.id}`}
                      >


                        {/* MEDICINE */}

                        <td>
                          {medicine.name}
                        </td>


                        {/* CURRENT STOCK */}

                        <td>
                          {medicine.quantity}
                        </td>


                        {/* TOTAL CONSUMED */}

                        <td>

                          {forecast?.success

                            ? forecast.total_consumed

                            : "-"}

                        </td>


                        {/* AVERAGE CONSUMPTION */}

                        <td>

                          {forecast?.success

                            ? forecast.average_consumption_per_record

                            : "-"}

                        </td>


                        {/* DAILY CONSUMPTION */}

                        <td>

                          {forecast?.success

                            ? forecast.estimated_daily_consumption

                            : "-"}

                        </td>


                        {/* EXPECTED DEMAND */}

                        <td>

                          {forecast?.success

                            ? forecast.expected_demand

                            : "-"}

                        </td>


                        {/* PROJECTED STOCK */}

                        <td>

                          {forecast?.success

                            ? forecast.projected_remaining_stock

                            : "-"}

                        </td>


                        {/* STOCK STATUS */}

                        <td>

                          {forecast?.success ? (

                            <span
                              className={
                                forecast.stock_status ===
                                "Low Stock"

                                  ? "status-expired"

                                  : forecast.stock_status ===
                                    "Overstock"

                                  ? "status-warning"

                                  : "status-safe"
                              }
                            >

                              {
                                forecast.stock_status
                              }

                            </span>

                          ) : (

                            "-"

                          )}

                        </td>


                        {/* PURCHASE RECOMMENDATION */}

                        <td>

                          {forecast?.success

                            ? forecast.recommended_purchase_quantity

                            : "-"}

                        </td>


                        {/* ACTION */}

                        <td>

                          <button
                            className="save-button"
                            onClick={() =>
                              getDemandForecast(
                                medicine
                              )
                            }
                            disabled={
                              demandLoadingId ===
                              medicine.id
                            }
                          >

                            {demandLoadingId ===
                            medicine.id

                              ? "Forecasting..."

                              : "📊 Forecast"}

                          </button>

                        </td>


                      </tr>

                    );

                  }

                )

              )}

            </tbody>

          </table>

        </div>


        {/* ==========================================
            AI RECOMMENDATION
        ========================================== */}

        <div className="medicine-form-box">

          <h2>
            💡 AI Recommendation
          </h2>


          {riskyMedicines.length > 0 ? (

            <p>

              Some medicines are approaching expiry.
              Use the FEFO strategy and prioritize
              medicines with earlier expiry dates.

            </p>

          ) : (

            <p>

              Current inventory shows low expiry risk.
              Continue monitoring medicine expiry dates.

            </p>

          )}

        </div>


      </div>

    </div>
  );

}

export default AIAnalytics;