import os
import random

chapters_data = {
    "solutions.xml": {
        "id": 111, "name": "Solutions",
        "topics": ["Raoult's Law", "Colligative Properties", "Van't Hoff Factor", "Henry's Law", "Ideal Solutions", "Non-Ideal Solutions", "Osmotic Pressure", "Elevation in Boiling Point", "Depression in Freezing Point", "Concentration Terms"]
    },
    "electrochemistry.xml": {
        "id": 112, "name": "Electrochemistry",
        "topics": ["Nernst Equation", "Electrolytic Cells", "Standard Electrode Potential", "Faraday's Laws", "Conductance", "Kohlrausch's Law", "Fuel Cells", "Corrosion", "Batteries", "Gibbs Energy"]
    },
    "chemical_kinetics.xml": {
        "id": 113, "name": "Chemical Kinetics",
        "topics": ["Rate Laws", "Activation Energy", "Arrhenius Equation", "Order of Reaction", "Molecularity", "Half-Life", "Zero Order Reaction", "First Order Reaction", "Collision Theory", "Factors Affecting Rate"]
    },
    "d_and_f_block_elements.xml": {
        "id": 114, "name": "d- and f-Block Elements",
        "topics": ["Transition Elements", "Lanthanoids", "Actinoids", "Oxidation States", "Magnetic Properties", "Coloured Ions", "Catalytic Properties", "Interstitial Compounds", "Alloy Formation", "KMnO4 & K2Cr2O7"]
    },
    "coordination_compounds.xml": {
        "id": 115, "name": "Coordination Compounds",
        "topics": ["Werner's Theory", "IUPAC Nomenclature", "Valence Bond Theory", "Crystal Field Theory", "Isomerism", "Ligands", "Spectrochemical Series", "Stability Constants", "Organometallics", "Magnetic Properties"]
    },
    "haloalkanes_and_haloarenes.xml": {
        "id": 116, "name": "Haloalkanes and Haloarenes",
        "topics": ["Nucleophilic Substitution", "SN1 Mechanism", "SN2 Mechanism", "Elimination Reactions", "Grignard Reagent", "Sandmeyer's Reaction", "Finkelstein Reaction", "Swarts Reaction", "Optical Isomerism", "Polyhalogen Compounds"]
    },
    "alcohols_phenols_and_ethers.xml": {
        "id": 117, "name": "Alcohols, Phenols and Ethers",
        "topics": ["Acidity of Phenols", "Synthesis of Alcohols", "Dehydration", "Esterification", "Williamson Synthesis", "Reimer-Tiemann Reaction", "Kolbe's Reaction", "Oxidation of Alcohols", "Cleavage of Ethers", "Hydrogen Bonding"]
    },
    "aldehydes_ketones_and_carboxylic_acids.xml": {
        "id": 118, "name": "Aldehydes, Ketones and Carboxylic Acids",
        "topics": ["Nucleophilic Addition", "Aldol Condensation", "Cannizzaro Reaction", "Tollens' Test", "Fehling's Test", "Decarboxylation", "HVZ Reaction", "Acidity of Carboxylic Acids", "Grignard Addition", "Rosenmund Reduction"]
    },
    "amines.xml": {
        "id": 119, "name": "Amines",
        "topics": ["Diazonium Salts", "Basicity of Amines", "Hoffmann Bromamide Degradation", "Gabriel Phthalimide Synthesis", "Carbylamine Reaction", "Hinsberg's Reagent", "Coupling Reactions", "Alkylation", "Acylation", "Reduction of Nitro Compounds"]
    },
    "biomolecules.xml": {
        "id": 120, "name": "Biomolecules",
        "topics": ["Carbohydrates", "Proteins", "Nucleic Acids", "Amino Acids", "Peptide Bond", "Denaturation of Proteins", "DNA vs RNA", "Vitamins", "Enzymes", "Glycosidic Linkage"]
    }
}

base_path = "c:/Users/Aman Talukdar/Desktop/AbhyasCore_2.0/src/data/raw_questions"

def generate_questions(pool_type, topics, count=40):
    questions_xml = ""
    for i in range(1, count + 1):
        topic = random.choice(topics)
        
        if pool_type == "easy":
            q_text = f"Which of the following describes the fundamental concept of {topic}?"
            ans = "A"
            expl = f"{topic} involves basic principles essential for understanding molecular behavior."
        elif pool_type == "medium":
            q_text = f"Calculate or determine the outcome involving {topic} under standard conditions."
            ans = "B"
            expl = f"Application of the rules regarding {topic} leads to the specific result."
        else: # hard
            q_text = f"Analyze the complex reaction mechanism or derivation involving {topic}."
            ans = "C"
            expl = f"Advanced understanding of {topic} is required to solve this multi-step problem."

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

for filename, data in chapters_data.items():
    xml_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<chapter subject="Chemistry" id="{data['id']}" name="{data['name']}">
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
    print(f"Populated {filename}")
