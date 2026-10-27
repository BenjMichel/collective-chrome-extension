# Collective – Offres déjà vues

Extension Chrome qui signale les offres déjà consultées sur
[app.collective.work](https://app.collective.work/talent/jobs).

## Installation

1. Ouvrir `chrome://extensions`
2. Activer le **Mode développeur**
3. **Charger l'extension non empaquetée** → sélectionner ce dossier

## Fonctionnement

- Une offre est marquée **vue** dès qu'on l'ouvre (panneau latéral ou bouton
  « Voir l'offre » en nouvel onglet) : sa carte passe sur fond gris avec un
  badge **Déjà vu**.
- Au survol d'une carte, un bouton **Marquer vue** / **Marquer non vue**
  permet de changer son état sans l'ouvrir.
- Le panneau en bas de page affiche le nombre d'offres vues et permet de tout
  **Réinitialiser**.
- Les données restent en local (`chrome.storage.local`) et sont synchronisées
  entre les onglets ouverts.
