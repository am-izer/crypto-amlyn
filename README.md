# Crypto Amlyn 🔐

Application web de cryptographie classique, construite brique par brique au fil des séances de TP.
Tous les algorithmes sont codés à la main, sans bibliothèque de cryptographie.

## Brique 1
- **César** : chiffrer, déchiffrer, force brute (test du χ² sur la fréquence des lettres + mots français reconnus)
- **Substitution** : générer une clé, chiffrer, déchiffrer
- **Transposition par colonnes** avec un mot-clé

## Utilisation
Ouvrir `index.html` dans un navigateur, ou utiliser la version en ligne (GitHub Pages).

## Fichiers
| Fichier | Rôle |
|---|---|
| `script.js` | Logique des chiffrements |
| `interface.js` | Affichage (boutons, roue de César, grille) |
| `index.html` | Structure de la page |
| `style.css` | Mise en forme |

## Remarque
Seules les lettres A à Z sont chiffrées. Les accents, espaces et la ponctuation sont retirés
pour ne pas révéler la structure du message.
