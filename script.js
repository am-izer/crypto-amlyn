const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Logique des chiffrements (l'affichage est dans interface.js)

// Garde uniquement les lettres A-Z : retire accents, espaces, ponctuation, chiffres
// "Ça va ?" -> "CAVA"
function nettoyer(texte) {
  return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "")  // é -> e, ç -> c
              .toUpperCase().replace(/[^A-Z]/g, "");
}


// ===================== CÉSAR =====================
// Décale chaque lettre de k positions (k négatif = déchiffrer)
function cesar(texte, k) {
  let resultat = "";
  for (let c of nettoyer(texte)) {
    let i = ALPHABET.indexOf(c);
    resultat += ALPHABET[((i + k) % 26 + 26) % 26];   // "+26" pour gérer k négatif
  }
  return resultat;
}

// Mots français courants : le vrai message en contient, les faux presque jamais
const MOTS_FRANCAIS = ["LES", "DES", "UNE", "EST", "QUE", "QUI", "POUR", "DANS",
  "AVEC", "PAS", "NOUS", "VOUS", "ELLE", "SONT", "MAIS", "TOUT", "PLUS", "CETTE",
  "BONJOUR", "DEMAIN", "MESSAGE", "SECRET", "MONDE", "SOIR", "VOIR", "FAIT",
  "LE", "LA", "DE", "ET", "EN", "UN", "IL", "JE", "TU", "ON", "SE", "NE", "AU", "OU", "CA", "VA"];

// Fréquence (%) de chaque lettre A..Z en français
const FREQUENCES = [7.6, 0.9, 3.3, 3.7, 14.7, 1.1, 0.9, 0.7, 7.5, 0.6, 0.1, 5.5, 3.0,
                    7.1, 5.8, 2.5, 1.4, 6.7, 8.0, 7.2, 6.3, 1.8, 0.1, 0.4, 0.1, 0.3];

// Test du χ² (khi-deux) : mesure l'écart entre les fréquences des lettres du texte
// et celles du français. Plus il est petit, plus le texte ressemble à du français.
//   χ² = Σ (observé - attendu)² / attendu
function khiDeux(texte) {
  let total = 0;
  for (let i = 0; i < 26; i++) {
    let attendu = texte.length * FREQUENCES[i] / 100;     // nb de fois où la lettre devrait apparaître
    let observe = texte.split(ALPHABET[i]).length - 1;    // nb de fois où elle apparaît vraiment
    total += (observe - attendu) ** 2 / attendu;
  }
  return total;
}

// Note un texte en combinant deux indices :
//  1. Statistique : on enlève le χ² (un texte proche du français perd peu de points)
//  2. Mots : bonus pour chaque mot français trouvé (un mot long rapporte plus)
function score(texte) {
  // On ignore le bourrage de la transposition : une même lettre répétée à la fin (XXX)
  texte = texte.replace(/(.)\1+$/, "");
  let points = -khiDeux(texte);
  for (let mot of MOTS_FRANCAIS) {
    let nb = texte.split(mot).length - 1;      // nombre d'apparitions du mot
    // Les mots de 2 lettres apparaissent souvent par hasard : bonus plus faible
    points += nb * (mot.length === 2 ? 20 : mot.length * mot.length * 10);
  }
  return points;
}

// Essaie les 25 clés (1 à 25) et garde seulement celle qui donne le meilleur score
function forceBrute(texteChiffre) {
  let meilleureCle = 1;
  let meilleurScore = -Infinity;
  for (let k = 1; k <= 25; k++) {
    let s = score(cesar(texteChiffre, -k));
    if (s > meilleurScore) {
      meilleurScore = s;
      meilleureCle = k;
    }
  }
  return { cle: meilleureCle, message: cesar(texteChiffre, -meilleureCle) };
}

function cesarChiffrer(texte, k)   { return cesar(texte, k); }
function cesarDechiffrer(texte, k) { return cesar(texte, -k); }


// ===================== SUBSTITUTION =====================
// Mélange l'alphabet au hasard pour faire une clé
function genererCle() {
  let lettres = ALPHABET.split("");
  for (let i = lettres.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [lettres[i], lettres[j]] = [lettres[j], lettres[i]];
  }
  return lettres.join("");
}

// Chiffrer : A -> cle[0], B -> cle[1]...  Déchiffrer : l'inverse
function substitution(texte, cle, chiffrer) {
  cle = cle.toUpperCase();
  if (cle.length !== 26 || new Set(cle).size !== 26) {
    throw new Error("La clé doit contenir les 26 lettres, chacune une seule fois.");
  }
  let source = chiffrer ? ALPHABET : cle;
  let cible  = chiffrer ? cle : ALPHABET;

  let resultat = "";
  for (let c of nettoyer(texte)) {
    resultat += cible[source.indexOf(c)];
  }
  return resultat;
}


// ===================== TRANSPOSITION =====================
// Ordre de lecture des colonnes : ordre alphabétique des lettres du mot-clé
// Exemple : "CLE" -> C, E, L -> colonnes [0, 2, 1]
function ordreColonnes(motCle) {
  let indices = [...Array(motCle.length).keys()];
  return indices.sort((a, b) => motCle[a].localeCompare(motCle[b]) || a - b);
}

// On écrit le message ligne par ligne (dernière ligne complétée par des X),
// puis on lit colonne par colonne
function transpositionChiffrer(texte, motCle) {
  motCle = motCle.trim().toUpperCase();
  texte = nettoyer(texte);
  let n = motCle.length;
  while (texte.length % n !== 0) texte += "X";   // bourrage
  let resultat = "";
  for (let col of ordreColonnes(motCle)) {
    for (let i = col; i < texte.length; i += n) {
      resultat += texte[i];
    }
  }
  return resultat;
}

function transpositionDechiffrer(texte, motCle) {
  motCle = motCle.trim().toUpperCase();
  texte = nettoyer(texte);   // un espace en trop décalerait toutes les lettres
  let n = motCle.length;
  let nbLignes = Math.ceil(texte.length / n);
  let reste = texte.length % n;   // nb de colonnes pleines si la dernière ligne est incomplète

  // Remplir les colonnes dans l'ordre de lecture
  let colonnes = [];
  let pos = 0;
  for (let col of ordreColonnes(motCle)) {
    let longueur = (reste === 0 || col < reste) ? nbLignes : nbLignes - 1;
    colonnes[col] = texte.slice(pos, pos + longueur);
    pos += longueur;
  }

  // Relire ligne par ligne
  let resultat = "";
  for (let ligne = 0; ligne < nbLignes; ligne++) {
    for (let col = 0; col < n; col++) {
      if (ligne < colonnes[col].length) resultat += colonnes[col][ligne];
    }
  }
  return resultat;
}


// ===================== DÉCHIFFREMENT EN PLUSIEURS COUCHES =====================
// couches : la liste des couches dans l'ORDRE DU CHIFFREMENT, par exemple
//   [{ type: "transposition", cle: "HOMARD" }, { type: "cesar" }, { type: "substitution", cle: "DGUR..." }]
// On les retire dans l'ordre inverse : la dernière appliquée est la première retirée.
function dechiffrerCouches(texte, couches, k) {
  for (let couche of [...couches].reverse()) {
    if (couche.type === "cesar")         texte = cesarDechiffrer(texte, k);
    if (couche.type === "substitution")  texte = substitution(texte, couche.cle, false);
    if (couche.type === "transposition") texte = transpositionDechiffrer(texte, couche.cle);
  }
  return texte;
}

// Clé César inconnue : pour chaque k de 1 à 25, on retire TOUTES les couches,
// puis on note le résultat. Renvoie les candidats du plus probable au moins probable.
function forceBruteCouches(texte, couches) {
  let candidats = [];
  for (let k = 1; k <= 25; k++) {
    let message = dechiffrerCouches(texte, couches, k);
    let s = score(message);
    // Si la transposition est la 1re couche appliquée, le vrai message finit par
    // les X de bourrage : bonus pour chaque X final (une mauvaise clé les change)
    if (couches[0].type === "transposition") {
      s += 10 * (message.length - message.replace(/X+$/, "").length);
    }
    candidats.push({ cle: k, message: message, score: s });
  }
  return candidats.sort((a, b) => b.score - a.score);
}
