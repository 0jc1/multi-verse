/* APEVERSE - lw_saveio.js : safe save EXPORT / IMPORT from Settings (owner: "keep prototype saves isolated and provide safe export/import").
   Export downloads the current save as JSON.  Import: choose a .json -> it is validated (must look like an Apeverse save) -> the CURRENT save
   is first copied to "<key>_preimport" (and offered back as a download) -> the imported save is written -> the game reloads into it.
   Nothing is ever overwritten without that backup.  Saves are per address (8101 stable, 8103 Babylon), so importing on 8103 never
   touches the 8101 save. */
'use strict';
(function (AV) {
const tr = AV.tr || (a => a), key = () => AV.saveKey || 'apeverse_v09';
const looksValid = s => s && typeof s === 'object' && typeof s.money === 'number' && isFinite(s.money) && Array.isArray(s.log);   /* the game's own validity rule (core.js valid()) */
function download(name, text) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove() }, 500) }
const stamp = () => new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
AV.saveIO = {
  exportNow() { try { AV.save && AV.save() } catch (e) { } const txt = AV.exportSave ? AV.exportSave() : localStorage.getItem(key()); download('apeverse-save-' + location.port + '-' + stamp() + '.json', txt); return true },
  importText(text) { let s; try { s = JSON.parse(text) } catch (e) { return { ok: false, why: tr('That file is not valid JSON.', 'Ese archivo no es JSON válido.') } }
    if (!looksValid(s)) return { ok: false, why: tr('That file does not look like an Apeverse save.', 'Ese archivo no parece una partida de Apeverse.') };
    const cur = localStorage.getItem(key()); if (cur) { try { localStorage.setItem(key() + '_preimport', cur) } catch (e) { return { ok: false, why: 'storage full' } } }
    localStorage.setItem(key(), JSON.stringify(s)); return { ok: true, backup: !!cur, prev: cur } } };
const ts0 = AV.toggleSettings; if (ts0) AV.toggleSettings = function () { const r = ts0.apply(this, arguments); const p = document.getElementById('set'); if (!p || p.style.display !== 'block' || p.querySelector('#sSaveIO')) return r;
  const row = document.createElement('p'); row.id = 'sSaveIO'; row.innerHTML = tr('Save file', 'Partida') + ': <button id="sExp">' + tr('Export save', 'Exportar partida') + '</button> <button id="sImp">' + tr('Import save…', 'Importar partida…') + '</button><input id="sImpF" type="file" accept=".json,application/json" style="display:none">';
  const cl = p.querySelector('[data-close]'); cl ? p.insertBefore(row, cl) : p.appendChild(row);
  row.querySelector('#sExp').onclick = () => AV.saveIO.exportNow(); const f = row.querySelector('#sImpF'); row.querySelector('#sImp').onclick = () => f.click();
  f.onchange = () => { const file = f.files && f.files[0]; if (!file) return; const rd = new FileReader(); rd.onload = () => { const res = AV.saveIO.importText(String(rd.result));
    if (!res.ok) { (AV.toast || alert)(res.why); return } if (res.prev) download('apeverse-save-backup-before-import-' + stamp() + '.json', res.prev);
    (AV.toast || (() => { }))(tr('Save imported. Your previous save was backed up. Reloading…', 'Partida importada. Tu partida anterior se guardó como copia. Recargando…')); AV.__noSave = true; setTimeout(() => location.reload(), 900) }; rd.readAsText(file) }; return r };
/* while reloading after an import, the running game must not write its old state over the imported save */
const save0 = AV.save; if (save0) AV.save = function () { if (AV.__noSave) return; return save0.apply(this, arguments) };
})(window.AV);
