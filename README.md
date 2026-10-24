# 🌊 Floodora — Smart Drainage Monitoring & Flood Risk Awareness

**An AI-assisted platform for drainage risk assessment and urban flood-inundation awareness.**

Floodora aims to make flood-risk awareness more proactive by combining drainage risk assessment, scenario simulation, and machine learning. The project explores how data-driven insights can help identify potentially hazardous conditions and support better-informed decisions.

> **Current status:** The rule-based drainage risk engine, scenario simulator, and standalone flood-inundation ML training pipeline have been implemented. Backend integration of the ML model and live sensor integration are still pending.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Our Approach](#-our-approach)
- [Key Features](#-key-features)
- [System Architecture](#️-system-architecture)
- [AI/ML Pipeline](#-aiml-pipeline)
- [Dataset](#-dataset)
- [Model Evaluation](#-model-evaluation)
- [Technology Stack](#️-technology-stack)
- [Project Structure](#-project-structure)
- [Installation and Setup](#-installation-and-setup)
- [Running the Project](#️-running-the-project)
- [Current Limitations](#️-current-limitations)
- [Roadmap](#️-roadmap)
- [Team Contributions](#-team-contributions)
- [References and Attribution](#-references-and-attribution)
- [License](#-license)

---

## 🌍 Overview

Urban flooding can disrupt transportation, damage infrastructure, and put communities at risk. Drainage blockages, rising water levels, heavy rainfall, and reduced water flow can contribute to hazardous conditions.

**Floodora** is being developed as a smart drainage monitoring and flood-risk awareness platform. It combines a rule-based drainage risk engine with a separate machine-learning component trained to classify urban flood-inundation labels derived from a research dataset.

The project currently contains two distinct analytical components:

1. **Drainage Risk Engine:** Calculates a risk score from drainage-related input parameters.
2. **Flood-Inundation ML Model:** Uses satellite, terrain, and rainfall features to classify research-derived inundation labels.

These components are developed separately and are not yet integrated into a unified backend workflow.

## 🎯 Problem Statement

Traditional drainage monitoring may depend on manual inspection or isolated observations. Without a structured way to assess changing conditions, identifying potentially hazardous situations can be difficult.

Floodora explores a data-driven approach to:

- Assess drainage conditions using multiple risk factors.
- Compare baseline conditions with hypothetical scenarios.
- Investigate satellite-based features associated with urban flood inundation.
- Provide interpretable risk assessments and model evaluation results.
- Establish a foundation for future integration with a backend and monitoring interface.

## 💡 Our Approach

Floodora follows a modular development approach.

| Component | Purpose | Status |
|---|---|---|
| Rule-based risk engine | Calculates drainage risk scores and risk levels | Implemented |
| Scenario simulator | Compares baseline and modified conditions | Implemented |
| ML training pipeline | Trains and compares classification models | Implemented |
| Model evaluation | Evaluates the selected model on held-out test data | Implemented |
| Feature-importance analysis | Examines which dataset features influence model predictions | Implemented |
| Backend integration | Connects analytical components through the application backend | In progress |
| Live sensor integration | Uses real-time drainage sensor readings | Planned |
| End-to-end flood forecasting | Validated operational forecasting workflow | Future work |

---

## ✨ Key Features

### 1. Rule-Based Drainage Risk Engine

The drainage risk engine calculates a score from four input factors:

- Water-level fill percentage
- Drain blockage percentage
- Rainfall intensity
- Flow reduction percentage

The current scoring logic uses the following weights:

| Factor | Weight |
|---|---:|
| Water-level fill | 35% |
| Blockage | 25% |
| Rainfall | 20% |
| Flow reduction | 20% |

Rainfall is normalized against a 50 mm/h reference value, with normalization capped at that reference.

The resulting score is classified into four risk levels:

| Risk Score | Risk Level |
|---|---|
| Below 25 | LOW |
| 25 to below 50 | MEDIUM |
| 50 to below 75 | HIGH |
| 75 to 100 | CRITICAL |

The engine also returns component scores, contributing risk factors, and a recommended action.

**Note:** These thresholds and weights are heuristic design choices. They have not been established as universally valid flood-safety thresholds.

### 2. Scenario Simulator

The simulator allows hypothetical changes to conditions such as rainfall and blockage to be compared against baseline readings.

It reports:

- Baseline risk assessment
- Scenario risk assessment
- Change in risk score
- Direction of change

The simulator helps explore how different assumptions affect the rule-based score. It does not simulate full hydrological processes or guarantee future flood outcomes.

### 3. Machine-Learning Classification

Floodora includes a standalone ML pipeline trained on a public urban flood-inundation dataset.

Three models are compared:

- Logistic Regression
- Random Forest Classifier
- Extra Trees Classifier

Random Forest was selected based on validation F1-score, using ROC-AUC as a tie-breaker.

The selected model was subsequently evaluated on the supplied held-out test dataset.

### 4. Feature-Importance Analysis

The training workflow's outputs are supplemented with feature-importance analysis for the selected Random Forest model.

The results help explain which input features the model uses most heavily. Feature importance indicates model reliance, not causal influence.

---

## 🏗️ System Architecture

The current analytical workflow is organized into separate components.

```text
                  FLOODORA
                      |
          +-----------+-----------+
          |                       |
          v                       v
  Drainage Risk Engine     Flood-Inundation ML
          |                       |
  Water Level              Satellite Features
  Blockage                 Terrain Features
  Rainfall                 Rainfall Features
  Flow Reduction                  |
          |                       v
          v                Trained Classifier
  Risk Score                      |
  Risk Level                      v
  Risk Factors             Dataset Label Prediction
          |
          v
   Scenario Simulator
   Baseline vs Scenario
```

The diagram represents the current analytical components, not a completed end-to-end deployment. Backend integration, live data ingestion, and operational forecasting remain future development work.

---

## 🤖 AI/ML Pipeline

The ML pipeline follows these steps:

1. Load the training and test feature files and their corresponding labels.
2. Validate the dataset structure, feature columns, label values, and missing values.
3. Split the supplied training data into training and validation subsets using stratification.
4. Train and compare Logistic Regression, Random Forest, and Extra Trees.
5. Select the best model using validation F1-score, with ROC-AUC as a tie-breaker.
6. Refit the selected model on the full supplied training dataset.
7. Evaluate it on the separate supplied test dataset.
8. Save the trained model artifact and evaluation metrics.
9. Analyze Random Forest feature importance.

### Input Features

The dataset provides 19 features:

`S2_B2`, `S2_B3`, `S2_B4`, `S2_B8`, `S2_B11`, `NDVI`, `NDWI`, `MNDWI`, `NDBI`, `S1_VV`, `S1_VH`, `S1_VV_std`, `S1_VH_std`, `DEM`, `Slope`, `Aspect`, `Precip_cum`, `RNI`, `REM`.

These include satellite spectral bands, derived indices, radar measurements, terrain attributes, and rainfall-related variables.

### Feature Importance

The five highest-ranked features in the current Random Forest model are:

| Feature | Importance |
|---|---:|
| REM | 19.14% |
| S1_VV_std | 10.18% |
| S1_VV | 7.34% |
| Slope | 4.79% |
| S1_VH | 4.76% |

These values are normalized feature-importance scores from the fitted model. The abbreviations should be interpreted using the original dataset documentation.

---

## 📊 Dataset

Floodora's ML component uses a publicly available urban flood-inundation dataset associated with Mumbai Metropolitan Region, India, and the 2019 period.

**Research paper:** Pawar and Phade (2026), *Natural Hazards and Earth System Sciences*.

- [Research paper (DOI)](https://doi.org/10.5194/nhess-26-5119-2026)
- [Dataset (Zenodo DOI)](https://doi.org/10.5281/zenodo.18486214)

### Dataset Summary

| Property | Value |
|---|---:|
| Training samples | 8,400 |
| Test samples | 3,600 |
| Input features | 19 |
| Training class 0 | 4,200 |
| Training class 1 | 4,200 |
| Test class 0 | 1,800 |
| Test class 1 | 1,800 |

The dataset contains research-derived flood-inundation labels and features sourced from satellite observations, terrain data, and rainfall information.

**Important distinction:** This dataset is not a collection of live drain-sensor readings. Its labels do not directly represent drain blockage, drain overflow, or real-time flooding predictions.

### Dataset Setup

Download the dataset from its official Zenodo record, review its README and license, and extract the files so that the following paths exist:

```text
data/
└── raw/
    └── extracted/
        └── Flood_DSS_ML_Data/
            └── data/
                ├── features_train.csv
                ├── features_test.csv
                ├── flood_labels_train.csv
                └── flood_labels_test.csv
```

The `data/` directory is excluded from Git to avoid committing raw dataset files. Each developer running the training pipeline must obtain and extract the dataset locally.

---

## 📈 Model Evaluation

The following results were obtained from the current training run.

### Validation Results

| Model | Accuracy | Precision | Recall | F1-score | ROC-AUC |
|---|---:|---:|---:|---:|---:|
| Logistic Regression | 64.76% | 63.39% | 69.88% | 66.48% | 71.11% |
| Random Forest | **74.17%** | 69.63% | **85.71%** | **76.84%** | **80.79%** |
| Extra Trees | 71.96% | 68.96% | 79.88% | 74.02% | 78.43% |

### Final Held-Out Test Results

| Metric | Result |
|---|---:|
| Accuracy | 71.47% |
| Precision | 67.80% |
| Recall | 81.78% |
| F1-score | 74.14% |
| ROC-AUC | 79.66% |

The final test confusion matrix is:

| Actual / Predicted | Class 0 | Class 1 |
|---|---:|---:|
| Class 0 | 1,101 | 699 |
| Class 1 | 328 | 1,472 |

Here, class `1` represents the positive class as encoded in the supplied dataset and is treated as the flood class in this evaluation.

The model detected 1,472 of the 1,800 positive test samples. However, it also classified 699 class-0 samples as positive.

These metrics describe performance on the supplied dataset only. They do not establish performance on new geographic regions, future rainfall events, live drainage networks, or operational flood warnings.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| Python | Core implementation and ML workflow |
| pandas | Dataset loading and processing |
| scikit-learn | Classification, validation, and evaluation |
| joblib | Saving and loading the trained model |
| Matplotlib | Feature-importance visualization |
| Git and GitHub | Version control and collaboration |

The existing rule-based engine and scenario simulator are implemented in Python.

---

## 📁 Project Structure

```text
Floodora/
├── ai_engine/
│   ├── __init__.py
│   ├── risk_engine.py
│   ├── simulator.py
│   ├── test_risk_engine.py
│   ├── test_simulator.py
│   ├── train_flood_model.py
│   └── models/
│       ├── feature_importance.csv
│       ├── feature_importance.png
│       └── model_metrics.json
├── data/                         # Downloaded dataset; ignored by Git
├── .gitignore
└── README.md
```

The generated `flood_inundation_model.joblib` file is intentionally excluded from Git because it is approximately 45.67 MB. The training script regenerates it locally.

---

## ⚙️ Installation and Setup

### Prerequisites

- Python 3.11 or a compatible Python version
- Git
- PowerShell on Windows, or an equivalent terminal
- The dataset downloaded from the source linked above

### 1. Clone the Repository

```bash
git clone https://github.com/crypticlumen/Floodora.git
cd Floodora
```

### 2. Create a Virtual Environment

**Windows PowerShell:**

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, use an appropriate local execution-policy setting or activate the environment using your preferred terminal.

### 3. Install Dependencies

```bash
python -m pip install --upgrade pip
python -m pip install pandas scikit-learn joblib matplotlib
```

### 4. Download and Extract the Dataset

Follow the [Dataset](#-dataset) instructions and ensure all four CSV files are in the expected directory.

---

## ▶️ Running the Project

### Train and Evaluate the ML Model

From the repository root, run:

```powershell
python -m ai_engine.train_flood_model
```

The script compares the candidate models, selects the best validation model, evaluates it on the supplied test dataset, and generates:

```text
ai_engine/
└── models/
    ├── flood_inundation_model.joblib
    ├── model_metrics.json
    ├── feature_importance.csv
    └── feature_importance.png
```

The model artifact is generated locally and is not committed to Git.

### Generate Feature-Importance Outputs

After training, the feature-importance outputs can be regenerated using:

```powershell
@'
import joblib
import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path

output_dir = Path("ai_engine/models")
artifact = joblib.load(output_dir / "flood_inundation_model.joblib")

model = artifact["model"]
features = artifact["feature_names"]

importance = pd.Series(
    model.feature_importances_,
    index=features,
    name="importance"
).sort_values(ascending=False)

importance.to_csv(output_dir / "feature_importance.csv")

ax = importance.head(10).sort_values().plot(
    kind="barh",
    figsize=(10, 6)
)
ax.set_title("Floodora: Random Forest Feature Importance")
ax.set_xlabel("Importance score")
ax.set_ylabel("Dataset feature")

plt.tight_layout()
plt.savefig(output_dir / "feature_importance.png", dpi=200)
plt.close()

print("Feature-importance outputs saved.")
'@ | python
```

### Run Existing Unit Tests

```powershell
python -m unittest discover -s ai_engine -p "test_*.py" -v
```

This runs the existing tests for the rule-based risk engine and scenario simulator.

---

## ⚠️ Current Limitations

Floodora is a work in progress. The following limitations are important:

- The rule-based drainage risk score uses heuristic weights and thresholds.
- The ML classifier predicts research-derived urban flood-inundation labels rather than drainage-specific outcomes.
- The ML model is not yet integrated into the application backend.
- Live sensor data ingestion has not yet been established.
- The reported metrics do not validate real-world flood forecasting.
- Geographic or temporal overlap between samples, and potential relationships between predictor construction and research labels, require further investigation.
- Independent evaluation on geographically or temporally separate data is needed before drawing conclusions about generalization.
- The generated model file is not included in the Git repository.

Floodora is currently a prototype and should not be used as a replacement for official weather alerts, emergency services, or professional flood-risk assessments.

---

## 🚀 Roadmap

- [x] Implement the rule-based drainage risk engine.
- [x] Implement baseline-versus-scenario simulation.
- [x] Prepare the urban flood-inundation dataset for ML experimentation.
- [x] Train and compare multiple classification models.
- [x] Evaluate the selected model on held-out test data.
- [x] Generate feature-importance outputs.
- [x] Commit and push the ML training pipeline to its feature branch.
- [x] Complete backend development and agree on integration interfaces.
- [x] Integrate the ML component where its inputs and outputs are appropriate.
- [x] Develop and test a consistent prediction interface.
- [ ] Explore live sensor ingestion and data validation.
- [ ] Improve model validation using geographically or temporally independent data.
- [ ] Develop a unified application workflow and monitoring dashboard.
- [ ] Evaluate whether the system can support reliable operational warnings.

---

## 👥 Team Contributions

Floodora is being developed collaboratively.

- **AI/ML and automation:** Rule-based risk assessment, scenario simulation, dataset preparation, model training, evaluation, and feature-importance analysis.
- **Backend development:** Backend implementation and planned integration of the analytical components.
- **Frontend development:** User-interface development and planned connection to backend services.

Responsibilities and integration status may evolve as development progresses.

---

## 📚 References and Attribution

The ML component uses a publicly available research dataset. Please consult the original dataset record for the complete metadata, citation instructions, and applicable license.

**Research paper:**

Pawar and Phade (2026). *Natural Hazards and Earth System Sciences*.

https://doi.org/10.5194/nhess-26-5119-2026

**Dataset:**

https://doi.org/10.5281/zenodo.18486214

The dataset is identified as CC BY 4.0. Verify the license and attribution requirements against the source files before redistributing the data or derived materials.

---

## 📄 License

The Floodora source-code license has not yet been specified in this README. A repository license should be added once the team chooses the appropriate terms.

The dataset and research materials remain subject to their own licensing and attribution requirements.

---

## 🌧️ Building Toward Smarter Flood-Risk Awareness

Floodora is an ongoing effort to explore how drainage risk assessment, scenario analysis, and machine learning can contribute to more informed urban flood-risk awareness.

Our goal is to develop the components responsibly, validate their limitations, and integrate them into a useful system as the project progresses.

**Built as a collaborative hackathon project.**
