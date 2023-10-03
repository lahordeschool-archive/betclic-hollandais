import { Vec3 } from '../math/Vec3'
import { Quaternion } from '../math/Quaternion'
import { Heightfield } from '../shapes/Heightfield'
import { Narrowphase } from './Narrowphase'
import { Sphere } from '../shapes/Sphere'
import { Body } from '../objects/Body'
import { World } from '../world/World'
import { ContactEquation } from '../equations/ContactEquation'
import { FrictionEquation } from '../equations/FrictionEquation'

describe('Narrowphase', () => {
  test('sphere + sphere contact', () => {
    const world = new World()
    const narrowPhase = new Narrowphase(world)
    const result: ContactEquation[] = []
    const sphereShape = new Sphere(1)

    const bodyA = new Body({ mass: 1 })
    const bodyB = new Body({ mass: 1 })
    bodyA.addShape(sphereShape)
    bodyB.addShape(sphereShape)

    // Assumption: using World.defaultContactMaterial will be the same
    // as using `new ContactMaterial()` for narrowPhase.currentContactMaterial.

    narrowPhase.result = result
    narrowPhase.sphereSphere(
      sphereShape,
      sphereShape,
      new Vec3(0.5, 0, 0),
      new Vec3(-0.5, 0, 0),
      new Quaternion(),
      new Quaternion(),
      bodyA,
      bodyB
    )

    expect(result.length).toBe(1)
  })

  test('sphere + heightfield contact', () => {
    const world = new World()
    const narrowPhase = new Narrowphase(world)
    const result: ContactEquation[] = []
    const hfShape = createHeightfield()
    const sphereShape = new Sphere(0.1)

    const bodyA = new Body({ mass: 1 })
    const bodyB = new Body({ mass: 1 })
    bodyA.addShape(hfShape)
    bodyB.addShape(sphereShape)

    narrowPhase.result = result
    narrowPhase.sphereHeightfield(
      sphereShape,
      hfShape,
      new Vec3(0.25, 0.25, 0.05), // hit the first triangle in the field
      new Vec3(0, 0, 0),
      new Quaternion(),
      new Quaternion(),
      bodyA,
      bodyB
    )

    expect(result.length).toBe(1)
  })

  test('should default to using global gravity to create friction equations', () => {
    const gravity = new Vec3(0, -9.81, 0)
    const world = new World({ gravity })
    // No frictionGravity override.
    expect(world.frictionGravity).toBeUndefined()

    const narrowPhase = new Narrowphase(world)
    const contacts: ContactEquation[] = []
    const sphereShape = new Sphere(1)

    const bodyA = new Body({ mass: 1 })
    const bodyB = new Body({ mass: 1 })
    bodyA.addShape(sphereShape)
    bodyB.addShape(sphereShape)

    narrowPhase.result = contacts
    narrowPhase.sphereSphere(
      sphereShape,
      sphereShape,
      new Vec3(0.5, 0, 0),
      new Vec3(-0.5, 0, 0),
      new Quaternion(),
      new Quaternion(),
      bodyA,
      bodyB
    )

    expect(contacts.length).toBe(1)
    const [contact] = contacts
    const result: FrictionEquation[] = []

    // No frictionGravity, should use global gravity.
    narrowPhase.createFrictionEquationsFromContact(contact, result)
    expect(result.length).toBe(2)
    result.forEach((result) => {
      expect(result.maxForce > 0).toBe(true)
    })
  })

  test('if provided, should use frictionGravity to create friction equations', () => {
    const gravity = new Vec3(0, 0, 0)
    const frictionGravity = new Vec3(0, -9.81, 0)
    const world = new World({ gravity, frictionGravity })

    const narrowPhase = new Narrowphase(world)
    const contacts: ContactEquation[] = []
    const sphereShape = new Sphere(1)

    const bodyA = new Body({ mass: 1 })
    const bodyB = new Body({ mass: 1 })
    bodyA.addShape(sphereShape)
    bodyB.addShape(sphereShape)

    narrowPhase.result = contacts
    narrowPhase.sphereSphere(
      sphereShape,
      sphereShape,
      new Vec3(0.5, 0, 0),
      new Vec3(-0.5, 0, 0),
      new Quaternion(),
      new Quaternion(),
      bodyA,
      bodyB
    )

    expect(contacts.length).toBe(1)
    const [contact] = contacts
    const result: FrictionEquation[] = []

    // No gravity, frictionGravity defined, friction.
    narrowPhase.createFrictionEquationsFromContact(contact, result)
    expect(result.length).toBe(2)
    result.forEach((result) => {
      expect(result.maxForce > 0).toBe(true)
    })

    // No gravity, no frictionGravity, no friction.
    result.length = 0
    world.frictionGravity = new Vec3(0, 0, 0)
    narrowPhase.createFrictionEquationsFromContact(contact, result)
    expect(result.length).toBe(2)
    result.forEach((result) => {
      expect(result.maxForce).toBe(0)
    })
  })
})

function createHeightfield() {
  const matrix: number[][] = []
  const size = 20
  for (let i = 0; i < size; i++) {
    matrix.push([])
    for (let j = 0; j < size; j++) {
      matrix[i].push(0)
    }
  }
  const hfShape = new Heightfield(matrix, {
    elementSize: 1,
  })

  return hfShape
}
