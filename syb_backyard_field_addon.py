bl_info = {
    "name": "Stylized Backyard Youth Baseball Field Generator (Retro Neighborhood)",
    "author": "ChatGPT",
    "version": (1, 3, 0),
    "blender": (3, 0, 0),
    "location": "View3D > Sidebar > Create > Backyard Field",
    "description": "Generates a retro neighborhood backyard youth baseball field with props, players, and cameras.",
    "category": "Add Mesh",
}

import bpy
import bmesh
import random
from math import radians, cos, sin, pi
from mathutils import Vector
from bpy_extras.io_utils import ExportHelper


# -------------------------
# Helpers
# -------------------------

ROOT_COLLECTION_NAME = "SYB_BACKYARD_BASEBALL"


def deselect_all():
    for o in bpy.context.selected_objects:
        o.select_set(False)


def set_active(obj):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)


def ensure_collection(name, parent=None):
    col = bpy.data.collections.get(name)
    if not col:
        col = bpy.data.collections.new(name)
        if parent:
            parent.children.link(col)
        else:
            bpy.context.scene.collection.children.link(col)
    return col


def safe_unlink_object(obj, col):
    try:
        col.objects.unlink(obj)
    except RuntimeError:
        pass


def link_to_collection(obj, col):
    for c in list(obj.users_collection):
        safe_unlink_object(obj, c)
    col.objects.link(obj)


def remove_collection_recursive(col):
    for child in list(col.children):
        remove_collection_recursive(child)
    for obj in list(col.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for scene in bpy.data.scenes:
        if col in scene.collection.children:
            scene.collection.children.unlink(col)
    bpy.data.collections.remove(col)


def cleanup_previous(prefix="SYB_"):
    root_col = bpy.data.collections.get(ROOT_COLLECTION_NAME)
    if root_col:
        remove_collection_recursive(root_col)

    to_remove = [o for o in bpy.data.objects if o.name.startswith(prefix)]
    for o in to_remove:
        if o.name in bpy.data.objects:
            bpy.data.objects.remove(o, do_unlink=True)


def make_material(name, base_color=(1, 1, 1, 1), rough=0.8, spec=0.2, emission=0.0):
    """
    Simple Principled-only material (GLB-friendly).
    """
    mat = bpy.data.materials.get(name)
    if mat is None:
        mat = bpy.data.materials.new(name)
        mat.use_nodes = True

    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    for n in list(nodes):
        nodes.remove(n)

    out = nodes.new("ShaderNodeOutputMaterial")
    out.location = (400, 0)

    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (0, 0)
    bsdf.inputs["Base Color"].default_value = base_color
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Specular"].default_value = spec
    bsdf.inputs["Emission Color"].default_value = base_color
    bsdf.inputs["Emission Strength"].default_value = emission

    links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return mat


def assign_mat(obj, mat):
    if obj.type != 'MESH':
        return
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)


def shade(obj, smooth=True):
    if obj.type == 'MESH':
        deselect_all()
        set_active(obj)
        bpy.ops.object.shade_smooth() if smooth else bpy.ops.object.shade_flat()


def bevel(obj, width=0.03, segments=2):
    mod = obj.modifiers.new("Bevel", "BEVEL")
    mod.width = width
    mod.segments = segments
    mod.limit_method = 'ANGLE'
    return mod


def apply_modifiers(obj):
    if obj is None or obj.type != 'MESH':
        return
    deselect_all()
    set_active(obj)
    for m in list(obj.modifiers):
        try:
            bpy.ops.object.modifier_apply(modifier=m.name)
        except RuntimeError:
            pass


def add_plane(name, size_x, size_y, location=(0, 0, 0), rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_plane_add(size=1.0, location=location, rotation=rotation)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (size_x / 2.0, size_y / 2.0, 1.0)
    bpy.ops.object.transform_apply(scale=True)
    return obj


def add_cube(name, size_x, size_y, size_z, location=(0, 0, 0), rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=location, rotation=rotation)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (size_x / 2.0, size_y / 2.0, size_z / 2.0)
    bpy.ops.object.transform_apply(scale=True)
    return obj


def add_cylinder(name, radius, depth, location=(0, 0, 0), rotation=(0, 0, 0), verts=18):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=depth, location=location, rotation=rotation)
    obj = bpy.context.active_object
    obj.name = name
    return obj


def add_cone(name, radius1, radius2, depth, location=(0, 0, 0), verts=14, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=radius1, radius2=radius2, depth=depth, location=location, rotation=rotation)
    obj = bpy.context.active_object
    obj.name = name
    return obj


def add_sphere(name, radius, location=(0, 0, 0), verts=16, rings=8):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=verts, ring_count=rings, radius=radius, location=location)
    obj = bpy.context.active_object
    obj.name = name
    return obj


def build_strip(name, start, end, width=0.2, thickness=0.01, z=0.004):
    s = Vector((start[0], start[1], 0))
    e = Vector((end[0], end[1], 0))
    mid = (s + e) * 0.5
    direction = (e - s)
    length = direction.length
    if length < 1e-6:
        return None
    angle = direction.to_2d().angle_signed(Vector((1, 0)))
    strip = add_cube(name, length, width, thickness, location=(mid.x, mid.y, z + thickness / 2.0), rotation=(0, 0, angle))
    bevel(strip, width=min(0.03, width * 0.15), segments=2)
    shade(strip, True)
    return strip


def build_base(name, size=0.381, thickness=0.05, location=(0, 0, 0)):
    b = add_cube(name, size, size, thickness, location=(location[0], location[1], thickness / 2.0))
    bevel(b, width=0.02, segments=3)
    shade(b, True)
    return b


def build_home_plate(name="HomePlate", size=0.432, thickness=0.045, location=(0, 0, 0)):
    w = size
    half = w / 2.0
    d = w

    verts_2d = [
        Vector((-half, 0.0, 0.0)),
        Vector((half, 0.0, 0.0)),
        Vector((half, d * 0.55, 0.0)),
        Vector((0.0, d, 0.0)),
        Vector((-half, d * 0.55, 0.0)),
    ]

    mesh = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)

    bm = bmesh.new()
    vlist = [bm.verts.new(v) for v in verts_2d]
    bm.faces.new(vlist)
    bm.normal_update()

    face = bm.faces[0]
    res = bmesh.ops.extrude_face_region(bm, geom=[face])
    verts_extruded = [g for g in res["geom"] if isinstance(g, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, verts=verts_extruded, vec=Vector((0, 0, thickness)))

    bm.to_mesh(mesh)
    bm.free()

    obj.location = location
    obj.location.z = 0.0
    bevel(obj, width=0.01, segments=2)
    shade(obj, True)
    return obj


def build_mound(name="Mound", center=(9.144, 9.144, 0.0), radius=1.05, height=0.18):
    mound = add_cylinder(name, radius=radius, depth=height, location=(center[0], center[1], height / 2.0), verts=22)
    bevel(mound, width=0.05, segments=3)
    shade(mound, True)

    bm = bmesh.new()
    bm.from_mesh(mound.data)
    zmax = max(v.co.z for v in bm.verts)
    top = [v for v in bm.verts if abs(v.co.z - zmax) < 1e-5]
    if top:
        bmesh.ops.scale(bm, verts=top, vec=Vector((0.82, 0.82, 1.0)))
    bm.to_mesh(mound.data)
    bm.free()

    return mound


def build_outfield_fence(name="OutfieldFence", seed=0, height=1.7, thickness=0.12):
    rnd = random.Random(seed)
    point_count = rnd.randint(4, 7)
    angles = [rnd.uniform(radians(-8), radians(98)) for _ in range(point_count)]
    angles.sort()
    radii = [rnd.uniform(46.0, 56.0) for _ in range(point_count)]

    pts = [Vector((cos(a) * r, sin(a) * r, 0)) for a, r in zip(angles, radii)]

    segments = []
    posts = []
    for i in range(len(pts)):
        p0 = pts[i]
        p1 = pts[(i + 1) % len(pts)]
        if p1.y < 16.0:
            continue
        direction = (p1 - p0)
        length = direction.length
        if length < 0.5:
            continue
        angle = direction.to_2d().angle_signed(Vector((1, 0)))
        tilt = rnd.uniform(radians(-2.5), radians(2.5))
        offset = rnd.uniform(-0.08, 0.08)
        segment = add_cube(
            f"{name}_Segment_{i:02d}",
            length,
            thickness,
            height,
            location=((p0.x + p1.x) / 2.0, (p0.y + p1.y) / 2.0, height / 2.0 + offset),
            rotation=(tilt, 0, angle + rnd.uniform(-0.03, 0.03)),
        )
        bevel(segment, width=0.02, segments=2)
        shade(segment, True)
        segments.append(segment)

        for p in (p0, p1):
            if p.y < 16.0:
                continue
            post = add_cylinder(
                f"{name}_Post_{i:02d}_{'A' if p == p0 else 'B'}",
                radius=0.08,
                depth=height * 1.05,
                location=(p.x + rnd.uniform(-0.06, 0.06), p.y + rnd.uniform(-0.06, 0.06), (height * 1.05) / 2.0),
                verts=10,
            )
            bevel(post, width=0.02, segments=2)
            shade(post, True)
            posts.append(post)

    fence_obj = None
    if segments:
        deselect_all()
        for o in segments:
            o.select_set(True)
        bpy.context.view_layer.objects.active = segments[0]
        bpy.ops.object.join()
        fence_obj = bpy.context.active_object
        fence_obj.name = name

    return fence_obj, posts


def build_dirt_patch(name, radius=0.8, location=(0, 0, 0), scale=(1.0, 1.0), depth=0.01, z=0.002):
    patch = add_cylinder(name, radius=radius, depth=depth, location=(location[0], location[1], z + depth / 2.0), verts=18)
    patch.scale.x = scale[0]
    patch.scale.y = scale[1]
    bpy.ops.object.transform_apply(scale=True)
    shade(patch, True)
    return patch


def build_dandelions(name, count=120, area=40.0, seed=0, z=0.0012):
    rnd = random.Random(seed)
    mesh = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    bm = bmesh.new()

    for _ in range(count):
        radius = rnd.uniform(0.03, 0.05)
        x = rnd.uniform(-area, area)
        y = rnd.uniform(-area * 0.2, area)
        circle = bmesh.ops.create_circle(bm, segments=6, radius=radius)
        bmesh.ops.contextual_create(bm, geom=circle["verts"])  # fill
        bmesh.ops.translate(bm, verts=circle["verts"], vec=Vector((x, y, z)))

    bm.to_mesh(mesh)
    bm.free()
    return obj


def parent_to_root(obj, root):
    obj.parent = root


# -------------------------
# Backyard props (stylized)
# -------------------------

def build_hedge_row(prefix, start, end, count=18, radius=0.55, height=1.15, jitter=0.18, seed=0):
    rnd = random.Random(seed)
    objs = []
    s = Vector((start[0], start[1], 0))
    e = Vector((end[0], end[1], 0))
    d = e - s
    for i in range(count):
        t = i / max(1, count - 1)
        p = s + d * t
        jx = rnd.uniform(-jitter, jitter)
        jy = rnd.uniform(-jitter, jitter)
        sc = rnd.uniform(0.85, 1.18)
        tilt = rnd.uniform(-6.0, 6.0)
        rotz = rnd.uniform(-0.25, 0.25)

        h = add_cone(
            f"{prefix}_Hedge_{i:02d}",
            radius1=radius * sc,
            radius2=radius * 0.45 * sc,
            depth=height * sc,
            location=(p.x + jx, p.y + jy, (height * sc) / 2.0),
            verts=10,
            rotation=(radians(tilt), 0, rotz),
        )
        shade(h, True)
        objs.append(h)
    return objs


def build_pine_cluster(prefix, center, rows=2, cols=6, spacing=1.35, seed=0):
    rnd = random.Random(seed)
    objs = []
    cx, cy = center
    idx = 0
    for r in range(rows):
        for c in range(cols):
            x = cx + c * spacing + (r * 0.6) + rnd.uniform(-0.3, 0.3)
            y = cy + r * spacing + rnd.uniform(-0.3, 0.3)
            sc = rnd.uniform(0.85, 1.25)
            rotz = rnd.uniform(-0.35, 0.35)
            h = add_cone(
                f"{prefix}_Pine_{idx:02d}",
                radius1=0.9 * sc,
                radius2=0.12 * sc,
                depth=3.6 * sc,
                location=(x, y, (3.6 * sc) / 2.0),
                verts=10,
                rotation=(0, 0, rotz),
            )
            shade(h, True)
            objs.append(h)
            idx += 1
    return objs


def build_shed(prefix="SYB_Shed", location=(35, 40, 0), size=(7.0, 5.2, 4.2)):
    sx, sy, sz = size
    body = add_cube(prefix + "_Body", sx, sy, sz * 0.72, location=(location[0], location[1], (sz * 0.72) / 2.0))
    roof = add_cube(
        prefix + "_Roof",
        sx * 1.05,
        sy * 1.05,
        sz * 0.25,
        location=(location[0], location[1], sz * 0.72 + (sz * 0.25) / 2.0),
    )
    roof.rotation_euler.x = radians(12)
    bevel(body, width=0.08, segments=2)
    bevel(roof, width=0.08, segments=2)
    shade(body, True)
    shade(roof, True)
    return body, roof


def build_pool(prefix="SYB_Pool", location=(-25, 58, 0), size=(18.0, 12.0), lip=0.45):
    sx, sy = size
    rim = add_cube(prefix + "_Rim", sx, sy, 0.25, location=(location[0], location[1], 0.125))
    inner = add_cube(prefix + "_Water", sx - lip * 2, sy - lip * 2, 0.15, location=(location[0], location[1], 0.10))
    bevel(rim, width=0.12, segments=2)
    bevel(inner, width=0.08, segments=2)
    shade(rim, True)
    shade(inner, True)
    return rim, inner


def build_roof_blocks(prefix="SYB_Roof", locations=((-55, -10, 0), (60, -18, 0))):
    objs = []
    for i, (x, y, z) in enumerate(locations):
        roof = add_cube(f"{prefix}_{i:02d}", 20, 14, 6, location=(x, y, 3))
        roof.rotation_euler.z = radians(18 if i == 0 else -12)
        bevel(roof, width=0.18, segments=2)
        shade(roof, True)
        objs.append(roof)
    return objs


def build_backstop(prefix="SYB_Backstop", location=(0, -6.8, 0), width=11.0, height=4.0, thickness=0.16):
    panel = add_cube(prefix + "_Panel", width, thickness, height, location=(location[0], location[1], height / 2.0))
    bevel(panel, width=0.06, segments=2)
    shade(panel, True)

    posts = []
    for sx in (-width / 2.0 + 0.55, width / 2.0 - 0.55):
        p = add_cylinder(
            prefix + f"_Post_{'L' if sx < 0 else 'R'}",
            radius=0.10,
            depth=height * 1.06,
            location=(location[0] + sx, location[1], (height * 1.06) / 2.0),
            verts=12,
        )
        bevel(p, width=0.03, segments=2)
        shade(p, True)
        posts.append(p)

    return panel, posts


def build_bleachers(prefix="SYB_Bleachers", location=(-18.0, 12.0, 0), width=9.0, depth=3.6, height=2.1):
    base = add_cube(prefix + "_Base", width, depth, height * 0.35, location=(location[0], location[1], (height * 0.35) / 2.0))
    steps = []
    for i in range(3):
        w = width * (0.95 - i * 0.08)
        d = depth * (0.55 + i * 0.20)
        z = height * 0.35 + (i + 1) * (height * 0.18)
        s = add_cube(prefix + f"_Step_{i:02d}", w, d, height * 0.12, location=(location[0], location[1] + (i * 0.25), z))
        steps.append(s)
    for o in [base] + steps:
        bevel(o, width=0.06, segments=2)
        shade(o, True)
    return [base] + steps


def build_scoreboard(prefix="SYB_Scoreboard", location=(3.0, 56.5, 0), size=(7.8, 0.55, 3.6)):
    w, d, h = size
    board = add_cube(prefix + "_Board", w, d, h, location=(location[0], location[1], h / 2.0))
    legs = []
    for sx in (-w / 2.5, w / 2.5):
        leg = add_cylinder(
            prefix + f"_Leg_{'L' if sx < 0 else 'R'}",
            radius=0.11,
            depth=h * 1.05,
            location=(location[0] + sx, location[1] - 0.4, (h * 1.05) / 2.0),
            verts=12,
        )
        legs.append(leg)
    for o in [board] + legs:
        bevel(o, width=0.05, segments=2)
        shade(o, True)
    return board, legs


def build_picnic_table(prefix="SYB_Picnic", location=(28, 14, 0)):
    top = add_cube(prefix + "_Top", 2.6, 1.2, 0.14, location=(location[0], location[1], 0.75))
    bench1 = add_cube(prefix + "_Bench_A", 2.6, 0.35, 0.12, location=(location[0], location[1] - 0.8, 0.45))
    bench2 = add_cube(prefix + "_Bench_B", 2.6, 0.35, 0.12, location=(location[0], location[1] + 0.8, 0.45))
    legs = []
    for sx in (-1.1, 1.1):
        l = add_cube(prefix + f"_Leg_{'L' if sx < 0 else 'R'}", 0.12, 1.15, 0.75, location=(location[0] + sx, location[1], 0.38))
        legs.append(l)
    objs = [top, bench1, bench2] + legs
    for o in objs:
        bevel(o, width=0.03, segments=2)
        shade(o, True)
    return objs


def build_cooler(prefix="SYB_Cooler", location=(26.9, 15.5, 0)):
    body = add_cube(prefix + "_Body", 0.55, 0.38, 0.42, location=(location[0], location[1], 0.21))
    lid = add_cube(prefix + "_Lid", 0.57, 0.40, 0.10, location=(location[0], location[1], 0.42))
    bevel(body, width=0.02, segments=2)
    bevel(lid, width=0.02, segments=2)
    shade(body, True)
    shade(lid, True)
    return body, lid


def build_bike(prefix="SYB_Bike", location=(-28, 12, 0)):
    frame = add_cube(prefix + "_Frame", 1.2, 0.12, 0.45, location=(location[0], location[1], 0.35))
    wheel_a = add_cylinder(prefix + "_Wheel_A", radius=0.35, depth=0.10, location=(location[0] - 0.55, location[1], 0.35), verts=16)
    wheel_b = add_cylinder(prefix + "_Wheel_B", radius=0.35, depth=0.10, location=(location[0] + 0.55, location[1], 0.35), verts=16)
    wheel_a.rotation_euler.x = radians(90)
    wheel_b.rotation_euler.x = radians(90)
    objs = [frame, wheel_a, wheel_b]
    for o in objs:
        bevel(o, width=0.02, segments=2)
        shade(o, True)
    return objs


def build_mailbox(prefix="SYB_Mailbox", location=(-46, -12, 0)):
    post = add_cylinder(prefix + "_Post", radius=0.10, depth=1.6, location=(location[0], location[1], 0.8), verts=12)
    box = add_cube(prefix + "_Box", 0.9, 0.5, 0.45, location=(location[0], location[1], 1.35))
    bevel(post, width=0.03, segments=2)
    bevel(box, width=0.03, segments=2)
    shade(post, True)
    shade(box, True)
    return [post, box]


def build_lamppost(prefix="SYB_Lamp", location=(22.0, 38.0, 0)):
    pole = add_cylinder(prefix + "_Pole", radius=0.08, depth=4.0, location=(location[0], location[1], 2.0), verts=12)
    cap = add_cube(prefix + "_Cap", 0.35, 0.35, 0.25, location=(location[0], location[1], 4.1))
    shade(pole, True)
    shade(cap, True)
    return [pole, cap]


def build_bench(prefix="SYB_Bench", location=(20.0, 10.0, 0)):
    seat = add_cube(prefix + "_Seat", 2.4, 0.35, 0.12, location=(location[0], location[1], 0.55))
    back = add_cube(prefix + "_Back", 2.4, 0.15, 0.45, location=(location[0], location[1] - 0.18, 0.78))
    legs = []
    for sx in (-1.05, 1.05):
        leg = add_cube(prefix + f"_Leg_{'L' if sx < 0 else 'R'}", 0.12, 0.35, 0.55, location=(location[0] + sx, location[1], 0.28))
        legs.append(leg)
    objs = [seat, back] + legs
    for o in objs:
        bevel(o, width=0.02, segments=2)
        shade(o, True)
    return objs


def build_trash_can(prefix="SYB_Trash", location=(-18.0, 6.0, 0)):
    body = add_cylinder(prefix + "_Body", radius=0.35, depth=0.8, location=(location[0], location[1], 0.4), verts=12)
    lid = add_cylinder(prefix + "_Lid", radius=0.38, depth=0.12, location=(location[0], location[1], 0.86), verts=12)
    shade(body, True)
    shade(lid, True)
    return [body, lid]


def build_garden_gate(prefix="SYB_Gate", location=(48.0, 18.0, 0)):
    frame = add_cube(prefix + "_Frame", 1.4, 0.12, 1.6, location=(location[0], location[1], 0.8))
    slat = add_cube(prefix + "_Slat", 1.2, 0.06, 1.3, location=(location[0], location[1], 0.75))
    for o in [frame, slat]:
        bevel(o, width=0.02, segments=2)
        shade(o, True)
    return [frame, slat]


def build_player(name, seed, materials, location=(0, 0, 0), has_bat=False):
    rnd = random.Random(seed)
    body = add_cylinder(name + "_Body", radius=0.28, depth=1.05, location=(location[0], location[1], 0.55), verts=14)
    head = add_sphere(name + "_Head", radius=0.32, location=(location[0], location[1], 1.25))
    cap = add_cone(name + "_Cap", radius1=0.34, radius2=0.12, depth=0.25, location=(location[0], location[1], 1.42), verts=10)
    glove = add_cube(name + "_Glove", 0.22, 0.18, 0.18, location=(location[0] + 0.32, location[1] + 0.05, 0.75))

    parts = [body, head, cap, glove]
    if has_bat:
        bat = add_cylinder(name + "_Bat", radius=0.05, depth=0.85, location=(location[0] - 0.35, location[1] - 0.2, 0.9), verts=10)
        bat.rotation_euler.x = radians(80)
        parts.append(bat)

    for p in parts:
        shade(p, True)

    assign_mat(body, materials["body"])
    assign_mat(head, materials["skin"])
    assign_mat(cap, materials["accent"])
    assign_mat(glove, materials["glove"])
    if has_bat:
        assign_mat(bat, materials["accent"])

    deselect_all()
    for p in parts:
        p.select_set(True)
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.join()
    body.name = name
    body.rotation_euler.z = rnd.uniform(-0.3, 0.3)
    return body


# -------------------------
# Cameras + targets
# -------------------------

def add_empty(name, location):
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=location)
    e = bpy.context.active_object
    e.name = name
    return e


def add_camera(name, location, target_obj=None, lens=45.0):
    bpy.ops.object.camera_add(location=location)
    cam = bpy.context.active_object
    cam.name = name
    cam.data.lens = lens
    if target_obj:
        con = cam.constraints.new(type='TRACK_TO')
        con.target = target_obj
        con.track_axis = 'TRACK_NEGATIVE_Z'
        con.up_axis = 'UP_Y'
    return cam


# -------------------------
# Operator + UI
# -------------------------

class SYB_OT_generate_field_plus(bpy.types.Operator):
    bl_idname = "syb.generate_field_plus"
    bl_label = "Generate Stylized Backyard Youth Field (Plus)"
    bl_options = {"REGISTER", "UNDO"}

    clear_existing: bpy.props.BoolProperty(
        name="Clear Previous SYB Objects",
        default=True
    )

    include_backyard_props: bpy.props.BoolProperty(
        name="Include Backyard Props (shed/pool/hedges/trees/roofs)",
        default=True
    )

    include_extra_set_dressing: bpy.props.BoolProperty(
        name="Include Extra Set Dressing (backstop/scoreboard/bleachers/etc.)",
        default=True
    )

    include_field_markings: bpy.props.BoolProperty(
        name="Include Field Markings",
        default=True
    )

    include_basepaths: bpy.props.BoolProperty(
        name="Include Basepaths",
        default=True
    )

    include_players: bpy.props.BoolProperty(
        name="Include Players",
        default=True
    )

    random_seed: bpy.props.IntProperty(
        name="Random Seed",
        default=7,
        min=0,
        max=999999
    )

    apply_bevel_mods: bpy.props.BoolProperty(
        name="Apply Bevel Modifiers (pre-export friendly)",
        default=False
    )

    camera_view: bpy.props.EnumProperty(
        name="Preferred Camera View",
        items=[
            ("BEHIND_BATTER", "Behind Batter", "Behind batter looking toward pitcher"),
            ("STRIKE_ZONE", "Strike Zone High", "Strike-zone style camera"),
            ("ISOMETRIC", "Isometric", "Cartoony isometric broadcast angle"),
        ],
        default="BEHIND_BATTER"
    )

    set_active_camera: bpy.props.BoolProperty(
        name="Set Active Camera After Build",
        default=True
    )

    def execute(self, context):
        # Youth base distance: 60ft = 18.288m
        D = 18.288
        rnd = random.Random(self.random_seed)

        if self.clear_existing:
            cleanup_previous("SYB_")

        # Scene units
        context.scene.unit_settings.system = 'METRIC'
        context.scene.unit_settings.scale_length = 1.0

        # Collections
        root_col = ensure_collection(ROOT_COLLECTION_NAME)
        col_field = ensure_collection("SYB_Field", root_col)
        col_lines = ensure_collection("SYB_Lines", root_col)
        col_bases = ensure_collection("SYB_Bases", root_col)
        col_mound = ensure_collection("SYB_Mound", root_col)
        col_fence = ensure_collection("SYB_Fence", root_col)
        col_props = ensure_collection("SYB_Props", root_col)
        col_extras = ensure_collection("SYB_Extras", root_col)
        col_anchors = ensure_collection("SYB_Anchors", root_col)
        col_players = ensure_collection("SYB_Players", root_col)

        # Root empty
        root_empty = add_empty("SYB_Root", (0, 0, 0))
        link_to_collection(root_empty, col_anchors)

        # Materials
        mat_grass = make_material("SYB_MAT_Grass", base_color=(0.11, 0.70, 0.22, 1), rough=0.92, spec=0.10)
        mat_grass2 = make_material("SYB_MAT_Grass_Darker", base_color=(0.08, 0.58, 0.18, 1), rough=0.93, spec=0.08)
        mat_dirt = make_material("SYB_MAT_Dirt", base_color=(0.62, 0.40, 0.20, 1), rough=0.97, spec=0.05)
        mat_white = make_material("SYB_MAT_White", base_color=(0.96, 0.96, 0.96, 1), rough=0.65, spec=0.15)
        mat_line = make_material("SYB_MAT_Line", base_color=(1, 1, 1, 1), rough=0.55, spec=0.10, emission=0.25)
        mat_fence = make_material("SYB_MAT_Fence", base_color=(0.78, 0.25, 0.16, 1), rough=0.75, spec=0.12)
        mat_post = make_material("SYB_MAT_Fence_Post", base_color=(0.58, 0.18, 0.12, 1), rough=0.78, spec=0.10)
        mat_hedge = make_material("SYB_MAT_Hedge", base_color=(0.05, 0.42, 0.12, 1), rough=0.95, spec=0.05)
        mat_pine = make_material("SYB_MAT_Pine", base_color=(0.06, 0.52, 0.16, 1), rough=0.9, spec=0.07)
        mat_shed = make_material("SYB_MAT_Shed", base_color=(0.90, 0.72, 0.40, 1), rough=0.8, spec=0.12)
        mat_roof = make_material("SYB_MAT_Roof", base_color=(0.12, 0.45, 0.25, 1), rough=0.7, spec=0.12)
        mat_pool_rim = make_material("SYB_MAT_PoolRim", base_color=(0.92, 0.92, 0.95, 1), rough=0.6, spec=0.18)
        mat_water = make_material("SYB_MAT_Water", base_color=(0.10, 0.65, 0.85, 1), rough=0.25, spec=0.4, emission=0.05)

        # Extras mats
        mat_metal = make_material("SYB_MAT_Metal", base_color=(0.55, 0.58, 0.62, 1), rough=0.55, spec=0.25)
        mat_board = make_material("SYB_MAT_Scoreboard", base_color=(0.08, 0.12, 0.16, 1), rough=0.75, spec=0.08)
        mat_bench = make_material("SYB_MAT_Bench", base_color=(0.42, 0.28, 0.16, 1), rough=0.85, spec=0.10)
        mat_cooler = make_material("SYB_MAT_Cooler", base_color=(0.85, 0.20, 0.20, 1), rough=0.55, spec=0.18)
        mat_mailbox = make_material("SYB_MAT_Mailbox", base_color=(0.15, 0.18, 0.22, 1), rough=0.65, spec=0.12)
        mat_lamp = make_material("SYB_MAT_Lamp", base_color=(0.25, 0.25, 0.28, 1), rough=0.6, spec=0.15)
        mat_trash = make_material("SYB_MAT_Trash", base_color=(0.15, 0.2, 0.18, 1), rough=0.65, spec=0.12)
        mat_gate = make_material("SYB_MAT_Gate", base_color=(0.45, 0.32, 0.18, 1), rough=0.8, spec=0.1)
        mat_dandelion = make_material("SYB_MAT_Dandelion", base_color=(0.95, 0.92, 0.62, 1), rough=0.7, spec=0.05)

        # Player mats
        mat_player_body = make_material("SYB_MAT_PlayerBody", base_color=(0.15, 0.35, 0.75, 1), rough=0.65, spec=0.12)
        mat_player_accent = make_material("SYB_MAT_PlayerAccent", base_color=(0.95, 0.85, 0.2, 1), rough=0.6, spec=0.1)
        mat_player_skin = make_material("SYB_MAT_PlayerSkin", base_color=(0.93, 0.78, 0.62, 1), rough=0.6, spec=0.1)
        mat_player_glove = make_material("SYB_MAT_PlayerGlove", base_color=(0.42, 0.26, 0.14, 1), rough=0.8, spec=0.05)
        mat_batter_body = make_material("SYB_MAT_BatterBody", base_color=(0.65, 0.18, 0.18, 1), rough=0.6, spec=0.1)
        mat_batter_accent = make_material("SYB_MAT_BatterAccent", base_color=(0.95, 0.95, 0.95, 1), rough=0.5, spec=0.15)

        # ---- Ground
        grass_size = 120.0
        grass = add_plane("SYB_Grass", grass_size, grass_size, location=(0, 22, 0))
        assign_mat(grass, mat_grass)
        link_to_collection(grass, col_field)
        parent_to_root(grass, root_empty)
        shade(grass, False)

        patch = add_plane("SYB_GrassPatch", 78.0, 66.0, location=(6, 26, 0.001))
        assign_mat(patch, mat_grass2)
        link_to_collection(patch, col_field)
        parent_to_root(patch, root_empty)
        shade(patch, False)

        # ---- Bases
        p_home = (0, 0, 0)
        p_1b = (D, 0, 0)
        p_2b = (D, D, 0)
        p_3b = (0, D, 0)

        b1 = build_base("SYB_Base_1B", 0.381, 0.05, p_1b)
        b2 = build_base("SYB_Base_2B", 0.381, 0.05, p_2b)
        b3 = build_base("SYB_Base_3B", 0.381, 0.05, p_3b)
        hp = build_home_plate("SYB_HomePlate", 0.432, 0.045, p_home)
        for obj in (b1, b2, b3, hp):
            assign_mat(obj, mat_white)
            link_to_collection(obj, col_bases)
            parent_to_root(obj, root_empty)

        # ---- Mound + wear
        mound_center = (D / 2.0, D / 2.0, 0.0)
        mound = build_mound("SYB_Mound", mound_center, radius=1.05, height=0.18)
        assign_mat(mound, mat_dirt)
        link_to_collection(mound, col_mound)
        parent_to_root(mound, root_empty)

        wear_home = build_dirt_patch("SYB_Wear_Home", radius=1.25, location=(0.55, 0.65, 0.0), scale=(1.1, 1.5), z=0.002)
        assign_mat(wear_home, mat_dirt)
        link_to_collection(wear_home, col_mound)
        parent_to_root(wear_home, root_empty)

        wear_mound = build_dirt_patch("SYB_Wear_Mound", radius=0.7, location=(D / 2.0, D / 2.0, 0.0), scale=(1.2, 1.0), z=0.002)
        assign_mat(wear_mound, mat_dirt)
        link_to_collection(wear_mound, col_mound)
        parent_to_root(wear_mound, root_empty)

        wear_bases = []
        for idx, pos in enumerate((p_1b, p_2b, p_3b)):
            patch = build_dirt_patch(f"SYB_Wear_Base_{idx+1}", radius=0.6, location=(pos[0], pos[1], 0.0), scale=(1.1, 0.9), z=0.002)
            assign_mat(patch, mat_dirt)
            link_to_collection(patch, col_mound)
            parent_to_root(patch, root_empty)
            wear_bases.append(patch)

        # ---- Basepaths
        if self.include_basepaths:
            path_segments = [
                (p_home, p_1b),
                (p_1b, p_2b),
                (p_2b, p_3b),
                (p_3b, p_home),
            ]
            for i, (s, e) in enumerate(path_segments):
                strip = build_strip(f"SYB_Basepath_{i+1}", s, e, width=0.9, thickness=0.015, z=0.0045)
                if strip:
                    assign_mat(strip, mat_dirt)
                    link_to_collection(strip, col_field)
                    parent_to_root(strip, root_empty)

        # ---- Field markings
        if self.include_field_markings:
            fence_radius = 52.0
            foul_length = fence_radius * 1.08
            fl_1b = build_strip("SYB_FoulLine_1B", (0, 0, 0), (foul_length, 0, 0), width=0.20, thickness=0.012, z=0.007)
            fl_3b = build_strip("SYB_FoulLine_3B", (0, 0, 0), (0, foul_length, 0), width=0.20, thickness=0.012, z=0.007)
            for fl in (fl_1b, fl_3b):
                if fl:
                    assign_mat(fl, mat_line)
                    link_to_collection(fl, col_lines)
                    parent_to_root(fl, root_empty)

            box_w = 0.90
            box_h = 1.60
            bb1 = add_plane("SYB_BattersBox_L", box_w, box_h, location=(-0.95, 0.75, 0.0075))
            bb2 = add_plane("SYB_BattersBox_R", box_w, box_h, location=(0.95, 0.75, 0.0075))
            for bb in (bb1, bb2):
                assign_mat(bb, mat_line)
                link_to_collection(bb, col_lines)
                parent_to_root(bb, root_empty)
                shade(bb, False)

            catcher_box = add_plane("SYB_CatcherBox", 1.6, 1.2, location=(0.0, -0.9, 0.0075))
            assign_mat(catcher_box, mat_line)
            link_to_collection(catcher_box, col_lines)
            parent_to_root(catcher_box, root_empty)
            shade(catcher_box, False)

            ondeck = add_cylinder("SYB_OnDeck", radius=0.95, depth=0.01, location=(-3.2, 1.5, 0.008), verts=24)
            ondeck.scale.x = 1.25
            ondeck.scale.y = 1.05
            set_active(ondeck)
            bpy.ops.object.transform_apply(scale=True)
            assign_mat(ondeck, mat_line)
            link_to_collection(ondeck, col_lines)
            parent_to_root(ondeck, root_empty)
            shade(ondeck, True)

        # ---- Fence
        fence_obj, post_objs = build_outfield_fence(
            name="SYB_OutfieldFence",
            seed=self.random_seed,
            height=1.7,
            thickness=0.14,
        )
        if fence_obj:
            assign_mat(fence_obj, mat_fence)
            link_to_collection(fence_obj, col_fence)
            parent_to_root(fence_obj, root_empty)
            shade(fence_obj, True)
        for p in post_objs:
            assign_mat(p, mat_post)
            link_to_collection(p, col_fence)
            parent_to_root(p, root_empty)

        # ---- Backyard props
        if self.include_backyard_props:
            hedges = []
            hedges += build_hedge_row("SYB", start=(-10, 55, 0), end=(45, 60, 0), count=16, radius=0.55, height=1.15, seed=self.random_seed + 1)
            hedges += build_hedge_row("SYB", start=(45, 60, 0), end=(62, 40, 0), count=10, radius=0.55, height=1.15, seed=self.random_seed + 2)
            for h in hedges:
                assign_mat(h, mat_hedge)
                link_to_collection(h, col_props)
                parent_to_root(h, root_empty)

            pines = build_pine_cluster("SYB", center=(-40, 52), rows=2, cols=7, spacing=1.45, seed=self.random_seed + 3)
            for t in pines:
                assign_mat(t, mat_pine)
                link_to_collection(t, col_props)
                parent_to_root(t, root_empty)

            shed_body, shed_roof = build_shed("SYB_Shed", location=(38, 48, 0), size=(7.5, 5.6, 4.4))
            assign_mat(shed_body, mat_shed)
            assign_mat(shed_roof, mat_roof)
            link_to_collection(shed_body, col_props)
            link_to_collection(shed_roof, col_props)
            parent_to_root(shed_body, root_empty)
            parent_to_root(shed_roof, root_empty)

            pool_rim, pool_water = build_pool("SYB_Pool", location=(-34, 68, 0), size=(20.0, 13.0), lip=0.55)
            assign_mat(pool_rim, mat_pool_rim)
            assign_mat(pool_water, mat_water)
            link_to_collection(pool_rim, col_props)
            link_to_collection(pool_water, col_props)
            parent_to_root(pool_rim, root_empty)
            parent_to_root(pool_water, root_empty)

            roofs = build_roof_blocks("SYB_Roof", locations=((-58, -10, 0), (62, -18, 0)))
            roof2 = make_material("SYB_MAT_Roof2", base_color=(0.75, 0.18, 0.16, 1), rough=0.75, spec=0.12)
            for r in roofs:
                assign_mat(r, roof2)
                link_to_collection(r, col_props)
                parent_to_root(r, root_empty)

        # ---- Extra set dressing
        if self.include_extra_set_dressing:
            backstop_panel, backstop_posts = build_backstop("SYB_Backstop", location=(0, -6.8, 0))
            assign_mat(backstop_panel, mat_metal)
            link_to_collection(backstop_panel, col_extras)
            parent_to_root(backstop_panel, root_empty)
            for p in backstop_posts:
                assign_mat(p, mat_metal)
                link_to_collection(p, col_extras)
                parent_to_root(p, root_empty)

            board, legs = build_scoreboard("SYB_Scoreboard", location=(3.0, 56.5, 0))
            assign_mat(board, mat_board)
            link_to_collection(board, col_extras)
            parent_to_root(board, root_empty)
            for l in legs:
                assign_mat(l, mat_metal)
                link_to_collection(l, col_extras)
                parent_to_root(l, root_empty)

            bleachers = build_bleachers("SYB_Bleachers", location=(-18.0, 12.0, 0))
            for b in bleachers:
                assign_mat(b, mat_bench)
                link_to_collection(b, col_extras)
                parent_to_root(b, root_empty)

            picnic = build_picnic_table("SYB_Picnic", location=(28, 14, 0))
            for o in picnic:
                assign_mat(o, mat_bench)
                link_to_collection(o, col_extras)
                parent_to_root(o, root_empty)

            cooler_body, cooler_lid = build_cooler("SYB_Cooler", location=(26.9, 15.5, 0))
            assign_mat(cooler_body, mat_cooler)
            assign_mat(cooler_lid, mat_cooler)
            link_to_collection(cooler_body, col_extras)
            link_to_collection(cooler_lid, col_extras)
            parent_to_root(cooler_body, root_empty)
            parent_to_root(cooler_lid, root_empty)

            bike = build_bike("SYB_Bike", location=(-28, 12, 0))
            for o in bike:
                assign_mat(o, mat_metal)
                link_to_collection(o, col_extras)
                parent_to_root(o, root_empty)

            mailbox = build_mailbox("SYB_Mailbox", location=(-46, -12, 0))
            for o in mailbox:
                assign_mat(o, mat_mailbox)
                link_to_collection(o, col_extras)
                parent_to_root(o, root_empty)

            lamp = build_lamppost("SYB_Lamp", location=(22.0, 38.0, 0))
            for o in lamp:
                assign_mat(o, mat_lamp)
                link_to_collection(o, col_extras)
                parent_to_root(o, root_empty)

            extra_bench = build_bench("SYB_Bench", location=(20.0, 10.0, 0))
            for o in extra_bench:
                assign_mat(o, mat_bench)
                link_to_collection(o, col_extras)
                parent_to_root(o, root_empty)

            trash = build_trash_can("SYB_Trash", location=(-18.0, 6.0, 0))
            for o in trash:
                assign_mat(o, mat_trash)
                link_to_collection(o, col_extras)
                parent_to_root(o, root_empty)

            gate = build_garden_gate("SYB_Gate", location=(48.0, 18.0, 0))
            for o in gate:
                assign_mat(o, mat_gate)
                link_to_collection(o, col_extras)
                parent_to_root(o, root_empty)

            dandelions = build_dandelions("SYB_Dandelions", count=rnd.randint(80, 160), area=48.0, seed=self.random_seed + 5)
            assign_mat(dandelions, mat_dandelion)
            link_to_collection(dandelions, col_extras)
            parent_to_root(dandelions, root_empty)

        # ---- Anchors
        anchors = {
            "SYB_Anchor_Home": p_home,
            "SYB_Anchor_1B": p_1b,
            "SYB_Anchor_2B": p_2b,
            "SYB_Anchor_3B": p_3b,
            "SYB_Anchor_Mound": (D / 2.0, D / 2.0, 0.0),
            "SYB_Anchor_Batter": (0.0, -0.2, 0.0),
            "SYB_Anchor_Catcher": (0.0, -1.2, 0.0),
            "SYB_Anchor_1B_F": (D + 2.0, 1.0, 0.0),
            "SYB_Anchor_2B_F": (D - 2.0, D + 2.0, 0.0),
            "SYB_Anchor_SS_F": (2.0, D - 2.0, 0.0),
            "SYB_Anchor_3B_F": (-1.5, D + 1.5, 0.0),
            "SYB_Anchor_LF": (-12.0, 30.0, 0.0),
            "SYB_Anchor_CF": (9.0, 36.0, 0.0),
            "SYB_Anchor_RF": (30.0, 24.0, 0.0),
        }

        anchor_objs = {}
        for name, loc in anchors.items():
            e = add_empty(name, loc)
            link_to_collection(e, col_anchors)
            parent_to_root(e, root_empty)
            anchor_objs[name] = e

        aim_strike = add_empty("SYB_Aim_StrikeZone", (0.0, 1.2, 1.0))
        aim_mound = add_empty("SYB_Aim_Mound", (D / 2.0, D / 2.0, 1.2))
        for a in (aim_strike, aim_mound):
            link_to_collection(a, col_anchors)
            parent_to_root(a, root_empty)

        # ---- Players
        if self.include_players:
            field_mats = {
                "body": mat_player_body,
                "accent": mat_player_accent,
                "skin": mat_player_skin,
                "glove": mat_player_glove,
            }
            batter_mats = {
                "body": mat_batter_body,
                "accent": mat_batter_accent,
                "skin": mat_player_skin,
                "glove": mat_player_glove,
            }

            player_map = {
                "SYB_Player_Pitcher": ("SYB_Anchor_Mound", field_mats, False),
                "SYB_Player_Catcher": ("SYB_Anchor_Catcher", field_mats, False),
                "SYB_Player_1B": ("SYB_Anchor_1B_F", field_mats, False),
                "SYB_Player_2B": ("SYB_Anchor_2B_F", field_mats, False),
                "SYB_Player_SS": ("SYB_Anchor_SS_F", field_mats, False),
                "SYB_Player_3B": ("SYB_Anchor_3B_F", field_mats, False),
                "SYB_Player_LF": ("SYB_Anchor_LF", field_mats, False),
                "SYB_Player_CF": ("SYB_Anchor_CF", field_mats, False),
                "SYB_Player_RF": ("SYB_Anchor_RF", field_mats, False),
                "SYB_Player_Batter": ("SYB_Anchor_Batter", batter_mats, True),
            }

            for idx, (player_name, (anchor_name, mats, has_bat)) in enumerate(player_map.items()):
                anchor_obj = anchor_objs.get(anchor_name)
                if anchor_obj:
                    player = build_player(player_name, self.random_seed + idx, mats, location=anchor_obj.location, has_bat=has_bat)
                    link_to_collection(player, col_players)
                    parent_to_root(player, root_empty)
                    player.parent = anchor_obj

        # ---- Cameras
        cam_behind = add_camera(
            "SYB_Cam_BehindBatter",
            location=(0.0, -10.5, 2.1),
            target_obj=aim_mound,
            lens=45.0,
        )
        link_to_collection(cam_behind, col_extras)
        parent_to_root(cam_behind, root_empty)

        cam_strike = add_camera(
            "SYB_Cam_StrikeZoneHigh",
            location=(0.0, -4.6, 3.2),
            target_obj=aim_strike,
            lens=55.0,
        )
        link_to_collection(cam_strike, col_extras)
        parent_to_root(cam_strike, root_empty)

        cam_iso = add_camera(
            "SYB_Cam_Isometric",
            location=(-18.0, -18.0, 14.0),
            target_obj=aim_mound,
            lens=40.0,
        )
        link_to_collection(cam_iso, col_extras)
        parent_to_root(cam_iso, root_empty)

        if self.set_active_camera:
            if self.camera_view == "STRIKE_ZONE":
                context.scene.camera = cam_strike
            elif self.camera_view == "ISOMETRIC":
                context.scene.camera = cam_iso
            else:
                context.scene.camera = cam_behind

        # Optional: apply bevel modifiers pre-export
        if self.apply_bevel_mods:
            for o in bpy.data.objects:
                if o.name.startswith("SYB_") and o.type == "MESH":
                    apply_modifiers(o)

        self.report({"INFO"}, "SYB Plus field generated (retro neighborhood vibe + cameras).")
        return {"FINISHED"}


class SYB_OT_export_glb(bpy.types.Operator, ExportHelper):
    bl_idname = "syb.export_glb"
    bl_label = "Export SYB GLB"
    filename_ext = ".glb"
    filter_glob: bpy.props.StringProperty(default="*.glb", options={'HIDDEN'})

    def execute(self, context):
        root = bpy.data.objects.get("SYB_Root")
        if not root:
            self.report({"ERROR"}, "SYB_Root not found. Generate the field first.")
            return {"CANCELLED"}

        if context.scene.syb_apply_bevel_mods:
            for obj in root.children_recursive:
                if obj.type == "MESH":
                    apply_modifiers(obj)

        deselect_all()
        root.select_set(True)
        for child in root.children_recursive:
            child.select_set(True)

        bpy.ops.export_scene.gltf(
            filepath=self.filepath,
            export_format='GLB',
            export_apply=True,
            export_selected=True,
            use_visible=True,
            export_yup=True,
            export_materials='EXPORT',
        )

        self.report({"INFO"}, "Exported SYB GLB successfully.")
        return {"FINISHED"}


class SYB_PT_panel(bpy.types.Panel):
    bl_label = "Backyard Field"
    bl_idname = "SYB_PT_panel"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "Create"

    def draw(self, context):
        layout = self.layout
        layout.label(text="Stylized Youth Field (60 ft) + Cameras")

        layout.prop(context.scene, "syb_clear_existing")
        layout.prop(context.scene, "syb_include_props")
        layout.prop(context.scene, "syb_include_extras")
        layout.prop(context.scene, "syb_include_field_markings")
        layout.prop(context.scene, "syb_include_basepaths")
        layout.prop(context.scene, "syb_include_players")
        layout.prop(context.scene, "syb_random_seed")
        layout.prop(context.scene, "syb_apply_bevel_mods")

        layout.separator()
        layout.label(text="Cameras")
        layout.prop(context.scene, "syb_camera_view")
        layout.prop(context.scene, "syb_set_active_camera")

        op = layout.operator("syb.generate_field_plus", icon="MESH_GRID")
        op.clear_existing = getattr(context.scene, "syb_clear_existing", True)
        op.include_backyard_props = getattr(context.scene, "syb_include_props", True)
        op.include_extra_set_dressing = getattr(context.scene, "syb_include_extras", True)
        op.include_field_markings = getattr(context.scene, "syb_include_field_markings", True)
        op.include_basepaths = getattr(context.scene, "syb_include_basepaths", True)
        op.include_players = getattr(context.scene, "syb_include_players", True)
        op.random_seed = getattr(context.scene, "syb_random_seed", 7)
        op.apply_bevel_mods = getattr(context.scene, "syb_apply_bevel_mods", False)
        op.camera_view = getattr(context.scene, "syb_camera_view", "BEHIND_BATTER")
        op.set_active_camera = getattr(context.scene, "syb_set_active_camera", True)

        layout.separator()
        layout.operator("syb.export_glb", icon="EXPORT")


def register_scene_props():
    bpy.types.Scene.syb_clear_existing = bpy.props.BoolProperty(
        name="Clear Previous SYB Objects",
        default=True
    )
    bpy.types.Scene.syb_include_props = bpy.props.BoolProperty(
        name="Include Backyard Props",
        default=True
    )
    bpy.types.Scene.syb_include_extras = bpy.props.BoolProperty(
        name="Include Extra Set Dressing",
        default=True
    )
    bpy.types.Scene.syb_include_field_markings = bpy.props.BoolProperty(
        name="Include Field Markings",
        default=True
    )
    bpy.types.Scene.syb_include_basepaths = bpy.props.BoolProperty(
        name="Include Basepaths",
        default=True
    )
    bpy.types.Scene.syb_include_players = bpy.props.BoolProperty(
        name="Include Players",
        default=True
    )
    bpy.types.Scene.syb_random_seed = bpy.props.IntProperty(
        name="Random Seed",
        default=7,
        min=0,
        max=999999
    )
    bpy.types.Scene.syb_apply_bevel_mods = bpy.props.BoolProperty(
        name="Apply Bevel Modifiers",
        default=False
    )
    bpy.types.Scene.syb_camera_view = bpy.props.EnumProperty(
        name="Preferred Camera View",
        items=[
            ("BEHIND_BATTER", "Behind Batter", "Behind batter looking toward pitcher"),
            ("STRIKE_ZONE", "Strike Zone High", "Strike-zone style camera"),
            ("ISOMETRIC", "Isometric", "Cartoony isometric broadcast angle"),
        ],
        default="BEHIND_BATTER"
    )
    bpy.types.Scene.syb_set_active_camera = bpy.props.BoolProperty(
        name="Set Active Camera After Build",
        default=True
    )


def unregister_scene_props():
    for prop in (
        "syb_clear_existing",
        "syb_include_props",
        "syb_include_extras",
        "syb_include_field_markings",
        "syb_include_basepaths",
        "syb_include_players",
        "syb_random_seed",
        "syb_apply_bevel_mods",
        "syb_camera_view",
        "syb_set_active_camera",
    ):
        if hasattr(bpy.types.Scene, prop):
            delattr(bpy.types.Scene, prop)


classes = (
    SYB_OT_generate_field_plus,
    SYB_OT_export_glb,
    SYB_PT_panel,
)


def register():
    for c in classes:
        bpy.utils.register_class(c)
    register_scene_props()


def unregister():
    unregister_scene_props()
    for c in reversed(classes):
        bpy.utils.unregister_class(c)


if __name__ == "__main__":
    register()
