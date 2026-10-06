#!/usr/bin/env python3
"""Bundle Sunmeadow and its models into one HTML file for a modern browser."""
from pathlib import Path
import base64,json,re,sys
root=Path(__file__).resolve().parent.parent
dist=root/'dist'
output=Path(sys.argv[1]) if len(sys.argv)>1 else root/'Sunmeadow.html'
modules=['bridge.js','game.js','help.js','motion.js','rules.js','wordbook.js','assets/three.module.js','assets/GLTFLoader.js','assets/DRACOLoader.js','assets/BufferGeometryUtils.js','assets/SkeletonUtils.js']
assets=['assets/pikachu-rigged.glb','assets/eevee.glb','assets/squirtle.glb','assets/caterpie.glb','assets/blastoise.glb','assets/draco/draco_wasm_wrapper.js','assets/draco/draco_decoder.wasm','assets/draco/draco_decoder.js']
def url(mime,raw):return 'data:'+mime+';base64,'+base64.b64encode(raw).decode()
imports={'three':url('text/javascript', (dist/'assets/three.module.js').read_bytes())}
for name in modules:
 if name=='assets/three.module.js':continue
 source=(dist/name).read_text()
 def fix(m):
  target=((dist/name).parent/m[3].split('?')[0]).resolve().relative_to(dist.resolve()).as_posix()
  return m[1]+m[2]+'sunmeadow/'+target+m[2]
 source=re.sub(r'''(from\s+|import\s+)(['"])(\./[^'"]+)\2''',fix,source)
 imports['sunmeadow/'+name]=url('text/javascript',source.encode())
packed={name:url('application/octet-stream',(dist/name).read_bytes()) for name in assets}
html=(dist/'index.html').read_text()
html=re.sub(r'<link rel="stylesheet"[^>]*>',lambda m:'<style>'+ (dist/'style.css').read_text()+'</style>',html)
html=re.sub(r'<link rel="icon"[^>]*>',lambda m:'<link rel="icon" href="'+url('image/svg+xml',(dist/'favicon.svg').read_bytes())+'">',html)
html=re.sub(r'<script type="importmap">.*?</script>',lambda m:'<script type="importmap">'+json.dumps({'imports':imports},separators=(',',':'))+'</script>',html,flags=re.S)
html=re.sub(r'<script type="module" src="(?:help|game)\.js[^>]*></script>','',html)
bootstrap='''<script type="module">
import * as THREE from 'three';
const assets=ASSETS;
THREE.DefaultLoadingManager.setURLModifier(url=>{
 if(/^(data:|blob:)/.test(url))return url;
 const clean=url.split('?')[0].replace(/\\\\/g,'/');
 const index=clean.indexOf('assets/');
 return index>=0?(assets[clean.slice(index)]||url):url;
});
try{await import('sunmeadow/help.js');await import('sunmeadow/game.js');}
catch(error){const loading=document.getElementById('loading');loading.style.display='flex';loading.textContent='The game could not start. Please open this HTML in a current Chrome or Edge browser.';console.error(error);}
</script>'''.replace('ASSETS',json.dumps(packed,separators=(',',':')))
html=html.replace('</body>',bootstrap+'</body>')
output.parent.mkdir(parents=True,exist_ok=True);output.write_text(html)
print(json.dumps({'file':str(output),'bytes':output.stat().st_size,'modules':len(imports),'embedded_assets':len(packed)}))
