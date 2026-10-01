from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime


from model import MedicineWasteModel


app = FastAPI(
    title="MedWaste AI",
    description="AI-based medicine waste risk prediction service",
    version="2.3.0"
)


# =========================================================
# AI MODEL
# =========================================================

ai_model = MedicineWasteModel()


# =========================================================
# TRAINING REQUEST
# =========================================================

class TrainingRequest(BaseModel):

    medicines: List[Dict[str, Any]]

    waste_records: List[Dict[str, Any]] = []

    consumption_history: List[Dict[str, Any]] = []


# =========================================================
# PREDICTION REQUEST
# =========================================================

class PredictionRequest(BaseModel):

    quantity: float

    price: float

    days_to_expiry: int

    status: str

    consumed_quantity: float = 0


# =========================================================
# DEMAND FORECAST REQUEST
# =========================================================

class DemandForecastRequest(BaseModel):

    current_quantity: float

    consumption_history: List[Dict[str, Any]] = []

    forecast_days: int = 30


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():

    return {

        "service": "MedWaste AI",

        "status": "running",

        "version": "2.3.0"
    }


# =========================================================
# TRAIN MODEL
# =========================================================

@app.post("/train")
def train_model(
    request: TrainingRequest
):

    return ai_model.train(

        medicines=request.medicines,

        waste_records=request.waste_records,

        consumption_history=request.consumption_history
    )


# =========================================================
# PREDICT WASTE
# =========================================================

@app.post("/predict")
def predict_waste(
    request: PredictionRequest
):

    return ai_model.predict(

        quantity=request.quantity,

        price=request.price,

        days_to_expiry=request.days_to_expiry,

        status=request.status,

        consumed_quantity=request.consumed_quantity
    )


# =========================================================
# DEMAND FORECAST
# =========================================================

@app.post("/demand-forecast")
def demand_forecast(
    request: DemandForecastRequest
):

    history = request.consumption_history

    current_quantity = request.current_quantity

    forecast_days = request.forecast_days


    # -----------------------------------------------------
    # BASIC VALIDATION
    # -----------------------------------------------------

    if forecast_days <= 0:

        forecast_days = 30


    if current_quantity < 0:

        current_quantity = 0


    # -----------------------------------------------------
    # NO CONSUMPTION HISTORY
    # -----------------------------------------------------

    if len(history) == 0:

        return {

            "success": True,

            "message":
                "No consumption history available.",

            "current_quantity":
                round(current_quantity, 2),

            "total_consumed":
                0,

            "consumption_records":
                0,

            "average_consumption_per_record":
                0,

            "average_daily_consumption":
                0,

            "estimated_daily_consumption":
                0,

            "history_days":
                0,

            "forecast_days":
                forecast_days,

            "expected_demand":
                0,

            "safety_stock":
                0,

            "reorder_level":
                0,

            "required_stock":
                0,

            "projected_remaining_stock":
                round(
                    current_quantity,
                    2
                ),

            "stock_status":
                "No Data",

            "recommended_purchase_quantity":
                0,

            "purchase_recommendation":
                "Insufficient consumption data.",

            "forecast_method":
                "Date-based consumption forecasting",

            "data_quality":
                "Insufficient consumption history"
        }


    # -----------------------------------------------------
    # READ CONSUMPTION DATA
    # -----------------------------------------------------

    total_consumed = 0.0

    valid_records = []

    invalid_date_records = 0


    for record in history:

        # -------------------------------------------------
        # CONSUMED QUANTITY
        # -------------------------------------------------

        quantity = record.get(

            "consumedQuantity",

            0
        )


        if quantity is None:

            quantity = 0


        try:

            quantity = float(
                quantity
            )

        except (
            ValueError,
            TypeError
        ):

            quantity = 0


        total_consumed += quantity


        # -------------------------------------------------
        # CONSUMED DATE
        # -------------------------------------------------

        consumed_at = record.get(

            "consumedAt"
        )


        if consumed_at is None:

            invalid_date_records += 1

            continue


        try:

            date_text = str(
                consumed_at
            ).strip()


            # ---------------------------------------------
            # Remove Z
            # ---------------------------------------------

            if date_text.endswith("Z"):

                date_text = date_text[:-1]


            # ---------------------------------------------
            # Remove timezone offset
            # ---------------------------------------------

            if "+" in date_text[10:]:

                date_text = (
                    date_text.split("+")[0]
                )


            # ---------------------------------------------
            # Convert ISO date
            # ---------------------------------------------

            consumption_date = (
                datetime.fromisoformat(
                    date_text
                )
            )


            valid_records.append({

                "date":
                    consumption_date,

                "quantity":
                    quantity
            })


        except (
            ValueError,
            TypeError
        ):

            invalid_date_records += 1


    # -----------------------------------------------------
    # NO VALID DATES
    # -----------------------------------------------------

    if len(valid_records) == 0:

        return {

            "success": True,

            "message":
                "Consumption history exists, but valid consumedAt dates were not found.",

            "current_quantity":
                round(
                    current_quantity,
                    2
                ),

            "total_consumed":
                round(
                    total_consumed,
                    2
                ),

            "consumption_records":
                len(history),

            "valid_date_records":
                0,

            "invalid_date_records":
                invalid_date_records,

            "average_consumption_per_record":
                round(
                    total_consumed /
                    len(history),
                    2
                ),

            "average_daily_consumption":
                0,

            "estimated_daily_consumption":
                0,

            "history_days":
                0,

            "forecast_days":
                forecast_days,

            "expected_demand":
                0,

            "safety_stock":
                0,

            "reorder_level":
                0,

            "required_stock":
                0,

            "projected_remaining_stock":
                round(
                    current_quantity,
                    2
                ),

            "stock_status":
                "No Date Data",

            "recommended_purchase_quantity":
                0,

            "purchase_recommendation":
                "Valid consumption dates are required.",

            "forecast_method":
                "Date-based consumption forecasting",

            "data_quality":
                "Valid consumedAt dates are required"
        }


    # -----------------------------------------------------
    # SORT BY DATE
    # -----------------------------------------------------

    valid_records.sort(

        key=lambda item:
            item["date"]
    )


    # -----------------------------------------------------
    # FIRST AND LAST DATE
    # -----------------------------------------------------

    first_consumption_date = (

        valid_records[0]["date"]
    )


    last_consumption_date = (

        valid_records[-1]["date"]
    )


    # -----------------------------------------------------
    # HISTORY PERIOD
    # -----------------------------------------------------

    history_days = (

        last_consumption_date -
        first_consumption_date
    ).days


    if history_days <= 0:

        history_days = 1


    # -----------------------------------------------------
    # ACTUAL DAILY CONSUMPTION
    # -----------------------------------------------------

    daily_consumption = (

        total_consumed /
        history_days
    )


    # -----------------------------------------------------
    # FUTURE DEMAND
    # -----------------------------------------------------

    expected_demand = (

        daily_consumption *
        forecast_days
    )


    # -----------------------------------------------------
    # SAFETY STOCK
    #
    # 7 days of average consumption
    # is kept as emergency buffer.
    # -----------------------------------------------------

    safety_stock = (

        daily_consumption *
        7
    )


    # -----------------------------------------------------
    # REORDER LEVEL
    #
    # Forecast demand + safety stock
    # -----------------------------------------------------

    reorder_level = (

        expected_demand +
        safety_stock
    )


    # -----------------------------------------------------
    # REQUIRED STOCK
    # -----------------------------------------------------

    required_stock = (

        reorder_level
    )


    # -----------------------------------------------------
    # PROJECTED REMAINING STOCK
    # -----------------------------------------------------

    projected_remaining_stock = (

        current_quantity -
        expected_demand
    )


    # -----------------------------------------------------
    # PURCHASE QUANTITY
    # -----------------------------------------------------

    if current_quantity < required_stock:

        recommended_purchase_quantity = (

            required_stock -
            current_quantity
        )

    else:

        recommended_purchase_quantity = 0


    # -----------------------------------------------------
    # STOCK STATUS
    # -----------------------------------------------------

    if current_quantity < expected_demand:

        stock_status = "Low Stock"


    elif current_quantity < required_stock:

        stock_status = "Reorder Required"


    elif (
        expected_demand > 0
        and
        current_quantity >
        expected_demand * 3
    ):

        stock_status = "Overstock"


    else:

        stock_status = "Balanced"


    # -----------------------------------------------------
    # PURCHASE RECOMMENDATION
    # -----------------------------------------------------

    if stock_status == "Low Stock":

        purchase_recommendation = (

            "Purchase required immediately."
        )


    elif stock_status == "Reorder Required":

        purchase_recommendation = (

            "Stock is below reorder level. "
            "Purchase recommended."
        )


    elif stock_status == "Overstock":

        purchase_recommendation = (

            "Avoid additional purchase. "
            "Current stock is high."
        )


    else:

        purchase_recommendation = (

            "Current stock is sufficient "
            "for the forecast period."
        )


    # -----------------------------------------------------
    # DATA QUALITY
    # -----------------------------------------------------

    if len(valid_records) >= 5:

        data_quality = "Good"


    elif len(valid_records) >= 2:

        data_quality = "Moderate"


    else:

        data_quality = "Limited"


    # -----------------------------------------------------
    # RETURN FORECAST
    # -----------------------------------------------------

    return {

        "success":
            True,

        "message":
            purchase_recommendation,

        "current_quantity":
            round(
                current_quantity,
                2
            ),

        "total_consumed":
            round(
                total_consumed,
                2
            ),

        "consumption_records":
            len(history),

        "valid_date_records":
            len(valid_records),

        "invalid_date_records":
            invalid_date_records,

        "average_consumption_per_record":
            round(
                total_consumed /
                len(history),
                2
            ),

        "average_daily_consumption":
            round(
                daily_consumption,
                2
            ),

        "estimated_daily_consumption":
            round(
                daily_consumption,
                2
            ),

        "history_days":
            history_days,

        "first_consumption_date":
            first_consumption_date.isoformat(),

        "last_consumption_date":
            last_consumption_date.isoformat(),

        "forecast_days":
            forecast_days,

        "expected_demand":
            round(
                expected_demand,
                2
            ),

        "safety_stock":
            round(
                safety_stock,
                2
            ),

        "reorder_level":
            round(
                reorder_level,
                2
            ),

        "required_stock":
            round(
                required_stock,
                2
            ),

        "projected_remaining_stock":
            round(
                projected_remaining_stock,
                2
            ),

        "stock_status":
            stock_status,

        "recommended_purchase_quantity":
            round(
                recommended_purchase_quantity,
                2
            ),

        "purchase_recommendation":
            purchase_recommendation,

        "forecast_method":
            "Date-based consumption forecasting with safety stock",

        "safety_stock_days":
            7,

        "data_quality":
            data_quality
    }


# =========================================================
# MODEL STATUS
# =========================================================

@app.get("/model-status")
def model_status():

    return {

        "trained":
            ai_model.is_trained,

        "service":
            "MedWaste AI",

        "version":
            "2.3.0"
    }