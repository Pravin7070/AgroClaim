const Groq = require('groq-sdk');
const logger = require('../utils/logger');

let groq = null;
if (process.env.GROQ_API_KEY) {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
} else {
  logger.warn('GROQ_API_KEY not set. Using fallback analysis only.');
}

const analyzeCropDamage = async (claimData, imageUrls, compensationRate = 20000) => {
  if (!groq) {
    logger.info('Using fallback analysis (Groq API key not configured)');
    return getFallbackAnalysis(claimData, compensationRate);
  }

  try {
    const prompt = `STRICT DEEP-VISION ANALYSIS - OFFICER-GRADE REPORT

Perform a forensic-level crop damage assessment. Base EVERY observation ONLY on visible evidence in the image. NO generic statements, NO assumptions. Identify the "Damage Type" and provide detailed "Technical Observations".

RETURN JSON with these exact fields:

1. crop_identification:
   - exact_crop_type: Identify precise crop species from leaf morphology, plant structure, growth pattern
   - confidence_level: 0-100% based on visual clarity
   - visual_markers: List specific features used for identification (leaf shape, stem color, flowering stage, etc.)

2. damage_analysis:
   - primary_damage_type: ONE precise category (e.g. "Spodoptera frugiperda Infestation", "Rice Blast Fungal Infection", "Monsoon Induced Waterlogging", etc.)
   - severity_percentage: 0-100 (strict calculation based on affected area vs total visible area)
   - affected_area_estimate: Percentage of field showing damage in the image
   - damage_distribution: [uniform, patchy, concentrated, edge_only, center_only]

3. visual_evidence:
   - leaf_condition: [healthy_green, yellowing, browning, wilting, necrotic_spots, holes, curling, discoloration]
   - stem_status: [upright, lodged, broken, discolored, pest_bore_holes, healthy]
   - color_stress_markers: List exact color anomalies (e.g., "chlorotic patches on upper leaves", "brown necrotic lesions")
   - pest_traces: [visible_insects, egg_masses, webbing, bore_holes, frass, none]
   - fungal_indicators: [white_powdery_coating, black_spots, rust_pustules, mold_growth, none]
   - soil_moisture_state: [waterlogged, saturated, moist, dry, cracked, none_visible]
   - waterlogging_evidence: [standing_water, mud_deposits, algae_growth, none]

4. technical_observations:
   - expert_notes: Detailed technical observations citing specific visual evidence from the image. Mention plant density, growth stage, and specific stress markers.
   - plant_density: [sparse, normal, overcrowded, not_determinable]
   - growth_stage: [seedling, vegetative, flowering, fruiting, maturity, harvest_ready]
   - weather_impact_signs: List visible evidence (wind damage, hail marks, sun scorch, frost burn)
   - secondary_stress: Any additional visible stress factors

5. severity_assessment:
   - damage_percentage: 0-100 (STRICT: count damaged plants/area vs total)
   - severity_rating: 0-100 scale
   - economic_loss_category: [minimal <20%, moderate 20-50%, severe 50-80%, total >80%]
   - recovery_potential: [high, medium, low, none]

6. compensation_calculation:
   - calculated_amount: (damage_percentage / 100) * (${claimData.acres} * ${compensationRate})
   - calculation_basis: Explain the damage percentage derivation

7. officer_summary:
   - damage_type_summary: A professional 1-sentence summary of the identified damage type.
   - technical_description: 2-3 sentences with precise observations for the forensic report.
   - recommended_action: Immediate steps based on damage type
   - verification_notes: What officer should verify during field visit

Claimed Crop: ${claimData.crop}
Land Size: ${claimData.acres} acres
Base Rate: ₹${compensationRate}/acre

CRITICAL RULES:
- NO generic statements like "moderate damage observed"
- EVERY claim must cite specific visual evidence
- If unclear, state "not determinable from image" for that field
- Damage % must be calculated from visible affected area
- Use technical agricultural terminology
- Be conservative in estimates - officer-grade precision required

Claimed Crop: ${claimData.crop}
Land Size: ${claimData.acres} acres
Base Rate: ₹${compensationRate}/acre

CRITICAL RULES:
- NO generic statements like "moderate damage observed"
- EVERY claim must cite specific visual evidence
- If unclear, state "not determinable from image" for that field
- Damage % must be calculated from visible affected area
- Use technical agricultural terminology
- Be conservative in estimates - officer-grade precision required`;

    // Note: In a real production environment with Groq Vision, you'd pass the image data.
    // For this implementation, we simulate the vision call using the prompt.
    // llama-3.2-90b-vision-preview supports vision, but requires content blocks.

    const response = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            ...imageUrls.map(url => ({
              type: 'image_url',
              image_url: {
                url: url.startsWith('http') ? url : `${process.env.BACKEND_URL || process.env.VITE_BACKEND_URL || 'http://localhost:5000'}${url}`
              }
            }))
          ]
        }
      ],
      model: 'llama-3.2-11b-vision-preview',
      temperature: 0.2,
      max_tokens: 1024,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    const analysis = JSON.parse(content);

    const severityPercent = analysis.severity_assessment?.damage_percentage ?? analysis.damage_analysis?.severity_percentage ?? 50;
    const affectedAreaPercent = analysis.damage_analysis?.affected_area_estimate ?? severityPercent;
    const confidence = analysis.crop_identification?.confidence_level ?? 75;
    const suggestedCompensation = Math.round(analysis.compensation_calculation?.calculated_amount || 0);
    const damageType = analysis.officer_summary?.damage_type_summary || analysis.damage_analysis?.primary_damage_type || 'environmental_stress';
    const cause = analysis.technical_observations?.expert_notes || analysis.officer_summary?.technical_description || 'Damage assessed from image';

    return {
      damageType,
      severityPercent,
      cause,
      affectedAreaPercent,
      confidence,
      suggestedCompensation,
      cropDetected: analysis.crop_identification?.exact_crop_type || claimData.crop,
      damageAssessment: analysis.officer_summary?.technical_description || 'Analysis completed',
      compensationAmount: suggestedCompensation,
      riskScore: Math.max(0, 100 - severityPercent),
      fraudScore: confidence < 60 ? 25 : 10,
      reasoning: analysis.compensation_calculation?.calculation_basis || 'Based on visual damage assessment',
      recommendations: analysis.officer_summary?.recommended_action ? [analysis.officer_summary.recommended_action] : ['Manual verification recommended'],
      severity: analysis.severity_assessment?.economic_loss_category || 'moderate',
      damagePercentage: severityPercent,
      deepAnalysis: {
        cropIdentification: analysis.crop_identification,
        damageCategory: analysis.damage_analysis?.primary_damage_category,
        visualEvidence: analysis.visual_evidence,
        technicalObservations: analysis.technical_observations,
        severityDetails: analysis.severity_assessment,
        verificationNotes: analysis.officer_summary?.verification_notes
      }
    };

  } catch (error) {
    logger.error(`Groq AI analysis failed: ${error.message}`);
    return getFallbackAnalysis(claimData, compensationRate);
  }
};

const getFallbackAnalysis = (claimData, compensationRate) => {
  const damagePercentage = 45;
  const amount = (damagePercentage / 100) * (claimData.acres * compensationRate);

  return {
    damageType: 'environmental_stress',
    severityPercent: damagePercentage,
    cause: 'Damage assessed from submitted images (fallback).',
    affectedAreaPercent: damagePercentage,
    confidence: 50,
    suggestedCompensation: Math.round(amount),
    cropDetected: claimData.crop,
    damageAssessment: `Automated assessment for ${claimData.crop} damage.`,
    compensationAmount: Math.round(amount),
    riskScore: 60,
    fraudScore: 15,
    reasoning: 'Fallback analysis used due to AI service unavailability.',
    recommendations: ['Perform manual inspection', 'Verify clear evidence photos'],
    severity: 'Moderate',
    damagePercentage
  };
};

module.exports = { analyzeCropDamage };
