# Prompt for Generating Question Bank XML

**Copy and paste the following prompt into ChatGPT, Claude, or Gemini:**

---

**Role:** You are an expert academic content developer for a high-stakes competitive exam app (JEE/NEET).

**Task:** Create a structured XML dataset of multiple-choice questions for a specific chapter.

**Format Requirements:**
1.  **Output:** A single valid XML code block.
2.  **Structure:**
    -   Root tag: `<chapter subject="..." id="..." name="...">`
    -   Three sections inside: `<easy>`, `<medium>`, `<hard>`.
    -   Inside each section: 50 `<question>` blocks.
3.  **Question Schema:**
    ```xml
    <question>
        <text>Clearly stated physics/math/chem problem.</text>
        <option id="A">Option A text</option>
        <option id="B">Option B text</option>
        <option id="C">Option C text</option>
        <option id="D">Option D text</option>
        <answer>A</answer> <!-- Only A, B, C, or D -->
        <explanation>Brief conceptual explanation.</explanation>
    </question>
    ```

**Content Requirements:**
-   **Subject:** [INSERT SUBJECT HERE, e.g., Physics]
-   **Chapter:** [INSERT CHAPTER NAME, e.g., Kinematics]
-   **ID:** [INSERT CHAPTER ID, e.g., 1]
-   **Quantity:** 10 questions for Easy, 10 for Medium, 10 for Hard (Total 30). *[Note: Ask for 50 if needed, but AI might truncate. Start with 10-20 per batch]*
-   **Quality:**
    -   **Easy:** Formula-based, direct application.
    -   **Medium:** Multi-step problems, concept linking.
    -   **Hard:** Advanced application, trick questions, previous JEE Advanced/NEET level.

**Example Output:**
```xml
<chapter subject="Physics" id="1" name="Kinematics">
    <easy>
        <question>
            <text>A car moves with 20m/s. How far does it go in 10s?</text>
            <option id="A">200m</option>
            <option id="B">100m</option>
            <option id="C">20m</option>
            <option id="D">2000m</option>
            <answer>A</answer>
            <explanation>Distance = Speed × Time = 20 × 10 = 200m.</explanation>
        </question>
    </easy>
    <!-- ... medium and hard sections ... -->
</chapter>
```

**Constraint:** Do not add markdown formatting outside the XML. Provide ONLY the XML code.

---
