import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { createHouseEnvironment } from './house-environment'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import type { ConstructorInput } from '@/lib/constructor/engine'
import { buildHouse, createHouseAssets } from './house-geometry'
import { HouseAssembly } from './house-assembly'
import { modelKey, stageForStep } from './house-model'
import type { StepId } from './visuals'

export type HouseViewer = {
  update: (input: ConstructorInput, step: StepId) => void
  reset: () => void
  rotate: (direction: number) => void
  zoom: (direction: number) => void
  replay: () => void
  dispose: () => void
}

export function createHouseViewer(host: HTMLDivElement, onFailure: () => void): HouseViewer {
  const scene = new THREE.Scene()
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
  const mobile = matchMedia('(max-width: 767px)').matches
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.45 : 1.8))
  renderer.setSize(Math.max(host.clientWidth, 1), Math.max(host.clientHeight, 1))
  renderer.setClearColor(0xffffff, 0)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = .88
  renderer.domElement.setAttribute('aria-hidden', 'true')
  renderer.domElement.style.width = '100%'
  renderer.domElement.style.height = '100%'
  renderer.domElement.style.touchAction = 'pan-y'
  host.appendChild(renderer.domElement)

  const camera = new THREE.PerspectiveCamera(34, 1, .1, 100)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = false
  controls.enablePan = false
  controls.rotateSpeed = .7
  controls.zoomSpeed = .7
  controls.minPolarAngle = .25
  controls.maxPolarAngle = Math.PI / 2 - .035
  controls.minDistance = 6
  controls.maxDistance = 33
  controls.touches = { ONE: mobile ? null as unknown as THREE.TOUCH : THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE }
  if (mobile) renderer.domElement.style.touchAction = 'pan-y'
  controls.target.set(0, 1.8, 0)

  let frameId = 0
  let disposed = false
  let inView = true
  let currentStage = 0
  let currentInput: ConstructorInput | null = null
  let currentKey = ''
  let animating = false

  const requestRender = () => {
    if (!disposed && inView && !document.hidden && !frameId) frameId = requestAnimationFrame(render)
  }
  const assets = createHouseAssets(requestRender)

  const environment = createHouseEnvironment(renderer)
  scene.environment = environment.texture
  scene.environmentIntensity = .8

  scene.add(new THREE.HemisphereLight('#ffffff', '#aeafa8', .5))
  const sun = new THREE.DirectionalLight('#fff4e3', 1.8)
  sun.position.set(-5, 15, 7)
  sun.castShadow = true
  sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048)
  Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 30 })
  sun.shadow.bias = -.00015
  sun.shadow.normalBias = .027
  sun.shadow.radius = 3
  scene.add(sun)
  const fill = new THREE.DirectionalLight('#e9f1ff', .65)
  fill.position.set(6, 5, -4)
  scene.add(fill)

  const groundGeometry = new THREE.PlaneGeometry(100, 100)
  const groundMaterial = new THREE.ShadowMaterial({ color: '#776e63', opacity: .18 })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -.03
  ground.receiveShadow = true
  scene.add(ground)

  const contactCanvas = document.createElement('canvas')
  contactCanvas.width = contactCanvas.height = 128
  const context = contactCanvas.getContext('2d')!
  const gradient = context.createRadialGradient(64, 64, 15, 64, 64, 64)
  gradient.addColorStop(0, 'rgba(66,61,49,.17)')
  gradient.addColorStop(.6, 'rgba(66,61,49,.07)')
  gradient.addColorStop(1, 'rgba(66,61,49,0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, 128, 128)
  const contactTexture = new THREE.CanvasTexture(contactCanvas)
  const contactMaterial = new THREE.MeshBasicMaterial({ map: contactTexture, transparent: true, depthWrite: false })
  const contactGeometry = new THREE.PlaneGeometry(1, 1)
  const contact = new THREE.Mesh(contactGeometry, contactMaterial)
  contact.rotation.x = -Math.PI / 2
  contact.position.y = -.018
  scene.add(contact)

  const composer = new EffectComposer(renderer)
  if (!mobile) composer.renderTarget1.samples = composer.renderTarget2.samples = 4
  const renderPass = new RenderPass(scene, camera)
  const gtao = new GTAOPass(scene, camera, Math.max(host.clientWidth, 1), Math.max(host.clientHeight, 1))
  gtao.output = GTAOPass.OUTPUT.Default
  gtao.blendIntensity = .55
  const output = new OutputPass()
  composer.addPass(renderPass)
  composer.addPass(gtao)
  composer.addPass(output)

  let model = buildHouse(currentInput ?? ({ size: '6x6', foundation: 'screw', insulation: '100', roof: 'ondulin', facade: 'timber', terrace: true, distanceKm: 0 } satisfies ConstructorInput), assets)
  scene.add(model.root)
  contact.scale.set(model.width * 1.6, model.depth * 1.5, 1)
  let assembly = new HouseAssembly(model.parts)

  function updateDataset() {
    if (!currentInput) return
    host.dataset.size = currentInput.size
    host.dataset.foundation = currentInput.foundation
    host.dataset.insulation = currentInput.insulation
    host.dataset.roof = currentInput.roof
    host.dataset.facade = currentInput.facade
    host.dataset.terrace = String(currentInput.terrace)
    host.dataset.piles = String(model.pileCount)
    host.dataset.stage = String(currentStage)
  }

  function render(now: number) {
    frameId = 0
    if (disposed || !inView || document.hidden) return
    animating = assembly.update(now)
    host.dataset.assembling = String(animating)
    if (currentStage === 0) {
      model.dimensions.updateWorldMatrix(true, true)
      model.dimensions.children.forEach((node) => {
        if (!(node instanceof THREE.Sprite)) return
        const viewPosition = node.getWorldPosition(new THREE.Vector3()).applyMatrix4(camera.matrixWorldInverse)
        const unitsPerPixel = 2 * Math.abs(viewPosition.z) * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / Math.max(host.clientHeight, 1)
        node.scale.set(104 * unitsPerPixel, 26 * unitsPerPixel, 1)
        // Match the projected measurement line while keeping text legible during orbit.
        const origin = node.getWorldPosition(new THREE.Vector3())
        const end = origin.clone().add(node.userData.dimensionAxis === 'x' ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, 1)).project(camera)
        origin.project(camera)
        let angle = Math.atan2((end.y - origin.y) * host.clientHeight, (end.x - origin.x) * host.clientWidth)
        if (angle > Math.PI / 2) angle -= Math.PI
        if (angle < -Math.PI / 2) angle += Math.PI
        node.material.rotation = angle
      })
      renderer.render(scene, camera)
    }
    else composer.render()
    // Measurement graphics are screen annotations: keep them out of ambient occlusion.
    renderer.autoClear = false
    renderer.clearDepth()
    camera.layers.set(1)
    renderer.render(scene, camera)
    camera.layers.set(0)
    renderer.autoClear = true
    if (animating) requestRender()
  }

  function fitCamera(reset: boolean) {
    const width = Math.max(host.clientWidth, 1)
    const height = Math.max(host.clientHeight, 1)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height, false)
    composer.setSize(width, height)
    const extent = Math.max(model.width, model.depth)
    controls.minDistance = extent * .8
    controls.maxDistance = extent * 4.7
    controls.target.set(0, 2.15, 0)
    if (reset) {
      const direction = new THREE.Vector3(.55, .32, 1).normalize()
      const right = new THREE.Vector3().crossVectors(VERTICAL, direction).normalize()
      const up = new THREE.Vector3().crossVectors(direction, right).normalize()
      const tangent = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
      // Include the entrance steps and eaves, with breathing room on every viewport.
      const margin = 1.1
      let distance = 0
      for (const x of [-model.width / 2 - margin, model.width / 2 + margin]) {
        for (const y of [-.15, 5.15]) for (const z of [-model.depth / 2 - margin, model.depth / 2 + margin]) {
          const point = new THREE.Vector3(x, y, z).sub(controls.target)
          const near = point.dot(direction)
          distance = Math.max(distance, near + Math.abs(point.dot(right)) / (tangent * camera.aspect * .97), near + Math.abs(point.dot(up)) / (tangent * .96))
        }
      }
      camera.position.copy(controls.target).addScaledVector(direction, distance * .99)
    }
    controls.update()
    requestRender()
  }

  function setStage(stage: number, animated: boolean) {
    const stageChanged = stage !== currentStage
    currentStage = stage
    model.ghost.visible = stage === 0
    model.dimensions.visible = stage === 0
    assembly.setStage(stage, animated && !matchMedia('(prefers-reduced-motion: reduce)').matches, performance.now())
    animating = assembly.active
    updateDataset()
    if (stageChanged) fitCamera(true)
    requestRender()
  }

  function rebuild(input: ConstructorInput, previous: ConstructorInput | null) {
    const sizeChanged = previous?.size !== input.size
    scene.remove(model.root)
    model.dispose()
    model = buildHouse(input, assets)
    scene.add(model.root)
    contact.scale.set(model.width * 1.6, model.depth * 1.5, 1)
    assembly = new HouseAssembly(model.parts)
    setStage(currentStage, false)
    if (previous && !sizeChanged) {
      const changedStage = previous.foundation !== input.foundation ? 1
        : previous.insulation !== input.insulation ? 2
          : previous.roof !== input.roof ? 3
            : previous.facade !== input.facade ? 4
              : previous.terrace !== input.terrace ? 5 : -1
      if (changedStage >= 0 && changedStage <= currentStage) {
        model.parts.filter((part) => part.stage === changedStage).forEach((part) => { part.node.visible = false })
        setStage(currentStage, true)
      }
    }
    if (sizeChanged) fitCamera(true)
  }

  controls.addEventListener('change', requestRender)
  const resizeObserver = new ResizeObserver(() => fitCamera(true))
  resizeObserver.observe(host)
  const viewObserver = new IntersectionObserver(([entry]) => {
    inView = entry?.isIntersecting ?? true
    if (!inView && frameId) { cancelAnimationFrame(frameId); frameId = 0 }
    else requestRender()
  }, { rootMargin: '160px' })
  viewObserver.observe(host)
  const visibilityChanged = () => {
    if (document.hidden && frameId) { cancelAnimationFrame(frameId); frameId = 0 }
    else requestRender()
  }
  document.addEventListener('visibilitychange', visibilityChanged)
  const contextLost = (event: Event) => { event.preventDefault(); onFailure() }
  renderer.domElement.addEventListener('webglcontextlost', contextLost)
  fitCamera(true)
  setStage(0, false)

  return {
    update(input, step) {
      const key = modelKey(input)
      const previous = currentInput
      const stage = stageForStep(step)
      currentInput = input
      if (key !== currentKey) {
        rebuild(input, previous)
        currentKey = key
        if (stage !== currentStage) setStage(stage, Boolean(previous) && stage > currentStage)
        return
      }
      if (stage !== currentStage) setStage(stage, stage > currentStage)
    },
    reset() { fitCamera(true) },
    zoom(direction) {
      const offset = camera.position.clone().sub(controls.target)
      offset.multiplyScalar(direction > 0 ? .86 : 1.16)
      offset.setLength(THREE.MathUtils.clamp(offset.length(), controls.minDistance, controls.maxDistance))
      camera.position.copy(controls.target).add(offset)
      controls.update()
      requestRender()
    },
    rotate(direction) {
      const offset = camera.position.clone().sub(controls.target)
      offset.applyAxisAngle(VERTICAL, direction * .22)
      camera.position.copy(controls.target).add(offset)
      controls.update()
      requestRender()
    },
    replay() {
      assembly.finish(currentStage)
      model.parts.filter((part) => part.stage > 0 && part.stage <= currentStage).forEach((part) => { part.node.visible = false })
      setStage(currentStage, true)
    },
    dispose() {
      if (disposed) return
      disposed = true
      if (frameId) cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      viewObserver.disconnect()
      document.removeEventListener('visibilitychange', visibilityChanged)
      renderer.domElement.removeEventListener('webglcontextlost', contextLost)
      controls.removeEventListener('change', requestRender)
      controls.dispose()
      scene.remove(model.root)
      model.dispose()
      assets.dispose()
      environment.dispose()
      groundGeometry.dispose()
      groundMaterial.dispose()
      contactGeometry.dispose()
      contactMaterial.dispose()
      contactTexture.dispose()
      gtao.dispose()
      output.dispose()
      composer.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    },
  }
}

const VERTICAL = new THREE.Vector3(0, 1, 0)

