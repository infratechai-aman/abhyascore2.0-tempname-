import os
import random

# Botany Class 12 (IDs 330-342)
botany_chapters = {
    "reproduction_in_organisms.xml": {
        "id": 330, "name": "Reproduction in Organisms",
        "topics": ["Life Span", "Asexual Reproduction", "Vegetative Propagation", "Sexual Reproduction", "Phases of Life", "Events in Sexual Reproduction", "Pre-fertilization Events", "Fertilization", "Post-fertilization Events", "Embryogenesis"]
    },
    "sexual_reproduction_flowering_plants.xml": {
        "id": 331, "name": "Sexual Reproduction in Flowering Plants",
        "topics": ["Flower Structure", "Microsporogenesis", "Pollen Grain", "Megasporogenesis", "Embryo Sac", "Pollination", "Double Fertilization", "Endosperm", "Embryo Development", "Seed and Fruit Formation"]
    },
    "principles_of_inheritance.xml": {
        "id": 332, "name": "Principles of Inheritance and Variation",
        "topics": ["Mendel's Laws", "Inheritance of One Gene", "Incomplete Dominance", "Co-dominance", "Chromosomal Theory", "Linkage and Recombination", "Sex Determination", "Mutation", "Genetic Disorders", "Pedigree Analysis"]
    },
    "molecular_basis_inheritance.xml": {
        "id": 333, "name": "Molecular Basis of Inheritance",
        "topics": ["DNA Structure", "Packaging of DNA Helix", "Search for Genetic Material", "Replication", "Transcription", "Genetic Code", "Translation", "Regulation of Gene Expression", "Human Genome Project", "DNA Fingerprinting"]
    },
    "evolution.xml": {
        "id": 334, "name": "Evolution",
        "topics": ["Origin of Life", "Evidence for Evolution", "Adaptive Radiation", "Biological Evolution", "Mechanism of Evolution", "Hardy-Weinberg Principle", "Human Evolution"]
    },
    "strategies_food_botany.xml": {
        "id": 335, "name": "Strategies for Enhancement in Food (Botany)",
        "topics": ["Plant Breeding", "Single Cell Protein", "Tissue Culture", "Biofortification", "Somatic Hybridization"]
    },
    "microbes_human_welfare.xml": {
        "id": 336, "name": "Microbes in Human Welfare",
        "topics": ["Microbes in Household", "Microbes in Industry", "Sewage Treatment", "Biogas Production", "Biocontrol Agents", "Biofertilizers"]
    },
    "biotech_principles.xml": {
        "id": 337, "name": "Biotech: Principles and Processes",
        "topics": ["Genetic Engineering", "Restriction Enzymes", "Cloning Vectors", "PCR", "Recombinant DNA Technology", "Bioreactors", "Downstream Processing"]
    },
    "biotech_applications.xml": {
        "id": 338, "name": "Biotech and its Applications",
        "topics": ["Bt Cotton", "RNA Interference", "Genetically Engineered Insulin", "Gene Therapy", "Transgenic Animals", "Biopiracy", "Ethical Issues"]
    },
    "organisms_and_populations.xml": {
        "id": 339, "name": "Organisms and Populations",
        "topics": ["Organism and Environment", "Major Abiotic Factors", "Adaptations", "Population Attributes", "Population Growth Models", "Population Interactions", "Predation", "Parasitism", "Commensalism", "Mutualism"]
    },
    "ecosystem.xml": {
        "id": 340, "name": "Ecosystem",
        "topics": ["Ecosystem Structure", "Productivity", "Decomposition", "Energy Flow", "Ecological Pyramids", "Ecological Succession", "Nutrient Cycling", "Ecosystem Services"]
    },
    "biodiversity_conservation.xml": {
        "id": 341, "name": "Biodiversity and Conservation",
        "topics": ["Levels of Biodiversity", "Patterns of Biodiversity", "Loss of Biodiversity", "In-situ Conservation", "Ex-situ Conservation", "Hotspots", "Red Data Book"]
    },
    "environmental_issues.xml": {
        "id": 342, "name": "Environmental Issues",
        "topics": ["Air Pollution", "Water Pollution", "Solid Waste Management", "Radioactive Waste", "Greenhouse Effect", "Ozone Depletion", "Deforestation"]
    }
}

# Zoology Class 12 (IDs 320-323)
zoology_chapters = {
    "human_reproduction.xml": {
        "id": 320, "name": "Human Reproduction",
        "topics": ["Male Reproductive System", "Female Reproductive System", "Gametogenesis", "Menstrual Cycle", "Fertilization", "Implantation", "Pregnancy", "Parturition", "Lactation"]
    },
    "reproductive_health.xml": {
        "id": 321, "name": "Reproductive Health",
        "topics": ["Reproductive Health Problems", "Population Explosion", "Birth Control Methods", "MTP", "STDs", "Infertility", "ART (IVF, ZIFT, GIFT)"]
    },
    "human_health_disease.xml": {
        "id": 322, "name": "Human Health and Disease",
        "topics": ["Common Diseases", "Immunity", "AIDS", "Cancer", "Drugs and Alcohol Abuse", "Vaccination", "Allergy", "Autoimmunity"]
    },
    "strategies_food_zoology.xml": {
        "id": 323, "name": "Strategies for Enhancement in Food (Zoology)",
        "topics": ["Animal Husbandry", "Dairy Farm Management", "Poultry Farm Management", "Apiculture", "Fisheries", "Animal Breeding"]
    }
}

base_path = "c:/Users/Aman Talukdar/Desktop/AbhyasCore_2.0/src/data/raw_questions"

def generate_questions(pool_type, topics, count=40):
    questions_xml = ""
    for i in range(1, count + 1):
        topic = random.choice(topics)
        
        if pool_type == "easy":
            q_text = f"Identify the key feature or definition of {topic}."
            ans = "A"
            expl = f"{topic} involves biological processes fundamental to this chapter."
        elif pool_type == "medium":
            q_text = f"Analyze the process or mechanism of {topic} in the given context."
            ans = "B"
            expl = f"Understanding the function of {topic} clarifies the answer."
        else: # hard
            q_text = f"Evaluate the detailed interaction and consequences of {topic}."
            ans = "C"
            expl = f"Critical analysis of {topic} reveals these complex relationships."

        questions_xml += f"""
        <question>
            <text>{q_text}</text>
            <option id="A">Option A related to {topic}</option>
            <option id="B">Option B related to {topic}</option>
            <option id="C">Option C related to {topic}</option>
            <option id="D">Option D related to {topic}</option>
            <answer>{ans}</answer>
            <explanation>{expl}</explanation>
        </question>"""
    return questions_xml

# Generate Botany Files
for filename, data in botany_chapters.items():
    xml_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<chapter subject="Biology" id="{data['id']}" name="{data['name']}">
    <easy>{generate_questions("easy", data['topics'])}
    </easy>
    <medium>{generate_questions("medium", data['topics'])}
    </medium>
    <hard>{generate_questions("hard", data['topics'])}
    </hard>
</chapter>
"""
    with open(os.path.join(base_path, filename), "w", encoding="utf-8") as f:
        f.write(xml_content)
    print(f"Populated {filename} (Botany)")

# Generate Zoology Files
for filename, data in zoology_chapters.items():
    xml_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<chapter subject="Zoology" id="{data['id']}" name="{data['name']}">
    <easy>{generate_questions("easy", data['topics'])}
    </easy>
    <medium>{generate_questions("medium", data['topics'])}
    </medium>
    <hard>{generate_questions("hard", data['topics'])}
    </hard>
</chapter>
"""
    with open(os.path.join(base_path, filename), "w", encoding="utf-8") as f:
        f.write(xml_content)
    print(f"Populated {filename} (Zoology)")
