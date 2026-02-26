import os
import random

chapters_data = {
    "relations_and_functions_12.xml": {
        "id": 215, "name": "Relations and Functions",
        "topics": ["Reflexive Relation", "Symmetric Relation", "Transitive Relation", "Equivalence Relation", "One-One Function", "Onto Function", "Bijective Function", "Composition of Functions", "Invertible Function", "Binary Operations"]
    },
    "inverse_trigonometric_functions.xml": {
        "id": 216, "name": "Inverse Trigonometric Functions",
        "topics": ["Principal Value Branch", "Domain and Range", "Properties of Inverse Trig Functions", "Simplification of Expressions", "Sin^-1 x + Cos^-1 x = pi/2", "Tan^-1 x + Tan^-1 y Formula", "Substitution Method", "Graph of Inverse Trig Functions", "Value of Inverse at Specific Points", "Interconversion of Inverse Functions"]
    },
    "matrices.xml": {
        "id": 217, "name": "Matrices",
        "topics": ["Order of Matrix", "Types of Matrices", "Addition of Matrices", "Multiplication of Matrices", "Transpose of Matrix", "Symmetric and Skew-Symmetric Matrices", "Elementary Operations", "Invertible Matrices", "Properties of Matrix Addition", "Equality of Matrices"]
    },
    "determinants.xml": {
        "id": 218, "name": "Determinants",
        "topics": ["Value of Determinant", "Properties of Determinants", "Area of Triangle", "Minors and Cofactors", "Adjoint of a Matrix", "Inverse of a Matrix", "System of Linear Equations", "Consistency of System", "Cramer's Rule", "Singular and Non-Singular Matrices"]
    },
    "continuity_and_differentiability.xml": {
        "id": 219, "name": "Continuity and Differentiability",
        "topics": ["Continuity at a Point", "Algebra of Continuous Functions", "Differentiability", "Chain Rule", "Derivatives of Implicit Functions", "Derivatives of Inverse Trig Functions", "Logarithmic Differentiation", "Parametric Forms", "Second Order Derivative", "Mean Value Theorem"]
    },
    "applications_of_derivatives.xml": {
        "id": 220, "name": "Applications of Derivatives",
        "topics": ["Rate of Change", "Increasing and Decreasing Functions", "Tangents and Normals", "Approximations", "Maxima and Minima", "First Derivative Test", "Second Derivative Test", "Turning Points", "Critical Points", "Optimization Problems"]
    },
    "integrals.xml": {
        "id": 221, "name": "Integrals",
        "topics": ["Indefinite Integral", "Geometrical Interpretation", "Methods of Integration", "Substitution Method", "Integration by Parts", "Partial Fractions", "Definite Integral", "Fundamental Theorem of Calculus", "Properties of Definite Integrals", "Limit of a Sum"]
    },
    "applications_of_integrals.xml": {
        "id": 222, "name": "Applications of Integrals",
        "topics": ["Area Under Simple Curves", "Area of Circle", "Area of Parabola", "Area of Ellipse", "Area Between Two Curves", "Area Bounded by Lines", "Region Identification", "Integration as Summation", "Vertical vs Horizontal Strip", "Modulus Function Area"]
    },
    "differential_equations.xml": {
        "id": 223, "name": "Differential Equations",
        "topics": ["Order and Degree", "General and Particular Solutions", "Formation of DE", "Variable Separation Method", "Homogeneous Differential Equations", "Linear Differential Equations", "Integrating Factor", "Solving dy/dx + Py = Q", "Initial Value Problems", "Family of Curves"]
    },
    "vector_algebra.xml": {
        "id": 224, "name": "Vector Algebra",
        "topics": ["Magnitude and Direction", "Types of Vectors", "Addition of Vectors", "Multiplication by Scalar", "Section Formula", "Scalar (Dot) Product", "Vector (Cross) Product", "Projection of Vector", "Unit Vector", "Direction Cosines"]
    },
    "three_dimensional_geometry.xml": {
        "id": 225, "name": "Three Dimensional Geometry",
        "topics": ["Direction Cosines and Ratios", "Equation of a Line", "Angle Between Two Lines", "Shortest Distance Between Skew Lines", "Equation of a Plane", "Intercept Form", "Distanc of Point from Plane", "Angle Between Two Planes", "Coplanarity of Lines", "Intersection of Line and Plane"]
    },
    "probability.xml": {
        "id": 226, "name": "Probability",
        "topics": ["Conditional Probability", "Multiplication Theorem", "Independent Events", "Baye's Theorem", "Total Probability", "Random Variables", "Probability Distribution", "Mean and Variance", "Bernoulli Trials", "Binomial Distribution"]
    }
}

base_path = "c:/Users/Aman Talukdar/Desktop/AbhyasCore_2.0/src/data/raw_questions"

def generate_questions(pool_type, topics, count=40):
    questions_xml = ""
    for i in range(1, count + 1):
        topic = random.choice(topics)
        
        if pool_type == "easy":
            q_text = f"Identify the basic property or definition related to {topic}."
            ans = "A"
            expl = f"{topic} is defined by specific conditions that must be met."
        elif pool_type == "medium":
            q_text = f"Solve the following problem involving {topic} using standard formulas."
            ans = "B"
            expl = f"Applying the formula for {topic} yields the correct value."
        else: # hard
            q_text = f"Analyze and solve the complex problem involving {topic} with multiple steps."
            ans = "C"
            expl = f"Deep understanding and multiple application steps of {topic} are required."

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
<chapter subject="Mathematics" id="{data['id']}" name="{data['name']}">
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
