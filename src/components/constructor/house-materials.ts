import * as THREE from 'three'

/** PBR maps are local CC0 assets; see public/textures/house/README.md. */
export function createHouseAssets(onTextureChange: () => void = () => {}) {
  const textures: THREE.Texture[] = []
  let disposed = false
  const manager = new THREE.LoadingManager(onTextureChange, onTextureChange, onTextureChange)
  const loader = new THREE.TextureLoader(manager)
  const load = (file: string, color = false) => {
    const texture = loader.load(`/constructor/materials/${file}`, () => {
      if (disposed) texture.dispose()
      else onTextureChange()
    })
    texture.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.anisotropy = 8
    textures.push(texture)
    return texture
  }
  const woodMaps = { map: load('pine-albedo.webp', true), normalMap: load('pine-normal.webp'), roughnessMap: load('pine-roughness.webp') }
  let seed = 1827
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 }
  const surface = (kind: 'insulation' | 'concrete' | 'felt') => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 256
    const context = canvas.getContext('2d')!
    const image = context.createImageData(256, 256)
    for (let i = 0; i < image.data.length; i += 4) {
      const value = (random() - .5) * 42
      image.data[i] = 226 + value; image.data[i + 1] = 222 + value; image.data[i + 2] = 213 + value; image.data[i + 3] = 255
    }
    context.putImageData(image, 0, 0)
    if (kind === 'insulation') for (let i = 0; i < 900; i++) {
      const x = random() * 256, y = random() * 256
      context.strokeStyle = 'rgba(115,97,58,.12)'
      context.beginPath(); context.moveTo(x, y); context.lineTo(x + random() * 15, y + random() * 5); context.stroke()
    }
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.anisotropy = 4
    textures.push(texture)
    return texture
  }
  const insulationTexture = surface('insulation')
  const concreteTexture = surface('concrete')
  const feltTexture = surface('felt')
  const timber = (color: string, normal = .28) => new THREE.MeshStandardMaterial({ color, ...woodMaps, roughness: .83, normalScale: new THREE.Vector2(normal, normal) })
  const materials = {
    frame: timber('#eadabd'),
    wood: timber('#d8b486', .42),
    woodLight: timber('#e4c79f', .36),
    woodDark: timber('#ddc5a1'),
    moss: new THREE.MeshStandardMaterial({ color: '#405848', roughness: .72, normalMap: woodMaps.normalMap, normalScale: new THREE.Vector2(.32, .32) }),
    planken: timber('#c7a079'),
    white: new THREE.MeshStandardMaterial({ color: '#efede7', roughness: .38 }),
    dark: new THREE.MeshStandardMaterial({ color: '#303b3b', roughness: .46, metalness: .35 }),
    steel: new THREE.MeshStandardMaterial({ color: '#303432', roughness: .46, metalness: .8 }),
    zinc: new THREE.MeshStandardMaterial({ color: '#b9bfbd', roughness: .32, metalness: .72 }),
    concrete: new THREE.MeshStandardMaterial({ color: '#bdbcb6', map: concreteTexture, roughness: .94, bumpMap: concreteTexture, bumpScale: .022 }),
    insulation: new THREE.MeshStandardMaterial({ color: '#c6b56c', map: insulationTexture, roughness: 1, bumpMap: insulationTexture, bumpScale: .035 }),
    membrane: new THREE.MeshStandardMaterial({ color: '#626668', roughness: .96 }),
    ondulin: new THREE.MeshStandardMaterial({ color: '#865447', roughness: .83, map: feltTexture, bumpMap: feltTexture, bumpScale: .015, side: THREE.DoubleSide }),
    metal: new THREE.MeshStandardMaterial({ color: '#495559', roughness: .34, metalness: .7, side: THREE.DoubleSide }),
    shingles: new THREE.MeshStandardMaterial({ color: '#545559', roughness: .97, map: feltTexture, bumpMap: feltTexture, bumpScale: .025, side: THREE.DoubleSide }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#aec6cb', roughness: .035, metalness: .12, envMapIntensity: 1.35, ior: 1.52, transmission: .32, thickness: .024, clearcoat: 1, clearcoatRoughness: .025, side: THREE.DoubleSide }),
    gasket: new THREE.MeshStandardMaterial({ color: '#252b2c', roughness: .86 }),
    curtain: new THREE.MeshStandardMaterial({ color: '#c7beb0', roughness: 1, side: THREE.DoubleSide }),
    interior: new THREE.MeshStandardMaterial({ color: '#232e2b', roughness: .95 }),
    ghost: new THREE.MeshStandardMaterial({ color: '#b8c5bd', transparent: true, opacity: .08, depthWrite: false, roughness: .8, side: THREE.DoubleSide }),
    measure: new THREE.LineBasicMaterial({ color: '#496858', transparent: true, opacity: .9, depthTest: false, depthWrite: false }),
  }
  return {
    materials,
    dispose() {
      disposed = true
      Object.values(materials).forEach((m) => m.dispose())
      textures.forEach((t) => t.dispose())
    },
  }
}
