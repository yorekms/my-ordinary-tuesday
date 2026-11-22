#!/usr/bin/env python3
"""
Reusable 3-Tier Commercial-Book-Safe Visual Stock Harvester
for "How Not to Die on an Ordinary Tuesday".

Fills visual gaps for stories whose primary article has no CC BY / Public Domain
figure (e.g., paywalled, zero figures, or CC BY-NC/NC-ND link-out only):

  Tier 1 (primary):   Verified CC BY 3.0 / 4.0 / CC0 figure from the story's own cited PMC.
  Tier 2 (reference): Verified CC BY 3.0 / 4.0 / CC0 diagnostic figure from a separate
                      peer-reviewed Europe PMC Open Access case report / review showing
                      the EXACT same clinical mechanism (clearly labeled as illustrative).
  Tier 3 (hazard):    Verified Public Domain / CC0 / CC BY 3.0 / CC BY 4.0 real-world
                      photograph from Wikimedia Commons / CDC PHIL / NIH showing the
                      exact botanical, animal, microbial, or physical hazard.

STRICT COMMERCIAL BOOK COPYRIGHT FIREWALL:
  - ALLOWED ONLY: Public Domain (PD-USGov, CDC, NIH, PD-self, PD-old), CC0 1.0,
    CC BY 3.0, CC BY 4.0.
  - HARD-REJECTED: CC BY-SA (ShareAlike), CC BY-NC, CC BY-ND, GFDL, Fair Use,
    unknown/ambiguous licenses.

Usage:
  python3 scripts/harvest_reference_exhibits.py --out /tmp/staged_refs.json --contact-sheets /tmp/sheets
  python3 scripts/harvest_reference_exhibits.py --slugs slug1,slug2 --apply
"""

import argparse
import hashlib
import html
import io
import json
import re
import sys
import threading
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "scripts"))
import harvest_exhibits as he  # noqa: E402

EX_DIR = REPO_ROOT / "assets" / "exhibits"
UA_API = {"User-Agent": "OrdinaryTuesdayForensicArchive/3.0 (https://yorekms.github.io/my-ordinary-tuesday/; mailto:yorekms@gmail.com)"}

# Polite rate limiter for NCBI E-utilities (max ~2.8 req/s) & Wikimedia Commons
_ncbi_lock = threading.Lock()
_ncbi_last = 0.0
_wm_lock = threading.Lock()
_wm_last = 0.0


def _wait_ncbi():
    global _ncbi_last
    with _ncbi_lock:
        now = time.monotonic()
        gap = 0.36 - (now - _ncbi_last)
        if gap > 0:
            time.sleep(gap)
        _ncbi_last = time.monotonic()


def _wait_wm():
    global _wm_last
    with _wm_lock:
        now = time.monotonic()
        gap = 0.22 - (now - _wm_last)
        if gap > 0:
            time.sleep(gap)
        _wm_last = time.monotonic()


def _clean_html(txt):
    if not txt:
        return ""
    txt = re.sub(r"<[^>]+>", " ", txt)
    txt = html.unescape(txt)
    return re.sub(r"\s+", " ", txt).strip()


# ---------------------------------------------------------------------------
# Curated per-story search recipes:
#   mode: "pmc_primary" -> specific verified primary PMCID from story sources
#   mode: "epmc"        -> Europe PMC CC-BY peer-reviewed clinical reference
#   mode: "commons"     -> Wikimedia Commons PD / CC0 / CC-BY real-world hazard photo
# Each recipe can specify a fallback if the first mode finds no qualifying image.
# ---------------------------------------------------------------------------
CURATED_RECIPES = {
    # --- Missed Primary CC BY 4.0 recoveries ---
    "fractal-wood-burning": [
        {"mode": "pmc_primary", "pmcid": "PMC12491081", "must_match": r"lichtenberg|wood|burn|voltage"},
    ],
    "oil-on-the-wing-tea-tree": [
        {"mode": "pmc_primary", "pmcid": "PMC6995176", "must_match": r"fecal|biliverdin|green|cockatiel"},
    ],
    "pasture-that-stopped-the-fuel": [
        {"mode": "commons", "query": "Acer pseudoplatanus samara seeds helicopter", "must_match": r"acer|sycamore|maple|samara|seed|fruit"},
        {"mode": "epmc", "query": '"atypical myopathy" "Acer pseudoplatanus" horse', "must_match": r"acer|sycamore|seed|muscle|myopathy"},
    ],
    "meal-that-blocked-the-airway": [
        {"mode": "epmc", "query": '"foreign body" airway bronchoscopy OR CT food aspiration', "must_match": r"ct|radiograph|bronchoscop|airway|trachea|bronchus"},
    ],

    # --- GARAGE & HARDWARE ---
    "driveway-ied-truck-tire": [
        {"mode": "commons", "query": "truck wheel split rim tire assembly", "must_match": r"tire|tyre|wheel|rim|truck"},
        {"mode": "epmc", "query": '"tire explosion" OR "tyre blast" injury radiograph OR CT', "must_match": r"ct|radiograph|x-ray|fracture|blast"},
    ],
    "ottoman-bed-and-gravity": [
        {"mode": "epmc", "query": '"traumatic asphyxia" chest CT OR radiograph', "must_match": r"ct|radiograph|x-ray|chest|asphyx"},
    ],
    "generator-beyond-the-wall": [
        {"mode": "commons", "query": "portable gasoline generator outdoors", "must_match": r"generator|portable|power"},
        {"mode": "epmc", "query": '"carbon monoxide" "globus pallidus" MRI', "must_match": r"mri|globus pallidus|carbon monoxide|brain"},
    ],
    "blackened-silver-h2s-traps": [
        {"mode": "epmc", "query": '"hydrogen sulfide" poisoning brain MRI OR chest CT', "must_match": r"mri|ct|chest|brain|lung|hydrogen sulfide"},
    ],
    "live-burial-traps-skin-warnings": [
        {"mode": "epmc", "query": '"pancreatitis" "CT" necrotic OR "septic shock" CT', "must_match": r"ct|pancrea|abdomen|imaging"},
    ],
    "dust-that-outlasted-the-work": [
        {"mode": "epmc", "query": '"asbestos bodies" OR "pleural plaques" chest CT mesothelioma', "must_match": r"ct|pleural|asbestos|plaque|microscop|fiber"},
    ],
    "hammock-that-tightened": [
        {"mode": "epmc", "query": '"hypoxic-ischemic encephalopathy" brain MRI pediatric', "must_match": r"mri|brain|hypoxic|diffusion|dwi"},
    ],
    "lungs-that-did-not-complain-silica": [
        {"mode": "epmc", "query": '"engineered stone" silicosis chest CT "progressive massive fibrosis"', "must_match": r"ct|chest|silicos|fibrosis|nodule|lung"},
    ],
    "chest-that-could-not-move": [
        {"mode": "epmc", "query": '"traumatic asphyxia" OR "crush asphyxia" chest CT', "must_match": r"ct|chest|radiograph|lung|pneumothorax"},
    ],
    "shower-that-became-a-pool": [
        {"mode": "epmc", "query": '"drowning" pulmonary edema chest CT OR radiograph', "must_match": r"ct|radiograph|chest|edema|pulmonary"},
    ],
    "charger-between-phone-and-wall": [
        {"mode": "commons", "query": "USB wall charger power adapter teardown circuit", "must_match": r"charger|usb|adapter|power|circuit|plug"},
        {"mode": "epmc", "query": 'electrocution ECG OR "electrical injury" radiograph', "must_match": r"ecg|ekg|ct|radiograph|electrical"},
    ],
    "when-the-screen-fell-tv-tipover": [
        {"mode": "epmc", "query": '"skull fracture" CT pediatric blunt head trauma', "must_match": r"ct|skull|fracture|head|3d"},
    ],
    "current-left-no-mark-wet-voltage": [
        {"mode": "epmc", "query": '"ventricular fibrillation" ECG OR "electrical injury" ECG', "must_match": r"ecg|ekg|electrocardiog|fibrillation|rhythm"},
    ],
    "burn-that-stole-calcium-hf-acid": [
        {"mode": "epmc", "query": '"hydrofluoric acid" burn finger OR hand', "must_match": r"hydrofluoric|burn|finger|hand|nail|necrosis|ecg"},
    ],
    "lactate-that-was-not-lactate-antifreeze": [
        {"mode": "epmc", "query": '"ethylene glycol" "calcium oxalate" crystals urine microscopy', "must_match": r"oxalate|crystal|urine|microscop|polariz|ethylene"},
    ],
    "cloth-the-machine-caught-entanglement": [
        {"mode": "epmc", "query": '"laryngotracheal" OR "tracheal rupture" neck CT strangulation', "must_match": r"ct|trachea|larynx|neck|emphysema"},
    ],
    "nodules-before-sneezing-epoxy": [
        {"mode": "epmc", "query": '"epoxy resin" contact dermatitis OR granuloma skin', "must_match": r"dermatitis|granuloma|nodule|skin|forearm|patch|histolog"},
    ],
    "fume-left-different-record-welding": [
        {"mode": "epmc", "query": '"manganese" welder "globus pallidus" T1 MRI', "must_match": r"mri|globus pallidus|t1|manganese|hyperintens"},
    ],
    "pressure-after-the-shift-decompression": [
        {"mode": "epmc", "query": '"decompression sickness" "patent foramen ovale" MRI OR echocardiography', "must_match": r"mri|echo|bubble|foramen|spinal|brain|gas"},
    ],

    # --- KITCHEN & TABLE ---
    "wire-behind-the-pain": [
        {"mode": "epmc", "query": '"grill brush" OR "wire bristle" CT abdomen perforation', "must_match": r"ct|wire|bristle|radiograph|abdomen|linear|metallic"},
    ],
    "lunch-looked-like-allergy": [
        {"mode": "commons", "query": "Thunnus albacares yellowfin tuna fish market", "must_match": r"tuna|thunnus|mackerel|mahi|fish"},
        {"mode": "epmc", "query": '"scombroid" poisoning flushing OR histamine', "must_match": r"erythema|flushing|rash|scombroid"},
    ],
    "room-not-safe-to-finish": [
        {"mode": "epmc", "query": '"chlorine gas" OR "chloramine" bleach inhalation chest CT', "must_match": r"ct|chest|radiograph|lung|infiltration|edema|chlorine"},
    ],
    "licorice-tea-paralysis": [
        {"mode": "commons", "query": "Glycyrrhiza glabra licorice root dried", "must_match": r"glycyrrhiza|licorice|liquorice|root"},
        {"mode": "epmc", "query": 'licorice hypokalemia ECG "U wave" OR "QT prolongation"', "must_match": r"ecg|ekg|qt|hypokalemia"},
    ],
    "wild-garlic-deadly-twin": [
        {"mode": "commons", "query": "Colchicum autumnale leaves autumn crocus", "must_match": r"colchicum|crocus|autumnale|leaf|leaves"},
        {"mode": "commons", "query": "Colchicum autumnale flower", "must_match": r"colchicum|crocus"},
    ],
    "reheated-rice-and-botulism": [
        {"mode": "commons", "query": "Clostridium botulinum CDC PHIL photomicrograph", "must_match": r"botulinum|clostridium|cdc|phil|bacillus"},
        {"mode": "commons", "query": "Bacillus cereus micrograph", "must_match": r"bacillus|cereus|gram|micrograph"},
    ],
    "durian-rum-and-auto-brewery": [
        {"mode": "commons", "query": "Durio zibethinus durian fruit open", "must_match": r"durian|durio|fruit"},
    ],
    "small-stick-persistent-pain": [
        {"mode": "epmc", "query": 'toothpick perforation liver CT abdomen', "must_match": r"ct|toothpick|liver|abscess|linear|foreign"},
    ],
    "glaze-in-the-pitcher-citrus-lead": [
        {"mode": "epmc", "query": '"lead poisoning" "basophilic stippling" peripheral blood smear', "must_match": r"stippling|smear|blood|erythrocyte|lead|radiograph"},
        {"mode": "commons", "query": "traditional glazed earthenware ceramic pitcher pottery", "must_match": r"ceramic|pitcher|pottery|jug|glazed"},
    ],
    "when-ice-water-burns-ciguatera": [
        {"mode": "commons", "query": "Sphyraena barracuda reef fish underwater", "must_match": r"barracuda|sphyraena|reef|fish"},
    ],
    "black-sea-mad-honey-bradycardia": [
        {"mode": "commons", "query": "Rhododendron ponticum flowers", "must_match": r"rhododendron|ponticum|flower"},
        {"mode": "epmc", "query": '"mad honey" bradycardia ECG', "must_match": r"ecg|ekg|bradycardia|av block|sinus"},
    ],
    "monkshood-aconitine-channel-lock": [
        {"mode": "commons", "query": "Aconitum napellus monkshood flower", "must_match": r"aconitum|napellus|monkshood|wolfsbane"},
    ],
    "toxin-reheating-could-not-undo-cereulide": [
        {"mode": "commons", "query": "Bacillus cereus Gram stain CDC", "must_match": r"bacillus|cereus|gram|bacteria|spores"},
        {"mode": "epmc", "query": '"Bacillus cereus" cereulide liver CT OR microscopy', "must_match": r"bacillus|cereus|liver|ct|microscop"},
    ],
    "eggs-carried-yards-history-lead": [
        {"mode": "epmc", "query": '"basophilic stippling" lead toxicity blood smear', "must_match": r"stippling|blood|smear|lead|microscop"},
        {"mode": "commons", "query": "backyard chicken eggs basket hen", "must_match": r"egg|chicken|hen"},
    ],

    # --- MEDICINE CABINET ---
    "sleep-aids-caffeine-nitrous": [
        {"mode": "epmc", "query": '"nitrous oxide" "subacute combined degeneration" cervical spine MRI', "must_match": r"mri|cervical|spinal|cord|inverted v|dorsal|nitrous"},
    ],
    "ten-year-prescription-airway": [
        {"mode": "epmc", "query": '"ACE inhibitor" angioedema tongue OR airway CT', "must_match": r"angioedema|tongue|airway|ct|swelling|laryn"},
    ],
    "bottle-that-wasnt-a-feed": [
        {"mode": "epmc", "query": '"hyponatremia" "cerebral edema" brain CT OR MRI', "must_match": r"ct|mri|edema|brain|sulci|cerebral"},
    ],
    "heart-medicine-and-ketones": [
        {"mode": "epmc", "query": '"euglycemic diabetic ketoacidosis" SGLT2 ECG OR CT', "must_match": r"ecg|ct|ketoacidosis|anion|radiograph"},
    ],
    "laundry-pod-unhurt-mouth": [
        {"mode": "epmc", "query": '"laundry detergent" pod esophageal endoscopy OR airway', "must_match": r"endoscop|esophag|laryn|airway|edema|ulcer|caustic"},
    ],
    "meth-gut-infarction-rubbing-alcohol": [
        {"mode": "epmc", "query": '"non-occlusive mesenteric ischemia" bowel CT pneumatosis', "must_match": r"ct|bowel|ischemia|pneumatosis|mesenteric"},
    ],
    "silent-push-pin-choking-maternal": [
        {"mode": "epmc", "query": '"foreign body" aspiration pushpin OR pin chest radiograph CT', "must_match": r"radiograph|x-ray|ct|pin|bronchus|airway|trachea"},
    ],
    "night-that-was-not-sleep": [
        {"mode": "epmc", "query": '"opioid overdose" OR "aspiration pneumonia" chest radiograph CT', "must_match": r"ct|radiograph|chest|aspiration|edema|brain"},
    ],
    "level-that-looked-reassuring-valproate": [
        {"mode": "epmc", "query": '"valproate-induced hyperammonemic encephalopathy" brain MRI OR EEG', "must_match": r"mri|eeg|brain|valproate|hyperammon|cortex"},
    ],
    "shared-root-in-two-prescriptions": [
        {"mode": "epmc", "query": '"torsades de pointes" ECG hypokalemia licorice', "must_match": r"ecg|ekg|torsades|qt|polymorphic|ventricular"},
    ],
    "new-antibiotic-slowing-heart": [
        {"mode": "epmc", "query": '"BRASH syndrome" ECG hyperkalemia bradycardia', "must_match": r"ecg|ekg|bradycardia|hyperkalemia|block|junctional"},
    ],
    "battery-already-in-the-stomach": [
        {"mode": "epmc", "query": '"button battery" esophagus radiograph "double rim" OR "halo sign"', "must_match": r"radiograph|x-ray|battery|halo|double|esophag|chest"},
    ],
    "hot-baths-fentanyl-patches-deadly": [
        {"mode": "commons", "query": "transdermal fentanyl patch medical", "must_match": r"fentanyl|patch|transdermal"},
        {"mode": "epmc", "query": '"fentanyl patch" toxicity OR overdose radiograph OR MRI', "must_match": r"fentanyl|patch|mri|ct|radiograph"},
    ],
    "sleep-aid-and-dark-urine-doxylamine": [
        {"mode": "epmc", "query": 'rhabdomyolysis "dark urine" OR "tea-colored urine" myoglobinuria', "must_match": r"urine|myoglobin|rhabdomyol|mri|muscle"},
    ],
    "overdose-that-hadnt-arrived-bupropion": [
        {"mode": "epmc", "query": 'bupropion overdose ECG QRS OR "pharmacobezoar" CT', "must_match": r"ecg|ekg|qrs|ct|bezoar|bupropion"},
    ],
    "level-that-rose-after-last-pill": [
        {"mode": "epmc", "query": 'clarithromycin colchicine OR tacrolimus toxicity ECG OR MRI', "must_match": r"ecg|mri|ct|radiograph|toxicity"},
    ],
    "antidepressant-opioid-screen-missed": [
        {"mode": "epmc", "query": 'tianeptine OR opioid toxicity ECG OR brain MRI', "must_match": r"ecg|mri|ct|opioid|tianeptine"},
    ],
    "poppy-seed-bagel-and-kratom-loophole": [
        {"mode": "commons", "query": "Mitragyna speciosa kratom leaves", "must_match": r"mitragyna|speciosa|kratom|leaf|leaves"},
    ],
    "gas-station-royal-honey-blue-vision": [
        {"mode": "epmc", "query": 'sildenafil retinopathy OCT OR fundus', "must_match": r"oct|fundus|retina|macula|sildenafil|vision"},
    ],
    "remedy-that-left-a-mark-in-dna": [
        {"mode": "commons", "query": "Aristolochia clematitis flower plant", "must_match": r"aristolochia|birthwort|flower|plant"},
        {"mode": "epmc", "query": '"aristolochic acid" nephropathy renal biopsy', "must_match": r"biopsy|renal|kidney|fibrosis|tubul|aristoloch"},
    ],
    "why-common-diabetes-pills-turn-deadly": [
        {"mode": "epmc", "query": '"metformin-associated lactic acidosis" brain MRI OR CT', "must_match": r"mri|ct|lentiform|basal ganglia|metformin|acidosis"},
    ],
    "vitamin-brain-could-not-spare-wernicke": [
        {"mode": "epmc", "query": '"Wernicke encephalopathy" MRI "medial thalami" OR "mammillary"', "must_match": r"mri|thalam|mammillary|periaqueduct|wernicke|flair"},
    ],
    "antibody-and-falling-glucose-ias": [
        {"mode": "epmc", "query": '"insulin autoimmune syndrome" Hirata continuous glucose monitoring OR pancreas CT', "must_match": r"glucose|cgm|ct|pancreas|insulin|hirata"},
    ],
    "vitamin-that-left-crystals-oxalate": [
        {"mode": "epmc", "query": '"oxalate nephropathy" vitamin C renal biopsy polarized light crystals', "must_match": r"oxalate|crystal|polariz|biopsy|renal|tubul"},
    ],

    # --- OUTDOORS & WATER ---
    "spin-class-rhabdo": [
        {"mode": "epmc", "query": '"spin class" OR "exertional rhabdomyolysis" thigh MRI quadriceps', "must_match": r"mri|thigh|quadriceps|muscle|edema|rhabdomyol"},
    ],
    "meal-and-the-match": [
        {"mode": "epmc", "query": '"wheat-dependent exercise-induced anaphylaxis" urticaria OR skin prick', "must_match": r"urticaria|wheal|skin|rash|anaphylaxis"},
    ],
    "boots-in-the-snow-and-heatstroke": [
        {"mode": "epmc", "query": '"exertional heat stroke" cerebellum MRI OR brain MRI', "must_match": r"mri|cerebell|brain|heat stroke|hyperintens"},
    ],
    "shark-strikes-car-jacks-pepper-myths": [
        {"mode": "commons", "query": "Carcharodon carcharias great white shark", "must_match": r"shark|carcharodon|great white"},
    ],
    "lesson-after-the-rescue-drowning": [
        {"mode": "epmc", "query": '"near-drowning" OR "submersion injury" chest radiograph pulmonary edema', "must_match": r"radiograph|x-ray|ct|chest|edema|pulmonary|infiltrat"},
    ],
    "awn-beside-the-heart": [
        {"mode": "commons", "query": "Hordeum murinum foxtail grass awn spikelet", "must_match": r"hordeum|foxtail|awn|grass|barley|spike"},
        {"mode": "epmc", "query": '"grass awn" migration dog CT thorax OR pericarditis', "must_match": r"ct|awn|thorax|pericard|radiograph|ultrasound"},
    ],
    "van-that-was-not-empty": [
        {"mode": "epmc", "query": '"vehicular heatstroke" OR "heat stroke" brain CT OR MRI', "must_match": r"ct|mri|brain|edema|heat"},
    ],
    "step-that-kept-moving-escalator": [
        {"mode": "commons", "query": "escalator comb plate metal steps close up", "must_match": r"escalator|step|comb|stairs"},
    ],
    "thread-across-the-road-kite-string": [
        {"mode": "commons", "query": "kite flying spool string manja", "must_match": r"kite|spool|string|manja|charkhi"},
    ],
    "pool-had-another-hazard-drain-suction": [
        {"mode": "commons", "query": "swimming pool main drain cover underwater", "must_match": r"pool|drain|cover|grate|swimming"},
    ],

    # --- ER & HOSPITAL FAKEOUTS ---
    "testicular-torsion-doppler": [
        {"mode": "epmc", "query": '"testicular torsion" color Doppler ultrasound absent flow', "must_match": r"doppler|ultrasound|sonograph|testic|flow|torsion"},
    ],
    "fall-beneath-the-scalp": [
        {"mode": "epmc", "query": '"Jefferson fracture" C1 burst fracture cervical CT', "must_match": r"ct|c1|atlas|jefferson|fracture|cervical"},
    ],
    "migrating-heart-valves-air-sprays": [
        {"mode": "epmc", "query": '"aortic dissection" CT angiography intimal flap', "must_match": r"ct|angiog|aort|dissection|flap|lumen"},
    ],
    "umbrella-methylmercury-forensic-mimics": [
        {"mode": "epmc", "query": '"subdural hematoma" OR "methylmercury" brain MRI calcarine', "must_match": r"mri|ct|brain|hematoma|mercury|calcarine"},
    ],
    "signal-in-the-vessel-wall": [
        {"mode": "epmc", "query": '"septic encephalopathy" OR "sepsis" brain MRI white matter', "must_match": r"mri|brain|sepsis|encephalopathy|flair|dwi"},
    ],
    "lesion-that-needed-a-name": [
        {"mode": "epmc", "query": '"squamous cell carcinoma" skull invasion CT', "must_match": r"ct|mri|skull|bone|erosion|carcinoma"},
    ],
    "headache-needed-second-question": [
        {"mode": "commons", "query": "Cryptococcus neoformans India ink CDC PHIL", "must_match": r"cryptococcus|neoformans|india ink|cdc|capsule"},
        {"mode": "epmc", "query": '"Cryptococcus neoformans" meningitis India ink OR brain MRI', "must_match": r"cryptococc|india ink|mri|brain|capsule"},
    ],
    "tests-that-would-not-agree": [
        {"mode": "epmc", "query": '"thoracic aortic aneurysm" rupture CT angiography', "must_match": r"ct|aort|aneurysm|rupture|hemothorax|angiog"},
    ],
    "test-beyond-the-scan-porphyria": [
        {"mode": "epmc", "query": '"acute intermittent porphyria" urine sunlight dark color', "must_match": r"urine|porphyria|red|dark|brown|sunlight|mri"},
    ],
    "sleepiness-began-in-the-bowel": [
        {"mode": "epmc", "query": '"ileocolic intussusception" ultrasound "target sign"', "must_match": r"ultrasound|sonograph|target|intussusception|doughnut"},
    ],
    "lithium-that-came-from-the-tube": [
        {"mode": "commons", "query": "vacutainer blood collection tubes green top lithium heparin", "must_match": r"vacutainer|blood|tube|heparin|collection"},
    ],
    "test-with-a-smaller-target-legionella": [
        {"mode": "epmc", "query": '"Legionella" pneumonia chest CT consolidation', "must_match": r"ct|chest|radiograph|legionella|pneumonia|consolidation"},
    ],
    "count-and-unfinished-recovery-ttp": [
        {"mode": "epmc", "query": '"thrombotic thrombocytopenic purpura" schistocytes peripheral blood smear', "must_match": r"schistocyte|smear|blood|fragment|microscop|ttp"},
    ],
    "twisted-stomachs-button-batteries-sleep-off": [
        {"mode": "epmc", "query": '"gastric volvulus" CT OR radiograph "double bubble"', "must_match": r"ct|radiograph|x-ray|volvulus|gastric|stomach"},
    ],
    "potassium-that-rose-in-the-tube": [
        {"mode": "epmc", "query": '"chronic lymphocytic leukemia" "smudge cells" peripheral blood smear', "must_match": r"smudge|smear|lymphocyte|blood|cll|microscop"},
    ],
    "piece-the-camera-couldnt-see-eoe": [
        {"mode": "epmc", "query": '"eosinophilic esophagitis" endoscopy trachealization OR biopsy', "must_match": r"endoscop|esophag|ring|furrow|eosinophil|biopsy"},
    ],
    "anesthetic-that-triggered-the-furnace": [
        {"mode": "epmc", "query": '"malignant hyperthermia" capnography ETCO2 OR muscle biopsy', "must_match": r"capnog|etco2|biopsy|hyperthermia|muscle|ecg"},
    ],
    "metallic-taste-before-cardiac-arrest": [
        {"mode": "epmc", "query": '"local anesthetic systemic toxicity" bupivacaine ECG', "must_match": r"ecg|ekg|bupivacaine|qrs|arrhythmia|ventricular"},
    ],
    "cherry-red-blood-and-burgundy-antidote": [
        {"mode": "epmc", "query": '"hydroxocobalamin" purple OR red urine cyanide poisoning', "must_match": r"hydroxocobalamin|urine|red|purple|cyanide|ct|mri"},
    ],
    "flush-behind-falling-count-hit": [
        {"mode": "epmc", "query": '"heparin-induced thrombocytopenia" thrombosis CT pulmonary embolism OR DVT', "must_match": r"ct|thromb|embol|ultrasound|clot|hit"},
    ],
    "blood-concentrated-lungs-filled-capillary-leak": [
        {"mode": "epmc", "query": '"hantavirus pulmonary syndrome" chest radiograph pulmonary edema', "must_match": r"radiograph|x-ray|ct|chest|edema|hantavirus|pulmonary"},
    ],
    "family-behind-the-enzyme-g6pd": [
        {"mode": "epmc", "query": '"G6PD deficiency" "bite cells" OR "Heinz bodies" blood smear', "must_match": r"bite cell|heinz|smear|blood|g6pd|blister|hemoly"},
    ],
    "infection-culture-could-not-grow": [
        {"mode": "epmc", "query": '"Coxiella burnetii" "Q fever" endocarditis echocardiography OR PET-CT', "must_match": r"echo|ct|pet|valve|vegetation|endocarditis|aortic"},
    ],

    # --- PETS & LIVESTOCK ---
    "bouquet-and-silent-bladder": [
        {"mode": "commons", "query": "Lilium longiflorum Easter lily flower stamen pollen", "must_match": r"lilium|lily|flower|pollen|stamen"},
    ],
    "dog-flea-drops-on-kitten": [
        {"mode": "epmc", "query": 'permethrin toxicosis cat tremor OR radiograph', "must_match": r"cat|feline|permethrin|radiograph|ultrasound|eeg"},
        {"mode": "commons", "query": "domestic kitten close up cat", "must_match": r"kitten|cat|felis"},
    ],
    "gum-and-second-emergency": [
        {"mode": "epmc", "query": 'xylitol toxicosis dog liver ultrasound OR histopathology', "must_match": r"liver|ultrasound|hepatic|xylitol|dog|canine"},
        {"mode": "commons", "query": "chewing gum blister pack xylitol", "must_match": r"gum|xylitol|chewing"},
    ],
    "bone-that-would-not-pass": [
        {"mode": "epmc", "query": 'dog esophageal bone foreign body thoracic radiograph', "must_match": r"radiograph|x-ray|esophag|bone|thorac|dog|canine"},
    ],
    "blockage-in-the-less-likely-cat": [
        {"mode": "epmc", "query": 'feline urethral obstruction urolith radiograph bladder', "must_match": r"radiograph|x-ray|urethra|urolith|stone|bladder|cat|feline"},
    ],
    "danger-after-the-puppy-woke": [
        {"mode": "epmc", "query": '"neurogenic pulmonary edema" dog thoracic radiograph', "must_match": r"radiograph|x-ray|thorac|pulmonary|edema|lung|dog|canine"},
    ],
    "illness-after-the-mushroom": [
        {"mode": "commons", "query": "Amanita phalloides death cap mushroom", "must_match": r"amanita|phalloides|mushroom|death cap"},
    ],
    "preparation-that-changed-the-blood": [
        {"mode": "epmc", "query": 'sodium phosphate enema hypocalcemia ECG OR radiograph cat dog', "must_match": r"radiograph|ecg|ultrasound|colon|phosphate|hypocalc"},
    ],
    "quiet-gut-silent-blood-flow-rabbit": [
        {"mode": "epmc", "query": '"liver lobe torsion" rabbit ultrasound OR CT', "must_match": r"ultrasound|ct|radiograph|liver|lobe|torsion|rabbit"},
    ],
    "puppy-with-the-twisted-stomach-gdv": [
        {"mode": "epmc", "query": '"gastric dilatation-volvulus" dog radiograph double bubble', "must_match": r"radiograph|x-ray|gastric|volvulus|dilatation|gdv|stomach|dog"},
    ],
    "super-rat-bait-and-vitamin-k-trap": [
        {"mode": "epmc", "query": 'anticoagulant rodenticide hemothorax dog thoracic radiograph', "must_match": r"radiograph|x-ray|hemothorax|pleural|effusion|rodenticide|dog"},
    ],
    "seizure-between-normal-days-ferret": [
        {"mode": "commons", "query": "Mustela putorius furo domestic ferret", "must_match": r"ferret|mustela|putorius"},
    ],
    "cream-reached-blood-zinc-oxide-dog": [
        {"mode": "epmc", "query": '"zinc toxicosis" dog "Heinz bodies" blood smear OR radiograph', "must_match": r"radiograph|x-ray|heinz|smear|blood|zinc|dog|stomach"},
    ],
    "discharge-not-ending-iron-edta-dog": [
        {"mode": "epmc", "query": 'iron toxicosis dog abdominal radiograph pellets OR stomach', "must_match": r"radiograph|x-ray|stomach|iron|gastric|dog|pellet"},
    ],
    "bird-and-falling-blood-count-avian": [
        {"mode": "epmc", "query": 'avian anemia parrot blood smear OR radiograph', "must_match": r"radiograph|x-ray|smear|blood|avian|parrot|bird|ct"},
    ],
    "ration-and-racing-heart-monensin-horse": [
        {"mode": "epmc", "query": 'monensin toxicosis horse echocardiography OR myocardium', "must_match": r"echo|ecg|myocard|heart|horse|equine|monensin"},
    ],
    "water-around-and-within-axolotl": [
        {"mode": "commons", "query": "Ambystoma mexicanum axolotl aquarium", "must_match": r"axolotl|ambystoma|mexicanum"},
    ],
    "stone-not-the-whole-illness-tortoise": [
        {"mode": "epmc", "query": 'tortoise urolith bladder stone radiograph', "must_match": r"radiograph|x-ray|urolith|stone|calculus|tortoise|ct"},
    ],

    # --- Wave 7 gaps (if primary lacked CC-BY photo or was flowchart) ---
    "hazard-along-winter-shore-dog": [
        {"mode": "commons", "query": "cyanobacteria blue-green algae bloom water shore", "must_match": r"algae|cyanobacteria|bloom|water|shore"},
    ],
    "cataract-pointed-beyond-the-eye": [
        {"mode": "epmc", "query": 'bilateral cataract slit-lamp young adult genetic', "must_match": r"cataract|lens|slit-lamp|anterior|eye|oct"},
    ],
    "worm-in-lungs-blood-supply-dog": [
        {"mode": "epmc", "query": '"Dirofilaria immitis" OR "Angiostrongylus vasorum" dog thoracic radiograph OR echocardiography', "must_match": r"radiograph|x-ray|echo|pulmonary|artery|worm|heartworm|ct|dog"},
    ],
}


def search_epmc_ccby(query, must_match_re=None, max_papers=10):
    """Search Europe PMC Open Access strictly for CC BY articles and verify via NCBI JATS XML."""
    full_q = f'OPEN_ACCESS:y AND LICENSE:("cc by") AND ({query})'
    params = urllib.parse.urlencode({
        "query": full_q,
        "format": "json",
        "pageSize": str(max_papers),
        "resultType": "lite",
    })
    url = f"https://www.ebi.ac.uk/europepmc/webservices/rest/search?{params}"
    raw = urllib.request.urlopen(urllib.request.Request(url, headers=UA_API), timeout=20).read().decode("utf-8", "replace")
    data = json.loads(raw)
    results = data.get("resultList", {}).get("result", [])

    rx = re.compile(must_match_re, re.I) if must_match_re else None
    best = None

    for item in results:
        pmcid = item.get("pmcid")
        if not pmcid or pmcid in he.IGNORE_PMCS:
            continue
        try:
            _wait_ncbi()
            meta = he.inspect_pmc_article(pmcid)
        except Exception:
            continue
        if not meta["commercial_safe"]:
            continue
        # Double-check zero SA / NC / ND
        lic_low = (meta["license"] + " " + meta["licenseUrl"]).lower()
        if any(bad in lic_low for bad in ("by-sa", "by-nc", "-nd", "noncommercial", "sharealike")):
            continue

        for fig in meta["figs"]:
            if fig["score"] < 15:
                continue
            if rx and not rx.search(fig["caption"]):
                continue
            cand_score = fig["score"]
            # Prefer crisp radiology / ECG / ultrasound / microscopy over messy collages
            if not he.should_blur(fig["caption"]):
                cand_score += 8
            if best is None or cand_score > best[0]:
                best = (cand_score, meta, fig)
        if best and best[0] >= 55:
            break

    if not best:
        return None

    _, meta, fig = best
    pmcid = meta["pmcid"]
    try:
        by_stem, all_urls = he.fetch_pmc_cdn_map(pmcid)
    except Exception:
        return None

    href = fig["href"]
    href_stem = href.rsplit("/", 1)[-1].rsplit(".", 1)[0].lower()
    img_url = by_stem.get(href.lower()) or by_stem.get(href_stem)
    if not img_url:
        for u in all_urls:
            if href_stem in u.lower():
                img_url = u
                break
    if not img_url:
        return None

    safe_name = re.sub(r"[^a-zA-Z0-9_\-\.]", "_", f"REF_{pmcid}_{href_stem}") + ".jpg"
    dest = EX_DIR / safe_name
    sz, dims = he.download_and_optimize_image(img_url, dest)
    if not sz:
        return None

    cap_clean = re.sub(r"\s+", " ", fig["caption"]).strip()
    if len(cap_clean) > 290:
        cap_clean = cap_clean[:287].rsplit(" ", 1)[0] + "…"
    blur = he.should_blur(cap_clean)
    base_code = he.classify_code(cap_clean).replace("EXHIBIT A · ", "")
    spoiler = (
        "Illustrative peer-reviewed clinical exhibit from a separate CC BY report showing the same mechanism (not the index patient). Contains graphic medical photography—click to unseal."
        if blur else
        "Illustrative peer-reviewed imaging/diagnostic exhibit from a separate CC BY report showing the same mechanism (not the index patient)."
    )
    return {
        "tier": "reference",
        "exhibitCode": f"REFERENCE EXHIBIT · {base_code}",
        "src": f"assets/exhibits/{safe_name}",
        "caption": cap_clean,
        "spoilerNote": spoiler,
        "blurredByDefault": blur,
        "citation": f"{fig['label']} from {meta['author']} et al. ({meta['year']}), {meta['journal']} · {pmcid} (Reference Case)",
        "license": meta["license"],
        "licenseUrl": meta["licenseUrl"].replace("http://", "https://"),
        "sourceUrl": f"https://pmc.ncbi.nlm.nih.gov/articles/{pmcid}/",
        "dims": list(dims),
        "bytes": sz,
    }


def harvest_primary_pmc_direct(pmcid, must_match_re=None):
    """Direct Tier-1 primary PMC recovery for stories whose own cited PMC has CC BY figures."""
    _wait_ncbi()
    meta = he.inspect_pmc_article(pmcid)
    if not meta["commercial_safe"]:
        return None
    rx = re.compile(must_match_re, re.I) if must_match_re else None
    cands = [f for f in meta["figs"] if f["score"] > 0 and (not rx or rx.search(f["caption"]))]
    if not cands:
        cands = [f for f in meta["figs"] if f["score"] > 0]
    if not cands:
        return None
    cands.sort(key=lambda x: x["score"], reverse=True)
    fig = cands[0]

    by_stem, all_urls = he.fetch_pmc_cdn_map(pmcid)
    href = fig["href"]
    href_stem = href.rsplit("/", 1)[-1].rsplit(".", 1)[0].lower()
    img_url = by_stem.get(href.lower()) or by_stem.get(href_stem)
    if not img_url:
        for u in all_urls:
            if href_stem in u.lower():
                img_url = u
                break
    if not img_url:
        return None

    safe_name = re.sub(r"[^a-zA-Z0-9_\-\.]", "_", f"{pmcid}_{href_stem}") + ".jpg"
    dest = EX_DIR / safe_name
    sz, dims = he.download_and_optimize_image(img_url, dest)
    if not sz:
        return None

    cap_clean = re.sub(r"\s+", " ", fig["caption"]).strip()
    if len(cap_clean) > 290:
        cap_clean = cap_clean[:287].rsplit(" ", 1)[0] + "…"
    blur = he.should_blur(cap_clean)
    return {
        "tier": "primary",
        "exhibitCode": he.classify_code(cap_clean),
        "src": f"assets/exhibits/{safe_name}",
        "caption": cap_clean,
        "spoilerNote": he.make_spoiler_note(cap_clean, blur),
        "blurredByDefault": blur,
        "citation": f"{fig['label']} from {meta['author']} et al. ({meta['year']}), {meta['journal']} · {pmcid}",
        "license": meta["license"],
        "licenseUrl": meta["licenseUrl"].replace("http://", "https://"),
        "sourceUrl": f"https://pmc.ncbi.nlm.nih.gov/articles/{pmcid}/",
        "dims": list(dims),
        "bytes": sz,
    }


def _verify_commons_commercial_license(extmeta):
    """
    HARD COMMERCIAL COPYRIGHT GATE for Wikimedia Commons.
    ALLOWS ONLY: Public Domain (PD*), CC0 1.0, CC BY 4.0, CC BY 3.0.
    REJECTS: CC BY-SA, CC BY-NC, CC BY-ND, GFDL, Fair Use, Copyrighted, Unknown.
    Returns (lic_label, lic_url) or (None, None).
    """
    short = _clean_html((extmeta.get("LicenseShortName") or {}).get("value", ""))
    lurl = _clean_html((extmeta.get("LicenseUrl") or {}).get("value", ""))
    lname = _clean_html((extmeta.get("License") or {}).get("value", ""))
    combined = f"{short} {lname} {lurl}".lower()

    # Hard-reject viral ShareAlike, Non-Commercial, NoDerivs, GFDL, Fair Use, Copyrighted
    reject_tokens = ("by-sa", "sharealike", "share-alike", "by-nc", "noncommercial", "-nd", "noderiv", "gfdl", "fair use", "copyrighted", "fal", "art libre")
    if any(tok in combined for tok in reject_tokens):
        return None, None

    if "public domain" in combined or re.search(r"\bpd[\-\s]?(usgov|self|old|cdc|nih|ineligible|author|user)\b", combined) or lname.lower() == "pd":
        if "cdc" in combined or "phil" in combined:
            return "Public Domain (CDC PHIL)", "https://creativecommons.org/publicdomain/mark/1.0/"
        if "usgov" in combined or "nih" in combined or "usda" in combined or "fema" in combined:
            return "Public Domain (U.S. Government)", "https://creativecommons.org/publicdomain/mark/1.0/"
        return "Public Domain", "https://creativecommons.org/publicdomain/mark/1.0/"

    if "cc0" in combined or "publicdomain/zero" in combined:
        return "CC0 1.0", "https://creativecommons.org/publicdomain/zero/1.0/"

    if re.search(r"cc[\-\s]?by[\-\s]?4\.0|licenses/by/4\.0", combined):
        return "CC BY 4.0", "https://creativecommons.org/licenses/by/4.0/"

    if re.search(r"cc[\-\s]?by[\-\s]?3\.0|licenses/by/3\.0", combined):
        return "CC BY 3.0", "https://creativecommons.org/licenses/by/3.0/"

    if re.search(r"cc[\-\s]?by[\-\s]?2\.0|licenses/by/2\.0", combined):
        return "CC BY 2.0", "https://creativecommons.org/licenses/by/2.0/"

    return None, None


def search_commons_commercial_photo(query, must_match_re=None, limit=18):
    """Search Wikimedia Commons for a crisp, commercial-book-safe (PD/CC0/CC-BY) real-world photo."""
    _wait_wm()
    params = urllib.parse.urlencode({
        "action": "query",
        "format": "json",
        "generator": "search",
        "gsrnamespace": "6",
        "gsrsearch": f"{query} filetype:bitmap",
        "gsrlimit": str(limit),
        "prop": "imageinfo",
        "iiprop": "url|size|mime|extmetadata",
        "iiurlwidth": "1200",
    })
    url = f"https://commons.wikimedia.org/w/api.php?{params}"
    raw = urllib.request.urlopen(urllib.request.Request(url, headers=UA_API), timeout=20).read().decode("utf-8", "replace")
    data = json.loads(raw)
    pages = list((data.get("query") or {}).get("pages", {}).values())
    if not pages:
        return None
    pages.sort(key=lambda p: p.get("index", 999))

    rx = re.compile(must_match_re, re.I) if must_match_re else None
    bad_title_re = re.compile(r"\b(map|flag|logo|icon|coat of arms|diagram|chart|stamp|coin|painting|drawing|sketch|illustration|herbarium|dried specimen|portrait|person|man|woman|sign|warning sign|poster|book|cover|page|pdf)\b", re.I)

    for page in pages:
        title = page.get("title", "")
        iis = page.get("imageinfo") or []
        if not iis:
            continue
        ii = iis[0]
        mime = (ii.get("mime") or "").lower()
        if mime not in ("image/jpeg", "image/png"):
            continue
        w, h = ii.get("width", 0), ii.get("height", 0)
        if w < 520 or h < 350:
            continue
        aspect = w / max(h, 1)
        if aspect < 0.45 or aspect > 2.4:
            continue

        ext = ii.get("extmetadata") or {}
        lic_label, lic_url = _verify_commons_commercial_license(ext)
        if not lic_label:
            continue

        desc = _clean_html((ext.get("ImageDescription") or {}).get("value", ""))
        cats = _clean_html((ext.get("Categories") or {}).get("value", ""))
        artist = _clean_html((ext.get("Artist") or {}).get("value", "")) or "Wikimedia Commons Contributor"
        if len(artist) > 95:
            artist = artist[:92].rsplit(" ", 1)[0] + "…"

        text_blob = f"{title} {desc}"
        if bad_title_re.search(title):
            continue
        if rx and not rx.search(text_blob + " " + cats):
            continue

        dl_url = ii.get("thumburl") or ii.get("url")
        if not dl_url:
            continue

        stem = re.sub(r"[^a-zA-Z0-9]+", "_", title.replace("File:", "").rsplit(".", 1)[0]).strip("_")[:48]
        hshort = hashlib.md5(title.encode("utf-8")).hexdigest()[:6]
        safe_name = f"HAZ_WM_{stem}_{hshort}.jpg"
        dest = EX_DIR / safe_name
        try:
            _wait_wm()
            sz, dims = he.download_and_optimize_image(dl_url, dest)
        except Exception:
            continue
        if not sz:
            continue

        cap = desc if (desc and len(desc) >= 18) else title.replace("File:", "").rsplit(".", 1)[0].replace("_", " ")
        if len(cap) > 260:
            cap = cap[:257].rsplit(" ", 1)[0] + "…"

        # Check if photo is microscopic / medical graphic
        blur = bool(re.search(r"\b(necrosis|ulcer|wound|burn|autopsy|gangrene|blister|laceration|surgery)\b", (cap + " " + title).lower()))
        page_url = ii.get("descriptionurl") or f"https://commons.wikimedia.org/wiki/{urllib.parse.quote(title.replace(' ', '_'))}"

        return {
            "tier": "hazard",
            "exhibitCode": "HAZARD REFERENCE · VERIFIED PHOTO",
            "src": f"assets/exhibits/{safe_name}",
            "caption": cap,
            "spoilerNote": "Verified real-world reference photograph of the hazard or organism (illustrative; not the index incident).",
            "blurredByDefault": blur,
            "citation": f"{artist} · Wikimedia Commons ({title.replace('File:', '')})",
            "license": lic_label,
            "licenseUrl": lic_url,
            "sourceUrl": page_url,
            "dims": list(dims),
            "bytes": sz,
        }
    return None


def harvest_one_slug(slug, recipe_list):
    for step in recipe_list:
        mode = step["mode"]
        try:
            if mode == "pmc_primary":
                res = harvest_primary_pmc_direct(step["pmcid"], step.get("must_match"))
            elif mode == "epmc":
                res = search_epmc_ccby(step["query"], step.get("must_match"))
            elif mode == "commons":
                res = search_commons_commercial_photo(step["query"], step.get("must_match"))
            else:
                res = None
            if res:
                return slug, res
        except Exception:
            continue
    return slug, None


def render_contact_sheets(results_map, catalog_by_slug, out_dir):
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    items = sorted(results_map.items(), key=lambda kv: int(catalog_by_slug.get(kv[0], {}).get("fileNo", 999)))
    per_sheet = 16  # 4x4 grid
    sheet_paths = []
    cw, ch = 360, 290
    cols, rows = 4, 4

    for idx in range(0, len(items), per_sheet):
        chunk = items[idx:idx + per_sheet]
        sheet = Image.new("RGB", (cols * cw, rows * ch), (248, 246, 241))
        draw = ImageDraw.Draw(sheet)
        for j, (slug, fig) in enumerate(chunk):
            r, c = divmod(j, cols)
            x0, y0 = c * cw, r * ch
            draw.rectangle([x0 + 4, y0 + 4, x0 + cw - 4, y0 + ch - 4], outline=(200, 195, 185), width=2, fill=(255, 255, 255))
            img_p = REPO_ROOT / fig["src"]
            if img_p.exists():
                im = Image.open(img_p).convert("RGB")
                im.thumbnail((cw - 24, 175), Image.Resampling.LANCZOS)
                ix = x0 + (cw - im.width) // 2
                iy = y0 + 12 + (175 - im.height) // 2
                sheet.paste(im, (ix, iy))
            fno = catalog_by_slug.get(slug, {}).get("fileNo", "???")
            tier_tag = fig.get("tier", "ref").upper()
            lic = fig.get("license", "")
            blur_tag = " [BLUR]" if fig.get("blurredByDefault") else ""
            header = f"#{fno} [{tier_tag}] {lic}{blur_tag}"
            draw.text((x0 + 12, y0 + 194), header[:48], fill=(155, 28, 28))
            draw.text((x0 + 12, y0 + 210), slug[:48], fill=(20, 24, 30))
            cap = fig.get("caption", "")
            draw.text((x0 + 12, y0 + 228), cap[:50], fill=(70, 75, 85))
            draw.text((x0 + 12, y0 + 244), cap[50:100], fill=(70, 75, 85))
            draw.text((x0 + 12, y0 + 260), fig.get("citation", "")[:50], fill=(95, 100, 110))
        sp = out_dir / f"contact_sheet_{(idx // per_sheet) + 1:02d}.png"
        sheet.save(sp, "PNG")
        sheet_paths.append(str(sp))
    return sheet_paths


def main():
    ap = argparse.ArgumentParser(description="Harvest commercial-safe Tier 1/2/3 visual exhibits for stories lacking local images.")
    ap.add_argument("--slugs", help="Comma-separated slugs to process (default: all stories lacking clinicalFigures)")
    ap.add_argument("--out", required=True, help="Output JSON path for staged exhibits")
    ap.add_argument("--contact-sheets", help="Directory to render 4x4 visual QA contact sheets")
    ap.add_argument("--workers", type=int, default=6, help="Concurrent worker threads (default: 6)")
    args = ap.parse_args()

    cat = json.loads((REPO_ROOT / "data/catalog.json").read_text(encoding="utf-8"))
    ex = json.loads((REPO_ROOT / "data/exhibits.json").read_text(encoding="utf-8"))
    cat_by_slug = {c["slug"]: c for c in cat["cases"]}

    if args.slugs:
        target_slugs = [s.strip() for s in args.slugs.split(",") if s.strip()]
    else:
        target_slugs = [
            c["slug"] for c in cat["cases"]
            if not (ex["stories"].get(c["slug"], {}).get("clinicalFigures"))
        ]

    # Filter to those in CURATED_RECIPES (and report any missing recipe)
    todo = []
    no_recipe = []
    for s in target_slugs:
        if s in CURATED_RECIPES:
            todo.append((s, CURATED_RECIPES[s]))
        else:
            no_recipe.append(s)

    print(f"Harvesting commercial-safe Tier 1/2/3 exhibits for {len(todo)} stories ({len(no_recipe)} without recipe)...")
    found = {}
    missed = []

    with ThreadPoolExecutor(max_workers=args.workers) as tp:
        futs = [tp.submit(harvest_one_slug, s, r) for s, r in todo]
        for fut in as_completed(futs):
            slug, res = fut.result()
            if res:
                found[slug] = res
                print(f"  OK   [{res['tier']:9s}] {slug:45s} | {res['license']:26s} | {Path(res['src']).name}")
            else:
                missed.append(slug)
                print(f"  MISS            {slug}")

    out_p = Path(args.out)
    out_p.parent.mkdir(parents=True, exist_ok=True)
    out_p.write_text(json.dumps({"found": found, "missed": sorted(missed), "no_recipe": no_recipe}, indent=2, ensure_ascii=False), encoding="utf-8")

    tiers = {}
    for v in found.values():
        tiers[v["tier"]] = tiers.get(v["tier"], 0) + 1
    print(f"\nDONE! Found {len(found)}/{len(todo)} commercial-safe exhibits {tiers} | Missed: {len(missed)}")
    print(f"Staged JSON -> {out_p}")

    if args.contact_sheets and found:
        sheets = render_contact_sheets(found, cat_by_slug, args.contact_sheets)
        print(f"Rendered {len(sheets)} visual QA contact sheet(s) -> {args.contact_sheets}")


if __name__ == "__main__":
    main()
