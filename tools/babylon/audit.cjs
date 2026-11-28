// Apeverse 3.0 migration audit: classifies every game script by how tightly it is coupled to Three.js / the renderer.
// reuse   = no THREE usage: gameplay, data, UI (runs unchanged under the Babylon adapter)
// adapter = builds THREE objects with standard materials/geometry (rendered by the Babylon mirror adapter without changes)
// rewrite = depends on renderer internals (custom shaders, onBeforeCompile, render targets, WebGLRenderer calls) -> needs a Babylon version
const fs = require('fs'), path = require('path'); const dir = process.argv[2] || 'js', out = [];
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js')).concat(fs.readdirSync('data').filter(f => f.endsWith('.js')).map(f => '../data/' + f));
for (const f of files) { const s = fs.readFileSync(path.join(dir, f), 'utf8'), n = re => (s.match(re) || []).length;
  const three = n(/THREE\./g), shader = n(/ShaderMaterial|onBeforeCompile|RawShaderMaterial|gl_Position|fragmentShader/g), rt = n(/WebGLRenderTarget|\.setRenderTarget|renderer\.|AV\.R\.|R\.render|readPixels|CubeCamera/g), dom = n(/document\.|innerHTML|addEventListener/g), lines = s.split('\n').length;
  const cls = three === 0 ? 'reuse' : (shader > 0 || rt > 2) ? 'rewrite' : 'adapter';
  out.push({ file: f.replace('../', ''), kb: Math.round(s.length / 1024), lines, three, shader, renderer: rt, dom, cls }) }
const sum = c => out.filter(o => o.cls === c), kb = a => a.reduce((t, o) => t + o.kb, 0);
let md = '| File | KB | THREE refs | custom shaders | renderer internals | DOM/UI | Class |\n|---|---|---|---|---|---|---|\n' + out.sort((a, b) => a.cls.localeCompare(b.cls) || b.kb - a.kb).map(o => `| ${o.file} | ${o.kb} | ${o.three} | ${o.shader} | ${o.renderer} | ${o.dom} | ${o.cls} |`).join('\n');
const head = `Scripts: ${out.length} (${kb(out)} KB). reuse: ${sum('reuse').length} files (${kb(sum('reuse'))} KB) · adapter: ${sum('adapter').length} files (${kb(sum('adapter'))} KB) · rewrite: ${sum('rewrite').length} files (${kb(sum('rewrite'))} KB)\n\nRewrite candidates: ${sum('rewrite').map(o => o.file).join(', ')}\n\n`;
fs.writeFileSync(process.argv[3] || 'audit.md', head + md); console.log(head);
