import * as THREE from 'three'

export type AssemblyPart = {
  id: string
  stage: number
  node: THREE.Group
  rest: THREE.Vector3
  offset: THREE.Vector3
  delay: number
  duration: number
  axis: THREE.Vector3
  angle: number
}

/** Rigid-part timeline ported from the supplied standalone configurator. */
export class HouseAssembly {
  private jobs = new Map<string, { part: AssemblyPart; start: number }>()

  constructor(private parts: AssemblyPart[]) {}

  setStage(stage: number, animated: boolean, now: number) {
    for (const part of this.parts) {
      part.node.scale.set(1, 1, 1)
      if (part.stage > stage) {
        part.node.visible = false
        this.jobs.delete(part.id)
        this.place(part, 1)
      } else if (!animated) {
        part.node.visible = true
        this.place(part, 1)
        this.jobs.delete(part.id)
      }
    }
    if (!animated) return
    const latest = Math.max(now, ...[...this.jobs.values()].map((job) => job.start + job.part.duration))
    const stages = [...new Set(this.parts.filter((part) => part.stage <= stage && !part.node.visible && !this.jobs.has(part.id)).map((part) => part.stage))].sort((a, b) => a - b)
    let start = latest
    for (const stageIndex of stages) {
      const next = this.parts.filter((part) => part.stage === stageIndex && !part.node.visible && !this.jobs.has(part.id))
      for (const part of next) {
        this.place(part, 0)
        this.jobs.set(part.id, { part, start: start + part.delay })
      }
      start += Math.max(0, ...next.map((part) => part.delay + part.duration)) + 100
    }
  }

  update(now: number) {
    for (const [id, job] of this.jobs) {
      const raw = THREE.MathUtils.clamp((now - job.start) / job.part.duration, 0, 1)
      job.part.node.visible = now >= job.start
      this.place(job.part, raw * raw * (3 - 2 * raw))
      if (raw >= 1) this.jobs.delete(id)
    }
    return this.jobs.size > 0
  }

  private place(part: AssemblyPart, progress: number) {
    part.node.position.copy(part.rest).addScaledVector(part.offset, 1 - progress)
    part.node.quaternion.setFromAxisAngle(part.axis, part.angle * (1 - progress))
    part.node.scale.set(1, 1, 1)
  }

  get active() { return this.jobs.size > 0 }

  finish(stage: number) {
    this.jobs.clear()
    this.setStage(stage, false, 0)
  }
}
