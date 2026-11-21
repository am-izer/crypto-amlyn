// Affichage : relie les boutons de la page aux fonctions de script.js

const $ = (id) => document.getElementById(id);

function afficher(id, texte, info = "") {
  $(id).textContent = texte;
  $(id).className = "resultat";
  $(id.replace("Resultat", "Info")).textContent = info;
}

function afficherErreur(id, message) {
  $(id).textContent = message;
  $(id).className = "resultat erreur";
  $(id.replace("Resultat", "Info")).textContent = "";
}

// Si le message est vide, on le dit au lieu d'afficher un résultat vide
function messageVide(idTexte, idResultat) {
  if (nettoyer($(idTexte).value) === "") {
    afficherErreur(idResultat, "Écris d'abord un message contenant au moins une lettre.");
    return true;
  }
  return false;
}


// ---------- Onglets ----------
document.querySelectorAll(".onglet").forEach((onglet) => {
  onglet.addEventListener("click", () => {
    document.querySelectorAll(".onglet, .panneau").forEach((el) => el.classList.remove("actif"));
    onglet.classList.add("actif");
    $(onglet.dataset.panneau).classList.add("actif");
  });
});


// ---------- Copier ----------
document.querySelectorAll(".copier").forEach((bouton) => {
  bouton.addEventListener("click", () => {
    const cible = $(bouton.dataset.cible);
    if (cible.classList.contains("vide") || cible.classList.contains("erreur")) return;
    navigator.clipboard.writeText(cible.textContent);
    bouton.textContent = "Copié";
    setTimeout(() => (bouton.textContent = "Copier"), 1500);
  });
});


// ---------- Roue de César ----------
// Anneau extérieur : alphabet clair. Anneau intérieur : alphabet chiffré, tourné de k lettres.
function dessinerRoue() {
  const svg = $("roue");
  const ns = "http://www.w3.org/2000/svg";
  const el = (nom, attributs) => {
    const e = document.createElementNS(ns, nom);
    for (const a in attributs) e.setAttribute(a, attributs[a]);
    return e;
  };

  svg.append(el("circle", { r: 108, class: "anneau-ext" }));
  svg.append(el("circle", { r: 82, class: "anneau-int" }));
  svg.append(el("circle", { r: 56, class: "centre" }));

  const ext = el("g", { class: "ext" });
  const int = el("g", { class: "int", id: "anneauInterieur" });
  for (let i = 0; i < 26; i++) {
    const angle = (i * 360) / 26;
    const lettreExt = el("text", { transform: `rotate(${angle}) translate(0 -95) rotate(${-angle})` });
    lettreExt.textContent = ALPHABET[i];
    ext.append(lettreExt);
    const lettreInt = el("text", { transform: `rotate(${angle}) translate(0 -69) rotate(${-angle})` });
    lettreInt.textContent = ALPHABET[i];
    int.append(lettreInt);
  }
  svg.append(ext, int);
  svg.append(el("path", { d: "M -5 -110 L 5 -110 L 0 -101 Z", class: "repere" }));

  const cle = el("text", { class: "cle-centre", id: "roueCle", y: 1 });
  svg.append(cle);
}

function tournerRoue(k) {
  // Sous le A extérieur doit apparaître la lettre chiffrée de A, donc on tourne de -k lettres
  $("anneauInterieur").style.transform = `rotate(${(-k * 360) / 26}deg)`;
  $("roueCle").textContent = k;
  $("cesarCleValeur").textContent = k;
  $("cesarCle").value = k;
}

dessinerRoue();
tournerRoue(3);


// ---------- César ----------
$("cesarCle").addEventListener("input", (e) => tournerRoue(+e.target.value));

$("cesarChiffrer").addEventListener("click", () => {
  if (messageVide("cesarTexte", "cesarResultat")) return;
  const k = +$("cesarCle").value;
  afficher("cesarResultat", cesarChiffrer($("cesarTexte").value, k), "Chiffré avec la clé " + k);
});

$("cesarDechiffrer").addEventListener("click", () => {
  if (messageVide("cesarTexte", "cesarResultat")) return;
  const k = +$("cesarCle").value;
  afficher("cesarResultat", cesarDechiffrer($("cesarTexte").value, k), "Déchiffré avec la clé " + k);
});

$("cesarBrute").addEventListener("click", () => {
  if (messageVide("cesarTexte", "cesarResultat")) return;
  const r = forceBrute($("cesarTexte").value);
  tournerRoue(r.cle);
  afficher("cesarResultat", r.message, "Clé trouvée : " + r.cle);
});


// ---------- Substitution ----------
function afficherBande() {
  const cle = $("subCle").value.toUpperCase();
  $("subBande").innerHTML = "";
  for (let i = 0; i < 26; i++) {
    const case_ = document.createElement("div");
    case_.innerHTML = `${ALPHABET[i]}<span>${cle[i] || "·"}</span>`;
    $("subBande").append(case_);
  }
}

function lancerSubstitution(chiffrer) {
  if (messageVide("subTexte", "subResultat")) return;
  try {
    const r = substitution($("subTexte").value, $("subCle").value, chiffrer);
    afficher("subResultat", r, chiffrer ? "Chiffré" : "Déchiffré");
  } catch (erreur) {
    afficherErreur("subResultat", erreur.message);
  }
}

$("subGenerer").addEventListener("click", () => {
  $("subCle").value = genererCle();
  afficherBande();
});
$("subCle").addEventListener("input", afficherBande);
$("subChiffrer").addEventListener("click", () => lancerSubstitution(true));
$("subDechiffrer").addEventListener("click", () => lancerSubstitution(false));

$("subCle").value = genererCle();
afficherBande();


// ---------- Transposition ----------
// Dessine la grille : le mot-clé en en-tête (avec son rang de lecture), le message en lignes
function afficherGrille(message, motCle) {
  const texte = nettoyer(message);
  const cle = motCle.trim().toUpperCase();
  const ordre = ordreColonnes(cle);
  const rang = [];
  ordre.forEach((col, i) => (rang[col] = i + 1));

  let html = "<table class='grille'><tr>";
  for (let c = 0; c < cle.length; c++) html += `<th>${cle[c]}<small>${rang[c]}</small></th>`;
  html += "</tr>";
  for (let i = 0; i < texte.length; i += cle.length) {
    html += "<tr>";
    for (let c = 0; c < cle.length; c++) html += `<td>${texte[i + c] || ""}</td>`;
    html += "</tr>";
  }
  $("trGrille").innerHTML = html + "</table>";
}

function cleValide() {
  if (!/^[A-Za-z]+$/.test($("trCle").value.trim())) {
    afficherErreur("trResultat", "Le mot-clé doit contenir uniquement des lettres, sans accents.");
    $("trGrille").innerHTML = "";
    return false;
  }
  return true;
}

$("trChiffrer").addEventListener("click", () => {
  if (messageVide("trTexte", "trResultat") || !cleValide()) return;
  const message = $("trTexte").value;
  afficher("trResultat", transpositionChiffrer(message, $("trCle").value), "Chiffré : lecture des colonnes dans l'ordre 1, 2, 3…");
  afficherGrille(message, $("trCle").value);
});

$("trDechiffrer").addEventListener("click", () => {
  if (messageVide("trTexte", "trResultat") || !cleValide()) return;
  const clair = transpositionDechiffrer($("trTexte").value, $("trCle").value);
  afficher("trResultat", clair, "Déchiffré");
  afficherGrille(clair, $("trCle").value);
});


// Résultats vides au départ
document.querySelectorAll(".resultat").forEach((r) => r.classList.add("vide"));
