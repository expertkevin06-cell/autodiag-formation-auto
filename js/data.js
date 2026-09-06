/**
 * Base de données AutoDiag Pro - Version enrichie
 * Marques complètes + motorisations avec puissances + codes défauts
 * + Bulletins techniques (TSB) + Campagnes de rappel
 */

// Helper compact pour les motorisations
function E(name,type,ch,kw,code,years,issues,recalls){
  return {name,type,ch,kw,code,years,issues:issues||[],recalls:recalls||[]};
}

const AUTO_DATA = {

  brands: {
    // ===== FRANÇAISES =====
    "Renault": { country:"FR", models:["Clio","Twingo","Megane","Scenic","Espace","Captur","Kadjar","Austral","Koleos","Arkana","Talisman","Kangoo","Trafic","Master","Zoe","Megane E-Tech"], engines:["essence","diesel","hybride","electrique"] },
    "Peugeot": { country:"FR", models:["108","208","2008","308","3008","408","508","5008","Partner","Rifter","Expert","Traveller","Boxer","e-208","e-2008","e-308","e-3008","iOn"], engines:["essence","diesel","hybride","electrique"] },
    "Citroën": { country:"FR", models:["C1","C3","C3 Aircross","C4","C4 X","C5 Aircross","C5 X","Berlingo","Jumpy","SpaceTourer","Jumper","ë-C3","ë-C4","Ami"], engines:["essence","diesel","hybride","electrique"] },
    "DS": { country:"FR", models:["DS3 Crossback","DS4","DS7","DS9","E-Tense"], engines:["essence","diesel","hybride"] },
    "Alpine": { country:"FR", models:["A110"], engines:["essence"] },
    "Dacia": { country:"RO", models:["Sandero","Logan","Duster","Jogger","Spring","Lodgy","Dokker"], engines:["essence","diesel","hybride","electrique"] },

    // ===== EUROPÉENNES =====
    "Volkswagen": { country:"DE", models:["Up!","Polo","Golf","Passat","Arteon","T-Cross","T-Roc","Tiguan","Touareg","Taigo","ID.3","ID.4","ID.5","ID.Buzz","Caddy","Transporter"], engines:["essence","diesel","hybride","electrique"] },
    "BMW": { country:"DE", models:["Série 1","Série 2","Série 3","Série 4","Série 5","Série 7","X1","X2","X3","X4","X5","X6","X7","Z4","i3","i4","iX","iX1","iX3"], engines:["essence","diesel","hybride","electrique"] },
    "Mercedes-Benz": { country:"DE", models:["Classe A","Classe B","Classe C","Classe E","Classe S","CLA","GLA","GLB","GLC","GLE","GLS","EQA","EQB","EQC","EQE","EQS","Citan","Vito","Sprinter"], engines:["essence","diesel","hybride","electrique"] },
    "Audi": { country:"DE", models:["A1","A3","A4","A5","A6","A7","A8","Q2","Q3","Q4 e-tron","Q5","Q7","Q8","e-tron","e-tron GT"], engines:["essence","diesel","hybride","electrique"] },
    "Opel": { country:"DE", models:["Corsa","Astra","Insignia","Mokka","Crossland","Grandland","Combo","Vivaro","Movano","Frontera"], engines:["essence","diesel","hybride","electrique"] },
    "Ford": { country:"EU/US", models:["Ka+","Fiesta","Focus","Puma","Kuga","Edge","Explorer","Mustang","Mustang Mach-E","Bronco","Ranger","Transit"], engines:["essence","diesel","hybride","electrique","flexfuel"] },
    "Fiat": { country:"IT", models:["500","500X","500L","Panda","Tipo","Doblo","Ducato","500e"], engines:["essence","diesel","hybride","electrique"] },
    "Alfa Romeo": { country:"IT", models:["Giulietta","Giulia","Stelvio","Tonale","Junior"], engines:["essence","diesel","hybride"] },
    "Lancia": { country:"IT", models:["Ypsilon"], engines:["essence","hybride"] },
    "Volvo": { country:"SE", models:["S60","S90","V60","V90","XC40","XC60","XC90","C40","EX30","EX90"], engines:["essence","diesel","hybride","electrique"] },
    "Polestar": { country:"SE", models:["Polestar 2","Polestar 3"], engines:["electrique"] },
    "SEAT": { country:"ES", models:["Ibiza","Leon","Arona","Ateca","Tarraco"], engines:["essence","diesel","hybride"] },
    "Cupra": { country:"ES", models:["Formentor","Born","Leon","Ateca"], engines:["essence","hybride","electrique"] },
    "Skoda": { country:"CZ", models:["Fabia","Scala","Octavia","Superb","Kamiq","Karoq","Kodiaq","Enyaq","Citigo"], engines:["essence","diesel","hybride","electrique"] },
    "Porsche": { country:"DE", models:["911","718","Cayenne","Macan","Taycan","Panamera"], engines:["essence","hybride","electrique"] },
    "MINI": { country:"UK", models:["Cooper","Countryman","Clubman","Electric"], engines:["essence","diesel","electrique"] },
    "Jaguar": { country:"UK", models:["XE","XF","F-Pace","E-Pace","I-Pace"], engines:["essence","diesel","electrique"] },
    "Land Rover": { country:"UK", models:["Defender","Discovery","Discovery Sport","Range Rover","Range Rover Evoque","Range Rover Sport","Velar"], engines:["essence","diesel","hybride"] },
    "Smart": { country:"DE", models:["ForTwo","ForFour","#1","#3"], engines:["essence","electrique"] },

    // ===== ASIATIQUES =====
    "Toyota": { country:"JP", models:["Aygo","Yaris","Yaris Cross","Corolla","Camry","Prius","C-HR","RAV4","Highlander","Land Cruiser","Hilux","Proace","bZ4X","Mirai"], engines:["essence","diesel","hybride","electrique"] },
    "Honda": { country:"JP", models:["Civic","CR-V","Jazz","HR-V","ZR-V","e","City"], engines:["essence","hybride","electrique"] },
    "Nissan": { country:"JP", models:["Micra","Juke","Qashqai","X-Trail","Leaf","Ariya","Navara","Townstar"], engines:["essence","diesel","hybride","electrique"] },
    "Mazda": { country:"JP", models:["Mazda2","Mazda3","Mazda6","CX-3","CX-30","CX-5","CX-60","MX-5","MX-30"], engines:["essence","diesel","hybride","electrique"] },
    "Mitsubishi": { country:"JP", models:["Space Star","ASX","Eclipse Cross","Outlander","L200"], engines:["essence","diesel","hybride"] },
    "Subaru": { country:"JP", models:["Impreza","Forester","Outback","XV","Crosstrek","BRZ"], engines:["essence","diesel","hybride"] },
    "Lexus": { country:"JP", models:["UX","NX","RX","ES","LS","LC","LBX","RZ"], engines:["essence","hybride","electrique"] },
    "Hyundai": { country:"KR", models:["i10","i20","i30","Bayon","Kona","Tucson","Santa Fe","Ioniq 5","Ioniq 6","Nexo"], engines:["essence","diesel","hybride","electrique"] },
    "Kia": { country:"KR", models:["Picanto","Rio","Ceed","Stonic","Niro","Sportage","Sorento","EV6","EV9","Soul"], engines:["essence","diesel","hybride","electrique"] },
    "Suzuki": { country:"JP", models:["Swift","Ignis","Vitara","S-Cross","Swace","Across","Jimny"], engines:["essence","hybride"] },
    "SsangYong": { country:"KR", models:["Tivoli","Korando","Rexton","Musso","Torres"], engines:["essence","diesel"] },

    // ===== CHINOISES =====
    "MG": { country:"CN", models:["MG3","MG4","MG5","ZS","HS","Marvel R"], engines:["essence","hybride","electrique"] },
    "BYD": { country:"CN", models:["Atto 3","Dolphin","Seal","Han","Tang","Song Plus","Seal U"], engines:["electrique","hybride"] },
    "Aiways": { country:"CN", models:["U5","U6"], engines:["electrique"] },
    "Lynk & Co": { country:"CN", models:["01","02"], engines:["hybride"] },
    "NIO": { country:"CN", models:["ET5","ET7","EL6","EL7"], engines:["electrique"] },
    "XPeng": { country:"CN", models:["P7","G9","G6"], engines:["electrique"] },
    "Zeekr": { country:"CN", models:["001","X"], engines:["electrique"] },
    "Geely": { country:"CN", models:["Starray","Monjaro"], engines:["essence","hybride"] },
    "Haval": { country:"CN", models:["H6","Jolion"], engines:["essence","hybride"] },
    "Chery": { country:"CN", models:["Tiggo 7","Tiggo 8"], engines:["essence"] },
    "Omoda": { country:"CN", models:["5"], engines:["essence","electrique"] },
    "Jaecoo": { country:"CN", models:["7"], engines:["essence","hybride"] },

    // ===== AMÉRICAINES =====
    "Tesla": { country:"US", models:["Model 3","Model Y","Model S","Model X","Cybertruck"], engines:["electrique"] },
    "Jeep": { country:"US", models:["Renegade","Compass","Cherokee","Grand Cherokee","Wrangler","Avenger","Gladiator"], engines:["essence","diesel","hybride","electrique"] },
    "Chevrolet": { country:"US", models:["Camaro","Corvette","Equinox","Tahoe","Suburban","Bolt"], engines:["essence","hybride","electrique"] },
    "Dodge": { country:"US", models:["Challenger","Charger","Durango","Hornet"], engines:["essence","hybride"] },
    "Cadillac": { country:"US", models:["Escalade","XT4","XT5","XT6","Lyriq"], engines:["essence","hybride","electrique"] },
    "Lincoln": { country:"US", models:["Corsair","Nautilus","Aviator","Navigator"], engines:["essence","hybride"] },
    "GMC": { country:"US", models:["Sierra","Yukon","Acadia","Hummer EV"], engines:["essence","diesel","electrique"] },
    "RAM": { country:"US", models:["1500","2500","ProMaster"], engines:["essence","diesel"] },
    "Ford US": { country:"US", models:["F-150","Lightning","Maverick"], engines:["essence","hybride","electrique"] }
  },

  // ===== MOTORISATIONS DÉTAILLÉES PAR MODÈLE (puissances) =====
  enginesByModel: {
    "Peugeot": {
      "208": [
        E("1.0 VTi 68","essence",68,50,"EB0","2012-2019"),
        E("1.2 PureTech 82","essence",82,60,"EB2","2012-2019",["Usure courroie distribution humide","Consommation d'huile"],["Contrôle courroie humide"]),
        E("1.2 PureTech 100","essence",100,74,"EB2AD","2019+",["Courroie humide (dilution huile)"],["Campagne contrôle courroie + MAJ logiciel dilution"]),
        E("1.2 PureTech 130","essence",130,96,"EB2ADT","2019+",["Courroie humide","Bougies"],["Extension garantie courroie"]),
        E("1.5 BlueHDi 100","diesel",100,75,"DV5RD","2018+",["Courroie 7mm→8mm","Régénérations FAP"],["Campagne courroie 8mm"]),
        E("1.6 BlueHDi 100","diesel",100,73,"DV6FD","2015-2018",["FAP/AdBlue"]),
        E("e-208 136","electrique",136,100,"ZK01","2019-2023",["Batterie 50 kWh"]),
        E("e-208 156","electrique",156,115,"ZK02","2023+",[])
      ],
      "2008": [
        E("1.2 PureTech 100","essence",100,74,"EB2AD","2019+",["Courroie humide"]),
        E("1.2 PureTech 130","essence",130,96,"EB2ADT","2019+",["Courroie humide"]),
        E("1.2 PureTech 155","essence",155,114,"EB2ADTS","2019-2022"),
        E("1.5 BlueHDi 110","diesel",110,81,"DV5RC","2019+",["Courroie 7mm→8mm","FAP"],["Campagne courroie 8mm"]),
        E("1.5 BlueHDi 130","diesel",130,96,"DV5RC","2018+",["Courroie 7mm→8mm","Régénérations FAP excessives"],["Campagne courroie 8mm","MAJ logiciel FAP"]),
        E("e-2008 136","electrique",136,100,"ZK01","2019-2023"),
        E("e-2008 156","electrique",156,115,"ZK02","2023+")
      ],
      "308": [
        E("1.2 PureTech 110","essence",110,81,"EB2DT","2014+",["Courroie humide"]),
        E("1.2 PureTech 130","essence",130,96,"EB2ADT","2015+",["Courroie humide","Distribution"]),
        E("1.6 THP 155","essence",155,115,"EP6FDT","2014-2018",["Chaîne distribution","Calamine"]),
        E("1.6 THP 205","essence",205,151,"EP6FDTX","2015-2018",["Calamine soupapes"]),
        E("1.5 BlueHDi 130","diesel",130,96,"DV5RC","2018+",["Courroie 7mm→8mm","Régénérations FAP"],["Campagne courroie 8mm","MAJ logiciel FAP"]),
        E("1.6 BlueHDi 120","diesel",120,88,"DV6FC","2014-2018",["AdBlue","FAP"]),
        E("2.0 BlueHDi 150","diesel",150,110,"DW10FD","2014-2018",["FAP","AdBlue"]),
        E("2.0 BlueHDi 180","diesel",180,133,"DW10FC","2014-2020",["FAP","Injecteurs"]),
        E("Hybrid 180","hybride",180,132,"EB2+MHEV","2021+"),
        E("Hybrid 225","hybride",225,165,"EP6+MHEV","2021+"),
        E("e-308 156","electrique",156,115,"ZK02","2023+")
      ],
      "3008": [
        E("1.2 PureTech 130","essence",130,96,"EB2ADT","2016-2023",["Courroie humide","Dilution huile"],["Extension garantie courroie"]),
        E("1.6 THP 165","essence",165,121,"EP6FDTM","2016-2018",["Calamine"]),
        E("1.6 PureTech 180","essence",180,133,"EP6FADTX","2018-2023"),
        E("1.5 BlueHDi 130","diesel",130,96,"DV5RC","2018+",["Courroie distribution 7mm→8mm (TSB)","Régénérations FAP excessives","Capteur NOx"],["Campagne courroie 8mm + galets","MAJ logiciel calculateur (régénérations)"]),
        E("1.6 BlueHDi 120","diesel",120,88,"DV6FC","2016-2018",["AdBlue","FAP"]),
        E("2.0 BlueHDi 150","diesel",150,110,"DW10FD","2016-2018",["FAP"]),
        E("2.0 BlueHDi 180","diesel",180,133,"DW10FC","2016-2020",["Injecteurs","FAP","AdBlue"]),
        E("Hybrid 225","hybride",225,165,"EP6 PHEV","2020+"),
        E("Hybrid4 300","hybride",300,221,"EP6 PHEV 4WD","2020+"),
        E("1.2 Hybrid 136","hybride",136,100,"EB2 MHEV 48V","2024+"),
        E("e-3008 210","electrique",210,157,"M3","2024+"),
        E("e-3008 230","electrique",230,170,"M3","2024+"),
        E("e-3008 320 4WD","electrique",320,236,"M3 dual","2024+")
      ],
      "5008": [
        E("1.2 PureTech 130","essence",130,96,"EB2ADT","2017+",["Courroie humide"]),
        E("1.6 PureTech 180","essence",180,133,"EP6FADTX","2018+"),
        E("1.5 BlueHDi 130","diesel",130,96,"DV5RC","2018+",["Courroie 7mm→8mm","FAP"],["Campagne courroie 8mm"]),
        E("2.0 BlueHDi 180","diesel",180,133,"DW10FC","2017-2020"),
        E("Hybrid 225","hybride",225,165,"EP6 PHEV","2021+")
      ],
      "508": [
        E("1.6 PureTech 180","essence",180,133,"EP6FADTX","2018+"),
        E("1.6 PureTech 225","essence",225,165,"EP6FADTX","2018+"),
        E("1.5 BlueHDi 130","diesel",130,96,"DV5RC","2018+",["Courroie 7mm→8mm"]),
        E("2.0 BlueHDi 160","diesel",160,118,"DW10FD","2018+"),
        E("2.0 BlueHDi 180","diesel",180,133,"DW10FC","2018+"),
        E("Hybrid 225","hybride",225,165,"EP6 PHEV","2020+"),
        E("PSE 360","hybride",360,265,"EP6 PHEV 4WD","2021+")
      ]
    },
    "Citroën": {
      "C3": [
        E("1.2 PureTech 68","essence",68,50,"EB2F","2016+"),
        E("1.2 PureTech 82","essence",82,60,"EB2","2016+",["Courroie humide"]),
        E("1.2 PureTech 110","essence",110,81,"EB2DT","2016+",["Courroie humide"]),
        E("1.5 BlueHDi 100","diesel",100,75,"DV5RD","2018+",["Courroie 7mm→8mm"]),
        E("1.6 BlueHDi 75","diesel",75,55,"DV6FE","2016-2018"),
        E("ë-C3 113","electrique",113,83,"44 kWh","2024+")
      ],
      "C4": [
        E("1.2 PureTech 100","essence",100,74,"EB2AD","2020+"),
        E("1.2 PureTech 130","essence",130,96,"EB2ADT","2020+",["Courroie humide"]),
        E("1.2 PureTech 155","essence",155,114,"EB2ADTS","2020-2022"),
        E("1.5 BlueHDi 110","diesel",110,81,"DV5RC","2020+"),
        E("1.5 BlueHDi 130","diesel",130,96,"DV5RC","2020+",["Courroie 7mm→8mm","FAP"]),
        E("ë-C4 136","electrique",136,100,"ZK01","2020-2023"),
        E("ë-C4 156","electrique",156,115,"ZK02","2023+")
      ],
      "C5 Aircross": [
        E("1.2 PureTech 130","essence",130,96,"EB2ADT","2018+"),
        E("1.6 PureTech 180","essence",180,133,"EP6FADTX","2019+"),
        E("1.5 BlueHDi 130","diesel",130,96,"DV5RC","2018+",["Courroie 7mm→8mm","FAP"]),
        E("2.0 BlueHDi 180","diesel",180,133,"DW10FC","2018-2020"),
        E("Hybrid 180","hybride",180,132,"EP6 PHEV","2022+"),
        E("Hybrid 225","hybride",225,165,"EP6 PHEV","2020+")
      ],
      "Berlingo": [
        E("1.2 PureTech 110","essence",110,81,"EB2DT","2018+"),
        E("1.5 BlueHDi 75","diesel",75,55,"DV5RD","2018+"),
        E("1.5 BlueHDi 100","diesel",100,75,"DV5RD","2018+"),
        E("1.5 BlueHDi 130","diesel",130,96,"DV5RC","2018+",["Courroie 7mm→8mm"]),
        E("ë-Berlingo 136","electrique",136,100,"ZK01","2021+")
      ]
    },
    "Renault": {
      "Clio": [
        E("1.0 SCe 65","essence",65,48,"B4D","2019+"),
        E("1.0 SCe 72","essence",72,53,"B4D","2019+"),
        E("1.0 TCe 90","essence",90,67,"H4D","2019+"),
        E("1.0 TCe 100","essence",100,74,"H4D","2020+"),
        E("1.3 TCe 130","essence",130,96,"H5H","2019-2021"),
        E("1.3 TCe 140","essence",140,103,"H5H","2019-2021"),
        E("1.5 Blue dCi 85","diesel",85,63,"K9K","2019+",["Injecteurs","Vanne EGR"]),
        E("1.5 Blue dCi 100","diesel",100,74,"K9K","2019+",["EGR","FAP"]),
        E("1.5 Blue dCi 115","diesel",115,85,"K9K","2019+",["EGR","FAP","AdBlue"]),
        E("E-Tech 140","hybride",140,103,"H4M HEV","2020+"),
        E("E-Tech 145","hybride",145,105,"H4M HEV","2023+")
      ],
      "Captur": [
        E("1.0 TCe 90","essence",90,67,"H4D","2019+"),
        E("1.0 TCe 100","essence",100,74,"H4D","2020+"),
        E("1.3 TCe 140","essence",140,103,"H5H","2019+"),
        E("1.3 TCe 155","essence",155,114,"H5H","2019-2021"),
        E("1.5 Blue dCi 95","diesel",95,70,"K9K","2019+"),
        E("1.5 Blue dCi 115","diesel",115,85,"K9K","2019+",["EGR","FAP"]),
        E("E-Tech 145","hybride",145,105,"H4M HEV","2020+"),
        E("E-Tech 160","hybride",160,118,"H4M HEV","2023+")
      ],
      "Megane": [
        E("1.3 TCe 115","essence",115,85,"H5H","2018+"),
        E("1.3 TCe 140","essence",140,103,"H5H","2018+"),
        E("1.3 TCe 160","essence",160,118,"H5H","2018-2021"),
        E("1.5 Blue dCi 95","diesel",95,70,"K9K","2018+"),
        E("1.5 Blue dCi 115","diesel",115,85,"K9K","2018+",["EGR","FAP"]),
        E("1.7 Blue dCi 150","diesel",150,110,"R9N","2019+",["AdBlue"]),
        E("E-Tech 160","hybride",160,118,"H4M HEV","2021+")
      ],
      "Zoe": [
        E("R90 88","electrique",88,65,"22 kWh","2012-2016"),
        E("R90 92","electrique",92,68,"41 kWh","2016-2019"),
        E("R110 108","electrique",108,80,"52 kWh","2018+"),
        E("R135 135","electrique",135,100,"52 kWh","2019+",["Chargeur caméléon"])
      ],
      "Austral": [
        E("1.2 E-Tech 160","hybride",160,118,"HR12","2023+"),
        E("1.2 E-Tech 200","hybride",200,147,"HR12","2023+"),
        E("1.3 TCe 140 mild-hybrid","hybride",140,103,"H5H MHEV","2022+"),
        E("1.3 TCe 160 mild-hybrid","hybride",160,118,"H5H MHEV","2022+")
      ]
    },
    "Dacia": {
      "Sandero": [
        E("1.0 SCe 65","essence",65,48,"B4D","2021+"),
        E("1.0 TCe 90","essence",90,67,"H4D","2021+"),
        E("1.0 TCe 110","essence",110,81,"H4D","2021+"),
        E("ECO-G 100 (GPL)","flexfuel",100,74,"H4D GPL","2021+")
      ],
      "Duster": [
        E("1.0 TCe 100","essence",100,74,"H4D","2020+"),
        E("1.3 TCe 130","essence",130,96,"H5H","2019+"),
        E("1.3 TCe 150","essence",150,110,"H5H","2019-2022"),
        E("1.5 Blue dCi 95","diesel",95,70,"K9K","2018+"),
        E("1.5 Blue dCi 115","diesel",115,85,"K9K","2018+",["EGR","FAP"]),
        E("ECO-G 100 (GPL)","flexfuel",100,74,"H4D GPL","2019+"),
        E("HYBRID 140","hybride",140,103,"H4M HEV","2024+")
      ],
      "Spring": [
        E("Electric 45","electrique",45,33,"27.4 kWh","2021-2023"),
        E("Electric 65","electrique",65,48,"27.4 kWh","2021+"),
        E("Electric 70","electrique",70,51,"26.8 kWh","2024+")
      ],
      "Jogger": [
        E("1.0 TCe 110","essence",110,81,"H4D","2021+"),
        E("ECO-G 100 (GPL)","flexfuel",100,74,"H4D GPL","2021+"),
        E("HYBRID 140","hybride",140,103,"H4M HEV","2023+")
      ]
    },
    "Volkswagen": {
      "Polo": [
        E("1.0 MPI 80","essence",80,59,"DSI","2017+"),
        E("1.0 TSI 95","essence",95,70,"DKLA","2017+"),
        E("1.0 TSI 110","essence",110,81,"DKLA","2021+"),
        E("1.5 TSI 150","essence",150,110,"DPCA","2018-2021",["FAP essence (GPF)"]),
        E("2.0 TSI 207 GTI","essence",207,152,"DKTB","2017+")
      ],
      "Golf": [
        E("1.0 TSI 90","essence",90,66,"DKLA","2020+"),
        E("1.0 TSI 110","essence",110,81,"DKLA","2020+"),
        E("1.5 TSI 130","essence",130,96,"DPCA","2020+",["GPF","Cylindres désactivés"]),
        E("1.5 TSI 150","essence",150,110,"DPCA","2020+",["GPF"]),
        E("2.0 TDI 115","diesel",115,85,"DSUD","2020+",["AdBlue"]),
        E("2.0 TDI 150","diesel",150,110,"DTUA","2020+",["AdBlue","FAP"]),
        E("1.4 eHybrid 204","hybride",204,150,"DGEA PHEV","2020+"),
        E("1.4 GTE 245","hybride",245,180,"DGEA PHEV","2020+"),
        E("2.0 TSI 245 GTI","essence",245,180,"DNFB","2020+"),
        E("2.0 TSI 320 R","essence",320,235,"DNFF","2021+")
      ],
      "Tiguan": [
        E("1.5 TSI 130","essence",130,96,"DPCA","2018+"),
        E("1.5 TSI 150","essence",150,110,"DPCA","2018+"),
        E("2.0 TSI 190","essence",190,140,"DNVA","2020+"),
        E("2.0 TDI 150","diesel",150,110,"DTUA","2020+",["AdBlue","FAP"]),
        E("2.0 TDI 200","diesel",200,147,"DTUA","2020+"),
        E("1.4 eHybrid 245","hybride",245,180,"DGEA PHEV","2020+")
      ],
      "ID.3": [
        E("Pure 145","electrique",145,107,"45 kWh","2020+"),
        E("Pro 170","electrique",170,125,"58 kWh","2020+"),
        E("Pro S 204","electrique",204,150,"77 kWh","2020+"),
        E("GTX 299","electrique",299,220,"77 kWh","2024+")
      ],
      "ID.4": [
        E("Pure 148","electrique",148,109,"52 kWh","2021+"),
        E("Pro 174","electrique",174,128,"77 kWh","2021+"),
        E("Pro S 204","electrique",204,150,"77 kWh","2021+"),
        E("GTX 299","electrique",299,220,"77 kWh","2021+")
      ]
    },
    "BMW": {
      "Série 3": [
        E("318i 156","essence",156,115,"B48","2019+"),
        E("320i 184","essence",184,135,"B48","2019+"),
        E("330i 258","essence",258,190,"B48","2019+"),
        E("318d 150","diesel",150,110,"B47","2020+",["Chaîne distribution (usure)","AdBlue"]),
        E("320d 190","diesel",190,140,"B47","2019+",["Chaîne distribution","AdBlue","FAP"]),
        E("330d 286","diesel",286,210,"B57","2020+"),
        E("330e 292","hybride",292,215,"B48 PHEV","2019+")
      ],
      "X1": [
        E("sDrive18i 136","essence",136,100,"B38","2015-2022",["Chaîne distribution"]),
        E("sDrive20i 178","essence",178,131,"B48","2022+"),
        E("xDrive18d 150","diesel",150,110,"B47","2015+",["Chaîne distribution"]),
        E("xDrive20d 190","diesel",190,140,"B47","2015+",["Chaîne","AdBlue"]),
        E("xDrive25e 220","hybride",220,162,"B38 PHEV","2020+")
      ]
    },
    "Mercedes-Benz": {
      "Classe A": [
        E("A180 136","essence",136,100,"M282","2018+"),
        E("A200 163","essence",163,120,"M282","2018+"),
        E("A250 224","essence",224,165,"M260","2018+"),
        E("A180d 116","diesel",116,85,"OM608","2018+",["AdBlue","FAP"]),
        E("A200d 150","diesel",150,110,"OM608","2018+",["AdBlue"]),
        E("A250e 218","hybride",218,160,"M282 PHEV","2020+")
      ],
      "Classe C": [
        E("C180 156","essence",156,115,"M264","2019+"),
        E("C200 184","essence",184,135,"M264","2018+"),
        E("C200 204","essence",204,150,"M254","2021+"),
        E("C220d 194","diesel",194,143,"OM654","2018+",["AdBlue","FAP"]),
        E("C220d 200","diesel",200,147,"OM654M","2021+",["AdBlue"]),
        E("C300e 312","hybride",312,230,"M254 PHEV","2022+")
      ]
    },
    "Audi": {
      "A3": [
        E("30 TFSI 110","essence",110,81,"DLA","2020+"),
        E("35 TFSI 150","essence",150,110,"DPCA","2020+",["GPF"]),
        E("30 TDI 116","diesel",116,85,"DSUD","2020+",["AdBlue"]),
        E("35 TDI 150","diesel",150,110,"DTUA","2020+",["AdBlue"]),
        E("40 TFSIe 204","hybride",204,150,"DGEA PHEV","2020+")
      ],
      "Q3": [
        E("35 TFSI 150","essence",150,110,"DPCA","2018+"),
        E("40 TFSI 190","essence",190,140,"DNVA","2018+"),
        E("35 TDI 150","diesel",150,110,"DTUA","2018+"),
        E("45 TFSIe 245","hybride",245,180,"DGEA PHEV","2021+")
      ]
    },
    "Opel": {
      "Corsa": [
        E("1.2 75","essence",75,55,"EB2F","2019+"),
        E("1.2 100","essence",100,74,"EB2AD","2019+",["Courroie humide"]),
        E("1.2 130","essence",130,96,"EB2ADT","2019+",["Courroie humide"]),
        E("1.5 diesel 100","diesel",100,75,"DV5RD","2019+",["Courroie 7mm→8mm"]),
        E("e-Corsa 136","electrique",136,100,"ZK01","2019-2023"),
        E("e-Corsa 156","electrique",156,115,"ZK02","2023+")
      ],
      "Mokka": [
        E("1.2 100","essence",100,74,"EB2AD","2020+"),
        E("1.2 130","essence",130,96,"EB2ADT","2020+"),
        E("1.5 diesel 110","diesel",110,81,"DV5RC","2020+",["Courroie 7mm→8mm"]),
        E("e-Mokka 136","electrique",136,100,"ZK01","2020+"),
        E("e-Mokka 156","electrique",156,115,"ZK02","2023+")
      ],
      "Grandland": [
        E("1.2 130","essence",130,96,"EB2ADT","2018+"),
        E("1.5 diesel 130","diesel",130,96,"DV5RC","2018+",["Courroie 7mm→8mm","FAP"]),
        E("Hybrid 225","hybride",225,165,"EP6 PHEV","2021+"),
        E("Hybrid4 300","hybride",300,221,"EP6 PHEV","2021+")
      ]
    },
    "Ford": {
      "Fiesta": [
        E("1.1 75","essence",75,55,"Ti-VCT","2017+"),
        E("1.0 EcoBoost 95","essence",95,70,"M1JA","2017+",["Courroie humide","Circuit refroidissement"]),
        E("1.0 EcoBoost 125","essence",125,92,"M1JA","2017+",["Courroie humide","Pompe à eau"]),
        E("1.0 EcoBoost 140","essence",140,103,"M1JA mHEV","2020+"),
        E("1.5 TDCi 85","diesel",85,63,"XVJA","2017-2019",["FAP"])
      ],
      "Focus": [
        E("1.0 EcoBoost 100","essence",100,74,"M1JD","2018+",["Courroie humide"]),
        E("1.0 EcoBoost 125","essence",125,92,"M1JD","2018+",["Courroie humide","Refroidissement"]),
        E("1.0 EcoBoost 155","essence",155,114,"M1JD mHEV","2020+"),
        E("1.5 EcoBlue 95","diesel",95,70,"XWDB","2018+",["AdBlue","FAP"]),
        E("1.5 EcoBlue 120","diesel",120,88,"XWDB","2018+",["AdBlue"]),
        E("2.3 EcoBoost 280 ST","essence",280,206,"L3X","2019+")
      ],
      "Puma": [
        E("1.0 EcoBoost 95","essence",95,70,"M1JA","2019+"),
        E("1.0 EcoBoost 125","essence",125,92,"M1JA mHEV","2019+"),
        E("1.0 EcoBoost 155","essence",155,114,"M1JA mHEV","2019+"),
        E("1.5 EcoBlue 120","diesel",120,88,"XWDB","2020+",["AdBlue"])
      ],
      "Kuga": [
        E("1.5 EcoBoost 120","essence",120,88,"M1JC","2019+"),
        E("2.0 EcoBlue 150","diesel",150,110,"XWDC","2019+",["AdBlue","FAP"]),
        E("2.0 EcoBlue 190","diesel",190,140,"XWDC","2019+"),
        E("2.5 FHEV 190","hybride",190,140,"Duratec HEV","2020+"),
        E("2.5 PHEV 225","hybride",225,165,"Duratec PHEV","2020+")
      ]
    },
    "Toyota": {
      "Yaris": [
        E("1.5 VVT-i 125","essence",125,92,"M15A","2020+"),
        E("Hybrid 116","hybride",116,85,"M15A HEV","2020+"),
        E("Hybrid 130","hybride",130,96,"M15A HEV","2023+")
      ],
      "Yaris Cross": [
        E("Hybrid 116","hybride",116,85,"M15A HEV","2021+"),
        E("Hybrid 130 AWD-i","hybride",130,96,"M15A HEV","2023+")
      ],
      "Corolla": [
        E("Hybrid 140","hybride",140,103,"M20A HEV","2019+"),
        E("Hybrid 196","hybride",196,144,"M20A HEV","2023+")
      ],
      "C-HR": [
        E("Hybrid 140","hybride",140,103,"M20A HEV","2023+"),
        E("Hybrid 198","hybride",198,146,"M20A HEV","2023+")
      ],
      "RAV4": [
        E("2.5 Hybrid 218","hybride",218,160,"A25A HEV","2019+"),
        E("2.5 Hybrid 222 AWD-i","hybride",222,163,"A25A HEV","2019+"),
        E("2.5 PHEV 306","hybride",306,225,"A25A PHEV","2021+")
      ]
    },
    "Nissan": {
      "Micra": [
        E("1.0 71","essence",71,52,"BR10","2017+"),
        E("1.0 IG-T 92","essence",92,68,"HRA0","2019+"),
        E("1.0 IG-T 110","essence",110,81,"HRA0","2021+"),
        E("1.5 dCi 90","diesel",90,66,"K9K","2017-2020",["EGR","FAP"])
      ],
      "Juke": [
        E("1.0 DIG-T 114","essence",114,84,"HR10","2019+"),
        E("1.3 DIG-T 140","essence",140,103,"HR13","2019-2021"),
        E("1.6 DIG-T 190","essence",190,140,"MR16","2014-2019",["Chaîne distribution"]),
        E("1.5 dCi 110","diesel",110,81,"K9K","2014-2019",["EGR","Injecteurs"])
      ],
      "Qashqai": [
        E("1.3 DIG-T 140","essence",140,103,"HR13","2018-2021"),
        E("1.3 DIG-T 158 mild-hybrid","essence",158,116,"HR13 MHEV","2021+"),
        E("1.5 dCi 115","diesel",115,85,"K9K","2018-2021",["EGR","FAP"]),
        E("1.7 dCi 150","diesel",150,110,"R9N","2019-2021",["AdBlue"]),
        E("e-POWER 190","hybride",190,140,"KR15 e-POWER","2022+")
      ],
      "Leaf": [
        E("40 kWh 150","electrique",150,110,"EM57","2018+"),
        E("e+ 62 kWh 217","electrique",217,160,"EM57","2019+")
      ]
    },
    "Hyundai": {
      "i20": [
        E("1.2 MPI 79","essence",79,58,"DPi","2020+"),
        E("1.0 T-GDI 100","essence",100,74,"Kappa T-GDI","2020+"),
        E("1.0 T-GDI 120 48V","hybride",120,88,"Kappa MHEV","2020+")
      ],
      "Tucson": [
        E("1.6 T-GDI 150","essence",150,110,"Smartstream G1.6","2020+"),
        E("1.6 T-GDI 180 48V","hybride",180,132,"Smartstream MHEV","2020+"),
        E("1.6 CRDi 115","diesel",115,85,"Smartstream D1.6","2020+",["AdBlue","FAP"]),
        E("1.6 CRDi 136 48V","diesel",136,100,"Smartstream MHEV","2020+",["AdBlue"]),
        E("HEV 230","hybride",230,169,"Smartstream HEV","2021+"),
        E("PHEV 265","hybride",265,195,"Smartstream PHEV","2021+")
      ],
      "Kona": [
        E("1.0 T-GDI 120","essence",120,88,"Kappa T-GDI","2020+"),
        E("1.6 T-GDI 198","essence",198,146,"Gamma T-GDI","2023+"),
        E("Electric 136","electrique",136,100,"39 kWh","2018-2023"),
        E("Electric 204","electrique",204,150,"64 kWh","2018-2023"),
        E("Electric 218","electrique",218,160,"65 kWh","2023+")
      ]
    },
    "Kia": {
      "Ceed": [
        E("1.0 T-GDI 120","essence",120,88,"Kappa T-GDI","2018+"),
        E("1.5 T-GDI 160","essence",160,118,"Smartstream G1.5","2020+"),
        E("1.6 CRDi 115","diesel",115,85,"Smartstream D1.6","2018+",["AdBlue"]),
        E("1.6 CRDi 136","diesel",136,100,"Smartstream MHEV","2018+",["AdBlue","FAP"])
      ],
      "Sportage": [
        E("1.6 T-GDI 150","essence",150,110,"Smartstream G1.6","2021+"),
        E("1.6 T-GDI 180 48V","hybride",180,132,"Smartstream MHEV","2021+"),
        E("1.6 CRDi 136 48V","diesel",136,100,"Smartstream MHEV","2021+",["AdBlue"]),
        E("HEV 230","hybride",230,169,"Smartstream HEV","2021+"),
        E("PHEV 265","hybride",265,195,"Smartstream PHEV","2021+")
      ],
      "EV6": [
        E("Standard Range 170","electrique",170,125,"58 kWh","2021+"),
        E("Long Range 229","electrique",229,168,"77 kWh","2021+"),
        E("GT 585","electrique",585,430,"77 kWh","2022+")
      ]
    },
    "Tesla": {
      "Model 3": [
        E("Propulsion 283","electrique",283,208,"LFP 60 kWh","2021+"),
        E("Grande Autonomie 498","electrique",498,366,"NMC 82 kWh","2019+"),
        E("Performance 513","electrique",513,377,"NMC 82 kWh","2019+")
      ],
      "Model Y": [
        E("Propulsion 299","electrique",299,220,"LFP 60 kWh","2021+"),
        E("Grande Autonomie 514","electrique",514,378,"NMC 80 kWh","2021+"),
        E("Performance 514","electrique",514,378,"NMC 80 kWh","2021+")
      ]
    }
  },

  // ===== CAMPAGNES DE RAPPEL & BULLETINS TECHNIQUES =====
  campaigns: [
    { id:"C001", brands:["Peugeot","Citroën","DS","Opel"], models:["208","2008","308","3008","5008","508","C3","C4","C5 Aircross","Berlingo","Corsa","Mokka","Grandland"], engines:["1.5 BlueHDi"], years:"2017-2022", title:"Courroie de distribution 7mm → 8mm", action:"Remplacement courroie 8mm renforcée + galets + pompe à eau (note technique DV5)", severity:"critique" },
    { id:"C002", brands:["Peugeot","Citroën","DS","Opel"], models:["208","2008","308","3008","5008","508","C3","C4","C5 Aircross","Berlingo"], engines:["1.5 BlueHDi","2.0 BlueHDi"], years:"2017-2021", title:"Régénérations FAP excessives", action:"Mise à jour logiciel calculateur moteur (optimisation stratégie régénération) + contrôle dilution huile", severity:"important" },
    { id:"C003", brands:["Peugeot","Citroën","DS","Opel"], models:["208","2008","308","3008","5008","C3","C4","C5 Aircross"], engines:["1.2 PureTech"], years:"2013-2023", title:"Courroie de distribution humide (bain d'huile)", action:"Contrôle courroie + remplacement si usure, extension de garantie jusqu'à 10 ans, MAJ logiciel dilution huile", severity:"critique" },
    { id:"C004", brands:["Renault","Dacia","Nissan","Mercedes-Benz"], models:["Clio","Captur","Megane","Kadjar","Duster","Sandero","Qashqai","Classe A"], engines:["1.5 dCi","1.5 Blue dCi"], years:"2010-2021", title:"Vanne EGR / injecteurs (K9K)", action:"Contrôle vanne EGR, injecteurs, faisceau; mise à jour logiciel", severity:"important" },
    { id:"C005", brands:["Renault"], models:["Megane","Kadjar","Scenic","Talisman"], engines:["1.2 TCe"], years:"2013-2019", title:"Consommation d'huile / chaîne distribution (H5F)", action:"Contrôle niveau huile, chaîne, remplacement si nécessaire", severity:"important" },
    { id:"C006", brands:["Volkswagen","Audi","Skoda","SEAT"], models:["Golf","Passat","Tiguan","A3","A4","Octavia","Leon"], engines:["2.0 TDI EA189"], years:"2009-2015", title:"Campagne NOx (dieselgate)", action:"Mise à jour logiciel calculateur + volet EGR", severity:"important" },
    { id:"C007", brands:["Volkswagen","Audi","Skoda","SEAT"], models:["Golf","Tiguan","A3","Octavia"], engines:["1.5 TSI"], years:"2017-2020", title:"Filtre à particules essence (GPF) / coupures cylindres", action:"MAJ logiciel gestion moteur", severity:"modéré" },
    { id:"C008", brands:["BMW"], models:["Série 1","Série 3","X1","X3"], engines:["2.0d N47","2.0d B47"], years:"2007-2018", title:"Chaîne de distribution (usure prématurée, côté boîte)", action:"Contrôle bruit/tension chaîne, remplacement préventif recommandé", severity:"critique" },
    { id:"C009", brands:["Ford"], models:["Fiesta","Focus","Puma","Kuga"], engines:["1.0 EcoBoost"], years:"2012-2019", title:"Circuit refroidissement / courroie humide", action:"Remplacement durites, pompe à eau, contrôle courroie", severity:"important" },
    { id:"C010", brands:["Toyota"], models:["RAV4","Corolla","Auris","Avensis"], engines:["2.2 D-4D"], years:"2005-2014", title:"Joint de culasse / injecteurs (136/138/150)", action:"Remplacement joint culasse, injecteurs, MAJ logiciel (extension garantie)", severity:"critique" },
    { id:"C011", brands:["Hyundai","Kia"], models:["Tucson","Sportage","Sorento","Santa Fe"], engines:["2.0 T-GDI","2.4 GDI (Theta II)"], years:"2011-2019", title:"Risque casse moteur (paliers vilebrequin)", action:"Contrôle + remplacement moteur si nécessaire (rappel constructeur)", severity:"critique" },
    { id:"C012", brands:["Tesla"], models:["Model 3","Model Y","Model S","Model X"], engines:["Toutes"], years:"2016-2021", title:"Mémoire eMMC MCU usure prématurée", action:"Remplacement module MCU (extension garantie 8 ans)", severity:"important" },
    { id:"C013", brands:["Peugeot","Citroën"], models:["3008","5008","308","C4","C5 Aircross"], engines:["1.6 BlueHDi","2.0 BlueHDi"], years:"2015-2019", title:"Système AdBlue (pompe/capteur)", action:"Contrôle pompe AdBlue, capteur NOx, MAJ logiciel", severity:"important" },
    { id:"C014", brands:["Nissan"], models:["Qashqai","X-Trail"], engines:["1.5 dCi","1.7 dCi"], years:"2018-2021", title:"Pompe haute pression / capteur pression rampe", action:"Contrôle et remplacement si défaut", severity:"important" }
  ],

  // ===== PANNES DÉTAILLÉES (avec TSB & rappels liés) =====
  faults: [
    { id:"F001", code:"P0010", title:"Distribution - Position arbre à cames", type:"mecanique", component:"Chaîne de distribution", brands:["ALL"], engines:["essence","diesel"],
      symptoms:["Voyant moteur allumé","Ratés à l'allumage","Perte de puissance","Bruit de claquement moteur","Calage moteur à chaud","Démarrage difficile"],
      causes:["Chaîne détendue","Tendeur défectueux","Guide de chaîne usé","Niveau d'huile insuffisant"],
      consequences:["Dommages soupapes","Dommages pistons","Casse moteur complète","Pollution accrue"],
      diagnostics:["Vérifier tension chaîne","Contrôler niveau huile","Lecture codes OBD","Test compression"],
      repairs:["Remplacement chaîne + tendeur + guides","Vidange + filtre"],
      tsb:["BMW N47/B47: contrôle préventif chaîne côté boîte","1.2 PureTech: contrôle courroie humide","1.6 THP: contrôle allongement chaîne"],
      severity:"critique", cost:"800-2500€" },
    { id:"F002", code:"P0300", title:"Ratés d'allumage aléatoires / multiples cylindres", type:"electronique", component:"Bougies d'allumage", brands:["ALL"], engines:["essence","flexfuel"],
      symptoms:["Voyant moteur clignotant","Vibrations","Perte de puissance","Ralenti instable","Consommation anormale"],
      causes:["Bougies usées","Bobines défectueuses","Injecteurs encrassés","Fuite de vide"],
      consequences:["Dommages catalyseur","Sondes Lambda HS","Pollution excessive"],
      diagnostics:["Lecture codes","Test bobines","Inspection bougies","Test compression"],
      repairs:["Remplacement bougies/bobines","Nettoyage injecteurs"],
      severity:"important", cost:"150-800€" },
    { id:"F003", code:"P0401", title:"Vanne EGR - Flux insuffisant", type:"electronique", component:"Vanne EGR", brands:["ALL"], engines:["diesel"],
      symptoms:["Voyant moteur","Claquements accélération","Perte puissance","Fumée noire","Ralenti instable"],
      causes:["Vanne encrassée","Conduits bouchés","Solénoïde HS","Capteur pression HS"],
      consequences:["Encrassement FAP","Dommages turbo","Pollution NOx"],
      diagnostics:["Lecture codes","Test vanne","Inspection conduits"],
      repairs:["Nettoyage/remplacement vanne EGR","Nettoyage conduits"],
      tsb:["1.5 dCi K9K: campagne contrôle EGR (C004)"],
      severity:"important", cost:"200-600€" },
    { id:"F005", code:"P0299", title:"Turbo - Pression de suralimentation insuffisante", type:"mecanique", component:"Turbo", brands:["ALL"], engines:["diesel","essence"],
      symptoms:["Voyant moteur","Perte puissance","Sifflement anormal","Fumée noire/bleue","Consommation huile"],
      causes:["Fuites suralimentation","Wastegate bloquée","Turbo endommagé","Électrovanne HS","Intercooler percé"],
      consequences:["Casse moteur possible","Consommation huile","Perte puissance permanente"],
      diagnostics:["Inspection conduites","Test wastegate","Test électrovanne","Test pression"],
      repairs:["Remplacement turbo","Réparation fuites","Remplacement intercooler"],
      severity:"critique", cost:"1000-3000€" },
    { id:"F006", code:"P2463", title:"FAP - Colmatage du filtre à particules", type:"mecanique", component:"Filtre à particules (FAP)", brands:["ALL"], engines:["diesel"],
      symptoms:["Voyant FAP","Perte puissance","Régénérations fréquentes","Consommation accrue"],
      causes:["Trajets courts","Régénérations incomplètes","Huile inadaptée","Injecteurs HS"],
      consequences:["Colmatage complet","Dommages turbo","Échec contrôle technique"],
      diagnostics:["Mesure pression différentielle","Test régénération","Contrôle injecteurs"],
      repairs:["Régénération forcée","Nettoyage/remplacement FAP"],
      tsb:["1.5/2.0 BlueHDi: MAJ logiciel régénérations (campagne C002)","Courroie 7→8mm si dilution huile (C001)"],
      severity:"important", cost:"400-2000€" },
    { id:"F007", code:"P0100", title:"Débitmètre d'air - Circuit défaillant", type:"electronique", component:"Débitmètre", brands:["ALL"], engines:["essence","diesel"],
      symptoms:["Voyant moteur","Ralenti instable","Perte puissance","Calage"],
      causes:["Débitmètre HS","Fuite d'air","Filtre à air encrassé","Connecteur oxydé"],
      consequences:["Mélange incorrect","Dommages catalyseur"],
      diagnostics:["Test débitmètre","Recherche fuites d'air"],
      repairs:["Remplacement/nettoyage débitmètre"],
      severity:"modéré", cost:"150-400€" },
    { id:"F008", code:"P0562", title:"Tension système batterie basse", type:"electrique", component:"Batterie 12V", brands:["ALL"], engines:["essence","diesel","hybride"],
      symptoms:["Voyant batterie","Démarrage difficile","Phares faibles","Perte mémoire calculateurs"],
      causes:["Batterie HS","Alternateur HS","Fuite de courant","Cosses oxydées"],
      consequences:["Panne électrique complète","Dommages calculateurs"],
      diagnostics:["Test batterie","Test alternateur","Recherche fuite"],
      repairs:["Remplacement batterie/alternateur"],
      severity:"important", cost:"100-500€" },
    { id:"F014", code:"P0A80", title:"Batterie haute tension - Remplacement requis", type:"electrique", component:"Batterie haute tension (véhicule électrique)", brands:["Tesla","Nissan","Renault","Toyota","Hyundai","Kia","Volkswagen"], engines:["electrique","hybride"],
      symptoms:["Voyant batterie HT","Autonomie réduite","Mode dégradé","Charge impossible"],
      causes:["Cellules défaillantes","Refroidissement HS","BMS HS","Vieillissement"],
      consequences:["Véhicule immobilisé","Charge impossible"],
      diagnostics:["Test équilibrage cellules","Test BMS","Mesure isolement"],
      repairs:["Remplacement batterie/modules","Réparation refroidissement"],
      tsb:["Tesla: contrôle dégradation batterie (garantie 8 ans)","Zoe/Nissan Leaf: contrôle SOH batterie"],
      severity:"critique", cost:"5000-20000€" },
    { id:"F017", code:"P0087", title:"Pression de rampe carburant trop basse", type:"mecanique", component:"Pompe à injection", brands:["ALL"], engines:["diesel"],
      symptoms:["Perte puissance sévère","Mode dégradé","Calage","Démarrage impossible"],
      causes:["Pompe HP HS","Régulateur HS","Filtre colmaté","Fuite circuit","Injecteurs fuient"],
      consequences:["Dommages injecteurs","Véhicule immobilisé"],
      diagnostics:["Mesure pression rampe","Test pompe HP","Test injecteurs"],
      repairs:["Remplacement pompe HP/régulateur/filtre"],
      severity:"critique", cost:"800-2500€" },
    { id:"F021", code:"TSB-DV5", title:"1.5 BlueHDi : courroie distribution 7mm → 8mm (modification constructeur)", type:"mecanique", component:"Courroie de distribution",
      brands:["Peugeot","Citroën","DS","Opel"], engines:["diesel"],
      engineRefs:["1.5 BlueHDi 100","1.5 BlueHDi 110","1.5 BlueHDi 130"],
      modelRefs:["208","2008","308","3008","5008","508","C3","C4","C5 Aircross","Berlingo","Corsa","Mokka","Grandland"],
      symptoms:["Usure anormale courroie au contrôle","Effilochage","Particules dans carter","Voyant si capteur pression huile"],
      causes:["Courroie 7mm d'origine sous-dimensionnée","Dilution huile par régénérations FAP"],
      consequences:["Rupture courroie = casse moteur","Colmatage crépine pompe à huile"],
      diagnostics:["Contrôle visuel courroie (largeur/effilochage)","Historique régénérations","Contrôle dilution huile"],
      repairs:["Remplacement courroie 8mm + galets + pompe à eau","Vidange + filtre huile"],
      tsb:["Note technique Stellantis DV5: montage courroie 8mm renforcée en remplacement de la 7mm","Intervalle de remplacement révisé selon usage"],
      recalls:["Campagne C001: remplacement courroie 8mm"],
      severity:"critique", cost:"600-900€" },
    { id:"F022", code:"TSB-FAP", title:"Régénérations FAP excessives : mise à jour logiciel calculateur requise", type:"electronique", component:"Filtre à particules (FAP)",
      brands:["Peugeot","Citroën","DS","Opel"], engines:["diesel"],
      engineRefs:["1.5 BlueHDi 130","1.6 BlueHDi 120","2.0 BlueHDi 150","2.0 BlueHDi 180"],
      modelRefs:["3008","5008","308","508","C5 Aircross","C4","Grandland"],
      symptoms:["Régénérations très fréquentes","Ventilateur actif après arrêt","Consommation élevée","Dilution huile (niveau monte)"],
      causes:["Stratégie régénération logiciel non optimisée","Usage urbain"],
      consequences:["Dilution huile → usure courroie/moteur","Colmatage FAP prématuré"],
      diagnostics:["Lecture fréquence régénérations à la valise","Contrôle niveau/dilution huile","Vérifier version logiciel calculateur"],
      repairs:["Mise à jour logiciel calculateur moteur (télémaintenance/concession)","Vidange si dilution > seuil"],
      tsb:["Campagne C002: MAJ logiciel optimisation régénérations","Contrôle dilution huile systématique"],
      severity:"important", cost:"0-150€ (MAJ)" },
    { id:"F023", code:"TSB-EB2", title:"1.2 PureTech : courroie humide (bain d'huile) - risque freinage", type:"mecanique", component:"Courroie de distribution",
      brands:["Peugeot","Citroën","DS","Opel"], engines:["essence"],
      engineRefs:["1.2 PureTech 82","1.2 PureTech 100","1.2 PureTech 110","1.2 PureTech 130"],
      modelRefs:["208","2008","308","3008","C3","C4","C5 Aircross","Corsa","Mokka"],
      symptoms:["Courroie effilochée/gonflée","Ralenti instable","Sifflement","Pédale frein dure (pompe à vide colmatée)"],
      causes:["Dégradation courroie dans l'huile","Vidanges espacées","Huile non conforme"],
      consequences:["Colmatage pompe à vide → assistance freinage dégradée","Rupture courroie = casse moteur"],
      diagnostics:["Contrôle visuel courroie","Contrôle pompe à vide","Historique vidanges"],
      repairs:["Remplacement courroie + filtre à huile spécifique","Vidanges rapprochées huile conforme"],
      tsb:["Extension de garantie courroie jusqu'à 10 ans selon campagnes","MAJ logiciel contrôle dilution"],
      recalls:["Campagne C003"],
      severity:"critique", cost:"500-900€" },
    { id:"F024", code:"TSB-N47", title:"BMW N47/B47 : chaîne distribution côté boîte - usure prématurée", type:"mecanique", component:"Chaîne de distribution",
      brands:["BMW"], engines:["diesel"],
      engineRefs:["318d 150","320d 190","xDrive18d 150","xDrive20d 190"],
      modelRefs:["Série 1","Série 3","X1","X3"],
      symptoms:["Claquement/grésillement arrière moteur","Voyant défaut","Démarrage difficile"],
      causes:["Tendeur chaîne fragile","Allongement chaîne"],
      consequences:["Rupture chaîne = casse moteur totale"],
      diagnostics:["Écoute bruit arrière moteur","Contrôle codes défauts position came"],
      repairs:["Remplacement kit chaîne complet (main d'œuvre importante: moteur déposé ou accès par boîte)"],
      tsb:["Remplacement préventif recommandé dès 120-150 000 km"],
      severity:"critique", cost:"1500-3000€" },
    { id:"F025", code:"TSB-EA189", title:"VW 2.0 TDI EA189 : campagne NOx (mise à jour logiciel)", type:"electronique", component:"Vanne EGR",
      brands:["Volkswagen","Audi","Skoda","SEAT"], engines:["diesel"],
      modelRefs:["Golf","Passat","Tiguan","A3","A4","Octavia","Leon"],
      symptoms:["Voyant après MAJ parfois","Consommation légèrement accrue (cas isolés)"],
      causes:["Logiciel d'origine non conforme NOx"],
      consequences:["Non-conformité pollution","CT défavorable"],
      diagnostics:["Vérifier statut campagne par VIN (concession)"],
      repairs:["Mise à jour logiciel + volet EGR (gratuit campagne)"],
      recalls:["Campagne C006"],
      severity:"important", cost:"0€ (rappel)" },
    { id:"F026", code:"TSB-D4D", title:"Toyota 2.2 D-4D : joint de culasse / injecteurs", type:"mecanique", component:"Joint de culasse",
      brands:["Toyota"], engines:["diesel"],
      modelRefs:["RAV4","Corolla","Auris","Avensis"],
      symptoms:["Fumée blanche","Perte liquide refroidissement","Claquements","Ratés"],
      causes:["Joint culasse fragile (136/138 ch)","Injecteurs défaillants"],
      consequences:["Surchauffe","Casse moteur"],
      diagnostics:["Test compression","Contrôle fuite culasse","Test injecteurs"],
      repairs:["Remplacement joint culasse + injecteurs + MAJ logiciel"],
      tsb:["Extension de garantie constructeur sur certains millésimes"],
      severity:"critique", cost:"1500-3500€" },
    { id:"F027", code:"TSB-THETA", title:"Hyundai/Kia Theta II : risque casse moteur (paliers)", type:"mecanique", component:"Bloc moteur",
      brands:["Hyundai","Kia"], engines:["essence"],
      modelRefs:["Tucson","Sportage","Sorento","Santa Fe"],
      symptoms:["Bruit rotatif bas moteur","Vibrations","Perte puissance"],
      causes:["Paliers vilebrequin mal lubrifiés"],
      consequences:["Serrage moteur","Risque incendie (cas rares)"],
      diagnostics:["Test KSDS (capteur vibration) en concession","Analyse bruit"],
      repairs:["Remplacement moteur complet si défaut (rappel)"],
      recalls:["Campagne C011"],
      severity:"critique", cost:"0-8000€ (rappel)" },
    { id:"F028", code:"TSB-MCU", title:"Tesla : usure mémoire eMMC du MCU", type:"electronique", component:"Écran tactile",
      brands:["Tesla"], engines:["electrique"],
      modelRefs:["Model 3","Model Y","Model S","Model X"],
      symptoms:["Écran lent/redémarre","Perte fonctions caméra/clim","Erreurs logicielles"],
      causes:["Usure cycles écriture eMMC"],
      consequences:["Perte affichage informations","Mises à jour impossibles"],
      diagnostics:["Lecture logs véhicule","Symptômes caractéristiques"],
      repairs:["Remplacement module MCU (garantie étendue 8 ans)"],
      recalls:["Campagne C012"],
      severity:"important", cost:"0-1500€" },
    { id:"F029", code:"P2002", title:"FAP - Efficacité sous seuil", type:"mecanique", component:"Filtre à particules (FAP)", brands:["Ford","Mazda","Peugeot","Citroën","Renault"], engines:["diesel"],
      symptoms:["Voyant moteur","Perte puissance","Fumée noire"],
      causes:["FAP endommagé","Capteur pression HS"],
      consequences:["Échec CT","Pollution"],
      diagnostics:["Mesure pression différentielle","Test capteur"],
      repairs:["Remplacement FAP/capteur"],
      severity:"important", cost:"600-1800€" },
    { id:"F030", code:"P0A0F", title:"Hybride : démarrage moteur thermique impossible", type:"electronique", component:"Calculateurs (ECU)", brands:["Toyota","Lexus","Honda","Renault"], engines:["hybride"],
      symptoms:["Voyant système hybride","Mode EV seul","Message alerte"],
      causes:["Calculateur HS","Bus CAN","Batterie 12V faible"],
      consequences:["Véhicule immobilisé"],
      diagnostics:["Lecture codes hybride","Test batterie 12V","Test CAN"],
      repairs:["Remplacement batterie 12V/calculateurs"],
      tsb:["Contrôle systématique batterie 12V avant intervention hybride"],
      severity:"critique", cost:"200-2500€" }
  ],

  obdCodes: {
    "P0001":"Régulateur volume carburant - circuit ouvert","P0010":"Position arbre à cames A - Banque 1",
    "P0011":"Arbre à cames A trop avancé","P0012":"Arbre à cames A trop retardé",
    "P0016":"Corrélation vilebrequin/arbre à cames","P0087":"Pression rampe carburant trop basse",
    "P0100":"Débitmètre d'air - circuit","P0101":"Débitmètre - plage/performance",
    "P0171":"Mélange trop pauvre Banque 1","P0172":"Mélange trop riche Banque 1",
    "P0201":"Injecteur cylindre 1 - circuit","P0234":"Turbo - survitesse","P0299":"Turbo pression insuffisante",
    "P0300":"Ratés aléatoires","P0301":"Ratés cylindre 1","P0302":"Ratés cylindre 2",
    "P0303":"Ratés cylindre 3","P0304":"Ratés cylindre 4","P0340":"Capteur arbre à cames A",
    "P0401":"EGR flux insuffisant","P0402":"EGR flux excessif","P0420":"Catalyseur efficacité Banque 1",
    "P0455":"Fuite EVAP importante","P0500":"Capteur vitesse véhicule","P0562":"Tension batterie basse",
    "P0657":"Tension alimentation calculateur","P0A0F":"Démarrage moteur impossible (hybride)",
    "P0A80":"Batterie HT - remplacement requis","P2002":"FAP efficacité sous seuil",
    "P2458":"Régénération FAP durée excessive","P2463":"FAP colmatage"
  }
};

function getAllBrands(){ return Object.keys(AUTO_DATA.brands).sort(); }
function getModelsByBrand(brand){ return (AUTO_DATA.brands[brand]||{}).models || []; }
function getEnginesByModel(brand,model){ return ((AUTO_DATA.enginesByModel[brand]||{})[model]) || []; }
function getComponentsByType(type){
  if(!type) return [...AUTO_DATA.components.mecanique,...AUTO_DATA.components.electrique,...AUTO_DATA.components.electronique];
  return AUTO_DATA.components[type]||[];
}
function getCampaigns(brand,model,engineName){
  return AUTO_DATA.campaigns.filter(c=>{
    const b = !brand || c.brands.includes(brand);
    const m = !model || c.models.includes(model);
    const e = !engineName || c.engines.some(x=>engineName.toLowerCase().includes(x.toLowerCase()));
    return b&&m&&e;
  });
}

if (typeof window !== 'undefined') {
  window.AUTO_DATA = AUTO_DATA;
  window.getAllBrands = getAllBrands;
  window.getModelsByBrand = getModelsByBrand;
  window.getEnginesByModel = getEnginesByModel;
  window.getComponentsByType = getComponentsByType;
  window.getCampaigns = getCampaigns;
}
