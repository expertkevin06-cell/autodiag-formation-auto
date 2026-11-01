/**
 * systems.js v2 - Extension multi-systèmes + note technique Dacia Bigster
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

const SYS_FAULTS = [
 {id:"SYS01",system:"moteur",code:"TSB-COURR",title:"Courroie de distribution : usure, effilochage, rupture",type:"mecanique",component:"Courroie de distribution",engines:["essence","diesel"],symptoms:["Bruit de courroie","Voyant moteur","Casse moteur soudaine"],causes:["Dilution huile","Vidanges espacées","Tendeur fatigué"],consequences:["Casse moteur","Pompe à huile colmatée"],diagnostics:["Contrôle visuel largeur/effilochage","Historique vidanges"],repairs:["Kit courroie + galets + pompe à eau","Vidange"],tsb:["PSA 1.2 PureTech / 1.5 BlueHDi 7→8mm","Ford 1.0 EcoBoost courroie humide"],severity:"critique",cost:"500-1200€"},
 {id:"SYS02",system:"moteur",code:"TSB-CHAIN",title:"Chaîne de distribution : allongement, tendeur, guides",type:"mecanique",component:"Chaîne de distribution",engines:["essence","diesel"],symptoms:["Claquement à froid","Voyant calage","Démarrage difficile"],causes:["Tendeur HS","Lubrification insuffisante"],consequences:["Casse moteur","Soupapes/pistons HS"],diagnostics:["Écoute à froid","Codes P0016/P0340"],repairs:["Kit chaîne complet"],tsb:["BMW N47/B47","Renault 1.2 TCe H5F","VW 1.4/1.5 TSI EA211"],severity:"critique",cost:"900-3000€"},
 {id:"SYS03",system:"moteur",code:"TSB-TURBO",title:"Turbocompresseur : jeu axial, géométrie variable, wastegate",type:"mecanique",component:"Turbo",engines:["diesel","essence"],symptoms:["Sifflement","Perte puissance","Fumée bleue","Consommation huile"],causes:["Lubrification","Calamine","Wastegate grippée"],consequences:["Casse turbo"],diagnostics:["Jeu axial","Test pression suralimentation"],repairs:["Remplacement turbo","Durites/intercooler"],severity:"critique",cost:"1000-3000€"},
 {id:"SYS04",system:"moteur",code:"TSB-HUILE",title:"Consommation d'huile moteur anormale",type:"mecanique",component:"Segment",engines:["essence","diesel"],symptoms:["Niveau huile en baisse","Fumée bleue","Bougies encrassées"],causes:["Segments/usure","Joints de queue de soupape","Turbo","Reniflards"],consequences:["Casse catalyseur"],diagnostics:["Pesée consommation/1000 km","Test compression"],repairs:["Segments/joints","Séparateur d'huile"],severity:"important",cost:"300-2500€"},
 {id:"SYS05",system:"refroidissement",code:"TSB-LDR",title:"Consommation / perte de liquide de refroidissement",type:"mecanique",component:"Liquide de refroidissement",engines:["essence","diesel","hybride"],symptoms:["Niveau LDR en baisse","Odeur sucrée","Surchauffe"],causes:["Pompe à eau","Radiateur","Refroidisseur EGR","Joint culasse"],consequences:["Surchauffe","Casse joint culasse"],diagnostics:["Test pression circuit"],repairs:["Pompe/radiateur/échangeur","Joint culasse si nécessaire"],severity:"critique",cost:"300-2000€"},
 {id:"SYS06",system:"moteur",code:"TSB-PCV",title:"Séparateur d'huile / reniflards (PCV) colmatés",type:"mecanique",component:"Séparateur d'huile (reniflards)",engines:["essence","diesel"],symptoms:["Sifflement","Consommation huile","Fuites joints"],causes:["Membrane PCV fatiguée","Boue"],consequences:["Fuites huile","Turbo endommagé"],diagnostics:["Test dépression carter"],repairs:["Remplacement séparateur/reniflards"],severity:"important",cost:"150-600€"},
 {id:"SYS07",system:"embrayage",code:"TSB-EMB",title:"Embrayage / volant moteur bi-masse : broutage, bruit",type:"mecanique",component:"Embrayage",engines:["essence","diesel"],symptoms:["Broutage démarrage","Bruit au point mort","Pédale dure"],causes:["Usure disque","VM bi-masse fatigué","Butée"],consequences:["Immobilisation","Casse boîte"],diagnostics:["Test patinage","Écoute VM"],repairs:["Kit embrayage + VM"],severity:"important",cost:"800-2000€"},
 {id:"SYS08",system:"transmission",code:"TSB-DSG",title:"Boîte double embrayage / mécatronique : à-coups, surchauffe",type:"electronique",component:"Mécatronique boîte double embrayage",engines:["essence","diesel","hybride"],symptoms:["À-coups 1er/2e rapports","Message boîte chaude"],causes:["Mécatronique","Huile boîte","Embrayages usés"],consequences:["Mode dégradé"],diagnostics:["Lecture codes boîte","Vidange boîte"],repairs:["Vidange boîte","Mécatronique","Kit embrayages"],tsb:["VW DQ200/DQ250","Ford Powershift"],severity:"critique",cost:"600-3000€"},
 {id:"SYS09",system:"transmission",code:"TSB-BVM",title:"Boîte manuelle : synchroniseurs, roulements, fuite",type:"mecanique",component:"Synchroniseurs boîte",engines:["essence","diesel"],symptoms:["Difficulté passage rapports","Ronflement","Fuite huile"],causes:["Synchroniseurs usés","Roulements","Joints"],consequences:["Casse boîte"],diagnostics:["Essai routier","Contrôle fuite"],repairs:["Réparation/remplacement boîte"],severity:"important",cost:"500-2500€"},
 {id:"SYS10",system:"batterie",code:"TSB-48V",title:"Batterie 48V mild-hybrid : défaut, charge, stop&start",type:"electrique",component:"Batterie 48V",engines:["hybride"],symptoms:["Stop&start inopérant","Voyant hybride"],causes:["Cellules 48V fatiguées","Convertisseur DC/DC"],consequences:["Consommation accrue"],diagnostics:["Test batterie 48V","Codes BMS 48V"],repairs:["Remplacement batterie 48V","Convertisseur"],severity:"important",cost:"600-1800€"},
 {id:"SYS11",system:"batterie",code:"TSB-DRAIN",title:"Consommation de courant / fuite parasitaire (décharge)",type:"electrique",component:"Fuite de courant parasitaire",engines:["essence","diesel","hybride","electrique"],symptoms:["Batterie déchargée après repos"],causes:["Module ne dormant pas","Faisceau/accessoires"],consequences:["Immobilisation"],diagnostics:["Mesure courant repos (<50 mA)"],repairs:["Correction module/faisceau"],severity:"important",cost:"100-600€"},
 {id:"SYS12",system:"batterie",code:"TSB-BMS",title:"BMS : autonomie estimée erronée, déséquilibre cellules",type:"electronique",component:"BMS (Battery Management System)",engines:["electrique","hybride"],symptoms:["Autonomie affichée incohérente","Chute brutale %"],causes:["Calibration BMS","Cellules déséquilibrées"],consequences:["Autonomie réelle réduite"],diagnostics:["Lecture équilibrage cellules","SOH"],repairs:["Calibration/MAJ BMS"],severity:"important",cost:"0-800€"},
 {id:"SYS13",system:"charge",code:"TSB-OBC",title:"Charge AC : chargeur embarqué / pilote défaillant",type:"electrique",component:"Onduleur",engines:["electrique","hybride"],symptoms:["Charge AC lente/absente","Erreur borne"],causes:["Chargeur embarqué","Câble pilote","Connecteur"],consequences:["Recharge impossible"],diagnostics:["Test plusieurs bornes","Codes charge"],repairs:["Remplacement chargeur embarqué"],severity:"critique",cost:"800-2500€"},
 {id:"SYS14",system:"multimedia",code:"TSB-HU",title:"Tablette multimédia / écran : gel, noir, reboots",type:"electronique",component:"Tablette multimédia",engines:["essence","diesel","hybride","electrique"],symptoms:["Écran figé/noir","Reboots","Perte CarPlay"],causes:["Logiciel","Mémoire","Surchauffe"],consequences:["Perte fonctions"],diagnostics:["Version logicielle","Reset usine"],repairs:["MAJ logiciel","Remplacement unité"],tsb:["VW ID / Tesla MCU / Stellantis Uconnect"],severity:"modéré",cost:"0-1500€"},
 {id:"SYS15",system:"adas",code:"TSB-CAM",title:"Caméra ADAS / recul : buée, calibration, infiltration",type:"electronique",component:"Caméra ADAS",engines:["essence","diesel","hybride","electrique"],symptoms:["ADAS indisponible","Image trouble"],causes:["Infiltration eau","Décalage après choc"],consequences:["Perte fonctions ADAS"],diagnostics:["Contrôle étanchéité","Calibration"],repairs:["Remplacement caméra + calibration"],severity:"important",cost:"300-1200€"},
 {id:"SYS16",system:"adas",code:"TSB-RAD",title:"Radar ADAS / régulateur adaptatif : encrassement, désalignement",type:"electronique",component:"Radar ADAS",engines:["essence","diesel","hybride","electrique"],symptoms:["ACC indisponible","Fausses alertes"],causes:["Désalignement","Boue/neige"],consequences:["Perte ACC/AEB"],diagnostics:["Codes ADAS","Calibration radar"],repairs:["Nettoyage/calibration"],severity:"important",cost:"150-900€"},
 {id:"SYS17",system:"securite",code:"TSB-AIRB",title:"Airbag / prétensionneurs : voyant, connecteurs, clock spring",type:"electronique",component:"Boîtier airbag",engines:["essence","diesel","hybride","electrique"],symptoms:["Voyant airbag","Perte commandes volant"],causes:["Connecteur sous siège","Contacteur tournant"],consequences:["Non-déploiement","CT défavorable"],diagnostics:["Codes SRS","Contrôle connecteurs"],repairs:["Connecteurs/clock spring/boîtier"],severity:"critique",cost:"150-1200€"},
 {id:"SYS18",system:"securite",code:"TSB-CEINT",title:"Ceintures / prétensionneurs : blocage, rappel constructeur",type:"mecanique",component:"Prétensionneurs ceintures",engines:["essence","diesel","hybride","electrique"],symptoms:["Ceinture bloquée","Enrouleur grippé"],causes:["Prétensionneur","Enrouleur","Rappel constructeur"],consequences:["Sécurité passive réduite"],diagnostics:["Contrôle enroulement","Statut rappel VIN"],repairs:["Remplacement enrouleur/prétensionneur"],severity:"critique",cost:"200-800€"},
 {id:"SYS19",system:"electronique",code:"TSB-ECU",title:"Calculateur (moteur/BSI) : infiltration d'eau, oxydation, court-circuit",type:"electronique",component:"Calculateurs (ECU)",engines:["essence","diesel","hybride","electrique"],symptoms:["Pannes multiples aléatoires","Non-démarrage"],causes:["Infiltration eau","Oxydation connecteurs"],consequences:["Casse calculateur"],diagnostics:["Inspection traces eau","Test connecteurs"],repairs:["Séchage/nettoyage","Remplacement calculateur"],severity:"critique",cost:"300-2500€"},
 {id:"SYS20",system:"carrosserie",code:"TSB-INFIL",title:"Infiltration d'eau habitacle / faisceaux : oxydation, court-circuit",type:"electrique",component:"Faisceau électrique",engines:["essence","diesel","hybride","electrique"],symptoms:["Odeur humidité","Buée intérieure","Pannes électriques"],causes:["Joints/écoulements obstrués"],consequences:["Oxydation","Court-circuits"],diagnostics:["Contrôle moquette/écoulements"],repairs:["Nettoyage écoulements","Joints","Faisceau"],severity:"important",cost:"150-1200€"},
 {id:"SYS21",system:"carrosserie",code:"TSB-ROUIL",title:"Rouille / corrosion châssis, berceau, sous-ensembles",type:"mecanique",component:"Silent bloc",engines:["essence","diesel","hybride","electrique"],symptoms:["Corrosion visible","Bruits suspensions"],causes:["Sel","Défaut protection"],consequences:["Rupture berceau/bras"],diagnostics:["Inspection pont"],repairs:["Traitement/remplacement"],severity:"important",cost:"200-2000€"},
 {id:"SYS22",system:"freinage",code:"TSB-GRIPP",title:"Grippage étriers / axes / câbles (rouille)",type:"mecanique",component:"Étrier de frein",engines:["essence","diesel","hybride","electrique"],symptoms:["Frein qui traîne","Usure inégale","Tirage"],causes:["Axes grippés","Sel"],consequences:["Surchauffe disque"],diagnostics:["Rotation roue","Inspection axes"],repairs:["Nettoyage/remplacement étriers"],severity:"important",cost:"150-700€"},
 {id:"SYS23",system:"direction",code:"TSB-CREM",title:"Crémaillère de direction : jeu, claquement, fuite",type:"mecanique",component:"Crémaillère de direction",engines:["essence","diesel","hybride","electrique"],symptoms:["Claquement braquage","Jeu volant","Fuite"],causes:["Rotules internes","Joints","Chocs"],consequences:["Perte précision"],diagnostics:["Jeu à la barre","Contrôle fuite"],repairs:["Remplacement crémaillère"],severity:"critique",cost:"600-1800€"},
 {id:"SYS24",system:"direction",code:"TSB-EPS",title:"Direction assistée électrique (boîtier/colonne) : moteur, capteur couple",type:"electronique",component:"Colonne de direction",engines:["essence","diesel","hybride","electrique"],symptoms:["Assistance coupée","Volant dur","Voyant direction"],causes:["Moteur EPS","Capteur couple","Infiltration"],consequences:["Perte assistance"],diagnostics:["Codes EPS","Test assistance"],repairs:["Remplacement colonne/boîtier EPS"],severity:"critique",cost:"700-2200€"},
 {id:"SYS25",system:"electricite",code:"TSB-ALT",title:"Alternateur / charge 12V : diodes, poulie débrayable",type:"electrique",component:"Alternateur",engines:["essence","diesel","hybride"],symptoms:["Voyant batterie","Sifflement","Décharges"],causes:["Diodes","Poulie","Régulateur"],consequences:["Panne 12V"],diagnostics:["Test charge 13,8-14,4 V"],repairs:["Remplacement alternateur/poulie"],severity:"important",cost:"300-900€"},
 {id:"SYS26",system:"electricite",code:"TSB-OXID",title:"Oxydation connecteurs / masses : court-circuit, pannes intermittentes",type:"electrique",component:"Connecteurs oxydés",engines:["essence","diesel","hybride","electrique"],symptoms:["Pannes intermittentes","Corrosion visible"],causes:["Humidité/sel"],consequences:["Court-circuits","Casse modules"],diagnostics:["Inspection connecteurs/masses"],repairs:["Nettoyage/remplacement connecteurs"],severity:"important",cost:"100-800€"},
 {id:"SYS27",system:"suspension",code:"TB-DAC-BIG-RESS",title:"Dacia Bigster : ressorts de suspension arrière — risque de rupture / corrosion prématurée",type:"mecanique",component:"Ressort",brands:["Dacia"],modelRefs:["Bigster"],engines:["essence","hybride","flexfuel"],
  symptoms:["Claquement/bruit de suspension arrière","Assiette affaissée d'un côté","Fissure ou corrosion visible sur les spires","Perte de stabilité en virage ou en charge"],
  causes:["Corrosion prématurée des spires (traitement de surface insuffisant, lots 2025)","Sollicitations en charge élevée","Défaut de conformité fournisseur"],
  consequences:["Rupture de ressort en roulage","Perte de contrôle du véhicule","Endommagement amortisseur, coupelle et pare-choc"],
  diagnostics:["Inspection visuelle des spires arrière (corrosion, fissure, peinture écaillée)","Contrôle assiette / hauteur de caisse gauche-droite","Essai routier : bruits de suspension sur bosses"],
  repairs:["Remplacement des ressorts arrière par paire","Contrôle amortisseurs, coupelles et butées","Contrôle géométrie après remplacement"],
  tsb:["Bulletin technique Dacia : contrôle préventif des ressorts de suspension arrière sur Bigster (millésimes 2025)","Référence interne : TSB-DAC-BIG-RESS"],
  bulletin:"Bulletin technique Dacia Bigster SUS-2025-01 — contrôle et remplacement préventif des ressorts de suspension arrière",
  recalls:["Campagne C021 : contrôle et remplacement ressorts suspension arrière"],
  severity:"critique",cost:"250-700€"},
 {id:"SYS28",system:"suspension",code:"TSB-SUSP",title:"Ressorts / amortisseurs : fatigue, corrosion, rupture (toutes marques)",type:"mecanique",component:"Ressort",engines:["essence","diesel","hybride","electrique"],
  symptoms:["Bruits de suspension","Affaissement d'un coin","Tenue de route dégradée","Usure irrégulière pneus"],
  causes:["Corrosion","Fatigue métal","Charges répétées"],
  consequences:["Rupture de ressort","Usure amortisseurs prématurée"],
  diagnostics:["Inspection visuelle spires","Contrôle assiette","Test rebond"],
  repairs:["Remplacement par paire","Contrôle amortisseurs"],
  severity:"important",cost:"200-800€"}
];
SYS_FAULTS.forEach(f=>{ f.brands=f.brands||["ALL"]; AUTO_DATA.faults.push(f); });

// Campagne Dacia Bigster ressorts
if(!AUTO_DATA.campaigns.some(c=>c.id==="C021")){
  AUTO_DATA.campaigns.push({ id:"C021", brands:["Dacia"], models:["Bigster"], engines:["TCe 140 mild-hybrid","HYBRID 155","ECO-G 140"], years:"2025", title:"Ressorts de suspension arrière : contrôle / remplacement préventif", action:"Contrôle visuel des spires arrière et remplacement si corrosion/fissure — bulletin technique SUS-2025-01", severity:"critique" });
}

if (typeof window !== 'undefined'){ window.SYSTEM_LABELS=SYSTEM_LABELS; window.getSystem=getSystem; }
