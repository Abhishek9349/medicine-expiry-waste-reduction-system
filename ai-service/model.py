import math
from datetime import date


class MedicineWasteModel:

    def __init__(self):

        self.weights = None
        self.bias = 0.0
        self.is_trained = False

        self.feature_names = [
            "quantity",
            "price",
            "days_to_expiry",
            "consumed_quantity",
            "status_encoded"
        ]

        self.status_mapping = {
            "Safe": 0,
            "Warning": 1,
            "Urgent": 2,
            "Expired": 3
        }

    # =========================================================
    # STATUS ENCODING
    # =========================================================

    def encode_status(self, status):

        if status is None:
            return 0

        return self.status_mapping.get(
            str(status),
            0
        )

    # =========================================================
    # SIGMOID
    # =========================================================

    def sigmoid(self, value):

        value = max(
            min(value, 50),
            -50
        )

        return 1.0 / (
            1.0 + math.exp(-value)
        )

    # =========================================================
    # NORMALIZE FEATURES
    # =========================================================

    def normalize_features(self, features):

        quantity = features[0]
        price = features[1]
        days_to_expiry = features[2]
        consumed_quantity = features[3]
        status_encoded = features[4]

        return [

            quantity / 1000.0,

            price / 10000.0,

            days_to_expiry / 365.0,

            consumed_quantity / 1000.0,

            status_encoded / 3.0
        ]

    # =========================================================
    # PREPARE DATA
    # =========================================================

    def prepare_data(
        self,
        medicines,
        waste_records,
        consumption_history=None
    ):

        if not medicines:
            return None, None

        if waste_records is None:
            waste_records = []

        if consumption_history is None:
            consumption_history = []

        # -----------------------------------------------------
        # Find medicines which became waste
        # -----------------------------------------------------

        waste_medicine_ids = set()

        for waste in waste_records:

            medicine_id = waste.get(
                "medicineId"
            )

            if medicine_id is not None:

                waste_medicine_ids.add(
                    medicine_id
                )

        # -----------------------------------------------------
        # Calculate consumption
        # -----------------------------------------------------

        consumption_map = {}

        for history in consumption_history:

            medicine_id = history.get(
                "medicineId"
            )

            consumed_quantity = history.get(
                "consumedQuantity",
                0
            )

            if medicine_id is None:
                continue

            try:

                consumed_quantity = float(
                    consumed_quantity or 0
                )

            except (
                ValueError,
                TypeError
            ):

                consumed_quantity = 0

            if medicine_id not in consumption_map:

                consumption_map[medicine_id] = 0

            consumption_map[medicine_id] += (
                consumed_quantity
            )

        # -----------------------------------------------------
        # Prepare rows
        # -----------------------------------------------------

        rows = []

        today = date.today()

        for medicine in medicines:

            expiry_date_string = medicine.get(
                "expiryDate"
            )

            if not expiry_date_string:
                continue

            try:

                expiry_date = date.fromisoformat(
                    str(expiry_date_string)
                )

            except ValueError:

                continue

            days_to_expiry = (
                expiry_date - today
            ).days

            try:

                quantity = float(
                    medicine.get(
                        "quantity"
                    ) or 0
                )

            except (
                ValueError,
                TypeError
            ):

                quantity = 0

            try:

                price = float(
                    medicine.get(
                        "price"
                    ) or 0
                )

            except (
                ValueError,
                TypeError
            ):

                price = 0

            status = medicine.get(
                "status",
                "Safe"
            )

            medicine_id = medicine.get(
                "id"
            )

            consumed_quantity = (
                consumption_map.get(
                    medicine_id,
                    0
                )
            )

            # -------------------------------------------------
            # Waste label
            # -------------------------------------------------

            waste_label = 1 if (
                medicine_id in waste_medicine_ids
                or status == "Expired"
            ) else 0

            rows.append({

                "quantity":
                    quantity,

                "price":
                    price,

                "days_to_expiry":
                    days_to_expiry,

                "consumed_quantity":
                    consumed_quantity,

                "status":
                    status,

                "waste":
                    waste_label
            })

        if not rows:

            return None, None

        return rows, rows

    # =========================================================
    # TRAIN MODEL
    # =========================================================

    def train(
        self,
        medicines,
        waste_records,
        consumption_history=None
    ):

        rows, _ = self.prepare_data(
            medicines,
            waste_records,
            consumption_history
        )

        if rows is None:

            return {

                "trained":
                    False,

                "message":
                    "No valid medicine data available."
            }

        # -----------------------------------------------------
        # Minimum records
        # -----------------------------------------------------

        if len(rows) < 5:

            return {

                "trained":
                    False,

                "message":
                    "Insufficient historical data. "
                    "At least 5 medicine records are "
                    "required for model training."
            }

        # -----------------------------------------------------
        # Labels
        # -----------------------------------------------------

        labels = [
            row["waste"]
            for row in rows
        ]

        # -----------------------------------------------------
        # Need both classes
        # -----------------------------------------------------

        if len(set(labels)) < 2:

            return {

                "trained":
                    False,

                "message":
                    "Insufficient historical waste variation. "
                    "Both waste and non-waste records are required."
            }

        # -----------------------------------------------------
        # Prepare training features
        # -----------------------------------------------------

        X = []
        y = []

        for row in rows:

            raw_features = [

                row["quantity"],

                row["price"],

                row["days_to_expiry"],

                row["consumed_quantity"],

                self.encode_status(
                    row["status"]
                )
            ]

            normalized = (
                self.normalize_features(
                    raw_features
                )
            )

            X.append(normalized)

            y.append(
                row["waste"]
            )

        # -----------------------------------------------------
        # Initialize weights
        # -----------------------------------------------------

        feature_count = len(
            self.feature_names
        )

        self.weights = [
            0.0
            for _ in range(feature_count)
        ]

        self.bias = 0.0

        # -----------------------------------------------------
        # Logistic Regression Training
        #
        # Gradient Descent
        # -----------------------------------------------------

        learning_rate = 0.05

        epochs = 1000

        for _ in range(epochs):

            weight_gradients = [
                0.0
                for _ in range(feature_count)
            ]

            bias_gradient = 0.0

            for index in range(len(X)):

                prediction = self.sigmoid(

                    self.bias
                    +
                    sum(
                        self.weights[j]
                        * X[index][j]
                        for j in range(
                            feature_count
                        )
                    )
                )

                error = (
                    prediction
                    - y[index]
                )

                for j in range(
                    feature_count
                ):

                    weight_gradients[j] += (
                        error
                        * X[index][j]
                    )

                bias_gradient += error

            # -------------------------------------------------
            # Update weights
            # -------------------------------------------------

            for j in range(
                feature_count
            ):

                self.weights[j] -= (

                    learning_rate
                    *
                    weight_gradients[j]
                    /
                    len(X)
                )

            self.bias -= (

                learning_rate
                *
                bias_gradient
                /
                len(X)
            )

        self.is_trained = True

        # -----------------------------------------------------
        # Training accuracy
        # -----------------------------------------------------

        correct = 0

        for index in range(len(X)):

            probability = self.sigmoid(

                self.bias
                +
                sum(
                    self.weights[j]
                    * X[index][j]
                    for j in range(
                        feature_count
                    )
                )
            )

            predicted = (
                1
                if probability >= 0.5
                else 0
            )

            if predicted == y[index]:

                correct += 1

        accuracy = (
            correct / len(X)
        ) * 100

        return {

            "trained":
                True,

            "records_used":
                len(rows),

            "features":
                self.feature_names,

            "algorithm":
                "Logistic Regression",

            "training_accuracy":
                round(
                    accuracy,
                    2
                ),

            "message":
                "AI model trained successfully."
        }

    # =========================================================
    # PREDICT WASTE
    # =========================================================

    def predict(
        self,
        quantity,
        price,
        days_to_expiry,
        status,
        consumed_quantity=0
    ):

        if not self.is_trained:

            return {

                "success":
                    False,

                "message":
                    "AI model is not trained yet."
            }

        try:

            quantity = float(
                quantity
            )

            price = float(
                price
            )

            days_to_expiry = float(
                days_to_expiry
            )

            consumed_quantity = float(
                consumed_quantity
            )

        except (
            ValueError,
            TypeError
        ):

            return {

                "success":
                    False,

                "message":
                    "Invalid prediction input."
            }

        # -----------------------------------------------------
        # Create features
        # -----------------------------------------------------

        raw_features = [

            quantity,

            price,

            days_to_expiry,

            consumed_quantity,

            self.encode_status(
                status
            )
        ]

        normalized = (
            self.normalize_features(
                raw_features
            )
        )

        # -----------------------------------------------------
        # Calculate probability
        # -----------------------------------------------------

        score = (

            self.bias
            +
            sum(
                self.weights[index]
                * normalized[index]
                for index in range(
                    len(self.weights)
                )
            )
        )

        waste_probability = (
            self.sigmoid(score)
        )

        # -----------------------------------------------------
        # Prediction
        # -----------------------------------------------------

        prediction = (
            1
            if waste_probability >= 0.5
            else 0
        )

        # -----------------------------------------------------
        # Risk level
        # -----------------------------------------------------

        if waste_probability >= 0.70:

            risk = "High"

        elif waste_probability >= 0.40:

            risk = "Medium"

        else:

            risk = "Low"

        # -----------------------------------------------------
        # Final response
        # -----------------------------------------------------

        return {

            "success":
                True,

            "waste_prediction":

                "Likely Waste"
                if prediction == 1
                else "Likely Not Waste",

            "waste_probability":

                round(
                    waste_probability * 100,
                    2
                ),

            "risk":
                risk,

            "consumed_quantity":
                consumed_quantity,

            "days_to_expiry":
                int(days_to_expiry)
        }