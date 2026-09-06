/**
 * Base de données des pannes automobiles
 * Organisée par marques, modèles, motorisations
 */

const AUTO_DATA = {
  brands: {
    // FRANÇAISES
    "Renault": { country: "FR", models: ["Clio", "Megane", "Captur", "Kadjar", "Koleos", "Talisman", "Scenic", "Kangoo", "Twingo", "Zoe", "Austral", "Arkana"], engines: ["essence", "diesel", "hybride", "electrique"] },
    "Peugeot": { country: "FR", models: ["208", "2008", "308", "3008", "5008", "508", "Rifter", "e-208", "e-2008"], engines: ["essence", "diesel", "hybride", "electrique"] },
    "Citroën": { country: "FR", models: ["C3", "C4", "C5 Aircross", "Berlingo", "Cactus", "ë-C4"], engines: ["essence", "diesel", "hybride", "electrique"] },
    "DS": { country: "FR", models: ["DS3", "DS4", "DS7"], engines: ["essence", "diesel", "hybride"] },
    "Alpine": { country: "FR", models: ["A110"], engines: ["essence"] },
    
    // EUROPÉENNES
    "Volkswagen": { country: "DE", models: ["Golf", "Polo", "Passat", "Tiguan", "Touareg", "T-Roc", "T-Cross", "ID.3", "ID.4", "ID.5"], engines: ["essence", "diesel", "hybride", "electrique"] },
    "BMW": { country: "DE", models: ["Série 1", "Série 3", "Série 5", "X1", "X3", "X5", "i3", "i4", "iX"], engines: ["essence", "diesel", "hybride", "electrique"] },
    "Mercedes-Benz": { country: "DE", models: ["Classe A", "Classe C", "Classe E", "GLA", "GLC", "GLE", "EQC", "EQA", "EQE"], engines: ["essence", "diesel", "hybride", "electrique"] },
    "Audi": { country: "DE", models: ["A1", "A3", "A4", "A6", "Q3", "Q5", "Q7", "e-tron", "Q4 e-tron"], engines: ["essence", "diesel", "hybride", "electrique"] },
    "Opel": { country: "DE", models: ["Corsa", "Astra", "Insignia", "Mokka", "Grandland", "Crossland"], engines: ["essence", "diesel", "hybride", "electrique"] },
    "Ford": { country: "EU/US", models: ["Fiesta", "Focus", "Kuga", "Puma", "Explorer", "Mustang Mach-E"], engines: ["essence", "diesel", "hybride", "electrique"] },
    "Fiat": { country: "IT", models: ["500", "Panda", "Tipo", "500e"], engines: ["essence", "hybride", "electrique"] },
    "Volvo": { country: "SE", models: ["XC40", "XC60", "XC90", "S60", "S90", "C40"], engines: ["essence", "diesel", "hybride", "electrique"] },
    "SEAT": { country: "ES", models: ["Ibiza", "Leon", "Arona", "Ateca", "Tarraco"], engines: ["essence", "diesel", "hybride"] },
    "Skoda": { country: "CZ", models: ["Fabia", "Octavia", "Superb", "Karoq", "Kodiaq", "Enyaq"], engines: ["essence", "diesel", "hybride", "electrique"] },
    "Porsche": { country: "DE", models: ["911", "Cayenne", "Macan", "Taycan", "Panamera"], engines: ["essence", "hybride", "electrique"] },
    
    // ASIATIQUES
    "Toyota": { country: "JP", models: ["Yaris", "Corolla", "Camry", "RAV4", "C-HR", "Prius", "Yaris Cross", "bZ4X"], engines: ["essence", "hybride", "electrique"] },
    "Honda": { country: "JP", models: ["Civic", "CR-V", "Jazz", "HR-V", "e"], engines: ["essence", "hybride", "electrique"] },
    "Nissan": { country: "JP", models: ["Micra", "Juke", "Qashqai", "X-Trail", "Leaf", "Ariya"], engines: ["essence", "diesel", "hybride", "electrique"] },
    "Mazda": { country: "JP", models: ["Mazda2", "Mazda3", "CX-3", "CX-5", "CX-30", "MX-30"], engines: ["essence", "diesel", "hybride", "electrique"] },
    "Mitsubishi": { country: "JP", models: ["Outlander", "ASX", "Eclipse Cross"], engines: ["essence", "diesel", "hybride"] },
    "Subaru": { country: "JP", models: ["Impreza", "Forester", "Outback", "XV"], engines: ["essence", "diesel", "hybride"] },
    "Lexus": { country: "JP", models: ["UX", "NX", "RX", "ES", "LS"], engines: ["essence", "hybride"] },
    "Hyundai": { country: "KR", models: ["i10", "i20", "i30", "Tucson", "Kona", "Ioniq 5", "Ioniq 6"], engines: ["essence", "diesel", "hybride", "electrique"] },
    "Kia": { country: "KR", models: ["Picanto", "Rio", "Ceed", "Sportage", "Stonic", "EV6", "Niro"], engines: ["essence", "diesel", "hybride", "electrique"] },
    "Suzuki": { country: "JP", models: ["Swift", "Vitara", "S-Cross", "Ignis"], engines: ["essence", "hybride"] },
    
    // CHINOISES
    "MG": { country: "CN", models: ["MG3", "MG4", "MG5", "ZS", "HS"], engines: ["essence", "electrique"] },
    "BYD": { country: "CN", models: ["Atto 3", "Dolphin", "Seal", "Han", "Tang"], engines: ["electrique", "hybride"] },
    "Aiways": { country: "CN", models: ["U5"], engines: ["electrique"] },
    "Lynk & Co": { country: "CN", models: ["01"], engines: ["hybride"] },
    "NIO": { country: "CN", models: ["ET7", "ES8"], engines: ["electrique"] },
    
    // AMÉRICAINES
    "Tesla": { country: "US", models: ["Model 3", "Model Y", "Model S", "Model X"], engines: ["electrique"] },
    "Jeep": { country: "US", models: ["Renegade", "Compass", "Cherokee", "Grand Cherokee", "Wrangler"], engines: ["essence", "diesel", "hybride"] },
    "Chevrolet": { country: "US", models: ["Camaro", "Corvette", "Equinox", "Tahoe"], engines: ["essence", "hybride"] },
    "Dodge": { country: "US", models: ["Challenger", "Charger", "Durango"], engines: ["essence"] },
    "Cadillac": { country: "US", models: ["Escalade", "XT4", "XT5", "Lyriq"], engines: ["essence", "hybride", "electrique"] },
    "Lincoln": { country: "US", models: ["Corsair", "Nautilus", "Aviator"], engines: ["essence", "hybride"] }
  },

  components: {
    mecanique: [
      "Courroie de distribution", "Chaîne de distribution", "Bielle", "Vilebrequin", "Piston", "Segment", "Soupape",
      "Joint de culasse", "Culasse", "Bloc moteur", "Injecteurs", "Pompe à injection", "Turbo", "Compresseur",
      "Filtre à particules (FAP)", "Vanne EGR", "Débitmètre", "Sonde Lambda", "Catalyseur", "Échappement",
      "Silencieux", "Embrayage", "Volant moteur", "Boîte de vitesses", "Différentiel", "Cardan", "Soufflet de cardan",
      "Roulement de roue", "Disque de frein", "Plaquette de frein", "Étrier de frein", "Maître-cylindre",
      "Flexible de frein", "Direction assistée", "Crémaillère", "Rotule de direction", "Triangle de suspension",
      "Amortisseur", "Ressort", "Barre stabilisatrice", "Silent bloc", "Pompe à eau", "Thermostat", "Radiateur",
      "Ventilateur", "Liquide de refroidissement", "Pompe à huile", "Filtre à huile", "Joint spi", "Segmentation"
    ],
    electrique: [
      "Batterie 12V", "Alternateur", "Démarreur", "Faisceau électrique", "Fusible", "Relais", "Bougies d'allumage",
      "Bobine d'allumage", "Câbles de bougie", "Capteur PMH", "Capteur de position arbre à cames",
      "Capteur de température", "Capteur de pression", "Capteur de pression turbo", "Sonde de température",
      "Moteur de ventilateur", "Moteur de lève-vitre", "Moteur d'essuie-glace", "Phares", "Feux arrière",
      "Feux de jour LED", "Éclairage intérieur", "Serrure électrique", "Centralisation", "Rétroviseurs électriques",
      "Sièges chauffants", "Lunette arrière chauffante", "Prise 12V", "Prise USB",
      "Batterie haute tension (véhicule électrique)", "Onduleur", "Convertisseur DC/DC",
      "Câbles haute tension", "Connecteurs haute tension"
    ],
    electronique: [
      "Calculateurs (ECU)", "Boîtier moteur (ECU)", "Boîtier ABS", "Boîtier ESP", "Boîtier airbag",
      "Boîtier climatisation", "Boîtier de servitude (BSI/BCM)", "Combiné d'instruments", "Écran tactile",
      "Système multimédia", "GPS / Navigation", "Caméra de recul", "Radars de stationnement", "Caméras ADAS",
      "Radar de régulateur adaptatif", "Capteur d'angle de braquage", "Capteur de pluie", "Capteur de luminosité",
      "Capteur de pression pneus (TPMS)", "Transpondeur clé", "Antenne démarreur", "Module Bluetooth",
      "Module WiFi", "Module 4G/5G", "Antenne GPS", "Capteur de couple", "Capteur de régime",
      "Capteur de pression FAP", "Capteur NOx", "Sonde de température échappement",
      "Transistor de puissance (véhicule électrique)", "BMS (Battery Management System)"
    ]
  },

  faults: [
    {
      id: "F001", code: "P0010", title: "Distribution - Position arbre à cames", type: "mecanique",
      component: "Chaîne de distribution", brands: ["ALL"], engines: ["essence", "diesel"],
      symptoms: ["Voyant moteur allumé", "Ratés à l'allumage", "Perte de puissance", "Bruit de claquement moteur", "Calage moteur à chaud", "Démarrage difficile"],
      causes: ["Chaîne de distribution détendue", "Tendeur de chaîne défectueux", "Guide de chaîne usé", "Pignon d'arbre à cames endommagé", "Niveau d'huile insuffisant"],
      consequences: ["Dommages aux soupapes", "Dommages aux pistons", "Casse moteur complète possible", "Consommation excessive", "Pollution accrue"],
      diagnostics: ["Vérifier la tension de la chaîne", "Contrôler le niveau d'huile", "Lire les codes défauts OBD", "Inspection visuelle du tendeur", "Test de compression"],
      repairs: ["Remplacement de la chaîne de distribution", "Remplacement du tendeur", "Remplacement des guides", "Vidange et remplacement du filtre à huile"],
      severity: "critique", cost: "800-2500€"
    },
    {
      id: "F002", code: "P0300", title: "Ratés d'allumage aléatoires/multiples cylindres", type: "electronique",
      component: "Bougies d'allumage", brands: ["ALL"], engines: ["essence", "flexfuel"],
      symptoms: ["Voyant moteur clignotant", "Vibrations moteur", "Perte de puissance", "Odeur d'essence à l'échappement", "Ralenti instable", "Consommation anormale"],
      causes: ["Bougies d'allumage usées", "Bobines d'allumage défectueuses", "Injecteurs encrassés", "Fuite de vide", "Capteur PMH défectueux", "Problème de compression"],
      consequences: ["Dommages au catalyseur", "Dommages aux sondes Lambda", "Surconsommation", "Pollution excessive", "Dommages potentiels aux pistons"],
      diagnostics: ["Lecture des codes défauts", "Test des bobines d'allumage", "Inspection des bougies", "Test de compression", "Vérification de l'étanchéité"],
      repairs: ["Remplacement des bougies", "Remplacement des bobines", "Nettoyage/remplacement des injecteurs", "Réparation des fuites de vide"],
      severity: "important", cost: "150-800€"
    },
    {
      id: "F003", code: "P0401", title: "Vanne EGR - Flux insuffisant", type: "electronique",
      component: "Vanne EGR", brands: ["ALL"], engines: ["diesel"],
      symptoms: ["Voyant moteur allumé", "Claquements à l'accélération", "Perte de puissance", "Fumée noire", "Ralenti instable", "Consommation accrue"],
      causes: ["Vanne EGR encrassée", "Conduits EGR bouchés", "Solénoïde EGR défectueux", "Capteur de pression EGR défaillant", "Filtre EGR colmaté"],
      consequences: ["Encrassement du FAP", "Dommages au turbo", "Pollution NOx élevée", "Consommation excessive", "Dommages au catalyseur"],
      diagnostics: ["Lecture des codes défauts", "Test de la vanne EGR", "Inspection des conduits", "Vérification du capteur de pression", "Test d'activation"],
      repairs: ["Nettoyage de la vanne EGR", "Remplacement de la vanne EGR", "Nettoyage des conduits", "Remplacement du filtre EGR"],
      severity: "important", cost: "200-600€"
    },
    {
      id: "F004", code: "P0420", title: "Catalyseur - Efficacité en dessous du seuil", type: "mecanique",
      component: "Catalyseur", brands: ["ALL"], engines: ["essence", "diesel"],
      symptoms: ["Voyant moteur allumé", "Odeur d'œuf pourri (soufre)", "Perte de puissance", "Consommation accrue", "Fumée anormale", "Bruit d'échappement"],
      causes: ["Catalyseur usé", "Sonde Lambda défectueuse", "Ratés d'allumage persistants", "Consommation d'huile excessive", "Contamination par silicium"],
      consequences: ["Échec au contrôle technique", "Pollution excessive", "Dommages au moteur", "Consommation élevée", "Blocage possible"],
      diagnostics: ["Lecture des codes défauts", "Test des sondes Lambda", "Mesure des gaz d'échappement", "Inspection visuelle", "Test de température"],
      repairs: ["Remplacement du catalyseur", "Remplacement des sondes Lambda", "Correction des ratés d'allumage", "Réparation des fuites d'huile"],
      severity: "important", cost: "500-1500€"
    },
    {
      id: "F005", code: "P0299", title: "Turbo - Pression de suralimentation insuffisante", type: "mecanique",
      component: "Turbo", brands: ["ALL"], engines: ["diesel", "essence"],
      symptoms: ["Voyant moteur allumé", "Perte de puissance notable", "Sifflement anormal", "Fumée noire ou bleue", "Consommation d'huile", "Temps de réponse lent"],
      causes: ["Fuite dans les conduites de suralimentation", "Wastegate bloquée", "Turbo endommagé", "Électrovanne de turbo défectueuse", "Filtre à air colmaté", "Intercooler percé"],
      consequences: ["Dommages moteur par surchauffe", "Consommation d'huile excessive", "Casse moteur possible", "Pollution importante", "Perte de puissance permanente"],
      diagnostics: ["Lecture des codes défauts", "Inspection visuelle des conduites", "Test du turbo", "Vérification du wastegate", "Test de pression"],
      repairs: ["Remplacement du turbo", "Réparation des fuites", "Remplacement de l'électrovanne", "Remplacement de l'intercooler"],
      severity: "critique", cost: "1000-3000€"
    },
    {
      id: "F006", code: "P2463", title: "FAP - Colmatage du filtre à particules", type: "mecanique",
      component: "Filtre à particules (FAP)", brands: ["ALL"], engines: ["diesel"],
      symptoms: ["Voyant FAP allumé", "Perte de puissance", "Consommation accrue", "Régénération fréquente", "Odeur de brûlé", "Fumée à l'échappement"],
      causes: ["Trajets urbains courts", "Régénérations incomplètes", "Huile inadaptée", "Injecteurs défectueux", "Capteur de pression FAP défaillant"],
      consequences: ["Colmatage complet du FAP", "Dommages au turbo", "Perte de puissance sévère", "Échec au contrôle technique", "Dommages moteur"],
      diagnostics: ["Lecture des codes défauts", "Mesure de la pression différentielle", "Vérification du taux de cendres", "Test de régénération", "Inspection visuelle"],
      repairs: ["Régénération forcée", "Nettoyage du FAP", "Remplacement du FAP", "Remplacement du capteur de pression"],
      severity: "important", cost: "400-2000€"
    },
    {
      id: "F007", code: "P0100", title: "Débitmètre d'air - Circuit défaillant", type: "electronique",
      component: "Débitmètre", brands: ["ALL"], engines: ["essence", "diesel"],
      symptoms: ["Voyant moteur allumé", "Ralenti instable", "Perte de puissance", "Calage moteur", "Accélération saccadée", "Consommation anormale"],
      causes: ["Débitmètre défectueux", "Fuite d'air après le débitmètre", "Filtre à air encrassé", "Connecteur oxydé", "Faisceau électrique endommagé"],
      consequences: ["Mélange air/carburant incorrect", "Dommages au catalyseur", "Consommation excessive", "Pollution accrue", "Dommages moteur à long terme"],
      diagnostics: ["Lecture des codes défauts", "Test du débitmètre", "Vérification des fuites d'air", "Inspection du filtre à air", "Test du faisceau"],
      repairs: ["Remplacement du débitmètre", "Nettoyage du débitmètre", "Réparation des fuites d'air", "Remplacement du filtre à air"],
      severity: "modéré", cost: "150-400€"
    },
    {
      id: "F008", code: "P0562", title: "Tension système batterie basse", type: "electrique",
      component: "Batterie 12V", brands: ["ALL"], engines: ["essence", "diesel", "hybride"],
      symptoms: ["Voyant batterie allumé", "Démarrage difficile", "Phares faibles", "Problèmes électriques divers", "Démarreur lent", "Perte de mémoire des calculateurs"],
      causes: ["Batterie en fin de vie", "Alternateur défectueux", "Fuite de courant", "Cosses oxydées", "Courroie d'alternateur usée"],
      consequences: ["Panne électrique complète", "Dommages aux calculateurs", "Impossibilité de démarrer", "Perte de données", "Dommages aux composants électroniques"],
      diagnostics: ["Test de la batterie", "Mesure de la tension", "Test de l'alternateur", "Recherche de fuite de courant", "Inspection des cosses"],
      repairs: ["Remplacement de la batterie", "Remplacement de l'alternateur", "Nettoyage des cosses", "Réparation de la fuite de courant"],
      severity: "important", cost: "100-500€"
    },
    {
      id: "F009", code: "P0234", title: "Turbo - Survitesse", type: "mecanique",
      component: "Turbo", brands: ["ALL"], engines: ["diesel", "essence"],
      symptoms: ["Voyant moteur allumé", "Sifflement très aigu", "Perte de puissance", "Fumée bleue", "Consommation d'huile importante", "Bruit anormal"],
      causes: ["Wastegate bloquée en position fermée", "Électrovanne de régulation défaillante", "Capteur de pression turbo défaillant", "Calculateur moteur défaillant", "Conduite de régulation percée"],
      consequences: ["Casse du turbo", "Dommages moteur par survitesse", "Projection de fragments métalliques", "Casse moteur complète possible", "Dommages aux autres composants"],
      diagnostics: ["Lecture des codes défauts", "Test de l'électrovanne", "Vérification du wastegate", "Test du capteur de pression", "Inspection visuelle"],
      repairs: ["Remplacement du turbo", "Remplacement de l'électrovanne", "Remplacement du capteur", "Réparation des conduites"],
      severity: "critique", cost: "1500-3500€"
    },
    {
      id: "F010", code: "P0171", title: "Mélange trop pauvre (banque 1)", type: "electronique",
      component: "Injecteurs", brands: ["ALL"], engines: ["essence", "flexfuel"],
      symptoms: ["Voyant moteur allumé", "Ralenti instable", "Perte de puissance", "Calage moteur", "Difficulté de démarrage", "Claquements moteur"],
      causes: ["Fuite de vide", "Injecteurs bouchés", "Pompe à carburant faible", "Filtre à carburant colmaté", "Capteur MAF défaillant", "Sonde Lambda défaillante"],
      consequences: ["Surchauffe moteur", "Dommages aux soupapes", "Dommages aux pistons", "Consommation accrue", "Pollution élevée"],
      diagnostics: ["Lecture des codes défauts", "Test de pression carburant", "Recherche de fuites de vide", "Test des injecteurs", "Vérification du MAF"],
      repairs: ["Nettoyage/remplacement des injecteurs", "Remplacement de la pompe à carburant", "Réparation des fuites de vide", "Remplacement du filtre à carburant"],
      severity: "important", cost: "200-800€"
    },
    {
      id: "F011", code: "P0491", title: "Système d'injection d'air secondaire - Banque 1", type: "mecanique",
      component: "Pompe à air secondaire", brands: ["BMW", "Volkswagen", "Audi", "Mercedes-Benz"], engines: ["essence"],
      symptoms: ["Voyant moteur allumé", "Régime de ralenti instable à froid", "Bruit anormal au démarrage", "Émissions élevées à froid"],
      causes: ["Pompe à air secondaire défaillante", "Vannes de commutation défaillantes", "Conduits d'air bouchés", "Fusible grillé"],
      consequences: ["Émissions polluantes élevées", "Échec au contrôle technique", "Usure prématurée du catalyseur"],
      diagnostics: ["Lecture des codes défauts", "Test de la pompe à air", "Vérification des conduits", "Test des vannes"],
      repairs: ["Remplacement de la pompe à air", "Remplacement des vannes", "Nettoyage des conduits"],
      severity: "modéré", cost: "300-700€"
    },
    {
      id: "F012", code: "P1457", title: "FAP - Problème de système (Honda/Acura)", type: "mecanique",
      component: "Filtre à particules (FAP)", brands: ["Honda"], engines: ["diesel"],
      symptoms: ["Voyant moteur allumé", "Voyant FAP spécifique", "Perte de puissance", "Consommation accrue"],
      causes: ["FAP colmaté", "Capteur de pression différentielle défaillant", "Problème de régénération", "Injecteurs défaillants"],
      consequences: ["Colmatage complet", "Dommages au moteur", "Pollution excessive"],
      diagnostics: ["Lecture des codes défauts Honda", "Mesure de pression différentielle", "Test de régénération", "Inspection des injecteurs"],
      repairs: ["Régénération forcée", "Remplacement du FAP", "Remplacement du capteur"],
      severity: "important", cost: "500-1800€"
    },
    {
      id: "F013", code: "P0A0F", title: "Moteur - Impossible de démarrer (véhicule hybride)", type: "electronique",
      component: "Calculateurs (ECU)", brands: ["Toyota", "Lexus", "Honda"], engines: ["hybride"],
      symptoms: ["Voyant système hybride allumé", "Impossible de démarrer le moteur thermique", "Mode dégradé", "Message d'alerte au tableau de bord"],
      causes: ["Défaillance du calculateur moteur", "Problème de communication CAN", "Capteur de position moteur défaillant", "Batterie 12V faible"],
      consequences: ["Véhicule immobilisé", "Mode dégradé uniquement électrique", "Consommation élevée", "Dommages potentiels au système hybride"],
      diagnostics: ["Lecture des codes défauts hybride", "Test du système CAN", "Vérification de la batterie 12V", "Test des capteurs"],
      repairs: ["Remplacement du calculateur", "Réparation du faisceau CAN", "Remplacement des capteurs", "Remplacement de la batterie 12V"],
      severity: "critique", cost: "800-2500€"
    },
    {
      id: "F014", code: "P0A80", title: "Batterie haute tension - Remplacement requis", type: "electrique",
      component: "Batterie haute tension (véhicule électrique)", brands: ["Tesla", "Nissan", "Renault", "Toyota", "Hyundai", "Kia", "Volkswagen"], engines: ["electrique", "hybride"],
      symptoms: ["Voyant batterie haute tension", "Autonomie réduite drastiquement", "Mode dégradé", "Impossible de charger", "Message d'alerte"],
      causes: ["Cellules de batterie défaillantes", "Système de refroidissement défaillant", "BMS défaillant", "Vieillissement normal de la batterie", "Surchauffe répétée"],
      consequences: ["Véhicule immobilisé", "Autonomie très réduite", "Impossibilité de recharger", "Dommages aux autres composants électriques"],
      diagnostics: ["Lecture des codes défauts haute tension", "Test d'équilibrage des cellules", "Vérification du système de refroidissement", "Test du BMS", "Mesure de la résistance d'isolement"],
      repairs: ["Remplacement de la batterie haute tension", "Remplacement de modules défectueux", "Réparation du système de refroidissement", "Remplacement du BMS"],
      severity: "critique", cost: "5000-20000€"
    },
    {
      id: "F015", code: "P2002", title: "FAP - Efficacité en dessous du seuil", type: "mecanique",
      component: "Filtre à particules (FAP)", brands: ["Ford", "Mazda", "Peugeot", "Citroën"], engines: ["diesel"],
      symptoms: ["Voyant moteur allumé", "Perte de puissance", "Consommation accrue", "Fumée noire"],
      causes: ["FAP endommagé", "Régénérations inefficaces", "Utilisation inadaptée", "Capteur de pression défaillant"],
      consequences: ["Échec au contrôle technique", "Pollution excessive", "Dommages au turbo"],
      diagnostics: ["Lecture des codes défauts", "Mesure de pression différentielle", "Test de régénération", "Inspection visuelle"],
      repairs: ["Remplacement du FAP", "Nettoyage du FAP", "Remplacement du capteur"],
      severity: "important", cost: "600-1800€"
    },
    {
      id: "F016", code: "P2458", title: "Régénération FAP - Durée excessive", type: "mecanique",
      component: "Filtre à particules (FAP)", brands: ["ALL"], engines: ["diesel"],
      symptoms: ["Voyant FAP allumé", "Ventilateur tournant après arrêt moteur", "Odeur de brûlé", "Température élevée sous le véhicule", "Consommation de carburant élevée"],
      causes: ["FAP partiellement colmaté", "Injecteurs défaillants", "Capteur de température défaillant", "Problème de gestion de la régénération"],
      consequences: ["Risque d'incendie", "Dommages au FAP", "Consommation excessive", "Dommages aux composants environnants"],
      diagnostics: ["Lecture des codes défauts", "Test des injecteurs", "Vérification du capteur de température", "Test de régénération"],
      repairs: ["Remplacement du FAP", "Remplacement des injecteurs", "Remplacement du capteur"],
      severity: "critique", cost: "500-1500€"
    },
    {
      id: "F017", code: "P0087", title: "Pression de rampe carburant - Trop basse", type: "mecanique",
      component: "Pompe à injection", brands: ["ALL"], engines: ["diesel"],
      symptoms: ["Voyant moteur allumé", "Perte de puissance sévère", "Mode dégradé", "Calage moteur", "Démarrage impossible", "Fumée blanche"],
      causes: ["Pompe haute pression défaillante", "Régulateur de pression défaillant", "Filtre à carburant colmaté", "Fuite dans le circuit", "Injecteurs qui fuient"],
      consequences: ["Dommages aux injecteurs", "Dommages au moteur", "Véhicule immobilisé", "Surchauffe possible"],
      diagnostics: ["Lecture des codes défauts", "Mesure de la pression de rampe", "Test de la pompe haute pression", "Vérification du filtre", "Test des injecteurs"],
      repairs: ["Remplacement de la pompe haute pression", "Remplacement du régulateur", "Remplacement du filtre", "Réparation des fuites"],
      severity: "critique", cost: "800-2500€"
    },
    {
      id: "F018", code: "P0657", title: "Tension d'alimentation du calculateur - Anormale", type: "electrique",
      component: "Faisceau électrique", brands: ["ALL"], engines: ["essence", "diesel", "hybride"],
      symptoms: ["Voyant moteur allumé", "Problèmes électroniques divers", "Calculateurs qui se réinitialisent", "Démarrage difficile", "Perte de mémoire"],
      causes: ["Faisceau électrique endommagé", "Masse défectueuse", "Alternateur défaillant", "Connecteurs oxydés", "Relais défaillant"],
      consequences: ["Dommages aux calculateurs", "Panne électronique complète", "Perte de données", "Dysfonctionnements multiples"],
      diagnostics: ["Lecture des codes défauts", "Test de tension d'alimentation", "Vérification des masses", "Inspection du faisceau", "Test de l'alternateur"],
      repairs: ["Réparation du faisceau", "Remplacement des connecteurs", "Réparation des masses", "Remplacement de l'alternateur"],
      severity: "important", cost: "200-1000€"
    },
    {
      id: "F019", code: "P0500", title: "Capteur de vitesse du véhicule - Défaillant", type: "electronique",
      component: "Capteur de régime", brands: ["ALL"], engines: ["essence", "diesel"],
      symptoms: ["Voyant moteur allumé", "Compteur de vitesse inopérant", "Régulateur de vitesse inopérant", "Passages de rapports brutaux", "ABS/ESP désactivés"],
      causes: ["Capteur de vitesse défaillant", "Faisceau endommagé", "Connecteur oxydé", "Problème de boîte de vitesses"],
      consequences: ["ABS/ESP inopérants", "Régulateur inopérant", "Problèmes de boîte automatique", "Sécurité compromise"],
      diagnostics: ["Lecture des codes défauts", "Test du capteur", "Vérification du faisceau", "Test de la boîte de vitesses"],
      repairs: ["Remplacement du capteur", "Réparation du faisceau", "Nettoyage des connecteurs"],
      severity: "important", cost: "100-400€"
    },
    {
      id: "F020", code: "P0420", title: "Efficacité du catalyseur - Banque 1", type: "mecanique",
      component: "Catalyseur", brands: ["Toyota", "Honda", "Nissan"], engines: ["essence", "hybride"],
      symptoms: ["Voyant moteur allumé", "Odeur d'échappement forte", "Légère perte de puissance", "Consommation légèrement accrue"],
      causes: ["Catalyseur usé", "Utilisation de carburant inadapté", "Consommation d'huile", "Ratés d'allumage antérieurs"],
      consequences: ["Échec au contrôle technique", "Pollution accrue", "Consommation élevée"],
      diagnostics: ["Lecture des codes défauts", "Test des sondes Lambda", "Analyse des gaz d'échappement", "Test de température"],
      repairs: ["Remplacement du catalyseur", "Remplacement des sondes Lambda"],
      severity: "important", cost: "600-1500€"
    }
  ],

  obdCodes: {
    "P0001": "Circuit de commande du régulateur de volume carburant - Ouvert",
    "P0010": "Position arbre à cames A - Banque 1",
    "P0011": "Position arbre à cames A - Trop avancée",
    "P0012": "Position arbre à cames A - Trop retardée",
    "P0014": "Position arbre à cames B - Trop avancée",
    "P0016": "Corrélation vilebrequin/arbre à cames",
    "P0030": "Sonde Lambda - Chauffage Banque 1 Capteur 1",
    "P0087": "Pression de rampe carburant - Trop basse",
    "P0100": "Débitmètre d'air - Circuit",
    "P0101": "Débitmètre d'air - Plage/Performance",
    "P0102": "Débitmètre d'air - Signal bas",
    "P0103": "Débitmètre d'air - Signal haut",
    "P0171": "Mélange trop pauvre - Banque 1",
    "P0172": "Mélange trop riche - Banque 1",
    "P0174": "Mélange trop pauvre - Banque 2",
    "P0201": "Injecteur cylindre 1 - Circuit",
    "P0234": "Turbo - Survitesse",
    "P0299": "Turbo - Pression insuffisante",
    "P0300": "Ratés d'allumage aléatoires",
    "P0301": "Ratés d'allumage - Cylindre 1",
    "P0302": "Ratés d'allumage - Cylindre 2",
    "P0303": "Ratés d'allumage - Cylindre 3",
    "P0304": "Ratés d'allumage - Cylindre 4",
    "P0340": "Capteur position arbre à cames A",
    "P0401": "Vanne EGR - Flux insuffisant",
    "P0402": "Vanne EGR - Flux excessif",
    "P0420": "Efficacité catalyseur - Banque 1",
    "P0421": "Chauffage catalyseur - Banque 1",
    "P0455": "Fuite EVAP - Importante",
    "P0491": "Système injection air secondaire - Banque 1",
    "P0500": "Capteur vitesse véhicule",
    "P0562": "Tension système batterie - Basse",
    "P0657": "Tension alimentation calculateur",
    "P0A0F": "Moteur - Impossible de démarrer",
    "P0A80": "Batterie haute tension - Remplacement requis",
    "P1457": "FAP - Problème système (Honda)",
    "P2002": "FAP - Efficacité sous seuil",
    "P2458": "Régénération FAP - Durée excessive",
    "P2463": "FAP - Colmatage"
  }
};

function getAllBrands() {
  return Object.keys(AUTO_DATA.brands).sort();
}

function getModelsByBrand(brand) {
  if (!brand || !AUTO_DATA.brands[brand]) return [];
  return AUTO_DATA.brands[brand].models;
}

function getComponentsByType(type) {
  if (!type) {
    return [
      ...AUTO_DATA.components.mecanique,
      ...AUTO_DATA.components.electrique,
      ...AUTO_DATA.components.electronique
    ];
  }
  return AUTO_DATA.components[type] || [];
}

if (typeof window !== 'undefined') {
  window.AUTO_DATA = AUTO_DATA;
  window.getAllBrands = getAllBrands;
  window.getModelsByBrand = getModelsByBrand;
  window.getComponentsByType = getComponentsByType;
}
