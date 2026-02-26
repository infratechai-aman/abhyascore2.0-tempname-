import os

chapters = [
    (14, "Electric Charges and Fields", "electric_charges_and_fields.xml"),
    (15, "Electrostatic Potential and Capacitance", "electrostatic_potential_and_capacitance.xml"),
    (16, "Current Electricity", "current_electricity.xml"),
    (17, "Moving Charges and Magnetism", "moving_charges_and_magnetism.xml"),
    (18, "Magnetism and Matter", "magnetism_and_matter.xml"),
    (19, "Electromagnetic Induction", "electromagnetic_induction.xml"),
    (20, "Alternating Current", "alternating_current.xml"),
    (21, "Electromagnetic Waves", "electromagnetic_waves.xml"),
    (22, "Ray Optics and Optical Instruments", "ray_optics_and_optical_instruments.xml"),
    (23, "Wave Optics", "wave_optics.xml"),
    (24, "Dual Nature of Radiation and Matter", "dual_nature_of_radiation_and_matter.xml"),
    (25, "Atoms", "atoms.xml"),
    (26, "Nuclei", "nuclei.xml"),
    (27, "Semiconductor Electronics", "semiconductor_electronics.xml")
]

template = """<?xml version="1.0" encoding="UTF-8"?>
<chapter subject="Physics" id="{id}" name="{name}">
    <easy>
        <question>
            <text>Placeholder Question 1 for {name} (Easy)</text>
            <option id="A">Option A</option>
            <option id="B">Option B</option>
            <option id="C">Option C</option>
            <option id="D">Option D</option>
            <answer>A</answer>
            <explanation>Explanation for Q1</explanation>
        </question>
    </easy>
    <medium>
        <question>
            <text>Placeholder Question 1 for {name} (Medium)</text>
            <option id="A">Option A</option>
            <option id="B">Option B</option>
            <option id="C">Option C</option>
            <option id="D">Option D</option>
            <answer>B</answer>
            <explanation>Explanation for Q1</explanation>
        </question>
    </medium>
    <hard>
        <question>
            <text>Placeholder Question 1 for {name} (Hard)</text>
            <option id="A">Option A</option>
            <option id="B">Option B</option>
            <option id="C">Option C</option>
            <option id="D">Option D</option>
            <answer>C</answer>
            <explanation>Explanation for Q1</explanation>
        </question>
    </hard>
</chapter>
"""

output_dir = "c:/Users/Aman Talukdar/Desktop/AbhyasCore_2.0/src/data/raw_questions"

for cid, name, filename in chapters:
    content = template.format(id=cid, name=name)
    path = os.path.join(output_dir, filename)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Created {filename}")
