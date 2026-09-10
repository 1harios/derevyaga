"""Render the original mortgage illustration with Blender (no external assets).

    blender --background --python scripts/generate-mortgage-illustration.py -- /tmp/family-home.png

Convert the rendered PNG to lossless-alpha WebP before placing it in public/illustrations.
The image is an architectural concept, not a photograph of a completed project.
"""

import math
import random
import sys
from pathlib import Path

import bpy
from mathutils import Vector

random.seed(18)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)


def material(name, color, roughness=0.7, metallic=0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*color, 1)
    shader.inputs['Roughness'].default_value = roughness
    shader.inputs['Metallic'].default_value = metallic
    return mat


moss = material('Moss painted timber', (0.19, 0.28, 0.21))
batten = material('Siding highlights', (0.25, 0.35, 0.26))
oak = material('Warm natural oak', (0.57, 0.35, 0.17))
oak_light = material('Fresh decking', (0.69, 0.48, 0.28))
roof = material('Graphite standing seam roof', (0.085, 0.11, 0.10), 0.44, 0.25)
roof_seam = material('Roof seams', (0.13, 0.16, 0.14), 0.4, 0.3)
frame = material('Window frames', (0.085, 0.13, 0.11), 0.45)
glass = material('Soft blue green glass', (0.26, 0.40, 0.39), 0.2, 0.35)
glass_light = material('Reflected sky', (0.56, 0.68, 0.61), 0.27, 0.2)
interior = material('Warm interior', (0.80, 0.65, 0.39), 0.85)
soil = material('Garden island edge', (0.65, 0.65, 0.52))
grass = material('Soft sage lawn', (0.48, 0.57, 0.33))
grass_light = material('Plant green', (0.39, 0.51, 0.27))
leaf = material('Pine needles', (0.22, 0.36, 0.24))
leaf_light = material('Sunlit pine needles', (0.33, 0.46, 0.30))
trunk = material('Tree bark', (0.36, 0.27, 0.19))
stone = material('Warm limestone', (0.80, 0.79, 0.68))
cream = material('Linen cushions', (0.87, 0.85, 0.73))
terracotta = material('Terracotta planter', (0.52, 0.31, 0.22))


def cube(name, location, scale, mat, bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if mat:
        obj.data.materials.append(mat)
    if bevel:
        mod = obj.modifiers.new('Soft edges', 'BEVEL')
        mod.width = bevel
        mod.segments = 3
        obj.modifiers.new('Weighted normals', 'WEIGHTED_NORMAL')
    return obj


def mesh(name, vertices, faces, mat):
    data = bpy.data.meshes.new(name)
    data.from_pydata(vertices, [], faces)
    data.update()
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    return obj


def beam(name, start, end, width, mat):
    start, end = Vector(start), Vector(end)
    obj = cube(name, (start + end) / 2, (width, width, (end - start).length), mat, 0.015)
    obj.rotation_euler = (end - start).to_track_quat('Z', 'Y').to_euler()
    return obj


def cylinder(name, location, radius, depth, mat, vertices=32, top_radius=None):
    bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=radius,
                                    radius2=radius if top_radius is None else top_radius,
                                    depth=depth, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    mod = obj.modifiers.new('Rounded edges', 'BEVEL')
    mod.width = 0.025
    mod.segments = 2
    obj.modifiers.new('Weighted normals', 'WEIGHTED_NORMAL')
    return obj


def bush(name, location, scale, mat):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    obj.data.materials.append(mat)
    mod = obj.modifiers.new('Soft foliage', 'BEVEL')
    mod.width = 0.08
    mod.segments = 3
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return obj


def pine(x, y, height):
    cylinder('Pine trunk', (x, y, height / 2), 0.095, height, trunk, 12)
    for i in range(5):
        z = height * (0.40 + 0.12 * i)
        radius = height * (0.23 - 0.033 * i)
        cylinder('Pine crown', (x, y, z), radius, height * 0.35,
                 leaf if i % 2 else leaf_light, 12, 0.02)


cube('Rounded garden island', (0, 0, 0), (10.7, 8.4, 0.24), soil, 0.65)
cube('Lawn', (0, 0, 0.13), (10.65, 8.35, 0.12), grass, 0.65)
cube('House foundation', (0, 0.65, 0.40), (6.05, 4.25, 0.42), stone, 0.08)
cube('Main house', (0, 0.65, 1.98), (6, 4.2, 2.8), moss, 0.035)

# The gable faces the terrace; the roof ridge runs front to back.
for y in [-1.46, 2.76]:
    mesh('Timber gable', [(-3, y, 3.38), (3, y, 3.38), (0, y, 5.02)], [(0, 1, 2)], moss)

for x in [i * 0.15 - 2.925 for i in range(40)]:
    cube('Vertical front cladding', (x, -1.477, 1.98), (0.047, 0.035, 2.77), batten, 0.006)
    gable_height = max(0, 1.60 * (1 - abs(x) / 3))
    if gable_height > 0.05:
        cube('Gable cladding', (x, -1.48, 3.38 + gable_height / 2),
             (0.047, 0.04, gable_height), batten, 0.006)
for y in [i * 0.15 - 1.40 for i in range(28)]:
    cube('Side cladding', (3.017, y, 1.98), (0.04, 0.045, 2.77), batten, 0.005)

for side in [-1, 1]:
    vertices = [(0, -1.80, 5.15), (side * 3.38, -1.80, 3.35),
                (side * 3.38, 3.06, 3.35), (0, 3.06, 5.15)]
    roof_obj = mesh('Pitched metal roof', vertices, [(0, 1, 2, 3)], roof)
    mod = roof_obj.modifiers.new('Roof thickness', 'SOLIDIFY')
    mod.thickness = 0.09
    for y in [i * 0.38 - 1.76 for i in range(13)]:
        beam('Standing seam', (0, y, 5.19), (side * 3.36, y, 3.40), 0.03, roof_seam)
    beam('Front oak fascia', (0, -1.84, 5.12), (side * 3.42, -1.84, 3.30), 0.16, oak_light)
    beam('Rear fascia', (0, 3.10, 5.12), (side * 3.42, 3.10, 3.30), 0.14, oak)
    beam('Gutter', (side * 3.39, -1.85, 3.30), (side * 3.39, 3.12, 3.30), 0.12, roof)
beam('Ridge cap', (0, -1.85, 5.19), (0, 3.14, 5.19), 0.085, roof_seam)

cube('Panoramic front glazing surround', (-0.45, -1.535, 1.95), (4.32, 0.15, 2.59), oak_light, 0.02)
cube('Panoramic front glazing', (-0.45, -1.628, 1.95), (4.04, 0.05, 2.32), glass, 0.01)
for x in [-2.47, -1.13, 0.21, 1.57]:
    cube('Window mullion', (x, -1.68, 1.95), (0.058, 0.075, 2.36), frame, 0.004)
for z in [0.79, 3.11]:
    cube('Window horizontal rail', (-0.45, -1.68, z), (4.10, 0.075, 0.06), frame, 0.004)
for x in [-2.34, -1.0, 0.34]:
    cube('Warm interior reflection', (x + 0.30, -1.663, 1.60), (0.57, 0.006, 1.38), interior)
    cube('Sky reflection', (x + 0.48, -1.672, 2.65), (0.92, 0.006, 0.74), glass_light)
cube('Sliding door handle', (0.27, -1.745, 1.86), (0.035, 0.055, 0.30), frame, 0.01)

for y in [-0.20, 1.58]:
    cube('Side window surround', (3.045, y, 2.06), (0.15, 1.16, 1.70), oak_light, 0.02)
    cube('Side glass', (3.133, y, 2.06), (0.04, 0.94, 1.47), glass, 0.015)
    cube('Side window reflection', (3.158, y - 0.19, 2.26), (0.012, 0.44, 1.06), glass_light)
    cube('Side mullion', (3.178, y, 2.06), (0.055, 0.055, 1.52), frame, 0.005)

cube('Deck base', (-0.08, -2.63, 0.40), (6.65, 2.30, 0.25), oak, 0.05)
for i in range(35):
    cube('Individual deck board', (-3.3 + i * 0.19, -2.63, 0.556),
         (0.182, 2.30, 0.065), oak_light if i % 3 else oak, 0.012)
cube('Upper entry step', (0.75, -3.91, 0.33), (2.1, 0.50, 0.21), oak_light, 0.03)
cube('Lower entry step', (0.75, -4.13, 0.225), (2.3, 0.40, 0.11), oak_light, 0.025)

# A slim pergola covers one end of the terrace, leaving the glazing visible.
for x in [-3.15, -1.55]:
    beam('Pergola post', (x, -3.55, 0.60), (x, -3.55, 3.0), 0.105, oak)
    beam('Pergola roof beam', (x, -3.64, 3.05), (x, -1.50, 3.05), 0.12, oak)
beam('Pergola front beam', (-3.24, -3.55, 3.00), (-1.46, -3.55, 3.00), 0.13, oak)
for y in [-3.5 + i * 0.25 for i in range(9)]:
    beam('Pergola slat', (-3.25, y, 3.12), (-1.43, y, 3.12), 0.07, oak_light)


def chair(x, y):
    for dx in [-0.30, 0.30]:
        for dy in [-0.28, 0.28]:
            beam('Chair leg', (x + dx, y + dy, 0.62), (x + dx, y + dy, 1.12), 0.045, oak)
    cube('Chair seat', (x, y, 1.10), (0.69, 0.66, 0.12), cream, 0.07)
    back = cube('Chair back', (x, y + 0.29, 1.47), (0.69, 0.10, 0.65), cream, 0.06)
    back.rotation_euler.x = math.radians(-8)
    for dx in [-0.36, 0.36]:
        beam('Chair arm', (x + dx, y - 0.35, 1.31), (x + dx, y + 0.32, 1.31), 0.06, oak_light)


chair(1.95, -2.65)
chair(0.70, -2.65)
cylinder('Terrace table', (1.33, -3.12, 0.97), 0.35, 0.075, oak_light)
cylinder('Table stem', (1.33, -3.12, 0.79), 0.06, 0.30, frame)
cylinder('Ceramic cup', (1.35, -3.12, 1.06), 0.055, 0.09, cream)

for x, y, radius in [(-3.04, -2.30, 0.23), (2.98, -2.01, 0.25)]:
    cylinder('Terracotta pot', (x, y, 0.83), radius * 0.8, 0.48, terracotta, top_radius=radius)
    for _ in range(7):
        dx, dy = random.uniform(-0.18, 0.18), random.uniform(-0.18, 0.18)
        bush('Potted plant', (x + dx, y + dy, 1.21), (0.14, 0.14, 0.32), grass_light)

for x, y, height in [(-4.15, 2.90, 4.8), (-4.30, 0.35, 3.7), (3.98, 3.0, 4.7), (4.45, 1.58, 3.2)]:
    pine(x, y, height)
for x, y in [(-4.03, -1.80), (-4.03, -2.6), (4.0, -0.45), (4.08, -1.4)]:
    bush('Garden shrub', (x, y, 0.52), (0.50, 0.48, 0.46), grass_light)
    bush('Garden shrub companion', (x + 0.38, y + 0.28, 0.41), (0.32, 0.34, 0.31), leaf_light)
for x, y in [(3.90, -2.25), (4.24, -2.98), (-4.48, -0.77)]:
    bush('Smooth garden stone', (x, y, 0.30), (0.30, 0.20, 0.19), stone)
for i in range(3):
    cube('Garden stepping stone', (2.48 + i * 0.72, -3.76 + i * 0.10, 0.24),
         (0.53, 0.59, 0.07), stone, 0.09)

world = bpy.data.worlds.new('Soft studio environment')
world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.78, 0.85, 0.78, 1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.55
bpy.context.scene.world = world

bpy.ops.object.light_add(type='AREA', location=(-6, -8, 13))
key = bpy.context.object
key.name = 'Large warm window light'
key.data.energy = 2100
key.data.shape = 'DISK'
key.data.size = 7
key.data.color = (1.0, 0.91, 0.78)
key.rotation_euler = (Vector((0, 0, 1.0)) - key.location).to_track_quat('-Z', 'Y').to_euler()

bpy.ops.object.light_add(type='AREA', location=(7, 4, 8))
fill = bpy.context.object
fill.name = 'Cool fill'
fill.data.energy = 1100
fill.data.size = 6
fill.rotation_euler = (Vector((0, 0, 1.5)) - fill.location).to_track_quat('-Z', 'Y').to_euler()

bpy.ops.object.camera_add(location=(12, -18, 12))
camera = bpy.context.object
camera.rotation_euler = (Vector((0, 0, 1.3)) - camera.location).to_track_quat('-Z', 'Y').to_euler()
camera.data.type = 'ORTHO'
camera.data.ortho_scale = 15.4
bpy.context.scene.camera = camera

scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 48
scene.cycles.use_denoising = True
scene.render.resolution_x = 1800
scene.render.resolution_y = 1400
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.view_settings.view_transform = 'AgX'
scene.render.threads_mode = 'FIXED'
scene.render.threads = 6
output = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else '/tmp/family-home.png'
scene.render.filepath = str(Path(output).resolve())
bpy.ops.wm.save_as_mainfile(filepath=str(Path(output).with_suffix('.blend').resolve()))
bpy.ops.render.render(write_still=True)
