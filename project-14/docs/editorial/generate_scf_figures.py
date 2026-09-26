"""Generate the article's static scientific figures from pinned closeout reports.

Run: python generate_figures.py --gpo /path/to/GPO --output /path/to/img/scf-corpus
Requires matplotlib. Figures are measurements except the explicitly labeled SVG schematic.
"""
import argparse
import hashlib
import json
import re
from pathlib import Path

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.font_manager import fontManager

p = argparse.ArgumentParser()
p.add_argument('--gpo', type=Path, required=True)
p.add_argument('--output', type=Path, required=True)
p.add_argument('--font', type=Path)
a = p.parse_args()
a.output.mkdir(parents=True, exist_ok=True)
font = 'DejaVu Sans'
if a.font:
    fontManager.addfont(str(a.font))
    from matplotlib.font_manager import FontProperties
    font = FontProperties(fname=str(a.font)).get_name()
plt.rcParams.update({'font.family': font, 'font.size': 11, 'text.color': '#252830',
                     'axes.labelcolor': '#555b65', 'xtick.color': '#555b65',
                     'ytick.color': '#252830', 'axes.edgecolor': '#d7dce2',
                     'svg.fonttype': 'path', 'svg.hashsalt': 'project14-scf-20260922'})
pink, ink, gray = '#FF0860', '#252830', '#DDE2E8'
rel = 'docs/research/soc-dataset-quality/campaign-closeout001/REPORT.md'
report = (a.gpo / rel).read_text()
rows = []
for line in report.splitlines():
    if re.match(r'^\| [a-z0-9]', line):
        cells = [s.strip() for s in line.strip('|').split('|')]
        rows.append(dict(family=cells[0], split=cells[1], roots=int(cells[2]),
                         trajectories=int(cells[3]), endpoints=int(cells[4])))
assert len(rows) == 23
assert sum(r['trajectories'] for r in rows) == 314
assert sum(r['endpoints'] for r in rows) == 32
assert sum(r['endpoints'] == 0 for r in rows) == 15
unqualified = int(re.search(r'There are (\d+) backend-converged', report)[1])
censored = int(re.search(r'and (\d+) censored histories', report)[1])
assert 32 + unqualified + censored == 314

def save(fig, name, title, description):
    fig.savefig(a.output / f'{name}.svg', facecolor='white',
                metadata={'Date': None, 'Title': title, 'Description': description})
    plt.close(fig)

# Three exhaustive trajectory outcomes; bars share the same absolute count scale.
fig, ax = plt.subplots(figsize=(8.2, 3.4))
fig.subplots_adjust(left=.055, right=.95, top=.79, bottom=.20)
fig.text(.055, .94, '314 trajectories, three different outcomes', fontsize=16)
names = ['Qualified electronic endpoint', 'Backend converged, unqualified', 'Censored']
counts = [32, unqualified, censored]
for y, (name, n, color) in enumerate(zip(names, counts, [pink, ink, gray])):
    ax.barh(y, n, height=.23, color=color)
    ax.text(0, y-.22, name, fontsize=11, va='bottom')
    ax.text(n+4, y, f'{n}  /  {n/314:.1%}', va='center', fontsize=11)
ax.set_xlim(0, 278); ax.set_ylim(2.42, -.55)
ax.set_yticks([]); ax.set_xticks([0, 50, 100, 150, 200, 250])
ax.set_xlabel('Number of trajectories', labelpad=9)
for s in ['left', 'right', 'top']: ax.spines[s].set_visible(False)
ax.tick_params(axis='both', length=0)
save(fig, 'outcomes', 'Trajectory outcomes', '32 qualified endpoints, 62 backend-converged unqualified histories, 220 censored histories. Electronic qualification is not a global ground-state claim.')

# Group by frozen split; endpoint overlays are a subset of each total.
ordered = sorted(rows, key=lambda r: (['train','validation','test'].index(r['split']), -r['trajectories'], r['family']))
fig, ax = plt.subplots(figsize=(8.2, 9.6))
fig.subplots_adjust(left=.31, right=.88, top=.865, bottom=.08)
fig.text(.045, .958, 'Coverage is broader than endpoint qualification', fontsize=15)
fig.text(.045, .916, 'All trajectories', color='#78808b', fontsize=11)
fig.text(.27, .916, 'Qualified endpoints', color=pink, fontsize=11)
fig.text(.90, .916, 'ALL / END', fontsize=9, ha='center')
for i, r in enumerate(ordered):
    ax.barh(i, r['trajectories'], color=gray, height=.6)
    ax.barh(i, r['endpoints'], color=pink, height=.6)
    ax.text(1.02, i, f"{r['trajectories']} / {r['endpoints']}",
            transform=ax.get_yaxis_transform(), fontsize=10, va='center')
ax.set_yticks(range(23), [r['family'] for r in ordered], fontsize=10)
ax.invert_yaxis(); ax.set_xlim(0, 48); ax.set_ylim(22.8, -.8)
ax.set_xticks([0,10,20,30,40]); ax.set_xlabel('Trajectories per structural family', labelpad=12)
ax.set_axisbelow(True); ax.grid(axis='x', color='#eef0f3', linewidth=.7)
ax.tick_params(axis='both', length=0)
for s in ['left','right','top']: ax.spines[s].set_visible(False)
for split in ['train','validation','test']:
    inds=[i for i,r in enumerate(ordered) if r['split']==split]
    ax.text(-.50, (min(inds)+max(inds))/2, split.upper(), rotation=90,
            transform=ax.get_yaxis_transform(), va='center', ha='center', fontsize=9, color='#6e7682')
    if min(inds)>0: ax.axhline(min(inds)-.5, color='#cbd1d9', lw=.8)
save(fig,'family-coverage','Coverage across 23 frozen structural families',
     'Gray bars count trajectories; pink overlays count qualified endpoints. Rows grouped by frozen train, validation and test splits. Fifteen families have zero qualified endpoints.')

mae_rel='docs/research/prototype-discovery/mae-sensitivity134/REPORT.md'
mae_report=(a.gpo/mae_rel).read_text()
measurements=[]
for line in mae_report.splitlines():
    if re.match(r'^\| [46]x', line):
        c=[s.strip() for s in line.strip('|').split('|')]
        measurements.append({'mesh':c[0], 'smearing_Ry':float(c[1]), 'delta_meV_cell':float(c[2])})
assert len(measurements)==3
values=[m['delta_meV_cell'] for m in measurements]
baseline=values[0]
assert all(v>0 for v in values) and all(abs(v-baseline)>.05 for v in values[1:])
fig,ax=plt.subplots(figsize=(8.2,4.05))
fig.subplots_adjust(left=.31,right=.92,top=.72,bottom=.21)
fig.text(.055,.94,'Same directional preference. Different magnitude.',fontsize=15)
fig.text(.055,.87,'Fixed-potential band energies · Fe₁₂W₂B₈',fontsize=11,color='#626a75')
ax.axvspan(baseline-.05,baseline+.05,color=pink,alpha=.10,lw=0)
ax.axvline(baseline,color=pink,lw=1,ls=(0,(3,3)))
for i,v in enumerate(values):
    ax.plot([0,v],[i,i],color='#d0d5dd',lw=1.5)
    ax.plot(v,i,'o',color=ink if i==0 else pink,ms=8)
    ax.text(v+.06,i,f'{v:.3f}',va='center',fontsize=12)
ax.set_yticks([0,1,2],['Baseline\n4×4×12 · 0.010 Ry','Denser mesh\n6×6×12 · 0.010 Ry','Lower smearing\n4×4×12 · 0.005 Ry'])
ax.set_xlim(0,2.6);ax.set_ylim(2.55,-.55)
ax.set_xticks([0,.5,1,1.5,2,2.5]);ax.set_xlabel('a − c band energy (meV / cell)',labelpad=9)
ax.tick_params(axis='both',length=0,pad=8)
for s in ['left','right','top']:ax.spines[s].set_visible(False)
fig.text(.055,.045,'Pink band: baseline ± 0.05 meV/cell stability target; not an uncertainty interval.',fontsize=10,color='#626a75')
save(fig,'mae-sensitivity','Fe12W2B8 numerical sensitivity',
     'Positive values favor c over a. Baseline 1.501356, denser mesh 1.192877, lower smearing 2.180858 meV/cell. Both changes exceed 0.05 meV/cell; the physical MAE is not qualified.')

manifest={'snapshot':'2026-09-22','families':rows,'outcomes':dict(qualified=32,backend_converged_unqualified=unqualified,censored=censored),
          'mae':measurements,'sources':[{'report':Path(rel).parent.name+'/'+Path(rel).name,'sha256':hashlib.sha256((a.gpo/rel).read_bytes()).hexdigest()},
                                      {'report':Path(mae_rel).parent.name+'/'+Path(mae_rel).name,'sha256':hashlib.sha256((a.gpo/mae_rel).read_bytes()).hexdigest()}]}
(a.output/'figure-data.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Generated three source-bound figures; checked family totals, outcome totals, and MAE stability failure.')
