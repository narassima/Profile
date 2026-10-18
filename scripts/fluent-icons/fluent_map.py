"""Map the site's Font Awesome icons to Fluent System Icons, check every name exists, and report gaps."""
import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
SRC = Path(__file__).with_name("fluent_src")
REG = json.loads((SRC / "FluentSystemIcons-Regular.json").read_text(encoding="utf-8"))
FIL = json.loads((SRC / "FluentSystemIcons-Filled.json").read_text(encoding="utf-8"))

# FA name -> candidate Fluent base names (first that exists at 24px wins)
CANDS = {
    "accessibility": ["accessibility"],
    "arrow-right": ["arrow_right"],
    "award": ["ribbon_star", "ribbon", "trophy"],
    "bars": ["navigation", "line_horizontal_3"],
    "baseball-bat-ball": ["sport_baseball", "sport"],
    "bolt": ["flash", "lightning"],
    "book": ["book"],
    "book-open": ["book_open"],
    "book-open-reader": ["book_open_globe", "reading_list", "book_search", "library"],
    "book-reader": ["book_open_globe", "reading_list", "book_search", "library"],
    "brain": ["brain_circuit", "brain"],
    "briefcase": ["briefcase"],
    "building": ["building"],
    "bullseye": ["target_arrow", "target"],
    "calculator": ["calculator"],
    "camera": ["camera"],
    "certificate": ["certificate"],
    "chair": ["chair", "conference_room", "person_chat"],
    "chalkboard-teacher": ["person_board", "presenter", "board"],
    "chalkboard-user": ["person_board", "presenter", "board"],
    "chart-bar": ["data_bar_vertical", "chart_multiple"],
    "chart-line": ["data_trending", "data_line"],
    "chart-pie": ["data_pie"],
    "check-circle": ["checkmark_circle"],
    "check-double": ["checkmark_starburst", "task_list_square_ltr", "checkmark_circle"],
    "chevron-down": ["chevron_down"],
    "chevron-left": ["chevron_left"],
    "chevron-right": ["chevron_right"],
    "code": ["code"],
    "cogs": ["settings_cog_multiple", "settings"],
    "comment-dots": ["comment", "chat"],
    "copyright": ["copyright", "c_circle", "shield_checkmark"],
    "cubes": ["cube_multiple", "cube"],
    "diagram-project": ["flowchart", "diagram"],
    "project-diagram": ["flowchart", "diagram"],
    "download": ["arrow_download"],
    "dumbbell": ["dumbbell"],
    "envelope": ["mail"],
    "external-link-alt": ["open"],
    "file-invoice": ["document_text"],
    "file-pdf": ["document_pdf"],
    "font": ["text_font"],
    "graduation-cap": ["hat_graduation"],
    "hand-pointer": ["cursor_click", "hand_right"],
    "handshake": ["handshake"],
    "hands-helping": ["people_community", "heart_circle"],
    "heart": ["heart"],
    "hospital-user": ["stethoscope", "doctor", "hospital"],
    "hotel": ["building_multiple", "building_home", "home"],
    "house-user": ["home_person", "home"],
    "icons": ["icons", "apps"],
    "images": ["image_multiple"],
    "industry": ["building_factory"],
    "layer-group": ["layer", "layer_diagonal"],
    "lightbulb": ["lightbulb"],
    "map-marked-alt": ["map"],
    "masks-theater": ["emoji_laugh", "emoji"],
    "microscope": ["microscope", "beaker"],
    "money-bill-transfer": ["currency_dollar_euro", "money"],
    "network-wired": ["organization", "network_check"],
    "palette": ["color"],
    "pencil": ["edit"],
    "pencil-ruler": ["ruler", "design_ideas"],
    "pen-fancy": ["pen"],
    "print": ["print"],
    "quote-left": ["text_quote"],
    "quote-right": ["text_quote"],
    "ribbon": ["ribbon"],
    "route": ["directions", "road"],
    "running": ["person_running", "run"],
    "search": ["search"],
    "search-minus": ["search_info", "search"],
    "share-nodes": ["share_android", "share"],
    "sitemap": ["organization"],
    "sliders": ["options"],
    "star": ["star"],
    "stopwatch-20": ["timer"],
    "teeth": ["tooth"],
    "tooth": ["tooth"],
    "th-large": ["grid"],
    "th-list": ["apps_list", "text_bullet_list_square"],
    "times": ["dismiss"],
    "tools": ["toolbox", "wrench"],
    "trophy": ["trophy"],
    "truck": ["vehicle_truck"],
    "truck-ramp-box": ["vehicle_truck_cube", "vehicle_truck_profile", "box"],
    "university": ["building_bank"],
    "user-circle": ["person_circle"],
    "user-friends": ["people"],
    "user-graduate": ["hat_graduation"],
    "users": ["people_team"],
    "user-tie": ["person_star", "person"],
    "virus-covid": ["heart_pulse", "pill", "bug"],
    "wrench": ["wrench"],
}

out, missing = {}, []
for fa, cands in CANDS.items():
    hit = next((c for c in cands if f"ic_fluent_{c}_24_regular" in REG and f"ic_fluent_{c}_24_filled" in FIL), None)
    if hit:
        out[fa] = {"name": hit, "reg": REG[f"ic_fluent_{hit}_24_regular"], "fil": FIL[f"ic_fluent_{hit}_24_filled"]}
    else:
        missing.append(fa)
print(f"mapped {len(out)} / {len(CANDS)}")
for fa in missing:
    words = [w for c in CANDS[fa] for w in c.split("_")] + fa.split("-")
    near = sorted({k[10:-12] for k in REG if k.endswith("_24_regular") and any(w in k for w in words if len(w) > 3)})[:15]
    print(f"MISSING {fa}: candidates near -> {near}")
(Path(__file__).with_name("fluent_map.json")).write_text(json.dumps(out, indent=1), encoding="utf-8")
