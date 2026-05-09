import json

with open(r'f:\桌面\构式二代\constructions-main\tmp_exercises.json', 'r', encoding='utf-8') as f:
    exercises = json.load(f)

def esc(s):
    return s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n').replace('\r', '')

lines = []
lines.append('// V11 Exercise Bank - English Writing Practice')
lines.append('// Generated from V11.xlsx')
lines.append('// Levels: junior (Junior High), senior (Senior High)')
lines.append('// Types: D1 (Micro Continuation), D2 (Long Continuation), T1 (C-E Translation)')
lines.append('')
lines.append('export interface V11Exercise {')
lines.append('  id: string')
lines.append('  level: "junior" | "senior"')
lines.append('  type: "D1" | "D2" | "T1"')
lines.append('  theme: string')
lines.append('  context: string')
lines.append('  task: string')
lines.append('  wordCount: string')
lines.append('  targetConstructions: string')
lines.append('  referenceAnswer: string')
lines.append('}')
lines.append('')
lines.append('export const v11Exercises: V11Exercise[] = [')

for i, ex in enumerate(exercises):
    lines.append('  {')
    lines.append(f"    id: '{esc(ex['id'])}',")
    lines.append(f"    level: '{ex['level']}',")
    lines.append(f"    type: '{ex['type']}',")
    lines.append(f"    theme: '{esc(ex['theme'])}',")
    lines.append(f"    context: '{esc(ex['context'])}',")
    lines.append(f"    task: '{esc(ex['task'])}',")
    lines.append(f"    wordCount: '{esc(ex['wordCount'])}',")
    lines.append(f"    targetConstructions: '{esc(ex['targetConstructions'])}',")
    lines.append(f"    referenceAnswer: '{esc(ex['referenceAnswer'])}',")
    lines.append('  },')

lines.append(']')
lines.append('')
lines.append('export const getExercisesByLevel = (level: string) => v11Exercises.filter(e => e.level === level)')
lines.append('export const getExercisesByType = (type: string) => v11Exercises.filter(e => e.type === type)')
lines.append('export const getExerciseById = (id: string) => v11Exercises.find(e => e.id === id)')
lines.append('')
lines.append('export const levelNames: Record<string, string> = {')
lines.append('  junior: "Junior High",')
lines.append('  senior: "Senior High",')
lines.append('}')
lines.append('')
lines.append('export const typeNames: Record<string, string> = {')
lines.append('  D1: "Micro Continuation Writing",')
lines.append('  D2: "Long Continuation Writing",')
lines.append('  T1: "Chinese-English Translation",')
lines.append('}')

content = '\n'.join(lines)
with open(r'f:\桌面\构式二代\constructions-main\src\data\exercises-v4.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print(f'Generated exercises-v4.ts with {len(exercises)} exercises')
