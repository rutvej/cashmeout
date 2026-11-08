# Phase 3 Technical Specification: Career Ladder, Upskilling & Job Market

## 1. Overview & Objective
Phase 3 converts the static career profile into an active career strategy progression system. Characters can enroll in courses to increase their skill level, build years of experience, and apply for higher-paying positions on a dynamic Job Board. It also directly integrates with the layoff/unemployment shock introduced in Phase 1.

---

## 2. Core Mechanics & Mathematical Formulations

### A. Career Attributes & Experience
Each character tracks two core professional metrics:
1. `yearsOfExperience`:
   - Increments deterministically by $+1$ year every 12 simulation months.
2. `skillLevel`:
   - Decimal rating ranging from $1.0$ (Junior/Entry) to $5.0$ (Executive/Distinguished).
   - Base starting level depends on character's initial job tier ($1.0$ to $2.0$).
   - Can be increased by completing **Upskilling Courses**.

### B. Professional Upskilling System
Players can access the **Upskilling Hub** from the Career Tab and enroll in courses:

| Course ID | Level | Cost | Duration | Skill Boost | Monthly Outflow During Course |
|---|---|---|---|---|---|
| `course_bootcamp` | Professional Specialization | ₹30,000 | 3 Months | +0.4 | ₹10,000/month |
| `course_cert` | Advanced Industry Certification | ₹75,000 | 6 Months | +0.8 | ₹12,500/month |
| `course_exec` | Executive Leadership / Masterclass | ₹1,80,000 | 12 Months | +1.5 | ₹15,000/month |

#### Course Rules:
- Only **one course** can be active at a time.
- The player pays via a monthly deduction from their surplus/cash across the course duration.
- If liquid cash falls to ₹0 and surplus is negative, the course can be paused or dropped (forfeiting partial progress).
- On completion: A celebration modal awards the skill increase, and new job openings unlock immediately.

---

### C. Dynamic Job Board & Market Offers
The Job Board generates opportunities across four tiers based on the player's career field:

```
[ Tier 1: Junior Specialist ] ──► [ Tier 2: Senior Specialist ] ──► [ Tier 3: Lead / Manager ] ──► [ Tier 4: Principal / Director ]
  Req: 0+ yrs, Skill 1.0+          Req: 3+ yrs, Skill 2.0+           Req: 6+ yrs, Skill 3.2+         Req: 10+ yrs, Skill 4.2+
  Salary: ₹40k - ₹65k/mo           Salary: ₹75k - ₹1.2L/mo           Salary: ₹1.4L - ₹2.2L/mo        Salary: ₹2.5L - ₹4.0L/mo
```

#### Application & Interview Probability
When a player applies for a job, acceptance probability $P_{\text{offer}}$ is determined by:

$$P_{\text{offer}} = \text{clamp}\left(0.30 + 0.20 \times (\text{exp} - \text{exp}_{\text{req}}) + 0.25 \times (\text{skill} - \text{skill}_{\text{req}}), 0.10, 0.95\right)$$

- **Offer Accepted:** Player receives a formal offer letter modal detailing the new CTC, new Monthly Take-Home, and city (with optional relocation bonus or tier change). Player can accept or stay at their current firm.
- **Offer Rejected:** 3-month cooldown before re-applying to that specific company.

---

### D. Layoff & Unemployment Integration
When a `shock_job_loss` event strikes:
- The character's employment status transitions to `unemployed`.
- Rather than waiting passively, the player can open the Job Board and actively apply for roles matching their qualification.
- If skill level and experience are high, the player can secure a new job within 1 month, drastically mitigating emergency fund burn!

---

## 3. Data Schema Extensions

```typescript
export interface CareerJobOffer {
  id: string;
  companyName: string;
  title: string;
  tier: 1 | 2 | 3 | 4;
  field: string;
  requiredExperienceYears: number;
  requiredSkillLevel: number;
  grossMonthlySalary: number;
  monthlyTakeHome: number;
  cityTier: 'tier1' | 'tier2' | 'tier3';
}

export interface ActiveCourseProgress {
  courseId: string;
  courseName: string;
  totalDurationMonths: number;
  monthsCompleted: number;
  monthlyFee: number;
  skillBoostReward: number;
}
```

---

## 4. UI & Interaction Design

### A. Career Tab Redesign (`MainGameScreen.jsx`)
- Displays current **Title, Experience Meter, and Skill Gauge (1.0 to 5.0)** with star badges.
- **Active Course Banner:** Displays course progress bar (e.g. *"Month 2 of 6: Advanced Cloud Architecture"*).
- **Two Primary Action Buttons:**
  - `🎓 Upskill (Browse Courses)`
  - `💼 Open Job Market (View 4 Openings)`

### B. Job Market Sheet (`JobMarketModal.jsx`)
- Cred NeoPOP list of open listings with clear requirement badges (🟢 Qualified / 🔴 Requires Skill 3.2+).
- Application action displays estimated acceptance odds.
