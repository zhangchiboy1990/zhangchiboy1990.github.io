# Sunmeadow · Sunny Math Adventure

An English-first 3D learning game about collecting two boards and building a one-metre bridge.

## Play

Download `index.html` and open it in a current Chrome or Edge browser. The 3D models, scripts and Draco decoders are embedded in this single file. An internet connection is needed only for unsaved dictionary entries; speech depends on the browser's available English voices. Local music is selected on your own computer and is not uploaded or bundled.

Controls: WASD / arrow keys to move, click a monster to approach, E / Space for Claw, Q for Thunderbolt after level 2. The wood button opens the board tray. Choose two boards totalling at least 100 cm after defeating the guardian.

## Editable source

`source/dist/` contains the HTML, CSS, JavaScript and model assets. To run it locally:

```sh
cd source/dist
python -m http.server 8000
```

Open `http://localhost:8000`. To recreate the single-file HTML:

```sh
cd source
python scripts/export-single-html.py ../index.html
```

## Version 11

- Clearer length numbers and lowercase SI units `cm` and `m`.
- Alternating legs with opposite arm swing, plus a light bouncing step.
- Companion entrance jump and wave; animated Blastoise guardian.
- Separate board tray, half-centimetre loot lengths, ability points and simple enemy types.
- Clickable English words with pronunciation, English definitions and optional Chinese help.

## Credits

Three.js and its loaders are included with their source notices. Pokémon models were obtained from the Pokémon-3D-api/assets repository. The Eevee asset is credited in the game to seth the yutyrannus, CC BY 4.0, with its source link. Other character and model ownership remains with the respective creators and rights holders; no blanket licence for all Pokémon models is claimed. This is a personal educational prototype.

This folder was added to the existing repository; the repository homepage files are preserved.
