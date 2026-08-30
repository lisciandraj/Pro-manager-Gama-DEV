# GAMA Stock Manager — DEV

## Architecture DEV simplifiée V12

Le DEV repose maintenant sur **3 fichiers de pilotage seulement** :

- `index.html` : shell DEV + iframe du cœur GAMA.
- `gama-dev-config.js` : registre unique des modules DEV.
- `gama-dev-shell.js` : unique chargeur et unique gestionnaire du menu.

### Ajouter un module

1. Ajouter le script du module dans `gama-dev-config.js`.
2. Ajouter une entrée dans `replaceTiles` uniquement si le module doit apparaître comme tuile personnalisée.
3. Le shell charge les scripts **une seule fois**, puis construit les tuiles.

### Principes

- Un seul loader.
- Un seul registre.
- Un seul `MutationObserver` de secours.
- Aucun script `setTimeout` concurrent pour le même module.
- Aucun script de remplacement TMS séparé.
- Les modules existants du cœur GAMA sont conservés.
- Les modules DEV sont indépendants les uns des autres.
- Pour retirer/remplacer un module, une seule entrée du registre est modifiée.

### Modules client actuels

- `Catálogo` → ouvre le catalogue client.
- `Solicitudes de clientes` → ouvre les demandes clients.
- Les deux remplacent les tuiles TMS sans toucher aux autres modules.

La production GAMA n'est pas modifiée par cette architecture DEV.
