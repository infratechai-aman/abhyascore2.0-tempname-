import os
import random

chapters_data = {
    "electric_charges_and_fields.xml": {
        "id": 14, "name": "Electric Charges and Fields",
        "topics": ["Coulomb's Law", "Electric Field", "Dipole Moment", "Electric Flux", "Gauss's Law", "Charge Quantization", "Permittivity", "Field Lines", "Torque on Dipole", "Continuous Charge Distribution"]
    },
    "electrostatic_potential_and_capacitance.xml": {
        "id": 15, "name": "Electrostatic Potential and Capacitance",
        "topics": ["Electric Potential", "Equipotential Surfaces", "Potential Energy", "Capacitor", "Dielectrics", "Parallel Plate Capacitor", "Energy Density", "Combination of Capacitors", "Van de Graaff Generator", "Polarization"]
    },
    "current_electricity.xml": {
        "id": 16, "name": "Current Electricity",
        "topics": ["Ohm's Law", "Drift Velocity", "Resistivity", "Kirchhoff's Laws", "Wheatstone Bridge", "Potentiometer", "Internal Resistance", "Combination of Cells", "Joule's Heating", "Color Code of Resistors"]
    },
    "moving_charges_and_magnetism.xml": {
        "id": 17, "name": "Moving Charges and Magnetism",
        "topics": ["Biot-Savart Law", "Ampere's Law", "Lorentz Force", "Cyclotron", "Magnetic Field on Axis", "Torque on Loop", "Galvanometer", "Solenoid", "Toroid", "Velocity Selector"]
    },
    "magnetism_and_matter.xml": {
        "id": 18, "name": "Magnetism and Matter",
        "topics": ["Bar Magnet", "Magnetic Field Lines", "Earth's Magnetism", "Magnetic Materials", "Hysteresis", "Diamagnetism", "Paramagnetism", "Ferromagnetism", "Curie Temperature", "Permanent Magnets"]
    },
    "electromagnetic_induction.xml": {
        "id": 19, "name": "Electromagnetic Induction",
        "topics": ["Magnetic Flux", "Faraday's Law", "Lenz's Law", "Motional EMF", "Eddy Currents", "Self Induction", "Mutual Induction", "AC Generator", "Back EMF", "Inductance"]
    },
    "alternating_current.xml": {
        "id": 20, "name": "Alternating Current",
        "topics": ["RMS Value", "Phasor Diagram", "LCR Circuit", "Resonance", "Power Factor", "Wattless Current", "Transformers", "LC Oscillations", "Impedance", "Q-Factor"]
    },
    "electromagnetic_waves.xml": {
        "id": 21, "name": "Electromagnetic Waves",
        "topics": ["Displacement Current", "Maxwell's Equations", "EM Spectrum", "Radio Waves", "Microwaves", "X-Rays", "Gamma Rays", "Transverse Nature", "Momentum", "Energy Density"]
    },
    "ray_optics_and_optical_instruments.xml": {
        "id": 22, "name": "Ray Optics and Optical Instruments",
        "topics": ["Reflection", "Refraction", "Total Internal Reflection", "Lens Maker's Formula", "Prism", "Dispersion", "Scattering", "Microscope", "Telescope", "Eye Defects"]
    },
    "wave_optics.xml": {
        "id": 23, "name": "Wave Optics",
        "topics": ["Huygens Principle", "Interference", "Young's Double Slit", "Diffraction", "Polarization", "Brewster's Law", "Coherent Sources", "Resolving Power", "Malus Law", "Doppler Effect"]
    },
    "dual_nature_of_radiation_and_matter.xml": {
        "id": 24, "name": "Dual Nature of Radiation and Matter",
        "topics": ["Photoelectric Effect", "Einstein's Equation", "Work Function", "Threshold Frequency", "De Broglie Wavelength", "Davisson-Germer Experiment", "Photon Energy", "Matter Waves", "Stopping Potential", "Intensity"]
    },
    "atoms.xml": {
        "id": 25, "name": "Atoms",
        "topics": ["Alpha Scattering", "Rutherford Model", "Bohr Model", "Hydrogen Spectrum", "Rydberg Constant", "Energy Levels", "Ionization Energy", "Line Spectra", "De Broglie Hypothesis", "Quantization"]
    },
    "nuclei.xml": {
        "id": 26, "name": "Nuclei",
        "topics": ["Atomic Mass Unit", "Isotopes", "Binder Energy", "Radioactivity", "Half Life", "Alpha Decay", "Beta Decay", "Gamma Decay", "Nuclear Fission", "Nuclear Fusion"]
    },
    "semiconductor_electronics.xml": {
        "id": 27, "name": "Semiconductor Electronics",
        "topics": ["Energy Bands", "Intrinsic Semiconductor", "Extrinsic Semiconductor", "PN Junction", "Diode", "Rectifier", "Zener Diode", "Photo Diode", "Solar Cell", "Logic Gates"]
    }
}

base_path = "c:/Users/Aman Talukdar/Desktop/AbhyasCore_2.0/src/data/raw_questions"

def generate_questions(pool_type, topics, count=40):
    questions_xml = ""
    for i in range(1, count + 1):
        topic = random.choice(topics)
        
        if pool_type == "easy":
            q_text = f"What is the fundamental concept behind {topic}?"
            ans = "A"
            expl = f"{topic} is a key concept defined by specific physical properties."
        elif pool_type == "medium":
            q_text = f"Calculate the value associated with {topic} given standard conditions."
            ans = "B"
            expl = f"Using the formula for {topic}, we can derive the result."
        else: # hard
            q_text = f"Analyze the complex interaction involving {topic} in a non-uniform field."
            ans = "C"
            expl = f"Advanced integration and application of {topic} principles are required."

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
<chapter subject="Physics" id="{data['id']}" name="{data['name']}">
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
