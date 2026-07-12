from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from PIL import Image, ImageDraw

TOOLS_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(TOOLS_DIR))

from kards_multisource_extraction import copy_stage5_clean_assets
from kards_private_calibration import (
    add_manifest_crop,
    download_bytes,
    extract_nation_mark_subject,
    extract_set_mark_subject,
    remove_tree_contents,
    validate_output_dir,
)


class PrivateCalibrationContractTest(unittest.TestCase):
    def test_authorized_high_rarity_assets_are_complete_marks(self) -> None:
        rarity_dir = TOOLS_DIR.parent / "public" / "reference-pack" / "v1" / "images" / "rarity-pip"
        with Image.open(rarity_dir / "standard-pip.png") as standard_source:
            standard = standard_source.convert("RGBA")
        with Image.open(rarity_dir / "elite-pip.png") as elite_source:
            elite = elite_source.convert("RGBA")
        with Image.open(rarity_dir / "special-pip.png") as special_source:
            special = special_source.convert("RGBA")

        self.assertGreater(elite.width, standard.width * 3)
        self.assertGreater(elite.height, standard.height)
        self.assertLessEqual(elite.width, 48)
        self.assertLessEqual(elite.height, 20)
        elite_alpha = elite.getchannel("A")
        elite_thirds = (
            elite_alpha.crop((0, 0, elite.width // 3, elite.height)),
            elite_alpha.crop((elite.width // 3, 0, 2 * elite.width // 3, elite.height)),
            elite_alpha.crop((2 * elite.width // 3, 0, elite.width, elite.height)),
        )
        elite_counts = [sum(alpha >= 64 for alpha in third.get_flattened_data()) for third in elite_thirds]
        wing_minimum = standard.width * standard.height // 2
        self.assertGreater(elite_counts[0], wing_minimum)
        self.assertGreater(elite_counts[2], wing_minimum)
        self.assertGreater(elite_counts[1], max(elite_counts[0], elite_counts[2]))

        self.assertGreater(special.width, standard.width * 2)
        self.assertGreater(special.height, standard.height)
        self.assertLessEqual(special.width, 34)
        self.assertLessEqual(special.height, 20)
        special_alpha = special.getchannel("A")
        special_left = special_alpha.crop((0, 0, special.width // 2, special.height))
        special_right = special_alpha.crop((special.width // 2, 0, special.width, special.height))
        self.assertGreater(sum(alpha >= 64 for alpha in special_left.get_flattened_data()), standard.width * standard.height)
        self.assertGreater(sum(alpha >= 64 for alpha in special_right.get_flattened_data()), standard.width * standard.height)
        middle_columns = range(special.width // 3, 2 * special.width // 3)
        self.assertTrue(any(
            sum(special_alpha.getpixel((x, y)) >= 64 for y in range(special.height)) <= 2
            for x in middle_columns
        ))

    def test_private_generator_rejects_source_and_public_output_paths(self) -> None:
        workspace = TOOLS_DIR.parent
        for segment in ("src", "public", "dist"):
            with self.subTest(segment=segment):
                with self.assertRaises(SystemExit):
                    validate_output_dir(workspace / segment / ".runtime" / "private-assets", allow_outside_runtime=False)

    def test_private_generator_cleanup_does_not_follow_links(self) -> None:
        symlink = FakePath("symlink", is_symlink=True, is_dir=True)
        junction = FakePath("junction", is_junction=True, is_dir=True)
        normal_file = FakePath("file")
        root = FakePath("root", children=[symlink, junction, normal_file])

        remove_tree_contents(root)  # type: ignore[arg-type]

        self.assertEqual(symlink.calls, ["unlink"])
        self.assertEqual(junction.calls, ["rmdir"])
        self.assertEqual(normal_file.calls, ["unlink"])

    def test_private_generator_cleanup_does_not_follow_top_level_links(self) -> None:
        symlink = FakePath("references", is_symlink=True, is_dir=True)
        junction = FakePath("images", is_junction=True, is_dir=True)

        remove_tree_contents(symlink)  # type: ignore[arg-type]
        remove_tree_contents(junction)  # type: ignore[arg-type]

        self.assertEqual(symlink.calls, ["unlink"])
        self.assertEqual(junction.calls, ["rmdir"])

    def test_nation_mark_manifest_keeps_kind_and_template_entries(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            output_dir = Path(temp_dir)
            manifest_images: list[dict[str, str]] = []
            manifest_seen: set[tuple[str, tuple[tuple[str, str], ...]]] = set()
            image = Image.new("RGBA", (2, 2), (255, 0, 0, 255))

            add_manifest_crop(
                output_dir,
                manifest_images,
                manifest_seen,
                slot="nation-mark",
                file_path=Path("images/nations/unit/fighter/france.png"),
                crop_image=image,
                filters={"nationId": "france", "kind": "fighter", "template": "unit"},
            )
            add_manifest_crop(
                output_dir,
                manifest_images,
                manifest_seen,
                slot="nation-mark",
                file_path=Path("images/nations/command/order/france.png"),
                crop_image=image,
                filters={"nationId": "france", "kind": "order", "template": "command"},
            )

            self.assertEqual(len(manifest_images), 2)
            self.assertEqual({entry["template"] for entry in manifest_images}, {"unit", "command"})
            self.assertEqual({entry["kind"] for entry in manifest_images}, {"fighter", "order"})

    def test_stage6_copy_preserves_template_and_kind_paths(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            stage5_pack = root / "stage5"
            output_dir = root / "stage6"
            (stage5_pack / "images/nations/unit/fighter").mkdir(parents=True)
            (stage5_pack / "images/nations/command/order").mkdir(parents=True)
            Image.new("RGBA", (2, 2), (255, 0, 0, 255)).save(stage5_pack / "images/nations/unit/fighter/france.png")
            Image.new("RGBA", (2, 2), (0, 0, 255, 255)).save(stage5_pack / "images/nations/command/order/france.png")
            (stage5_pack / "kards-asset-pack.json").write_text(
                json.dumps(
                    {
                        "images": [
                            {
                                "slot": "nation-mark",
                                "file": "images/nations/unit/fighter/france.png",
                                "nationId": "france",
                                "kind": "fighter",
                                "template": "unit",
                            },
                            {
                                "slot": "nation-mark",
                                "file": "images/nations/command/order/france.png",
                                "nationId": "france",
                                "kind": "order",
                                "template": "command",
                            },
                        ]
                    },
                    indent=2,
                ),
                encoding="utf-8",
            )

            extracted_assets: list[dict[str, object]] = []
            renderer_manifest_images: list[dict[str, str]] = []
            inventory = copy_stage5_clean_assets(stage5_pack, output_dir, extracted_assets, renderer_manifest_images)

            self.assertEqual(inventory["copiedImages"], 2)
            entries_by_file = {entry["file"]: entry for entry in renderer_manifest_images}
            unit_file = "images/stage5-clean/nation-mark/unit/fighter/france.png"
            command_file = "images/stage5-clean/nation-mark/command/order/france.png"
            self.assertIn(unit_file, entries_by_file)
            self.assertIn(command_file, entries_by_file)
            self.assertEqual(entries_by_file[unit_file]["kind"], "fighter")
            self.assertEqual(entries_by_file[unit_file]["template"], "unit")
            self.assertEqual(entries_by_file[command_file]["kind"], "order")
            self.assertEqual(entries_by_file[command_file]["template"], "command")

    def test_subject_protection_keeps_britain_command_outer_ring(self) -> None:
        image, rect = make_mark_fixture()
        draw_roundel(image, rect, outer=(37, 56, 118), middle=(245, 245, 235), inner=(171, 42, 43))

        output = extract_nation_mark_subject(image, rect, "britain", "order")

        assert_outer_ring_and_clear_corners(self, output)

    def test_subject_protection_keeps_france_air_outer_ring(self) -> None:
        image, rect = make_mark_fixture()
        draw_roundel(image, rect, outer=(37, 56, 118), middle=(245, 245, 235), inner=(171, 42, 43))

        output = extract_nation_mark_subject(image, rect, "france", "fighter")

        assert_outer_ring_and_clear_corners(self, output)

    def test_set_mark_extraction_clears_paper_background(self) -> None:
        rect = (8, 8, 28, 28)
        image = Image.new("RGBA", (44, 44), (210, 202, 176, 255))
        draw = ImageDraw.Draw(image)
        draw.polygon(
            (
                (rect[0] + 14, rect[1] + 3),
                (rect[0] + 18, rect[1] + 11),
                (rect[0] + 26, rect[1] + 12),
                (rect[0] + 20, rect[1] + 18),
                (rect[0] + 22, rect[1] + 26),
                (rect[0] + 14, rect[1] + 21),
                (rect[0] + 6, rect[1] + 26),
                (rect[0] + 8, rect[1] + 18),
                (rect[0] + 2, rect[1] + 12),
                (rect[0] + 10, rect[1] + 11),
            ),
            fill=(75, 76, 70, 255),
        )

        output = extract_set_mark_subject(image, rect)
        pixels = output.load()

        self.assertEqual(pixels[0, 0][3], 0)
        self.assertEqual(pixels[27, 27][3], 0)
        self.assertGreaterEqual(pixels[14, 14][3], 200)

    def test_set_mark_extraction_preserves_small_light_subject(self) -> None:
        rect = (8, 8, 28, 28)
        image = Image.new("RGBA", (44, 44), (210, 202, 176, 255))
        draw = ImageDraw.Draw(image)
        draw.line(
            (
                (rect[0] + 8, rect[1] + 14),
                (rect[0] + 20, rect[1] + 14),
                (rect[0] + 14, rect[1] + 8),
                (rect[0] + 14, rect[1] + 20),
            ),
            fill=(145, 145, 130, 255),
            width=2,
        )

        output = extract_set_mark_subject(image, rect)
        alpha_values = list(output.getchannel("A").tobytes())

        self.assertGreater(sum(1 for alpha in alpha_values if alpha >= 200), 0)
        self.assertGreater(sum(1 for alpha in alpha_values if alpha == 0), 600)

    def test_detailed_set_mark_extraction_preserves_faint_linework(self) -> None:
        rect = (8, 8, 28, 28)
        image = Image.new("RGBA", (44, 44), (210, 202, 176, 255))
        draw = ImageDraw.Draw(image)
        draw.ellipse(
            (
                rect[0] + 5,
                rect[1] + 5,
                rect[0] + 23,
                rect[1] + 23,
            ),
            outline=(190, 190, 170, 255),
            width=2,
        )
        draw.line(
            (
                (rect[0] + 14, rect[1] + 5),
                (rect[0] + 14, rect[1] + 23),
                (rect[0] + 5, rect[1] + 14),
                (rect[0] + 23, rect[1] + 14),
            ),
            fill=(190, 190, 170, 255),
            width=1,
        )

        output = extract_set_mark_subject(image, rect, "world-at-war")
        alpha_values = list(output.getchannel("A").tobytes())

        self.assertGreater(sum(1 for alpha in alpha_values if alpha >= 200), 40)
        self.assertGreater(sum(1 for alpha in alpha_values if alpha == 0), 500)

    def test_set_mark_extraction_clears_empty_paper_crop(self) -> None:
        rect = (8, 8, 28, 28)
        image = Image.new("RGBA", (44, 44), (210, 202, 176, 255))

        output = extract_set_mark_subject(image, rect)
        alpha_values = list(output.getchannel("A").tobytes())

        self.assertEqual(sum(1 for alpha in alpha_values if alpha > 0), 0)

    def test_download_bytes_allows_known_https_sources_only(self) -> None:
        with patch("kards_private_calibration.urlopen", return_value=FakeResponse(b"ok")) as urlopen:
            self.assertEqual(
                download_bytes("https://raw.githubusercontent.com/CraftSoul/kards-image-tool/main/data.json"),
                b"ok",
            )
            urlopen.assert_called_once()

        with self.assertRaises(SystemExit):
            download_bytes("https://example.com/data.json")

        with self.assertRaises(SystemExit):
            download_bytes("http://www.kards.com/images/card/v52/en-EN/sample.png")

    def test_download_bytes_rejects_bad_status_and_oversized_responses(self) -> None:
        with patch("kards_private_calibration.urlopen", return_value=FakeResponse(b"nope", status=404)):
            with self.assertRaises(SystemExit):
                download_bytes("https://www.kards.com/images/card/v52/en-EN/sample.png")

        with patch(
            "kards_private_calibration.urlopen",
            return_value=FakeResponse(b"ok", headers={"Content-Length": str(12 * 1024 * 1024 + 1)}),
        ):
            with self.assertRaises(SystemExit):
                download_bytes("https://www.kards.com/images/card/v52/en-EN/sample.png")

        with patch("kards_private_calibration.urlopen", return_value=FakeResponse(b"x" * (12 * 1024 * 1024 + 1))):
            with self.assertRaises(SystemExit):
                download_bytes("https://www.kards.com/images/card/v52/en-EN/sample.png")


def make_mark_fixture() -> tuple[Image.Image, tuple[int, int, int, int]]:
    rect = (8, 8, 54, 54)
    image = Image.new("RGBA", (70, 70), (58, 52, 47, 255))
    return image, rect


def draw_roundel(
    image: Image.Image,
    rect: tuple[int, int, int, int],
    outer: tuple[int, int, int],
    middle: tuple[int, int, int],
    inner: tuple[int, int, int],
) -> None:
    x, y, width, height = rect
    draw = ImageDraw.Draw(image)
    draw.ellipse((x + 3, y + 3, x + width - 4, y + height - 4), fill=(*outer, 255))
    draw.ellipse((x + 11, y + 11, x + width - 12, y + height - 12), fill=(*middle, 255))
    draw.ellipse((x + 20, y + 20, x + width - 21, y + height - 21), fill=(*inner, 255))


def assert_outer_ring_and_clear_corners(test: unittest.TestCase, output: Image.Image) -> None:
    pixels = output.load()
    for point in ((3, 27), (50, 27), (27, 3), (27, 50)):
        with test.subTest(point=point):
            test.assertGreaterEqual(pixels[point][3], 200)
    for point in ((0, 0), (53, 0), (0, 53), (53, 53)):
        with test.subTest(point=point):
            test.assertEqual(pixels[point][3], 0)


class FakePath:
    def __init__(
        self,
        name: str,
        *,
        children: list["FakePath"] | None = None,
        is_symlink: bool = False,
        is_junction: bool = False,
        is_dir: bool = False,
    ) -> None:
        self.name = name
        self.children = children or []
        self._is_symlink = is_symlink
        self._is_junction = is_junction
        self._is_dir = is_dir or bool(children)
        self.calls: list[str] = []

    def iterdir(self) -> list["FakePath"]:
        return self.children

    def is_symlink(self) -> bool:
        return self._is_symlink

    def is_junction(self) -> bool:
        return self._is_junction

    def is_dir(self) -> bool:
        return self._is_dir

    def unlink(self) -> None:
        self.calls.append("unlink")

    def rmdir(self) -> None:
        self.calls.append("rmdir")


class FakeResponse:
    def __init__(self, data: bytes, *, status: int = 200, headers: dict[str, str] | None = None) -> None:
        self.data = data
        self.status = status
        self.headers = headers or {}

    def __enter__(self) -> "FakeResponse":
        return self

    def __exit__(self, _exc_type: object, _exc_value: object, _traceback: object) -> None:
        return None

    def getcode(self) -> int:
        return self.status

    def read(self, size: int = -1) -> bytes:
        return self.data if size < 0 else self.data[:size]


if __name__ == "__main__":
    unittest.main()
