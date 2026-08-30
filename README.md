# GAMA Stock Manager — DEV

Environnement de développement de GAMA Stock Manager.

## Architecture modulaire

Le shell DEV ne contient plus de logique spécifique à chaque tuile. Les tuiles du menu sont centralisées dans `gama-module-registry.js`.

Pour ajouter un module :

1. créer le script du module ;
2. ajouter **une seule entrée** dans `MODULES` dans `gama-module-registry.js` avec `id`, `label`, `icon`, `description`, `roles`, `script` et `section`.
3. le registre charge automatiquement le script, attend que la section existe, puis crée la tuile dans `.moreGrid`.

Le registre n'affiche le statut `✓ n/n modules visibles` que lorsque les tuiles attendues existent réellement dans le dashboard. Cela sert de garde-fou avant toute validation utilisateur.

La production reste inchangée : ce dépôt est uniquement l'environnement DEV.
