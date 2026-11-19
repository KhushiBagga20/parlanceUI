import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { SUPPORTED_TOKENS } from '../src/translation/islVocabulary.js'
import { translateOffline } from '../src/translation/islTranslator.js'
import { canonicalBone, restValue } from '../src/avatar/signQueue.js'
import { compileMotion, sampleMotionPose } from '../src/avatar/poseMotion.js'
import { MAX_LIVE_BACKLOG, scheduleSigns } from '../src/avatar/schedule.js'

function newRuntime() {
  return { animations: [], segments: [], characters: [], pending: true }
}

test('the standalone translator turns English, Hindi, names, and digits into playable gloss', () => {
  for (const text of ['I need water', 'मुझे पानी चाहिए']) {
    assert.deepEqual(translateOffline(text).tokens, ['I', 'WATER', 'NEED'])
  }
  assert.deepEqual(translateOffline('Hello Amit').tokens, ['HELLO', 'A-M-I-T'])
  assert.deepEqual(translateOffline('112').tokens, ['1-1-2'])
  assert.deepEqual(translateOffline('Thank you').tokens, ['THANK_YOU'])
})

test('the word, letter, and digit animations target joints on both rigs and return to rest', () => {
  const rigs = ['ybot', 'remy'].map((name) => {
    const glb = readFileSync(new URL(`../public/assets/${name}.glb`, import.meta.url))
    const model = JSON.parse(glb.subarray(20, 20 + glb.readUInt32LE(12)).toString())
    const joints = new Set(model.skins.flatMap((skin) => skin.joints.map((index) => canonicalBone(model.nodes[index].name))))
    return { name, joints }
  })
  const tokens = [...SUPPORTED_TOKENS, 'A-B-C-D-E-F-G-H-I-J-K-L-M-N-O-P-Q-R-S-T-U-V-W-X-Y-Z', ...'0123456789']
  for (const token of tokens) {
    const runtime = newRuntime()
    scheduleSigns([token], runtime)
    assert.ok(runtime.animations.length > 0, token)
    const pose = new Map()
    const deltaFor = (name) => {
      const bone = canonicalBone(name)
      for (const rig of rigs) assert.ok(rig.joints.has(bone), `${token} uses unknown bone ${bone} on ${rig.name}`)
      if (!pose.has(bone)) pose.set(bone, { x: restValue(bone, 'x'), y: restValue(bone, 'y'), z: restValue(bone, 'z') })
      return pose.get(bone)
    }
    const motion = compileMotion(runtime.animations)
    for (const [index, frame] of runtime.animations.entries()) {
      const pose = motion[index]
      assert.ok(Number.isFinite(pose.endMs) && pose.endMs > pose.startMs, `${token} has positive pose durations`)
      for (const fraction of [0, 0.25, 0.5, 0.75, 1]) {
        sampleMotionPose(pose, pose.startMs + pose.moveMs * fraction, deltaFor)
        for (const track of pose.tracks) {
          const angle = deltaFor(track.bone)[track.axis]
          assert.ok(angle >= Math.min(track.from, track.target) && angle <= Math.max(track.from, track.target), `${token} overshoots a pose`)
        }
      }
      sampleMotionPose(pose, pose.endMs, deltaFor)
      for (const [bone, , axis, target] of frame) {
        assert.ok(Math.abs(deltaFor(bone)[axis] - target) < 1e-8, `${token} does not reach ${bone}.${axis}`)
      }
    }
    for (const [bone, delta] of pose) {
      for (const axis of ['x', 'y', 'z']) {
        assert.ok(Math.abs(delta[axis] - restValue(bone, axis)) < 1e-9, `${token} left a joint away from rest`)
      }
    }
  }
})

test('wrist and finger tracks share a pose clock, flow through a waypoint and keep an authored hold', () => {
  const wrist = 'RightHand'
  const finger = 'RightHandIndex1'
  const instructions = (arm, curl) => [[wrist, 'rotation', 'x', arm, '+'], [finger, 'rotation', 'z', curl, '+']]
  const frames = [instructions(0.8, 0.35), instructions(1.6, 0.7), instructions(1.6, 0.7), instructions(0, 0)]
  const [first, second, hold, release] = compileMotion(frames)
  const pose = { [wrist]: { x: 0 }, [finger]: { z: 0 } }
  const sample = (frame, ms) => sampleMotionPose(frame, ms, (name) => pose[name])

  sample(first, first.moveMs / 2)
  assert.ok(pose[wrist].x > 0 && pose[wrist].x < 0.8)
  assert.ok(Math.abs(pose[wrist].x / 0.8 - pose[finger].z / 0.35) < 1e-9)
  assert.equal(first.endMs, second.startMs)
  for (const [index, track] of first.tracks.entries()) {
    assert.ok(track.endTangent > 0)
    assert.ok(Math.abs(track.endTangent / first.moveMs - second.tracks[index].startTangent / second.moveMs) < 1e-9)
  }
  sample(second, second.endMs)
  sample(hold, hold.endMs)
  assert.equal(hold.moveMs, 0)
  assert.ok(hold.endMs > hold.startMs)
  assert.equal(pose[finger].z, 0.7)
  assert.equal(release.endMs, release.startMs + release.moveMs)
  sample(release, release.endMs)
  assert.equal(pose[wrist].x, 0)
  assert.equal(pose[finger].z, 0)
})

test('live speech keeps the active sign and discards the oldest waiting signs', () => {
  const runtime = newRuntime()
  scheduleSigns(['HELLO'], runtime)
  const newer = ['I', 'WATER', 'NEED', 'YOU', 'GO', 'HOME', 'STOP', 'WAIT', 'GOOD']
  scheduleSigns(newer, runtime, { append: true })
  assert.deepEqual(runtime.segments.map(({ token }) => token), ['HELLO', ...newer.slice(1 - MAX_LIVE_BACKLOG)])
  assert.equal(runtime.animations.length, runtime.segments.reduce((total, segment) => total + segment.frames, 0))
  scheduleSigns([], runtime)
  assert.deepEqual(runtime.animations, [])
})
