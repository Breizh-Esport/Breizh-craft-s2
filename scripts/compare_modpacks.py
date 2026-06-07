# -*- coding: utf-8 -*-
import json, os
from collections import defaultdict

BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

PACKS = [
    ("Mine",        "BreizhCraft S2 dev"),
    ("Aeronautics", "All of Create - Aeronautics"),
    ("BetterMC",    "Better MC [NEOFORGE] BMC5"),
    ("Craftoria",   "Craftoria"),
    ("ATM10",       "All the Mods 10 - ATM10"),
    ("Reimagined",  "Reimagined"),
]
OTHER = [p for p in PACKS if p[0] != "Mine"]

CAT = {
 393:"Resource Pack 16x",394:"Resource Pack 32x",395:"Resource Pack 64x",396:"Resource Pack 128x",
 397:"Resource Pack 256x",398:"Resource Pack 512x+",399:"RP Steampunk",400:"RP Photo Realistic",
 401:"RP Modern",402:"RP Medieval",403:"RP Traditional",404:"RP Animated",405:"RP Miscellaneous",
 406:"World Gen",407:"Biomes",408:"Ores and Resources",409:"Structures",410:"Dimensions",411:"Mobs",
 412:"Technology",413:"Processing",414:"Player Transport",415:"Energy/Fluid/Item Transport",
 416:"Farming",417:"Energy",418:"Genetics",419:"Magic",420:"Storage",421:"API and Library",
 422:"Adventure and RPG",423:"Map and Information",424:"Cosmetic",425:"Miscellaneous",426:"Addons",
 427:"Thermal Expansion",428:"Tinker's Construct",429:"Industrial Craft",430:"Thaumcraft",
 432:"Buildcraft",433:"Forestry",434:"Armor, Tools, and Weapons",435:"Server Utility",436:"Food",
 4485:"Blood Magic",4545:"Applied Energistics 2",4548:"Lucky Blocks",4549:"Guidebook",4550:"Quests",
 4551:"Hardcore Questing",4552:"Scripts",4553:"CraftTweaker",4558:"Redstone",4671:"Twitch Integration",
 4736:"Skyblock",4773:"CraftTweaker",4843:"Automation",4906:"MCreator",5128:"Vanilla+",5186:"FancyMenu",
 5191:"Utility & QoL",5193:"Data Packs",5232:"Galacticraft",5244:"Font Packs",5299:"Education",
 5314:"KubeJS",6145:"Skyblock",6484:"Create",6552:"Shaders",6553:"Shaders Realistic",6554:"Shaders Fantasy",
 6555:"Shaders Vanilla",6814:"Performance",6821:"Bug Fixes",6945:"Data Packs",6946:"Mod Support",
 6947:"Miscellaneous",6948:"Adventure",6949:"Fantasy",6950:"Library",6951:"Tech",6952:"Magic",
 6953:"Utility",6954:"Integrated Dynamics",7418:"Horror",7669:"Twilight Forest",8937:"ModJam 2025",
 9026:"CreativeMode",9049:"Refined Storage",10754:"Farmer's Delight",10775:"Horror",
}

def catname(cid):
    return CAT.get(cid, "Autre (%s)" % cid)

# addonID -> {name, cat, packs:set}
mods = {}
pack_ids = {}
for label, folder in PACKS:
    path = os.path.join(BASE, folder, "minecraftinstance.json")
    d = json.load(open(path, encoding="utf-8"))
    ids = set()
    for a in d.get("installedAddons", []):
        aid = a.get("addonID")
        if not aid:
            continue
        ids.add(aid)
        m = mods.setdefault(aid, {"name": (a.get("name") or "").strip(),
                                  "cat": a.get("primaryCategoryId"),
                                  "packs": set(),
                                  "url": a.get("webSiteURL") or ""})
        if not m["name"] and a.get("name"):
            m["name"] = a["name"].strip()
        m["packs"].add(label)
    pack_ids[label] = ids

mine = pack_ids["Mine"]

# ---- stats ----
lines = []
W = lines.append
W("# Comparaison des modlists — BreizhCraft S2 vs modpacks populaires\n")
W("> Genere automatiquement par `scripts/compare_modpacks.py` a partir des `minecraftinstance.json`.")
W("> Cle de comparaison : `addonID` (ID projet CurseForge), fiable meme si les noms varient.\n")

W("## Vue d'ensemble\n")
W("| Modpack | Total mods | En commun avec le mien | Absents de mon pack (candidats) |")
W("|---|---:|---:|---:|")
W("| **BreizhCraft S2 (le mien)** | %d | — | — |" % len(mine))
for label, _ in OTHER:
    ids = pack_ids[label]
    common = len(ids & mine)
    cand = len(ids - mine)
    W("| %s | %d | %d | %d |" % (label, len(ids), common, cand))
W("")

# union of candidates
candidates = set()
for label, _ in OTHER:
    candidates |= (pack_ids[label] - mine)
W("**%d mods uniques** apparaissent dans au moins un autre pack sans etre dans le mien.\n" % len(candidates))

# ---- candidates by category ----
W("## Mods candidats (presents ailleurs, absents chez moi)\n")
W("Trie par categorie puis par nombre de packs qui le possedent. Une coche = present dans ce pack.\n")

by_cat = defaultdict(list)
for aid in candidates:
    by_cat[catname(mods[aid]["cat"])].append(aid)

# order categories by total candidate count desc
cat_order = sorted(by_cat, key=lambda c: -len(by_cat[c]))
hdr = "| Mod | " + " | ".join(l for l, _ in OTHER) + " | # |"
sep = "|---|" + "|".join([":-:"] * len(OTHER)) + "|--:|"
for c in cat_order:
    aids = by_cat[c]
    # sort: more packs first, then name
    aids.sort(key=lambda a: (-len(mods[a]["packs"]), mods[a]["name"].lower()))
    W("### %s (%d)\n" % (c, len(aids)))
    W(hdr)
    W(sep)
    for aid in aids:
        m = mods[aid]
        name = m["name"].replace("|", "/")
        url = m["url"]
        disp = "[%s](%s)" % (name, url) if url else name
        cells = []
        n = 0
        for label, _ in OTHER:
            if label in m["packs"]:
                cells.append("X"); n += 1
            else:
                cells.append("")
        W("| %s | %s | %d |" % (disp, " | ".join(cells), n))
    W("")

# ---- mods unique to mine ----
only_mine = mine - candidates - set().union(*[pack_ids[l] for l, _ in OTHER])
# actually unique = in mine but in no other pack
others_union = set().union(*[pack_ids[l] for l, _ in OTHER])
only_mine = mine - others_union
W("## Mods exclusifs a mon pack (absents des 5 autres) — %d\n" % len(only_mine))
om_by_cat = defaultdict(list)
for aid in only_mine:
    om_by_cat[catname(mods[aid]["cat"])].append(aid)
for c in sorted(om_by_cat, key=lambda c: -len(om_by_cat[c])):
    names = sorted((mods[a]["name"] for a in om_by_cat[c]), key=str.lower)
    W("- **%s** : %s" % (c, ", ".join(names)))
W("")

out = os.path.join(BASE, "BreizhCraft S2 dev", "COMPARAISON_MODPACKS.md")
open(out, "w", encoding="utf-8").write("\n".join(lines))
print("written:", out)
print("candidates:", len(candidates), "| only mine:", len(only_mine))
