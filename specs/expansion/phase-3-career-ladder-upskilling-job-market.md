# Phase 3 Technical Specification: Career Ladder, Upskilling, Dynamic Job Market & Variable Appraisals

## 1. Overview & Objective
Phase 3 converts the static career profile into an active career strategy progression system:
1. **Upskilling Courses**: Boost skill level (1.0 to 5.0) to qualify for higher-tier positions.
2. **Dynamic Job Market**: 4 tiers of job openings across Science, Commerce, and Arts with interview probabilities.
3. **Variable Annual Appraisals**: Realistic raises varying between 0% (salary freeze) to 16% (boom/promotion), influenced by company cycles and character skill.
4. **Tenure Stagnation Push**: Stagnating at the same firm for >3 years reduces raises to 0–2%, creating strong incentives to switch jobs.

---

## 2. Variable Annual Appraisal Engine

At Month 12 of every simulation year (unless unemployed), the character undergoes their annual performance appraisal.

### A. Appraisal Outcome Distribution

```typescript
export interface AppraisalResult {
  hikeRate: number; // e.g. 0.05 for 5%
  category: 'freeze' | 'normal' | 'boom';
  headline: string;
  reason: string;
  isStagnated: boolean;
}

export function calculateAnnualAppraisal(character, monthIndex, seed): AppraisalResult {
  const tenureAtCurrentCompany = character.tenureYearsAtCurrentCompany || 0;
  const isStagnated = tenureAtCurrentCompany >= 3;
  const hasUpskilledRecently = character.monthsSinceLastCourseCompletion <= 24;

  const rng = createPRNG(`${seed}_appraisal_m${monthIndex}`);
  const roll = rng();

  // If stagnated at same employer for 3+ years: 70% chance of freeze/low raise (0-2%)
  if (isStagnated) {
    if (roll < 0.70) {
      const hikeRate = Number((0.005 + rng() * 0.015).toFixed(3)); // 0.5% to 2.0%
      return {
        hikeRate,
        category: 'freeze',
        headline: 'Company Salary Freeze / Minimal Raise',
        reason: 'Tenure Stagnation: Staying at the same company without switching has plateaued your pay.',
        isStagnated: true,
      };
    }
  }

  // Upskilling boost: increases probability of high appraisal
  const boomThreshold = hasUpskilledRecently ? 0.35 : 0.20;
  const freezeThreshold = isStagnated ? 0.35 : 0.15;

  if (roll < freezeThreshold) {
    // 0% to 2% (Freeze)
    const hikeRate = Number((0.00 + rng() * 0.02).toFixed(3));
    return {
      hikeRate,
      category: 'freeze',
      headline: 'Modest Raise / Cost-of-Living Adjustment',
      reason: 'Company-wide budget tightening. Market rates are significantly higher on the Job Market!',
      isStagnated,
    };
  } else if (roll < freezeThreshold + (1.0 - freezeThreshold - boomThreshold)) {
    // 4% to 7% (Normal)
    const hikeRate = Number((0.04 + rng() * 0.03).toFixed(3));
    return {
      hikeRate,
      category: 'normal',
      headline: 'Standard Performance Appraisal',
      reason: 'Solid corporate contribution meeting standard expectations.',
      isStagnated,
    };
  } else {
    // 10% to 16% (High / Boom)
    const hikeRate = Number((0.10 + rng() * 0.06).toFixed(3));
    return {
      hikeRate,
      category: 'boom',
      headline: 'Top-Tier Performance Hike & Bonus',
      reason: 'Outstanding contribution and high skill execution rewarded with top-bracket appraisal!',
      isStagnated: false,
    };
  }
}
```

### B. Raise Modal UI
- Renders the appraisal rate and headline.
- If raise is $\le 2\%$, shows an active callout button: `[ 💼 Explore Job Market (+30% Target) ]`.

---

## 3. Professional Upskilling System

Players can access the **Upskilling Hub** from the Career Tab:

| Course ID | Level | Cost | Duration | Skill Boost | Monthly Outflow During Course |
|---|---|---|---|---|---|
| `course_bootcamp` | Professional Specialization | ₹30,000 | 3 Months | +0.4 | ₹10,000/month |
| `course_cert` | Advanced Industry Certification | ₹75,000 | 6 Months | +0.8 | ₹12,500/month |
| `course_exec` | Executive Leadership Masterclass | ₹1,80,000 | 12 Months | +1.5 | ₹15,000/month |

---

## 4. Dynamic Job Board & Career Tiers

```
[ Tier 1: Junior Specialist ] ──► [ Tier 2: Senior Specialist ] ──► [ Tier 3: Lead / Manager ] ──► [ Tier 4: Principal / Director ]
  Req: 0+ yrs, Skill 1.0+          Req: 3+ yrs, Skill 2.0+           Req: 6+ yrs, Skill 3.2+         Req: 10+ yrs, Skill 4.2+
  Salary: ₹40k - ₹65k/mo           Salary: ₹75k - ₹1.2L/mo           Salary: ₹1.4L - ₹2.2L/mo        Salary: ₹2.5L - ₹4.0L/mo
```

### Application Acceptance Probability:
$$P_{\text{offer}} = \text{clamp}\left(0.30 + 0.20 \times (\text{exp} - \text{exp}_{\text{req}}) + 0.25 \times (\text{skill} - \text{skill}_{\text{req}}), 0.10, 0.95\right)$$

- **Accepting an Offer**:
  - Updates title, employer company, gross salary, and take-home.
  - Resets `tenureYearsAtCurrentCompany = 0` (clearing stagnation).
  - Prompts surplus reallocation with new take-home delta.
