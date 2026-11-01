/**
 * systems.js v4 - Multi-systèmes + Dacia (ressorts, bulletins) + BT PureTech bougies 07/2026
 */
const SYSTEM_LABELS = {
  moteur:"Moteur", transmission:"Transmission", embrayage:"Embrayage", batterie:"Batterie & BMS",
  charge:"Charge", adas:"ADAS / Caméras", multimedia:"Multimédia", securite:"Sécurité (airbag/ceintures)",
  direction:"Direction", freinage:"Freinage", echappement:"Échappement / FAP / Catalyseur",
  refroidissement:"Refroidissement", carrosserie:"Carrosserie / Corrosion / Infiltration",
  suspension:"Suspension / Ressorts / Amortisseurs",
  electricite:"Électricité", electronique:"Électronique / Calculateurs"
};

AUTO_DATA.components.mecanique.push("Séparateur d'huile (reniflards)","Volant moteur bi-masse","Mécatronique boîte double embrayage","Convertisseur de couple","Synchroniseurs boîte","Crémaillère de direction","Boîtier de direction","Colonne de direction","Cardan de direction");
AUTO_DATA.components.electrique.push("Batterie 48V","Fuite de courant parasitaire","Connecteurs oxydés");
AUTO_DATA.components.electronique.push("Tablette multimédia","Caméra ADAS","Radar ADAS","Boîtier airbag","Prétensionneurs ceintures","Contacteur tournant (clock spring)","Calculateur direction assistée");

function getSystem(f){
  if(f.system) return f.system;
  const s=((f.component||'')+' '+(f.title||'')).toLowerCase();
  const rules=[
    [/embrayage|volant moteur/,'embrayage'],
    [/boîte|mécatronique|cardan|différentiel|convertisseur de couple|synchronis/,'transmission'],
    [/batterie|bms|autonomie|courant|parasit/,'batterie'],
    [/charge|connecteur de charge|onduleur|dc\/dc/,'charge'],
    [/adas|caméra|radar|régulateur adaptatif|angle de braquage/,'adas'],
    [/multimédia|écran tactile|gps|navigation|bluetooth|wifi|combiné/,'multimedia'],
    [/airbag|ceinture|prétension|clock spring|contacteur tournant/,'securite'],
    [/direction|crémaillère|rotule|colonne/,'direction'],
    [/frein|étrier|disque|plaquette|abs|esp|maître-cylindre/,'freinage'],
    [/fap|catalyseur|sonde lambda|échappement|silencieux|egr|adblue/,'echappement'],
    [/refroidissement|radiateur|thermostat|pompe à eau|liquide/,'refroidissement'],
    [/ressort|suspension|amortisseur|barre stabilisatrice|silent bloc/,'suspension'],
    [/rouille|corrosion|infiltration|eau|grippage|carrosserie/,'carrosserie'],
    [/alternateur|démarreur|faisceau|fusible|relais|bougies|bobine|oxydation|court-circuit|12v|48v/,'electricite'],
    [/calculateur|ecu|bsi|bcm|capteur|module|transpondeur|antenne/,'electronique']
  ];
  for(const [re,sys] of rules) if(re.test(s)) return sys;
  return {mecanique:'moteur',electrique:'electricite',electronique:'electronique'}[f.type]||'moteur';
}

// ===== INJECTION AUTOMATIQUE DU BT JUILLET 2026 (BOUGIES PURETECH) DANS TOUTES LES MOTORISATIONS CONCERNÉES =====
(function enrichPureTechBougies(){
  const noteBT = "BT Stellantis MTR-2026-07 (07/2026) : bougies PureTech — nouvelle référence + intervalle révisé";
  const issue = "Bougies d'allumage : usure prématurée / ratés (BT 07/2026)";
  Object.values(AUTO_DATA.enginesByModel||{}).forEach(models=>{
    Object.values(models).forEach(list=>{
      (list||[]).forEach(e=>{
        if(/PureTech/.test(e.name||'')){
          e.issues=e.issues||[]; e.recalls=e.recalls||[];
          if(!e.issues.includes(issue)) e.issues.push(issue);
          if(!e.recalls.includes(noteBT)) e.recalls.push(noteBT);
        }
      });
    });
  });
})();

// ===== ENRICHISSEMENT DACIA : problèmes connus + campagnes par motorisation =====
(function enrichDacia(){
  const d=AUTO_DATA.enginesByModel["Dacia"]||{};
  Object.values(d).forEach(list=>{
    (list||[]).forEach(e=>{
      e.issues=e.issues||[]; e.recalls=e.recalls||[];
      if(/Blue dCi/.test(e.name)){ if(!e.issues.includes("Vanne EGR / injecteurs K9K")) e.issues.push("Vanne EGR / injecteurs K9K"); if(!e.recalls.includes("Campagne C004 : contrôle EGR/injecteurs K9K")) e.recalls.push("Campagne C004 : contrôle EGR/injecteurs K9K"); if(!e.recalls.includes("Campagne C052 : pompe HP / capteur rampe")) e.recalls.push("Campagne C052 : pompe HP / capteur rampe"); }
      if(/HYBRID/.test(e.name)){ if(!e.issues.includes("Décharge batterie 12V récurrente (E-Tech)")) e.issues.push("Décharge batterie 12V récurrente (E-Tech)"); if(!e.recalls.includes("Campagne C054 : contrôle batterie 12V")) e.recalls.push("Campagne C054 : contrôle batterie 12V"); }
      if(/ECO-G/.test(e.name)){ if(!e.issues.includes("Conso GPL +10-20% vs essence")) e.issues.push("Conso GPL +10-20% vs essence"); if(!e.issues.includes("Démarrage à froid sur essence")) e.issues.push("Démarrage à froid sur essence"); }
      if(/Electric/.test(e.name)){ if(!e.issues.includes("Autonomie hiver très réduite")) e.issues.push("Autonomie hiver très réduite"); if(!e.recalls.includes("Campagne C042 : MAJ logiciel charge")) e.recalls.push("Campagne C042 : MAJ logiciel charge"); if(!e.recalls.includes("Campagne C053 : réglage freins arrière tambours")) e.recalls.push("Campagne C053 : réglage freins arrière tambours"); }
    });
  });
})();

const SYS_FAULTS = [
 {id:"SYS01",system:"moteur",code:"TSB-COURR",title:"Courroie de distribution : usure, effilochage, rupture",type:"mecanique",component:"Courroie de distribution",engines:["essence","diesel"],symptoms:["Bruit de courroie","Voyant moteur","Casse moteur soudaine"],causes:["Dilution huile","Vidanges espacées","Tendeur fatigué"],consequences:["Casse moteur","Pompe à huile colmatée"],diagnostics:["Contrôle visuel largeur/effilochage","Historique vidanges"],repairs:["Kit courroie + galets + pompe à eau","Vidange"],tsb:["PSA 1.2 PureTech / 1.5 BlueHDi 7→8mm","Ford 1.0 EcoBoost courroie humide"],severity:"critique",cost:"500-1200€"},
 {id:"SYS02",system:"moteur",code:"TSB-CHAIN",title:"Chaîne de distribution : allongement, tendeur, guides",type:"mecanique",component:"Chaîne de distribution",engines:["essence","diesel"],symptoms:["Claquement à froid","Voyant calage"],causes:["Tendeur HS","Lubrification"],consequences:["Casse moteur"],diagnostics:["Écoute à froid","Codes P0016/P0340"],repairs:["Kit chaîne complet"],tsb:["BMW N47/B47","Renault 1.2 TCe H5F","VW EA211"],severity:"critique",cost:"900-3000€"},
 {id:"SYS03",system:"moteur",code:"TSB-TURBO",title:"Turbocompresseur : jeu axial, géométrie variable, wastegate",type:"mecanique",component:"Turbo",engines:["diesel","essence"],symptoms:["Sifflement","Perte puissance","Fumée bleue"],causes:["Lubrification","Calamine","Wastegate"],consequences:["Casse turbo"],diagnostics:["Jeu axial","Test pression"],repairs:["Remplacement turbo"],severity:"critique",cost:"1000-3000€"},
 {id:"SYS04",system:"moteur",code:"TSB-HUILE",title:"Consommation d'huile moteur anormale",type:"mecanique",component:"Segment",engines:["essence","diesel"],symptoms:["Niveau huile en baisse","Fumée bleue"],causes:["Segments","Joints soupapes","Turbo","Reniflards"],consequences:["Casse catalyseur"],diagnostics:["Pesée conso/1000 km"],repairs:["Segments/joints","Séparateur"],severity:"important",cost:"300-2500€"},
 {id:"SYS05",system:"refroidissement",code:"TSB-LDR",title:"Consommation / perte de liquide de refroidissement",type:"mecanique",component:"Liquide de refroidissement",engines:["essence","diesel","hybride"],symptoms:["Niveau LDR en baisse","Surchauffe"],causes:["Pompe à eau","Radiateur","Échangeur EGR","Joint culasse"],consequences:["Surchauffe"],diagnostics:["Test pression circuit"],repairs:["Pompe/radiateur/échangeur"],severity:"critique",cost:"300-2000€"},
 {id:"SYS06",system:"moteur",code:"TSB-PCV",title:"Séparateur d'huile / reniflards (PCV) colmatés",type:"mecanique",component:"Séparateur d'huile (reniflards)",engines:["essence","diesel"],symptoms:["Sifflement","Conso huile"],causes:["Membrane PCV","Boue"],consequences:["Fuites huile"],diagnostics:["Test dépression carter"],repairs:["Remplacement séparateur"],severity:"important",cost:"150-600€"},
 {id:"SYS07",system:"embrayage",code:"TSB-EMB",title:"Embrayage / volant moteur bi-masse : broutage, bruit",type:"mecanique",component:"Embrayage",engines:["essence","diesel"],symptoms:["Broutage","Bruit point mort"],causes:["Disque usé","VM fatigué"],consequences:["Immobilisation"],diagnostics:["Test patinage"],repairs:["Kit embrayage + VM"],severity:"important",cost:"800-2000€"},
 {id:"SYS08",system:"transmission",code:"TSB-DSG",title:"Boîte double embrayage / mécatronique : à-coups, surchauffe",type:"electronique",component:"Mécatronique boîte double embrayage",engines:["essence","diesel","hybride"],symptoms:["À-coups 1er/2e","Message boîte chaude"],causes:["Mécatronique","Huile boîte"],consequences:["Mode dégradé"],diagnostics:["Codes boîte"],repairs:["Vidange","Mécatronique"],tsb:["VW DQ200/DQ250","Ford Powershift"],severity:"critique",cost:"600-3000€"},
 {id:"SYS09",system:"transmission",code:"TSB-BVM",title:"Boîte manuelle : synchroniseurs, roulements, fuite",type:"mecanique",component:"Synchroniseurs boîte",engines:["essence","diesel"],symptoms:["Difficulté rapports","Ronflement"],causes:["Synchroniseurs","Roulements"],consequences:["Casse boîte"],diagnostics:["Essai routier"],repairs:["Réparation boîte"],severity:"important",cost:"500-2500€"},
 {id:"SYS10",system:"batterie",code:"TSB-48V",title:"Batterie 48V mild-hybrid : défaut, charge, stop&start",type:"electrique",component:"Batterie 48V",engines:["hybride"],symptoms:["Stop&start inopérant"],causes:["Cellules 48V","DC/DC"],consequences:["Conso accrue"],diagnostics:["Test 48V"],repairs:["Batterie 48V"],severity:"important",cost:"600-1800€"},
 {id:"SYS11",system:"batterie",code:"TSB-DRAIN",title:"Consommation de courant / fuite parasitaire",type:"electrique",component:"Fuite de courant parasitaire",engines:["essence","diesel","hybride","electrique"],symptoms:["Décharge après repos"],causes:["Module éveillé"],consequences:["Immobilisation"],diagnostics:["Mesure courant repos"],repairs:["Correction module"],severity:"important",cost:"100-600€"},
 {id:"SYS12",system:"batterie",code:"TSB-BMS",title:"BMS : autonomie estimée erronée, déséquilibre cellules",type:"electronique",component:"BMS (Battery Management System)",engines:["electrique","hybride"],symptoms:["Autonomie incohérente"],causes:["Calibration","Cellules"],consequences:["Autonomie réduite"],diagnostics:["Équilibrage","SOH"],repairs:["Calibration/MAJ"],severity:"important",cost:"0-800€"},
 {id:"SYS13",system:"charge",code:"TSB-OBC",title:"Charge AC : chargeur embarqué / pilote défaillant",type:"electrique",component:"Onduleur",engines:["electrique","hybride"],symptoms:["Charge lente/absente"],causes:["Chargeur embarqué","Pilote"],consequences:["Recharge impossible"],diagnostics:["Test bornes"],repairs:["Chargeur embarqué"],severity:"critique",cost:"800-2500€"},
 {id:"SYS14",system:"multimedia",code:"TSB-HU",title:"Tablette multimédia / écran : gel, noir, reboots",type:"electronique",component:"Tablette multimédia",engines:["essence","diesel","hybride","electrique"],symptoms:["Écran figé","Reboots"],causes:["Logiciel","Mémoire"],consequences:["Perte fonctions"],diagnostics:["Version logicielle"],repairs:["MAJ","Remplacement unité"],tsb:["VW ID / Tesla MCU / Uconnect"],severity:"modéré",cost:"0-1500€"},
 {id:"SYS15",system:"adas",code:"TSB-CAM",title:"Caméra ADAS / recul : buée, calibration, infiltration",type:"electronique",component:"Caméra ADAS",engines:["essence","diesel","hybride","electrique"],symptoms:["ADAS indisponible"],causes:["Infiltration","Décalage"],consequences:["Perte ADAS"],diagnostics:["Calibration"],repairs:["Caméra + calibration"],severity:"important",cost:"300-1200€"},
 {id:"SYS16",system:"adas",code:"TSB-RAD",title:"Radar ADAS / ACC : encrassement, désalignement",type:"electronique",component:"Radar ADAS",engines:["essence","diesel","hybride","electrique"],symptoms:["ACC indisponible"],causes:["Désalignement"],consequences:["Perte ACC/AEB"],diagnostics:["Codes ADAS"],repairs:["Calibration"],severity:"important",cost:"150-900€"},
 {id:"SYS17",system:"securite",code:"TSB-AIRB",title:"Airbag / prétensionneurs : voyant, connecteurs, clock spring",type:"electronique",component:"Boîtier airbag",engines:["essence","diesel","hybride","electrique"],symptoms:["Voyant airbag"],causes:["Connecteurs","Clock spring"],consequences:["Non-déploiement"],diagnostics:["Codes SRS"],repairs:["Connecteurs/boîtier"],severity:"critique",cost:"150-1200€"},
 {id:"SYS18",system:"securite",code:"TSB-CEINT",title:"Ceintures / prétensionneurs : blocage, rappel",type:"mecanique",component:"Prétensionneurs ceintures",engines:["essence","diesel","hybride","electrique"],symptoms:["Ceinture bloquée"],causes:["Enrouleur","Rappel"],consequences:["Sécurité réduite"],diagnostics:["Contrôle enroulement"],repairs:["Remplacement"],severity:"critique",cost:"200-800€"},
 {id:"SYS19",system:"electronique",code:"TSB-ECU",title:"Calculateur : infiltration d'eau, oxydation, court-circuit",type:"electronique",component:"Calculateurs (ECU)",engines:["essence","diesel","hybride","electrique"],symptoms:["Pannes aléatoires"],causes:["Infiltration","Oxydation"],consequences:["Casse calculateur"],diagnostics:["Inspection traces eau"],repairs:["Séchage/remplacement"],severity:"critique",cost:"300-2500€"},
 {id:"SYS20",system:"carrosserie",code:"TSB-INFIL",title:"Infiltration d'eau habitacle / faisceaux",type:"electrique",component:"Faisceau électrique",engines:["essence","diesel","hybride","electrique"],symptoms:["Humidité","Buée"],causes:["Écoulements obstrués"],consequences:["Court-circuits"],diagnostics:["Contrôle moquette"],repairs:["Nettoyage/joints"],severity:"important",cost:"150-1200€"},
 {id:"SYS21",system:"carrosserie",code:"TSB-ROUIL",title:"Rouille / corrosion châssis, berceau",type:"mecanique",component:"Silent bloc",engines:["essence","diesel","hybride","electrique"],symptoms:["Corrosion visible"],causes:["Sel","Protection"],consequences:["Rupture berceau"],diagnostics:["Inspection pont"],repairs:["Traitement/remplacement"],severity:"important",cost:"200-2000€"},
 {id:"SYS22",system:"freinage",code:"TSB-GRIPP",title:"Grippage étriers / axes (rouille)",type:"mecanique",component:"Étrier de frein",engines:["essence","diesel","hybride","electrique"],symptoms:["Frein qui traîne"],causes:["Axes grippés"],consequences:["Surchauffe disque"],diagnostics:["Rotation roue"],repairs:["Nettoyage/étriers"],severity:"important",cost:"150-700€"},
 {id:"SYS23",system:"direction",code:"TSB-CREM",title:"Crémaillère de direction : jeu, claquement, fuite",type:"mecanique",component:"Crémaillère de direction",engines:["essence","diesel","hybride","electrique"],symptoms:["Claquement braquage","Jeu"],causes:["Rotules internes"],consequences:["Perte précision"],diagnostics:["Jeu à la barre"],repairs:["Remplacement crémaillère"],severity:"critique",cost:"600-1800€"},
 {id:"SYS24",system:"direction",code:"TSB-EPS",title:"Direction assistée électrique (colonne/boîtier)",type:"electronique",component:"Colonne de direction",engines:["essence","diesel","hybride","electrique"],symptoms:["Assistance coupée"],causes:["Moteur EPS","Capteur couple"],consequences:["Perte assistance"],diagnostics:["Codes EPS"],repairs:["Colonne/boîtier EPS"],severity:"critique",cost:"700-2200€"},
 {id:"SYS25",system:"electricite",code:"TSB-ALT",title:"Alternateur / charge 12V : diodes, poulie",type:"electrique",component:"Alternateur",engines:["essence","diesel","hybride"],symptoms:["Voyant batterie"],causes:["Diodes","Poulie"],consequences:["Panne 12V"],diagnostics:["Test charge"],repairs:["Alternateur/poulie"],severity:"important",cost:"300-900€"},
 {id:"SYS26",system:"electricite",code:"TSB-OXID",title:"Oxydation connecteurs / masses : court-circuit",type:"electrique",component:"Connecteurs oxydés",engines:["essence","diesel","hybride","electrique"],symptoms:["Pannes intermittentes"],causes:["Humidité/sel"],consequences:["Casse modules"],diagnostics:["Inspection connecteurs"],repairs:["Nettoyage/remplacement"],severity:"important",cost:"100-800€"},
 {id:"SYS27",system:"suspension",code:"TB-DAC-BIG-RESS",title:"Dacia Bigster : ressorts suspension arrière — rupture / corrosion",type:"mecanique",component:"Ressort",brands:["Dacia"],modelRefs:["Bigster"],engines:["essence","hybride","flexfuel"],symptoms:["Claquement arrière","Assiette affaissée","Fissure/corrosion spires"],causes:["Corrosion prématurée (lots 2025)","Charges élevées"],consequences:["Rupture ressort","Perte de contrôle"],diagnostics:["Inspection spires","Hauteur de caisse"],repairs:["Ressorts arrière par paire","Contrôle amortisseurs"],tsb:["Bulletin technique Dacia : contrôle préventif ressorts arrière Bigster (2025)","Réf. interne TSB-DAC-BIG-RESS"],bulletin:"Bulletin technique Dacia Bigster SUS-2025-01 — contrôle/remplacement ressorts suspension arrière",recalls:["Campagne C021"],severity:"critique",cost:"250-700€"},
 {id:"SYS28",system:"suspension",code:"TSB-SUSP",title:"Ressorts / amortisseurs : fatigue, corrosion, rupture (toutes marques)",type:"mecanique",component:"Ressort",engines:["essence","diesel","hybride","electrique"],symptoms:["Bruits suspension","Affaissement"],causes:["Corrosion","Fatigue"],consequences:["Rupture"],diagnostics:["Inspection visuelle"],repairs:["Remplacement par paire"],severity:"important",cost:"200-800€"},
 {id:"SYS29",system:"transmission",code:"TB-REN-AUS-BVA",title:"Renault Austral : à-coups boîte multimode E-Tech (boîte à crabots)",type:"electronique",component:"Boîte de vitesses",brands:["Renault"],modelRefs:["Austral","Espace","Symbioz","Rafale"],engineRefs:["1.2 E-Tech 160","1.2 E-Tech 200"],engines:["hybride"],symptoms:["À-coups rétrogradage/basse vitesse","Secousse ré-accélération","Hésitation démarrage"],causes:["Calibration synchronisation crabots","Apprentissage incomplet"],consequences:["Usure actionneurs","Mode dégradé"],diagnostics:["Codes calculateur boîte","Version logiciel boîte"],repairs:["MAJ logiciel boîte multimode","Apprentissage après flash"],tsb:["Note technique Renault E-Tech : évolution calibration boîte multimode","Réf. interne TSB-REN-AUS-BVA"],bulletin:"Bulletin technique Renault E-Tech BVA-2023-04 — MAJ logiciel calculateur boîte multimode (à-coups)",recalls:["Campagne C022"],severity:"important",cost:"0-300€ (MAJ)"},
 {id:"SYS30",system:"transmission",code:"TSB-BVA-ACOUPS",title:"Boîtes auto / double embrayage / multimode : à-coups basse vitesse",type:"electronique",component:"Boîte de vitesses",engines:["essence","diesel","hybride"],symptoms:["À-coups 1er/2e","Secousses manœuvre"],causes:["Calibration","Huile boîte"],consequences:["Usure prématurée"],diagnostics:["Version logiciel boîte"],repairs:["MAJ logiciel","Vidange + apprentissage"],tsb:["VW DQ200","Renault EDC","Stellantis EAT8","Mercedes 9G","BMW ZF8"],severity:"important",cost:"0-600€"},
 {id:"SYS31",system:"moteur",code:"BT-STA-MTR-2026-07",title:"PureTech (EB2) : bougies d'allumage — usure prématurée / ratés (bulletin juillet 2026)",type:"electronique",component:"Bougies d'allumage",brands:["Peugeot","Citroën","DS","Opel"],
  engineRefs:["1.2 PureTech 68","1.2 PureTech 75","1.2 PureTech 82","1.2 PureTech 100","1.2 PureTech 110","1.2 PureTech 130","1.2 PureTech 155"],
  engines:["essence"],
  symptoms:["Ratés à l'accélération (surtout par temps humide)","Voyant moteur clignotant","Ralenti irrégulier","Consommation accrue"],
  causes:["Usure prématurée des électrodes (bougies d'origine)","Intervalle de remplacement trop espacé","Calamine sur électrodes"],
  consequences:["Ratés prolongés → catalyseur endommagé","Perte de puissance","Surconsommation"],
  diagnostics:["Lecture codes P0300 à P0304","Démontage et contrôle état des bougies (électrodes, calamine, écartement)","Contrôle bobines si ratés localisés"],
  repairs:["Remplacement de l'ensemble des bougies par la NOUVELLE référence constructeur (BT 07/2026)","Respect du couple de serrage et de l'intervalle révisé","Contrôle/resserrage connecteurs bobines"],
  tsb:["Bulletin technique Stellantis juillet 2026 : nouvelle référence de bougies pour moteurs PureTech EB2 / EB2AD / EB2ADT / EB2ADTS","Réf. catalogue : TSB-STA-BOUG-2026"],
  bulletin:"Bulletin technique Stellantis MTR-2026-07 (juillet 2026) — bougies moteurs PureTech : nouvelle référence + couple et intervalle révisés",
  recalls:["Campagne C055 : remplacement préventif bougies PureTech"],
  severity:"important",cost:"120-300€"}
];
SYS_FAULTS.forEach(f=>{ f.brands=f.brands||["ALL"]; if(!AUTO_DATA.faults.some(x=>x.id===f.id)) AUTO_DATA.faults.push(f); });

// ===== CATALOGUE TSB / CAMPAGNES (multi-marques + Dacia + PureTech 07/2026) =====
const TSB_CAMPAIGNS = [
 {id:"C022",brands:["Renault"],models:["Austral","Espace","Symbioz","Rafale"],engines:["1.2 E-Tech"],years:"2022-2025",title:"À-coups boîte multimode E-Tech : mise à jour logiciel",action:"MAJ calculateur boîte + apprentissage (concession)",severity:"important",bulletin:"BT Renault E-Tech BVA-2023-04"},
 {id:"C055",brands:["Peugeot","Citroën","DS","Opel"],models:["208","2008","308","3008","408","508","5008","C3","C4","C4 X","C5 Aircross","Berlingo","Corsa","Mokka","Grandland"],engines:["1.2 PureTech"],years:"2018-2026",title:"Bougies PureTech : remplacement préventif nouvelle référence (BT juillet 2026)",action:"Remplacement des bougies par la référence révisée + contrôle bobines si ratés",severity:"important",bulletin:"BT Stellantis MTR-2026-07 (juillet 2026)"},
 {id:"C052",brands:["Dacia","Renault","Nissan"],models:["Duster","Jogger","Kangoo"],engines:["1.5 Blue dCi"],years:"2018-2023",title:"1.5 Blue dCi : pompe haute pression / capteur pression rampe",action:"Contrôle pression rampe, remplacement pompe/capteur si défaut",severity:"important",bulletin:"BT Dacia MTR-2019-02"},
 {id:"C053",brands:["Dacia"],models:["Spring"],engines:["Electric 45","Electric 65","Electric 70"],years:"2021-2024",title:"Freins arrière à tambours : réglage / usure prématurée",action:"Réglage rattrapage tambours + contrôle garnitures",severity:"modéré",bulletin:"BT Dacia FRN-2022-01"},
 {id:"C054",brands:["Dacia","Renault"],models:["Duster","Jogger","Bigster","Austral","Symbioz","Clio","Captur"],engines:["HYBRID 140","HYBRID 155","E-Tech 140","E-Tech 145","E-Tech 160"],years:"2020-2026",title:"Hybride E-Tech : décharge batterie 12V récurrente",action:"Contrôle/remplacement batterie 12V AGM + MAJ gestion veille",severity:"important",bulletin:"BT Renault ELC-2024-03"},
 {id:"C021",brands:["Dacia"],models:["Bigster"],engines:["TCe 140 mild-hybrid","HYBRID 155","ECO-G 140"],years:"2025",title:"Ressorts de suspension arrière : contrôle / remplacement préventif",action:"Contrôle visuel des spires arrière et remplacement si corrosion/fissure",severity:"critique",bulletin:"BT Dacia Bigster SUS-2025-01"},
 {id:"C042",brands:["Dacia"],models:["Spring"],engines:["Electric"],years:"2021-2024",title:"Charge lente / erreurs charge",action:"MAJ logiciel gestion charge",severity:"modéré",bulletin:"BT Dacia CHG-2022"},
 {id:"C004",brands:["Renault","Dacia","Nissan","Mercedes-Benz"],models:["Clio","Captur","Megane","Kadjar","Duster","Sandero","Qashqai","Classe A"],engines:["1.5 dCi","1.5 Blue dCi"],years:"2010-2021",title:"Vanne EGR / injecteurs (K9K)",action:"Contrôle vanne EGR, injecteurs, faisceau; MAJ logiciel",severity:"important",bulletin:"BT Renault K9K-2018"},
 {id:"C001",brands:["Peugeot","Citroën","DS","Opel"],models:["208","2008","308","3008","408","5008","508","C3","C4","C5 X","C5 Aircross","Berlingo","Corsa","Mokka","Grandland"],engines:["1.5 BlueHDi"],years:"2017-2022",title:"Courroie/chaîne de distribution 7mm → 8mm",action:"Remplacement courroie 8mm renforcée + galets + pompe à eau",severity:"critique",bulletin:"BT Stellantis DV5-2019"},
 {id:"C002",brands:["Peugeot","Citroën","DS","Opel"],models:["208","2008","308","3008","5008","508","C3","C4","C5 Aircross","Berlingo"],engines:["1.5 BlueHDi","2.0 BlueHDi"],years:"2017-2021",title:"Régénérations FAP excessives",action:"MAJ logiciel calculateur moteur + contrôle dilution huile",severity:"important",bulletin:"BT Stellantis FAP-2020"},
 {id:"C003",brands:["Peugeot","Citroën","DS","Opel"],models:["208","2008","308","3008","408","5008","C3","C4","C5 Aircross"],engines:["1.2 PureTech"],years:"2013-2023",title:"Courroie de distribution humide (bain d'huile)",action:"Contrôle courroie + remplacement si usure, extension garantie 10 ans",severity:"critique",bulletin:"BT Stellantis EB2-2021"},
 {id:"C015",brands:["Peugeot","Citroën","DS","Opel"],models:["208","2008","308","3008","408","C3","C4","C5 Aircross"],engines:["1.2 PureTech"],years:"2013-2023",title:"Crépine pompe à huile obstruée / pompe à vide",action:"Remplacement courroie + crépine + pompe à vide si nécessaire",severity:"critique",bulletin:"BT Stellantis EB2-2022"},
 {id:"C023",brands:["Peugeot","Citroën","DS","Opel"],models:["3008","5008","508","C5 Aircross","Grandland"],engines:["1.5 BlueHDi","2.0 BlueHDi","1.6 PureTech"],years:"2018-2022",title:"EAT8 : à-coups basse vitesse",action:"MAJ logiciel boîte + vidange si nécessaire",severity:"important",bulletin:"BT PSA BVA-2019-02"},
 {id:"C024",brands:["Renault","Dacia"],models:["Megane","Kadjar","Captur","Clio","Duster"],engines:["1.5 dCi","1.3 TCe"],years:"2015-2020",title:"EDC : à-coups / apprentissage embrayages",action:"MAJ logiciel + apprentissage embrayages",severity:"important",bulletin:"BT Renault BVA-2017-03"},
 {id:"C025",brands:["Volkswagen","Audi","Skoda","SEAT"],models:["Golf","Polo","Passat","T-Roc","A3","Octavia"],engines:["1.0 TSI","1.5 TSI","1.6 TDI","2.0 TDI"],years:"2012-2019",title:"DSG7 DQ200 : broutage / mécatronique",action:"MAJ logiciel + contrôle huile mécatronique",severity:"critique",bulletin:"BT VW DQ200-2014"},
 {id:"C026",brands:["BMW"],models:["Série 3","Série 5","X3","X5"],engines:["2.0d","3.0d","2.0i","3.0i"],years:"2014-2020",title:"ZF 8HP : broutage convertisseur",action:"Vidange boîte + MAJ logiciel",severity:"important",bulletin:"BT BMW SIB-24-01"},
 {id:"C027",brands:["Mercedes-Benz"],models:["Classe C","Classe E","GLC","GLE"],engines:["2.0d","2.2d","2.0i"],years:"2016-2021",title:"9G-Tronic : broutage convertisseur",action:"Vidange boîte + MAJ",severity:"important",bulletin:"BT MB LI27.00"},
 {id:"C028",brands:["Toyota"],models:["RAV4","Corolla","C-HR","Camry","Highlander"],engines:["2.0","2.5"],years:"2018-2020",title:"Pompe à carburant Denso (rappel mondial)",action:"Remplacement pompe à carburant",severity:"critique",bulletin:"Rappel Toyota 20TA02"},
 {id:"C029",brands:["Toyota","Lexus"],models:["Prius","RAV4","NX","RX"],engines:["hybride"],years:"2015-2018",title:"Inverter hybride : surchauffe",action:"MAJ logiciel / remplacement inverter",severity:"critique",bulletin:"BT Toyota HYB-2019"},
 {id:"C030",brands:["Nissan"],models:["Qashqai","Juke","X-Trail"],engines:["1.2 DIG-T","1.6 DIG-T"],years:"2014-2019",title:"CVT Jatco : broutage / à-coups",action:"MAJ logiciel CVT + remplacement huile",severity:"important",bulletin:"BT Nissan CVT-2018"},
 {id:"C031",brands:["Hyundai","Kia"],models:["Ioniq 5","EV6","Kona","Niro"],engines:["electrique"],years:"2021-2024",title:"ICCU (charge batterie 12V) : rappel",action:"Remplacement ICCU + MAJ logiciel",severity:"critique",bulletin:"Rappel Hyundai/Kia ICCU-2023"},
 {id:"C032",brands:["Hyundai","Kia"],models:["Tucson","Sportage","Ceed"],engines:["1.6 T-GDI"],years:"2016-2020",title:"DCT 7 : à-coups basse vitesse",action:"MAJ logiciel DCT + apprentissage",severity:"important",bulletin:"BT HK DCT-2019"},
 {id:"C033",brands:["Ford"],models:["Fiesta","Focus"],engines:["1.6","1.0 EcoBoost"],years:"2011-2016",title:"Powershift DPS6 : broutage / mécatronique",action:"MAJ + remplacement mécatronique si campagne",severity:"critique",bulletin:"BT Ford DPS6-2014"},
 {id:"C034",brands:["Tesla"],models:["Model S","Model X"],engines:["electrique"],years:"2016-2019",title:"Gestion batterie : limitation charge après MAJ",action:"MAJ corrective BMS",severity:"important",bulletin:"BT Tesla BMS-2019"},
 {id:"C035",brands:["MG"],models:["MG4"],engines:["electrique"],years:"2023-2024",title:"Contrôle batterie HT (campagne)",action:"Contrôle modules + MAJ BMS concession",severity:"critique",bulletin:"BT MG BMS-2024"},
 {id:"C036",brands:["BYD"],models:["Atto 3","Dolphin"],engines:["electrique"],years:"2023-2025",title:"Gestion charge : MAJ logiciel",action:"MAJ logiciel charge (concession/OTA)",severity:"modéré",bulletin:"BT BYD CHG-2024"},
 {id:"C037",brands:["Peugeot","Citroën","DS"],models:["308","3008","DS4","DS5"],engines:["1.6 THP"],years:"2014-2018",title:"Calamine admission (injection directe)",action:"Décalaminage + MAJ si disponible",severity:"modéré",bulletin:"BT PSA MTR-2016"},
 {id:"C038",brands:["Volkswagen","Audi"],models:["Golf","Passat","A4","A5"],engines:["2.0 TSI"],years:"2013-2019",title:"EA888 : calamine soupapes admission",action:"Décalaminage préventif",severity:"modéré",bulletin:"BT VW MTR-2017"},
 {id:"C039",brands:["BMW"],models:["Série 1","Série 3","X1"],engines:["2.0i"],years:"2012-2015",title:"N20 : chaîne distribution préventive",action:"Remplacement préventif kit chaîne",severity:"critique",bulletin:"BT BMW MTR-2015"},
 {id:"C040",brands:["Mercedes-Benz"],models:["Classe A","Classe C","GLA"],engines:["2.1d","2.2d"],years:"2013-2016",title:"OM651 : injecteurs (campagne)",action:"Remplacement injecteurs campagne",severity:"critique",bulletin:"BT MB MTR-2015"},
 {id:"C041",brands:["Audi"],models:["A4","A6","Q5"],engines:["3.0 TDI"],years:"2016-2019",title:"3.0 TDI : système AdBlue",action:"MAJ logiciel AdBlue + capteurs",severity:"important",bulletin:"BT Audi ADB-2018"},
 {id:"C043",brands:["Renault"],models:["Zoe"],engines:["electrique"],years:"2015-2020",title:"Charge AC : chauffe connecteur (limitation)",action:"MAJ + contrôle/resserrage connecteur",severity:"important",bulletin:"BT Renault CHG-2020"},
 {id:"C044",brands:["Peugeot","Opel"],models:["e-208","e-2008","e-Corsa"],engines:["electrique"],years:"2019-2023",title:"Charge DC irrégulière",action:"MAJ BMS concession",severity:"important",bulletin:"BT PSA CHG-2021"},
 {id:"C045",brands:["Ford"],models:["Focus","Kuga"],engines:["2.0 EcoBlue"],years:"2018-2021",title:"AdBlue : pompe / capteur",action:"MAJ + remplacement pompe si défaut",severity:"important",bulletin:"BT Ford ADB-2020"},
 {id:"C046",brands:["Hyundai","Kia"],models:["Tucson","Sportage","Ceed"],engines:["1.6 CRDi"],years:"2018-2022",title:"AdBlue : cristallisation / pompe",action:"Nettoyage + MAJ logiciel",severity:"important",bulletin:"BT HK ADB-2021"},
 {id:"C047",brands:["Nissan"],models:["Leaf"],engines:["electrique"],years:"2018-2022",title:"Charge AC lente (chargeur embarqué)",action:"Contrôle / remplacement chargeur",severity:"important",bulletin:"BT Nissan CHG-2019"},
 {id:"C048",brands:["Mercedes-Benz"],models:["EQC"],engines:["electrique"],years:"2019-2022",title:"Contrôle modules batterie HT (campagne)",action:"Contrôle / remplacement modules",severity:"critique",bulletin:"BT MB BMS-2021"},
 {id:"C049",brands:["Tesla"],models:["Model 3","Model Y"],engines:["electrique"],years:"2019-2022",title:"Gestion veille : décharge parasite",action:"MAJ logiciel gestion énergie",severity:"modéré",bulletin:"BT Tesla PWR-2021"},
 {id:"C050",brands:["Mitsubishi"],models:["Outlander"],engines:["hybride"],years:"2016-2020",title:"PHEV : contrôle batterie HT",action:"Contrôle modules + MAJ BMS",severity:"important",bulletin:"BT Mitsubishi BMS-2019"},
 {id:"C051",brands:["Ford"],models:["Kuga"],engines:["hybride"],years:"2020-2021",title:"Kuga PHEV : batterie HT (rappel incendie)",action:"Remplacement batterie HT campagne",severity:"critique",bulletin:"Rappel Ford PHEV-2020"}
];
TSB_CAMPAIGNS.forEach(c=>{ if(!AUTO_DATA.campaigns.some(x=>x.id===c.id)) AUTO_DATA.campaigns.push(c); });

if (typeof window !== 'undefined'){ window.SYSTEM_LABELS=SYSTEM_LABELS; window.getSystem=getSystem; }
