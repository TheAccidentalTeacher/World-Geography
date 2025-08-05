# PNG Slide Renumbering Script

This script is specifically designed to renumber your PNG slide presentation files across multiple folders, ensuring continuous numbering from the first folder through subsequent folders.

## What This Script Will Do

1. Keep your first folder's files as they are (numbered 1-47)
2. Renumber your second folder's files to start from 48 (instead of 1)
3. Preserve the descriptive part of each filename (everything after the number and underscore)

## Usage

```bash
python renumber_png_slides.py [OPTIONS] FOLDER1 FOLDER2 [FOLDER3...]
```

### Basic Example

For your specific case with the Geographic Detective Academy slides:

```bash
python renumber_png_slides.py folder1 folder2
```

This will:
- Keep folder1's files as they are (1_Geographic-Detective-Academy-Curriculum.png through 47_Mission-Complete-What-We-Learned.png)
- Renumber folder2's files to start from 48 (48_Geographic-Detective-Academy-Curriculum-Part-2.png, 49_CASE-4-MYSTERY-OF-THE-AMAZON-RIVER.png, etc.)

### Preview Changes (Recommended First Step)

To see what changes would be made without actually renaming any files:

```bash
python renumber_png_slides.py folder1 folder2 --dry-run
```

### Custom Starting Number

If you want to start the second folder from a specific number other than 48:

```bash
python renumber_png_slides.py folder1 folder2 --start-from 50
```

## Example of Renumbering

Original files in folder2:
```
1_Geographic-Detective-Academy-Curriculum-Part-2.png
2_CASE-4-MYSTERY-OF-THE-AMAZON-RIVER.png
3_Case-Briefing-The-Mysterious-River-Change.png
...
```

After renumbering:
```
48_Geographic-Detective-Academy-Curriculum-Part-2.png
49_CASE-4-MYSTERY-OF-THE-AMAZON-RIVER.png
50_Case-Briefing-The-Mysterious-River-Change.png
...
```

## Tips

1. Always use the `--dry-run` option first to preview changes
2. Back up your files before running the script
3. Make sure your PNG files follow the expected naming pattern: number_title.png