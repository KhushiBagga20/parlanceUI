import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { clone } from 'three/addons/utils/SkeletonUtils.js'
import { canonicalBone, restValue } from './signQueue.js'
import { compileMotion, sampleMotionPose } from './poseMotion.js'
import { scheduleSigns } from './schedule.js'

let modelPromise
function loadModel() {
  modelPromise ??= new GLTFLoader().loadAsync('/assets/remy.glb').catch((error) => {
    modelPromise = undefined
    throw error
  })
  return modelPromise
}

export function createAvatar(mount, { interactive = true, onState = () => {}, onStatus = () => {} } = {}) {
  const runtime = { animations: [], segments: [], characters: [], pending: true }
  const bones = new Map()
  const euler = new THREE.Euler()
  const rotation = new THREE.Quaternion()
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(27, 1, 0.1, 100)
  const key = new THREE.DirectionalLight('#f8fbff', 2.5)
  const rim = new THREE.DirectionalLight('#9aafff', 1.75)
  key.position.set(3, 5, 4)
  rim.position.set(-3, 2, -2)
  scene.add(new THREE.HemisphereLight('#f7fbff', '#7b89aa', 2.0), key, rim)

  let renderer
  let observer
  let avatar
  let disposed = false
  let queue = []
  let index = 0
  let firstIndex = 0
  let poses = []
  let signEndTimes = []
  let poseIndex = 0
  let motionTime = 0
  let lastReported
  let playing = false
  let finished = false
  let frameRequest = 0
  let lastStepAt = 0
  let speed = 1
  let loop = false
  let suspended = false
  let drag

  function render() {
    if (!suspended) renderer?.render(scene, camera)
  }

  function resize() {
    const { clientWidth: width, clientHeight: height } = mount
    if (!renderer || !width || !height) return
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height, false)
    render()
  }

  function applyBone({ bone, rest, bindAxes, toBoneAxes, delta }) {
    euler.set(delta.x, delta.y, delta.z)
    // The sign tables use YBot's world-aligned bind axes. Express the same
    // rotation in Remy's bind axes before applying it to the local rest pose.
    rotation.setFromEuler(euler)
    bone.quaternion.copy(rest).multiply(toBoneAxes).multiply(rotation).multiply(bindAxes)
  }

  function resetPose() {
    for (const [name, record] of bones) {
      record.delta.x = restValue(name, 'x')
      record.delta.y = restValue(name, 'y')
      record.delta.z = restValue(name, 'z')
      applyBone(record)
    }
    render()
  }

  function report() {
    const current = index - firstIndex
    const signStart = signEndTimes[current - 1] ?? 0
    const signEnd = signEndTimes[current] ?? signStart
    const progress = signEnd > signStart ? Math.min((motionTime - signStart) / (signEnd - signStart), 1) : 0
    const progressStep = Math.floor(progress * 40)
    const previous = lastReported
    if (previous?.index === index && previous.progressStep === progressStep && previous.playing === playing && previous.finished === finished) return
    lastReported = { index, progressStep, playing, finished }
    onState({ index, progress, playing, finished, transitioning: false })
  }

  function delayFrame() {
    if (!frameRequest && !suspended && playing && avatar) frameRequest = requestAnimationFrame(animate)
  }

  function resetClock() {
    cancelAnimationFrame(frameRequest)
    frameRequest = 0
    lastStepAt = 0
  }

  function animate(now) {
    frameRequest = 0
    if (!playing || suspended || !avatar) return
    const elapsed = lastStepAt ? Math.min(now - lastStepAt, 100) : 0
    lastStepAt = now
    const endTime = poses.at(-1).endMs
    motionTime = Math.min(motionTime + elapsed * speed, endTime)

    const changed = new Set()
    const deltaFor = (name) => bones.get(name)?.delta
    while (poseIndex < poses.length) {
      const pose = poses[poseIndex]
      sampleMotionPose(pose, motionTime, deltaFor, changed)
      if (motionTime < pose.endMs) break
      poseIndex += 1
    }
    for (const name of changed) applyBone(bones.get(name))
    if (changed.size) render()

    while (index - firstIndex < signEndTimes.length - 1 && motionTime >= signEndTimes[index - firstIndex]) {
      index += 1
    }
    if (motionTime >= endTime) {
      if (loop) return restart()
      playing = false
      finished = true
    }
    report()
    delayFrame()
  }

  function step(startIndex) {
    index = Math.min(Math.max(startIndex, 0), Math.max(queue.length - 1, 0))
    resetClock()
    resetPose()
    finished = false
    playing = false
    scheduleSigns(queue.slice(index).map((item) => item.gloss), runtime)
    poses = compileMotion(runtime.animations)
    let frames = 0
    signEndTimes = runtime.segments.map((segment) => {
      frames += segment.frames
      return poses[frames - 1].endMs
    })
    firstIndex = index
    poseIndex = 0
    motionTime = 0
    report()
  }

  function play() {
    if (finished) return restart()
    if (!poses.length) return
    playing = true
    report()
    delayFrame()
  }

  function restart() {
    step(0)
    play()
  }

  function toggle() {
    if (!playing) return play()
    playing = false
    resetClock()
    report()
  }

  function setQueue(items) {
    queue = items
    restart()
  }

  function setOptions(options) {
    speed = options.speed
    loop = options.loop
    if (options.suspended !== suspended) {
      suspended = options.suspended
      resetClock()
      delayFrame()
    }
    mount.style.transform = options.mirror ? 'scaleX(-1)' : ''
    camera.position.set(0, options.presentation === 'hands' ? 0.38 : 0.51, 3)
    camera.fov = options.presentation === 'hands' ? 20 : 27
    camera.updateProjectionMatrix()
    render()
  }

  function pointerDown(event) {
    if (!interactive || !avatar || event.button !== 0) return
    drag = { pointer: event.pointerId, start: event.clientX, rotation: avatar.rotation.y }
    mount.setPointerCapture(event.pointerId)
  }

  function pointerMove(event) {
    if (!drag || drag.pointer !== event.pointerId) return
    avatar.rotation.y = THREE.MathUtils.clamp(drag.rotation + (event.clientX - drag.start) * 0.008, -0.65, 0.65)
    render()
  }

  function pointerEnd() {
    drag = undefined
  }

  function dispose() {
    disposed = true
    resetClock()
    observer?.disconnect()
    mount.removeEventListener('pointerdown', pointerDown)
    mount.removeEventListener('pointermove', pointerMove)
    mount.removeEventListener('lostpointercapture', pointerEnd)
    renderer?.dispose()
    renderer?.forceContextLoss()
    mount.replaceChildren()
    mount.style.transform = ''
  }

  async function initialize() {
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
      renderer.domElement.className = 'block h-full w-full'
      renderer.domElement.setAttribute('aria-hidden', 'true')
      mount.replaceChildren(renderer.domElement)
      observer = new ResizeObserver(resize)
      observer.observe(mount)
      const { scene: original } = await loadModel()
      if (disposed) return
      avatar = clone(original)
      avatar.position.y = -0.85
      scene.add(avatar)
      avatar.updateMatrixWorld(true)
      avatar.traverse((object) => {
        if (object.isSkinnedMesh) object.frustumCulled = false
        if (!object.isBone) return
        const name = canonicalBone(object.userData.name ?? object.name)
        const bindAxes = object.getWorldQuaternion(new THREE.Quaternion())
        bones.set(name, {
          bone: object,
          rest: object.quaternion.clone(),
          bindAxes,
          toBoneAxes: bindAxes.clone().invert(),
          delta: { x: 0, y: 0, z: 0 },
        })
      })
      resetPose()
      resize()
      onStatus('ready')
      delayFrame()
    } catch (error) {
      if (disposed) return
      console.warn('Could not load the signing avatar.', error)
      dispose()
      onStatus('error')
    }
  }

  setOptions({ mirror: false, presentation: 'figure', speed: 1, loop: false, suspended: false })
  mount.addEventListener('pointerdown', pointerDown)
  mount.addEventListener('pointermove', pointerMove)
  mount.addEventListener('lostpointercapture', pointerEnd)
  void initialize()
  return { setQueue, setOptions, play, toggle, restart, step, dispose }
}
