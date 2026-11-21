# Crypto Amlyn 🔐

Application web de cryptographie classique, construite brique par brique au fil des séances de TP.
Tous les algorithmes sont codés à la main, sans bibliothèque de cryptographie.

## Brique 1
- **César** : chiffrer, déchiffrer (`C = (M + k) mod 26`), force brute sur les 25 clés
  (test du χ² sur la fréquence des lettres + mots français reconnus)
- **Substitution** : générer une clé de 26 lettres, chiffrer, déchiffrer
- **Transposition par colonnes** avec un mot-clé (dernière ligne complétée par des X)
- **Multi-couches** : déchiffrement d'un message chiffré en plusieurs couches, avec force brute
  sur la clé César en retirant toutes les couches

## Tests (exemples du sujet)
| Technique | Clé | Entrée | Sortie |
|---|---|---|---|
| César | 3 | BONJOUR | ERQMRXU |
| Substitution | QWERTYUIOPASDFGHJKLZXCVBNM | ATTAQUE | QZZQJXT |
| Transposition | PORTE | RENDEZVOUSAMIDI | ESIEVMRZANOIDUD |

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
