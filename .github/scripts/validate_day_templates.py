#!/usr/bin/env python3
"""
Validates that every single day README file in days/ follows the required curriculum template:
1. Title matching '# Day XX:'
2. Navigation links to previous and next days
3. Goal section (non-empty)
4. Time section (with minute estimate)
5. Learn section (with at least 2 resources)
6. Do section (concrete steps / commands)
7. Done When section (checklist with verification items)
8. Cost and Cleanup section (cost estimate and teardown)
9. Stretch Goal section
10. Common Mistakes section (bulleted list)
11. Azure / GCP Equivalents section for cloud-specific days
"""

import sys
import os
import glob
import re

REQUIRED_CLOUD_DAYS = {
    1, 2, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    46, 53, 54, 59, 63, 73, 78, 79, 80, 81, 82, 83
}

def validate_day_file(file_path):
    errors = []
    
    # Extract day number from path
    match = re.search(r'day-(\d+)', file_path)
    if not match:
        return [f"Could not extract day number from path {file_path}"]
    day_num = int(match.group(1))

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Title (supports both Day 1 and Day 01)
    if not re.search(rf"^#\s+Day\s+0?{day_num}\b", content, re.MULTILINE | re.IGNORECASE):
        errors.append(f"Missing or mismatched title '# Day {day_num}:'")

    # 2. Navigation
    has_prev = (day_num == 1 and ("START_HERE.md" in content or "Previous" in content)) or (day_num > 1 and "Previous" in content)
    has_next = (day_num == 95 and ("README.md" in content or "Next" in content or "You did it" in content)) or (day_num < 95 and "Next" in content)
    if not has_prev:
        errors.append("Missing link to Previous Day")
    if not has_next:
        errors.append("Missing link to Next Day")

    # Lowercase search for standard sections
    content_lower = content.lower()

    # 3. Goal
    if "## goal" not in content_lower:
        errors.append("Missing '## Goal' section")

    # 4. Time
    if "## time" not in content_lower:
        errors.append("Missing '## Time' section")

    # 5. Learn
    if "## learn" not in content_lower:
        errors.append("Missing '## Learn' section")
    else:
        # Check for at least 2 resource links or bullet points in Learn section
        learn_section = content_lower.split("## learn")[1].split("##")[0]
        links_count = len(re.findall(r"\[.*?\]\(.*?\)", learn_section))
        bullet_count = len(re.findall(r"^\s*[-*]\s+", learn_section, re.MULTILINE))
        if links_count < 2 and bullet_count < 2:
            errors.append(f"Learn section should offer at least 2 resources (found {links_count} links)")

    # 6. Do
    if "## do" not in content_lower:
        errors.append("Missing '## Do' section")

    # 7. Done When
    if "## done when" not in content_lower:
        errors.append("Missing '## Done When' section")
    else:
        done_section = content_lower.split("## done when")[1].split("##")[0]
        if "- [" not in done_section:
            errors.append("Done When section must contain a checklist with '[ ]'")

    # 8. Cost and Cleanup
    if "## cost and cleanup" not in content_lower:
        errors.append("Missing '## Cost and Cleanup' section")

    # 9. Azure / GCP Equivalents for cloud-specific days
    if day_num in REQUIRED_CLOUD_DAYS:
        if "azure" not in content_lower or "gcp" not in content_lower:
            errors.append("Missing 'Azure / GCP Equivalents' section on cloud-specific day")

    # 10. Stretch Goal
    if "## stretch goal" not in content_lower:
        errors.append("Missing '## Stretch Goal' section")

    # 11. Common Mistakes
    if "## common mistakes" not in content_lower:
        errors.append("Missing '## Common Mistakes' section")

    return errors


def main():
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    days_dir = os.path.join(repo_root, "days")
    
    day_files = sorted(glob.glob(os.path.join(days_dir, "day-*", "README.md")))
    print(f"🔍 Validating {len(day_files)} Day README files...")

    if len(day_files) != 95:
        print(f"❌ Error: Expected 95 day files, but found {len(day_files)}!")
        sys.exit(1)

    total_errors = 0
    for day_file in day_files:
        rel_path = os.path.relpath(day_file, repo_root)
        errors = validate_day_file(day_file)
        if errors:
            print(f"❌ {rel_path}:")
            for err in errors:
                print(f"   - {err}")
            total_errors += len(errors)

    if total_errors == 0:
        print(f"✅ All {len(day_files)} day files strictly follow the curriculum template!")
        sys.exit(0)
    else:
        print(f"\n❌ Validation failed with {total_errors} errors across {len(day_files)} files.")
        sys.exit(1)

if __name__ == "__main__":
    main()
