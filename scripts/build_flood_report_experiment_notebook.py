import json
from pathlib import Path


OUTPUT = Path("notebooks/LocalExplorerAI_Flood_Report_Weak_Label_Experiment_Colab.ipynb")


def markdown(source):
    return {
        "cell_type": "markdown",
        "metadata": {},
        "source": source.splitlines(keepends=True),
    }


def code(source):
    return {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": source.splitlines(keepends=True),
    }


cells = [
    markdown(
        """# LocalExplorerAI — thử nghiệm weak-label báo cáo ngập

Notebook này chỉ dự đoán **nguồn công khai có ghi một báo cáo ngập cho địa điểm-tháng hay không**. Nhãn 0 nghĩa là không có dòng khớp trong nguồn đã thu thập; không có nghĩa là đã xác minh đường khô ráo.

**Không dùng mô hình này để dự báo ngập thực tế, chọn tuyến an toàn, hoặc đưa vào `models/flood-risk/` / Flood Risk API.** Notebook Flood chính vẫn yêu cầu nhãn ngập/không ngập đã xác minh.
"""
    ),
    markdown(
        """## 1. Đưa CSV lên Google Drive

Đặt `flood_training_weak_labels.csv` vào:

`MyDrive/LocalExplorerAI/dataset/experimental/flood_training_weak_labels.csv`

Đây là file riêng trong `data/experimental/`, không phải `data/raw/flood_training.csv`. Notebook không tự tải hoặc tạo dữ liệu thay thế. Nếu không tìm thấy file trên Drive, bạn có thể chọn tải CSV từ máy tính khi được hỏi.

Không cần chạy `pip install` hoặc nâng cấp NumPy/Pandas. Hãy dùng thư viện có sẵn trong Colab; nếu vừa cài gói không tương thích, chọn **Runtime → Restart session** trước.
"""
    ),
    code(
        """from pathlib import Path
import hashlib
import json
import shutil
from datetime import datetime, timezone

import numpy as np
import pandas as pd
import sklearn
from IPython.display import display

try:
    from google.colab import drive, files
    IN_COLAB = True
except ImportError:
    IN_COLAB = False

if IN_COLAB:
    drive.mount('/content/drive')

DATA_PATH = Path('/content/drive/MyDrive/LocalExplorerAI/dataset/experimental/flood_training_weak_labels.csv')
if not DATA_PATH.is_file():
    if IN_COLAB:
        print('Không thấy file trong Drive. Hãy chọn flood_training_weak_labels.csv từ máy tính.')
        uploaded = files.upload()
        if not uploaded:
            raise FileNotFoundError('Bạn chưa tải lên flood_training_weak_labels.csv.')
        uploaded_name = next(iter(uploaded))
        if uploaded_name != 'flood_training_weak_labels.csv':
            raise ValueError(f'Đã chọn {uploaded_name}; hãy chọn flood_training_weak_labels.csv.')
        DATA_PATH = Path('/content') / uploaded_name
    else:
        raise FileNotFoundError(f'Không thấy CSV tại {DATA_PATH}. Hãy đặt đúng đường dẫn hoặc sửa DATA_PATH.')

print('Python packages:', {'pandas': pd.__version__, 'numpy': np.__version__, 'scikit-learn': sklearn.__version__})
print('Input:', DATA_PATH)
"""
    ),
    markdown(
        """## 2. Kiểm tra schema và nhãn

Các cột `audit_*` chỉ dùng để truy vết nguồn, tuyệt đối không đưa vào feature. Nhãn âm vẫn là pseudo-label dựa trên việc không có bản ghi khớp trong nguồn.
"""
    ),
    code(
        """REQUIRED = {
    'sample_id', 'location_year_group_id', 'location_name', 'location_type',
    'administrative_area_key', 'year', 'month', 'target_public_report_present',
    'label_status', 'label_evidence', 'target_definition',
    'case_control_sampling_weight', 'source_dataset_doi'
}

df = pd.read_csv(DATA_PATH, encoding='utf-8-sig')
missing = sorted(REQUIRED - set(df.columns))
if missing:
    raise ValueError(f'Thiếu cột bắt buộc: {missing}')
if 'target_flood' in df.columns or 'verified_no_flood' in set(df['label_status'].astype(str)):
    raise ValueError('File này phải là weak-label riêng, không phải tập verified flood/no-flood.')

df['target_public_report_present'] = pd.to_numeric(df['target_public_report_present'], errors='coerce')
if df['target_public_report_present'].isna().any() or not set(df['target_public_report_present'].unique()).issubset({0, 1}):
    raise ValueError('target_public_report_present chỉ nhận 0 hoặc 1.')
expected_status = df['target_public_report_present'].map({1: 'documented_report', 0: 'pseudo_no_matching_record'})
if not expected_status.equals(df['label_status'].astype(str)):
    raise ValueError('label_status không khớp với target_public_report_present.')
if df['sample_id'].duplicated().any():
    raise ValueError('sample_id bị trùng.')
if df.duplicated(['location_name', 'location_type', 'administrative_area_key', 'year', 'month']).any():
    raise ValueError('Một location-month có nhiều dòng; kiểm tra lại file nguồn.')
if df['target_definition'].isna().any() or not df['target_definition'].astype(str).str.contains('not physical flood status').all():
    raise ValueError('Target definition phải ghi rõ đây không phải nhãn tình trạng ngập thực tế.')

class_counts = df['target_public_report_present'].value_counts().sort_index()
print('Rows:', len(df))
print('Labels (0=pseudo no-record, 1=documented report):')
display(class_counts.rename(index={0: 'pseudo_no_matching_record', 1: 'documented_report'}).to_frame('count'))
print('Unique locations:', df[['location_name', 'location_type', 'administrative_area_key']].drop_duplicates().shape[0])
print('Unique location-year groups:', df['location_year_group_id'].nunique())
"""
    ),
    markdown(
        """## 3. Train/test split theo địa điểm

Giữ toàn bộ tháng của cùng một địa điểm ở cùng một phía để tránh rò rỉ giữa train/test. Dùng các đặc trưng tên địa điểm, loại địa điểm, khu vực, năm và tháng. Đây là đặc trưng cho sự xuất hiện của báo cáo, không phải mưa hay trạng thái đường.
"""
    ),
    code(
        """from sklearn.compose import ColumnTransformer
from sklearn.model_selection import GroupShuffleSplit
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, average_precision_score, balanced_accuracy_score,
    classification_report, f1_score, precision_score, recall_score, roc_auc_score
)

FEATURES = ['location_name', 'location_type', 'administrative_area_key', 'year', 'month']
TARGET = 'target_public_report_present'
df['year'] = pd.to_numeric(df['year'], errors='raise')
df['month'] = pd.to_numeric(df['month'], errors='raise')
weights = pd.to_numeric(df['case_control_sampling_weight'], errors='coerce')
if weights.isna().any() or (weights <= 0).any():
    raise ValueError('case_control_sampling_weight phải là số dương.')

# Hold out entire locations, not individual rows or months.
location_groups = (
    df['location_name'].astype(str) + '|' +
    df['location_type'].astype(str) + '|' +
    df['administrative_area_key'].astype(str)
)
splitter = GroupShuffleSplit(n_splits=50, test_size=0.25, random_state=42)
split = None
for candidate in splitter.split(df, df[TARGET], groups=location_groups):
    train_idx, test_idx = candidate
    if df.iloc[train_idx][TARGET].nunique() == 2 and df.iloc[test_idx][TARGET].nunique() == 2:
        split = (train_idx, test_idx)
        break
if split is None:
    raise ValueError('Không tạo được split theo địa điểm có đủ hai lớp. Không chuyển sang random row split.')

train_idx, test_idx = split
X_train, X_test = df.iloc[train_idx][FEATURES], df.iloc[test_idx][FEATURES]
y_train, y_test = df.iloc[train_idx][TARGET].astype(int), df.iloc[test_idx][TARGET].astype(int)
w_train, w_test = weights.iloc[train_idx], weights.iloc[test_idx]

categorical = ['location_name', 'location_type', 'administrative_area_key']
numeric = ['year', 'month']
preprocess = ColumnTransformer([
    ('categorical', Pipeline([
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('onehot', OneHotEncoder(handle_unknown='ignore')),
    ]), categorical),
    ('numeric', Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('scale', StandardScaler()),
    ]), numeric),
])
model = Pipeline([
    ('features', preprocess),
    ('classifier', LogisticRegression(max_iter=3000, random_state=42)),
])

# The weights undo only the 1:1 negative-month subsampling within eligible
# location-years. They do not correct news/reporting bias or make labels true.
model.fit(X_train, y_train, classifier__sample_weight=w_train)
probabilities = model.predict_proba(X_test)[:, 1]
predictions = (probabilities >= 0.5).astype(int)

metrics_unweighted = {
    'accuracy': float(accuracy_score(y_test, predictions)),
    'balanced_accuracy': float(balanced_accuracy_score(y_test, predictions)),
    'precision': float(precision_score(y_test, predictions, zero_division=0)),
    'recall': float(recall_score(y_test, predictions, zero_division=0)),
    'f1': float(f1_score(y_test, predictions, zero_division=0)),
    'roc_auc': float(roc_auc_score(y_test, probabilities)),
    'average_precision': float(average_precision_score(y_test, probabilities)),
}
metrics_sampling_weighted = {
    'roc_auc': float(roc_auc_score(y_test, probabilities, sample_weight=w_test)),
    'average_precision': float(average_precision_score(y_test, probabilities, sample_weight=w_test)),
}
print('Unweighted metrics on balanced sampled test set:', json.dumps(metrics_unweighted, indent=2))
print('Metrics weighted for negative-month subsampling only:', json.dumps(metrics_sampling_weighted, indent=2))
print('Unweighted classification report:\\n', classification_report(y_test, predictions, zero_division=0))
print('Train/test rows:', len(train_idx), len(test_idx))
print('Train/test locations:', location_groups.iloc[train_idx].nunique(), location_groups.iloc[test_idx].nunique())
"""
    ),
    markdown(
        """## 4. Lưu artifact thử nghiệm

Artifact được lưu vào một thư mục tên riêng trên Drive. Không đổi tên hoặc chép nó vào `models/flood-risk/`: schema, mục tiêu và độ tin cậy không tương thích với Flood Risk API.
"""
    ),
    code(
        """import joblib

ARTIFACT_DIR = Path('/content/drive/MyDrive/LocalExplorerAI/models/flood-report-experiment')
ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
MODEL_PATH = ARTIFACT_DIR / 'report_presence_model.joblib'
METADATA_PATH = ARTIFACT_DIR / 'metadata.json'

joblib.dump(model, MODEL_PATH)
dataset_sha256 = hashlib.sha256(DATA_PATH.read_bytes()).hexdigest()
metadata = {
    'model_type': 'logistic_regression',
    'model_target': TARGET,
    'target_definition': 'Whether the public HCMC flood-report source contains a record for a named location-month.',
    'positive_label': 'documented_report',
    'negative_label': 'pseudo_no_matching_record; actual flood status unknown',
    'source_dataset_doi': '10.23708/8Y16HU',
    'dataset_filename': DATA_PATH.name,
    'dataset_sha256': dataset_sha256,
    'rows': int(len(df)),
    'feature_columns': FEATURES,
    'audit_columns_used_as_features': False,
    'split_strategy': 'GroupShuffleSplit; entire location held out',
    'train_rows': int(len(train_idx)),
    'test_rows': int(len(test_idx)),
    'train_locations': int(location_groups.iloc[train_idx].nunique()),
    'test_locations': int(location_groups.iloc[test_idx].nunique()),
    'metrics_unweighted_sampled_test': metrics_unweighted,
    'metrics_weighted_for_negative_subsampling_only': metrics_sampling_weighted,
    'deployment_eligible': False,
    'safety_note': 'Not a physical flood/no-flood model. Never use to mark a road safe or unsafe or deploy to Flood Risk API.',
    'created_at_utc': datetime.now(timezone.utc).isoformat(),
}
METADATA_PATH.write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding='utf-8')
ARTIFACT_ZIP = Path(shutil.make_archive(str(ARTIFACT_DIR), 'zip', root_dir=ARTIFACT_DIR))
print('Model:', MODEL_PATH)
print('Metadata:', METADATA_PATH)
print('Download package:', ARTIFACT_ZIP)
"""
    ),
    markdown(
        """## 5. Tải package xuống máy

Sau khi training chạy xong, cell này tải ZIP gồm model và metadata về máy. Đây là **artifact nghiên cứu về sự xuất hiện báo cáo**, không phải model flood-risk của dự án.
"""
    ),
    code(
        """if IN_COLAB:
    files.download(str(ARTIFACT_ZIP))
else:
    print('Notebook đang chạy ngoài Colab; package nằm tại', ARTIFACT_ZIP)
"""
    ),
]

notebook = {
    "cells": cells,
    "metadata": {
        "colab": {"name": OUTPUT.name, "provenance": []},
        "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
        "language_info": {"name": "python"},
    },
    "nbformat": 4,
    "nbformat_minor": 5,
}

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_text(json.dumps(notebook, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Created {OUTPUT}")
