import json, os

with open('/tmp/sa.json') as f:
    sa = json.load(f)

one_line = json.dumps(sa)
json.loads(one_line)

with open('.env') as f:
    content = f.read()

lines = content.split('\n')
new_lines = []
in_sa_key = False
for line in lines:
    if line.startswith('GOOGLE_SA_KEY_JSON'):
        in_sa_key = True
        continue
    if in_sa_key:
        if "googleapis.com" in line:
            in_sa_key = False
            continue
        continue
    new_lines.append(line)

while new_lines and new_lines[-1].strip() == '':
    new_lines.pop()

new_lines.append('')
new_lines.append('GOOGLE_SA_KEY_JSON=' + one_line)

with open('.env', 'w') as f:
    f.write('\n'.join(new_lines) + '\n')

os.remove('/tmp/sa.json')
print('Done! Key length: ' + str(len(one_line)))
