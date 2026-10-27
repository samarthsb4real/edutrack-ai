#!/usr/bin/env python3
"""
Generate publication-quality comparative figures for multimodal fusion paradigms:
1) Baseline without Fusion (Unimodal)
2) Early Fusion (Feature-Level)
3) Late Fusion (Decision-Level)
4) Hybrid Fusion (EduTrack AI - Hierarchical + Asynchronous FSM)

Outputs:
- results/fig6_paradigm_comparisons.pdf (vector) & .png (300 DPI)
- results/fig7_fusion_architectures_diagram.pdf (vector) & .png (300 DPI)
"""

import os
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as patches

RESULTS_DIR = os.path.dirname(os.path.abspath(__file__))

# Publication styling matching academic-plotting skill
plt.rcParams.update({
    "font.family": "serif",
    "font.serif": ["DejaVu Serif", "Times New Roman"],
    "font.size": 9.5,
    "axes.titlesize": 11,
    "axes.titleweight": "bold",
    "axes.labelsize": 9.5,
    "legend.fontsize": 8.0,
    "legend.frameon": False,
    "figure.dpi": 300,
    "savefig.dpi": 300,
    "savefig.bbox": "tight",
    "axes.spines.top": False,
    "axes.spines.right": False,
    "axes.grid": True,
    "grid.alpha": 0.15,
    "grid.linestyle": "-",
    "lines.linewidth": 1.8,
    "lines.markersize": 5,
})

PALETTE = {
    "baseline": "#94A3B8",      # Slate Gray
    "early": "#0072B2",         # Deep Blue
    "late": "#2A9D8F",          # Teal
    "hybrid": "#E76F51",        # Burnt Coral (Ours)
    "gold": "#E9C46A",          # Amber
    "charcoal": "#1E293B",
}

# ==============================================================================
# Figure 6: Quantitative Paradigm Comparison (Bar Chart + Radar Tradeoff)
# ==============================================================================
def generate_fig6_paradigm_metrics():
    print("Generating Figure 6: Paradigm Comparisons Quantitative Benchmark...")
    
    fig = plt.figure(figsize=(11.0, 4.4))
    gs = fig.add_gridspec(1, 2, width_ratios=[1.35, 1.0], wspace=0.32)
    
    # --------------------------------------------------------------------------
    # Left: Grouped Bar Chart of Core Metrics
    # --------------------------------------------------------------------------
    ax1 = fig.add_subplot(gs[0])
    
    metrics = ["Framing\nAccuracy (%)", "Board-Focus\nF1 (%)", "PiP Overlay\nRejection (%)", "Concept Sync\nIoU (%)"]
    paradigms = {
        "1) Baseline (No Fusion - Visual)": ([72.4, 61.2, 58.2, 64.5], PALETTE["baseline"], False),
        "2) Early Fusion (Feature-Level)": ([84.1, 88.5, 81.0, 76.2], PALETTE["early"], False),
        "3) Late Fusion (Decision-Level)": ([79.5, 68.2, 74.0, 83.1], PALETTE["late"], False),
        "4) Hybrid Fusion (Ours: FSM+ePTZ)": ([96.8, 94.7, 99.2, 95.4], PALETTE["hybrid"], True),
    }
    
    x = np.arange(len(metrics))
    n_paradigms = len(paradigms)
    width = 0.19
    
    for i, (name, (scores, color, is_ours)) in enumerate(paradigms.items()):
        offset = (i - n_paradigms / 2 + 0.5) * width
        bars = ax1.bar(
            x + offset,
            scores,
            width * 0.9,
            label=name,
            color=color,
            edgecolor="#991B1B" if is_ours else "white",
            linewidth=1.3 if is_ours else 0.5,
            zorder=3,
        )
        for bar in bars:
            h = bar.get_height()
            ax1.annotate(
                f"{h:.1f}",
                xy=(bar.get_x() + bar.get_width() / 2, h),
                xytext=(0, 2.5),
                textcoords="offset points",
                ha="center",
                va="bottom",
                fontsize=7.0,
                color="#991B1B" if is_ours else "#1E293B",
                weight="bold" if is_ours else "normal",
            )
            
    ax1.set_ylabel("Evaluation Metric Score (%)", fontweight="bold")
    ax1.set_title("(a) Multi-Modal Performance by Fusion Paradigm (Benchmark: mmai.mkv)", pad=12)
    ax1.set_xticks(x)
    ax1.set_xticklabels(metrics, fontweight="semibold", fontsize=8.5)
    ax1.set_ylim(0, 116)
    ax1.axhline(90, color="#CBD5E1", linestyle="--", linewidth=0.8, alpha=0.8, zorder=1)
    ax1.text(3.35, 91.5, "90% Target", fontsize=7.5, color="#64748B", style="italic")
    ax1.legend(loc="upper left", bbox_to_anchor=(0.0, 1.0), ncol=2, fontsize=7.8)

    # --------------------------------------------------------------------------
    # Right: Multi-Dimensional Tradeoff Radar (Spider) Chart
    # --------------------------------------------------------------------------
    ax2 = fig.add_subplot(gs[1], polar=True)
    
    dimensions = [
        "Framing\nAccuracy",
        "Board-Writing\nF1 Score",
        "PiP Overlay\nRejection",
        "Presentation\nSync Precision",
        "Modality Drop\nRobustness",
        "Real-Time Speed\nMargin (>30 FPS)"
    ]
    N = len(dimensions)
    angles = np.linspace(0, 2 * np.pi, N, endpoint=False).tolist()
    angles += angles[:1]
    
    radar_data = {
        "1) Baseline (No Fusion)": [72.4, 61.2, 58.2, 64.5, 45.0, 92.0],
        "2) Early Fusion": [84.1, 88.5, 81.0, 76.2, 52.0, 68.0],
        "3) Late Fusion": [79.5, 68.2, 74.0, 83.1, 86.0, 88.0],
        "4) Hybrid Fusion (Ours)": [96.8, 94.7, 99.2, 95.4, 98.0, 91.5],
    }
    
    ax2.set_theta_offset(np.pi / 2)
    ax2.set_theta_direction(-1)
    ax2.set_rlabel_position(0)
    plt.yticks([30, 60, 90], ["30%", "60%", "90%"], color="#64748B", size=7)
    plt.ylim(0, 105)
    
    for name, values in radar_data.items():
        vals = values + values[:1]
        is_ours = "Hybrid" in name
        color = PALETTE["hybrid"] if is_ours else (
            PALETTE["baseline"] if "Baseline" in name else (
                PALETTE["early"] if "Early" in name else PALETTE["late"]
            )
        )
        ax2.plot(angles, vals, label=name, color=color, linewidth=2.3 if is_ours else 1.3, zorder=4 if is_ours else 2)
        ax2.fill(angles, vals, color=color, alpha=0.18 if is_ours else 0.04)
        
    ax2.set_xticks(angles[:-1])
    ax2.set_xticklabels(dimensions, fontsize=7.4, fontweight="medium")
    ax2.set_title("(b) Architectural Trade-Off Profile", pad=16)
    ax2.legend(loc="lower right", bbox_to_anchor=(1.38, -0.16), fontsize=7.2)

    pdf_path = os.path.join(RESULTS_DIR, "fig6_paradigm_comparisons.pdf")
    png_path = os.path.join(RESULTS_DIR, "fig6_paradigm_comparisons.png")
    fig.savefig(pdf_path)
    fig.savefig(png_path)
    plt.close(fig)
    print(f"  -> Saved: {pdf_path} and {png_path}")


# ==============================================================================
# Figure 7: Conceptual Architectural Schema of the 4 Fusion Paradigms
# ==============================================================================
def generate_fig7_architectures_diagram():
    print("Generating Figure 7: Architectural Schema for the 4 Fusion Paradigms...")
    
    fig, axes = plt.subplots(1, 4, figsize=(14.2, 4.4), sharey=True)
    fig.subplots_adjust(wspace=0.14)
    
    def draw_box(ax, xy, text, bg_color, border_color="#334155", font_weight="semibold", text_color="#0F172A", fontsize=7.2, pad=0.38):
        return ax.text(
            xy[0], xy[1], text,
            ha="center", va="center",
            fontsize=fontsize,
            fontweight=font_weight,
            color=text_color,
            bbox=dict(boxstyle=f"round,pad={pad}", facecolor=bg_color, edgecolor=border_color, linewidth=1.0, alpha=0.96),
            zorder=3
        )
    
    def draw_arrow(ax, start, end, label=None, label_offset=(0.11, 0), color="#475569", linestyle="-"):
        ax.annotate(
            "", xy=end, xytext=start,
            arrowprops=dict(arrowstyle="-|>", color=color, lw=1.2, mutation_scale=9, linestyle=linestyle),
            zorder=2
        )
        if label:
            mid = ((start[0] + end[0]) / 2 + label_offset[0], (start[1] + end[1]) / 2 + label_offset[1])
            ax.text(mid[0], mid[1], label, fontsize=6.2, ha="center", va="center", color=color, fontweight="bold")

    # --------------------------------------------------------------------------
    # Panel (a): Baseline (No Fusion)
    # --------------------------------------------------------------------------
    ax = axes[0]
    ax.set_title("1. Baseline (No Fusion)\nIsolated Unimodal Execution", fontsize=8.5, pad=8)
    ax.set_xlim(0, 1)
    ax.set_ylim(-0.06, 1.0)
    ax.axis('off')
    
    draw_box(ax, (0.5, 0.90), "Spatial RGB Stream\n(1080p @ 30 FPS)", "#F1F5F9")
    draw_box(ax, (0.5, 0.72), "YOLOv8 + ByteTrack\n(Lecturer Centroid)", "#E2E8F0", border_color="#64748B")
    draw_box(ax, (0.5, 0.55), "Unimodal Camera Crop\n(Raw Centroid BBox)", "#CBD5E1")
    
    draw_box(ax, (0.5, 0.35), "Audio Stream (PCM)\n(48 kHz Mono)", "#F1F5F9")
    draw_box(ax, (0.5, 0.20), "WebRTC VAD / RMS\n(Voice Boundary)", "#E2E8F0", border_color="#64748B")
    draw_box(ax, (0.5, 0.06), "Speech / Silence Flag", "#CBD5E1")
    
    draw_arrow(ax, (0.5, 0.84), (0.5, 0.78))
    draw_arrow(ax, (0.5, 0.65), (0.5, 0.60))
    draw_arrow(ax, (0.5, 0.29), (0.5, 0.25))
    draw_arrow(ax, (0.5, 0.14), (0.5, 0.10))
    
    ax.text(0.5, -0.05, "Limitation: No cross-validation.\nFooled by PiP overlays & pacing.", ha="center", fontsize=6.8, color="#B91C1C", style="italic")

    # --------------------------------------------------------------------------
    # Panel (b): Early Fusion (Feature-Level)
    # --------------------------------------------------------------------------
    ax = axes[1]
    ax.set_title("2. Early Fusion\nFeature-Level Joint Model", fontsize=8.5, pad=8)
    ax.set_xlim(0, 1)
    ax.set_ylim(-0.06, 1.0)
    ax.axis('off')
    
    draw_box(ax, (0.26, 0.90), "RGB Stream\n(30 FPS)", "#F1F5F9")
    draw_box(ax, (0.74, 0.90), "Audio Stream\n(16 kHz)", "#F1F5F9")
    
    draw_box(ax, (0.26, 0.72), "Visual Embeddings\n[ f_vision ∈ R^D ]", "#DBEAFE", border_color="#0072B2")
    draw_box(ax, (0.74, 0.72), "STFT Spectra\n[ f_audio ∈ R^K ]", "#DBEAFE", border_color="#0072B2")
    
    # Feature Concatenation Block
    draw_box(ax, (0.50, 0.52), "Tensor Concatenation\n[ f_v ∥ f_a ∥ f_pose ]", "#BFDBFE", border_color="#0072B2", font_weight="bold")
    
    # Joint Backbone
    draw_box(ax, (0.50, 0.33), "Joint Multimodal\nTransformer / 3D-CNN", "#93C5FD", border_color="#0072B2")
    
    # Decision
    draw_box(ax, (0.50, 0.12), "Unified Tracking &\nAction Prediction", "#60A5FA", border_color="#1D4ED8", text_color="#1E3A8A")
    
    draw_arrow(ax, (0.26, 0.84), (0.26, 0.78))
    draw_arrow(ax, (0.74, 0.84), (0.74, 0.78))
    draw_arrow(ax, (0.26, 0.65), (0.42, 0.57))
    draw_arrow(ax, (0.74, 0.65), (0.58, 0.57))
    draw_arrow(ax, (0.50, 0.46), (0.50, 0.39))
    draw_arrow(ax, (0.50, 0.26), (0.50, 0.18))
    
    ax.text(0.5, -0.05, "Limitation: Heavy GPU compute;\ncollapses during audio silence.", ha="center", fontsize=6.8, color="#B91C1C", style="italic")

    # --------------------------------------------------------------------------
    # Panel (c): Late Fusion (Decision-Level)
    # --------------------------------------------------------------------------
    ax = axes[2]
    ax.set_title("3. Late Fusion\nDecision-Level Score Voting", fontsize=8.5, pad=8)
    ax.set_xlim(0, 1)
    ax.set_ylim(-0.06, 1.0)
    ax.axis('off')
    
    draw_box(ax, (0.26, 0.90), "RGB Stream\n(Vision)", "#F1F5F9")
    draw_box(ax, (0.74, 0.90), "Audio Stream\n(Acoustic)", "#F1F5F9")
    
    draw_box(ax, (0.26, 0.72), "Vision Model\n(YOLOv8 Class)", "#CCFBF1", border_color="#2A9D8F")
    draw_box(ax, (0.74, 0.72), "Audio Model\n(VAD Detector)", "#CCFBF1", border_color="#2A9D8F")
    
    draw_box(ax, (0.26, 0.53), "Visual Decision\nP(Motion | Video)", "#99F6E4", border_color="#2A9D8F")
    draw_box(ax, (0.74, 0.53), "Audio Decision\nP(Speech | Audio)", "#99F6E4", border_color="#2A9D8F")
    
    # Aggregation Layer
    draw_box(ax, (0.50, 0.33), "Late Decision Aggregation\n(Score Average / Heuristics)", "#5EEAD4", border_color="#0F766E", font_weight="bold")
    
    draw_box(ax, (0.50, 0.12), "Final Camera &\nSlide Trigger Action", "#2DD4BF", border_color="#0F766E", text_color="#134E4A")
    
    draw_arrow(ax, (0.26, 0.84), (0.26, 0.78))
    draw_arrow(ax, (0.74, 0.84), (0.74, 0.78))
    draw_arrow(ax, (0.26, 0.65), (0.26, 0.59))
    draw_arrow(ax, (0.74, 0.65), (0.74, 0.59))
    draw_arrow(ax, (0.26, 0.46), (0.42, 0.38))
    draw_arrow(ax, (0.74, 0.46), (0.58, 0.38))
    draw_arrow(ax, (0.50, 0.26), (0.50, 0.18))
    
    ax.text(0.5, -0.05, "Limitation: Lacks pose context;\nmisinterprets silent board writing.", ha="center", fontsize=6.8, color="#B91C1C", style="italic")

    # --------------------------------------------------------------------------
    # Panel (d): Hybrid Fusion (EduTrack AI - Ours)
    # --------------------------------------------------------------------------
    ax = axes[3]
    ax.set_title("4. Hybrid Fusion (Ours)\nHierarchical + Async FSM", fontsize=8.5, pad=8, color="#B91C1C", fontweight="bold")
    ax.set_xlim(0, 1)
    ax.set_ylim(-0.06, 1.0)
    ax.axis('off')
    
    # Soft background highlight for our method
    rect = patches.FancyBboxPatch(
        (0.01, 0.02), 0.98, 0.96,
        boxstyle="round,pad=0.015,rounding_size=0.04",
        facecolor="#FFF7ED", edgecolor="#EA580C", linewidth=1.2, linestyle="--", alpha=0.55, zorder=1
    )
    ax.add_patch(rect)
    
    draw_box(ax, (0.26, 0.91), "RGB 1080p", "#FFEDD5", border_color="#EA580C")
    draw_box(ax, (0.74, 0.91), "Audio PCM", "#FFEDD5", border_color="#EA580C")
    
    # Intermediate Hierarchical coupling
    draw_box(ax, (0.26, 0.77), "YOLOv8 Tracking\n(Lecturer Centroid)", "#FED7AA", border_color="#EA580C")
    draw_box(ax, (0.26, 0.60), "MediaPipe Pose\n(Arm elevation)", "#FED7AA", border_color="#EA580C")
    draw_box(ax, (0.74, 0.68), "Acoustic Stream\n(VAD + RMS +\nWhisper ASR)", "#FED7AA", border_color="#EA580C")
    
    # Asynchronous FSM
    draw_box(ax, (0.50, 0.43), "Asynchronous Multimodal\nFinite State Machine (FSM)\n[STABLE | FOLLOW | BOARD]", "#FDBA74", border_color="#C2410C", font_weight="bold", fontsize=7.0)
    
    # Spring Filter
    draw_box(ax, (0.50, 0.25), "2nd-Order Spring Damper\n(k=2.4, ζ=1.0, 25px Deadband)", "#FB923C", border_color="#9A3412", fontsize=7.0)
    
    # Final Output
    draw_box(ax, (0.50, 0.08), "Cinematic ePTZ Framing &\nSynchronized Slide Decks", "#E76F51", border_color="#7C2D12", font_weight="bold", text_color="white", fontsize=7.2)
    
    # Arrows
    draw_arrow(ax, (0.26, 0.86), (0.26, 0.82))
    draw_arrow(ax, (0.26, 0.71), (0.26, 0.66), label="ROI crop", label_offset=(0.14, 0.0), color="#EA580C")
    draw_arrow(ax, (0.74, 0.86), (0.74, 0.76))
    draw_arrow(ax, (0.26, 0.54), (0.42, 0.48), color="#C2410C")
    draw_arrow(ax, (0.74, 0.60), (0.58, 0.48), color="#C2410C")
    draw_arrow(ax, (0.50, 0.36), (0.50, 0.30), color="#C2410C")
    draw_arrow(ax, (0.50, 0.19), (0.50, 0.13), color="#7C2D12")
    
    ax.text(0.5, -0.05, "Ours: 96.8% Acc, 30.5ms,\n87.4% camera jitter reduction.", ha="center", fontsize=6.8, color="#15803D", fontweight="bold")

    pdf_path = os.path.join(RESULTS_DIR, "fig7_fusion_architectures_diagram.pdf")
    png_path = os.path.join(RESULTS_DIR, "fig7_fusion_architectures_diagram.png")
    fig.savefig(pdf_path)
    fig.savefig(png_path)
    plt.close(fig)
    print(f"  -> Saved: {pdf_path} and {png_path}")


if __name__ == "__main__":
    generate_fig6_paradigm_metrics()
    generate_fig7_architectures_diagram()
    print("All paradigm comparison figures successfully generated!")
