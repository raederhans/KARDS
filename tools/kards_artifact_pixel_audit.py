#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
from typing import Any

try:
    from PIL import Image
except ImportError as exc:  # pragma: no cover - environment guard
    raise SystemExit("Pillow is required for exact PNG pixel auditing.") from exc


def main() -> None:
    parser = argparse.ArgumentParser(description="Audit rendered KARDS smoke crops against original reference PNGs.")
    parser.add_argument("--input", required=True, help="JSON input produced by kards_browser_visual_smoke.mjs")
    args = parser.parse_args()

    input_path = Path(args.input).resolve()
    data = json.loads(input_path.read_text(encoding="utf-8"))
    output_root = Path(data["outputRoot"]).resolve()
    assert_owned_runtime_output(output_root)

    thresholds = data["thresholds"]
    results = [audit_artifact(artifact, thresholds, output_root) for artifact in data["artifacts"]]
    summary = summarize(results)
    print(json.dumps({"summary": summary, "results": results}, ensure_ascii=False, indent=2))


def assert_owned_runtime_output(output_root: Path) -> None:
    if ".runtime" not in [part.lower() for part in output_root.parts]:
        raise SystemExit(f"Refusing to write visual audit artifacts outside .runtime: {output_root}")
    marker = output_root / ".kards-visual-smoke-output"
    if not marker.exists():
        raise SystemExit(f"Missing visual smoke ownership marker: {marker}")


def audit_artifact(artifact: dict[str, Any], thresholds: dict[str, Any], output_root: Path) -> dict[str, Any]:
    rendered_path = Path(artifact["renderedPath"]).resolve()
    reference_path = Path(artifact["sourceReferencePath"]).resolve()
    diff_path = Path(artifact["diffPath"]).resolve()
    extracted_path = Path(artifact["extractedPath"]).resolve()
    require_inside_output(rendered_path, output_root, "renderedPath")
    require_inside_output(extracted_path, output_root, "extractedPath")
    require_inside_output(diff_path, output_root, "diffPath")

    try:
        rendered = Image.open(rendered_path).convert("RGBA")
        reference = Image.open(reference_path).convert("RGBA")
    except OSError as exc:
        return {
            **public_artifact_fields(artifact),
            "status": "fail",
            "metrics": empty_metrics(),
            "note": f"could not open image: {exc}",
        }

    if rendered.size != reference.size:
        write_size_mismatch_diff(rendered, reference, diff_path)
        return {
            **public_artifact_fields(artifact),
            "renderedPath": str(rendered_path),
            "extractedPath": str(extracted_path),
            "diffPath": str(diff_path),
            "sourceReferencePath": str(reference_path),
            "status": "fail",
            "metrics": {
                **empty_metrics(),
                "comparedPixels": min(rendered.width, reference.width) * min(rendered.height, reference.height),
            },
            "note": f"size mismatch rendered={rendered.size} reference={reference.size}",
        }

    metrics, diff = compare_images(rendered, reference)
    diff_path.parent.mkdir(parents=True, exist_ok=True)
    diff.save(diff_path)
    status = (
        "pass"
        if metrics["maxChannelDelta"] <= thresholds["maxChannelDelta"]
        and metrics["changedPixelRatio"] <= thresholds["changedPixelRatio"]
        else "review"
    )
    return {
        **public_artifact_fields(artifact),
        "renderedPath": str(rendered_path),
        "extractedPath": str(extracted_path),
        "diffPath": str(diff_path),
        "sourceReferencePath": str(reference_path),
        "status": status,
        "metrics": metrics,
        "note": "rendered crop compared directly against original reference image",
    }


def public_artifact_fields(artifact: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": artifact["id"],
        "slot": artifact["slot"],
        "value": artifact["value"],
    }


def require_inside_output(path: Path, output_root: Path, label: str) -> None:
    try:
        path.relative_to(output_root)
    except ValueError:
        raise SystemExit(f"{label} must stay inside owned visual smoke output: {path}")


def compare_images(rendered: Image.Image, reference: Image.Image) -> tuple[dict[str, Any], Image.Image]:
    rendered_pixels = list(rendered.getdata())
    reference_pixels = list(reference.getdata())
    diff_pixels: list[tuple[int, int, int, int]] = []
    changed_pixels = 0
    absolute_delta_sum = 0
    squared_delta_sum = 0
    max_channel_delta = 0

    for rendered_pixel, reference_pixel in zip(rendered_pixels, reference_pixels):
        channel_deltas = [abs(rendered_pixel[index] - reference_pixel[index]) for index in range(4)]
        pixel_max = max(channel_deltas)
        if pixel_max > 0:
            changed_pixels += 1
        absolute_delta_sum += sum(channel_deltas)
        squared_delta_sum += sum(delta * delta for delta in channel_deltas)
        max_channel_delta = max(max_channel_delta, pixel_max)
        diff_pixels.append((255, 0, 0, 0 if pixel_max == 0 else max(96, pixel_max)))

    compared_pixels = rendered.width * rendered.height
    channel_count = compared_pixels * 4
    diff = Image.new("RGBA", rendered.size)
    diff.putdata(diff_pixels)
    return (
        {
            "comparedPixels": compared_pixels,
            "changedPixels": changed_pixels,
            "changedPixelRatio": round_metric(changed_pixels / compared_pixels),
            "meanAbsoluteError": round_metric(absolute_delta_sum / channel_count),
            "rootMeanSquaredError": round_metric(math.sqrt(squared_delta_sum / channel_count)),
            "maxChannelDelta": max_channel_delta,
        },
        diff,
    )


def write_size_mismatch_diff(rendered: Image.Image, reference: Image.Image, diff_path: Path) -> None:
    width = max(rendered.width, reference.width)
    height = max(rendered.height, reference.height)
    diff = Image.new("RGBA", (width, height), (255, 0, 0, 160))
    diff_path.parent.mkdir(parents=True, exist_ok=True)
    diff.save(diff_path)


def empty_metrics() -> dict[str, Any]:
    return {
        "comparedPixels": 0,
        "changedPixels": 0,
        "changedPixelRatio": 1,
        "meanAbsoluteError": 0,
        "rootMeanSquaredError": 0,
        "maxChannelDelta": 255,
    }


def round_metric(value: float) -> float:
    return round(value, 6)


def summarize(results: list[dict[str, Any]]) -> dict[str, Any]:
    by_slot: dict[str, int] = {}
    pass_count = 0
    review_count = 0
    fail_count = 0
    for result in results:
        by_slot[result["slot"]] = by_slot.get(result["slot"], 0) + 1
        if result["status"] == "pass":
            pass_count += 1
        elif result["status"] == "review":
            review_count += 1
        else:
            fail_count += 1
    return {
        "totalElements": len(results),
        "passCount": pass_count,
        "reviewCount": review_count,
        "failCount": fail_count,
        "bySlot": by_slot,
    }


if __name__ == "__main__":
    main()
