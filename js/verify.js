/**
 * verify.js v2 - Auto-vérification motorisations
 * kW = ch × 0,7355 (±3%) ; cylindrée : table d'exceptions étendue (Dacia, E-Tech, GPL...)
 */
const CC_EXCEPTIONS = {
  // PSA / Renault essence
  "1.2 PureTech":1199,"1.6 THP":1598,"1.6 PureTech":1598,"1.2 TCe":1199,"1.2 DIG-T":1199,"1.2 E-Tech":1199,"1.2 Hybrid":1199,
  // Diesels
  "1.5 BlueHDi":1499,"1.6 BlueHDi":1560,"2.0 BlueHDi":1997,"1.5 Blue dCi":1461,"1.5 dCi":1461,"1.7 Blue dCi":1699,
  "2.2 D-4D":2231,"1.5 TDI":1498,"2.0 TDI":1968,"3.0 TDI":2967,"1.6 CRDi":1598,"1.5 EcoBlue":1499,"2.0 EcoBlue":1997,
  // Renault / Dacia
  "1.0 SCe":999,"1.0 TCe":999,"1.0 MPI":999,"1.3 TCe":1332,"1.3 DIG-T":1332,"TCe 140":1332,"TCe 140 mild-hybrid":1332,
  "ECO-G 100":999,"ECO-G 120":999,"ECO-G 140":1332,
  "HYBRID 140":1598,"HYBRID 155":1598,"E-Tech 140":1598,"E-Tech 145":1598,"E-Tech 160":1598,"E-Tech 200":1199,"E-Tech 300":1199,
  // Divers
  "1.0 TSI":999,"1.5 TSI":1498,"2.0 TSI":1984,"1.0 T-GDI":998,"1.6 T-GDI":1598,"1.4 T-GDI":1353,"1.0 EcoBoost":999,
  "2.5 Hybrid":2487,"1.8 Hybrid":1798,"2.0 Hybrid":1987,"2.5 PHEV":2488,"2.5 FHEV":2488
};
const VALID_TYPES = ["essence","diesel","hybride","electrique","flexfuel"];

function inferCc(engine){
  if(!engine) return 0;
  if(engine.type === "electrique") return 0;
  for(const k in CC_EXCEPTIONS){ if((engine.name||'').indexOf(k) === 0) return CC_EXCEPTIONS[k]; }
  const m = (engine.name||'').match(/(\d+[.,]\d+)/);
  if(m) return Math.round(parseFloat(m[1].replace(',','.')) * 1000);
  return 0;
}
function ccLabel(engine){
  const cc = inferCc(engine);
  return cc ? cc + ' cm³' : '0 cm³ (électrique — ' + (engine.code||'') + ')';
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
  checks.push({ label:"Cylindrée", ok:ccOk, detail:ccLabel(engine) });
  return { checks, cc, allOk: checks.every(c => c.ok) };
}

if (typeof window !== 'undefined'){ window.inferCc = inferCc; window.ccLabel = ccLabel; window.verifyEngine = verifyEngine; }
