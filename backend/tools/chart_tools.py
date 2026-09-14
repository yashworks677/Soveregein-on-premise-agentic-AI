import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from pathlib import Path
from typing import Dict, Any, List

# Enterprise Industrial Styling
plt.rcParams['font.sans-serif'] = 'DejaVu Sans'
plt.rcParams['axes.edgecolor'] = '#CBD5E1'
plt.rcParams['axes.linewidth'] = 0.8
plt.rcParams['grid.color'] = '#F1F5F9'
plt.rcParams['grid.linestyle'] = '--'

def generate_sensor_anomaly_chart(analysis: Dict[str, Any], output_path: Path) -> str:
    """
    Generates a publication-quality anomaly detection scatter plot.
    """
    numeric_cols = analysis.get("numeric_columns", [])
    if not numeric_cols:
        return ""

    target_col = numeric_cols[0]
    col_stat = analysis["column_statistics"].get(target_col, {})
    if not col_stat or "mean" not in col_stat:
        return ""

    headers = analysis["headers"]
    c_idx = headers.index(target_col)
    rows = analysis.get("preview_rows", [])

    indices = []
    values = []
    for r_idx, r in enumerate(rows):
        if c_idx < len(r) and isinstance(r[c_idx], (int, float)):
            indices.append(r_idx + 1)
            values.append(r[c_idx])

    if not values:
        return ""

    fig, ax = plt.subplots(figsize=(8, 4.2), dpi=140)
    fig.patch.set_facecolor('#FFFFFF')
    ax.set_facecolor('#F8FAFC')

    mean_val = col_stat["mean"]
    q1 = col_stat.get("q1", mean_val * 0.9)
    q3 = col_stat.get("q3", mean_val * 1.1)
    iqr = col_stat.get("iqr", q3 - q1)
    upper_bound = q3 + 1.5 * iqr
    lower_bound = q1 - 1.5 * iqr

    # Plot base trend
    ax.plot(indices, values, color='#0284C7', linewidth=1.5, marker='o', markersize=4, label=f"{target_col} Telemetry", zorder=2)

    # Plot threshold lines
    ax.axhline(mean_val, color='#10B981', linestyle='--', linewidth=1.2, label=f"Operational Baseline ({mean_val})")
    ax.axhline(upper_bound, color='#EF4444', linestyle=':', linewidth=1.2, label=f"Upper Safety Limit ({round(upper_bound, 1)})")
    ax.axhline(lower_bound, color='#F59E0B', linestyle=':', linewidth=1.2, label=f"Lower Tolerance Limit ({round(lower_bound, 1)})")

    # Highlight anomalies
    anom_points_x = []
    anom_points_y = []
    for idx, val in zip(indices, values):
        if val > upper_bound or val < lower_bound:
            anom_points_x.append(idx)
            anom_points_y.append(val)

    if anom_points_x:
        ax.scatter(anom_points_x, anom_points_y, color='#DC2626', s=70, zorder=5, edgecolors='#7F1D1D', label="Critical Anomaly Deviation")

    ax.set_title(f"Operational Metric Telemetry: {target_col}", fontsize=11, fontweight='bold', color='#0F172A', pad=12)
    ax.set_xlabel("Operational Sequence (Sample Index)", fontsize=9, color='#475569')
    ax.set_ylabel(f"Measured Value ({target_col})", fontsize=9, color='#475569')
    ax.grid(True, linestyle='--', alpha=0.7)
    ax.legend(loc='upper right', fontsize=8, framealpha=0.9)

    plt.tight_layout()
    plt.savefig(str(output_path), dpi=140, bbox_inches='tight')
    plt.close(fig)
    return str(output_path)

def generate_multi_metric_summary_chart(analysis: Dict[str, Any], output_path: Path) -> str:
    """
    Generates a horizontal comparison bar chart across numeric variables.
    """
    numeric_cols = analysis.get("numeric_columns", [])[:6]
    if not numeric_cols:
        return ""

    means = []
    stdevs = []
    labels = []

    for col in numeric_cols:
        stat = analysis["column_statistics"].get(col, {})
        if "mean" in stat:
            labels.append(col)
            means.append(stat["mean"])
            stdevs.append(stat.get("stdev", 0))

    if not labels:
        return ""

    fig, ax = plt.subplots(figsize=(8, 3.8), dpi=140)
    fig.patch.set_facecolor('#FFFFFF')
    ax.set_facecolor('#F8FAFC')

    bars = ax.barh(labels, means, xerr=stdevs, color='#1E293B', edgecolor='#0F172A', alpha=0.85, capsize=4)
    ax.set_title("Plant Unit Variable Means & Operational Deviation Band", fontsize=11, fontweight='bold', color='#0F172A', pad=12)
    ax.set_xlabel("Mean Unit Value", fontsize=9, color='#475569')
    ax.grid(True, axis='x', linestyle='--', alpha=0.7)

    # Add data labels
    for bar in bars:
        width = bar.get_width()
        ax.text(width * 1.02, bar.get_y() + bar.get_height() / 2, f'{round(width, 1)}',
                va='center', ha='left', fontsize=8, color='#1E293B', fontweight='bold')

    plt.tight_layout()
    plt.savefig(str(output_path), dpi=140, bbox_inches='tight')
    plt.close(fig)
    return str(output_path)
