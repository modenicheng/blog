import os

directory = 'C:\\Users\\cheng\\coding\\blog\\docs\\.vuepress\\public\\data'
with os.scandir(directory) as entries:
    files = [entry.name for entry in entries if entry.is_file()]

for file in files:
    if file.endswith('.json'):
        print(f"::: chartjs\n\n```json\n<!-- @include: ../.veupress/data/public/data/{file} -->\n```\n\n:::\n")
