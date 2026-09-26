"""Generate the SOC-SCF article's data figures from the public Hugging Face release.

Every measured figure is computed from project-14/soc-scf-trajectories; nothing is
read from private campaign notes. Conceptual diagrams live in the article itself.

    pip install numpy scipy matplotlib pillow zstandard
    hf download project-14/soc-scf-trajectories --repo-type dataset --local-dir soc-release \
        --include "metadata/*" "read_example.py" "MANIFEST.json" \
                  "metadata/routes/proto014-feal2-reference130-002.json" \
                  "raw/shard-00000.tar.zst" "raw/shard-00628.tar.zst" "raw/shard-00661.tar.zst"
    python generate_soc_scf_figures.py --release soc-release --output ../../static/img/soc-scf \
        --font ../../static/fonts/PPFraktionSans-Light.otf

The three raw shards hold the worked FeAl2 history: evaluations 1-10 and its endpoint (96).
"""
import argparse
import collections
import gzip
import hashlib
import io
import json
import math
import struct
import tarfile
from pathlib import Path

import numpy as np
import zstandard
from PIL import Image
from scipy.ndimage import map_coordinates

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap
from matplotlib.font_manager import FontProperties, fontManager

p = argparse.ArgumentParser()
p.add_argument('--release', type=Path, required=True)
p.add_argument('--output', type=Path, required=True)
p.add_argument('--font', type=Path)
a = p.parse_args()
out = a.output
(out / 'feal2').mkdir(parents=True, exist_ok=True)

font = 'DejaVu Sans'
if a.font:
    fontManager.addfont(str(a.font))
    font = FontProperties(fname=str(a.font)).get_name()
ink, muted, grid = '#252830', '#5b6471', '#e6e9ee'
pink, slate, gray = '#ff0860', '#4b515b', '#c9ced6'  # pink is the only accent
plt.rcParams.update({'font.family': font, 'font.size': 12, 'text.color': ink,
                     'axes.labelcolor': muted, 'xtick.color': muted, 'ytick.color': muted,
                     'axes.edgecolor': grid, 'svg.fonttype': 'path',
                     'svg.hashsalt': 'project14-soc-scf-release', 'mathtext.fontset': 'custom',
                     'mathtext.rm': font, 'mathtext.it': font, 'mathtext.bf': font, 'mathtext.fallback': 'stixsans'})

BOHR_A = 0.529177210903
RY_EV = 13.605693122994
TRAJECTORY = 'proto014-feal2-reference130-002'
REL = a.release
# Measured anisotropy energies, in meV/atom: bcc Fe 1.4 ueV/atom (Xie & Blackman, PRB 69, 172407,
# experimental reference lines) to L1_0 FePt, up to 1.76 meV per FePt pair (Staunton et al., PRL 93, 257204).
MAE_REFERENCE_BAND = (1.4e-3, 1.76 / 2, 'measured anisotropy energies:\nbcc Fe 1.4 μeV/atom → L1₀ FePt ≈ 0.9 meV/atom')


def jsonl(name):
    opener = gzip.open if name.endswith('.gz') else open
    with opener(REL / name, 'rt') as f:
        return [json.loads(line) for line in f]


# ----------------------------------------------------------------------------
# Release metadata
# ----------------------------------------------------------------------------
summary = json.loads((REL / 'metadata/summary.json').read_text())
trajectories = {t['trajectory']: t for t in jsonl('metadata/trajectories.jsonl')}
histories = collections.defaultdict(list)
for r in jsonl('metadata/scalar-histories.jsonl.gz'):
    histories[r['trajectory']].append(r)
for v in histories.values():
    v.sort(key=lambda r: r['sequence'])
occurrences = jsonl('metadata/occurrences.jsonl.gz')

assert len(trajectories) == summary['trajectories'] == 310
assert len(occurrences) == summary['source_occurrences'] == 49007
assert len({o['canonical_map_id'] for o in occurrences}) == summary['canonical_maps'] == 47198
assert len({t['family'] for t in trajectories.values()}) == summary['families'] == 22
outcomes = collections.Counter(t['qualification']['outcome'] for t in trajectories.values())
assert outcomes == collections.Counter(summary['outcomes'])


# ----------------------------------------------------------------------------
# FeAl2 fields: decode exactly as read_example.py does, with hash checks
# ----------------------------------------------------------------------------
route = json.loads((REL / f'metadata/routes/{TRAJECTORY}.json').read_text())
ctx = route['context']
wanted_sequences = set(range(1, 10)) | {96}
wanted = collections.defaultdict(list)
for m in route['maps']:
    if m['sequence'] in wanted_sequences:
        for role, ref in m['fields'].items():
            wanted[ref['sha256']].append((m['sequence'], role, ref))


def decode(payload, ref, role):
    assert len(payload) == ref['bytes'] and hashlib.sha256(payload).hexdigest() == ref['sha256']
    if ref['encoding'] == 'qe-grid1':
        assert payload[:8] == b'GPOGRID1'
        assert struct.unpack('<7q', payload[8:64]) == (*ctx['dims'], *ctx['padded'], 4)
        payload = payload[64:]
    arr = np.frombuffer(payload, dtype='<f8').reshape((4, *reversed(ctx['dims']))).copy()
    if ref['encoding'] == 'qe-grid1':
        arr *= RY_EV if role == 'potential' else 1 / BOHR_A**3
    return arr


fields = {}
for shard in ['raw/shard-00000.tar.zst', 'raw/shard-00628.tar.zst', 'raw/shard-00661.tar.zst']:
    with open(REL / shard, 'rb') as src, zstandard.ZstdDecompressor().stream_reader(src) as stream, \
            tarfile.open(fileobj=stream, mode='r|') as archive:
        for member in archive:
            digest = member.name.rsplit('/', 1)[-1]
            if digest in wanted:
                payload = archive.extractfile(member).read()
                for seq, role, ref in wanted[digest]:
                    fields[(seq, role)] = decode(payload, ref, role)
assert len(fields) == 3 * len(wanted_sequences), sorted(fields)

dv = ctx['volume_bohr3'] * BOHR_A**3 / np.prod(ctx['dims'])
feal2 = histories[TRAJECTORY]
for seq in sorted(wanted_sequences):
    din, dout = fields[(seq, 'input-density')], fields[(seq, 'output-density')]
    assert abs(din[0].sum() * dv - ctx['nelec']) < 1e-6 and abs(dout[0].sum() * dv - ctx['nelec']) < 1e-6
    delta = dout - din
    charge = np.abs(delta[0]).sum() * dv / ctx['nat']
    spin = np.linalg.norm(delta[1:], axis=0).sum() * dv / ctx['nat']
    published = feal2[seq - 1]['component_residuals_e_per_atom']
    assert math.isclose(charge, published['charge_l1'], rel_tol=1e-6)
    assert math.isclose(spin, published['magnetization_vector_l1'], rel_tol=1e-6)

# Checks quoted in the article.
end_in, end_pot, end_out = (fields[(96, r)] for r in ('input-density', 'potential', 'output-density'))
m = end_out[1:]
net_moment = m.reshape(3, -1).sum(1) * dv
m_abs = np.linalg.norm(m, axis=0)
b = end_pot[1:]
b_abs = np.linalg.norm(b, axis=0)
significant = m_abs > 0.01 * m_abs.max()
cosine = (m * b).sum(0)[significant] / (m_abs * b_abs)[significant]
facts = {
    'electrons': float(end_out[0].sum() * dv),
    'net_moment_e': net_moment.tolist(),
    'abs_moment_integral_e': float(m_abs.sum() * dv),
    'negative_mz_integral_e': float(m[2][m[2] < 0].sum() * dv),
    'max_transverse_over_max_mz': float(max(np.abs(m[0]).max(), np.abs(m[1]).max()) / m[2].max()),
    'b_collinear_fraction_where_m_gt_1pct': float((np.abs(cosine) > 0.9999).mean()),
    'b_antiparallel_fraction_where_m_gt_1pct': float((cosine < -0.9999).mean()),
    'grid_points': int(np.prod(ctx['dims'])),
    'valence_electrons': ctx['nelec'],
    'total_energy_final_ry': feal2[-1]['reported_total_energy_ry'],
}

# ----------------------------------------------------------------------------
# Resample onto Cartesian planes of the conventional C16 cell
# ----------------------------------------------------------------------------
lattice = np.array(ctx['lattice_columns_in_bohr']) * BOHR_A      # rows a1, a2, a3 in Angstrom
to_fractional = np.linalg.inv(lattice.T)
A_CONV = float(np.linalg.norm(lattice[1] + lattice[2]))          # a = |a2 + a3|
C_CONV = float(np.linalg.norm(lattice[0] + lattice[1]))          # c = |a1 + a2|
assert abs(A_CONV - 6.04) < 1e-6 and abs(C_CONV - 4.86) < 1e-6
LAYERS = {'fe': C_CONV / 4, 'al': 0.0}                           # Fe layer; Al layer
N = 320


def plane(z, n=N):
    u = (np.arange(n) + 0.5) / n * A_CONV - A_CONV / 2
    x, y = np.meshgrid(u, u)
    return np.stack([x, y, np.full_like(x, z)], -1)


def sample(field, z, n=N):
    frac = plane(z, n).reshape(-1, 3) @ to_fractional.T
    nz, ny, nx = field.shape
    coords = np.stack([frac[:, 2] * nz, frac[:, 1] * ny, frac[:, 0] * nx])
    return map_coordinates(field, coords, order=3, mode='grid-wrap').reshape(n, n)[::-1]  # north up


def sample_section(field, origin, e1, e2, n1, n2):
    """Sample on origin + i*e1/n1 + j*e2/n2 (cell-centred), returned with e2 pointing up."""
    i, j = np.meshgrid((np.arange(n1) + 0.5) / n1, (np.arange(n2) + 0.5) / n2)
    pts = origin + i[..., None] * e1 + j[..., None] * e2
    frac = pts.reshape(-1, 3) @ to_fractional.T
    nz, ny, nx = field.shape
    coords = np.stack([frac[:, 2] * nz, frac[:, 1] * ny, frac[:, 0] * nx])
    return map_coordinates(field, coords, order=3, mode='grid-wrap').reshape(n2, n1)[::-1]


# Vertical (110) section through one Fe chain: [110] across, c up. Fe sits at (0, c/4) and (0, 3c/4).
SECTION_HALF = A_CONV * math.sqrt(2) / 4
SECTION = dict(origin=np.array([-SECTION_HALF / math.sqrt(2), -SECTION_HALF / math.sqrt(2), 0.0]),
               e1=np.array([2 * SECTION_HALF / math.sqrt(2)] * 2 + [0.0]), e2=np.array([0.0, 0.0, C_CONV]),
               n1=240, n2=int(round(240 * C_CONV / (2 * SECTION_HALF))))
SECTION_ATOMS = [('Fe', 0.5, 0.75), ('Fe', 0.5, 0.25)]  # (x from left, y from top) fractions


# Atom sites near each layer, from the retained QE input for this trajectory.
qe_input = (REL / f"metadata/inputs/{trajectories[TRAJECTORY]['input_sha256']}.in").read_text()
lines = qe_input.split('ATOMIC_POSITIONS crystal')[1].split('K_POINTS')[0].strip().splitlines()
sites = [(l.split()[0].rstrip('0123456789'), np.array(list(map(float, l.split()[1:4])))) for l in lines]
atoms = {}
for layer, z in LAYERS.items():
    found = []
    for species, frac in sites:
        for shift in np.array(np.meshgrid(*[[-1, 0, 1]] * 3)).reshape(3, -1).T:
            r = (frac + shift) @ lattice
            for dx in (-A_CONV, 0, A_CONV):
                for dy in (-A_CONV, 0, A_CONV):
                    x, y = r[0] + dx, r[1] + dy
                    if abs(((r[2] - z + C_CONV / 2) % C_CONV) - C_CONV / 2) < 0.05 and \
                            -A_CONV / 2 - 1e-6 <= x <= A_CONV / 2 + 1e-6 and -A_CONV / 2 - 1e-6 <= y <= A_CONV / 2 + 1e-6:
                        found.append((species, round(x / A_CONV + 0.5, 4), round(0.5 - y / A_CONV, 4)))
    atoms[layer] = sorted(set(found))
assert {s for s, *_ in atoms['fe']} == {'Fe'} and {s for s, *_ in atoms['al']} == {'Al'}

# ----------------------------------------------------------------------------
# Color scales (site palette; sequential = one hue, diverging = two hues + gray)
# ----------------------------------------------------------------------------
cm_ink = LinearSegmentedColormap.from_list('ink', ['#f8f9fb', '#9aa1ab', '#262830'])
cm_div = LinearSegmentedColormap.from_list('div', ['#1f2228', '#4b515b', '#b8bdc5', '#eef0f3', '#ffb3cb', '#ff0860', '#a3003a'])
cm_pink = LinearSegmentedColormap.from_list('pink', ['#fdf3f6', '#ff9fbf', '#ff0860', '#7a0730'])
cm_slate = LinearSegmentedColormap.from_list('slate', ['#1f2228', '#5b6471', '#c3c8cf', '#f5f6f8'])


def asinh_scale(scale, limit):
    top = math.asinh(limit / scale)
    return lambda v: 0.5 + 0.5 * np.clip(np.arcsinh(v / scale) / top, -1, 1)


def log_scale(lo, hi):
    return lambda v: np.clip((np.log10(np.maximum(np.abs(v), 1e-30)) - lo) / (hi - lo), 0, 1)


def linear_scale(lo, hi):
    return lambda v: np.clip((v - lo) / (hi - lo), 0, 1)


def ticks(norm, values, fmt):
    return [{'value': fmt(v), 'at': round(float(norm(np.array(v))), 4)} for v in values]


def gradient(cmap, n=13):
    return ['#%02x%02x%02x' % tuple(int(round(255 * c)) for c in cmap(i / (n - 1))[:3]) for i in range(n)]


spin_norm = asinh_scale(0.002, 4.0)
b_norm = asinh_scale(0.02, 2.5)
CHANNELS = {
    'input-n': dict(label='Input charge density n', unit='e/Å³', cmap=cm_ink, norm=log_scale(-1.7, 1.4),
                    get=lambda s: fields[(s, 'input-density')][0],
                    ticks=([0.01, 0.1, 1, 10], lambda v: f'{v:g}'), scale='log₁₀ scale'),
    'input-mz': dict(label='Input spin density m_z', unit='e/Å³', cmap=cm_div, norm=spin_norm,
                     get=lambda s: fields[(s, 'input-density')][3],
                     ticks=([-1, -0.01, 0, 0.01, 0.1, 1], lambda v: f'{v:g}'.replace('-', '−')),
                     scale='signed asinh scale'),
    'residual-n': dict(label='Charge residual |n_out − n_in|', unit='e/Å³', cmap=cm_pink, norm=log_scale(-7, 0.5),
                       get=lambda s: fields[(s, 'output-density')][0] - fields[(s, 'input-density')][0],
                       ticks=([1e-7, 1e-5, 1e-3, 1e-1], lambda v: f'1e{int(round(math.log10(v)))}'.replace('-', '−')),
                       scale='log₁₀ scale'),
    'residual-m': dict(label='Spin residual |m_out − m_in|', unit='e/Å³', cmap=cm_pink, norm=log_scale(-7, 0.5),
                       get=lambda s: np.linalg.norm(fields[(s, 'output-density')][1:] - fields[(s, 'input-density')][1:], axis=0),
                       ticks=([1e-7, 1e-5, 1e-3, 1e-1], lambda v: f'1e{int(round(math.log10(v)))}'.replace('-', '−')),
                       scale='log₁₀ scale'),
    'v0': dict(label='Scalar local potential V₀', unit='eV', cmap=cm_slate, norm=linear_scale(-40, 5),
               get=lambda s: fields[(s, 'potential')][0],
               ticks=([-40, -30, -20, -10, 0], lambda v: f'{v:g}'.replace('-', '−')), scale='linear; ≤ −40 eV shown darkest'),
    'bz': dict(label='Spin-dependent potential B_z', unit='eV', cmap=cm_div, norm=b_norm,
               get=lambda s: fields[(s, 'potential')][3],
               ticks=([-1, -0.1, 0, 0.1, 1], lambda v: f'{v:g}'.replace('-', '−')), scale='signed asinh scale'),
}

manifest = {'trajectory': TRAJECTORY, 'formula': 'FeAl₂', 'family': trajectories[TRAJECTORY]['family'],
            'a_angstrom': A_CONV, 'c_angstrom': C_CONV, 'layers': {'fe': 'Fe layer · z = c/4', 'al': 'Al layer · z = 0'},
            'atoms': atoms, 'iterations': sorted(wanted_sequences), 'channels': {}, 'history': []}
for key, ch in CHANNELS.items():
    manifest['channels'][key] = {'label': ch['label'], 'unit': ch['unit'], 'scale': ch['scale'],
                                 'gradient': gradient(ch['cmap']), 'ticks': ticks(ch['norm'], *ch['ticks'])}
    for seq in sorted(wanted_sequences):
        for layer, z in LAYERS.items():
            values = sample(ch['get'](seq), z)
            if key.startswith('residual-n'):
                values = np.abs(values)
            rgb = (ch['cmap'](ch['norm'](values))[..., :3] * 255).round().astype(np.uint8)
            Image.fromarray(rgb).save(out / 'feal2' / f'{key}-{layer}-{seq:02d}.webp', quality=88, method=6)
for r in feal2:
    c = r['component_residuals_e_per_atom']
    manifest['history'].append([r['sequence'], float(f"{c['charge_l1']:.4g}"), float(f"{c['magnetization_vector_l1']:.4g}"),
                                round(float(np.linalg.norm(r['spin_vector_from_density_muB'])), 3)])
manifest['facts'] = facts
(out / 'feal2' / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, separators=(',', ':')))
print('FeAl2 checks', json.dumps(facts, indent=1))


# ----------------------------------------------------------------------------
# Static composites built from the same slices
# ----------------------------------------------------------------------------
def save_svg(fig, name, title, description):
    fig.savefig(out / f'{name}.svg', facecolor='white',
                metadata={'Date': None, 'Title': title, 'Description': description})
    plt.close(fig)


def save_raster(fig, name):
    buffer = io.BytesIO()
    fig.savefig(buffer, format='png', dpi=200, facecolor='white')
    plt.close(fig)
    Image.open(buffer).convert('RGB').save(out / f'{name}.webp', quality=90, method=6)


def draw_atoms(ax, layer, n=N):
    for species, x, y in atoms[layer]:
        ax.scatter([x * n], [y * n], s=26, facecolors='none', edgecolors='white', linewidths=2.2, zorder=3)
        ax.scatter([x * n], [y * n], s=26, facecolors='none', edgecolors=ink, linewidths=0.9, zorder=4)


def colorbar(fig, rect, key, title):
    ch = CHANNELS[key]
    ax = fig.add_axes(rect)
    ax.imshow(np.linspace(0, 1, 256)[None, :], aspect='auto', cmap=ch['cmap'], extent=(0, 1, 0, 1))
    values, fmt = ch['ticks']
    ax.set_xticks([float(ch['norm'](np.array(v))) for v in values], [fmt(v) for v in values], fontsize=10)
    ax.set_yticks([])
    ax.tick_params(length=2, pad=2)
    for spine in ax.spines.values():
        spine.set_visible(False)
    ax.set_title(title, fontsize=10.5, loc='left', color=muted, pad=5)


def tile(ax, values, key, layer):
    ch = CHANNELS[key]
    ax.imshow(ch['cmap'](ch['norm'](values)), interpolation='bilinear')
    draw_atoms(ax, layer)
    ax.set_xticks([]); ax.set_yticks([])
    for spine in ax.spines.values():
        spine.set_color('#dfe3e8'); spine.set_linewidth(0.6)


# Hero: the input spin density at five points of one qualified history.
hero_steps = [1, 3, 5, 9, 96]
fig = plt.figure(figsize=(8.4, 4.35))
width, gap, left = 0.158, 0.012, 0.105
for col, seq in enumerate(hero_steps):
    for row, layer in enumerate(['fe', 'al']):
        ax = fig.add_axes([left + col * (width + gap), 0.47 - row * 0.335, width, 0.305])
        tile(ax, sample(CHANNELS['input-mz']['get'](seq), LAYERS[layer]), 'input-mz', layer)
    c = feal2[seq - 1]['component_residuals_e_per_atom']
    fig.text(left + col * (width + gap), 0.86, f'Evaluation {seq}', fontsize=12)
    mant, expo = f"{c['magnetization_vector_l1']:.1e}".split('e')
    fig.text(left + col * (width + gap), 0.812, rf'spin residual ${mant}\times10^{{{int(expo)}}}$',
             fontsize=9.5, color=muted)
fig.text(0.012, 0.62, 'Fe layer', fontsize=11.5, rotation=90, va='center')
fig.text(0.012, 0.285, 'Al layer', fontsize=11.5, rotation=90, va='center')
fig.text(0.052, 0.62, 'z = c/4', fontsize=9.5, rotation=90, va='center', color=muted)
fig.text(0.052, 0.285, 'z = 0', fontsize=9.5, rotation=90, va='center', color=muted)
colorbar(fig, [0.105, 0.035, 0.45, 0.03], 'input-mz', 'Input spin density $m_z$ · e/Å³ · signed asinh scale')
fig.text(0.60, 0.028, 'FeAl₂ (C16 prototype), qualified history\nspin residual: L1, electrons per atom',
         fontsize=9, color=muted, linespacing=1.4)
save_raster(fig, 'hero-spin-emergence')

# Anatomy: one evaluation = input density, local potential and output density, on one section.
anat_seq = 1
aspect = SECTION['n2'] / SECTION['n1']
fig = plt.figure(figsize=(8.4, 9.3))
rows = [('Input density', 'input-density', ['$n$', '$m_x$', '$m_y$', '$m_z$']),
        ('Effective local potential', 'potential', ['$V_0$', '$B_x$', '$B_y$', '$B_z$']),
        ('Output density', 'output-density', ['$n$', '$m_x$', '$m_y$', '$m_z$'])]
tile_w = 0.215
tile_h = tile_w * aspect * 8.4 / 9.3
for r, (name, role, labels) in enumerate(rows):
    y0 = 0.70 - r * 0.285
    fig.text(0.035, y0 + tile_h + 0.02, name, fontsize=13)
    for c in range(4):
        ax = fig.add_axes([0.035 + c * 0.24, y0, tile_w, tile_h])
        raw = sample_section(fields[(anat_seq, role)][c], **SECTION)
        key = ('v0' if c == 0 else 'bz') if role == 'potential' else ('input-n' if c == 0 else 'input-mz')
        ch = CHANNELS[key]
        ax.imshow(ch['cmap'](ch['norm'](raw)), interpolation='bilinear')
        for species, x, y in SECTION_ATOMS:
            ax.scatter([x * SECTION['n1']], [y * SECTION['n2']], s=26, facecolors='none', edgecolors='white', linewidths=2.2, zorder=3)
            ax.scatter([x * SECTION['n1']], [y * SECTION['n2']], s=26, facecolors='none', edgecolors=ink, linewidths=0.9, zorder=4)
        ax.set_xticks([]); ax.set_yticks([])
        for spine in ax.spines.values():
            spine.set_color('#dfe3e8'); spine.set_linewidth(0.6)
        peak = np.abs(fields[(anat_seq, role)][c]).max()
        note = 'exactly 0' if peak == 0 else ''
        ax.text(0.04, 0.965, labels[c], transform=ax.transAxes, fontsize=13, va='top',
                bbox=dict(boxstyle='square,pad=0.25', fc='white', ec='none', alpha=0.9))
        if note:
            ax.text(0.5, 0.06, note, transform=ax.transAxes, fontsize=10.5, ha='center', color=muted,
                    bbox=dict(boxstyle='square,pad=0.25', fc='white', ec='none', alpha=0.9))
for i, (key, title) in enumerate([('input-n', '$n$ · e/Å³ · log scale'), ('input-mz', '$m_x, m_y, m_z$ · e/Å³ · asinh'),
                                  ('v0', '$V_0$ · eV · ≤ −40 darkest'), ('bz', '$B_x, B_y, B_z$ · eV · asinh')]):
    colorbar(fig, [0.035 + i * 0.24, 0.06, tile_w, 0.014], key, title)
save_raster(fig, 'record-anatomy')


# ----------------------------------------------------------------------------
# Metadata charts (SVG)
# ----------------------------------------------------------------------------
def clean(ax, grid_axis='y'):
    for s in ['top', 'right', 'left']:
        ax.spines[s].set_visible(False)
    ax.spines['bottom'].set_color('#cfd5dd')
    ax.tick_params(length=0, pad=6)
    if grid_axis:
        ax.grid(axis=grid_axis, color='#eef0f3', linewidth=0.8)
        ax.set_axisbelow(True)


outcome_color = {'qualified_endpoint': pink, 'backend_converged_without_qualified_endpoint': slate,
                 'censored_without_conventional_convergence': gray}
outcome_label = {'qualified_endpoint': 'Qualified endpoint',
                 'backend_converged_without_qualified_endpoint': 'Solver converged, not qualified',
                 'censored_without_conventional_convergence': 'Censored'}

# Outcomes as one part-to-whole bar; the legend row carries names and counts.
from matplotlib.patches import Rectangle
order_keys = ['qualified_endpoint', 'backend_converged_without_qualified_endpoint', 'censored_without_conventional_convergence']
fig, ax = plt.subplots(figsize=(8.2, 1.45))
fig.subplots_adjust(left=0.02, right=0.98, top=0.88, bottom=0.42)
x = 0
for key in order_keys:
    n = outcomes[key]
    ax.barh(0, n - 1.5, left=x, height=0.6, color=outcome_color[key])
    ax.text(x, 0.42, f'{n}', fontsize=15, va='bottom')
    x += n
ax.set_xlim(0, 310); ax.set_ylim(-0.4, 1.0); ax.axis('off')
lx = 0.02
for key in order_keys:
    fig.patches.append(Rectangle((lx, 0.135), 0.014, 0.07, transform=fig.transFigure, color=outcome_color[key]))
    fig.text(lx + 0.022, 0.14, outcome_label[key], fontsize=11, color=muted)
    lx += 0.022 + len(outcome_label[key]) * 0.0105 + 0.04
save_svg(fig, 'outcomes', 'Trajectory outcomes',
         '32 qualified electronic endpoints, 62 solver-converged histories without qualification, 216 censored histories.')

# Family coverage grouped by frozen split.
fam = collections.defaultdict(lambda: {'n': 0, 'q': 0, 'roots': set()})
for t in trajectories.values():
    f = fam[t['family']]; f['n'] += 1; f['split'] = t['split']; f['roots'].add(t['root'])
    f['q'] += t['qualification']['outcome'] == 'qualified_endpoint'
ordered = sorted(fam.items(), key=lambda kv: (['train', 'validation', 'test'].index(kv[1]['split']), -kv[1]['n'], kv[0]))
fig, ax = plt.subplots(figsize=(8.2, 8.6))
fig.subplots_adjust(left=0.30, right=0.88, top=0.90, bottom=0.07)
fig.text(0.04, 0.955, '22 structural families, grouped by frozen split', fontsize=15)
fig.patches.append(Rectangle((0.04, 0.925), 0.016, 0.012, transform=fig.transFigure, color='#d5dae1'))
fig.text(0.064, 0.925, 'All histories', fontsize=11.5, color=muted)
fig.patches.append(Rectangle((0.22, 0.925), 0.016, 0.012, transform=fig.transFigure, color=pink))
fig.text(0.244, 0.925, 'Qualified endpoints', fontsize=11.5, color=muted)
fig.text(0.905, 0.925, 'all / qualified', fontsize=10, ha='center', color=muted)
for i, (name, f) in enumerate(ordered):
    ax.barh(i, f['n'], color='#d5dae1', height=0.62)
    if f['q']:
        ax.barh(i, f['q'], color=pink, height=0.62)
    ax.text(1.03, i, f"{f['n']} / {f['q']}", transform=ax.get_yaxis_transform(), fontsize=11, va='center')
ax.set_yticks(range(len(ordered)), [n for n, _ in ordered], fontsize=11)
ax.invert_yaxis(); ax.set_xlim(0, 48)
ax.set_xlabel('Histories per family', labelpad=10)
clean(ax, 'x')
for split in ['train', 'validation', 'test']:
    idx = [i for i, (_, f) in enumerate(ordered) if f['split'] == split]
    ax.text(-0.47, (min(idx) + max(idx)) / 2, split.upper(), rotation=90, transform=ax.get_yaxis_transform(),
            va='center', ha='center', fontsize=10, color=muted)
    if min(idx) > 0:
        ax.axhline(min(idx) - 0.5, color='#cbd1d9', lw=0.8)
save_svg(fig, 'family-coverage', 'Coverage across 22 structural families',
         'Gray bars count histories; pink overlays count qualified endpoints. Grouped by frozen train, validation and test splits.')

# Every history: charge and spin residual by evaluation (small multiples, one scale).
fig, axes = plt.subplots(1, 2, figsize=(8.2, 3.9), sharey=True)
fig.subplots_adjust(left=0.09, right=0.98, top=0.76, bottom=0.16, wspace=0.08)
fig.text(0.09, 0.93, 'All 310 histories, residual by SCF evaluation', fontsize=15)
for lx, key in zip([0.09, 0.32, 0.70], ['censored_without_conventional_convergence', 'backend_converged_without_qualified_endpoint', 'qualified_endpoint']):
    fig.add_artist(plt.Line2D([lx, lx + 0.025], [0.865, 0.865], color=outcome_color[key], lw=2, transform=fig.transFigure))
    fig.text(lx + 0.032, 0.853, f'{outcome_label[key]} ({outcomes[key]})', fontsize=10.5, color=muted)
order = ['censored_without_conventional_convergence', 'backend_converged_without_qualified_endpoint', 'qualified_endpoint']
for ax, comp, title in zip(axes, ['charge_l1', 'magnetization_vector_l1'], ['Charge  ·  L1 of n_out − n_in', 'Spin  ·  L1 of |m_out − m_in|']):
    for key in order:
        for tname, t in trajectories.items():
            if t['qualification']['outcome'] != key:
                continue
            h = histories[tname]
            ax.plot([r['sequence'] for r in h], [r['component_residuals_e_per_atom'][comp] for r in h],
                    color=outcome_color[key], lw=0.7 if key != 'qualified_endpoint' else 0.9,
                    alpha=0.35 if key == 'censored_without_conventional_convergence' else 0.7)
    ax.set_yscale('log'); ax.set_ylim(1e-8, 5); ax.set_xlim(0, 725)
    ax.set_title(title, fontsize=11.5, loc='left', color=ink)
    ax.set_xlabel('SCF evaluation (not time)', labelpad=6)
    clean(ax)
axes[0].set_ylabel('Residual · electrons per atom')
save_raster(fig, 'residual-overview')  # 620 polylines: raster keeps the file small

# FeAl2: residuals and total-energy error share the evaluation axis (two panels, no dual axis).
seqs = [r['sequence'] for r in feal2]
e_final = feal2[-1]['reported_total_energy_ry']
fig, axes = plt.subplots(2, 1, figsize=(8.2, 5.6), sharex=True)
fig.subplots_adjust(left=0.11, right=0.97, top=0.86, bottom=0.10, hspace=0.28)
fig.text(0.11, 0.95, 'One qualified history: FeAl₂, 96 evaluations', fontsize=15)
ax = axes[0]
ax.plot(seqs, [r['component_residuals_e_per_atom']['charge_l1'] for r in feal2], color=slate, lw=2)
ax.plot(seqs, [r['component_residuals_e_per_atom']['magnetization_vector_l1'] for r in feal2], color=pink, lw=2)
ax.text(97.5, feal2[-1]['component_residuals_e_per_atom']['charge_l1'], 'charge', va='center', fontsize=11, color=ink)
ax.text(97.5, feal2[-1]['component_residuals_e_per_atom']['magnetization_vector_l1'], 'spin', va='center', fontsize=11, color=ink)
ax.set_yscale('log'); ax.set_ylim(1e-7, 3)
ax.set_ylabel('Residual · e/atom')
ax.set_title('Density residual (L1)', fontsize=11.5, loc='left')
clean(ax)
ax = axes[1]
# Total energies are logged to 1e-8 Ry; below that the difference is not resolved.
floor = 1e-8 * RY_EV * 1000 / ctx['nat']
err = [abs(r['reported_total_energy_ry'] - e_final) * RY_EV * 1000 / ctx['nat'] for r in feal2[:-1]]
resolved = next(i for i, e in enumerate(err) if e < floor)
facts['feal2_energy_below_print_precision_from'] = resolved + 1
facts['feal2_energy_below_fe_mae_from'] = next(i for i, e in enumerate(err) if e < MAE_REFERENCE_BAND[0]) + 1
ax.plot(seqs[:resolved], err[:resolved], color=ink, lw=2)
ax.axhline(floor, color='#cfd5dd', lw=1)
ax.text(resolved + 3, floor * 1.6, f'logged precision, 1e−8 Ry (not resolved from evaluation {resolved + 1})', fontsize=10, color=muted, va='bottom')
ax.set_yscale('log'); ax.set_ylim(1e-5, 1e4)
ax.set_ylabel('Energy error · meV/atom')
ax.set_title('Total-energy error, relative to the final evaluation', fontsize=11.5, loc='left')
ax.set_xlabel('SCF evaluation (not time)', labelpad=6)
ax.set_xlim(0, 108)
clean(ax)
lo, hi, label = MAE_REFERENCE_BAND
ax.axhspan(lo, hi, color=pink, alpha=0.10, lw=0)
ax.text(107, hi * 0.6, label, ha='right', va='top', fontsize=10, color=muted, linespacing=1.3)
save_svg(fig, 'feal2-history', 'FeAl2 residual and energy history',
         'Charge and spin residuals fall from about 1 to below 1e-5 e/atom over 96 evaluations; total energy settles faster.')

# Net moment direction during SCF for histories with a robust moment.
robust = []
for tname, h in histories.items():
    vecs = np.array([r['spin_vector_from_density_muB'] for r in h])
    mags = np.linalg.norm(vecs, axis=1)
    if mags.min() < 0.5:
        continue
    units = vecs / mags[:, None]
    angle = np.degrees(np.arccos(np.clip(units @ units[0], -1, 1)))
    robust.append((tname, [r['sequence'] for r in h], angle))
within2 = sum(a[-1] <= 2 for _, _, a in robust)
facts['robust_moment_histories'] = len(robust)
facts['robust_moment_final_within_2deg'] = int(within2)
highlight = {'proto033-alb2-feb2-tail130-001': 'FeB₂ (AlB₂ type), 720 evaluations',
             'proto033-alb2-feb2-mix130-001': 'FeB₂, mixing variant'}
fig, ax = plt.subplots(figsize=(8.2, 3.9))
fig.subplots_adjust(left=0.10, right=0.97, top=0.80, bottom=0.15)
fig.text(0.10, 0.93, 'How far the net spin moment turns during SCF', fontsize=15)
fig.text(0.10, 0.865, f'{len(robust)} histories whose net moment stays ≥ 0.5 μB throughout · angle from the first evaluation',
         fontsize=11, color=muted)
for tname, s, ang in robust:
    if tname not in highlight:
        ax.plot(s, ang, color=gray, lw=0.8, alpha=0.6)
for (tname, label), color in zip(highlight.items(), [pink, slate]):
    s, ang = next((s, ang) for t, s, ang in robust if t == tname)
    ax.plot(s, ang, color=color, lw=2)
    ax.text(s[-1] + 8, ang[-1], label, va='center', fontsize=10.5, color=ink)
ax.set_xlim(0, 1000); ax.set_ylim(0, 40)
ax.set_xticks([0, 160, 240, 480, 720])
ax.set_ylabel('Direction change · degrees')
ax.set_xlabel('SCF evaluation (not time)', labelpad=6)
clean(ax)
save_raster(fig, 'moment-direction')

# Histories that keep a solid moment for 40+ evaluations: is the moment still turning in the second half?
late = []
for tname, h in histories.items():
    vecs = np.array([r['spin_vector_from_density_muB'] for r in h])
    mags = np.linalg.norm(vecs, axis=1)
    if len(h) < 40 or mags.min() < 0.5:
        continue
    units = vecs / mags[:, None]
    turn = np.degrees(np.arccos(np.clip(units[len(h) // 2] @ units[-1], -1, 1)))
    late.append((turn > 0.5, trajectories[tname]['qualification']['outcome'] == 'qualified_endpoint',
                 h[-1]['component_residuals_e_per_atom']['magnetization_vector_l1']))
facts['late_turning'] = {
    'histories': len(late),
    'turning_in_second_half': int(sum(bool(t) for t, _, _ in late)),
    'turning_and_qualified': int(sum(bool(t and q) for t, q, _ in late)),
    'median_final_spin_residual_turning': float(np.median([s for t, _, s in late if t])),
    'median_final_spin_residual_still': float(np.median([s for t, _, s in late if not t])),
}

# FeB2: the spin residual stalls while the net moment slowly turns (two panels, shared evaluation axis).
feb2 = histories['proto033-alb2-feb2-tail130-001']
seq = [r['sequence'] for r in feb2]
vecs = np.array([r['spin_vector_from_density_muB'] for r in feb2])
units = vecs / np.linalg.norm(vecs, axis=1)[:, None]
turn = np.degrees(np.arccos(np.clip(units @ units[0], -1, 1)))
fig, axes = plt.subplots(2, 1, figsize=(8.2, 5.2), sharex=True, gridspec_kw={'height_ratios': [1.25, 1]})
fig.subplots_adjust(left=0.11, right=0.9, top=0.8, bottom=0.11, hspace=0.3)
fig.text(0.11, 0.945, 'FeB₂: spin stalls while the moment slowly turns', fontsize=15)
fig.text(0.11, 0.895, 'Censored history, 720 evaluations · AlB₂-type structure', fontsize=11, color=muted)
ax = axes[0]
charge = [r['component_residuals_e_per_atom']['charge_l1'] for r in feb2]
spin = [r['component_residuals_e_per_atom']['magnetization_vector_l1'] for r in feb2]
ax.plot(seq, charge, color=slate, lw=1.6)
ax.plot(seq, spin, color=pink, lw=1.6)
ax.text(728, spin[-1], 'spin', va='center', fontsize=11)
ax.text(728, charge[-1], 'charge', va='center', fontsize=11)
ax.set_yscale('log'); ax.set_ylim(1e-6, 1)
ax.set_ylabel('Residual · e/atom')
ax.set_title('Density residual (L1)', fontsize=11, loc='left')
clean(ax)
ax = axes[1]
ax.plot(seq, turn, color=ink, lw=1.6)
ax.set_ylim(0, 40); ax.set_yticks([0, 10, 20, 30, 40])
ax.set_ylabel('Degrees')
ax.set_title('Net spin moment, angle from its starting direction', fontsize=11, loc='left')
ax.set_xlim(0, 720); ax.set_xticks([0, 120, 240, 360, 480, 600, 720])
ax.set_xlabel('SCF evaluation (not time)', labelpad=6)
clean(ax)
facts['feb2_stall'] = {'spin_at_60': spin[59], 'charge_at_60': charge[59], 'spin_at_240': spin[239], 'turn_at_240': float(turn[239]),
                       'spin_range_after_120': [min(spin[119:]), max(spin[119:])],
                       'turn_at_480': float(turn[479]), 'turn_at_720': float(turn[719]), 'max_spin_after_240': max(spin[239:]),
                       'spin_over_charge_median_after_240': float(np.median(np.array(spin[239:]) / np.array(charge[239:])))}
save_svg(fig, 'feb2-stall', 'FeB2 spin stall and moment rotation',
         'The spin residual reaches about 1e-4 by evaluation 60, then rises to about 2e-3 and stays there, well above the charge residual, while the net moment turns by about 29 degrees over 720 evaluations.')

# Composition: three small histograms, one series each.
fig, axes = plt.subplots(1, 3, figsize=(8.2, 2.9))
fig.subplots_adjust(left=0.06, right=0.98, top=0.72, bottom=0.2, wspace=0.35)
fig.text(0.06, 0.92, 'What a history looks like', fontsize=15)
panels = [('Atoms per cell', [t['context']['nat'] for t in trajectories.values()], np.arange(0.5, 19.5, 1)),
          ('Grid points per channel (thousands)', [np.prod(t['context']['dims']) / 1e3 for t in trajectories.values()], np.arange(0, 1000, 50)),
          ('Evaluations per history', [len(histories[t]) for t in trajectories], np.arange(0, 760, 40))]
for ax, (title, values, bins) in zip(axes, panels):
    ax.hist(values, bins=bins, color=slate, rwidth=0.82)
    ax.set_title(title, fontsize=11, loc='left', color=ink)
    clean(ax)
axes[0].set_ylabel('Histories')
save_svg(fig, 'composition', 'Dataset composition',
         'Histograms of atoms per cell, real-space grid points per channel, and SCF evaluations per history.')

# Literature context: spin-orbit constants used by Blanco-Rey, Cerda & Arnau, New J. Phys. 21, 073054 (2019), Table 3.
xi = [('Fe', 26, 59.65), ('Co', 27, 74.12), ('Cu', 29, 110.44), ('Pd', 46, 191.36), ('Pt', 78, 537.18), ('Au', 79, 615.05)]
fig, ax = plt.subplots(figsize=(8.2, 2.9))
fig.subplots_adjust(left=0.09, right=0.97, top=0.70, bottom=0.2)
fig.text(0.09, 0.9, 'Spin–orbit strength grows with atomic number', fontsize=15)
fig.text(0.09, 0.80, r'Valence spin–orbit constant $\xi$ (meV) used in one first-principles study; 3d → 4d → 5d', fontsize=11, color=muted)
names = [f'{el}\nZ = {z}' for el, z, _ in xi]
ax.bar(range(len(xi)), [v for *_, v in xi], width=0.5, color=slate)
for i, (*_, v) in enumerate(xi):
    ax.text(i, v + 12, f'{v:.0f}', ha='center', fontsize=11.5)
ax.set_xticks(range(len(xi)), names, fontsize=11)
ax.set_ylim(0, 700); ax.set_yticks([0, 200, 400, 600])
ax.set_ylabel(r'$\xi$ · meV')
clean(ax)
save_svg(fig, 'soc-strength', 'Spin-orbit constants by element',
         'Fe 59.65, Co 74.12, Cu 110.44, Pd 191.36, Pt 537.18, Au 615.05 meV (Blanco-Rey et al. 2019, Table 3).')

facts['final_spin_gt_charge'] = sum(h[-1]['component_residuals_e_per_atom']['magnetization_vector_l1'] >
                                    h[-1]['component_residuals_e_per_atom']['charge_l1'] for h in histories.values())
facts['histories_with_rebound'] = sum(any(h[i + 1]['density_residual_e_per_atom'] > h[i]['density_residual_e_per_atom']
                                          for i in range(len(h) - 1)) for h in histories.values())
facts['kpoints'] = dict(collections.Counter(t['numerical_context']['measured_operator_context']['kpoints'] for t in trajectories.values()))
facts['families_without_endpoint'] = sum(f['q'] == 0 for f in fam.values())
facts['direction_classes'] = dict(collections.Counter(t['numerical_context']['declared_direction_class'] for t in trajectories.values()))
facts['qualified_by_direction_class'] = dict(collections.Counter(t['numerical_context']['declared_direction_class'] for t in trajectories.values()
                                                                 if t['qualification']['outcome'] == 'qualified_endpoint'))
facts['mixing_beta'] = dict(collections.Counter(t['numerical_context']['declared_numerical_settings']['mixing_beta'] for t in trajectories.values()))
facts['nat_range'] = [min(t['context']['nat'] for t in trajectories.values()), max(t['context']['nat'] for t in trajectories.values())]
facts['history_length_range'] = [min(len(h) for h in histories.values()), max(len(h) for h in histories.values())]
manifest['facts'] = facts
# Content hash of every tile: the page appends it to tile URLs so regenerated images are never served stale.
tiles = hashlib.sha256(b''.join(f.read_bytes() for f in sorted((out / 'feal2').glob('*.webp')))).hexdigest()[:12]
manifest['version'] = tiles
(out / 'feal2' / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, separators=(',', ':')))
(out / 'figure-data.json').write_text(json.dumps({'release_summary': summary, 'facts': facts,
                                                  'source': 'huggingface.co/datasets/project-14/soc-scf-trajectories'}, indent=1, ensure_ascii=False) + '\n')
print(json.dumps(facts, indent=1, ensure_ascii=False))
