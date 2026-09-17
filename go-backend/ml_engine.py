"""Train lightweight ML models for forward-looking KPI estimates.

The Go API sends the cleaned in-memory table to this process as JSON on
stdin.  XGBoost is used when it is installed; scikit-learn's histogram
gradient boosting implementation is a compatible, dependency-light fallback.
No model artifacts or uploaded records are persisted by this module.
"""

from __future__ import annotations

import json
import math
import sys
import warnings
from dataclasses import dataclass
from typing import Any, Iterable


MIN_TIME_POINTS = 10
MIN_CLASSIFICATION_ROWS = 20
MAX_FORECAST_TARGETS = 3
RANDOM_STATE = 42


@dataclass
class ModelFactory:
    family: str
    regressor: Any
    classifier: Any


def _model_factory() -> ModelFactory:
    try:
        from xgboost import XGBClassifier, XGBRegressor

        return ModelFactory(
            family="xgboost",
            regressor=lambda: XGBRegressor(
                n_estimators=160,
                max_depth=3,
                learning_rate=0.05,
                subsample=0.85,
                colsample_bytree=0.85,
                objective="reg:squarederror",
                random_state=RANDOM_STATE,
                n_jobs=1,
            ),
            classifier=lambda: XGBClassifier(
                n_estimators=160,
                max_depth=3,
                learning_rate=0.05,
                subsample=0.85,
                colsample_bytree=0.85,
                objective="binary:logistic",
                eval_metric="logloss",
                random_state=RANDOM_STATE,
                n_jobs=1,
            ),
        )
    except ImportError:
        from sklearn.ensemble import (
            HistGradientBoostingClassifier,
            HistGradientBoostingRegressor,
        )

        return ModelFactory(
            family="hist_gradient_boosting",
            regressor=lambda: HistGradientBoostingRegressor(
                max_iter=80,
                max_depth=3,
                learning_rate=0.05,
                l2_regularization=0.1,
                random_state=RANDOM_STATE,
            ),
            classifier=lambda: HistGradientBoostingClassifier(
                max_iter=80,
                max_depth=3,
                learning_rate=0.05,
                l2_regularization=0.1,
                random_state=RANDOM_STATE,
            ),
        )


def _normalise(name: str) -> str:
    return "".join(ch.lower() for ch in str(name) if ch.isalnum())


def _key(name: str) -> str:
    import re

    value = re.sub(r"([a-z0-9])([A-Z])", r"\1_\2", str(name))
    return re.sub(r"[^a-zA-Z0-9]+", "_", value).strip("_").lower()


def _find_column(columns: Iterable[str], synonyms: Iterable[str]) -> str | None:
    normalised_synonyms = tuple(_normalise(s) for s in synonyms)
    for column in columns:
        candidate = _normalise(column)
        if any(s in candidate for s in normalised_synonyms):
            return str(column)
    return None


def _is_identifier(name: str) -> bool:
    import re

    words = re.sub(r"([a-z])([A-Z])", r"\1 \2", str(name))
    tokens = [token.lower() for token in re.split(r"[^A-Za-z0-9]+", words) if token]
    return any(token in {"id", "no", "num", "number"} for token in tokens)


def _finite(value: float) -> float:
    value = float(value)
    if not math.isfinite(value):
        raise ValueError("model returned a non-finite prediction")
    return value


def _time_features(values: Any, dates: Any) -> tuple[Any, Any]:
    import numpy as np

    rows, targets = [], []
    for i in range(3, len(values)):
        rolling = float(np.mean(values[i - 3 : i]))
        date = dates[i]
        rows.append(
            [
                float(i),
                float(values[i - 1]),
                float(values[i - 2]),
                float(values[i - 3]),
                rolling,
                float(date.month),
                float(date.dayofweek),
            ]
        )
        targets.append(float(values[i]))
    return np.asarray(rows, dtype=float), np.asarray(targets, dtype=float)


def _forecast_numeric_series(
    frame: Any,
    date_column: str,
    target: str,
    factory: ModelFactory,
) -> dict[str, Any] | None:
    import numpy as np
    import pandas as pd
    from sklearn.metrics import mean_absolute_error

    subset = frame[[date_column, target]].copy()
    subset[date_column] = pd.to_datetime(subset[date_column], errors="coerce")
    subset[target] = pd.to_numeric(subset[target], errors="coerce")
    subset = subset.dropna().sort_values(date_column)
    if subset.empty:
        return None

    # Multiple transactions on one date are one KPI observation. For long
    # histories, monthly totals are less noisy and match business reporting.
    date_span = (subset[date_column].max() - subset[date_column].min()).days
    if date_span >= 180:
        subset[date_column] = subset[date_column].dt.to_period("M").dt.to_timestamp()
    series = subset.groupby(date_column, as_index=False)[target].sum().sort_values(date_column)
    if len(series) < MIN_TIME_POINTS:
        return None

    values = series[target].to_numpy(dtype=float)
    dates = pd.DatetimeIndex(series[date_column])
    X, y = _time_features(values, dates)
    if len(y) < 7 or float(np.std(y)) == 0:
        return None

    test_size = max(2, int(math.ceil(len(y) * 0.2)))
    split = len(y) - test_size
    if split < 4:
        return None

    validation_model = factory.regressor()
    validation_model.fit(X[:split], y[:split])
    validation_prediction = validation_model.predict(X[split:])
    mae = _finite(mean_absolute_error(y[split:], validation_prediction))
    scale = float(np.mean(np.abs(y[split:])))
    normalised_mae = mae / scale if scale > 0 else None

    model = factory.regressor()
    model.fit(X, y)
    deltas = dates.to_series().diff().dropna()
    typical_delta = deltas.median() if not deltas.empty else pd.Timedelta(days=1)
    if not isinstance(typical_delta, pd.Timedelta) or typical_delta <= pd.Timedelta(0):
        typical_delta = pd.Timedelta(days=1)
    next_date = dates[-1] + typical_delta
    next_features = np.asarray(
        [[
            float(len(values)),
            float(values[-1]),
            float(values[-2]),
            float(values[-3]),
            float(np.mean(values[-3:])),
            float(next_date.month),
            float(next_date.dayofweek),
        ]],
        dtype=float,
    )
    prediction = _finite(model.predict(next_features)[0])

    result: dict[str, Any] = {
        "value": prediction,
        "target": target,
        "kind": "time_series_forecast",
        "model": factory.family,
        "training_rows": int(len(y)),
        "horizon": "next_period",
        "validation_metric": "mae",
        "validation_score": mae,
    }
    if normalised_mae is not None and math.isfinite(normalised_mae):
        result["validation_normalised_mae"] = float(normalised_mae)
    return result


def _binary_target(values: Any) -> Any:
    import pandas as pd

    truthy = {"1", "true", "yes", "y", "left", "churned", "converted"}
    falsy = {"0", "false", "no", "n", "stayed", "retained", "notconverted"}

    def convert(value: Any) -> float:
        if pd.isna(value):
            return float("nan")
        text = str(value).strip().lower().replace(" ", "")
        if text in truthy:
            return 1.0
        if text in falsy:
            return 0.0
        try:
            number = float(text)
            return number if number in (0.0, 1.0) else float("nan")
        except ValueError:
            return float("nan")

    return values.map(convert)


def _classification_estimate(
    frame: Any,
    target: str,
    factory: ModelFactory,
) -> dict[str, Any] | None:
    import numpy as np
    import pandas as pd
    from sklearn.compose import ColumnTransformer
    from sklearn.impute import SimpleImputer
    from sklearn.metrics import roc_auc_score
    from sklearn.pipeline import Pipeline
    from sklearn.preprocessing import OrdinalEncoder

    y = _binary_target(frame[target])
    valid = y.notna()
    X = frame.loc[valid].drop(columns=[target]).copy()
    y = y.loc[valid].astype(int)
    if (
        len(y) < MIN_CLASSIFICATION_ROWS
        or y.nunique() != 2
        or int(y.value_counts().min()) < 2
    ):
        return None

    # Date strings become stable numeric calendar features instead of very
    # high-cardinality categories. Identifier columns are leakage/noise.
    for column in list(X.columns):
        if _is_identifier(column):
            X = X.drop(columns=[column])
            continue
        if "date" in str(column).lower():
            parsed = pd.to_datetime(X[column], errors="coerce")
            if parsed.notna().mean() >= 0.8:
                X[f"{column}__year"] = parsed.dt.year
                X[f"{column}__month"] = parsed.dt.month
                X[f"{column}__dayofweek"] = parsed.dt.dayofweek
                X = X.drop(columns=[column])
    if X.shape[1] == 0:
        return None

    for column in X.columns:
        numeric = pd.to_numeric(X[column], errors="coerce")
        if numeric.notna().mean() >= 0.9:
            X[column] = numeric

    numeric_columns = list(X.select_dtypes(include=[np.number, "bool"]).columns)
    categorical_columns = [c for c in X.columns if c not in numeric_columns]
    transformers = []
    if numeric_columns:
        transformers.append(
            ("numeric", SimpleImputer(strategy="median"), numeric_columns)
        )
    if categorical_columns:
        transformers.append(
            (
                "categorical",
                Pipeline(
                    steps=[
                        ("imputer", SimpleImputer(strategy="most_frequent")),
                        (
                            "encoder",
                            OrdinalEncoder(
                                handle_unknown="use_encoded_value", unknown_value=-1
                            ),
                        ),
                    ]
                ),
                categorical_columns,
            )
        )

    preprocessor = ColumnTransformer(transformers=transformers, sparse_threshold=0)
    split = max(int(len(y) * 0.8), 1)
    if split >= len(y) or y.iloc[:split].nunique() != 2:
        # A deterministic stratified split is safer when chronological data
        # starts with only one class.
        from sklearn.model_selection import train_test_split

        train_idx, test_idx = train_test_split(
            np.arange(len(y)),
            test_size=0.2,
            random_state=RANDOM_STATE,
            stratify=y,
        )
    else:
        train_idx = np.arange(split)
        test_idx = np.arange(split, len(y))

    validation_model = Pipeline(
        [("preprocess", preprocessor), ("model", factory.classifier())]
    )
    validation_model.fit(X.iloc[train_idx], y.iloc[train_idx])
    heldout_probability = validation_model.predict_proba(X.iloc[test_idx])[:, 1]
    auc = None
    if y.iloc[test_idx].nunique() == 2:
        auc = _finite(roc_auc_score(y.iloc[test_idx], heldout_probability))

    final_model = Pipeline(
        [("preprocess", preprocessor), ("model", factory.classifier())]
    )
    final_model.fit(X, y)
    estimated_rate = _finite(float(np.mean(final_model.predict_proba(X)[:, 1])))
    result: dict[str, Any] = {
        "value": estimated_rate,
        "target": target,
        "kind": "classification_rate",
        "model": factory.family,
        "training_rows": int(len(y)),
        "horizon": "current_population",
    }
    if auc is not None:
        result["validation_metric"] = "roc_auc"
        result["validation_score"] = auc
    else:
        result["validation_metric"] = "roc_auc_unavailable_single_class_holdout"
    return result


def analyse(payload: dict[str, Any]) -> dict[str, Any]:
    import pandas as pd

    columns = [str(c) for c in payload.get("columns", [])]
    rows = payload.get("rows", [])
    if not columns or not rows:
        return {
            "status": "skipped",
            "model_family": "none",
            "predictions": {},
            "message": "No records were available for model training.",
        }

    frame = pd.DataFrame(rows, columns=columns)
    factory = _model_factory()
    predictions: dict[str, Any] = {}
    skip_reasons: list[str] = []

    date_column = _find_column(columns, ["date", "timestamp", "time", "period"])
    numeric_candidates: list[str] = []
    preferred = [
        _find_column(columns, ["revenue", "sales", "total_sales", "income", "amount"]),
        _find_column(columns, ["profit", "net_profit"]),
    ]
    for column in preferred + columns:
        if not column or column in numeric_candidates or _is_identifier(column):
            continue
        numeric = pd.to_numeric(frame[column], errors="coerce")
        if numeric.notna().mean() >= 0.9 and numeric.nunique() > 2:
            numeric_candidates.append(column)

    if date_column:
        for target in numeric_candidates[:MAX_FORECAST_TARGETS]:
            prediction = _forecast_numeric_series(frame, date_column, target, factory)
            if prediction:
                predictions[f"predicted_next_{_key(target)}"] = prediction
            else:
                skip_reasons.append(
                    f"{target}: needs at least {MIN_TIME_POINTS} dated observations with variation"
                )
    else:
        skip_reasons.append("time-series forecast: no usable date/period column")

    classification_targets = [
        _find_column(columns, ["employee_left", "attrition", "churned", "left", "terminated"]),
        _find_column(columns, ["converted", "conversion", "is_converted", "purchase"]),
    ]
    seen_targets: set[str] = set()
    for target in classification_targets:
        if not target or target in seen_targets:
            continue
        seen_targets.add(target)
        prediction = _classification_estimate(frame, target, factory)
        if prediction:
            base = "churn" if target == classification_targets[0] else "conversion"
            predictions[f"predicted_{base}_rate"] = prediction
        else:
            skip_reasons.append(
                f"{target}: needs at least {MIN_CLASSIFICATION_ROWS} labeled rows and both classes"
            )

    status = "trained" if predictions else "skipped"
    message = (
        f"Trained {len(predictions)} ML model(s)."
        if predictions
        else "No KPI had enough suitable data for reliable model training."
    )
    if skip_reasons:
        message += " " + "; ".join(skip_reasons) + "."
    return {
        "status": status,
        "model_family": factory.family,
        "predictions": predictions,
        "message": message,
    }


def main() -> None:
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            payload = json.load(sys.stdin)
            result = analyse(payload)
    except ImportError as exc:
        result = {
            "status": "unavailable",
            "model_family": "none",
            "predictions": {},
            "message": f"ML dependencies are not installed: {exc}",
        }
    except Exception as exc:  # Keep upload analysis available if ML fails.
        result = {
            "status": "error",
            "model_family": "none",
            "predictions": {},
            "message": f"ML analysis failed: {exc}",
        }
    json.dump(result, sys.stdout, allow_nan=False)


if __name__ == "__main__":
    main()
