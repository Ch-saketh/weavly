# Zyra V0 Human Review & Recommendation Audit

This file provides a structured inspection log of Baseline Top-10 vs Zyra V0 Top-10 recommendations for manual editorial review.

---

## Case: `EVAL-COLLEGE-01`
- **User:** `U-EVAL-MINIMALIST`
- **Occasion:** `college`

### Baseline Top 10 (Raw Retrieval)
| Rank | Product ID | Title | Category | Color | Retrieval Score |
| :---: | :--- | :--- | :--- | :--- | :---: |
| #1 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9500` |
| #2 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Heather Grey', 'primaryColor': 'Heather Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9450` |
| #3 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | {'sources': ['visual'], 'confidence': 0.83, 'colorFamily': 'Black', 'primaryColor': 'Black', 'secondaryColors': [], 'hasVisualEvidence': True, 'hasAttributeEvidence': False} | `0.9400` |
| #4 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Charcoal Grey', 'primaryColor': 'Charcoal Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9350` |
| #5 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9300` |
| #6 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9250` |
| #7 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9200` |
| #8 | `P-API-DUAL` | Product P-API-DUAL |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9150` |
| #9 | `P-MIN-999` | Product P-MIN-999 |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9100` |

### Zyra V0 Top 10 (Multi-Model Scoring)
| Rank | Product ID | Title | Category | Retrieval | Person | Outfit | Occasion | Final Score |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| #1 | `P-MIN-999` | Product P-MIN-999 |  | `0.910` | `0.763` | `0.790` | `0.815` | `0.811` |
| #2 | `P-API-DUAL` | Product P-API-DUAL |  | `0.915` | `0.741` | `0.790` | `0.815` | `0.804` |
| #3 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | `0.940` | `0.715` | `0.790` | `0.815` | `0.800` |
| #4 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | `0.945` | `0.806` | `0.790` | `0.640` | `0.789` |
| #5 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | `0.930` | `0.780` | `0.750` | `0.640` | `0.769` |
| #6 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | `0.920` | `0.765` | `0.750` | `0.640` | `0.762` |
| #7 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | `0.950` | `0.718` | `0.790` | `0.640` | `0.759` |
| #8 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | `0.925` | `0.726` | `0.790` | `0.640` | `0.757` |
| #9 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | `0.935` | `0.712` | `0.790` | `0.640` | `0.754` |

**Promoted by Zyra:** `P-MIN-999` (#9 → #1), `P-API-DUAL` (#8 → #2)

**Demoted by Zyra:** `P-LUXZERA-HOODIE-001` (#1 → #7), `P-API-P5-TEST` (#4 → #9)

#### Human Verdict:
- [ ] Good
- [ ] Acceptable
- [ ] Poor

**Reason / Notes:**
> 

---

## Case: `EVAL-COLLEGE-02`
- **User:** `U-EVAL-STREETWEAR`
- **Occasion:** `college`

### Baseline Top 10 (Raw Retrieval)
| Rank | Product ID | Title | Category | Color | Retrieval Score |
| :---: | :--- | :--- | :--- | :--- | :---: |
| #1 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9500` |
| #2 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Heather Grey', 'primaryColor': 'Heather Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9450` |
| #3 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | {'sources': ['visual'], 'confidence': 0.83, 'colorFamily': 'Black', 'primaryColor': 'Black', 'secondaryColors': [], 'hasVisualEvidence': True, 'hasAttributeEvidence': False} | `0.9400` |
| #4 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Charcoal Grey', 'primaryColor': 'Charcoal Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9350` |
| #5 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9300` |
| #6 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9250` |
| #7 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9200` |
| #8 | `P-API-DUAL` | Product P-API-DUAL |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9150` |
| #9 | `P-MIN-999` | Product P-MIN-999 |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9100` |

### Zyra V0 Top 10 (Multi-Model Scoring)
| Rank | Product ID | Title | Category | Retrieval | Person | Outfit | Occasion | Final Score |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| #1 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | `0.940` | `0.807` | `0.790` | `0.815` | `0.832` |
| #2 | `P-MIN-999` | Product P-MIN-999 |  | `0.910` | `0.767` | `0.790` | `0.815` | `0.812` |
| #3 | `P-API-DUAL` | Product P-API-DUAL |  | `0.915` | `0.745` | `0.790` | `0.815` | `0.805` |
| #4 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | `0.950` | `0.825` | `0.790` | `0.640` | `0.797` |
| #5 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | `0.935` | `0.812` | `0.790` | `0.640` | `0.789` |
| #6 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | `0.925` | `0.807` | `0.790` | `0.640` | `0.785` |
| #7 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | `0.945` | `0.716` | `0.790` | `0.640` | `0.758` |
| #8 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | `0.930` | `0.654` | `0.750` | `0.640` | `0.725` |
| #9 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | `0.920` | `0.649` | `0.750` | `0.640` | `0.721` |

**Promoted by Zyra:** `P-MIN-999` (#9 → #2), `P-API-DUAL` (#8 → #3)

**Demoted by Zyra:** `P-LUXZERA-HOODIE-001` (#1 → #4), `P-API-TRIPLE-01` (#2 → #7), `P-API-P6-FULL` (#5 → #8)

#### Human Verdict:
- [ ] Good
- [ ] Acceptable
- [ ] Poor

**Reason / Notes:**
> 

---

## Case: `EVAL-COLLEGE-03`
- **User:** `U-EVAL-CASUAL`
- **Occasion:** `college`

### Baseline Top 10 (Raw Retrieval)
| Rank | Product ID | Title | Category | Color | Retrieval Score |
| :---: | :--- | :--- | :--- | :--- | :---: |
| #1 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9500` |
| #2 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Heather Grey', 'primaryColor': 'Heather Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9450` |
| #3 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | {'sources': ['visual'], 'confidence': 0.83, 'colorFamily': 'Black', 'primaryColor': 'Black', 'secondaryColors': [], 'hasVisualEvidence': True, 'hasAttributeEvidence': False} | `0.9400` |
| #4 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Charcoal Grey', 'primaryColor': 'Charcoal Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9350` |
| #5 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9300` |
| #6 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9250` |
| #7 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9200` |
| #8 | `P-API-DUAL` | Product P-API-DUAL |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9150` |
| #9 | `P-MIN-999` | Product P-MIN-999 |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9100` |

### Zyra V0 Top 10 (Multi-Model Scoring)
| Rank | Product ID | Title | Category | Retrieval | Person | Outfit | Occasion | Final Score |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| #1 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | `0.940` | `0.785` | `0.790` | `0.815` | `0.825` |
| #2 | `P-MIN-999` | Product P-MIN-999 |  | `0.910` | `0.767` | `0.790` | `0.815` | `0.812` |
| #3 | `P-API-DUAL` | Product P-API-DUAL |  | `0.915` | `0.737` | `0.790` | `0.815` | `0.803` |
| #4 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | `0.935` | `0.808` | `0.790` | `0.640` | `0.788` |
| #5 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | `0.945` | `0.787` | `0.790` | `0.640` | `0.782` |
| #6 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | `0.950` | `0.782` | `0.790` | `0.640` | `0.782` |
| #7 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | `0.925` | `0.781` | `0.790` | `0.640` | `0.776` |
| #8 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | `0.930` | `0.725` | `0.750` | `0.640` | `0.750` |
| #9 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | `0.920` | `0.709` | `0.750` | `0.640` | `0.742` |

**Promoted by Zyra:** `P-MIN-999` (#9 → #2), `P-API-DUAL` (#8 → #3)

**Demoted by Zyra:** `P-API-TRIPLE-01` (#2 → #5), `P-LUXZERA-HOODIE-001` (#1 → #6), `P-API-P6-FULL` (#5 → #8)

#### Human Verdict:
- [ ] Good
- [ ] Acceptable
- [ ] Poor

**Reason / Notes:**
> 

---

## Case: `EVAL-CASUAL-01`
- **User:** `U-EVAL-CASUAL`
- **Occasion:** `casual`

### Baseline Top 10 (Raw Retrieval)
| Rank | Product ID | Title | Category | Color | Retrieval Score |
| :---: | :--- | :--- | :--- | :--- | :---: |
| #1 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9500` |
| #2 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Heather Grey', 'primaryColor': 'Heather Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9450` |
| #3 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | {'sources': ['visual'], 'confidence': 0.83, 'colorFamily': 'Black', 'primaryColor': 'Black', 'secondaryColors': [], 'hasVisualEvidence': True, 'hasAttributeEvidence': False} | `0.9400` |
| #4 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Charcoal Grey', 'primaryColor': 'Charcoal Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9350` |
| #5 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9300` |
| #6 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9250` |
| #7 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9200` |
| #8 | `P-API-DUAL` | Product P-API-DUAL |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9150` |
| #9 | `P-MIN-999` | Product P-MIN-999 |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9100` |

### Zyra V0 Top 10 (Multi-Model Scoring)
| Rank | Product ID | Title | Category | Retrieval | Person | Outfit | Occasion | Final Score |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| #1 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | `0.940` | `0.785` | `0.790` | `0.815` | `0.825` |
| #2 | `P-MIN-999` | Product P-MIN-999 |  | `0.910` | `0.767` | `0.790` | `0.815` | `0.812` |
| #3 | `P-API-DUAL` | Product P-API-DUAL |  | `0.915` | `0.737` | `0.790` | `0.815` | `0.803` |
| #4 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | `0.935` | `0.808` | `0.790` | `0.640` | `0.788` |
| #5 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | `0.945` | `0.787` | `0.790` | `0.640` | `0.782` |
| #6 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | `0.950` | `0.782` | `0.790` | `0.640` | `0.782` |
| #7 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | `0.925` | `0.781` | `0.790` | `0.640` | `0.776` |
| #8 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | `0.930` | `0.725` | `0.750` | `0.640` | `0.750` |
| #9 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | `0.920` | `0.709` | `0.750` | `0.640` | `0.742` |

**Promoted by Zyra:** `P-MIN-999` (#9 → #2), `P-API-DUAL` (#8 → #3)

**Demoted by Zyra:** `P-API-TRIPLE-01` (#2 → #5), `P-LUXZERA-HOODIE-001` (#1 → #6), `P-API-P6-FULL` (#5 → #8)

#### Human Verdict:
- [ ] Good
- [ ] Acceptable
- [ ] Poor

**Reason / Notes:**
> 

---

## Case: `EVAL-CASUAL-02`
- **User:** `U-EVAL-MINIMALIST`
- **Occasion:** `casual`

### Baseline Top 10 (Raw Retrieval)
| Rank | Product ID | Title | Category | Color | Retrieval Score |
| :---: | :--- | :--- | :--- | :--- | :---: |
| #1 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9500` |
| #2 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Heather Grey', 'primaryColor': 'Heather Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9450` |
| #3 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | {'sources': ['visual'], 'confidence': 0.83, 'colorFamily': 'Black', 'primaryColor': 'Black', 'secondaryColors': [], 'hasVisualEvidence': True, 'hasAttributeEvidence': False} | `0.9400` |
| #4 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Charcoal Grey', 'primaryColor': 'Charcoal Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9350` |
| #5 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9300` |
| #6 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9250` |
| #7 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9200` |
| #8 | `P-API-DUAL` | Product P-API-DUAL |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9150` |
| #9 | `P-MIN-999` | Product P-MIN-999 |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9100` |

### Zyra V0 Top 10 (Multi-Model Scoring)
| Rank | Product ID | Title | Category | Retrieval | Person | Outfit | Occasion | Final Score |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| #1 | `P-MIN-999` | Product P-MIN-999 |  | `0.910` | `0.763` | `0.790` | `0.815` | `0.811` |
| #2 | `P-API-DUAL` | Product P-API-DUAL |  | `0.915` | `0.741` | `0.790` | `0.815` | `0.804` |
| #3 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | `0.940` | `0.715` | `0.790` | `0.815` | `0.800` |
| #4 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | `0.945` | `0.806` | `0.790` | `0.640` | `0.789` |
| #5 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | `0.930` | `0.780` | `0.750` | `0.640` | `0.769` |
| #6 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | `0.920` | `0.765` | `0.750` | `0.640` | `0.762` |
| #7 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | `0.950` | `0.718` | `0.790` | `0.640` | `0.759` |
| #8 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | `0.925` | `0.726` | `0.790` | `0.640` | `0.757` |
| #9 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | `0.935` | `0.712` | `0.790` | `0.640` | `0.754` |

**Promoted by Zyra:** `P-MIN-999` (#9 → #1), `P-API-DUAL` (#8 → #2)

**Demoted by Zyra:** `P-LUXZERA-HOODIE-001` (#1 → #7), `P-API-P5-TEST` (#4 → #9)

#### Human Verdict:
- [ ] Good
- [ ] Acceptable
- [ ] Poor

**Reason / Notes:**
> 

---

## Case: `EVAL-CASUAL-03`
- **User:** `U-EVAL-ATHLETIC`
- **Occasion:** `casual`

### Baseline Top 10 (Raw Retrieval)
| Rank | Product ID | Title | Category | Color | Retrieval Score |
| :---: | :--- | :--- | :--- | :--- | :---: |
| #1 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9500` |
| #2 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Heather Grey', 'primaryColor': 'Heather Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9450` |
| #3 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | {'sources': ['visual'], 'confidence': 0.83, 'colorFamily': 'Black', 'primaryColor': 'Black', 'secondaryColors': [], 'hasVisualEvidence': True, 'hasAttributeEvidence': False} | `0.9400` |
| #4 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Charcoal Grey', 'primaryColor': 'Charcoal Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9350` |
| #5 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9300` |
| #6 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9250` |
| #7 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9200` |
| #8 | `P-API-DUAL` | Product P-API-DUAL |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9150` |
| #9 | `P-MIN-999` | Product P-MIN-999 |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9100` |

### Zyra V0 Top 10 (Multi-Model Scoring)
| Rank | Product ID | Title | Category | Retrieval | Person | Outfit | Occasion | Final Score |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| #1 | `P-MIN-999` | Product P-MIN-999 |  | `0.910` | `0.770` | `0.790` | `0.815` | `0.813` |
| #2 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | `0.940` | `0.748` | `0.790` | `0.815` | `0.811` |
| #3 | `P-API-DUAL` | Product P-API-DUAL |  | `0.915` | `0.746` | `0.790` | `0.815` | `0.806` |
| #4 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | `0.950` | `0.754` | `0.790` | `0.640` | `0.772` |
| #5 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | `0.945` | `0.750` | `0.790` | `0.640` | `0.769` |
| #6 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | `0.935` | `0.750` | `0.790` | `0.640` | `0.767` |
| #7 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | `0.925` | `0.748` | `0.790` | `0.640` | `0.765` |
| #8 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | `0.930` | `0.754` | `0.750` | `0.640` | `0.760` |
| #9 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | `0.920` | `0.738` | `0.750` | `0.640` | `0.752` |

**Promoted by Zyra:** `P-MIN-999` (#9 → #1), `P-API-DUAL` (#8 → #3)

**Demoted by Zyra:** `P-LUXZERA-HOODIE-001` (#1 → #4), `P-API-TRIPLE-01` (#2 → #5), `P-API-P6-FULL` (#5 → #8)

#### Human Verdict:
- [ ] Good
- [ ] Acceptable
- [ ] Poor

**Reason / Notes:**
> 

---

## Case: `EVAL-PARTY-01`
- **User:** `U-EVAL-STREETWEAR`
- **Occasion:** `party`

### Baseline Top 10 (Raw Retrieval)
| Rank | Product ID | Title | Category | Color | Retrieval Score |
| :---: | :--- | :--- | :--- | :--- | :---: |
| #1 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9500` |
| #2 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Heather Grey', 'primaryColor': 'Heather Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9450` |
| #3 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | {'sources': ['visual'], 'confidence': 0.83, 'colorFamily': 'Black', 'primaryColor': 'Black', 'secondaryColors': [], 'hasVisualEvidence': True, 'hasAttributeEvidence': False} | `0.9400` |
| #4 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Charcoal Grey', 'primaryColor': 'Charcoal Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9350` |
| #5 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9300` |
| #6 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9250` |
| #7 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9200` |
| #8 | `P-API-DUAL` | Product P-API-DUAL |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9150` |
| #9 | `P-MIN-999` | Product P-MIN-999 |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9100` |

### Zyra V0 Top 10 (Multi-Model Scoring)
| Rank | Product ID | Title | Category | Retrieval | Person | Outfit | Occasion | Final Score |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| #1 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | `0.940` | `0.807` | `0.790` | `0.750` | `0.816` |
| #2 | `P-MIN-999` | Product P-MIN-999 |  | `0.910` | `0.767` | `0.790` | `0.750` | `0.796` |
| #3 | `P-API-DUAL` | Product P-API-DUAL |  | `0.915` | `0.745` | `0.790` | `0.750` | `0.789` |
| #4 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | `0.950` | `0.825` | `0.790` | `0.575` | `0.780` |
| #5 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | `0.935` | `0.812` | `0.790` | `0.575` | `0.773` |
| #6 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | `0.925` | `0.807` | `0.790` | `0.575` | `0.769` |
| #7 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | `0.945` | `0.716` | `0.790` | `0.575` | `0.742` |
| #8 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | `0.930` | `0.654` | `0.750` | `0.575` | `0.709` |
| #9 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | `0.920` | `0.649` | `0.750` | `0.575` | `0.705` |

**Promoted by Zyra:** `P-MIN-999` (#9 → #2), `P-API-DUAL` (#8 → #3)

**Demoted by Zyra:** `P-LUXZERA-HOODIE-001` (#1 → #4), `P-API-TRIPLE-01` (#2 → #7), `P-API-P6-FULL` (#5 → #8)

#### Human Verdict:
- [ ] Good
- [ ] Acceptable
- [ ] Poor

**Reason / Notes:**
> 

---

## Case: `EVAL-PARTY-02`
- **User:** `U-EVAL-FORMAL`
- **Occasion:** `party`

### Baseline Top 10 (Raw Retrieval)
| Rank | Product ID | Title | Category | Color | Retrieval Score |
| :---: | :--- | :--- | :--- | :--- | :---: |
| #1 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9500` |
| #2 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Heather Grey', 'primaryColor': 'Heather Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9450` |
| #3 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | {'sources': ['visual'], 'confidence': 0.83, 'colorFamily': 'Black', 'primaryColor': 'Black', 'secondaryColors': [], 'hasVisualEvidence': True, 'hasAttributeEvidence': False} | `0.9400` |
| #4 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Charcoal Grey', 'primaryColor': 'Charcoal Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9350` |
| #5 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9300` |
| #6 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9250` |
| #7 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9200` |
| #8 | `P-API-DUAL` | Product P-API-DUAL |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9150` |
| #9 | `P-MIN-999` | Product P-MIN-999 |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9100` |

### Zyra V0 Top 10 (Multi-Model Scoring)
| Rank | Product ID | Title | Category | Retrieval | Person | Outfit | Occasion | Final Score |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| #1 | `P-MIN-999` | Product P-MIN-999 |  | `0.910` | `0.743` | `0.790` | `0.750` | `0.788` |
| #2 | `P-API-DUAL` | Product P-API-DUAL |  | `0.915` | `0.720` | `0.790` | `0.750` | `0.781` |
| #3 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | `0.920` | `0.810` | `0.750` | `0.575` | `0.761` |
| #4 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | `0.945` | `0.758` | `0.790` | `0.575` | `0.756` |
| #5 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | `0.940` | `0.633` | `0.790` | `0.750` | `0.755` |
| #6 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | `0.930` | `0.783` | `0.750` | `0.575` | `0.754` |
| #7 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | `0.950` | `0.636` | `0.790` | `0.575` | `0.715` |
| #8 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | `0.935` | `0.633` | `0.790` | `0.575` | `0.710` |
| #9 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | `0.925` | `0.636` | `0.790` | `0.575` | `0.709` |

**Promoted by Zyra:** `P-MIN-999` (#9 → #1), `P-API-DUAL` (#8 → #2), `P-API-P7-FULL` (#7 → #3)

**Demoted by Zyra:** `P-LUXZERA-HOODIE-001` (#1 → #7), `P-API-P5-TEST` (#4 → #8), `P-98765-HOODIE` (#6 → #9)

#### Human Verdict:
- [ ] Good
- [ ] Acceptable
- [ ] Poor

**Reason / Notes:**
> 

---

## Case: `EVAL-PARTY-03`
- **User:** `U-EVAL-ETHNIC`
- **Occasion:** `party`

### Baseline Top 10 (Raw Retrieval)
| Rank | Product ID | Title | Category | Color | Retrieval Score |
| :---: | :--- | :--- | :--- | :--- | :---: |
| #1 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9500` |
| #2 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Heather Grey', 'primaryColor': 'Heather Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9450` |
| #3 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | {'sources': ['visual'], 'confidence': 0.83, 'colorFamily': 'Black', 'primaryColor': 'Black', 'secondaryColors': [], 'hasVisualEvidence': True, 'hasAttributeEvidence': False} | `0.9400` |
| #4 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Charcoal Grey', 'primaryColor': 'Charcoal Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9350` |
| #5 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9300` |
| #6 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9250` |
| #7 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9200` |
| #8 | `P-API-DUAL` | Product P-API-DUAL |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9150` |
| #9 | `P-MIN-999` | Product P-MIN-999 |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9100` |

### Zyra V0 Top 10 (Multi-Model Scoring)
| Rank | Product ID | Title | Category | Retrieval | Person | Outfit | Occasion | Final Score |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| #1 | `P-MIN-999` | Product P-MIN-999 |  | `0.910` | `0.763` | `0.790` | `0.750` | `0.795` |
| #2 | `P-API-DUAL` | Product P-API-DUAL |  | `0.915` | `0.733` | `0.790` | `0.750` | `0.785` |
| #3 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | `0.940` | `0.718` | `0.790` | `0.750` | `0.785` |
| #4 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | `0.945` | `0.809` | `0.790` | `0.575` | `0.774` |
| #5 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | `0.930` | `0.784` | `0.750` | `0.575` | `0.754` |
| #6 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | `0.920` | `0.773` | `0.750` | `0.575` | `0.748` |
| #7 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | `0.950` | `0.720` | `0.790` | `0.575` | `0.744` |
| #8 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | `0.935` | `0.724` | `0.790` | `0.575` | `0.742` |
| #9 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | `0.925` | `0.724` | `0.790` | `0.575` | `0.740` |

**Promoted by Zyra:** `P-MIN-999` (#9 → #1), `P-API-DUAL` (#8 → #2)

**Demoted by Zyra:** `P-LUXZERA-HOODIE-001` (#1 → #7), `P-API-P5-TEST` (#4 → #8), `P-98765-HOODIE` (#6 → #9)

#### Human Verdict:
- [ ] Good
- [ ] Acceptable
- [ ] Poor

**Reason / Notes:**
> 

---

## Case: `EVAL-FORMAL-01`
- **User:** `U-EVAL-FORMAL`
- **Occasion:** `formal`

### Baseline Top 10 (Raw Retrieval)
| Rank | Product ID | Title | Category | Color | Retrieval Score |
| :---: | :--- | :--- | :--- | :--- | :---: |
| #1 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9500` |
| #2 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Heather Grey', 'primaryColor': 'Heather Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9450` |
| #3 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | {'sources': ['visual'], 'confidence': 0.83, 'colorFamily': 'Black', 'primaryColor': 'Black', 'secondaryColors': [], 'hasVisualEvidence': True, 'hasAttributeEvidence': False} | `0.9400` |
| #4 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Charcoal Grey', 'primaryColor': 'Charcoal Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9350` |
| #5 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9300` |
| #6 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9250` |
| #7 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9200` |
| #8 | `P-API-DUAL` | Product P-API-DUAL |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9150` |
| #9 | `P-MIN-999` | Product P-MIN-999 |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9100` |

### Zyra V0 Top 10 (Multi-Model Scoring)
| Rank | Product ID | Title | Category | Retrieval | Person | Outfit | Occasion | Final Score |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| #1 | `P-MIN-999` | Product P-MIN-999 |  | `0.910` | `0.743` | `0.790` | `0.450` | `0.713` |
| #2 | `P-API-DUAL` | Product P-API-DUAL |  | `0.915` | `0.720` | `0.790` | `0.450` | `0.706` |
| #3 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | `0.920` | `0.810` | `0.750` | `0.275` | `0.686` |
| #4 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | `0.945` | `0.758` | `0.790` | `0.275` | `0.681` |
| #5 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | `0.940` | `0.633` | `0.790` | `0.450` | `0.680` |
| #6 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | `0.930` | `0.783` | `0.750` | `0.275` | `0.679` |
| #7 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | `0.950` | `0.636` | `0.790` | `0.275` | `0.639` |
| #8 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | `0.935` | `0.633` | `0.790` | `0.275` | `0.635` |
| #9 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | `0.925` | `0.636` | `0.790` | `0.275` | `0.634` |

**Promoted by Zyra:** `P-MIN-999` (#9 → #1), `P-API-DUAL` (#8 → #2), `P-API-P7-FULL` (#7 → #3)

**Demoted by Zyra:** `P-LUXZERA-HOODIE-001` (#1 → #7), `P-API-P5-TEST` (#4 → #8), `P-98765-HOODIE` (#6 → #9)

#### Human Verdict:
- [ ] Good
- [ ] Acceptable
- [ ] Poor

**Reason / Notes:**
> 

---

## Case: `EVAL-FORMAL-02`
- **User:** `U-EVAL-MINIMALIST`
- **Occasion:** `formal`

### Baseline Top 10 (Raw Retrieval)
| Rank | Product ID | Title | Category | Color | Retrieval Score |
| :---: | :--- | :--- | :--- | :--- | :---: |
| #1 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9500` |
| #2 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Heather Grey', 'primaryColor': 'Heather Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9450` |
| #3 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | {'sources': ['visual'], 'confidence': 0.83, 'colorFamily': 'Black', 'primaryColor': 'Black', 'secondaryColors': [], 'hasVisualEvidence': True, 'hasAttributeEvidence': False} | `0.9400` |
| #4 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Charcoal Grey', 'primaryColor': 'Charcoal Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9350` |
| #5 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9300` |
| #6 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9250` |
| #7 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9200` |
| #8 | `P-API-DUAL` | Product P-API-DUAL |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9150` |
| #9 | `P-MIN-999` | Product P-MIN-999 |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9100` |

### Zyra V0 Top 10 (Multi-Model Scoring)
| Rank | Product ID | Title | Category | Retrieval | Person | Outfit | Occasion | Final Score |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| #1 | `P-MIN-999` | Product P-MIN-999 |  | `0.910` | `0.763` | `0.790` | `0.450` | `0.719` |
| #2 | `P-API-DUAL` | Product P-API-DUAL |  | `0.915` | `0.741` | `0.790` | `0.450` | `0.713` |
| #3 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | `0.940` | `0.715` | `0.790` | `0.450` | `0.709` |
| #4 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | `0.945` | `0.806` | `0.790` | `0.275` | `0.698` |
| #5 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | `0.930` | `0.780` | `0.750` | `0.275` | `0.678` |
| #6 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | `0.920` | `0.765` | `0.750` | `0.275` | `0.670` |
| #7 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | `0.950` | `0.718` | `0.790` | `0.275` | `0.668` |
| #8 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | `0.925` | `0.726` | `0.790` | `0.275` | `0.666` |
| #9 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | `0.935` | `0.712` | `0.790` | `0.275` | `0.663` |

**Promoted by Zyra:** `P-MIN-999` (#9 → #1), `P-API-DUAL` (#8 → #2)

**Demoted by Zyra:** `P-LUXZERA-HOODIE-001` (#1 → #7), `P-API-P5-TEST` (#4 → #9)

#### Human Verdict:
- [ ] Good
- [ ] Acceptable
- [ ] Poor

**Reason / Notes:**
> 

---

## Case: `EVAL-FORMAL-03`
- **User:** `U-EVAL-ETHNIC`
- **Occasion:** `formal`

### Baseline Top 10 (Raw Retrieval)
| Rank | Product ID | Title | Category | Color | Retrieval Score |
| :---: | :--- | :--- | :--- | :--- | :---: |
| #1 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9500` |
| #2 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Heather Grey', 'primaryColor': 'Heather Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9450` |
| #3 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | {'sources': ['visual'], 'confidence': 0.83, 'colorFamily': 'Black', 'primaryColor': 'Black', 'secondaryColors': [], 'hasVisualEvidence': True, 'hasAttributeEvidence': False} | `0.9400` |
| #4 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Charcoal Grey', 'primaryColor': 'Charcoal Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9350` |
| #5 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9300` |
| #6 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9250` |
| #7 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9200` |
| #8 | `P-API-DUAL` | Product P-API-DUAL |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9150` |
| #9 | `P-MIN-999` | Product P-MIN-999 |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9100` |

### Zyra V0 Top 10 (Multi-Model Scoring)
| Rank | Product ID | Title | Category | Retrieval | Person | Outfit | Occasion | Final Score |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| #1 | `P-MIN-999` | Product P-MIN-999 |  | `0.910` | `0.763` | `0.790` | `0.450` | `0.720` |
| #2 | `P-API-DUAL` | Product P-API-DUAL |  | `0.915` | `0.733` | `0.790` | `0.450` | `0.710` |
| #3 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | `0.940` | `0.718` | `0.790` | `0.450` | `0.710` |
| #4 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | `0.945` | `0.809` | `0.790` | `0.275` | `0.699` |
| #5 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | `0.930` | `0.784` | `0.750` | `0.275` | `0.679` |
| #6 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | `0.920` | `0.773` | `0.750` | `0.275` | `0.673` |
| #7 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | `0.950` | `0.720` | `0.790` | `0.275` | `0.669` |
| #8 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | `0.935` | `0.724` | `0.790` | `0.275` | `0.667` |
| #9 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | `0.925` | `0.724` | `0.790` | `0.275` | `0.665` |

**Promoted by Zyra:** `P-MIN-999` (#9 → #1), `P-API-DUAL` (#8 → #2)

**Demoted by Zyra:** `P-LUXZERA-HOODIE-001` (#1 → #7), `P-API-P5-TEST` (#4 → #8), `P-98765-HOODIE` (#6 → #9)

#### Human Verdict:
- [ ] Good
- [ ] Acceptable
- [ ] Poor

**Reason / Notes:**
> 

---

## Case: `EVAL-WEDDING-01`
- **User:** `U-EVAL-ETHNIC`
- **Occasion:** `wedding`

### Baseline Top 10 (Raw Retrieval)
| Rank | Product ID | Title | Category | Color | Retrieval Score |
| :---: | :--- | :--- | :--- | :--- | :---: |
| #1 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9500` |
| #2 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Heather Grey', 'primaryColor': 'Heather Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9450` |
| #3 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | {'sources': ['visual'], 'confidence': 0.83, 'colorFamily': 'Black', 'primaryColor': 'Black', 'secondaryColors': [], 'hasVisualEvidence': True, 'hasAttributeEvidence': False} | `0.9400` |
| #4 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Charcoal Grey', 'primaryColor': 'Charcoal Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9350` |
| #5 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9300` |
| #6 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9250` |
| #7 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9200` |
| #8 | `P-API-DUAL` | Product P-API-DUAL |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9150` |
| #9 | `P-MIN-999` | Product P-MIN-999 |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9100` |

### Zyra V0 Top 10 (Multi-Model Scoring)
| Rank | Product ID | Title | Category | Retrieval | Person | Outfit | Occasion | Final Score |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| #1 | `P-MIN-999` | Product P-MIN-999 |  | `0.910` | `0.763` | `0.790` | `0.450` | `0.720` |
| #2 | `P-API-DUAL` | Product P-API-DUAL |  | `0.915` | `0.733` | `0.790` | `0.450` | `0.710` |
| #3 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | `0.940` | `0.718` | `0.790` | `0.450` | `0.710` |
| #4 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | `0.945` | `0.809` | `0.790` | `0.275` | `0.699` |
| #5 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | `0.930` | `0.784` | `0.750` | `0.275` | `0.679` |
| #6 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | `0.920` | `0.773` | `0.750` | `0.275` | `0.673` |
| #7 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | `0.950` | `0.720` | `0.790` | `0.275` | `0.669` |
| #8 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | `0.935` | `0.724` | `0.790` | `0.275` | `0.667` |
| #9 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | `0.925` | `0.724` | `0.790` | `0.275` | `0.665` |

**Promoted by Zyra:** `P-MIN-999` (#9 → #1), `P-API-DUAL` (#8 → #2)

**Demoted by Zyra:** `P-LUXZERA-HOODIE-001` (#1 → #7), `P-API-P5-TEST` (#4 → #8), `P-98765-HOODIE` (#6 → #9)

#### Human Verdict:
- [ ] Good
- [ ] Acceptable
- [ ] Poor

**Reason / Notes:**
> 

---

## Case: `EVAL-WEDDING-02`
- **User:** `U-EVAL-FORMAL`
- **Occasion:** `wedding`

### Baseline Top 10 (Raw Retrieval)
| Rank | Product ID | Title | Category | Color | Retrieval Score |
| :---: | :--- | :--- | :--- | :--- | :---: |
| #1 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9500` |
| #2 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Heather Grey', 'primaryColor': 'Heather Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9450` |
| #3 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | {'sources': ['visual'], 'confidence': 0.83, 'colorFamily': 'Black', 'primaryColor': 'Black', 'secondaryColors': [], 'hasVisualEvidence': True, 'hasAttributeEvidence': False} | `0.9400` |
| #4 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Charcoal Grey', 'primaryColor': 'Charcoal Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9350` |
| #5 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9300` |
| #6 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9250` |
| #7 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9200` |
| #8 | `P-API-DUAL` | Product P-API-DUAL |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9150` |
| #9 | `P-MIN-999` | Product P-MIN-999 |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9100` |

### Zyra V0 Top 10 (Multi-Model Scoring)
| Rank | Product ID | Title | Category | Retrieval | Person | Outfit | Occasion | Final Score |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| #1 | `P-MIN-999` | Product P-MIN-999 |  | `0.910` | `0.743` | `0.790` | `0.450` | `0.713` |
| #2 | `P-API-DUAL` | Product P-API-DUAL |  | `0.915` | `0.720` | `0.790` | `0.450` | `0.706` |
| #3 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | `0.920` | `0.810` | `0.750` | `0.275` | `0.686` |
| #4 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | `0.945` | `0.758` | `0.790` | `0.275` | `0.681` |
| #5 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | `0.940` | `0.633` | `0.790` | `0.450` | `0.680` |
| #6 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | `0.930` | `0.783` | `0.750` | `0.275` | `0.679` |
| #7 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | `0.950` | `0.636` | `0.790` | `0.275` | `0.639` |
| #8 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | `0.935` | `0.633` | `0.790` | `0.275` | `0.635` |
| #9 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | `0.925` | `0.636` | `0.790` | `0.275` | `0.634` |

**Promoted by Zyra:** `P-MIN-999` (#9 → #1), `P-API-DUAL` (#8 → #2), `P-API-P7-FULL` (#7 → #3)

**Demoted by Zyra:** `P-LUXZERA-HOODIE-001` (#1 → #7), `P-API-P5-TEST` (#4 → #8), `P-98765-HOODIE` (#6 → #9)

#### Human Verdict:
- [ ] Good
- [ ] Acceptable
- [ ] Poor

**Reason / Notes:**
> 

---

## Case: `EVAL-WEDDING-03`
- **User:** `U-EVAL-MINIMALIST`
- **Occasion:** `wedding`

### Baseline Top 10 (Raw Retrieval)
| Rank | Product ID | Title | Category | Color | Retrieval Score |
| :---: | :--- | :--- | :--- | :--- | :---: |
| #1 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9500` |
| #2 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Heather Grey', 'primaryColor': 'Heather Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9450` |
| #3 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | {'sources': ['visual'], 'confidence': 0.83, 'colorFamily': 'Black', 'primaryColor': 'Black', 'secondaryColors': [], 'hasVisualEvidence': True, 'hasAttributeEvidence': False} | `0.9400` |
| #4 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Charcoal Grey', 'primaryColor': 'Charcoal Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9350` |
| #5 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9300` |
| #6 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9250` |
| #7 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9200` |
| #8 | `P-API-DUAL` | Product P-API-DUAL |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9150` |
| #9 | `P-MIN-999` | Product P-MIN-999 |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9100` |

### Zyra V0 Top 10 (Multi-Model Scoring)
| Rank | Product ID | Title | Category | Retrieval | Person | Outfit | Occasion | Final Score |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| #1 | `P-MIN-999` | Product P-MIN-999 |  | `0.910` | `0.763` | `0.790` | `0.450` | `0.719` |
| #2 | `P-API-DUAL` | Product P-API-DUAL |  | `0.915` | `0.741` | `0.790` | `0.450` | `0.713` |
| #3 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | `0.940` | `0.715` | `0.790` | `0.450` | `0.709` |
| #4 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | `0.945` | `0.806` | `0.790` | `0.275` | `0.698` |
| #5 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | `0.930` | `0.780` | `0.750` | `0.275` | `0.678` |
| #6 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | `0.920` | `0.765` | `0.750` | `0.275` | `0.670` |
| #7 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | `0.950` | `0.718` | `0.790` | `0.275` | `0.668` |
| #8 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | `0.925` | `0.726` | `0.790` | `0.275` | `0.666` |
| #9 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | `0.935` | `0.712` | `0.790` | `0.275` | `0.663` |

**Promoted by Zyra:** `P-MIN-999` (#9 → #1), `P-API-DUAL` (#8 → #2)

**Demoted by Zyra:** `P-LUXZERA-HOODIE-001` (#1 → #7), `P-API-P5-TEST` (#4 → #9)

#### Human Verdict:
- [ ] Good
- [ ] Acceptable
- [ ] Poor

**Reason / Notes:**
> 

---

## Case: `EVAL-DATE-01`
- **User:** `U-EVAL-MINIMALIST`
- **Occasion:** `date`

### Baseline Top 10 (Raw Retrieval)
| Rank | Product ID | Title | Category | Color | Retrieval Score |
| :---: | :--- | :--- | :--- | :--- | :---: |
| #1 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9500` |
| #2 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Heather Grey', 'primaryColor': 'Heather Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9450` |
| #3 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | {'sources': ['visual'], 'confidence': 0.83, 'colorFamily': 'Black', 'primaryColor': 'Black', 'secondaryColors': [], 'hasVisualEvidence': True, 'hasAttributeEvidence': False} | `0.9400` |
| #4 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Charcoal Grey', 'primaryColor': 'Charcoal Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9350` |
| #5 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9300` |
| #6 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9250` |
| #7 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9200` |
| #8 | `P-API-DUAL` | Product P-API-DUAL |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9150` |
| #9 | `P-MIN-999` | Product P-MIN-999 |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9100` |

### Zyra V0 Top 10 (Multi-Model Scoring)
| Rank | Product ID | Title | Category | Retrieval | Person | Outfit | Occasion | Final Score |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| #1 | `P-MIN-999` | Product P-MIN-999 |  | `0.910` | `0.763` | `0.790` | `0.750` | `0.794` |
| #2 | `P-API-DUAL` | Product P-API-DUAL |  | `0.915` | `0.741` | `0.790` | `0.750` | `0.788` |
| #3 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | `0.940` | `0.715` | `0.790` | `0.750` | `0.784` |
| #4 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | `0.945` | `0.806` | `0.790` | `0.575` | `0.773` |
| #5 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | `0.930` | `0.780` | `0.750` | `0.575` | `0.753` |
| #6 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | `0.920` | `0.765` | `0.750` | `0.575` | `0.746` |
| #7 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | `0.950` | `0.718` | `0.790` | `0.575` | `0.743` |
| #8 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | `0.925` | `0.726` | `0.790` | `0.575` | `0.741` |
| #9 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | `0.935` | `0.712` | `0.790` | `0.575` | `0.738` |

**Promoted by Zyra:** `P-MIN-999` (#9 → #1), `P-API-DUAL` (#8 → #2)

**Demoted by Zyra:** `P-LUXZERA-HOODIE-001` (#1 → #7), `P-API-P5-TEST` (#4 → #9)

#### Human Verdict:
- [ ] Good
- [ ] Acceptable
- [ ] Poor

**Reason / Notes:**
> 

---

## Case: `EVAL-DATE-02`
- **User:** `U-EVAL-STREETWEAR`
- **Occasion:** `date`

### Baseline Top 10 (Raw Retrieval)
| Rank | Product ID | Title | Category | Color | Retrieval Score |
| :---: | :--- | :--- | :--- | :--- | :---: |
| #1 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9500` |
| #2 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Heather Grey', 'primaryColor': 'Heather Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9450` |
| #3 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | {'sources': ['visual'], 'confidence': 0.83, 'colorFamily': 'Black', 'primaryColor': 'Black', 'secondaryColors': [], 'hasVisualEvidence': True, 'hasAttributeEvidence': False} | `0.9400` |
| #4 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Charcoal Grey', 'primaryColor': 'Charcoal Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9350` |
| #5 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9300` |
| #6 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9250` |
| #7 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9200` |
| #8 | `P-API-DUAL` | Product P-API-DUAL |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9150` |
| #9 | `P-MIN-999` | Product P-MIN-999 |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9100` |

### Zyra V0 Top 10 (Multi-Model Scoring)
| Rank | Product ID | Title | Category | Retrieval | Person | Outfit | Occasion | Final Score |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| #1 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | `0.940` | `0.807` | `0.790` | `0.750` | `0.816` |
| #2 | `P-MIN-999` | Product P-MIN-999 |  | `0.910` | `0.767` | `0.790` | `0.750` | `0.796` |
| #3 | `P-API-DUAL` | Product P-API-DUAL |  | `0.915` | `0.745` | `0.790` | `0.750` | `0.789` |
| #4 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | `0.950` | `0.825` | `0.790` | `0.575` | `0.780` |
| #5 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | `0.935` | `0.812` | `0.790` | `0.575` | `0.773` |
| #6 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | `0.925` | `0.807` | `0.790` | `0.575` | `0.769` |
| #7 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | `0.945` | `0.716` | `0.790` | `0.575` | `0.742` |
| #8 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | `0.930` | `0.654` | `0.750` | `0.575` | `0.709` |
| #9 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | `0.920` | `0.649` | `0.750` | `0.575` | `0.705` |

**Promoted by Zyra:** `P-MIN-999` (#9 → #2), `P-API-DUAL` (#8 → #3)

**Demoted by Zyra:** `P-LUXZERA-HOODIE-001` (#1 → #4), `P-API-TRIPLE-01` (#2 → #7), `P-API-P6-FULL` (#5 → #8)

#### Human Verdict:
- [ ] Good
- [ ] Acceptable
- [ ] Poor

**Reason / Notes:**
> 

---

## Case: `EVAL-DATE-03`
- **User:** `U-EVAL-CASUAL`
- **Occasion:** `date`

### Baseline Top 10 (Raw Retrieval)
| Rank | Product ID | Title | Category | Color | Retrieval Score |
| :---: | :--- | :--- | :--- | :--- | :---: |
| #1 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9500` |
| #2 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Heather Grey', 'primaryColor': 'Heather Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9450` |
| #3 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | {'sources': ['visual'], 'confidence': 0.83, 'colorFamily': 'Black', 'primaryColor': 'Black', 'secondaryColors': [], 'hasVisualEvidence': True, 'hasAttributeEvidence': False} | `0.9400` |
| #4 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Charcoal Grey', 'primaryColor': 'Charcoal Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9350` |
| #5 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9300` |
| #6 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9250` |
| #7 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9200` |
| #8 | `P-API-DUAL` | Product P-API-DUAL |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9150` |
| #9 | `P-MIN-999` | Product P-MIN-999 |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9100` |

### Zyra V0 Top 10 (Multi-Model Scoring)
| Rank | Product ID | Title | Category | Retrieval | Person | Outfit | Occasion | Final Score |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| #1 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | `0.940` | `0.785` | `0.790` | `0.750` | `0.808` |
| #2 | `P-MIN-999` | Product P-MIN-999 |  | `0.910` | `0.767` | `0.790` | `0.750` | `0.796` |
| #3 | `P-API-DUAL` | Product P-API-DUAL |  | `0.915` | `0.737` | `0.790` | `0.750` | `0.786` |
| #4 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | `0.935` | `0.808` | `0.790` | `0.575` | `0.771` |
| #5 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | `0.945` | `0.787` | `0.790` | `0.575` | `0.766` |
| #6 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | `0.950` | `0.782` | `0.790` | `0.575` | `0.765` |
| #7 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | `0.925` | `0.781` | `0.790` | `0.575` | `0.760` |
| #8 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | `0.930` | `0.725` | `0.750` | `0.575` | `0.733` |
| #9 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | `0.920` | `0.709` | `0.750` | `0.575` | `0.726` |

**Promoted by Zyra:** `P-MIN-999` (#9 → #2), `P-API-DUAL` (#8 → #3)

**Demoted by Zyra:** `P-API-TRIPLE-01` (#2 → #5), `P-LUXZERA-HOODIE-001` (#1 → #6), `P-API-P6-FULL` (#5 → #8)

#### Human Verdict:
- [ ] Good
- [ ] Acceptable
- [ ] Poor

**Reason / Notes:**
> 

---

## Case: `EVAL-WORK-01`
- **User:** `U-EVAL-FORMAL`
- **Occasion:** `work`

### Baseline Top 10 (Raw Retrieval)
| Rank | Product ID | Title | Category | Color | Retrieval Score |
| :---: | :--- | :--- | :--- | :--- | :---: |
| #1 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9500` |
| #2 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Heather Grey', 'primaryColor': 'Heather Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9450` |
| #3 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | {'sources': ['visual'], 'confidence': 0.83, 'colorFamily': 'Black', 'primaryColor': 'Black', 'secondaryColors': [], 'hasVisualEvidence': True, 'hasAttributeEvidence': False} | `0.9400` |
| #4 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Charcoal Grey', 'primaryColor': 'Charcoal Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9350` |
| #5 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9300` |
| #6 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9250` |
| #7 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9200` |
| #8 | `P-API-DUAL` | Product P-API-DUAL |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9150` |
| #9 | `P-MIN-999` | Product P-MIN-999 |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9100` |

### Zyra V0 Top 10 (Multi-Model Scoring)
| Rank | Product ID | Title | Category | Retrieval | Person | Outfit | Occasion | Final Score |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| #1 | `P-MIN-999` | Product P-MIN-999 |  | `0.910` | `0.743` | `0.790` | `0.650` | `0.763` |
| #2 | `P-API-DUAL` | Product P-API-DUAL |  | `0.915` | `0.720` | `0.790` | `0.650` | `0.756` |
| #3 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | `0.920` | `0.810` | `0.750` | `0.475` | `0.736` |
| #4 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | `0.945` | `0.758` | `0.790` | `0.475` | `0.731` |
| #5 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | `0.940` | `0.633` | `0.790` | `0.650` | `0.730` |
| #6 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | `0.930` | `0.783` | `0.750` | `0.475` | `0.729` |
| #7 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | `0.950` | `0.636` | `0.790` | `0.475` | `0.690` |
| #8 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | `0.935` | `0.633` | `0.790` | `0.475` | `0.685` |
| #9 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | `0.925` | `0.636` | `0.790` | `0.475` | `0.684` |

**Promoted by Zyra:** `P-MIN-999` (#9 → #1), `P-API-DUAL` (#8 → #2), `P-API-P7-FULL` (#7 → #3)

**Demoted by Zyra:** `P-LUXZERA-HOODIE-001` (#1 → #7), `P-API-P5-TEST` (#4 → #8), `P-98765-HOODIE` (#6 → #9)

#### Human Verdict:
- [ ] Good
- [ ] Acceptable
- [ ] Poor

**Reason / Notes:**
> 

---

## Case: `EVAL-WORK-02`
- **User:** `U-EVAL-MINIMALIST`
- **Occasion:** `work`

### Baseline Top 10 (Raw Retrieval)
| Rank | Product ID | Title | Category | Color | Retrieval Score |
| :---: | :--- | :--- | :--- | :--- | :---: |
| #1 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9500` |
| #2 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Heather Grey', 'primaryColor': 'Heather Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9450` |
| #3 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | {'sources': ['visual'], 'confidence': 0.83, 'colorFamily': 'Black', 'primaryColor': 'Black', 'secondaryColors': [], 'hasVisualEvidence': True, 'hasAttributeEvidence': False} | `0.9400` |
| #4 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Charcoal Grey', 'primaryColor': 'Charcoal Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9350` |
| #5 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9300` |
| #6 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9250` |
| #7 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9200` |
| #8 | `P-API-DUAL` | Product P-API-DUAL |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9150` |
| #9 | `P-MIN-999` | Product P-MIN-999 |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9100` |

### Zyra V0 Top 10 (Multi-Model Scoring)
| Rank | Product ID | Title | Category | Retrieval | Person | Outfit | Occasion | Final Score |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| #1 | `P-MIN-999` | Product P-MIN-999 |  | `0.910` | `0.763` | `0.790` | `0.650` | `0.769` |
| #2 | `P-API-DUAL` | Product P-API-DUAL |  | `0.915` | `0.741` | `0.790` | `0.650` | `0.763` |
| #3 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | `0.940` | `0.715` | `0.790` | `0.650` | `0.759` |
| #4 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | `0.945` | `0.806` | `0.790` | `0.475` | `0.748` |
| #5 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | `0.930` | `0.780` | `0.750` | `0.475` | `0.728` |
| #6 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | `0.920` | `0.765` | `0.750` | `0.475` | `0.721` |
| #7 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | `0.950` | `0.718` | `0.790` | `0.475` | `0.718` |
| #8 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | `0.925` | `0.726` | `0.790` | `0.475` | `0.716` |
| #9 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | `0.935` | `0.712` | `0.790` | `0.475` | `0.713` |

**Promoted by Zyra:** `P-MIN-999` (#9 → #1), `P-API-DUAL` (#8 → #2)

**Demoted by Zyra:** `P-LUXZERA-HOODIE-001` (#1 → #7), `P-API-P5-TEST` (#4 → #9)

#### Human Verdict:
- [ ] Good
- [ ] Acceptable
- [ ] Poor

**Reason / Notes:**
> 

---

## Case: `EVAL-WORK-03`
- **User:** `U-EVAL-CASUAL`
- **Occasion:** `work`

### Baseline Top 10 (Raw Retrieval)
| Rank | Product ID | Title | Category | Color | Retrieval Score |
| :---: | :--- | :--- | :--- | :--- | :---: |
| #1 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9500` |
| #2 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Heather Grey', 'primaryColor': 'Heather Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9450` |
| #3 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | {'sources': ['visual'], 'confidence': 0.83, 'colorFamily': 'Black', 'primaryColor': 'Black', 'secondaryColors': [], 'hasVisualEvidence': True, 'hasAttributeEvidence': False} | `0.9400` |
| #4 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Charcoal Grey', 'primaryColor': 'Charcoal Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9350` |
| #5 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9300` |
| #6 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9250` |
| #7 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9200` |
| #8 | `P-API-DUAL` | Product P-API-DUAL |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9150` |
| #9 | `P-MIN-999` | Product P-MIN-999 |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9100` |

### Zyra V0 Top 10 (Multi-Model Scoring)
| Rank | Product ID | Title | Category | Retrieval | Person | Outfit | Occasion | Final Score |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| #1 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | `0.940` | `0.785` | `0.790` | `0.650` | `0.783` |
| #2 | `P-MIN-999` | Product P-MIN-999 |  | `0.910` | `0.767` | `0.790` | `0.650` | `0.771` |
| #3 | `P-API-DUAL` | Product P-API-DUAL |  | `0.915` | `0.737` | `0.790` | `0.650` | `0.761` |
| #4 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | `0.935` | `0.808` | `0.790` | `0.475` | `0.746` |
| #5 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | `0.945` | `0.787` | `0.790` | `0.475` | `0.741` |
| #6 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | `0.950` | `0.782` | `0.790` | `0.475` | `0.740` |
| #7 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | `0.925` | `0.781` | `0.790` | `0.475` | `0.735` |
| #8 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | `0.930` | `0.725` | `0.750` | `0.475` | `0.708` |
| #9 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | `0.920` | `0.709` | `0.750` | `0.475` | `0.701` |

**Promoted by Zyra:** `P-MIN-999` (#9 → #2), `P-API-DUAL` (#8 → #3)

**Demoted by Zyra:** `P-API-TRIPLE-01` (#2 → #5), `P-LUXZERA-HOODIE-001` (#1 → #6), `P-API-P6-FULL` (#5 → #8)

#### Human Verdict:
- [ ] Good
- [ ] Acceptable
- [ ] Poor

**Reason / Notes:**
> 

---

## Case: `EVAL-SPORT-01`
- **User:** `U-EVAL-ATHLETIC`
- **Occasion:** `sport`

### Baseline Top 10 (Raw Retrieval)
| Rank | Product ID | Title | Category | Color | Retrieval Score |
| :---: | :--- | :--- | :--- | :--- | :---: |
| #1 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9500` |
| #2 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Heather Grey', 'primaryColor': 'Heather Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9450` |
| #3 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | {'sources': ['visual'], 'confidence': 0.83, 'colorFamily': 'Black', 'primaryColor': 'Black', 'secondaryColors': [], 'hasVisualEvidence': True, 'hasAttributeEvidence': False} | `0.9400` |
| #4 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Charcoal Grey', 'primaryColor': 'Charcoal Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9350` |
| #5 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9300` |
| #6 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9250` |
| #7 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9200` |
| #8 | `P-API-DUAL` | Product P-API-DUAL |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9150` |
| #9 | `P-MIN-999` | Product P-MIN-999 |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9100` |

### Zyra V0 Top 10 (Multi-Model Scoring)
| Rank | Product ID | Title | Category | Retrieval | Person | Outfit | Occasion | Final Score |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| #1 | `P-MIN-999` | Product P-MIN-999 |  | `0.910` | `0.770` | `0.790` | `0.750` | `0.797` |
| #2 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | `0.940` | `0.748` | `0.790` | `0.750` | `0.795` |
| #3 | `P-API-DUAL` | Product P-API-DUAL |  | `0.915` | `0.746` | `0.790` | `0.750` | `0.790` |
| #4 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | `0.950` | `0.754` | `0.790` | `0.575` | `0.756` |
| #5 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | `0.945` | `0.750` | `0.790` | `0.575` | `0.753` |
| #6 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | `0.935` | `0.750` | `0.790` | `0.575` | `0.751` |
| #7 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | `0.925` | `0.748` | `0.790` | `0.575` | `0.749` |
| #8 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | `0.930` | `0.754` | `0.750` | `0.575` | `0.744` |
| #9 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | `0.920` | `0.738` | `0.750` | `0.575` | `0.736` |

**Promoted by Zyra:** `P-MIN-999` (#9 → #1), `P-API-DUAL` (#8 → #3)

**Demoted by Zyra:** `P-LUXZERA-HOODIE-001` (#1 → #4), `P-API-TRIPLE-01` (#2 → #5), `P-API-P6-FULL` (#5 → #8)

#### Human Verdict:
- [ ] Good
- [ ] Acceptable
- [ ] Poor

**Reason / Notes:**
> 

---

## Case: `EVAL-SPORT-02`
- **User:** `U-EVAL-STREETWEAR`
- **Occasion:** `sport`

### Baseline Top 10 (Raw Retrieval)
| Rank | Product ID | Title | Category | Color | Retrieval Score |
| :---: | :--- | :--- | :--- | :--- | :---: |
| #1 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9500` |
| #2 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Heather Grey', 'primaryColor': 'Heather Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9450` |
| #3 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | {'sources': ['visual'], 'confidence': 0.83, 'colorFamily': 'Black', 'primaryColor': 'Black', 'secondaryColors': [], 'hasVisualEvidence': True, 'hasAttributeEvidence': False} | `0.9400` |
| #4 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Charcoal Grey', 'primaryColor': 'Charcoal Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9350` |
| #5 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9300` |
| #6 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9250` |
| #7 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9200` |
| #8 | `P-API-DUAL` | Product P-API-DUAL |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9150` |
| #9 | `P-MIN-999` | Product P-MIN-999 |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9100` |

### Zyra V0 Top 10 (Multi-Model Scoring)
| Rank | Product ID | Title | Category | Retrieval | Person | Outfit | Occasion | Final Score |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| #1 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | `0.940` | `0.807` | `0.790` | `0.750` | `0.816` |
| #2 | `P-MIN-999` | Product P-MIN-999 |  | `0.910` | `0.767` | `0.790` | `0.750` | `0.796` |
| #3 | `P-API-DUAL` | Product P-API-DUAL |  | `0.915` | `0.745` | `0.790` | `0.750` | `0.789` |
| #4 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | `0.950` | `0.825` | `0.790` | `0.575` | `0.780` |
| #5 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | `0.935` | `0.812` | `0.790` | `0.575` | `0.773` |
| #6 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | `0.925` | `0.807` | `0.790` | `0.575` | `0.769` |
| #7 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | `0.945` | `0.716` | `0.790` | `0.575` | `0.742` |
| #8 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | `0.930` | `0.654` | `0.750` | `0.575` | `0.709` |
| #9 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | `0.920` | `0.649` | `0.750` | `0.575` | `0.705` |

**Promoted by Zyra:** `P-MIN-999` (#9 → #2), `P-API-DUAL` (#8 → #3)

**Demoted by Zyra:** `P-LUXZERA-HOODIE-001` (#1 → #4), `P-API-TRIPLE-01` (#2 → #7), `P-API-P6-FULL` (#5 → #8)

#### Human Verdict:
- [ ] Good
- [ ] Acceptable
- [ ] Poor

**Reason / Notes:**
> 

---

## Case: `EVAL-SPORT-03`
- **User:** `U-EVAL-CASUAL`
- **Occasion:** `sport`

### Baseline Top 10 (Raw Retrieval)
| Rank | Product ID | Title | Category | Color | Retrieval Score |
| :---: | :--- | :--- | :--- | :--- | :---: |
| #1 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9500` |
| #2 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Heather Grey', 'primaryColor': 'Heather Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9450` |
| #3 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | {'sources': ['visual'], 'confidence': 0.83, 'colorFamily': 'Black', 'primaryColor': 'Black', 'secondaryColors': [], 'hasVisualEvidence': True, 'hasAttributeEvidence': False} | `0.9400` |
| #4 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Charcoal Grey', 'primaryColor': 'Charcoal Grey', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9350` |
| #5 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9300` |
| #6 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Washed Black', 'primaryColor': 'Washed Black', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9250` |
| #7 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | {'sources': ['attribute'], 'confidence': 1.0, 'colorFamily': 'Camel', 'primaryColor': 'Camel', 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': True} | `0.9200` |
| #8 | `P-API-DUAL` | Product P-API-DUAL |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9150` |
| #9 | `P-MIN-999` | Product P-MIN-999 |  | {'sources': [], 'confidence': 0.0, 'colorFamily': None, 'primaryColor': None, 'secondaryColors': [], 'hasVisualEvidence': False, 'hasAttributeEvidence': False} | `0.9100` |

### Zyra V0 Top 10 (Multi-Model Scoring)
| Rank | Product ID | Title | Category | Retrieval | Person | Outfit | Occasion | Final Score |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| #1 | `P-API-VISUAL-01` | Product P-API-VISUAL-01 |  | `0.940` | `0.785` | `0.790` | `0.750` | `0.808` |
| #2 | `P-MIN-999` | Product P-MIN-999 |  | `0.910` | `0.767` | `0.790` | `0.750` | `0.796` |
| #3 | `P-API-DUAL` | Product P-API-DUAL |  | `0.915` | `0.737` | `0.790` | `0.750` | `0.786` |
| #4 | `P-API-P5-TEST` | Product P-API-P5-TEST |  | `0.935` | `0.808` | `0.790` | `0.575` | `0.771` |
| #5 | `P-API-TRIPLE-01` | Product P-API-TRIPLE-01 |  | `0.945` | `0.787` | `0.790` | `0.575` | `0.766` |
| #6 | `P-LUXZERA-HOODIE-001` | Product P-LUXZERA-HOODIE-001 |  | `0.950` | `0.782` | `0.790` | `0.575` | `0.765` |
| #7 | `P-98765-HOODIE` | Product P-98765-HOODIE |  | `0.925` | `0.781` | `0.790` | `0.575` | `0.760` |
| #8 | `P-API-P6-FULL` | Product P-API-P6-FULL |  | `0.930` | `0.725` | `0.750` | `0.575` | `0.733` |
| #9 | `P-API-P7-FULL` | Product P-API-P7-FULL |  | `0.920` | `0.709` | `0.750` | `0.575` | `0.726` |

**Promoted by Zyra:** `P-MIN-999` (#9 → #2), `P-API-DUAL` (#8 → #3)

**Demoted by Zyra:** `P-API-TRIPLE-01` (#2 → #5), `P-LUXZERA-HOODIE-001` (#1 → #6), `P-API-P6-FULL` (#5 → #8)

#### Human Verdict:
- [ ] Good
- [ ] Acceptable
- [ ] Poor

**Reason / Notes:**
> 

---

