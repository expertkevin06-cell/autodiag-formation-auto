/**
 * verify.js - Auto-vérification des motorisations
 * Règle ingénieur : kW = ch × 0,7355 (±3%) ; cylindrée déduite du nom + table d'exceptions
 */
const CC_EXCEPTIONS = {
  "1.5 Blue dCi":1461,"1.5 dCi":1461,"1.6 BlueHDi":1560,"1.5 BlueHDi":1499,"2.0 BlueHDi":1997,
  "1.2 PureTech":1199,"1.6 THP":1598,"1.6 PureTech":1598,"2.2 D-4D":2231,"1.0 EcoBoost":999,
  "1.5 EcoBlue":1499,"2.0 EcoBlue":1997,"2.5 PHEV":2488,"2.5 FHEV":2488,"1.3 TCe":1332,
  "1.3 DIG-T":1332,"1.5 TSI":1498,"2.0 TDI":1968,"1.0 TSI":999,"2.0 TSI":1984,"3.0 TDI":2967,
  "1.4 T-GDI":1353,"1.6 T-GDI":1598,"1.6 CRDi":1598,"2.5 Hybrid":2487,"1.8 Hybrid":1798,"2.0 Hybrid":1987
};
const VALID_TYPES = ["essence","diesel","hybride","electrique","flexfuel"];

function inferCc(engine){
  if(!engine) return 0;
  if(engine.type === "electrique") return 0;
  for(const k in CC_EXCEPTIONS){ if(engine.name.indexOf(k) === 0) return CC_EXCEPTIONS[k]; }
  const m = engine.name.match(/(\d+[.,]\d+)/);
  if(m) return Math.round(parseFloat(m[1].replace(',','.')) * 1000);
  return 0;
}

function verifyEngine(engine){
  const checks = [];
  const kwCalc = Math.round(engine.ch * 0.7355);
  const kwOk = Math.abs(kwCalc - engine.kw) <= Math.max(2, engine.kw * 0.03);
  checks.push({ label:"Cohérence ch ↔ kW", ok:kwOk, detail:`${engine.ch} ch ≈ ${kwCalc} kW (déclaré ${engine.kw} kW)` });
  const typeOk = VALID_TYPES.includes(engine.type);
  checks.push({ label:"Type motorisation", ok:typeOk, detail:engine.type });
  const cc = inferCc(engine);
  const ccOk = (engine.type === "electrique") ? (cc === 0) : (cc > 0);
  checks.push({ label:"Cylindrée", ok:ccOk, detail:(engine.type === "electrique") ? `0 cm³ (électrique — ${engine.code})` : `${cc} cm³` });
  return { checks, cc, allOk: checks.every(c => c.ok) };
}

if (typeof window !== 'undefined'){ window.inferCc = inferCc; window.verifyEngine = verifyEngine; }
